import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Check, LockKeyhole, ShieldCheck, Target, Sparkles, AlertCircle } from 'lucide-react';
import type { BankMission } from '../../services/missionBank';
import { MemoryShieldBadge } from './MemoryShieldBadge';
import type { NodeMemoryShield } from '../../services/brainService';

interface KnowledgeNodeProps {
  mission: BankMission;
  shield: NodeMemoryShield;
  isUnlocked: boolean;
  isCompleted: boolean;
  isApply?: boolean;
  index: number;
  onSelect: () => void;
}

export const KnowledgeNode: React.FC<KnowledgeNodeProps> = ({
  mission,
  shield,
  isUnlocked,
  isCompleted,
  isApply = false,
  index,
  onSelect,
}) => {
  const isVulnerable = isCompleted && shield.status === 'vulnerable';
  const isDecaying = isCompleted && shield.status === 'decaying';

  return (
    <motion.button
      onClick={isUnlocked ? onSelect : undefined}
      disabled={!isUnlocked}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: Math.min(index * 0.04, 0.2), 
        type: 'spring', 
        stiffness: 400, 
        damping: 30 
      }}
      whileTap={isUnlocked ? { scale: 0.97 } : undefined}
      className={`group relative flex w-full items-center gap-3 rounded-[1.35rem] border p-2.5 sm:p-3 text-left transition-all duration-200 cursor-pointer shadow-[0_10px_25px_rgba(0,0,0,0.4)] ${
        !isUnlocked
          ? 'border-white/6 bg-white/[.02] opacity-40 cursor-not-allowed'
          : isCompleted
          ? isVulnerable
            ? 'border-rose-500/40 bg-rose-500/[.06] hover:border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.12)]'
            : isDecaying
            ? 'border-amber-500/40 bg-amber-500/[.05] hover:border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
            : 'border-[#3FC78E]/30 bg-[#3FC78E]/[0.06] hover:border-[#3FC78E]/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
          : isApply
          ? 'border-[var(--ob-accent)]/50 bg-[var(--ob-accent)]/[0.08] hover:border-[var(--ob-accent)] shadow-[0_0_20px_rgba(255,115,0,0.15)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
          : 'border-white/12 bg-[#121216]/90 hover:bg-[#18181F] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
      }`}
    >
      {/* Node Status Indicator / Hexagon Icon */}
      <div className="relative shrink-0">
        <div
          className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl font-mono text-sm font-bold transition-transform group-hover:scale-105 ${
            !isUnlocked
              ? 'bg-zinc-800/60 text-zinc-600 border border-white/5'
              : isCompleted
              ? isVulnerable
                ? 'bg-rose-500 text-black shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                : isDecaying
                ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'bg-[#3FC78E] text-black shadow-[0_0_10px_rgba(63,199,142,0.4)]'
              : isApply
              ? 'bg-[var(--ob-accent)] text-black shadow-[0_0_12px_rgba(255,115,0,0.4)]'
              : 'bg-white/10 text-white border border-white/15'
          }`}
        >
          {!isUnlocked ? (
            <LockKeyhole size={16} />
          ) : isCompleted ? (
            <Check size={18} className="stroke-[2.8]" />
          ) : isApply ? (
            <Target size={18} className="stroke-[2.5]" />
          ) : (
            <BookOpen size={16} />
          )}
        </div>

        {/* Pulsing alert dot for decaying/vulnerable shields */}
        {isVulnerable && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
          </span>
        )}
      </div>

      {/* Main Content Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 min-w-0">
          <span className={`inline-flex items-center font-mono text-[8.5px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 ${
            isApply 
              ? 'bg-[var(--ob-accent)]/15 text-[var(--ob-accent)] border border-[var(--ob-accent)]/30'
              : 'bg-white/10 text-zinc-300 border border-white/10'
          }`}>
            {isApply ? '⚡ ACCIÓN REAL' : '📖 PLAYBOOK'}
          </span>
          {mission.sources?.[0]?.author && (
            <span className="text-[9.5px] font-mono text-zinc-400 truncate min-w-0">
              · {mission.sources[0].author}
            </span>
          )}
        </div>

        <h3
          className={`text-xs sm:text-sm font-bold truncate leading-tight ${
            isUnlocked ? 'text-white' : 'text-zinc-500'
          }`}
        >
          {mission.title}
        </h3>

        <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate mt-0.5 leading-normal">
          {mission.keyTakeaway || mission.concept || 'Criterio táctico de alto valor'}
        </p>

        {/* Footer info: XP, Duration, Shield status */}
        <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-400">
          <span className="flex items-center gap-0.5 font-mono font-medium text-[var(--ob-accent)]">
            <Sparkles size={11} /> +{mission.xpReward} XP
          </span>
          <span>•</span>
          <span>{isApply ? '~5 min' : '3 min'}</span>
          {isCompleted && (
            <>
              <span>•</span>
              <span className="font-mono font-semibold text-zinc-300">
                {shield.percentage}% retención
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right side Memory Shield Ring */}
      {isCompleted && (
        <div className="shrink-0 flex items-center justify-center">
          <MemoryShieldBadge
            percentage={shield.percentage}
            size="sm"
            showLabel={false}
            status={shield.status}
          />
        </div>
      )}
    </motion.button>
  );
};
