import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const StreakShatter = ({ onComplete }: { onComplete: () => void }) => {
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContinue(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]"
      initial={{ x: 0, y: 0 }}
      animate={{ x: [-5, 5, -5, 5, 0], y: [-5, 5, -5, 5, 0] }}
      transition={{ duration: 0.5, repeat: 2 }}
    >
      {/* Shatter Effect */}
      <motion.div
        className="absolute inset-0 bg-[#FF6B00]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0, filter: 'grayscale(100%)' }}
        transition={{ duration: 2.5 }}
      />

      {/* Text */}
      <motion.h1
        className="text-4xl font-mono text-white z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {"STREAK BROKEN. YOU STOPPED HUNTING."}
      </motion.h1>

      {/* Continue Button */}
      <AnimatePresence>
        {showContinue && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onComplete}
            className="mt-12 px-8 py-4 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 z-10"
          >
            CONTINUE
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
