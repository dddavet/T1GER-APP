import React from 'react';
import { motion } from 'motion/react';
import { Shield, Trophy, ChevronRight, Sparkles } from 'lucide-react';

const LEAGUES = [
  { id: 'bronze', name: 'The Wilds', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  { id: 'silver', name: 'The Hunt', color: 'text-zinc-300', bg: 'bg-zinc-300/10', border: 'border-zinc-300/20' },
  { id: 'gold', name: 'Apex Pride', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
];

export const LeagueHeader = () => {
  const currentLeague = LEAGUES[2]; // Mocking Apex Pride

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="liquid-glass rounded-[2rem] p-5 shadow-3d border-white/5 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${currentLeague.bg}`} />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${currentLeague.bg} border ${currentLeague.border} flex items-center justify-center shadow-3d`}>
            <Trophy className={`w-8 h-8 ${currentLeague.color} drop-shadow-lg`} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${currentLeague.color}`}>Current League</span>
              <Sparkles className="w-3 h-3 text-accent animate-pulse" />
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
              {currentLeague.name}
            </h2>
          </div>
        </div>
        
        <button className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center border-white/10 hover:bg-white/5 transition-colors">
          <ChevronRight className="w-5 h-5 text-zinc-500" />
        </button>
      </div>

      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent-glow)] animate-pulse" />
          <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Promotion Zone</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-black text-white">#1</span>
          <span className="text-[9px] font-bold text-zinc-600 uppercase">of 30 predators</span>
        </div>
      </div>
    </motion.div>
  );
};
