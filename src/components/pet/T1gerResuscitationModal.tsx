import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HeartCrack, Zap, Activity, ShieldAlert, Sparkles, X } from 'lucide-react';
import { PouAudio } from '../../services/pouAudioService';

interface ResuscitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRevive: () => void;
  isEs: boolean;
}

export const T1gerResuscitationModal: React.FC<ResuscitationModalProps> = ({
  isOpen,
  onClose,
  onRevive,
  isEs,
}) => {
  const [charging, setCharging] = useState(false);
  const [chargeProgress, setChargeProgress] = useState(0);
  const [isShocking, setIsShocking] = useState(false);
  const [revived, setRevived] = useState(false);

  const handleStartCharge = () => {
    setCharging(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 8;
      setChargeProgress(Math.min(100, current));
      if (current >= 100) {
        clearInterval(interval);
        triggerDefibrillatorShock();
      }
    }, 80);
  };

  const triggerDefibrillatorShock = () => {
    setIsShocking(true);
    PouAudio.playDrinkPotion();
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([100, 80, 200, 100, 300]);
    }
    setTimeout(() => {
      setIsShocking(false);
      setRevived(true);
      PouAudio.playPurr();
      onRevive();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-lg select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-sm rounded-[2rem] border border-rose-500/40 bg-[#14080B] p-2 shadow-[0_0_50px_rgba(244,63,94,0.3)] text-left overflow-hidden"
      >
        {/* Background EKG Line */}
        <div className="absolute top-0 inset-x-0 h-16 bg-[radial-gradient(ellipse_at_top,rgba(244,63,94,0.25),transparent_70%)] pointer-events-none" />

        <div className="relative rounded-[1.6rem] border border-rose-500/20 bg-[#0A0305] p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse">
                <Activity size={18} />
              </div>
              <div>
                <span className="font-mono text-[9px] font-black uppercase text-rose-400 tracking-wider block">
                  {isEs ? 'UCI · CUIDADOS INTENSIVOS' : 'ICU · EMERGENCY RESCUE'}
                </span>
                <h3 className="text-xs font-black text-white">
                  {isEs ? 'Resucitación de T1GER' : 'T1GER Resuscitation'}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/5 border border-white/10 transition cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Diagnostic Box */}
          {!revived ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-2.5">
                <HeartCrack className="text-rose-400 shrink-0 mt-0.5" size={16} />
                <p className="text-[11px] text-rose-200/90 leading-relaxed font-mono">
                  {isEs
                    ? '¡El exceso severo de doomscroll y la falta de lecciones han llevado a T1GER al colapso vital!'
                    : 'Severe screen time excess and lack of learning collapsed T1GER vitals!'}
                </p>
              </div>

              {/* Patient Avatar (Injured/Bandaged) */}
              <div className="relative py-4 flex flex-col items-center justify-center">
                <motion.div
                  animate={{
                    opacity: isShocking ? [1, 0.2, 1, 0.4, 1] : [0.5, 0.8, 0.5],
                    scale: isShocking ? [1, 1.25, 0.9, 1.15, 1] : 1,
                  }}
                  transition={{ duration: isShocking ? 0.3 : 2.0, repeat: isShocking ? 4 : Infinity }}
                  className="relative"
                >
                  <img
                    src="/mascot/t1ger-sleeping.png"
                    alt="Injured T1ger"
                    className="h-28 w-28 object-contain filter grayscale contrast-125 brightness-75"
                  />
                  {isShocking && (
                    <motion.div
                      animate={{ opacity: [0, 1, 0], scale: [0.8, 1.4, 0.8] }}
                      transition={{ repeat: Infinity, duration: 0.2 }}
                      className="absolute inset-0 bg-cyan-400/30 blur-xl rounded-full"
                    />
                  )}
                </motion.div>
                <span className="text-[10px] font-mono text-zinc-500 mt-2">
                  {isEs ? 'Ritmo Cardíaco: CRÍTICO (5 BPM)' : 'Heart Rate: CRITICAL (5 BPM)'}
                </span>
              </div>

              {/* Defibrillator Charge Action */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>{isEs ? 'Carga del Desfibrilador:' : 'Defibrillator Charge:'}</span>
                  <span className="text-cyan-400 font-bold tabular-nums">{chargeProgress}% (200 Joules)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400 transition-all duration-100"
                    style={{ width: `${chargeProgress}%` }}
                  />
                </div>

                <button
                  onMouseDown={handleStartCharge}
                  onTouchStart={handleStartCharge}
                  disabled={charging}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-mono text-xs font-black shadow-[0_0_25px_rgba(244,63,94,0.4)] active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Zap size={15} className="fill-current text-yellow-300" />
                  <span>
                    {charging
                      ? (isEs ? '¡CARGANDO DESCARGA...!' : 'CHARGING SHOCK...!')
                      : (isEs ? 'MANTÉN PRESIONADO PARA RESUCITAR' : 'HOLD TO RESUSCITATE')}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Successful Revive Screen */
            <div className="py-6 text-center space-y-4">
              <div className="text-4xl animate-bounce">⚡🐅⚡</div>
              <div>
                <h4 className="text-base font-black text-white font-mono">
                  {isEs ? '¡T1GER HA VUELTO A LA VIDA!' : 'T1GER HAS BEEN REVIVED!'}
                </h4>
                <p className="text-xs text-zinc-300 mt-1.5 max-w-[260px] mx-auto">
                  {isEs
                    ? 'Recuperó +35% de vida basal. Ahora completa una sesión de Foco o una lección para estabilizarlo al 100%.'
                    : 'Recovered +35% base health. Complete a Focus session or lesson now to fully stabilize.'}
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[var(--ob-accent)] text-black font-mono text-xs font-black shadow-lg active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles size={15} />
                <span>{isEs ? 'VOLVER AL SANTUARIO' : 'RETURN TO SANCTUARY'}</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
