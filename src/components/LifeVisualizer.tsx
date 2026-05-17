import React from 'react';
import { motion } from 'motion/react';

export const LifeVisualizer = ({ livedMonths, totalMonths = 960 }: { livedMonths: number, totalMonths?: number }) => {
  return (
    <div className="glass p-6 rounded-3xl border border-white/5">
      <h3 className="text-lg font-black italic mb-4 text-zinc-400">LIFE VISUALIZER</h3>
      <div className="grid grid-cols-20 gap-1">
        {Array.from({ length: totalMonths }).map((_, i) => (
          <motion.div
            key={i}
            layout
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: i < livedMonths ? 1 : [0.5, 1, 0.5],
              scale: 1,
            }}
            transition={i < livedMonths 
              ? { delay: i * 0.0005, duration: 0.5 } 
              : { repeat: Infinity, duration: 3, ease: "easeInOut" }
            }
            className={`w-2 h-2 rounded-full ${
              i < livedMonths 
                ? 'bg-[#FF6B00] shadow-[0_0_8px_rgba(255,107,0,0.6)]' 
                : 'bg-zinc-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
