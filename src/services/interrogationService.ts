import { Type } from '@google/genai';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { getAi } from './gemini';

export const interrogateUser = async (userId: string, dailyData: any, userTranscript: string) => {
  const prompt = `You are the T1GER Game Master. The user is a Tiger in the wild. Their daily data is the 'Hunt Report.' 
  Compare their User_Transcript against the cold hard Daily_Data.
  Daily_Data: ${JSON.stringify(dailyData)}
  User_Transcript: "${userTranscript}"

  If the user failed the hunt, their Tiger is starving. Interrogate them with the cold, predatory logic of the jungle. Do not accept excuses.
  If the data shows they crushed all missions, they are Apex. Praise them like a high-performing predator.
  Keep responses under 3 sentences. Tone: Cold, predatory, demanding excellence.
  Return ONLY a strict JSON object: { "status": "APPROVED" | "REJECTED", "coo_response": string, "xp_adjustment": number }`;

  const model = getAi().getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const interrogationResult = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());

  // Update Firestore
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    xp: increment(interrogationResult.xp_adjustment),
    isDayClosed: true,
    lastExecutiveSummary: interrogationResult.coo_response
  });

  return interrogationResult;
};
