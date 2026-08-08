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
      initial={{ opacity: 0, y: 12, scale: .985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 290, damping: 30, mass: .8 }}
      className="relative grid min-h-[7.25rem] grid-cols-[6.7rem_1fr] items-center overflow-hidden rounded-[1.65rem] bg-[#0B2925] pr-4 shadow-[inset_0_1px_0_rgba(255,255,255,.045)] transform-gpu"
      aria-live="polite"
    >
      <div className="pointer-events-none h-[7.25rem] w-[6.7rem] self-end">
        <T1gerMascot3D mood={guide.mood} closeUp className="h-full w-full" />
      </div>
      <motion.div layout className="relative rounded-[1.25rem] border border-white/[.065] bg-[#10332D] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,.035)]">
        <span className="absolute left-[-.36rem] top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-b border-l border-white/[.065] bg-[#10332D]" />
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={`${surface}-${guide.eyebrow}`}
            initial={{ opacity: 0, x: 7 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: .2, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#F08A52]">{guide.eyebrow}</p>
            <p className="mt-1.5 text-[13px] font-medium leading-5 text-[#DCEBE7]">{guide.message}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
});
