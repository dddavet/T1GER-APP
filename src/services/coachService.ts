import { db } from "../firebase";
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { getAi } from "./gemini";

const COACH_SYSTEM_PROMPT = `
You are T1GER, a world-class mentor and professor inside a Duolingo-style learning app.
Your PRIMARY goal is to answer the user's questions clearly, warmly, and concisively.

CRITICAL RESPONSE RULES:
1. Keep responses EXTREMELY CONCISE: Maximum 2 to 3 short, punchy sentences. Never write long essays or bulleted lists.
2. Speak warmly and encouragingly, like an expert professor who respects the student's time.
3. NEVER use raw Markdown asterisks like **bold** or *italic* in your text.
4. Provide a 1-sentence actionable tip or direct answer immediately.
5. ALWAYS END your response with EXACTLY 3 short, highly relevant follow-up questions for the user to pick from. Format them sequentially, e.g., "1. [Question] 2. [Question] 3. [Question]".
`;

const COACH_PERSONALITIES: Record<string, string> = {
  t1ger: `
You are T1GER, the lead Master Professor.
You give clear, direct answers in 2-3 sentences max.
`
};

const getLocalCoachResponse = (message: string, language: string) => {
  const normalized = message.toLowerCase();
  const isEn = language === 'en';
  if (normalized.includes('compound') || normalized.includes('interés compuesto')) {
    return isEn
      ? 'Compound growth needs three inputs: time, recurring contributions, and a reasonable return assumption. Use a conservative rate, then compare what changes when you start five years later. 1. Run an example 2. Review assumptions 3. Open today’s lesson'
      : 'El crecimiento compuesto necesita tiempo, aportes periódicos y una tasa razonable. Usa una tasa conservadora y compara qué cambia si empiezas cinco años después. 1. Ver un ejemplo 2. Revisar supuestos 3. Abrir la lección de hoy';
  }
  if (normalized.includes('risk') || normalized.includes('riesgo')) {
    return isEn
      ? 'Risk is the chance that an outcome prevents you from reaching your goal, not just price movement. Set the time horizon and maximum acceptable loss before choosing an asset. 1. Define my horizon 2. Size a position 3. Compare asset classes'
      : 'El riesgo es la posibilidad de que un resultado te impida cumplir tu objetivo, no solo la volatilidad. Define horizonte y pérdida tolerable antes de elegir un activo. 1. Definir horizonte 2. Calcular posición 3. Comparar activos';
  }
  if (normalized.includes('portfolio') || normalized.includes('portafolio') || normalized.includes('cartera') || normalized.includes('divers')) {
    return isEn
      ? 'A simple portfolio starts with roles: growth, diversification, and stability. Pick weights you can hold through a downturn before choosing specific funds. 1. Build three funds 2. Check concentration 3. Plan rebalancing'
      : 'Un portafolio simple empieza por funciones: crecimiento, diversificación y estabilidad. Elige pesos que puedas mantener durante una caída antes de escoger fondos. 1. Crear tres fondos 2. Revisar concentración 3. Planear rebalanceo';
  }
  return isEn
    ? 'Start with the decision you need to make, then name the evidence you have and what is still uncertain. I can help you turn that into a small, testable investing action. 1. Review a company 2. Build a paper trade 3. Explain a concept'
    : 'Empieza por la decisión que necesitas tomar, luego separa la evidencia de lo que aún es incierto. Puedo convertirlo en una acción de inversión pequeña y comprobable. 1. Analizar una empresa 2. Crear una operación simulada 3. Explicar un concepto';
};

const callOpenRouterAPI = async (
  systemPrompt: string,
  userMessage: string,
  history: any[],
  apiKey: string
): Promise<string> => {
  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
      content: m.text || m.content || ''
    })),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://t1ger.app',
      'X-Title': 'T1GER APP',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: formattedMessages,
      temperature: 0.6,
      max_tokens: 300
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Sin respuesta de DeepSeek';
};

export const getCoachResponse = async (userId: string, userMessage: string, history: any[], coachId = 't1ger', language: string = 'es') => {
  // Billable provider keys must not ship in the browser by default. The local
  // mentor keeps the preview useful; production AI should be proxied by a
  // server endpoint with authentication, quotas, and redaction.
  if (import.meta.env.VITE_ENABLE_CLIENT_AI !== 'true') {
    return getLocalCoachResponse(userMessage, language);
  }
  // 1. Fetch user context
  let userData = {};
  if (userId && userId !== 'anonymous') {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      userData = userDoc.data() || {};
    } catch (e) {
      // ignore fallback
    }
  }

  // 2. Fetch past sessions
  let sessionHistory: any[] = [];
  if (userId && userId !== 'anonymous') {
    try {
      const sessionsQ = query(collection(db, "users", userId, "coachingSessions"), orderBy("timestamp", "desc"), limit(5));
      const sessionsSnapshot = await getDocs(sessionsQ);
      sessionHistory = sessionsSnapshot.docs.map(doc => doc.data());
    } catch (e) {
      // ignore fallback
    }
  }

  // 3. Construct prompt
  const context = `
  User Context: ${JSON.stringify(userData)}
  Session History: ${JSON.stringify(sessionHistory)}
  `;

  const personalityPrompt = COACH_PERSONALITIES[coachId] || COACH_PERSONALITIES.t1ger;
  const languageInstruction = `CRITICAL RULE: YOU MUST RESPOND 100% IN ${language === 'en' ? 'ENGLISH' : 'SPANISH'}. NEVER USE OTHER LANGUAGES.`;
  const fullSystemPrompt = COACH_SYSTEM_PROMPT + "\n\n" + languageInstruction + "\n\n" + personalityPrompt + "\n\n" + context;

  // Priority 1: OpenRouter DeepSeek V4 / Flash API Key
  const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (openRouterKey && openRouterKey.trim() !== '') {
    try {
      return await callOpenRouterAPI(fullSystemPrompt, userMessage, history, openRouterKey.trim());
    } catch (openRouterErr) {
      console.warn("OpenRouter DeepSeek failed, falling back to Gemini:", openRouterErr);
    }
  }

  // Priority 2: Google Gemini API Key
  try {
    const model = getAi().getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: fullSystemPrompt
    });

    const chat = model.startChat({
      history: history.map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }))
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (error: any) {
    console.warn("Gemini API call error in coachService:", error);
    if (language === 'en') {
      return "Hello! I am ready to help. Please check your connection or configure your OpenRouter / Gemini API Key.";
    }
    return "¡Hola! Estoy listo para guiarte. Revisa tu conexión o tu API Key para continuar conversando.";
  }
};
