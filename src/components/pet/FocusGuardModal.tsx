import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, RotateCcw, ShieldCheck, Flame, Zap, Award, Sparkles, Volume2, VolumeX, Radio } from 'lucide-react';
import { useBrain } from '../../contexts/BrainContext';
import { useT1ger } from '../../contexts/T1gerContext';
import { T1gerMascot3D } from '../T1gerMascot3D';
import { fireRewardConfetti } from '../ui/confetti';
import { soundscapeService, SoundscapeType } from '../../services/soundscapeService';

interface FocusGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS = [
  { label: 'Sprint', minutes: 25, xp: 50, icon: Zap },
  { label: 'Deep Work', minutes: 45, xp: 120, icon: Flame },
  { label: 'Modo Monje', minutes: 90, xp: 250, icon: ShieldCheck },
];

const SOUNDSCAPES: { id: SoundscapeType; label: string; icon: string }[] = [
  { id: 'none', label: 'Silencio', icon: '🔇' },
  { id: 'rain', label: 'Lluvia', icon: '🌧️' },
  { id: 'campfire', label: 'Fogata', icon: '🔥' },
  { id: 'alpha', label: 'Alpha 432Hz', icon: '🧠' },
  { id: 'space', label: 'Deep Space', icon: '🚀' },
];

