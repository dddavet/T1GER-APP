import { Type } from '@google/genai';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAi } from './gemini';

export const adjustEconomy = async (userId: string, economyProfile: any) => {
  const prompt = `You are the T1GER AI Economist. Your goal is to prevent users from getting 'comfortable' and hoarding wealth.
  Economy_Profile: ${JSON.stringify(economyProfile)}

  If a user has a low weekly_success_rate but keeps buying 'Streak Freezes', apply hyper-inflation. Raise the price of the Streak Freeze by 200%. They must feel the financial pain of laziness.
  If a user has a 90%+ success rate and is hoarding coins, unlock a 'Hidden Boss Tier' item in the shop to drain their wallet and reward their dominance.
  
  Return ONLY a strict JSON object: { "streak_freeze_price": number, "unlocked_special_items": string[], "market_message": string }`;

  const model = getAi().getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const economyResult = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());

  // Update Firestore
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    economy: {
      streakFreezePrice: economyResult.streak_freeze_price,
      unlockedSpecialItems: economyResult.unlocked_special_items,
      marketMessage: economyResult.market_message
    }
  });

  return economyResult;
};
