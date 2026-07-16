import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield } from 'lucide-react';

interface GemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
}

export const GemsModal: React.FC<GemsModalProps> = ({ isOpen, onClose, coins }) => {
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
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-zinc-800">Shop</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center bg-zinc-100 text-zinc-500 hover:bg-zinc-200 rounded-full transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 pb-10 flex flex-col items-center">
              {/* Big Gem Display */}
              <div className="mb-6 flex flex-col items-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-24 h-24 mb-2 drop-shadow-md">
                  <path d="M12 2L2 9L12 22L22 9L12 2Z" fill="#1CB0F6" />
                  <path d="M12 2L2 9L12 11L12 2Z" fill="#78C8F5" />
                  <path d="M12 2L22 9L12 11L12 2Z" fill="#1CB0F6" />
                  <path d="M2 9L12 22L12 11L2 9Z" fill="#1899D6" />
                  <path d="M22 9L12 22L12 11L22 9Z" fill="#1473A6" />
                </svg>
                <div className="text-3xl font-black text-[#1CB0F6]">{coins}</div>
                <div className="text-xs font-black text-zinc-400 uppercase tracking-widest mt-1">Gems Balance</div>
              </div>

              {/* Power-Ups Section */}
              <div className="w-full mb-6">
                <h3 className="text-lg font-black text-zinc-800 mb-4">Power-Ups</h3>
                
                {/* Item: Streak Freeze */}
                <div className="flex items-center justify-between border-2 border-zinc-200 rounded-2xl p-4 mb-3 bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center border-b-4 border-blue-200">
                      <Shield className="w-6 h-6 text-[#1CB0F6]" fill="#1CB0F6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-800 text-[15px]">Streak Freeze</h4>
                      <p className="text-xs text-zinc-500 font-medium">Keep your streak safe if you miss a day.</p>
                    </div>
                  </div>
                  <button className="py-2.5 px-4 rounded-xl bg-white border-2 border-zinc-200 text-[#1CB0F6] font-black text-sm uppercase flex items-center gap-1 hover:bg-zinc-50 active:translate-y-[2px] transition-transform">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                      <path d="M12 2L2 9L12 22L22 9L12 2Z" fill="#1CB0F6" />
                      <path d="M12 2L2 9L12 11L12 2Z" fill="#78C8F5" />
                      <path d="M12 2L22 9L12 11L12 2Z" fill="#1CB0F6" />
                      <path d="M2 9L12 22L12 11L2 9Z" fill="#1899D6" />
                      <path d="M22 9L12 22L12 11L22 9Z" fill="#1473A6" />
                    </svg>
                    200
                  </button>
                </div>

                {/* Item: Heart Refill */}
                <div className="flex items-center justify-between border-2 border-zinc-200 rounded-2xl p-4 bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center border-b-4 border-red-200">
                      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="#FF4B4B" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-800 text-[15px]">Heart Refill</h4>
                      <p className="text-xs text-zinc-500 font-medium">Get full hearts to keep learning.</p>
                    </div>
                  </div>
                  <button className="py-2.5 px-4 rounded-xl bg-white border-2 border-zinc-200 text-[#1CB0F6] font-black text-sm uppercase flex items-center gap-1 hover:bg-zinc-50 active:translate-y-[2px] transition-transform">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                      <path d="M12 2L2 9L12 22L22 9L12 2Z" fill="#1CB0F6" />
                      <path d="M12 2L2 9L12 11L12 2Z" fill="#78C8F5" />
                      <path d="M12 2L22 9L12 11L12 2Z" fill="#1CB0F6" />
                      <path d="M2 9L12 22L12 11L2 9Z" fill="#1899D6" />
                      <path d="M22 9L12 22L12 11L22 9Z" fill="#1473A6" />
                    </svg>
                    350
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
