import React from 'react';
import { motion } from 'motion/react';

export const ExponentialGraph: React.FC = () => {
  return (
    <div className="w-full bg-[#0a0a0c] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-center my-auto">
      <div className="mb-6">
        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
          T1GER creates <br/> <span className="text-[#FF6B00]">Apex Predators</span>
        </h3>
      </div>
      
      <div className="relative w-full h-48 mt-4">
        <svg viewBox="0 0 300 150" className="w-full h-full overflow-visible">
          {/* Grid lines */}
          <line x1="0" y1="25" x2="300" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="75" x2="300" y2="75" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="125" x2="300" y2="125" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />

          {/* Traditional Education Path */}
          <motion.path
            d="M 10 75 C 100 75, 200 85, 290 90"
            fill="none"
            stroke="#52525b"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* T1GER Path */}
          <motion.path
            d="M 10 75 C 150 75, 200 10, 290 5"
            fill="none"
            stroke="#FF6B00"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeIn", delay: 0.5 }}
            style={{ filter: 'drop-shadow(0px 0px 8px rgba(255, 107, 0, 0.5))' }}
          />

          {/* Data Points */}
          <motion.circle 
            cx="10" cy="75" r="4" fill="#ffffff" 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
          />
          <motion.circle 
            cx="290" cy="90" r="4" fill="#52525b" 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 }}
          />
          <motion.circle 
            cx="290" cy="5" r="6" fill="#FF6B00" 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.0 }}
            style={{ filter: 'drop-shadow(0px 0px 4px rgba(255, 107, 0, 1))' }}
          />
        </svg>

        {/* Labels */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute right-0 top-[90px] -translate-y-1/2 text-[9px] font-bold text-zinc-500 uppercase tracking-wide bg-[#0a0a0c] px-1"
        >
          Traditional
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.0 }}
          className="absolute right-0 -top-[5px] -translate-y-1/2 text-[9px] font-black text-[#FF6B00] uppercase tracking-wider flex items-center gap-1 bg-[#FF6B00]/10 px-2 py-0.5 rounded-full border border-[#FF6B00]/30 shadow-[0_0_10px_rgba(255,107,0,0.2)]"
        >
          T1GER System
        </motion.div>
      </div>

      <div className="flex justify-between items-center mt-3 px-2">
        <span className="text-[10px] font-mono text-zinc-600 uppercase font-black">Month 1</span>
        <span className="text-[10px] font-mono text-zinc-600 uppercase font-black">Month 6</span>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5 }}
        className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5"
      >
        <p className="text-center text-xs font-semibold text-zinc-300 leading-relaxed">
          <span className="text-[#FF6B00] font-black text-sm">85%</span> of T1GER users build a high-income skill in their first 30 days.
        </p>
      </motion.div>
    </div>
  );
};
