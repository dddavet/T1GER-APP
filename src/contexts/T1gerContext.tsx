import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

type User = { name: string; niche: string | null; mode: string | null; age: number | null; avatar: string };
type Stats = { xp: number; coins: number; streak: number; health: number; rank: string };
type View = 'onboarding' | 'home' | 'proof' | 'learn' | 'friends' | 'profile' | 'coach' | 'mission' | 'debrief' | 'market' | 'tactical';
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
  addXP: (amount: number) => Promise<void>;
  spendCoins: (amount: number) => Promise<void>;
}

const T1gerContext = createContext<T1gerContextType | undefined>(undefined);

export const T1gerProvider = ({ children }: { children: React.ReactNode }) => {
  const { appUser, updateAppUser } = useAuth();
  const [user, setUser] = useState<User>({ name: '', niche: null, mode: null, age: null, avatar: '🐅' });
  const [stats, setStats] = useState<Stats>({ xp: 0, coins: 0, streak: 0, health: 100, rank: 'Cub' });
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
        streak: appUser.streak,
        rank: appUser.level > 10 ? 'Apex' : appUser.level > 5 ? 'Hunter' : 'Cub'
      }));
      if (activeView === 'onboarding') {
        setActiveView('learn');
      }
    }
  }, [appUser]);

  const addXP = React.useCallback(async (amount: number) => {
    const newXP = stats.xp + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    
    if (newXP >= 1000 && stats.xp < 1000) {
      setTriggerAnimation('level-up');
      setTimeout(() => setTriggerAnimation('none'), 3000);
    }

    setStats(prev => ({ ...prev, xp: newXP }));
    
    if (appUser) {
      await updateAppUser({ xp: newXP, level: newLevel });
    }
  }, [stats.xp, appUser, updateAppUser]);

  const spendCoins = React.useCallback(async (amount: number) => {
    setStats(prev => ({ ...prev, coins: Math.max(0, prev.coins - amount) }));
    // If we had coins in Firestore, we'd update there too
  }, []);

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
