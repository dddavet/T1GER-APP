import React from 'react';
import { motion } from 'motion/react';
import { Target, Clock, Zap, Users } from 'lucide-react';

// ============================================================
// MOCK DATA — Replace with Firestore when going live
// ============================================================
const MOCK_QUEST = {
  title: 'DOUBLE HUNTERS',
  description: 'Both complete 5 missions this week',
  partner: { name: 'ALEX_CEO', avatar: '🦁' },
  yourProgress: 3,
  partnerProgress: 4,
  goal: 5,
  reward: 500,
  daysLeft: 3,
};

export const PackQuest = () => {
  const quest = MOCK_QUEST;
  const totalProgress = quest.yourProgress + quest.partnerProgress;
  const totalGoal = quest.goal * 2;
  const progressPct = Math.min(100, Math.round((totalProgress / totalGoal) * 100));
  const yourPct = Math.round((quest.yourProgress / quest.goal) * 100);
  const partnerPct = Math.round((quest.partnerProgress / quest.goal) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-purple-400" /> Pack Quest
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-700 uppercase tracking-widest">
          <Clock className="w-3 h-3" /> {quest.daysLeft}D Left
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="liquid-glass border-white/10 rounded-[2.5rem] p-6 space-y-6 shadow-3d"
      >
        {/* Quest header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-black text-lg italic uppercase tracking-tighter text-white">{quest.title}</h4>
            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-tight">{quest.description}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full shadow-3d">
            <Zap className="w-3 h-3 text-purple-400" strokeWidth={3} />
            <span className="text-[9px] font-black text-purple-400 uppercase">+{quest.reward} XP</span>
          </div>
        </div>

        {/* Combined progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Global Progress</span>
            <span className="text-[10px] font-black text-accent drop-shadow-[0_0_8px_var(--accent-glow)]">{totalProgress}/{totalGoal}</span>
          </div>
          <div className="h-4 liquid-glass rounded-full p-1 border-white/5 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-accent rounded-full shadow-3d"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Individual progress bars */}
        <div className="grid grid-cols-2 gap-4">
          {/* You */}
          <div className="liquid-glass-heavy rounded-[1.5rem] p-4 border-white/5 shadow-inner">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm shadow-3d-accent border border-accent/20">🐅</div>
              <span className="text-[9px] font-black uppercase text-zinc-400">You</span>
            </div>
            <div className="h-1.5 bg-black/40 rounded-full overflow-hidden mb-2 border border-white/5">
              <motion.div
                className="h-full bg-accent rounded-full shadow-accent"
                initial={{ width: 0 }}
                animate={{ width: `${yourPct}%` }}
                transition={{ delay: 0.3, duration: 0.8 }}
              />
            </div>
            <span className="text-[9px] font-mono font-bold text-zinc-600">{quest.yourProgress}/{quest.goal}</span>
          </div>

          {/* Partner */}
          <div className="liquid-glass-heavy rounded-[1.5rem] p-4 border-white/5 shadow-inner">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-sm shadow-3d border border-white/10">{quest.partner.avatar}</div>
              <span className="text-[9px] font-black uppercase text-zinc-400 truncate">{quest.partner.name}</span>
            </div>
            <div className="h-1.5 bg-black/40 rounded-full overflow-hidden mb-2 border border-white/5">
              <motion.div
                className="h-full bg-accent rounded-full shadow-accent"
                initial={{ width: 0 }}
                animate={{ width: `${partnerPct}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </div>
            <span className="text-[9px] font-mono font-bold text-zinc-600">{quest.partnerProgress}/{quest.goal}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
