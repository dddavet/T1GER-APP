import React from 'react';
import { motion } from 'motion/react';
import { ACHIEVEMENTS } from '../services/achievements';
import { Award, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AchievementsWall: React.FC = () => {
  const { appUser } = useAuth();
  const unlocked = appUser?.unlockedAchievements || [];

  return (
    <div className="w-full mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Award className="text-yellow-500 w-5 h-5" />
        <h3 className="text-sm font-black uppercase tracking-widest text-white">Muro de Trofeos</h3>
        <span className="ml-auto text-xs font-mono text-zinc-500">
          {unlocked.length} / {ACHIEVEMENTS.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((ach, i) => {
          const isUnlocked = unlocked.includes(ach.id);
          
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative overflow-hidden rounded-2xl p-3 border transition-all ${
                isUnlocked 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-black/40 border-white/[0.03] grayscale opacity-60'
              }`}
            >
              {isUnlocked && (
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${ach.color} opacity-20 blur-2xl rounded-full -mr-8 -mt-8 pointer-events-none`} />
              )}
              
              <div className="flex flex-col h-full gap-2 relative z-10">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner ${
                    isUnlocked ? 'bg-white/10' : 'bg-white/5'
                  }`}>
                    {isUnlocked ? ach.icon : <Lock size={16} className="text-zinc-600" />}
                  </div>
                </div>
                
                <div className="mt-1">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-white mb-0.5">{ach.name}</h4>
                  <p className="text-[9px] text-zinc-400 leading-tight">{ach.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
