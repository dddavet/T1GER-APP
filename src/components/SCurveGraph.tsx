import React from 'react';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';

export const SCurveGraph: React.FC = () => {
  return (
    <div className="w-full bg-[#0a0a0c] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-center">
      
      <div className="relative w-full h-48 mt-4">
        <svg viewBox="0 0 300 150" className="w-full h-full overflow-visible">
          {/* Grid lines */}
          <line x1="0" y1="30" x2="300" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="90" x2="300" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />

          {/* S-Curve Path */}
          <motion.path
            d="M 10 120 C 60 120, 100 115, 150 90 C 200 60, 250 30, 290 30"
            fill="none"
            stroke="#FF6B00"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{ filter: 'drop-shadow(0px 0px 8px rgba(255, 107, 0, 0.4))' }}
          />

          {/* Area fill */}
          <motion.path
            d="M 10 120 C 60 120, 100 115, 150 90 C 200 60, 250 30, 290 30 L 290 150 L 10 150 Z"
            fill="url(#sCurveGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />

          <defs>
            <linearGradient id="sCurveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255, 107, 0, 0.2)" />
              <stop offset="100%" stopColor="rgba(255, 107, 0, 0)" />
            </linearGradient>
          </defs>

          {/* Nodes */}
          <motion.circle cx="10" cy="120" r="5" fill="#0a0a0c" stroke="#ffffff" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} />
          <motion.circle cx="100" cy="115" r="5" fill="#0a0a0c" stroke="#ffffff" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} />
          <motion.circle cx="150" cy="90" r="5" fill="#0a0a0c" stroke="#ffffff" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }} />
          
          <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5, type: 'spring' }} transform="translate(290,30)">
            <circle cx="0" cy="0" r="12" fill="#FF6B00" />
            <Trophy x="-6" y="-6" width="12" height="12" color="#000" />
          </motion.g>
        </svg>
      </div>

      <div className="flex justify-between items-center mt-3 px-2 relative">
        <span className="text-[10px] font-mono text-zinc-600 uppercase font-black absolute left-0">3 Days</span>
        <span className="text-[10px] font-mono text-zinc-600 uppercase font-black absolute left-[30%]">7 Days</span>
        <span className="text-[10px] font-mono text-[#FF6B00] uppercase font-black absolute right-0">30 Days</span>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0 }}
        className="mt-10 p-5 rounded-2xl bg-white/[0.02] border border-white/5"
      >
        <p className="text-center text-xs font-medium text-zinc-300 leading-relaxed">
          Based on T1GER's data, the "click" happens at <span className="text-[#FF6B00] font-black uppercase tracking-wide">Day 7</span>. Once you cross it, compound growth takes over.
        </p>
      </motion.div>
    </div>
  );
};
