import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Check, Clock, Send, AlertTriangle } from 'lucide-react';

// ============================================================
// MOCK DATA — Replace with Firestore queries when going live
// ============================================================
interface HuntFriend {
  id: string;
  name: string;
  avatar: string;
  sharedStreak: number;
  completedToday: boolean;
  lastActive: string; // relative time
}

const MOCK_FRIENDS: HuntFriend[] = [
  { id: 'f1', name: 'ALEX_CEO', avatar: '🦁', sharedStreak: 12, completedToday: true, lastActive: '2h ago' },
  { id: 'f2', name: 'MAYA_OPS', avatar: '🐺', sharedStreak: 7, completedToday: false, lastActive: '18h ago' },
  { id: 'f3', name: 'JACK_MKT', avatar: '🦊', sharedStreak: 3, completedToday: false, lastActive: '5h ago' },
];

export const HuntStreaks = () => {
  const [roared, setRoared] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState<string | null>(null);

  const haptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const sendRoar = (friend: HuntFriend) => {
    haptic();
    setRoared(prev => new Set(prev).add(friend.id));
    setShowToast(`[ ROAR SENT TO ${friend.name} ]`);
    setTimeout(() => setShowToast(null), 2500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 text-accent" /> Hunt Streaks
        </h3>
        <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">
          {MOCK_FRIENDS.length} ACTIVE
        </span>
      </div>

      <div className="space-y-3">
        {MOCK_FRIENDS.map((friend, i) => (
          <motion.div
            key={friend.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-4 liquid-glass border-white/10 rounded-[2rem] p-4 shadow-3d"
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-[1.2rem] bg-black/40 flex items-center justify-center text-xl flex-shrink-0 shadow-inner border border-white/5">
              {friend.avatar}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight uppercase truncate text-white">{friend.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Flame className="w-3 h-3 text-accent" />
                <span className="text-[11px] font-black text-accent">{friend.sharedStreak} DAYS</span>
                <span className="text-[10px] text-zinc-700">•</span>
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{friend.lastActive}</span>
              </div>
            </div>

            {/* Status / Action */}
            {friend.completedToday ? (
              <div className="flex items-center gap-1.5 liquid-glass-accent border-accent/20 px-3 py-2 rounded-full shadow-3d-accent">
                <Check className="w-3.5 h-3.5 text-accent" strokeWidth={3} />
                <span className="text-[9px] font-black uppercase text-accent">Active</span>
              </div>
            ) : roared.has(friend.id) ? (
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-2 rounded-full">
                <span className="text-[9px] font-black uppercase text-zinc-600">Signal Sent</span>
              </div>
            ) : (
              <button
                onClick={() => sendRoar(friend)}
                className="flex items-center gap-1.5 bg-white text-black px-4 py-2.5 rounded-full active:scale-95 transition-all shadow-3d"
              >
                <Send className="w-3 h-3" strokeWidth={3} />
                <span className="text-[9px] font-black uppercase">Roar</span>
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-28 left-6 right-6 liquid-glass-accent text-accent p-4 rounded-2xl border-accent/30 shadow-3d-accent font-mono text-[10px] font-black text-center z-[100] uppercase tracking-widest"
          >
            {showToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
