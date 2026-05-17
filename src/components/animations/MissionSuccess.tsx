import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Trophy, Zap } from 'lucide-react';

export const MissionSuccess = ({ onComplete, xpAwarded }: { onComplete: () => void, xpAwarded: number }) => {
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContinue(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#CCFF00]/10 to-transparent pointer-events-none" />

      {/* Burst Particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#CCFF00] rounded-full"
          initial={{ x: 0, y: 0, scale: 0 }}
          animate={{
            x: (Math.random() - 0.5) * 800,
            y: (Math.random() - 0.5) * 800,
            scale: [0, 1.5, 0],
            rotate: Math.random() * 360
          }}
          transition={{ duration: 2, ease: "circOut" }}
        />
      ))}

      {/* Icon Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 12, stiffness: 200 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-[#CCFF00] blur-3xl opacity-20 animate-pulse" />
        <div className="w-32 h-32 rounded-full bg-[#CCFF00] flex items-center justify-center text-black shadow-[0_0_50px_rgba(204,255,0,0.3)]">
          <ShieldCheck className="w-16 h-16" strokeWidth={3} />
        </div>
      </motion.div>

      {/* Text Content */}
      <div className="text-center space-y-2 relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-[#CCFF00] font-black uppercase tracking-[0.3em] text-sm mb-2">Mission Verified</p>
          <h1 className="text-6xl font-black italic text-white tracking-tighter">PROOF ACCEPTED</h1>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-3 mt-4"
        >
          <div className="bg-white/10 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#CCFF00] fill-[#CCFF00]" />
            <span className="font-black text-xl text-[#CCFF00]">+{xpAwarded} XP</span>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-white" />
            <span className="font-black text-xl text-white">STREAK SAVED</span>
          </div>
        </motion.div>
      </div>

      {/* Continue Button */}
      <AnimatePresence>
        {showContinue && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onComplete}
            className="mt-16 px-12 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-[#CCFF00] transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            LFG
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
