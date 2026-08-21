import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ACHIEVEMENTS, checkAchievements } from '../services/achievements';
import { useAuth } from '../contexts/AuthContext';
import { useT1ger } from '../contexts/T1gerContext';
import { useBrain } from '../contexts/BrainContext';
import { Award } from 'lucide-react';

export const AchievementTracker: React.FC = () => {
  const { appUser, updateAppUser } = useAuth();
  const { stats } = useT1ger();
  const { brainState } = useBrain();

  const [toast, setToast] = useState<{ title: string; desc: string; icon: string; color: string } | null>(null);

  useEffect(() => {
    if (!appUser || !stats || !brainState) return;

    const newlyUnlocked = checkAchievements(appUser, stats, brainState);
    if (newlyUnlocked.length > 0) {
      // Pick the first one to show
      const ach = ACHIEVEMENTS.find(a => a.id === newlyUnlocked[0]);
      
      if (ach && updateAppUser) {
        updateAppUser({
          unlockedAchievements: [...(appUser.unlockedAchievements || []), ...newlyUnlocked]
        });

        // Trigger Toast
        setToast({
          title: ach.name,
          desc: ach.description,
          icon: ach.icon,
          color: ach.color
        });

        if (typeof window !== 'undefined' && window.navigator.vibrate) {
          window.navigator.vibrate([100, 50, 100, 50, 200]);
        }

        setTimeout(() => setToast(null), 5000);
      }
    }
  }, [appUser?.unlockedAchievements?.length, stats.missionsCompleted, brainState.learnStreak, appUser?.coins, appUser?.unlockedAccessories?.length]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="fixed top-12 left-4 right-4 z-[200] max-w-sm mx-auto overflow-hidden rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl border border-white/20"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${toast.color} opacity-20`} />
          <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${toast.color} flex items-center justify-center text-2xl shadow-inner shadow-white/40 border border-white/20`}>
              {toast.icon}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Award size={14} className="text-yellow-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400">Logro Desbloqueado</span>
              </div>
              <h3 className="text-base font-black text-white leading-tight">{toast.title}</h3>
              <p className="text-[10px] text-white/80 font-mono mt-1">{toast.desc}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
