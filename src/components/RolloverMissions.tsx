import React from 'react';
import { motion } from 'motion/react';
import { RefreshCcw, History } from 'lucide-react';

export const RolloverMissions: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center space-y-10 mt-8 relative z-10">
      
      {/* Title */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-2 space-y-4"
      >
        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-tight text-white drop-shadow-md">
          ¿Acumular Misiones no completadas?
        </h2>
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 border border-white/20">
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Rollover hasta</span>
          <span className="text-[10px] font-black text-[#FF6B00]">3 MISIONES</span>
        </div>
      </motion.div>

      {/* Visual Cards */}
      <div className="relative w-full h-56 flex justify-center items-center mt-4">
        
        {/* Yesterday Card */}
        <motion.div 
          initial={{ x: -20, opacity: 0, rotate: -5 }}
          animate={{ x: -40, opacity: 1, rotate: -5 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="absolute bg-white/5 border border-white/10 rounded-3xl p-5 w-36 shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center gap-2 mb-2">
            <History size={12} className="text-red-400" />
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Ayer</span>
          </div>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-black text-white">0</span>
            <span className="text-sm font-bold text-zinc-500">/3</span>
          </div>
          
          <div className="relative w-12 h-12">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-black bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md">-3 left</span>
            </div>
          </div>
        </motion.div>

        {/* Today Card */}
        <motion.div 
          initial={{ x: 20, opacity: 0, rotate: 5 }}
          animate={{ x: 40, opacity: 1, rotate: 5 }}
          transition={{ delay: 0.6, type: 'spring' }}
          className="absolute bg-[#1a1a1c] border border-white/10 rounded-3xl p-5 w-40 shadow-2xl z-10"
        >
          <div className="flex items-center gap-2 mb-2">
            <RefreshCcw size={12} className="text-white" />
            <span className="text-[9px] font-bold text-white uppercase tracking-widest">Hoy</span>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl font-black text-white">0</span>
            <span className="text-sm font-bold text-zinc-500">/6</span>
          </div>
          
          <div className="flex items-center gap-1 mb-4">
            <History size={10} className="text-[#FF6B00]" />
            <span className="text-[10px] font-bold text-[#FF6B00]">+3 Acumuladas</span>
          </div>

          <div className="relative w-12 h-12">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-black bg-white/10 text-white px-2 py-0.5 rounded-md">6 left</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
