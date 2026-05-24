import { GoogleGenerativeAI } from '@google/generative-ai';

let aiInstance: GoogleGenerativeAI | null = null;

export const getAi = () => {
  if (!aiInstance) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY environment variable is required');
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

// HELPER TO GET MODEL WITH STABLE API VERSION AND LATEST IDENTIFIERS
const getModel = (modelName: string) => {
  // Use v1beta as it is more permissive for multi-modal tasks on the free tier
  // Using 'gemini-flash-latest' and 'gemini-pro-latest' for maximum compatibility
  let modelId = modelName;
  if (modelName === 'gemini-1.5-flash') modelId = 'gemini-1.5-flash-latest';
  if (modelName === 'gemini-1.5-pro') modelId = 'gemini-1.5-pro-latest';
  
  return getAi().getGenerativeModel({ model: modelId }, { apiVersion: 'v1beta' });
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

  const result = await withRetry(() => model.generateContent(prompt));
  const text = result.response.text();
  return JSON.parse(text.replace(/```json|```/g, '').trim());
};

export const generateMissionType = async (keyword: string) => {
  const model = getModel('gemini-1.5-flash');
  const prompt = `Generate a new mission type based on the keyword/goal: "${keyword}".
  Provide a name, a short description, and a suggested icon URL (e.g., a Lucide icon name or a placeholder image URL).
  
  Return the response as a JSON object: { "name": "...", "description": "...", "iconUrl": "..." }`;

  const result = await withRetry(() => model.generateContent(prompt));
  const text = result.response.text();
  return JSON.parse(text.replace(/```json|```/g, '').trim());
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

  const result = await withRetry(() => model.generateContent(prompt));
  const text = result.response.text();
  return JSON.parse(text.replace(/```json|```/g, '').trim());
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
  let finalMimeType = mimeType;
  let finalBase64 = base64Image;
  if (base64Image.startsWith('data:')) {
    const match = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      finalMimeType = match[1];
      finalBase64 = match[2];
    }
  }

  const result = await withRetry(() => model.generateContent([
    { text: prompt },
    {
      inlineData: {
        data: finalBase64,
        mimeType: finalMimeType
      }
    }
  ]));

  const text = result.response.text();
  return JSON.parse(text.replace(/```json|```/g, '').trim());
};

export const requestSeniorReview = async (missionType: string, missionTitle: string, base64Image: string, mimeType: string) => {
  const model = getModel('gemini-1.5-pro');
  const prompt = `You are a Senior AI Auditor. You are performing a deep, nuanced review of a mission proof. The mission is: ${missionTitle}. 
  Return ONLY a strict JSON object: { 
    "status": "APPROVED" or "REJECTED", 
    "message": "[Detailed explanation]"
  }.`;

  // Detect mimeType and clean base64
  let finalMimeType = mimeType;
  let finalBase64 = base64Image;
  if (base64Image.startsWith('data:')) {
    const match = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      finalMimeType = match[1];
      finalBase64 = match[2];
    }
  }

  const result = await withRetry(() => model.generateContent([
    { text: prompt },
    {
      inlineData: {
        data: finalBase64,
        mimeType: finalMimeType
      }
    }
  ]));

  const text = result.response.text();
  return JSON.parse(text.replace(/```json|```/g, '').trim());
};

export const reviewMissionProof = requestSeniorReview;

export const generateSpeech = async (text: string) => null;

export const generateBadgeIcon = async (title: string) => {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(title)}&backgroundColor=050505&fontFamily=monospace`;
};

export const generateAdaptiveLesson = async (
  niche: string,
  level: number,
  baseMission: any,
  weaknesses: { competency: string; score: number }[],
  recentFailures: string[],
  learningStyle: string
) => {
  const model = getModel('gemini-1.5-flash');
  
  const compContext = weaknesses.map(w => `${w.competency} (score: ${w.score}/100)`).join(', ');
  const failuresContext = recentFailures.length > 0 ? `Recent mistakes/failures the user made: ${recentFailures.join(', ')}.` : 'No recent mistakes.';
  
  const prompt = `You are the T1GER BirdBrain AI Generator. Your goal is to generate a personalized, custom Duolingo-style lesson for an entrepreneur with a niche in "${niche}" who is level ${level}.
  
  Current base topic of the lesson: "${baseMission.title}"
  Concept of the topic: "${baseMission.concept_flashcard || baseMission.concept || ''}"
  Mission Type: "${baseMission.type || 'flashcard'}"
  User Learning Style: "${learningStyle}"
  
  User Competency Weaknesses to strengthen: ${compContext}
  ${failuresContext}
  
  TASK:
  Provide a highly customized, adaptive lesson. 
  - If the user's learning style is "visual", optimize the concept explanation to be extremely punchy, graphic, and visually descriptive.
  - If they are "interactive", make the concept concise and focus on intuition.
  - Construct custom, adaptive options and questions:
    - If the user has weak competencies, make some options or questions test their understanding in those weak areas.
    - If they had recent failures, design a custom recall question or option that directly addresses the root cause of those mistakes, giving them a redemptive learning opportunity!
  
  Return the response in this EXACT JSON structure, mapping the dynamic fields (the output must be valid JSON, with absolutely no markdown wrapping except raw JSON):
  {
    "id": "${baseMission.id}",
    "competency": "${baseMission.competency}",
    "difficulty": "${baseMission.difficulty}",
    "type": "${baseMission.type}",
    "title": "[Dynamic, engaging title matching the personalization]",
    "concept": "[Dynamic, highly personalized explanation of the concept based on the learning style]",
    "keyTakeaway": "[Punchy, dynamic 1-sentence summary]",
    
    // Recall Question (Multiple Choice Quiz to test what was just taught, or to remediate past failures)
    "recallQuestion": "[Personalized multiple choice question based on the concept, designed to challenge or reinforce their specific weak points]",
    "recallOptions": [
      { "text": "[Option A]", "correct": false },
      { "text": "[Option B]", "correct": true },
      { "text": "[Option C]", "correct": false }
    ],
    "recallExplanation": "[Clear, insightful explanation of why the correct answer is right and why other options are wrong, matching a mentor's voice]",
    
    // Scenario Quiz (For scenario_quiz type)
    "scenario": "[Custom, dynamic business scenario tailored to their niche and weaknesses]",
    "options": [
      { "text": "[Option A]", "correct": false },
      { "text": "[Option B]", "correct": true },
      { "text": "[Option C]", "correct": false }
    ],
    "failureCritique": "[Personalized review explanation]",
    
    "taskBrief": "${baseMission.taskBrief || ''}",
    "xpReward": ${baseMission.xpReward || 50}
  }`;

  const result = await withRetry(() => model.generateContent(prompt));
  const text = result.response.text();
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};
