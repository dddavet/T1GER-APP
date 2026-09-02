import { db } from "../firebase";
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { getAi } from "./gemini";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, auth } from '../firebase';

const PROFESOR_SYSTEM_PROMPT = `
Eres el "Mentor T1GER", un estratega de negocios, finanzas e inteligencia artificial de clase mundial.
No eres un profesor académico aburrido. Eres un socio táctico de alto rendimiento, directo, energizante, con mentalidad de fundador y criterio implacable.

PRINCIPIOS DE COMUNICACIÓN:
1. Respuestas de alto impacto: Ve directo al grano con mentalidad de primeros principios y pasos prácticos. Cero relleno académico.
2. Formato limpio y escaneable: Usa párrafos cortos y contundentes, puntos clave accionables y números concretos.
3. Si el usuario envía una búsqueda, modo de razonamiento o captura, analiza los datos reales y da el veredicto estratégico.
4. Idioma: 100% en el idioma del usuario (Español o Inglés).
5. Mantén la respuesta por debajo de 180 palabras. Prioriza una recomendación y un máximo de 3 acciones.
6. No repitas en una lista lo que ya explicaste en el cuerpo de la respuesta.
7. Concluye SIEMPRE con 2 a 3 sugerencias tácticas inmediatas para ejecutar en el formato:
"💡 Siguiente paso táctico:
1. [Acción inmediata 1]
2. [Acción inmediata 2]
3. [Profundizar concepto 3]"
`;

const FREE_MODELS_CHAIN = [
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'nvidia/llama-3.1-nemotron-70b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'deepseek/deepseek-chat',
];

const getLocalCoachResponse = (message: string, language: string) => {
  const normalized = message.toLowerCase();
  const isEn = language === 'en';
  if (normalized.includes('compound') || normalized.includes('interés compuesto')) {
    return isEn
      ? 'Compound growth needs three inputs: time, recurring contributions, and a reasonable return assumption. Use a conservative rate, then compare what changes when you start five years earlier.\n\n💡 What would you like to explore next?\n1. Calculate a 10-year simulation\n2. Real vs nominal returns\n3. Start my daily practice'
      : 'El interés compuesto funciona multiplicando tres variables: tiempo, aportes periódicos y tasa neta de retorno. La clave no es la euforia de corto plazo, sino la consistencia ininterrumpida.\n\n💡 ¿Qué prefieres explorar ahora?\n1. Simular un plan a 10 años\n2. Inflación vs retorno real\n3. Abrir la lección de hoy';
  }
  if (normalized.includes('risk') || normalized.includes('riesgo') || normalized.includes('perder')) {
    return isEn
      ? 'Risk in investing is not just day-to-day volatility; it is the probability of permanent capital loss or failing to meet your financial objective. Always determine your liquidity buffer before increasing risk exposure.\n\n💡 What would you like to explore next?\n1. Define emergency fund sizing\n2. Asset allocation by horizon\n3. Stress testing a portfolio'
      : 'El riesgo real en inversiones no es solo ver fluctuar los precios en pantalla; es el peligro de pérdida permanente o de tener que vender en el peor momento por falta de liquidez. Primero asegura tu fondo de reserva.\n\n💡 ¿Qué prefieres explorar ahora?\n1. Calcular mi fondo de emergencia\n2. Distribución según horizonte de tiempo\n3. Evaluar mi tolerancia al riesgo';
  }
  if (normalized.includes('portfolio') || normalized.includes('portafolio') || normalized.includes('cartera') || normalized.includes('etf') || normalized.includes('divers')) {
    return isEn
      ? 'A robust portfolio starts with asset allocation: index funds for low-cost broad market exposure, bonds or cash for stability, and strict rebalancing rules.\n\n💡 What would you like to explore next?\n1. The Boglehead 3-fund model\n2. Rebalancing strategies\n3. Record a paper trade in T1GER'
      : 'Un portafolio profesional se basa en distribución de activos: fondos indexados (ETFs) de bajo costo para capturar el mercado global, y activos defensivos según tu plazo. La diversificación es tu único almuerzo gratis.\n\n💡 ¿Qué prefieres explorar ahora?\n1. Portafolio clásico de 3 fondos\n2. Cómo rebalancear cada año\n3. Registrar mi primera operación simulada';
  }
  return isEn
    ? 'I am here to guide your financial and investing decisions with first-principles reasoning. Tell me what decision, company, or concept you want to master.\n\n💡 What would you like to explore next?\n1. Evaluate a business model\n2. Understand valuation basics\n3. Review my learning path'
    : 'Estoy aquí para orientarte con pensamiento crítico y fundamentos sólidos de inversión. Cuéntame qué decisión, concepto o instrumento financiero quieres analizar hoy.\n\n💡 ¿Qué prefieres explorar ahora?\n1. Analizar el modelo de una empresa\n2. Fundamentos de valoración\n3. Revisar mi ruta de aprendizaje';
};

