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

