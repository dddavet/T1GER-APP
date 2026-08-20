import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Gift, ArrowRight, Award, Download, Check, Coins } from 'lucide-react';
import { T1gerMascot3D } from '../T1gerMascot3D';
import { fireRewardConfetti } from '../ui/confetti';
import { useT1ger } from '../../contexts/T1gerContext';

interface BookChestRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  badgeName: string;
  isEs?: boolean;
}

export const BookChestRewardModal: React.FC<BookChestRewardModalProps> = ({
  isOpen,
  onClose,
  bookTitle,
  badgeName,
  isEs = true,
}) => {
  const { addXP } = useT1ger();
  const [chestOpened, setChestOpened] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setChestOpened(false);
      return;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenChest = () => {
    setChestOpened(true);
    fireRewardConfetti();
    addXP(300);
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([60, 50, 80, 100]);
    }
  };

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex flex-col items-center justify-between bg-gradient-to-b from-[#1C0F05] via-[#0D0907] to-[#09090B] px-6 py-8 font-sans text-white select-none overflow-y-auto"
      >
        {/* Header */}
        <div className="w-full max-w-sm text-center pt-4">
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/25">
            <Trophy size={12} /> {isEs ? 'HITO DE MAESTRÍA ALCANZADO' : 'MASTERY MILESTONE ACHIEVED'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 leading-tight">
            {isEs ? `¡Completaste ${bookTitle}!` : `You Mastered ${bookTitle}!`}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            {isEs ? 'Has desbloqueado el botín de maestría de este libro.' : 'You unlocked the mastery loot for this book.'}
          </p>
        </div>

        {/* 3D Chest & Mascot Core */}
        <div className="my-auto flex flex-col items-center justify-center relative w-full max-w-xs">
          {!chestOpened ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleOpenChest}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="relative flex h-40 w-40 items-center justify-center rounded-3xl bg-gradient-to-b from-amber-400 to-[var(--ob-accent)] text-black shadow-[0_0_50px_rgba(255,115,0,0.5),0_12px_0_#994700] group-hover:scale-105 active:translate-y-2 active:shadow-[0_2px_0_#994700] transition-all">
                <Gift size={72} className="stroke-[2.5]" />
              </div>

              <span className="mt-6 font-mono text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-4 py-2 rounded-full border border-amber-400/30 animate-pulse">
                {isEs ? '👉 TOCA PARA ABRIR EL COFRE' : '👉 TAP TO UNLOCK CHEST'}
              </span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex flex-col items-center"
            >
              {/* 3D Mascot Celebrating */}
              <div className="h-44 w-44 pointer-events-none mb-2">
                <T1gerMascot3D mood="celebrate" className="h-full w-full" />
              </div>

              {/* Unlocked Badge Card */}
              <div className="rounded-2xl border-2 border-amber-400 bg-amber-400/[0.08] p-4 text-center max-w-xs shadow-xl backdrop-blur-md">
                <div className="flex justify-center mb-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-black">
                    <Award size={22} className="stroke-[2.5]" />
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase font-bold text-amber-400">
                  {isEs ? 'NUEVA INSIGNIA DESBLOQUEADA' : 'NEW BADGE UNLOCKED'}
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">{badgeName}</h3>
                
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-around text-xs font-mono">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Sparkles size={14} /> +300 XP
                  </span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Coins size={14} /> +100 Coins
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Button */}
        <div className="w-full max-w-sm">
          {chestOpened ? (
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl font-mono text-sm font-black uppercase tracking-wider bg-[var(--ob-accent)] hover:brightness-110 text-black shadow-[0_6px_0_#CC5C00,0_12px_25px_rgba(255,115,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#CC5C00] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isEs ? 'CONTINUAR EL CAMINO' : 'CONTINUE THE PATH'}</span>
              <ArrowRight size={18} className="stroke-[3]" />
            </button>
          ) : (
            <p className="text-center text-[11px] text-zinc-500 font-mono">
              {isEs ? 'Toca el cofre dorado para reclamar tu recompensa' : 'Tap the chest to claim your rewards'}
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
