import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PenaltyModal: React.FC<PenaltyModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#050505] border border-red-500/50 rounded-3xl p-8 max-w-[430px] w-full text-center"
          >
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-white font-sans uppercase mb-4">STREAK BROKEN.</h2>
            <p className="text-zinc-400 font-mono text-lg mb-8">YOU STOPPED HUNTING.</p>
            <button
              onClick={onClose}
              className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl font-sans uppercase tracking-wider hover:bg-red-600 transition-colors"
            >
              I WILL DO BETTER
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
