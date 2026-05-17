import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const ApexEvolution = ({ onComplete }: { onComplete: () => void }) => {
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContinue(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Acid Green Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-accent rounded-full"
          initial={{ x: 0, y: 0, scale: 0 }}
          animate={{
            x: (Math.random() - 0.5) * 500,
            y: (Math.random() - 0.5) * 500,
            scale: [0, 1, 0],
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      ))}

      {/* Tiger Avatar */}
      <motion.div
        className="text-9xl mb-8"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
      >
        🐅
      </motion.div>

      {/* Brutalist Text */}
      <motion.h1
        className="text-6xl font-black italic text-accent tracking-tighter"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        RANK UP: APEX PREDATOR
      </motion.h1>

      {/* Continue Button */}
      <AnimatePresence>
        {showContinue && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onComplete}
            className="mt-12 px-8 py-4 bg-accent text-[#050505] font-bold rounded-xl hover:bg-accent/90"
          >
            CONTINUE
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
