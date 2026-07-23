import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAi } from './gemini';

export const adjustEconomy = async (userId: string, economyProfile: any) => {
  const fallbackEconomy = {
    streak_freeze_price: 200,
    unlocked_special_items: [],
    market_message: 'El mercado se mantiene estable. Mantén tu racha activa para dominar.'
  };

  try {
    const prompt = `You are the T1GER AI Economist. Your goal is to prevent users from getting 'comfortable' and hoarding wealth.
    Economy_Profile: ${JSON.stringify(economyProfile)}

    If a user has a low weekly_success_rate but keeps buying 'Streak Freezes', apply hyper-inflation. Raise the price of the Streak Freeze by 200%. They must feel the financial pain of laziness.
    If a user has a 90%+ success rate and is hoarding coins, unlock a 'Hidden Boss Tier' item in the shop to drain their wallet and reward their dominance.
    
    Return ONLY a strict JSON object: { "streak_freeze_price": number, "unlocked_special_items": string[], "market_message": string }`;

    const model = getAi().getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON object found in response');
    const economyResult = JSON.parse(jsonMatch[0]);

    // Sanitize and bound outputs
    const safePrice = Math.min(Math.max(Number(economyResult.streak_freeze_price) || 200, 50), 2000);
    const safeResult = {
      streak_freeze_price: safePrice,
      unlocked_special_items: Array.isArray(economyResult.unlocked_special_items) ? economyResult.unlocked_special_items : [],
      market_message: String(economyResult.market_message || fallbackEconomy.market_message)
    };

    // Update Firestore using merge to prevent missing doc error
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      economy: {
        streakFreezePrice: safeResult.streak_freeze_price,
        unlockedSpecialItems: safeResult.unlocked_special_items,
        marketMessage: safeResult.market_message
      }
    }, { merge: true });

    return safeResult;
  } catch (error) {
    console.warn('adjustEconomy failed, using fallback economy profile:', error);
    return fallbackEconomy;
  }
};
