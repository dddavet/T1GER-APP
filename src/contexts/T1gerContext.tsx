import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useBrain } from './BrainContext';
import { getProgressMissionById, isApplyMissionId } from '../services/brainService';
import { fireConfetti } from '../components/ui/confetti';
import { LeagueService } from '../services/leagueService';

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
  addCoins: (amount: number) => Promise<void>;
  spendCoins: (amount: number) => Promise<void>;
}

const T1gerContext = createContext<T1gerContextType | undefined>(undefined);

export const T1gerProvider = ({ children }: { children: React.ReactNode }) => {
  const { appUser, user: authenticatedUser, updateAppUser, refreshAppUser } = useAuth();
  const { brainState } = useBrain();
  const [user, setUser] = useState<User>({ name: '', niche: null, mode: null, age: null, avatar: '🐅' });
  const [stats, setStats] = useState<Stats>({ xp: 0, verifiedXP: 0, coins: 0, streak: 0, health: 100, rank: 'Cub' });
  const statsRef = useRef(stats);
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
      setStats(prev => {
        const nextStats = {
        ...prev,
        xp: appUser.xp,
        verifiedXP: appUser.verifiedXP || 0,
        coins: appUser.coins || 0,
        streak: appUser.streak,
        rank: appUser.level > 10 ? 'Apex' : appUser.level > 5 ? 'Hunter' : 'Cub'
        };
        statsRef.current = nextStats;
        return nextStats;
      });
      if (activeView === 'onboarding') {
        setActiveView('learn');
      }
    }
  }, [appUser]);

  const addXP = React.useCallback(async (amount: number, tier?: 1 | 2, rewardId?: string) => {
    if (authenticatedUser) {
      await refreshAppUser();
      return; // Cloud rewards are issued exclusively by verified server actions.
    }
    if (rewardId && typeof window !== 'undefined') {
      const ledgerKey = `t1ger_reward_${appUser?.uid || 'local'}_${rewardId}`;
      if (localStorage.getItem(ledgerKey)) return;
      localStorage.setItem(ledgerKey, String(Date.now()));
    }
    const rewardedMissionId = rewardId?.startsWith('mission:') ? rewardId.slice('mission:'.length) : undefined;
    const rewardedMission = rewardedMissionId ? getProgressMissionById(rewardedMissionId) : undefined;
    const rewardAlreadyInHistory = rewardedMissionId
      ? brainState?.missionHistory?.some(record => record.missionId === rewardedMissionId && record.completed)
      : false;
    const applyMissionsCompleted = (brainState?.missionHistory?.filter(record => record.completed && isApplyMissionId(record.missionId)).length || 0)
      + (rewardedMission?.type === 'real_world_task' && !rewardAlreadyInHistory ? 1 : 0);
    
    const previousStats = statsRef.current;
    const calculatedXP = Math.max(0, previousStats.xp + amount);
    const calculatedVerifiedXP = Math.max(0, previousStats.verifiedXP + (tier === 1 ? amount : 0));
    const earnedCoins = amount > 0 ? Math.floor(amount / 2) : 0;
    const calculatedCoins = Math.max(0, previousStats.coins + earnedCoins);

    // Every 200 XP opens a potential level, capped by completed Apply missions.
    const xpLevel = Math.floor(calculatedXP / 200) + 1;
    const applyLevel = applyMissionsCompleted + 1;
    const calculatedLevel = Math.max(appUser?.level || 1, Math.min(xpLevel, applyLevel));
    const nextStats = {
      ...previousStats,
      xp: calculatedXP,
      verifiedXP: calculatedVerifiedXP,
      coins: calculatedCoins,
    };
    statsRef.current = nextStats;
    setStats(nextStats);

    if (calculatedLevel > (appUser?.level || 1)) {
      setTriggerAnimation('level-up');
      fireConfetti();
      setTimeout(() => setTriggerAnimation('none'), 3000);
    }

    if (appUser) {
      // League System Logic: Compute Weekly XP & Tier
      const nowWeekId = LeagueService.getCurrentWeekId();
      let newWeeklyXP = appUser.weeklyXP || 0;
      if (appUser.currentWeekId !== nowWeekId) {
        newWeeklyXP = 0; // Reset for new week
      }
      if (tier === 1) {
        newWeeklyXP += amount; // Only Tier 1 XP counts towards Leagues
      }
      const newTier = LeagueService.getUserTier(calculatedVerifiedXP);

      await updateAppUser({ 
        xp: calculatedXP, 
        verifiedXP: calculatedVerifiedXP, 
        level: calculatedLevel, 
        coins: calculatedCoins,
        weeklyXP: newWeeklyXP,
        currentWeekId: nowWeekId,
        leagueTier: newTier,
        streak: brainState.learnStreak
      });
    }
  }, [appUser, authenticatedUser, refreshAppUser, updateAppUser, brainState]);

  const spendCoins = React.useCallback(async (amount: number) => {
    if (authenticatedUser) throw new Error('Use a server-validated purchase.');
    if (!Number.isFinite(amount) || amount < 0 || amount > statsRef.current.coins) throw new Error('Invalid coin amount.');
    const finalCoins = Math.max(0, statsRef.current.coins - amount);
    const nextStats = { ...statsRef.current, coins: finalCoins };
    statsRef.current = nextStats;
    setStats(nextStats);

    if (appUser) {
      await updateAppUser({ coins: finalCoins });
    }
  }, [appUser, authenticatedUser, updateAppUser]);

  const addCoins = React.useCallback(async (amount: number) => {
    if (authenticatedUser) return;
    const finalCoins = Math.max(0, statsRef.current.coins + amount);
    const nextStats = { ...statsRef.current, coins: finalCoins };
    statsRef.current = nextStats;
    setStats(nextStats);

    if (appUser) {
      await updateAppUser({ coins: finalCoins });
    }
  }, [appUser, authenticatedUser, updateAppUser]);

  const value = React.useMemo(() => ({
    user, stats, activeView, triggerAnimation, 
    setUser, setStats, setActiveView, setTriggerAnimation, 
    addXP, spendCoins, addCoins
  }), [user, stats, activeView, triggerAnimation, addXP, spendCoins, addCoins]);

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
