import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Check,
  LockKey,
  Play,
  ShieldCheck,
  Trophy,
  Gift,
  Sparkle,
  Star,
  CaretDown,
} from '@phosphor-icons/react';
import type { JourneyNode } from '../../services/learningJourney';
import { localizeLearning } from '../../services/interactiveCurriculumTypes';
import type { JourneySection } from '../../services/learningJourney';
import { SoundEffects } from '../../services/soundEffects';

interface DuolingoOrbTrailProps {
  sections: JourneySection[];
  nodes: JourneyNode[];
  locale: 'es' | 'en';
  accentColor: string;
  glowColor: string;
  onOpenNode: (node: JourneyNode) => void;
}

export const DuolingoOrbTrail: React.FC<DuolingoOrbTrailProps> = ({
  sections,
  nodes,
  locale,
  accentColor,
  glowColor,
  onOpenNode,
}) => {
  const tr = (es: string, en: string) => (locale === 'es' ? es : en);
  const reducedMotion = useReducedMotion();

  // Determine zigzag horizontal offset for Duolingo snake trail
  const getZigzagClass = (index: number) => {
    const pattern = [
      'translate-x-0', // Center
      '-translate-x-8 sm:-translate-x-12', // Left
      'translate-x-0', // Center
      'translate-x-8 sm:translate-x-12', // Right
    ];
    return pattern[index % 4];
  };

  let globalOrbCounter = 0;

  return (
    <div className="w-full relative pt-2 pb-8 flex flex-col items-center">
      {sections.map((section, sectionIdx) => {
        const sectionNodes = nodes.filter(n => section.lessonIds.includes(n.lesson.id));
        const allCompleted =
          sectionNodes.length > 0 && sectionNodes.every(n => n.state === 'completed');

        return (
          <div key={section.id} className="w-full max-w-sm relative flex flex-col items-center mb-10">
            {/* Section Milestone Divider / Mini Banner */}
            <div className="w-full flex items-center justify-between px-3.5 py-2.5 mb-6 rounded-2xl bg-[#121216]/80 border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black uppercase text-[#FF8A2A]">
                  {tr('Etapa', 'Chapter')} {sectionIdx + 1}
                </span>
                <span className="text-zinc-600">·</span>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-100 truncate max-w-[190px]">
                  {localizeLearning(section.title, locale)}
                </h3>
              </div>
              {allCompleted ? (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-sm">
                  <Check size={10} weight="bold" /> {tr('Completada', 'Done')}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-zinc-400 font-semibold px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/8">
                  {sectionNodes.filter(n => n.state === 'completed').length}/{sectionNodes.length}
                </span>
              )}
            </div>

            {/* Stepping Stones / Orbs List */}
            <div className="relative w-full flex flex-col items-center gap-12 pt-8 pb-4">
              {/* Connecting Central Ambient Line */}
              <div className="absolute top-4 bottom-4 w-1.5 bg-gradient-to-b from-white/10 via-orange-500/25 to-white/10 rounded-full pointer-events-none -z-0" />

              {sectionNodes.map((node) => {
                const orbIndex = globalOrbCounter++;
                const isCurrent = node.state === 'current';
                const isCompleted = node.state === 'completed';
                const isReview = node.state === 'review';
                const isLocked = node.state === 'locked';

                const zigzag = getZigzagClass(orbIndex);

                return (
                  <motion.div
                    key={node.lesson.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 26,
                      delay: reducedMotion ? 0 : Math.min(orbIndex * 0.05, 0.4),
                    }}
                    className={`relative flex flex-col items-center z-10 ${zigzag}`}
                  >
                    {/* Bouncing "START HERE" Speech Tooltip over the Active Orb */}
                    {isCurrent && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: reducedMotion ? 0 : [0, -6, 0] }}
                        transition={{
                          repeat: reducedMotion ? 0 : Infinity,
                          duration: 1.8,
                          ease: 'easeInOut',
                        }}
                        className="absolute -top-11 z-20 flex flex-col items-center pointer-events-none select-none"
                      >
                        <div
                          className="px-3 py-1 rounded-xl text-[11px] font-mono font-black uppercase tracking-wider text-black shadow-lg flex items-center gap-1.5"
                          style={{
                            backgroundColor: accentColor,
                            boxShadow: `0 0 16px ${glowColor}`,
                          }}
                        >
                          <Sparkle size={12} weight="fill" />
                          <span>{tr('¡EMPIEZA AQUÍ!', 'START HERE!')}</span>
                        </div>
                        <CaretDown size={14} weight="fill" style={{ color: accentColor, marginTop: -4 }} />
                      </motion.div>
                    )}

                    {/* The 3D Tactile Orb Button */}
                    <div className="relative">
                      {/* Active Breathing Aura */}
                      {isCurrent && (
                        <motion.div
                          animate={
                            reducedMotion
                              ? undefined
                              : {
                                  scale: [1, 1.12, 1],
                                  opacity: [0.55, 0.85, 0.55],
                                }
                          }
                          transition={{
                            repeat: Infinity,
                            duration: 2.4,
                            ease: 'easeInOut',
                          }}
                          className="absolute -inset-2.5 rounded-full blur-md -z-10"
                          style={{ backgroundColor: `${accentColor}55` }}
                        />
                      )}
                      {isReview && (
                        <div
                          className="absolute -inset-2 rounded-full animate-pulse blur-sm -z-10 bg-cyan-400/35"
                        />
                      )}

                      <button
                        onPointerDown={() => {
                          if (!isLocked) {
                            SoundEffects.playOrbPress();
                          }
                        }}
                        onClick={() => {
                          if (!isLocked) {
                            onOpenNode(node);
                          }
                        }}
                        disabled={isLocked}
                        aria-label={`${localizeLearning(node.lesson.title, locale)}`}
                        className={`group relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center cursor-pointer select-none touch-manipulation transform-gpu transition-all duration-100 ease-out active:scale-[0.96] ${
                          isCompleted
                            ? 'bg-emerald-500 text-black shadow-[0_8px_0_#065f46] hover:brightness-110 active:translate-y-[6px] active:shadow-[0_2px_0_#065f46]'
                            : isCurrent
                            ? 'text-black shadow-[0_9px_0_#9a3412] hover:brightness-110 active:translate-y-[6px] active:shadow-[0_2px_0_#9a3412]'
                            : isReview
                            ? 'bg-cyan-400 text-black shadow-[0_8px_0_#0e7490] hover:brightness-110 active:translate-y-[6px] active:shadow-[0_2px_0_#0e7490]'
                            : 'bg-[#181820] text-zinc-500 border border-white/10 shadow-[0_6px_0_#0d0d12] cursor-not-allowed opacity-80'
                        }`}
                        style={{
                          backgroundColor: isCurrent ? accentColor : undefined,
                        }}
                      >
                        {/* 3D Specular Dome Gloss - Signature Duolingo Liquid Bubble */}
                        <div className="absolute inset-x-3.5 top-1.5 h-6 rounded-t-full bg-gradient-to-b from-white/35 to-transparent pointer-events-none opacity-80" />

                        {/* Tactile Highlight Ring */}
                        <div className="absolute inset-1.5 rounded-full border border-white/25 pointer-events-none shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]" />

                        {/* Node Icon */}
                        {isCompleted ? (
                          <div className="relative flex items-center justify-center">
                            <Check size={32} weight="bold" />
                            <div className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center text-[10px] shadow-sm">
                              <Star size={11} weight="fill" />
                            </div>
                          </div>
                        ) : isCurrent ? (
                          <Play size={28} weight="fill" className="translate-x-0.5" />
                        ) : isReview ? (
                          <ShieldCheck size={30} weight="fill" />
                        ) : (
                          <LockKey size={24} weight="bold" />
                        )}
                      </button>
                    </div>

                    {/* Lesson Label Below Orb */}
                    <div className="mt-2 text-center max-w-[150px] px-1">
                      <p
                        className={`text-xs font-bold leading-tight line-clamp-2 ${
                          isCurrent
                            ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                            : isCompleted
                            ? 'text-zinc-300'
                            : 'text-zinc-500'
                        }`}
                      >
                        {localizeLearning(node.lesson.title, locale)}
                      </p>
                      <span className="inline-block mt-0.5 text-[10px] font-mono text-zinc-400">
                        {isCompleted
                          ? tr('✓ Completado · Repasar', '✓ Completed · Review')
                          : isCurrent
                          ? tr('3 min + Aplicar', '3 min + Apply')
                          : isReview
                          ? tr('Refresco', 'Refresh')
                          : tr('Bloqueado', 'Locked')}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {/* End of Section Reward / Milestone Chest */}
              <div className="mt-4 flex flex-col items-center">
                <motion.div
                  animate={
                    reducedMotion
                      ? undefined
                      : allCompleted
                      ? { y: [0, -6, 0], rotate: [-1.5, 1.5, -1.5] }
                      : { y: [0, -3, 0] }
                  }
                  transition={{
                    repeat: Infinity,
                    duration: allCompleted ? 2.2 : 3,
                    ease: 'easeInOut',
                  }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all cursor-default ${
                    allCompleted
                      ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-black shadow-[0_6px_0_#92400e,0_0_20px_rgba(245,158,11,0.35)] border-amber-300'
                      : 'bg-[#15151C] text-zinc-600 border-white/10 shadow-[0_4px_0_#0a0a0f]'
                  }`}
                >
                  {allCompleted ? <Trophy size={26} weight="fill" /> : <Gift size={26} weight="duotone" />}
                </motion.div>
                <span className="mt-1.5 text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                  {allCompleted ? tr('Etapa completada', 'Chapter complete') : tr('Hito de etapa', 'Chapter milestone')}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
