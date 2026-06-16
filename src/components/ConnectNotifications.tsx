import React from 'react';
import { motion } from 'motion/react';
import { Bell, Smartphone, CheckCircle2 } from 'lucide-react';

export const ConnectNotifications: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center mt-12 space-y-10">
      
      {/* Node Graphic */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative w-full max-w-[280px] h-48 flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-[#FF6B00]/10 rounded-full blur-[80px] pointer-events-none" />
        
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 192">
          {/* Paths connecting nodes */}
          <motion.path 
            d="M 80 96 Q 140 96 140 140"
            fill="none" 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <motion.path 
            d="M 140 140 L 140 96 Q 140 52 200 52"
            fill="none" 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          />
        </svg>

        {/* Floating elements */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="absolute top-8 left-4 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 shadow-lg text-[10px] font-bold tracking-wider uppercase text-zinc-300"
        >
          Daily Missions
        </motion.div>

        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="absolute bottom-12 left-10 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 shadow-lg text-[10px] font-bold tracking-wider uppercase text-zinc-300"
        >
          Streaks
        </motion.div>

        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
          className="absolute top-1/2 left-8 -translate-y-1/2 w-14 h-14 bg-white rounded-3xl flex items-center justify-center shadow-[0_10px_30px_rgba(255,255,255,0.2)] z-10"
        >
          <Bell className="text-black" size={28} />
        </motion.div>

        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: 'spring' }}
          className="absolute top-4 right-10 w-20 h-20 bg-[#050505] border-[3px] border-zinc-800 rounded-3xl flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-10"
        >
          <Smartphone className="text-white" size={36} strokeWidth={1.5} />
        </motion.div>

        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.5, type: 'spring' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#050505] rounded-full flex items-center justify-center z-20"
        >
          <CheckCircle2 className="text-[#FF6B00]" size={20} />
        </motion.div>

      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="text-center space-y-4 px-2"
      >
        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-tight text-white drop-shadow-md">
          Activar <br/>Notificaciones
        </h2>
        <p className="text-sm font-medium text-zinc-400 leading-relaxed max-w-xs mx-auto">
          Recibe recordatorios diarios para tus misiones y protege tu racha de aprendizaje. T1GER solo te contactará cuando sea estrictamente necesario.
        </p>
      </motion.div>
    </div>
  );
};
