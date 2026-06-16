import React from 'react';
import { motion } from 'motion/react';

export const BarChartComparison: React.FC = () => {
  return (
    <div className="w-full bg-[#0a0a0c] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-center my-6">
      
      <div className="flex justify-center items-end gap-6 h-64 mt-4 px-4 relative z-10">
        {/* Left Bar (Without T1GER) */}
        <div className="flex flex-col items-center w-28">
          <motion.div 
            className="w-full bg-white/5 border border-white/10 rounded-t-[20px] relative flex items-end justify-center pb-5"
            initial={{ height: 0 }}
            animate={{ height: '35%' }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="text-xl font-black text-zinc-500">1X</span>
          </motion.div>
          <div className="mt-5 text-center bg-[#0a0a0c] relative z-20">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-tight block">Without<br/>T1GER</span>
          </div>
        </div>

        {/* Right Bar (With T1GER) */}
        <div className="flex flex-col items-center w-28">
          <motion.div 
            className="w-full bg-[#FF6B00] rounded-t-[20px] relative flex items-end justify-center pb-5 shadow-[0_0_30px_rgba(255,107,0,0.3)]"
            initial={{ height: 0 }}
            animate={{ height: '95%' }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          >
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-4xl font-black text-[#050505] tracking-tighter"
            >
              2.5X
            </motion.span>
          </motion.div>
          <div className="mt-5 text-center bg-[#0a0a0c] relative z-20">
            <span className="text-[10px] font-black text-white uppercase tracking-widest leading-tight block">With<br/>T1GER</span>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="mt-8 text-center"
      >
        <p className="text-sm font-semibold text-zinc-300 leading-relaxed px-2">
          T1GER holds you accountable and bypasses theory, making you <span className="text-[#FF6B00] font-black uppercase">lethal</span> much faster.
        </p>
      </motion.div>
    </div>
  );
};
