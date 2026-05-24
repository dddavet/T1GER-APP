import React from 'react';
import { useT1ger } from '../contexts/T1gerContext';
import { Flame, Coins, Brain, Zap, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { useBrain } from '../contexts/BrainContext';

export const HUD = React.memo(() => {
  const { stats } = useT1ger();
  const { dailyTacticalStatus, learnStreak, tacticalStreak, t1gerEmotion, t1gerVisualConfig } = useBrain();

  const totalTasks = (dailyTacticalStatus.committedHabitIds?.length || 0) +
                     (dailyTacticalStatus.committedWorkIds?.length || 0) +
                     (dailyTacticalStatus.committedLessonIds?.length || 0);
  const completedTasks = dailyTacticalStatus.completedIds?.length || 0;

  const health = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
  
  // Predator Mode active when both streaks are >= 3
  const isPredatorMode = t1gerEmotion === 'PREDATOR';

  return (
    <div className="flex-none z-40 pt-12 pb-3 px-5 flex items-center justify-between bg-transparent gap-2">
      {/* Left: Dual Streaks Capsules */}
      <div className="flex items-center gap-1.5">
        {/* Learn Streak Capsule */}
        <div 
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-black border bg-[#050508]/40 shadow-sm transition-all duration-300"
          style={{
            borderColor: learnStreak >= 3 ? '#CCFF00' : 'rgba(255,255,255,0.05)',
            boxShadow: learnStreak >= 3 ? '0 0 10px rgba(204,255,0,0.1)' : 'none',
            color: learnStreak >= 3 ? '#CCFF00' : '#8a8a9e',
          }}
        >
          <Brain className="w-3 h-3 flex-shrink-0" />
          <span className="font-mono text-xs leading-none">{learnStreak}</span>
        </div>

        {/* Tactical Streak Capsule */}
        <div 
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-black border bg-[#050508]/40 shadow-sm transition-all duration-300"
          style={{
            borderColor: tacticalStreak >= 3 ? '#60A5FA' : 'rgba(255,255,255,0.05)',
            boxShadow: tacticalStreak >= 3 ? '0 0 10px rgba(96,165,250,0.1)' : 'none',
            color: tacticalStreak >= 3 ? '#60A5FA' : '#8a8a9e',
          }}
        >
          <Zap className="w-3 h-3 flex-shrink-0" />
          <span className="font-mono text-xs leading-none">{tacticalStreak}</span>
        </div>
      </div>

      {/* Center: Predator Mode Status or Emotion Badge */}
      {isPredatorMode ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: [1, 1.05, 1], opacity: 1 }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-accent to-blue-500 text-black shadow-[0_0_20px_rgba(204,255,0,0.4)]"
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        >
          <Flame className="w-3 h-3 fill-black stroke-[3]" />
          <span>PREDATOR MODE</span>
        </motion.div>
      ) : t1gerEmotion === 'FERAL' ? (
        <motion.div
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-red-500/30 text-red-500 bg-red-500/5 shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse"
        >
          <Flame className="w-3 h-3" />
          <span>STREAK IN DANGER</span>
        </motion.div>
      ) : (
        <div className="text-[9px] font-black font-mono text-zinc-600 uppercase tracking-widest">
          {t1gerVisualConfig.statusLabel}
        </div>
      )}

      {/* Right: HP Bar representing Tactical completion */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full liquid-glass shadow-3d">
        <div className="w-14 h-1.5 bg-black/60 rounded-full shadow-inner overflow-hidden border border-white/5 relative">
          <motion.div
            className="h-full bg-[var(--accent-main)] rounded-full transition-all duration-300"
            initial={{ width: 0 }}
            animate={{ width: `${health}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ boxShadow: '0 0 10px var(--accent-glow)' }}
          />
        </div>
        <span className="text-[10px] font-black font-mono text-[var(--accent-main)] leading-none">{health}%</span>
      </div>
    </div>
  );
});

