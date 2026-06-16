import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

export const PaywallIntro: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center space-y-8 mt-4">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-4 space-y-2"
      >
        <span className="text-zinc-500 font-medium text-xs uppercase tracking-widest">T1GER PRO</span>
        <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter uppercase leading-tight text-white drop-shadow-md">
          Desbloquea T1GER para lograrlo más rápido.
        </h2>
      </motion.div>

      {/* App Mockup UI */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', damping: 20 }}
        className="relative w-full max-w-[280px] h-[340px] bg-[#0A0A0C] border-[6px] border-[#222] rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#222] rounded-b-2xl z-20" />
        
        {/* Inside Mockup */}
        <div className="absolute inset-0 p-4 pt-8 flex flex-col space-y-4 bg-gradient-to-b from-[#0A0A0C] to-[#141416]">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
               <span className="text-black font-black text-[10px] italic">T1</span>
            </div>
            <span className="text-white font-bold text-sm tracking-tight">T1GER APP</span>
          </div>

          <div className="flex gap-4 border-b border-white/10 pb-2">
            <span className="text-white font-bold text-xs">Hoy</span>
            <span className="text-zinc-500 font-medium text-xs">Ayer</span>
          </div>

          {/* Big Card */}
          <div className="bg-white p-4 rounded-2xl relative overflow-hidden shadow-md">
            <span className="text-3xl font-black tracking-tighter text-black leading-none block mb-1">500</span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase">XP Restante</span>
            
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
               <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f1f1" strokeWidth="4" />
                <path strokeDasharray="60, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Mini Cards */}
          <div className="grid grid-cols-3 gap-2">
             <div className="bg-white rounded-xl h-24 p-2 flex flex-col">
               <span className="text-xs font-black text-black">15m</span>
               <span className="text-[8px] text-zinc-500 font-semibold leading-tight mt-0.5">Tiempo<br/>restante</span>
               <div className="mt-auto flex justify-center">
                 <div className="w-6 h-6 rounded-full border-2 border-[#f1f1f1] border-t-[#FF6B00]" />
               </div>
             </div>
             <div className="bg-white rounded-xl h-24 p-2 flex flex-col">
               <span className="text-xs font-black text-black">3</span>
               <span className="text-[8px] text-zinc-500 font-semibold leading-tight mt-0.5">Misiones<br/>diarias</span>
               <div className="mt-auto flex justify-center">
                 <div className="w-6 h-6 rounded-full border-2 border-[#f1f1f1] border-t-[#3b82f6]" />
               </div>
             </div>
             <div className="bg-white rounded-xl h-24 p-2 flex flex-col">
               <span className="text-xs font-black text-black">1</span>
               <span className="text-[8px] text-zinc-500 font-semibold leading-tight mt-0.5">Racha<br/>activa</span>
               <div className="mt-auto flex justify-center">
                 <div className="w-6 h-6 rounded-full border-2 border-[#f1f1f1] border-t-[#ef4444]" />
               </div>
             </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-2"
      >
        <Check size={20} className="text-white" />
        <span className="text-white font-bold text-[15px]">No Payment Due Now</span>
      </motion.div>

    </div>
  );
};
