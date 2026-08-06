import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Clock } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { PaywallModal } from './PaywallModal';

interface HeartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  energy: number;
}

export const HeartsModal: React.FC<HeartsModalProps> = ({ isOpen, onClose, energy }) => {
  const { language } = useBrain();
  const isEs = language === 'es';
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
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
                
                {/* Super T1GER Upsell */}
                <button
                  onClick={() => setIsPaywallOpen(true)}
                  className="w-full p-4 mb-3 bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-2xl border-2 border-b-4 border-zinc-900 border-b-black text-left flex items-center justify-between active:translate-y-1 active:scale-95 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7300] to-[#FFCA00] text-white flex items-center justify-center font-black text-xl shadow-[0_0_15px_rgba(255,115,0,0.5)]">
                      💎
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white uppercase italic tracking-tighter">
                        Super T1GER
                      </h4>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                        {isEs ? 'Vidas Ilimitadas' : 'Unlimited Hearts'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-[#FFCA00] bg-white/10 px-2 py-1 rounded-lg">
                    {isEs ? 'Gratis x 14 Días' : '14 Days Free'}
                  </span>
                </button>

                {/* Standard Gem Refill */}
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                      <Heart className="w-5 h-5 fill-red-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-800">
                        {isEs ? 'Restaurar Vidas' : 'Full Refill'}
                      </h4>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                        {isEs ? 'Pagar con gemas' : 'Pay with gems'}
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-black text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1">
                    <span className="text-sky-500">💎</span> 100
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          <PaywallModal isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} />
        </>
      )}
    </AnimatePresence>
  );
};
