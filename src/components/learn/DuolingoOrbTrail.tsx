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
    <div className="w-full relative py-6 flex flex-col items-center">
      {sections.map((section, sectionIdx) => {
        const sectionNodes = nodes.filter(n => section.lessonIds.includes(n.lesson.id));
        const allCompleted =
          sectionNodes.length > 0 && sectionNodes.every(n => n.state === 'completed');

        return (
          <div key={section.id} className="w-full max-w-sm relative flex flex-col items-center mb-10">
            {/* Section Milestone Divider / Mini Banner */}
            <div className="w-full flex items-center justify-between px-3 py-2.5 mb-12 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black uppercase text-orange-400">
                  {tr('Etapa', 'Chapter')} {sectionIdx + 1}
                </span>
                <span className="text-zinc-600">·</span>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-100 truncate max-w-[190px]">
                  {localizeLearning(section.title, locale)}
                </h3>
              </div>
              {allCompleted ? (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  <Check size={10} weight="bold" /> {tr('Completada', 'Done')}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-zinc-400">
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
                  <div
                    key={node.lesson.id}
                    className={`relative flex flex-col items-center transition-transform z-10 ${zigzag}`}
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
                      {/* Active Pulsing Aura */}
                      {isCurrent && (
                        <div
                          className="absolute -inset-2.5 rounded-full animate-pulse blur-sm -z-10"
                          style={{ backgroundColor: `${accentColor}45` }}
                        />
                      )}

                      <button
                        onClick={() => onOpenNode(node)}
                        disabled={isLocked}
                        aria-label={`${localizeLearning(node.lesson.title, locale)}`}
                        className={`group relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all cursor-pointer select-none ${
                          isCompleted
                            ? 'bg-emerald-500 text-black shadow-[0_7px_0_#065f46] hover:brightness-110 active:translate-y-1.5 active:shadow-[0_1px_0_#065f46]'
                            : isCurrent
                            ? 'text-black shadow-[0_8px_0_#9a3412] hover:brightness-110 active:translate-y-2 active:shadow-[0_1px_0_#9a3412]'
                            : isReview
                            ? 'bg-cyan-400 text-black shadow-[0_7px_0_#0e7490] hover:brightness-110 active:translate-y-1.5 active:shadow-[0_1px_0_#0e7490]'
                            : 'bg-[#181820] text-zinc-500 border border-white/10 shadow-[0_6px_0_#0d0d12] cursor-not-allowed opacity-80'
                        }`}
                        style={{
                          backgroundColor: isCurrent ? accentColor : undefined,
                        }}
                      >
                        {/* Tactile Highlight Ring */}
                        <div className="absolute inset-1.5 rounded-full border border-white/25 pointer-events-none" />

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
                  </div>
                );
              })}

              {/* End of Section Reward / Milestone Chest */}
              <div className="mt-4 flex flex-col items-center">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                    allCompleted
                      ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-black shadow-[0_6px_0_#92400e] border-amber-300 animate-pulse'
                      : 'bg-[#15151C] text-zinc-600 border-white/10 shadow-[0_4px_0_#0a0a0f]'
                  }`}
                >
                  {allCompleted ? <Trophy size={26} weight="fill" /> : <Gift size={26} weight="duotone" />}
                </div>
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
