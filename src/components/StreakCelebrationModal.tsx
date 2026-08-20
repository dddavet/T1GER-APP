import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Flame, Share2 } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { T1gerMascot3D } from './T1gerMascot3D';
import { fireRewardConfetti } from './ui/confetti';

interface StreakCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  previousStreak?: number;
  newStreak?: number;
}

export const StreakCelebrationModal: React.FC<StreakCelebrationModalProps> = ({
  isOpen,
  onClose,
  previousStreak = 0,
  newStreak = 1,
}) => {
  const { language, learnStreak } = useBrain();
  const { addXP } = useT1ger();
  const isEs = language === 'es';

  const [displayedStreak, setDisplayedStreak] = useState(previousStreak);
  const [isBumped, setIsBumped] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Golden & flame celebration confetti
    fireRewardConfetti();

    // Haptic vibration
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([40, 60, 40, 80, 100]);
    }

    // Animate counter bump after 450ms
    const timer = setTimeout(() => {
      setDisplayedStreak(newStreak);
      setIsBumped(true);
    }, 450);

    return () => clearTimeout(timer);
  }, [isOpen, newStreak, previousStreak]);

  if (!isOpen) return null;

  const weekDaysEs = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
  const weekDaysEn = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const weekDays = isEs ? weekDaysEs : weekDaysEn;
  const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0 ... Sunday = 6
  const currentStreakVal = Math.max(newStreak, learnStreak, 1);

  const handleShare = async () => {
    if (shared) return;
    await addXP(20, 2, 'streak_share');
    setShared(true);
    if (typeof window !== 'undefined' && window.navigator.share) {
      try {
        await window.navigator.share({
          title: `T1GER - ${currentStreakVal} ${isEs ? 'Días de Racha' : 'Day Streak'}`,
          text: isEs
            ? `¡Llevo ${currentStreakVal} días seguidos construyendo mi disciplina financiera en T1GER!`
            : `I'm on a ${currentStreakVal} day financial discipline streak on T1GER!`,
          url: window.location.origin,
        });
      } catch {
        // User cancelled share dialog
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[1000] flex flex-col items-center justify-between overflow-y-auto bg-gradient-to-b from-[#220B02] via-[#0D0907] to-[#09090B] px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[max(env(safe-area-inset-top),2rem)] font-sans text-white select-none"
      >
        {/* Top Hero: Flaming Mascot */}
        <div className="relative flex w-full max-w-sm flex-col items-center pt-2">
          {/* Glowing Flame Halo behind Mascot */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
            className="absolute top-4 h-52 w-52 rounded-full bg-[radial-gradient(circle,#FF7300_0%,#FF3B00_40%,transparent_70%)] blur-2xl pointer-events-none"
          />

          {/* 3D Mascot Floating Freely with Flame Cheer */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 25 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.1 }}
            className="relative flex h-56 w-56 items-center justify-center pointer-events-none"
          >
            {/* Animated Flame Badge Overhead */}
            <motion.div 
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute -top-1 z-20 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF7300] text-white shadow-[0_0_20px_rgba(255,115,0,0.6)] border border-amber-300/40"
            >
              <Flame size={24} className="fill-white stroke-none" />
            </motion.div>
            <T1gerMascot3D mood="celebrate" closeUp={false} className="h-full w-full" />
          </motion.div>

          {/* Duolingo Big Bold Day Counter */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: isBumped ? [1, 1.22, 1] : 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-2 flex flex-col items-center"
          >
            <span
              className="font-black text-8xl tracking-tight text-white drop-shadow-[0_4px_25px_rgba(255,115,0,0.5)]"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {displayedStreak}
            </span>

            <p className="mt-1 text-2xl font-black tracking-wide text-[#FF8C33] drop-shadow-[0_2px_10px_rgba(255,115,0,0.3)]">
              {isEs
                ? (displayedStreak === 1 ? 'DÍA DE RACHA' : 'DÍAS DE RACHA')
                : (displayedStreak === 1 ? 'DAY STREAK' : 'DAYS STREAK')}
            </p>
          </motion.div>
        </div>

        {/* Middle: 7-Day Weekly Checkmark Ribbon (Accurate Streak Calculation) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="w-full max-w-sm py-3"
        >
          <div className="flex justify-between items-center px-1">
            {weekDays.map((dayLabel, index) => {
              // Accurate checkmark logic:
              // Only active if index <= todayIndex AND within currentStreakVal window!
              const isCompleted = index <= todayIndex && (todayIndex - index) < currentStreakVal;
              const isToday = index === todayIndex;

              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${isToday ? 'text-[#FF8C33]' : 'text-zinc-400'}`}>
                    {dayLabel}
                  </span>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
                      isCompleted
                        ? isToday
                          ? 'bg-gradient-to-b from-[#FF8C33] to-[#FF4500] text-white shadow-[0_0_18px_rgba(255,115,0,0.5)] border border-amber-300/40 ring-2 ring-[#FF7300]/50 ring-offset-2 ring-offset-black'
                          : 'bg-[#FF7300]/30 border border-[#FF7300]/50 text-[#FF8C33]'
                        : 'bg-white/[.04] border border-white/8 text-zinc-600'
                    }`}
                  >
                    {isCompleted ? (
                      isToday ? (
                        <Flame size={20} className="fill-white stroke-none" />
                      ) : (
                        <Check size={20} strokeWidth={3} className="text-[#FF8C33]" />
                      )
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-white/20" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Screen Time Opportunity Cost Victory Badge */}
          <div className="mt-5 flex items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-4 py-3 text-center text-xs font-semibold text-zinc-200 shadow-xl">
            <span className="text-base">⚡</span>
            <span>
              {isEs
                ? 'Hoy le ganaste 15 min al doomscrolling (+$3.75 en valor de tiempo).'
                : 'You beat 15 min of doomscrolling today (+$3.75 in time value).'}
            </span>
          </div>
        </motion.div>

        {/* Bottom Actions: High Contrast Continue Button + Share Action */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="flex w-full max-w-sm flex-col items-center gap-3 mt-4"
        >
          {/* Duolingo Primary Continue Button */}
          <button
            onClick={onClose}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-white font-black text-sm uppercase tracking-wider text-zinc-950 shadow-[0_5px_0_#D4D4D8,0_15px_30px_rgba(0,0,0,0.4)] transition active:translate-y-1 active:shadow-none cursor-pointer"
          >
            <span>{isEs ? 'CONTINUAR' : 'CONTINUE'}</span>
          </button>

          {/* Secondary Share Action */}
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FF7300] hover:text-[#FF8C33] transition cursor-pointer py-1.5"
          >
            <Share2 size={15} />
            <span>{isEs ? (shared ? '¡ENLACE COPIADO!' : 'COMPARTIR LOGRO (+20 XP)') : (shared ? 'LINK COPIED!' : 'SHARE STREAK (+20 XP)')}</span>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
