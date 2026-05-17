import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Mock user data for the leaderboard
const generateMockUsers = () => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    name: `Hunter ${i + 1}`,
    xp: Math.floor(Math.random() * 10000),
    rank: i + 1,
  })).sort((a, b) => b.xp - a.xp);
};

const LEAGUE_TIERS = [
  { name: 'Stray', color: 'text-zinc-500' },
  { name: 'Cub', color: 'text-amber-700' },
  { name: 'Hunter', color: 'text-zinc-300' },
  { name: 'Apex', color: 'text-yellow-500' },
  { name: 'Predator', color: 'text-[#CCFF00]' },
];

export const PrideLeagues = () => {
  const [users, setUsers] = useState(generateMockUsers());

  // Simulate XP changes for animation
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers(prev => {
        const next = [...prev];
        const idx = Math.floor(Math.random() * 50);
        next[idx].xp += Math.floor(Math.random() * 100);
        return next.sort((a, b) => b.xp - a.xp).map((u, i) => ({ ...u, rank: i + 1 }));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#050505] text-white p-8 rounded-3xl border border-white/5 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black italic text-[#CCFF00]">PREDATOR LEAGUE</h2>
        <div className="font-mono text-xl text-[#FF6B00]">
          LEAGUE ENDS IN: 2D 14H 32M
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {users.map((user, index) => {
            const isPromotion = index < 5;
            const isDemotion = index >= 40;
            
            return (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-center gap-4 p-4 rounded-xl border backdrop-blur-md ${
                  isPromotion 
                    ? 'border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.3)]' 
                    : isDemotion 
                      ? 'border-[#FF6B00] animate-pulse' 
                      : 'border-white/5 bg-white/5'
                }`}
              >
                <span className="font-mono text-lg w-8">{user.rank}</span>
                <div className={`text-4xl ${isDemotion ? 'animate-pulse' : ''}`}>
                  {isDemotion ? '🤕' : '🐅'}
                </div>
                <span className="font-bold text-lg flex-grow">{user.name}</span>
                <span className="font-mono text-[#CCFF00]">{user.xp} XP</span>
                
                {isPromotion && <span className="text-[10px] font-bold text-[#CCFF00]">PROMOTION ZONE</span>}
                {isDemotion && <span className="text-[10px] font-bold text-[#FF6B00]">DEMOTION ZONE</span>}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
