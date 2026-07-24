import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';

interface GemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
}

export const GemsModal: React.FC<GemsModalProps> = ({ isOpen, onClose, coins }) => {
  const { language } = useBrain();
  const isEs = language === 'es';

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
                {isEs ? 'Tienda de Gemas' : 'Gems Shop'}
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
                  <path d="M12 2L2 9L12 22L22 9L12 2Z" fill="#1CB0F6" />
                  <path d="M12 2L2 9L12 11L12 2Z" fill="#78C8F5" />
                  <path d="M12 2L22 9L12 11L12 2Z" fill="#1CB0F6" />
                  <path d="M2 9L12 22L12 11L2 9Z" fill="#1899D6" />
                  <path d="M22 9L12 22L12 11L22 9Z" fill="#1473A6" />
                </svg>
                <div className="text-3xl font-black text-[#1CB0F6]">{coins}</div>
                <div className="text-xs font-black text-zinc-400 uppercase tracking-widest mt-1">
                  {isEs ? 'Saldo de Gemas' : 'Gems Balance'}
                </div>
              </div>

              <div className="w-full mb-6 text-left">
                <h3 className="text-lg font-black text-zinc-800 mb-4">
                  {isEs ? 'Potenciadores' : 'Power-Ups'}
                </h3>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-800">
                        {isEs ? 'Escudo de Racha' : 'Streak Freeze'}
                      </h4>
                      <p className="text-xs text-zinc-500">
                        {isEs ? 'Protege tu racha si pierdes un día' : 'Protect your streak if you miss a day'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#1CB0F6]">200 💎</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
