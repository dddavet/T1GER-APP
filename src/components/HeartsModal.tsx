import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Clock, Infinity } from 'lucide-react';

interface HeartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  energy: number;
}

export const HeartsModal: React.FC<HeartsModalProps> = ({ isOpen, onClose, energy }) => {
  const maxHearts = 5;
  const isFull = energy >= maxHearts;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] bg-white rounded-t-3xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-zinc-800">Hearts</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center bg-zinc-100 text-zinc-500 hover:bg-zinc-200 rounded-full transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 pb-10 flex flex-col items-center">
              
              {/* Big Heart Display */}
              <div className="mb-6 flex flex-col items-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-24 h-24 mb-2 drop-shadow-md">
                  <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="#FF4B4B" />
                </svg>
                <div className="text-3xl font-black text-[#FF4B4B]">
                  {energy}
                </div>
                <div className="text-xs font-black text-zinc-400 uppercase tracking-widest mt-1">
                  {isFull ? "Full" : "Next heart in 3:45"}
                </div>
              </div>

              <div className="w-full space-y-3">
                {/* Practice Button */}
                <button 
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl bg-white border-2 border-zinc-200 text-[#1CB0F6] font-black text-[15px] uppercase tracking-widest active:translate-y-[2px] transition-all flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5 stroke-[2.5]" /> Practice to Earn Hearts
                </button>

                {/* Refill Button */}
                {!isFull && (
                  <button 
                    onClick={onClose}
                    className="w-full py-4 rounded-2xl bg-[#1CB0F6] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#1899D6] active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
                  >
                    Refill Hearts
                    <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-md ml-1">
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                        <path d="M12 2L2 9L12 22L22 9L12 2Z" fill="#FFFFFF" />
                      </svg>
                      350
                    </span>
                  </button>
                )}

                {/* Unlimited Super Promo */}
                <div className="mt-6 pt-6 border-t border-zinc-100 w-full">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-2xl text-white relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10">
                      <Infinity size={100} />
                    </div>
                    <h3 className="font-black italic uppercase tracking-tight text-lg mb-1 relative z-10 flex items-center gap-2">
                      <Infinity size={24} /> Unlimited Hearts
                    </h3>
                    <p className="text-sm font-semibold text-white/90 mb-4 relative z-10">
                      Never run out of hearts with Super T1GER. Learn without limits.
                    </p>
                    <button 
                      onClick={onClose}
                      className="w-full py-3 rounded-xl bg-white text-purple-600 font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-transform relative z-10"
                    >
                      Try 2 Weeks Free
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
