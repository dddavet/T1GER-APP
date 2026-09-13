import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, X, Zap, ShieldAlert, Skull } from 'lucide-react';
import { useT1ger } from '../contexts/T1gerContext';
import { useBrain } from '../contexts/BrainContext';
import { PouAudio } from '../services/pouAudioService';

export const TacticalPomodoro: React.FC = () => {
  const { addXP, addCoins, activeView } = useT1ger();
  const { feedPet } = useBrain();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25 min
  const [sessionDuration, setSessionDuration] = useState(25 * 60);
  const [strikes, setStrikes] = useState(0);

  const shouldShowIdleFab = false;

  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Completed!
      setIsActive(false);
      handleSuccess();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Anti-Distraction Engine (Visibility Change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        // Punish the user for leaving the app during Monk Mode!
        setStrikes((prev) => prev + 1);
        if (typeof window !== 'undefined' && window.navigator.vibrate) {
          window.navigator.vibrate([200, 100, 200, 100, 500]);
        }
        
        // Feed pet negative nutrition (Damage)
        feedPet(-20); 
        
        if (strikes >= 2) {
          // Total Failure
          setIsActive(false);
          setIsOpen(false);
          setTimeLeft(sessionDuration);
          setStrikes(0);
          alert('Misión Fallida: Tu falta de enfoque ha dañado gravemente a tu T1GER.');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, strikes, sessionDuration]);

  const handleSuccess = () => {
    PouAudio.playEatBite(); // Re-use happy sound
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([50, 50, 50, 50, 200]);
    }
    addXP(100);
    addCoins(50);
    setIsOpen(false);
    setTimeLeft(sessionDuration);
  };

  const startSession = (minutes: number) => {
    setSessionDuration(minutes * 60);
    setTimeLeft(minutes * 60);
    setIsActive(true);
    setStrikes(0);
    
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // The Floating Action Button (FAB) or the Full Screen overlay
  return (
    <>
      {/* FAB to open */}
      {!isOpen && !isActive && shouldShowIdleFab && (
        <div className="absolute bottom-[calc(5.2rem+env(safe-area-inset-bottom))] left-4 z-40 pointer-events-none">
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            className="pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950/90 border border-red-500/40 text-red-400 shadow-[0_4px_20px_rgba(220,38,38,0.3)] hover:border-red-500 hover:text-white cursor-pointer transition-colors backdrop-blur-md"
            aria-label="Abrir Modo Monje / Pomodoro"
          >
            {/* Subtle pulse aura */}
            <div className="absolute inset-0 rounded-2xl bg-red-600 opacity-20 blur-md animate-pulse" />
            <Timer size={22} className="relative z-10" />
          </motion.button>
        </div>
      )}

      {/* Active Mini-Timer FAB */}
      {!isOpen && isActive && (
        <div className="absolute bottom-[calc(5.2rem+env(safe-area-inset-bottom))] left-4 z-40 pointer-events-none">
          <motion.button
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-auto relative flex h-12 px-3.5 items-center justify-center gap-2 rounded-2xl bg-zinc-950/95 border border-red-500 shadow-[0_0_24px_rgba(220,38,38,0.45)] text-white cursor-pointer backdrop-blur-md"
            aria-label="Ver temporizador activo"
          >
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <div className="w-2 h-2 rounded-full bg-red-500" />
            </motion.div>
            <span className="font-mono font-bold text-red-400 text-sm">{formatTime(timeLeft)}</span>
          </motion.button>
        </div>
      )}

      {/* Full Screen Monk Mode Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center p-6 text-white"
          >
            {/* Blood red gradient if active, else normal */}
            <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.15),transparent_70%)] pointer-events-none transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`} />

            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center max-w-sm w-full text-center relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-6 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                {isActive ? <ShieldAlert size={40} className="animate-pulse" /> : <Timer size={40} />}
              </div>

              <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2">
                Modo Monje
              </h2>
              
              {!isActive ? (
                <>
                  <p className="text-sm text-zinc-400 mb-8 px-4">
                    Bloquea todas las distracciones. Si sales de la app durante el temporizador, tu T1GER recibirá <strong className="text-red-400">daño crítico</strong>.
                  </p>

                  <div className="grid grid-cols-2 gap-4 w-full">
                    {[25, 45, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => startSession(mins)}
                        className="py-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 transition-all font-mono font-bold text-lg flex flex-col items-center gap-1"
                      >
                        {mins}:00
                        <span className="text-[10px] text-red-400 uppercase tracking-widest">+{(mins/25)*100} XP</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <motion.div 
                    className="text-8xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_25px_rgba(220,38,38,0.5)] my-8"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    {formatTime(timeLeft)}
                  </motion.div>

                  <div className="flex items-center gap-4 mb-12">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border ${i < strikes ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-white/5 border-white/10 text-white/20'}`}>
                        {i < strikes ? <Skull size={20} /> : <Zap size={20} />}
                      </div>
                    ))}
                  </div>

                  <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest animate-pulse">
                    NO CIERRES LA APP. NO CAMBIES DE PESTAÑA.
                  </p>

                  <button
                    onClick={() => {
                      setIsActive(false);
                      setTimeLeft(sessionDuration);
                      setStrikes(0);
                    }}
                    className="mt-12 text-xs font-bold text-zinc-500 hover:text-white underline decoration-zinc-700 underline-offset-4"
                  >
                    Rendirse (Perder Progreso)
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
