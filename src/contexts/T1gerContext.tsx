import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useBrain } from './BrainContext';
import { MISSION_BANK } from '../services/missionBank';
import { fireConfetti } from '../components/ui/confetti';

type User = { name: string; niche: string | null; mode: string | null; age: number | null; avatar: string };
type Stats = { xp: number; verifiedXP: number; coins: number; streak: number; health: number; rank: string };
type View = 'onboarding' | 'proof' | 'learn' | 'build' | 'compete' | 'friends' | 'profile' | 'coach' | 'mission' | 'debrief' | 'market' | 'tactical';
type Animation = 'none' | 'level-up' | 'streak-death';

interface T1gerContextType {
  user: User;
  stats: Stats;
  activeView: View;
  triggerAnimation: Animation;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  setStats: React.Dispatch<React.SetStateAction<Stats>>;
  setActiveView: React.Dispatch<React.SetStateAction<View>>;
  setTriggerAnimation: React.Dispatch<React.SetStateAction<Animation>>;
  addXP: (amount: number, tier?: 1 | 2, rewardId?: string) => Promise<void>;
  spendCoins: (amount: number) => Promise<void>;
}

const T1gerContext = createContext<T1gerContextType | undefined>(undefined);

export const T1gerProvider = ({ children }: { children: React.ReactNode }) => {
  const { appUser, updateAppUser } = useAuth();
  const { brainState } = useBrain();
  const [user, setUser] = useState<User>({ name: '', niche: null, mode: null, age: null, avatar: '🐅' });
  const [stats, setStats] = useState<Stats>({ xp: 0, verifiedXP: 0, coins: 0, streak: 0, health: 100, rank: 'Cub' });
  const [activeView, setActiveView] = useState<View>('learn');
  const [triggerAnimation, setTriggerAnimation] = useState<Animation>('none');

  // Sync with AuthContext
  useEffect(() => {
    if (appUser) {
      setUser({
        name: appUser.displayName || '',
        niche: appUser.niche,
        mode: null,
        age: null,
        avatar: appUser.photoURL || '🐅'
      });
      setStats(prev => ({
        ...prev,
        xp: appUser.xp,
        verifiedXP: appUser.verifiedXP || 0,
        coins: appUser.coins || 0,
        streak: appUser.streak,
        rank: appUser.level > 10 ? 'Apex' : appUser.level > 5 ? 'Hunter' : 'Cub'
      }));
      if (activeView === 'onboarding') {
        setActiveView('learn');
      }
    }
  }, [appUser]);

  const addXP = React.useCallback(async (amount: number, tier?: 1 | 2, rewardId?: string) => {
    if (rewardId && typeof window !== 'undefined') {
      const ledgerKey = `t1ger_reward_${appUser?.uid || 'local'}_${rewardId}`;
      if (localStorage.getItem(ledgerKey)) return;
      localStorage.setItem(ledgerKey, String(Date.now()));
    }
    const rewardedMissionId = rewardId?.startsWith('mission:') ? rewardId.slice('mission:'.length) : undefined;
    const rewardedMission = rewardedMissionId ? MISSION_BANK.find(mission => mission.id === rewardedMissionId) : undefined;
    const rewardAlreadyInHistory = rewardedMissionId
      ? brainState?.missionHistory?.some(record => record.missionId === rewardedMissionId && record.completed)
      : false;
    const applyMissionsCompleted = (brainState?.missionHistory?.filter(record => record.completed && MISSION_BANK.find(mission => mission.id === record.missionId)?.type === 'real_world_task').length || 0)
      + (rewardedMission?.type === 'real_world_task' && !rewardAlreadyInHistory ? 1 : 0);
    
    let calculatedXP = 0;
    let calculatedVerifiedXP = 0;
    let calculatedLevel = 1;
    let earnedCoins = Math.floor(amount / 2);
    let calculatedCoins = 0;

    setStats(prev => {
      calculatedXP = prev.xp + amount;
      calculatedVerifiedXP = prev.verifiedXP + (tier === 1 ? amount : 0);
      
      // NEW LEVELING ALGORITHM (Requires BOTH XP and Apply Missions)
      // Every 200 XP grants a potential level, but it is capped by Apply Missions
      const xpLevel = Math.floor(calculatedXP / 200) + 1;
      const applyLevel = applyMissionsCompleted + 1;
      calculatedLevel = Math.min(xpLevel, applyLevel);

      calculatedCoins = prev.coins + earnedCoins;

      if (calculatedLevel > (appUser?.level || 1)) {
        setTriggerAnimation('level-up');
        fireConfetti();
        setTimeout(() => setTriggerAnimation('none'), 3000);
      }

      return {
        ...prev,
        xp: calculatedXP,
        verifiedXP: calculatedVerifiedXP,
        coins: calculatedCoins,
      };
    });

    if (appUser) {
      await updateAppUser({ xp: calculatedXP, verifiedXP: calculatedVerifiedXP, level: calculatedLevel, coins: calculatedCoins });
    }
  }, [appUser, updateAppUser, brainState]);

  const spendCoins = React.useCallback(async (amount: number) => {
    let finalCoins = 0;
    setStats(prev => {
      finalCoins = Math.max(0, prev.coins - amount);
      return { ...prev, coins: finalCoins };
    });

    if (appUser) {
      await updateAppUser({ coins: finalCoins });
    }
  }, [appUser, updateAppUser]);

  const value = React.useMemo(() => ({
    user, stats, activeView, triggerAnimation, 
    setUser, setStats, setActiveView, setTriggerAnimation, 
    addXP, spendCoins
  }), [user, stats, activeView, triggerAnimation, addXP, spendCoins]);

  return (
    <T1gerContext.Provider value={value}>
      {children}
    </T1gerContext.Provider>
  );
};

export const useT1ger = () => {
  const context = useContext(T1gerContext);
  if (!context) throw new Error('useT1ger must be used within T1gerProvider');
  return context;
};
