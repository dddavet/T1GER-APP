import { Type } from '@google/genai';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAi } from './gemini';

export const generateDailyMission = async (userId: string, hunterProfile: any) => {
  const prompt = `You are the T1GER AI Mentor. Your goal is to generate tomorrow's 'Hunt' (Daily Mission) tailored to the user's specific business niche.
  Hunter_Profile: ${JSON.stringify(hunterProfile)}

  If the user is slacking in discipline (recent_weakness), force a brutal, non-negotiable physical or focus-based mission to rebuild their baseline.
  If they are consistent, generate a highly specific, high-leverage business task for their niche.
  Missions must sound aggressive, high-stakes, and immediately actionable. No fluff.
  Return ONLY a strict JSON object: { "mission_title": string, "mission_briefing": string, "required_protocol": string, "xp_reward": number }`;

  const model = getAi().getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const missionResult = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());

  // Save to Firestore
  const questsRef = collection(db, 'users', userId, 'daily_quests');
  await addDoc(questsRef, missionResult);

  return missionResult;
};
