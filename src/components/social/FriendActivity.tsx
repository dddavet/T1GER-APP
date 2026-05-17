import React from 'react';
import { motion } from 'motion/react';
import { Users, Flame, Send } from 'lucide-react';

const MOCK_FRIENDS = [
  { id: 'f1', name: 'ALEX_CEO', avatar: '🦁', streak: 23, active: true },
  { id: 'f2', name: 'MAYA_OPS', avatar: '🐺', streak: 15, active: false },
  { id: 'f3', name: 'JACK_MKT', avatar: '🦊', streak: 7, active: true },
  { id: 'f4', name: 'SARA_BIZ', avatar: '🐆', streak: 4, active: true },
];

export const FriendActivity = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-blue-400" /> Active Predators
        </h3>
        <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">4 Online</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 hide-scrollbar snap-x">
        {MOCK_FRIENDS.map((friend, i) => (
          <motion.div
            key={friend.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex-shrink-0 w-32 liquid-glass rounded-[2rem] p-4 flex flex-col items-center gap-3 border-white/5 snap-center relative group"
          >
            {/* Status Indicator */}
            {friend.active && (
              <div className="absolute top-3 right-3 w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_var(--accent-glow)]" />
            )}

            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-2xl shadow-3d group-hover:scale-105 transition-transform">
              {friend.avatar}
            </div>

            {/* Name + Streak */}
            <div className="text-center">
              <p className="text-[10px] font-black uppercase text-zinc-300 truncate w-24">{friend.name}</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Flame className="w-2.5 h-2.5 text-orange-500" />
                <span className="text-[9px] font-black text-zinc-600">{friend.streak}D</span>
              </div>
            </div>

            {/* Nudge/Roar Button */}
            <button className="w-full py-2 rounded-xl bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-all active:scale-95 flex items-center justify-center gap-1.5">
              <Send className="w-2.5 h-2.5 text-accent" />
              <span className="text-[8px] font-black text-accent uppercase tracking-tighter">Roar</span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
