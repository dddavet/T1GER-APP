import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAi } from './gemini';

export const generateDailyMission = async (userId: string, hunterProfile: any) => {
  const prompt = `You are the T1GER learning mentor. Generate tomorrow's Apply step for the learner's current domain and goal.
  Hunter_Profile: ${JSON.stringify(hunterProfile)}

  If recent_weakness is present, create a small, achievable action that rebuilds momentum without shame.
  If they are consistent, create a specific real-world application of what they are learning.
  Keep the action ambitious, direct, evidence-based, and immediately actionable. No generic motivation.
  Return ONLY a strict JSON object: { "mission_title": string, "mission_briefing": string, "required_protocol": string, "xp_reward": number }`;

  const model = getAi().getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const missionResult = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());

  // Save to Firestore
  const questsRef = collection(db, 'users', userId, 'daily_quests');
  await addDoc(questsRef, missionResult);

  return missionResult;
};
