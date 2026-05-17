import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, AlertTriangle, Plus, Zap, User } from 'lucide-react';

interface SquadMember {
  id: string;
  name: string;
  status: 'completed' | 'pending';
  avatar: string;
}

export const SquadRoom = () => {
  const [members] = useState<SquadMember[]>([
    { id: '1', name: 'GHOST_99', status: 'completed', avatar: '👻' },
    { id: '2', name: 'VIPER_01', status: 'pending', avatar: '🐍' },
    { id: '3', name: 'SHADOW_X', status: 'pending', avatar: '👤' },
  ]);
  const [alert, setAlert] = useState<string | null>(null);

  const haptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const triggerRoar = (name: string) => {
    haptic();
    setAlert(`[ TACTICAL ALERT SENT TO ${name} ]`);
    setTimeout(() => setAlert(null), 3000);
  };

  const squadHealth = members.every(m => m.status === 'completed') ? 100 : 45;

  return (
    <div className="w-full space-y-10">
      <header className="space-y-4 pt-4">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">SQUAD <span className="text-accent">COMMAND</span></h1>
        
        <div className="liquid-glass-heavy rounded-full p-1.5 shadow-3d border-white/10">
          <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <motion.div 
              className={`h-full ${squadHealth > 50 ? 'bg-accent shadow-3d-accent' : 'bg-[#FF0000]'}`}
              initial={{ width: 0 }}
              animate={{ width: `${squadHealth}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between px-2">
          <p className={`font-mono text-[9px] font-black tracking-[0.2em] uppercase ${squadHealth > 50 ? 'text-accent' : 'text-[#FF0000] animate-pulse'}`}>
            {squadHealth > 50 ? '[ ALL SYSTEMS NOMINAL ]' : '[ INTEGRITY COMPROMISED ]'}
          </p>
          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{squadHealth}% Operational</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {members.map((member) => (
          <motion.div 
            key={member.id}
            className="liquid-glass p-5 rounded-[2rem] border-white/10 shadow-3d flex items-center justify-between group"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[1.5rem] bg-zinc-900 flex items-center justify-center text-2xl shadow-inner border border-white/5">{member.avatar}</div>
              <div className="flex flex-col">
                <span className="font-black text-sm uppercase tracking-tight">{member.name}</span>
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-0.5">Tactical Operative</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {member.status === 'completed' ? (
                <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-3d-accent">
                  <ShieldCheck size={18} />
                </div>
              ) : (
                <button 
                  onClick={() => triggerRoar(member.name)}
                  className="px-5 py-2.5 bg-white/5 text-zinc-400 rounded-full border border-white/10 font-black text-[9px] uppercase tracking-widest hover:bg-accent hover:text-black hover:border-accent transition-all shadow-3d group-active:scale-95"
                >
                  SEND ROAR
                </button>
              )}
            </div>
          </motion.div>
        ))}
        
        <button className="py-8 liquid-glass-heavy rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-accent/40 hover:text-accent hover:border-accent/40 transition-all shadow-3d active:scale-95">
          <Plus size={24} />
          <span className="font-black text-[10px] uppercase tracking-[0.2em]">Recruit Predator</span>
        </button>
      </div>

      <AnimatePresence>
        {alert && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-28 left-6 right-6 liquid-glass-accent text-accent p-4 rounded-2xl border-accent/30 shadow-3d-accent font-mono text-[10px] font-black text-center z-[100] uppercase tracking-widest"
          >
            {alert}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
