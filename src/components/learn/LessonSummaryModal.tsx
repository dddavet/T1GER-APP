import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, Clock, Target, ArrowRight, Trophy } from 'lucide-react';
import { T1gerMascot3D } from '../T1gerMascot3D';
import { fireRewardConfetti } from '../ui/confetti';

interface LessonSummaryModalProps {
  isOpen: boolean;
  onContinue: () => void;
  xpEarned: number;
  timeSpentSeconds: number;
  accuracyPercentage?: number;
  lessonTitle?: string;
  isEs?: boolean;
}

export const LessonSummaryModal: React.FC<LessonSummaryModalProps> = ({
  isOpen,
  onContinue,
  xpEarned = 100,
  timeSpentSeconds = 95,
  accuracyPercentage = 100,
  lessonTitle = 'Lección Completada',
  isEs = true,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    fireRewardConfetti();
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([40, 50, 60]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Format mm:ss
  const minutes = Math.floor(timeSpentSeconds / 60);
  const seconds = timeSpentSeconds % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  // Speed rating
  const isSuperFast = timeSpentSeconds < 120;
  const speedLabel = isSuperFast ? (isEs ? 'VELOZ' : 'BLAZING') : (isEs ? 'CONSTANTE' : 'COMMITTED');

  // Accuracy rating
  const isPerfect = accuracyPercentage >= 100;
  const accuracyLabel = isPerfect ? (isEs ? 'PERFECTO' : 'PERFECT!') : (isEs ? 'EXCELENTE' : 'GREAT!');

  const headline = isPerfect && isSuperFast
    ? (isEs ? '¡Lección Perfecta!' : 'Perfect lesson!')
    : isSuperFast
    ? (isEs ? '¡Súper Rápido!' : 'Super fast!')
    : (isEs ? '¡Lección Completa!' : 'Lesson complete!');

  const subheadline = isPerfect && isSuperFast
    ? (isEs ? '¡Récord de velocidad y precisión!' : 'Take a bow!')
    : (isEs ? `Completaste el playbook en ${minutes > 0 ? `${minutes}m ` : ''}${seconds}s.` : `You finished in ${timeFormatted}!`);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex flex-col items-center justify-between bg-[#09090B] px-6 py-8 font-sans text-white select-none overflow-y-auto"
      >
        {/* Top Celebration Sparkles & Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-full max-w-sm text-center pt-4"
        >
          <div className="flex justify-center mb-1">
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/25">
              <Sparkles size={12} /> {isEs ? 'PLAYBOOK DOMINADO' : 'PLAYBOOK MASTERED'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight mt-2">
            {headline}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            {subheadline}
          </p>
        </motion.div>

        {/* Center: 3D Celebrating T1GER Mascot */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.2 }}
          className="relative my-auto flex h-52 w-52 items-center justify-center pointer-events-none"
        >
          {/* Subtle Golden Glow Halo */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,#FF7300_0%,transparent_70%)] opacity-30 blur-2xl pointer-events-none" />
          <T1gerMascot3D mood="celebrate" className="h-full w-full" />
        </motion.div>

        {/* Bottom Stats Pills (Duolingo Exact 3-Badge Card Row) */}
        <div className="w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="grid grid-cols-3 gap-2.5 mb-6"
          >
            {/* BADGE 1: TOTAL XP */}
            <div className="rounded-2xl border-2 border-amber-400/80 bg-amber-400/[0.08] overflow-hidden flex flex-col shadow-[0_0_15px_rgba(251,191,36,0.15)]">
              <div className="bg-amber-400 text-black text-[9px] font-mono font-black uppercase text-center py-1 tracking-wider">
                {isEs ? 'TOTAL XP' : 'TOTAL XP'}
              </div>
              <div className="flex-1 py-3 flex items-center justify-center gap-1">
                <Zap size={16} className="text-amber-400 fill-amber-400" />
                <span className="font-mono text-lg font-black text-white">
                  +{xpEarned}
                </span>
              </div>
            </div>

            {/* BADGE 2: SPEED / BLAZING */}
            <div className="rounded-2xl border-2 border-sky-400/80 bg-sky-400/[0.08] overflow-hidden flex flex-col shadow-[0_0_15px_rgba(56,189,248,0.15)]">
              <div className="bg-sky-400 text-black text-[9px] font-mono font-black uppercase text-center py-1 tracking-wider">
                {speedLabel}
              </div>
              <div className="flex-1 py-3 flex items-center justify-center gap-1">
                <Clock size={16} className="text-sky-400" />
                <span className="font-mono text-lg font-black text-white">
                  {timeFormatted}
                </span>
              </div>
            </div>

            {/* BADGE 3: ACCURACY / AMAZING */}
            <div className="rounded-2xl border-2 border-[#3FC78E]/80 bg-[#3FC78E]/[0.08] overflow-hidden flex flex-col shadow-[0_0_15px_rgba(63,199,142,0.15)]">
              <div className="bg-[#3FC78E] text-black text-[9px] font-mono font-black uppercase text-center py-1 tracking-wider">
                {accuracyLabel}
              </div>
              <div className="flex-1 py-3 flex items-center justify-center gap-1">
                <Target size={16} className="text-[#3FC78E]" />
                <span className="font-mono text-lg font-black text-white">
                  {accuracyPercentage}%
                </span>
              </div>
            </div>
          </motion.div>

          {/* Primary Action Button (Duolingo 3D Tactile Button) */}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            onClick={onContinue}
            className="w-full py-4 rounded-2xl font-mono text-sm font-black uppercase tracking-wider bg-[var(--ob-accent)] hover:brightness-110 text-black shadow-[0_6px_0_#CC5C00,0_12px_25px_rgba(255,115,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#CC5C00] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isEs ? 'CONTINUAR' : 'CONTINUE'}</span>
            <ArrowRight size={18} className="stroke-[3]" />
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
