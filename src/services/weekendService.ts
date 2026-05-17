import { GoogleGenAI } from '@google/genai';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const generateFridaySummary = async (performanceData: any) => {
  const prompt = `Act as a serious business mentor for T1GER.
  Analyze this weekly performance: ${JSON.stringify(performanceData)}.
  If success rate > 80%, praise "Market Dominance" and suggest an aggressive weekend goal.
  If success rate < 50%, interrogate the user: "Why are we slacking? The pride is falling behind. What is the bottleneck?"
  Output a 3-sentence "Weekly Executive Summary".`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-pro',
    contents: prompt,
  });

  return response.text;
};

export const generateWeekendMissions = async (userId: string, niche: string) => {
  const prompt = `Generate two "Weekend Boss Missions" for a user in the ${niche} niche.
  Mission A (Business): High-stakes task requiring a photo of a finished prototype or sent email.
  Mission B (Personal): Recovery task (e.g., "Full digital detox for 2 hours" or "High-intensity outdoor session").
  For each, define the "Proof of Work" photo requirement.
  Output as JSON: { 
    "business": { "title": string, "description": string, "proofRequirement": string },
    "personal": { "title": string, "description": string, "proofRequirement": string }
  }`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-pro',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });

  const missions = JSON.parse(response.text);

  // Save to Firestore
  const weekendMissionsRef = collection(db, 'users', userId, 'weekendMissions');
  await addDoc(weekendMissionsRef, { ...missions.business, type: 'business', status: 'active' });
  await addDoc(weekendMissionsRef, { ...missions.personal, type: 'personal', status: 'active' });

  // Update user state
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { isWeekendPlanActive: true }, { merge: true });

  return missions;
};
