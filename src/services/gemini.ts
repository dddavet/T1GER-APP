import { GoogleGenerativeAI } from '@google/generative-ai';

let aiInstance: GoogleGenerativeAI | null = null;

export const getAi = () => {
  if (!aiInstance) {
    const clientAiEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_CLIENT_AI === 'true';
    const apiKey = clientAiEnabled ? import.meta.env.VITE_GEMINI_API_KEY : '';
    if (!apiKey) {
      throw new Error('CLIENT_AI_DISABLED');
    }
    aiInstance = new GoogleGenerativeAI(apiKey);
  }
  return aiInstance;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if ((error.status === 429 || error.code === 429) && retries > 0) {
      console.warn(`Rate limited. Retrying in ${delayMs}ms...`);
      await delay(delayMs);
      return withRetry(fn, retries - 1, delayMs * 2);
    }
    throw error;
  }
};

const extractBase64Data = (base64Image: string, mimeType: string) => {
  let finalMimeType = mimeType;
  let finalBase64 = base64Image;
  if (base64Image.startsWith('data:')) {
    const match = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      finalMimeType = match[1];
      finalBase64 = match[2];
    }
  }
  return { finalBase64, finalMimeType };
};

// HELPER TO GET MODEL WITH STABLE API VERSION AND LATEST IDENTIFIERS
const getModel = (modelName: string, systemInstruction?: string) => {
  let modelId = modelName;
  if (modelName === 'gemini-1.5-flash-latest') modelId = 'gemini-1.5-flash';
  if (modelName === 'gemini-1.5-pro-latest') modelId = 'gemini-1.5-pro';
  
  return getAi().getGenerativeModel({ 
    model: modelId,
    ...(systemInstruction ? { systemInstruction } : {})
  });
};

export const generateDailyLesson = async (niche: string, level: number) => {
  const model = getModel('gemini-1.5-flash');
  const prompt = `You are a world-class coach for a ${niche}. The user is currently level ${level}. 
  Provide a bite-sized, highly actionable daily lesson (like a Duolingo lesson but for personal growth/business).
  Include a real-world, recent example or news item to illustrate the point.
  It should be engaging, punchy, and take 1 minute to read.
  
  Return the response in this JSON format:
  {
    "title": "...",
    "content": "...",
    "actionItem": "..."
  }`;

  const result = await withRetry(() => model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  }));
  const text = result.response.text();
  return JSON.parse(text.trim());
};

export const generateLearningPath = async (userProfile: any) => {
  const model = getModel('gemini-1.5-flash');
  const prompt = `You are a world-class AI mentor. Generate a highly personalized Curriculum Track (Topic Tree) for a user with the following profile:
  ${JSON.stringify(userProfile)}
  
  The curriculum should consist of 3 "Levels" (e.g. Beginner, Intermediate, Advanced).
  Each Level should have 3 "Days" (Topics).
  Each Day should have 2 specific "Mission Ids" (just generate short string identifiers like 'topic-1-a').
  
  Return ONLY a strict JSON object matching this structure:
  {
    "trackId": "personalized_path",
    "name": "Custom Path",
    "description": "...",
    "levels": [
      {
        "levelId": "l1",
        "name": "Level 1: Foundation",
        "days": [
          {
            "dayId": "l1_d1",
            "name": "Day 1: Intro",
            "missionIds": ["l1_d1_m1", "l1_d1_m2"]
          }
        ]
      }
    ]
  }`;

  const result = await withRetry(() => model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  }));
  const text = result.response.text();
  return JSON.parse(text.trim());
};


export const generateMissionType = async (keyword: string) => {
  const model = getModel('gemini-1.5-flash');
  const prompt = `Generate a new mission type based on the keyword/goal: "${keyword}".
  Provide a name, a short description, and a suggested icon URL (e.g., a Lucide icon name or a placeholder image URL).
  
  Return the response as a JSON object: { "name": "...", "description": "...", "iconUrl": "..." }`;

  const result = await withRetry(() => model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  }));
  const text = result.response.text();
  return JSON.parse(text.trim());
};

export const generateMissions = async (niche: string, level: number, missionTypes: any[], difficulties: ('Easy' | 'Medium' | 'Hard')[]) => {
  const model = getModel('gemini-1.5-flash');
  const typesPrompt = missionTypes.map(t => `${t.name}: ${t.description}`).join('\n');
  const prompt = `Generate 3 daily missions for a user whose focus is ${niche} and is level ${level}.
  Allowed difficulty levels: ${difficulties.join(', ')}.
  Use the following mission types as a guide:
  ${typesPrompt}
  Make them actionable and verifiable with a photo.
  Adjust XP reward based on difficulty: Easy (50-100), Medium (150-250), Hard (300-500).
  
  Return the response as a JSON array of objects with keys: title, description, type, xpReward, difficulty.`;

  const result = await withRetry(() => model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  }));
  const text = result.response.text();
  return JSON.parse(text.trim());
};

