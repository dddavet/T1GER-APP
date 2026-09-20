import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAi } from './gemini';

export const generateFridaySummary = async (performanceData: any) => {
  const prompt = `Act as a concise learning coach for T1GER.
  Analyze this weekly performance: ${JSON.stringify(performanceData)}.
  If success rate > 80%, recognize the learner's consistency and suggest one meaningful next step.
  If success rate < 50%, identify the likely bottleneck without shame and propose one realistic recovery action.
  Output a direct 3-sentence "Weekly Learning Review" focused on Learn, Apply, and Master.`;

  const model = getAi().getGenerativeModel({ model: 'gemini-1.5-pro' });
  const response = await model.generateContent(prompt);
  return response.response.text();
};

export const generateWeekendMissions = async (userId: string, niche: string) => {
  const prompt = `Generate two optional weekend Apply steps for a learner interested in ${niche}.
  Mission A (Application): A practical action that applies something learned and can be evidenced with a photo, screenshot, or short written artifact.
  Mission B (Personal): A recovery or reflection action that supports sustainable learning.
  For each, define a clear evidence requirement.
  Output as JSON: { 
    "business": { "title": string, "description": string, "proofRequirement": string },
    "personal": { "title": string, "description": string, "proofRequirement": string }
  }`;

  const model = getAi().getGenerativeModel({ model: 'gemini-1.5-pro' });
  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });
  const missions = JSON.parse(response.response.text());

  // Save to Firestore
  const weekendMissionsRef = collection(db, 'users', userId, 'weekendMissions');
  await addDoc(weekendMissionsRef, { ...missions.business, type: 'business', status: 'active' });
  await addDoc(weekendMissionsRef, { ...missions.personal, type: 'personal', status: 'active' });

  // Update user state
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { isWeekendPlanActive: true }, { merge: true });

  return missions;
};
