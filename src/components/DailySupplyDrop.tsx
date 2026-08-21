import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PackageOpen, Sparkles, Coins, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useT1ger } from '../contexts/T1gerContext';
import { PouAudio } from '../services/pouAudioService';

export const DailySupplyDrop: React.FC = () => {
  const { appUser, updateAppUser } = useAuth();
  const { addCoins, addXP } = useT1ger();
  const [isOpening, setIsOpening] = useState(false);
  const [loot, setLoot] = useState<{ type: 'coins' | 'xp'; amount: number } | null>(null);

  const lastClaimed = appUser?.lastSupplyDropClaimed || 0;
  const canClaim = Date.now() - lastClaimed > 24 * 60 * 60 * 1000;

  if (!canClaim && !loot) return null;

  const handleOpen = async () => {
    if (!canClaim) return;
    setIsOpening(true);
    
    // Play sound or haptic feedback
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([30, 50, 30, 100, 50]);
    }

    // Determine random loot
    const isCoins = Math.random() > 0.5;
    const amount = isCoins ? Math.floor(Math.random() * 200) + 50 : Math.floor(Math.random() * 100) + 25;
    
    setTimeout(() => {
      setLoot({ type: isCoins ? 'coins' : 'xp', amount });
      
      if (isCoins) addCoins(amount);
      else addXP(amount);

      if (updateAppUser) {
        updateAppUser({ lastSupplyDropClaimed: Date.now() });
      }
    }, 1200); // 1.2s tension build-up
  };

  return (
    <div className="mb-4">
      <AnimatePresence mode="wait">
        {!loot ? (
          <motion.button
            key="chest-closed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleOpen}
            disabled={isOpening}
            className={`w-full relative overflow-hidden rounded-[1.25rem] p-4 text-left transition-all ${
              isOpening 
                ? 'bg-yellow-500/10 border-yellow-500/40 animate-pulse' 
                : 'bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/30 hover:border-yellow-500/60 shadow-[0_0_20px_rgba(250,204,21,0.15)] cursor-pointer'
            }`}
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
            
            <div className="flex items-center gap-4 relative z-10">
              <motion.div 
                animate={isOpening ? { rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.4, repeat: isOpening ? Infinity : 0 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black shadow-inner shadow-white/40"
              >
                <PackageOpen size={24} className={isOpening ? 'opacity-50' : 'opacity-100'} />
              </motion.div>

              <div>
                <h3 className="text-sm font-black text-yellow-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={14} /> 
                  {isOpening ? 'Desbloqueando...' : 'Suministro Diario'}
                </h3>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  {isOpening ? 'Generando recompensa...' : 'Toca para abrir tu cofre táctico.'}
                </p>
              </div>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="chest-opened"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.6 }}
            className="w-full relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-[#121216] to-[#0A0A0C] border border-emerald-500/40 p-5 text-center shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/20 blur-3xl pointer-events-none" />
            
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
              className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3"
            >
              {loot.type === 'coins' ? <Coins size={28} /> : <Zap size={28} />}
            </motion.div>

            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              +{loot.amount} {loot.type === 'coins' ? 'Monedas' : 'XP'}
            </h3>
            <p className="text-xs text-emerald-400/80 font-mono mt-1">Suministro asegurado.</p>
            
            <button 
              onClick={() => setLoot(null)}
              className="mt-4 px-4 py-1.5 rounded-lg bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition-colors"
            >
              Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