export const verifyMissionProof = async (missionType: string, missionTitle: string, base64Image: string, mimeType: string) => {
  const model = getModel('gemini-1.5-flash');
  
  const prompt = `You are the T1GER AI Auditor. Your job is to verify 'Real-World Proof of Work' for entrepreneurs. The mission is: ${missionTitle}. 
  Analyze the attached user image for proof of this activity. 
  Be highly discerning and context-aware. 
  Look for genuine, specific evidence of the activity. 
  If verified, give a short, aggressive compliment. 
  
  Return ONLY a strict JSON object: { 
    "status": "APPROVED" or "REJECTED", 
    "confidence_score": [0-100], 
    "message": "[Aggressive compliment or mentor-style critique]",
    "analysis": {
      "strengths": ["..."],
      "weaknesses": ["..."],
      "suggestions": ["..."]
    }
  }.`;

  // Detect mimeType and clean base64
  const { finalBase64, finalMimeType } = extractBase64Data(base64Image, mimeType);

  const result = await withRetry(() => model.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        {
          inlineData: {
            data: finalBase64,
            mimeType: finalMimeType
          }
        }
      ]
    }],
    generationConfig: { responseMimeType: "application/json" }
  }));

  const text = result.response.text();
  return JSON.parse(text.trim());
};

export const requestSeniorReview = async (missionType: string, missionTitle: string, base64Image: string, mimeType: string) => {
  const model = getModel('gemini-1.5-pro');
  const prompt = `You are a Senior AI Auditor. You are performing a deep, nuanced review of a mission proof. The mission is: ${missionTitle}. 
  Return ONLY a strict JSON object: { 
    "status": "APPROVED" or "REJECTED", 
    "message": "[Detailed explanation]"
  }.`;

  // Detect mimeType and clean base64
  const { finalBase64, finalMimeType } = extractBase64Data(base64Image, mimeType);

  const result = await withRetry(() => model.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        {
          inlineData: {
            data: finalBase64,
            mimeType: finalMimeType
          }
        }
      ]
    }],
    generationConfig: { responseMimeType: "application/json" }
  }));

  const text = result.response.text();
  return JSON.parse(text.trim());
};

export const reviewMissionProof = requestSeniorReview;

export interface WrittenVerificationResult {
  status: 'APPROVED' | 'REJECTED';
  score: number; // 0-100
  headline: string;
  feedback: string;
  strength?: string;
  improvementTip?: string;
}

/**
 * Evaluates written evidence, action plans, and reflections using Gemini AI
 * to ensure users submit genuine tactical effort, rejecting spam/gibberish.
 */
export const verifyWrittenActionProof = async (
  missionTitle: string,
  taskBrief: string,
  userText: string,
  language: 'es' | 'en' = 'es'
): Promise<WrittenVerificationResult> => {
  const isEs = language === 'es';
  const cleanText = (userText || '').trim();

  // Basic anti-spam heuristic check
  const words = cleanText.split(/\s+/).filter(Boolean);
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const isGibberish = words.length < 5 || (uniqueWords.size / Math.max(1, words.length)) < 0.35;

  if (isGibberish) {
    return {
      status: 'REJECTED',
      score: 20,
      headline: isEs ? 'Falta Profundidad Táctica' : 'Tactical Depth Required',
      feedback: isEs
        ? 'Tu entrega parece demasiado corta o repetitiva. Describe una acción real con números, nombres de activos o decisiones concretas.'
        : 'Your submission seems too short or repetitive. Provide a real action with numbers, assets, or concrete decisions.',
      improvementTip: isEs
        ? 'Especifica qué paso del framework vas a aplicar esta semana.'
        : 'Specify which step of the framework you will apply this week.',
    };
  }

  try {
    const model = getModel('gemini-1.5-flash');
    const prompt = `You are the Profesor T1GER AI Tactical Auditor.
Evaluate the following user response for the practical mission: "${missionTitle}".
Mission Goal/Brief: "${taskBrief}".
User Submission: "${cleanText}".
Target Language: ${language === 'es' ? 'Spanish (Español)' : 'English'}.

CRITERIA:
1. Approve (status: "APPROVED", score: 70-100) if the user demonstrated genuine understanding, applied the concept, or provided concrete numbers/examples/actions.
2. Reject (status: "REJECTED", score: 10-55) if it is obvious spam, unrelated keyboard mash, low-effort filler, or completely misses the lesson's framework.
3. Provide constructive, high-agency mentor feedback in ${language === 'es' ? 'Spanish' : 'English'}.

Return ONLY valid JSON matching this exact structure:
{
  "status": "APPROVED",
  "score": 90,
  "headline": "¡Excelente criterio!",
  "feedback": "Has identificado correctamente la diferencia...",
  "strength": "Dato o razonamiento más sólido",
  "improvementTip": "Sugerencia táctica de mejora"
}`;

    const result = await withRetry(() => model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    }));

    const parsed = JSON.parse(result.response.text().trim());
    return {
      status: parsed.status === 'APPROVED' ? 'APPROVED' : 'REJECTED',
      score: typeof parsed.score === 'number' ? parsed.score : 85,
      headline: parsed.headline || (isEs ? 'Auditoría T1GER' : 'T1GER Audit'),
      feedback: parsed.feedback || (isEs ? 'Criterio revisado y procesado.' : 'Submission reviewed and processed.'),
      strength: parsed.strength,
      improvementTip: parsed.improvementTip,
    };
  } catch (err) {
    console.warn('Gemini verification fallback to heuristic:', err);
    // Never mint verified progress from a client heuristic in production.
    // Local development keeps a deterministic fallback for the Dev Harness.
    if (!import.meta.env.DEV) throw err;
    const hasNumbers = /\d+/.test(cleanText);
    const score = Math.min(95, 60 + (hasNumbers ? 20 : 10) + Math.min(15, words.length));
    return {
      status: 'APPROVED',
      score,
      headline: isEs ? 'Acción Registrada' : 'Action Recorded',
      feedback: isEs
        ? 'Tu plan táctico ha sido registrado en tu bitácora de ejecución.'
        : 'Your tactical plan has been saved to your execution log.',
      strength: isEs ? 'Compromiso de ejecución inmediata' : 'Immediate execution commitment',
    };
  }
};

