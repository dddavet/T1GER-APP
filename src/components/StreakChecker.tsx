import React, { useEffect, useState } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { PenaltyModal } from './PenaltyModal';
import { differenceInHours } from 'date-fns';
import { motion } from 'motion/react';

export const StreakChecker = () => {
  const { appUser, updateAppUser } = useAuth();
  const [showPenalty, setShowPenalty] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    const checkStreak = async () => {
      if (!appUser || !appUser.lastMissionDate) return;

      const lastMissionDate = typeof appUser.lastMissionDate?.toDate === 'function'
        ? appUser.lastMissionDate.toDate()
        : new Date(appUser.lastMissionDate);
      const now = new Date();
      
      if (differenceInHours(now, lastMissionDate) > 24) {
        if ((appUser.streakShields || 0) > 0) {
          await updateAppUser({
            streakShields: (appUser.streakShields || 0) - 1,
            lastMissionDate: serverTimestamp()
          });
        } else {
          const newXp = Math.max(0, (appUser.xp || 0) - 100);
          
          await updateAppUser({
            streak: 0,
            xp: newXp,
            lastMissionDate: serverTimestamp()
          });
          
          setShowPenalty(true);
        }
      }
    };

    checkStreak();
  }, [appUser]);

  return (
    <>
      <PenaltyModal isOpen={showPenalty} onClose={() => setShowPenalty(false)} />
      {appUser && (appUser.streakShields || 0) > 0 && (
        <motion.div 
          animate={activating ? { scale: 0.8, opacity: 0.5 } : { scale: 1, opacity: 1 }}
          className="fixed bottom-4 right-4 z-50 bg-zinc-900 border border-orange-500/50 p-3 rounded-2xl shadow-xl flex items-center gap-3"
        >
          <div className="text-orange-500 font-bold">
            🛡️ {appUser.streakShields}
          </div>
          <button
            onClick={async () => {
              setActivating(true);
              await updateAppUser({
                streakShields: (appUser.streakShields || 0) - 1,
                lastMissionDate: serverTimestamp()
              });
              setTimeout(() => setActivating(false), 500);
            }}
            className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full hover:bg-orange-600 transition-colors"
          >
            Activate
          </button>
        </motion.div>
      )}
    </>
  );
};
