import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { resolveMascotGuide, type MascotSurface } from '../services/mascotGuide';
import { T1gerMascot3D } from './T1gerMascot3D';

interface MascotGuideProps {
  surface: MascotSurface;
  completedLearn?: boolean;
  completedApply?: boolean;
  applyAvailable?: boolean;
}

export const MascotGuide = React.memo(({
  surface,
  completedLearn,
  completedApply,
  applyAvailable,
}: MascotGuideProps) => {
  const { language, getDailyPipelineMissions, learnStreak, t1gerEmotion } = useBrain();
  const { stats } = useT1ger();
  const { pipeline, applyNode } = getDailyPipelineMissions();

  const guide = useMemo(() => resolveMascotGuide({
    surface,
    emotion: t1gerEmotion,
    completedLearn: completedLearn ?? Boolean(pipeline?.completedLearn),
    completedApply: completedApply ?? Boolean(pipeline?.completedApply),
    applyAvailable: applyAvailable ?? Boolean(applyNode),
    verifiedXP: stats.verifiedXP,
    learnStreak,
    isEs: language === 'es',
  }), [applyAvailable, applyNode, completedApply, completedLearn, language, learnStreak, pipeline?.completedApply, pipeline?.completedLearn, stats.verifiedXP, surface, t1gerEmotion]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 290, damping: 30, mass: 0.8 }}
      className="relative flex items-center gap-3 w-full font-sans select-none"
      aria-live="polite"
    >
      {/* 3D Mascot Floating Freely (Zero Background Box, 100% Transparent Bleed) */}
      <div className="pointer-events-none h-24 w-24 shrink-0 overflow-visible">
        <T1gerMascot3D mood={guide.mood} closeUp className="h-full w-full" />
      </div>

      {/* Duolingo Speech Bubble with Left Tail Pointer */}
      <motion.div
        layout
        className="relative flex-1 rounded-[1.4rem] border border-white/12 bg-[#141418] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_24px_rgba(0,0,0,0.4)]"
      >
        {/* Pointer Arrow Tail */}
        <span className="absolute left-[-0.45rem] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-45 border-b border-l border-white/12 bg-[#141418]" />

        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={`${surface}-${guide.eyebrow}`}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--t1ger-orange)]">
              {guide.eyebrow}
            </p>
            <p className="mt-1 text-[13px] font-medium leading-5 text-[#EAF4F1]">
              {guide.message}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
});