export const FocusGuardModal: React.FC<FocusGuardModalProps> = ({ isOpen, onClose }) => {
  const { completeFocusSession, language } = useBrain();
  const { addXP } = useT1ger();
  const isEs = language === 'es';

  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [selectedSoundscape, setSelectedSoundscape] = useState<SoundscapeType>('rain');

  const totalSeconds = selectedMinutes * 60;
  const progressPercent = Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100);

  const timerRef = useRef<number | null>(null);

  // Soundscape lifecycle management
  useEffect(() => {
    if (isActive && selectedSoundscape !== 'none') {
      soundscapeService.play(selectedSoundscape);
    } else {
      soundscapeService.stop();
    }
    return () => {
      soundscapeService.stop();
    };
  }, [isActive, selectedSoundscape]);

  const handleSelectSoundscape = (type: SoundscapeType) => {
    setSelectedSoundscape(type);
    if (isActive) {
      soundscapeService.play(type);
    }
  };

  // Reset when preset changes
  const handleSelectPreset = (mins: number) => {
    if (isActive) return;
    setSelectedMinutes(mins);
    setSecondsRemaining(mins * 60);
  };

  useEffect(() => {
    if (isActive && secondsRemaining > 0) {
      timerRef.current = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleFinishSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, secondsRemaining]);

  const handleFinishSession = () => {
    setIsActive(false);
    setIsCompleted(true);
    soundscapeService.stop();
    completeFocusSession(selectedMinutes);
    const xpReward = selectedMinutes === 90 ? 250 : selectedMinutes === 45 ? 120 : 50;
    addXP(xpReward);
    fireRewardConfetti();
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([100, 50, 100, 50, 200]);
    }
  };

  const toggleTimer = () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
    setIsActive((prev) => !prev);
  };

  const resetTimer = () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
    setIsActive(false);
    soundscapeService.stop();
    setSecondsRemaining(selectedMinutes * 60);
    setIsCompleted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const modalNode = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#09090B]/98 backdrop-blur-2xl px-6 py-6 text-white select-none overflow-y-auto"
      >
        {/* Header */}
        <header className="flex w-full max-w-md items-center justify-between pt-safe">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--t1ger-orange)]/15 text-[var(--t1ger-orange)]">
              <ShieldCheck size={18} />
            </span>
            <h2 className="font-mono text-sm font-bold tracking-wider text-zinc-300">
              {isEs ? 'GUARDIA DE ENFOQUE' : 'FOCUS GUARD'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsActive(false);
              soundscapeService.stop();
              onClose();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-zinc-300 hover:bg-white/20 hover:text-white transition cursor-pointer"
            aria-label="Close focus session"
          >
            <X size={18} />
          </button>
        </header>

        {/* Mascot & Timer Core Arena */}
        <main className="flex flex-1 flex-col items-center justify-center max-w-xs w-full text-center my-2">
          {!isCompleted ? (
            <>
              {/* Reactive Mascot */}
              <div className="relative mb-4 h-36 w-36 sm:h-40 sm:w-40 flex items-center justify-center">
                <T1gerMascot3D
                  mood={isActive ? 'thinking' : 'idle'}
                  isMeditating={isActive}
                  className="h-full w-full"
                />
              </div>

              {/* Soundscape Ambient Selector Bar */}
              <div className="mb-4 flex items-center justify-center gap-1.5 flex-wrap">
                {SOUNDSCAPES.map((sc) => {
                  const isSelected = selectedSoundscape === sc.id;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => handleSelectSoundscape(sc.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--t1ger-orange)] text-black shadow-[0_0_12px_rgba(255,115,0,0.4)] scale-105'
                          : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5'
                      }`}
                    >
                      <span>{sc.icon}</span>
                      <span>{sc.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Progress Ring & Countdown Display */}
              <div className="relative my-2 flex items-center justify-center">
                <div className="text-center font-mono">
                  <span className="text-5xl font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                    {formatTime(secondsRemaining)}
                  </span>
                  <div className="mt-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-zinc-400">
                    <Sparkles size={12} className="text-[var(--t1ger-orange)]" />
                    <span>+{Math.round((selectedMinutes / 25) * 45)} {isEs ? 'Energía para T1GER' : 'Energy for T1GER'}</span>
                  </div>
                </div>
              </div>

              {/* Duration Selector Presets */}
              {!isActive && secondsRemaining === totalSeconds && (
                <div className="mt-6 flex w-full gap-2">
                  {PRESETS.map((preset) => {
                    const isSelected = selectedMinutes === preset.minutes;
                    const Icon = preset.icon;
                    return (
                      <button
                        key={preset.minutes}
                        onClick={() => handleSelectPreset(preset.minutes)}
                        className={`flex flex-1 flex-col items-center gap-1 rounded-xl p-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white/10 border-2 border-[var(--t1ger-orange)] text-white'
                            : 'bg-white/5 border border-white/5 text-zinc-400 hover:bg-white/8 hover:text-zinc-200'
                        }`}
                      >
                        <Icon size={14} className={isSelected ? 'text-[var(--t1ger-orange)]' : 'text-zinc-400'} />
                        <span className="font-mono text-xs font-bold">{preset.minutes}m</span>
                        <span className="text-[9px] text-zinc-500 font-medium">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Controls */}
              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={resetTimer}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  title={isEs ? 'Reiniciar' : 'Reset'}
                >
                  <RotateCcw size={18} />
                </button>

                <button
                  onClick={toggleTimer}
                  className="flex h-16 w-36 items-center justify-center gap-2 rounded-2xl bg-[var(--t1ger-orange)] text-black font-mono font-bold text-sm shadow-[0_0_30px_rgba(255,115,0,0.3)] active:scale-95 transition-all cursor-pointer"
                >
                  {isActive ? (
                    <>
                      <Pause size={18} fill="currentColor" />
                      <span>{isEs ? 'Pausar' : 'Pause'}</span>
                    </>
                  ) : (
                    <>
                      <Play size={18} fill="currentColor" />
                      <span>{isEs ? 'Iniciar Foco' : 'Start Focus'}</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Session Completed Screen */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Award size={48} />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold mb-2">
                  <ShieldCheck size={14} />
                  <span>{isEs ? 'GUARDIA COMPLETADA' : 'GUARD COMPLETED'}</span>
                </div>
                <h3 className="text-2xl font-extrabold text-white">
                  {isEs ? '+45 Energía Digital para T1GER' : '+45 Digital Energy for T1GER'}
                </h3>
                <p className="text-xs text-zinc-400 max-w-xs">
                  {isEs
                    ? 'Has protegido tu atención de las redes sociales. T1GER está rebosante de vitalidad.'
                    : 'You shielded your attention from social media. T1GER is full of energy.'}
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-[var(--t1ger-orange)] text-black font-mono font-bold text-sm shadow-[0_0_30px_rgba(255,115,0,0.35)] active:scale-[0.97] cursor-pointer"
              >
                {isEs ? 'Volver al Santuario' : 'Back to Sanctuary'}
              </button>
            </motion.div>
          )}
        </main>
      </motion.div>
    </AnimatePresence>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalNode, document.body);
  }
  return modalNode;
};
