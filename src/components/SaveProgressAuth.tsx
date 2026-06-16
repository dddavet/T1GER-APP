import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SaveProgressAuthProps {
  onSignIn: () => void;
  onSkip: () => void;
}

export const SaveProgressAuth: React.FC<SaveProgressAuthProps> = ({ onSignIn, onSkip }) => {
  const [showNativePrompt, setShowNativePrompt] = useState(false);

  // Simulating the native iOS popup delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowNativePrompt(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-8 mt-12 relative h-[50vh]">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-4 space-y-4"
      >
        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-tight text-white drop-shadow-md">
          Guarda tu arsenal
        </h2>
        <p className="text-sm font-medium text-zinc-400">
          Crea una cuenta para no perder tu progreso ni tu plan estratégico.
        </p>
      </motion.div>

      {/* Background visual to make it look like there's content behind the popup */}
      <div className="w-full max-w-sm mt-8 opacity-20 pointer-events-none">
        <div className="h-14 w-full rounded-[2rem] bg-white/10 mb-4" />
        <div className="h-14 w-full rounded-[2rem] bg-white/10" />
      </div>

      {/* Fake iOS Native Popup Overlay */}
      <AnimatePresence>
        {showNativePrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-8">
            <motion.div 
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#1c1c1e]/90 backdrop-blur-xl w-full max-w-[280px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col items-center"
            >
              <div className="p-5 text-center space-y-1">
                <h3 className="text-white font-semibold text-[17px] leading-tight tracking-tight">
                  "T1GER" Wants to Use "google.com" to Sign In
                </h3>
                <p className="text-zinc-400 text-[13px] leading-tight px-2">
                  This allows the app and website to share information about you.
                </p>
              </div>
              
              <div className="w-full flex border-t border-white/10">
                <button 
                  onClick={() => {
                    setShowNativePrompt(false);
                    // allow them to press the skip button
                  }}
                  className="flex-1 py-3 text-[#0A84FF] font-normal text-[17px] border-r border-white/10 active:bg-white/5"
                >
                  Cancel
                </button>
                <button 
                  onClick={onSignIn}
                  className="flex-1 py-3 text-[#0A84FF] font-semibold text-[17px] active:bg-white/5"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Skip button visible below the popup context */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-[-60px] text-center w-full"
      >
        <span className="text-zinc-500 font-medium text-sm mr-2">Would you like to sign in later?</span>
        <button onClick={onSkip} className="font-bold text-white underline underline-offset-4">Skip</button>
      </motion.div>
    </div>
  );
};
