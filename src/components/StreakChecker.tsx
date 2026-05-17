import React, { useEffect, useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { PenaltyModal } from './PenaltyModal';
import { differenceInHours } from 'date-fns';
import { motion } from 'motion/react';

export const StreakChecker = () => {
  const { appUser, refreshAppUser } = useAuth();
  const [showPenalty, setShowPenalty] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    const checkStreak = async () => {
      if (!appUser || !appUser.lastMissionDate) return;

      const lastMissionDate = appUser.lastMissionDate.toDate();
      const now = new Date();
      
      if (differenceInHours(now, lastMissionDate) > 24) {
        const userRef = doc(db, 'users', appUser.uid);
        // Penalty logic
        if ((appUser.streakShields || 0) > 0) {
          await updateDoc(userRef, {
            streakShields: (appUser.streakShields || 0) - 1,
            lastMissionDate: serverTimestamp()
          });
          await refreshAppUser();
          // Maybe show a "Shield Used" modal instead?
        } else {
          const newXp = Math.max(0, (appUser.xp || 0) - 100);
          
          await updateDoc(userRef, {
            streak: 0,
            xp: newXp,
            lastMissionDate: serverTimestamp() // Reset the date to avoid repeated penalties
          });
          
          await refreshAppUser();
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
              const userRef = doc(db, 'users', appUser.uid);
              await updateDoc(userRef, {
                streakShields: (appUser.streakShields || 0) - 1,
                lastMissionDate: serverTimestamp()
              });
              await refreshAppUser();
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
