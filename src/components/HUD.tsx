import React from 'react';
import { useT1ger } from '../contexts/T1gerContext';
import { Flame, Coins } from 'lucide-react';
import { motion } from 'motion/react';
import { useBrain } from '../contexts/BrainContext';

export const HUD = React.memo(() => {
  const { stats } = useT1ger();
  const { dailyTacticalStatus } = useBrain();

  const totalTasks = (dailyTacticalStatus.committedHabitIds?.length || 0) +
                     (dailyTacticalStatus.committedWorkIds?.length || 0) +
                     (dailyTacticalStatus.committedLessonIds?.length || 0);
  const completedTasks = dailyTacticalStatus.completedIds?.length || 0;

  const health = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
  const isHighStreak = stats.streak >= 5;

  return (
    <div className="flex-none z-40 pt-12 pb-3 px-5 flex items-center justify-between bg-transparent">
      {/* Left: Streak */}
      <motion.div
        className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold shadow-3d transition-all duration-300 ${
          isHighStreak
            ? 'liquid-glass-accent text-accent'
            : 'liquid-glass text-zinc-300'
        }`}
        animate={isHighStreak ? { scale: [1, 1.04, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      >
        <Flame className={`w-4 h-4 ${isHighStreak ? 'fill-accent' : ''}`} />
        <span className="font-mono text-sm">{stats.streak}</span>
      </motion.div>

      {/* Center: HP Bar */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-full liquid-glass shadow-3d">
        <div className="w-20 h-2 bg-black/60 rounded-full shadow-inner overflow-hidden border border-white/5">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${health}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ boxShadow: '0 0 12px var(--accent-glow)' }}
          />
        </div>
        <span className="text-xs font-mono text-accent font-black">{health}%</span>
      </div>

    </div>
  );
});
