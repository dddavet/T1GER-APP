import React from 'react';
import { BrainCircuit, Sparkles } from 'lucide-react';
import { useT1ger } from '../contexts/T1gerContext';
import { motion, AnimatePresence } from 'motion/react';

export const CoachFAB = React.memo(() => {
  const { setActiveView, activeView } = useT1ger();
  const [isHovered, setIsHovered] = React.useState(false);

  if (activeView === 'coach') return null;

  return (
    <div className="flex justify-end px-5 -mt-3 mb-2 pointer-events-none">
      <motion.button
        onClick={() => setActiveView('coach')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        whileHover={{ scale: 1.08, rotate: 0 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        className="pointer-events-auto relative w-14 h-14 rounded-[1.75rem] flex items-center justify-center text-white shadow-3d-strong overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #FF8C33 0%, #FF6B00 50%, #FF4500 100%)',
        }}
      >
        {/* Animated glow ring */}
        <motion.div
          className="absolute inset-0 rounded-[1.75rem]"
          animate={{
            boxShadow: isHovered
              ? '0 0 40px rgba(255, 107, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.3)'
              : '0 0 24px rgba(255, 107, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          animate={{ x: isHovered ? ['100%', '-100%'] : '100%' }}
          transition={{ duration: isHovered ? 0.6 : 1.5, repeat: isHovered ? 0 : Infinity }}
        />

        {/* Icon with subtle pulse */}
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
          className="relative z-10"
        >
          <BrainCircuit className="w-7 h-7" strokeWidth={2} />
        </motion.div>

        {/* Sparkle indicator */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-4 h-4 text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
});
