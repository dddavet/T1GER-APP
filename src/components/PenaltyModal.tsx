import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PenaltyModal: React.FC<PenaltyModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative bg-[#121216] border border-red-500/30 rounded-3xl p-8 max-w-[420px] w-full text-center shadow-[0_20px_50px_rgba(239,68,68,0.15)] text-white"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-4 right-4 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-500">
              <AlertTriangle size={32} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight text-white mb-2">
              RACHA INTERRUMPIDA
            </h2>
            <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest mb-6">
              DEJASTE DE CAZAR HOY. RECUPERA TU RITMO MAÑANA.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl font-sans uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-[0_6px_0_#991b1b,0_10px_20px_rgba(239,68,68,0.3)]"
            >
              VOLVER A CAZAR
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
