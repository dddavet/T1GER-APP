import React from 'react';
import { motion } from 'motion/react';

export const CubAvatar = () => (
  <motion.div 
    animate={{ y: [0, -10, 0] }} 
    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
    className="fixed bottom-24 right-6 z-30"
  >
    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#CCFF00] flex items-center justify-center text-4xl shadow-lg border-2 border-white/20">🐅</div>
  </motion.div>
);
