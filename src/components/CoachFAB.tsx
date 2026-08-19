import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { useT1ger } from '../contexts/T1gerContext';
import { motion, AnimatePresence } from 'motion/react';

export const CoachFAB = React.memo(() => {
  const { setActiveView, activeView } = useT1ger();
  const [isHovered, setIsHovered] = React.useState(false);

  if (activeView === 'coach' || activeView === 'mission' || activeView === 'debrief' || activeView === 'learn') {
    return null;
  }

  return (
    <div className="absolute bottom-[calc(5.2rem+env(safe-area-inset-bottom))] right-4 z-40 pointer-events-none">
      <motion.button
        onClick={() => setActiveView('coach')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 380, damping: 20 }}
        className="pointer-events-auto relative flex h-13 w-13 items-center justify-center rounded-2xl bg-[var(--t1ger-orange)] text-[#102622] shadow-[0_4px_20px_rgba(255,115,0,0.4)] cursor-pointer"
        aria-label="Abrir Profesor T1GER AI"
      >
        {/* Glowing aura */}
        <div className="absolute inset-0 rounded-2xl bg-[#FFB700] opacity-40 blur-md animate-pulse" />

        {/* Floating sparkles badge */}
        <div className="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF4500] text-white shadow-sm">
          <Sparkles size={11} />
        </div>

        {/* Bot Icon */}
        <Bot size={26} className="relative z-10" />
      </motion.button>
    </div>
  );
});
