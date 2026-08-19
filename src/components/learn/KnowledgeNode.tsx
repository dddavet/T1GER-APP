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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.2), duration: 0.3 }}
      whileTap={isUnlocked ? { scale: 0.98 } : undefined}
      className={`group relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
        !isUnlocked
          ? 'border-white/6 bg-white/[.02] opacity-40 cursor-not-allowed'
          : isCompleted
          ? isVulnerable
            ? 'border-rose-500/40 bg-rose-500/[.06] hover:border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.12)]'
            : isDecaying
            ? 'border-amber-500/40 bg-amber-500/[.05] hover:border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
            : 'border-[#3FC78E]/30 bg-[#3FC78E]/[0.06] hover:border-[#3FC78E]/50'
          : isApply
          ? 'border-[var(--ob-accent)]/50 bg-[var(--ob-accent)]/[0.08] hover:border-[var(--ob-accent)] shadow-[0_0_20px_rgba(255,115,0,0.15)]'
          : 'border-white/12 bg-white/[.04] hover:bg-white/[.07] hover:border-white/20'
      }`}
    >
      {/* Node Status Indicator / Hexagon Icon */}
      <div className="relative shrink-0">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl font-mono text-sm font-bold transition-transform group-hover:scale-105 ${
            !isUnlocked
              ? 'bg-zinc-800/60 text-zinc-600 border border-white/5'
              : isCompleted
              ? isVulnerable
                ? 'bg-rose-500 text-black shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                : isDecaying
                ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'bg-[#3FC78E] text-black shadow-[0_0_12px_rgba(63,199,142,0.4)]'
              : isApply
              ? 'bg-[var(--ob-accent)] text-black shadow-[0_0_14px_rgba(255,115,0,0.4)]'
              : 'bg-white/10 text-white border border-white/15'
          }`}
        >
          {!isUnlocked ? (
            <LockKeyhole size={18} />
          ) : isCompleted ? (
            <Check size={20} className="stroke-[2.8]" />
          ) : isApply ? (
            <Target size={20} className="stroke-[2.5]" />
          ) : (
            <BookOpen size={18} />
          )}
        </div>

        {/* Pulsing alert dot for decaying/vulnerable shields */}
        {isVulnerable && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500" />
          </span>
        )}
      </div>

      {/* Main Content Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
            isApply 
              ? 'bg-[var(--ob-accent)]/15 text-[var(--ob-accent)] border border-[var(--ob-accent)]/30'
              : 'bg-white/10 text-zinc-300 border border-white/10'
          }`}>
            {isApply ? '⚡ ACCIÓN REAL' : '📖 PLAYBOOK (3 MIN)'}
          </span>
          {mission.sources?.[0]?.author && (
            <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[140px]">
              • {mission.sources[0].author}
            </span>
          )}
        </div>

        <h3
          className={`text-sm font-bold truncate ${
            isUnlocked ? 'text-white' : 'text-zinc-500'
          }`}
        >
          {mission.title}
        </h3>

        <p className="text-xs text-zinc-400 truncate mt-0.5">
          {mission.keyTakeaway || mission.concept || 'Criterio táctico de alto valor'}
        </p>

        {/* Footer info: XP, Duration, Shield status */}
        <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1 font-mono font-medium text-[var(--ob-accent)]">
            <Sparkles size={12} /> +{mission.xpReward} XP
          </span>
          <span>•</span>
          <span>{isApply ? '~5 min práctica' : '3 min lectura'}</span>
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