export const generateBadgeIcon = async (title: string) => {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(title)}&backgroundColor=050505&fontFamily=monospace`;
};

export const generateAdaptiveLesson = async (
  niche: string,
  level: number,
  baseMission: any,
  weaknesses: { competency: string; score: number }[],
  recentFailures: string[],
  learningStyle: string,
  dailyTime: number = 5
) => {
  const model = getModel('gemini-1.5-flash');
  
  // Sanitize user inputs to prevent basic prompt injections
  const safeNiche = niche.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const safeLearningStyle = learningStyle.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  
  const compContext = weaknesses.map(w => `${w.competency} (score: ${w.score}/100)`).join(', ');
  const failuresContext = recentFailures.length > 0 ? `Recent mistakes/failures the user made: ${recentFailures.join(', ')}.` : 'No recent mistakes.';
  
  // Calculate question count based on requested daily time commitment
  let questionCount = 3;
  if (dailyTime >= 10) questionCount = 5;
  if (dailyTime >= 15) questionCount = 7;

  const prompt = `You are the T1GER BirdBrain AI Generator. Your goal is to generate a personalized, custom Duolingo-style lesson for an entrepreneur with a niche in "${safeNiche}" who is level ${level}.
  
  Current base topic of the lesson: "${baseMission.title}"
  Concept of the topic: "${baseMission.concept_flashcard || baseMission.concept || ''}"
  Mission Type: "${baseMission.type || 'flashcard'}"
  User Learning Style: "${safeLearningStyle}"
  User Daily Time Commitment: ${dailyTime} minutes (Generate exactly ${questionCount} quiz questions)
  
  User Competency Weaknesses to strengthen: ${compContext}
  ${failuresContext}
  
  TASK:
  Provide a highly customized, adaptive lesson broken down into ${questionCount} micro-questions to test their understanding deeply over multiple repetitions (like Duolingo). 
  - If the user's learning style is "visual", optimize the concept explanation to be extremely punchy, graphic, and visually descriptive.
  - If they are "interactive", make the concept concise and focus on intuition.
  - Generate exactly ${questionCount} questions in the quizQuestions array. Vary them: some multiple choice, some scenario-based.
  
  Return the response in this EXACT JSON structure, mapping the dynamic fields:
  {
    "id": "${baseMission.id}",
    "competency": "${baseMission.competency}",
    "difficulty": "${baseMission.difficulty}",
    "type": "${baseMission.type}",
    "title": "[Dynamic, engaging title matching the personalization]",
    "concept": "[Dynamic, highly personalized explanation of the concept based on the learning style]",
    "keyTakeaway": "[Punchy, dynamic 1-sentence summary]",
    
    "quizQuestions": [
      {
        "text": "[Question 1 text]",
        "options": [
          { "text": "[Option A]", "correct": false },
          { "text": "[Option B]", "correct": true },
          { "text": "[Option C]", "correct": false }
        ],
        "explanation": "[Explanation of the correct answer]"
      }
    ],
    
    "taskBrief": "${baseMission.taskBrief || ''}",
    "xpReward": ${baseMission.xpReward || 50}
  }`;

  const result = await withRetry(() => model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  }));
  const text = result.response.text();
  return JSON.parse(text.trim());
};

export const executePromptChallenge = async (userPrompt: string, systemConstraint: string): Promise<string> => {
  const model = getModel('gemini-1.5-flash', systemConstraint);
  const result = await withRetry(() => model.generateContent(userPrompt));
  return result.response.text();
};
