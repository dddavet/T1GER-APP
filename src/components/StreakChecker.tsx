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
      {/* Streak protection logic works silently in the background */}
    </>
  );
};