const callOpenRouterWithFallback = async (
  systemPrompt: string,
  userMessage: string,
  history: any[],
  apiKey: string
): Promise<string> => {
  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map(m => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
      content: m.text || m.content || ''
    })),
    { role: 'user', content: userMessage }
  ];

  for (const modelName of FREE_MODELS_CHAIN) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://t1ger.app',
          'X-Title': 'T1GER Profesor AI',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          messages: formattedMessages,
          temperature: 0.65,
          max_tokens: 350
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && content.trim().length > 0) {
          return content.trim();
        }
      } else {
        const errorText = await response.text();
        console.warn(`OpenRouter model ${modelName} returned status ${response.status}:`, errorText);
      }
    } catch (err) {
      console.warn(`Failed to call OpenRouter model ${modelName}:`, err);
    }
  }

  throw new Error('All OpenRouter models in chain exhausted');
};

const cleanMarkdownArtifacts = (raw: string): string => {
  if (!raw) return '';
  return raw
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold asterisks
    .replace(/\*(.*?)\*/g, '$1')     // Remove markdown italic asterisks
    .replace(/^[\*\-]\s+/gm, '• ')   // Clean bullet points
    .replace(/#{1,6}\s+/g, '')       // Remove raw heading hashes
    .trim();
};

export const getCoachResponse = async (
  userId: string,
  userMessage: string,
  history: any[],
  _coachId = 't1ger',
  language: string = 'es'
): Promise<string> => {
  if (!import.meta.env.DEV) {
    if (!auth.currentUser) return language === 'en'
      ? 'Sign in to talk with your AI mentor. Your learning path remains available offline.'
      : 'Inicia sesión para hablar con tu mentor de IA. Tu ruta de aprendizaje sigue disponible sin conexión.';
    const response = await httpsCallable<Record<string, unknown>, { text: string }>(getFunctions(app), 'askT1gerMentor')({
      message: userMessage, history: history.slice(-8), language,
    });
    return response.data.text;
  }
  // 1. Fetch user context & recent history if available
  let userData = {};
  if (userId && userId !== 'anonymous') {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      userData = userDoc.data() || {};
    } catch {
      // fallback
    }
  }

  let sessionHistory: any[] = [];
  if (userId && userId !== 'anonymous') {
    try {
      const sessionsQ = query(collection(db, "users", userId, "coachingSessions"), orderBy("timestamp", "desc"), limit(4));
      const sessionsSnapshot = await getDocs(sessionsQ);
      sessionHistory = sessionsSnapshot.docs.map(d => d.data());
    } catch {
      // fallback
    }
  }

  const context = `Contexto del estudiante: ${JSON.stringify(userData)}. Historial previo: ${JSON.stringify(sessionHistory)}`;
  const languageInstruction = `IDIOMA OBLIGATORIO: DEBES RESPONDER 100% EN ${language === 'en' ? 'INGLÉS (ENGLISH)' : 'ESPAÑOL'}.`;
  const fullSystemPrompt = `${PROFESOR_SYSTEM_PROMPT}\n\n${languageInstruction}\n\n${context}`;

  // Priority 1: Google Gemini Flash (Instant, sub-second responses)
  const clientAiEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_CLIENT_AI === 'true';
  const geminiKey = clientAiEnabled ? import.meta.env.VITE_GEMINI_API_KEY : '';
  if (geminiKey && geminiKey.trim() !== '') {
    try {
      const model = getAi().getGenerativeModel({
        model: "gemini-1.5-flash-latest",
        systemInstruction: fullSystemPrompt
      });

      const chat = model.startChat({
        history: history.slice(-8).map(m => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.text }]
        }))
      });

      const result = await chat.sendMessage(userMessage);
      const text = result.response.text();
      if (text && text.trim().length > 0) {
        return cleanMarkdownArtifacts(text);
      }
    } catch (geminiErr) {
      console.warn("Gemini Flash SDK error in coachService:", geminiErr);
    }
  }

  // Priority 2: OpenRouter Fallback
  const openRouterKey = clientAiEnabled ? import.meta.env.VITE_OPENROUTER_API_KEY : '';
  if (openRouterKey && openRouterKey.trim() !== '') {
    try {
      const res = await callOpenRouterWithFallback(fullSystemPrompt, userMessage, history, openRouterKey.trim());
      return cleanMarkdownArtifacts(res);
    } catch (openRouterErr) {
      console.warn("OpenRouter fallback failed:", openRouterErr);
    }
  }

  // Priority 3: Built-in local offline engine
  return cleanMarkdownArtifacts(getLocalCoachResponse(userMessage, language));
};
