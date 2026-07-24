import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Clock } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';

interface HeartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  energy: number;
}

export const HeartsModal: React.FC<HeartsModalProps> = ({ isOpen, onClose, energy }) => {
  const { language } = useBrain();
  const isEs = language === 'es';
  const maxHearts = 5;
  const isFull = energy >= maxHearts;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] bg-white rounded-t-3xl overflow-hidden max-h-[85vh] flex flex-col font-sans"
          >
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-zinc-800">
                {isEs ? 'Vidas' : 'Hearts'}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center bg-zinc-100 text-zinc-500 hover:bg-zinc-200 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 pb-10 flex flex-col items-center">
              <div className="mb-6 flex flex-col items-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-24 h-24 mb-2 drop-shadow-md">
                  <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="#FF4B4B" />
                </svg>
                <div className="text-3xl font-black text-[#FF4B4B]">
                  {energy}
                </div>
                <div className="text-xs font-black text-zinc-400 uppercase tracking-widest mt-1">
                  {isFull ? (isEs ? "Vidas Llenas" : "Full Hearts") : (isEs ? "Siguiente vida en 3:45" : "Next heart in 3:45")}
                </div>
              </div>

              <div className="w-full text-left">
                <h3 className="text-lg font-black text-zinc-800 mb-4">
                  {isEs ? 'Recargar Vidas' : 'Refill Hearts'}
                </h3>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                      <Heart className="w-5 h-5 fill-red-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-800">
                        {isEs ? 'Restaurar Vidas' : 'Full Refill'}
                      </h4>
                      <p className="text-xs text-zinc-500">
                        {isEs ? 'Recarga tus 5 vidas al instante' : 'Instantly refill all 5 hearts'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#FF7300]">100 💎</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
