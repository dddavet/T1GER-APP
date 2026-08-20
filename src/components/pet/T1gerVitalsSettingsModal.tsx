import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Zap, Utensils, Check, Sparkles, Sliders } from 'lucide-react';
import { useBrain } from '../../contexts/BrainContext';

interface T1gerVitalsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SCREEN_TIME_OPTIONS = [
  { minutes: 45, label: '45 min', desc: 'Monje / Extremo' },
  { minutes: 90, label: '1.5 horas', desc: 'Emprendedor Pro (Recomendado)' },
  { minutes: 120, label: '2.0 horas', desc: 'Balance Moderado' },
  { minutes: 180, label: '3.0 horas', desc: 'Estilo Flexible' },
];

const XP_GOAL_OPTIONS = [
  { xp: 100, label: '100 XP / día', desc: '1 lección diaria (Constancia)' },
  { xp: 200, label: '200 XP / día', desc: '2 lecciones diarias (Crecimiento)' },
  { xp: 300, label: '300 XP / día', desc: '3 lecciones diarias (Maestría)' },
];

export const T1gerVitalsSettingsModal: React.FC<T1gerVitalsSettingsModalProps> = ({ isOpen, onClose }) => {
  const { petState, updatePetSettings, language } = useBrain();
  const isEs = language === 'es';

  const [selectedMinutes, setSelectedMinutes] = useState(petState.dailyScreenTimeLimitMinutes || 90);
  const [selectedXP, setSelectedXP] = useState(petState.dailyXPGoal || 100);

  const handleSave = () => {
    updatePetSettings(selectedMinutes, selectedXP);
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([20, 50, 20]);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 select-none"
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 14 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 14 }}
          className="relative w-full max-w-md rounded-[2rem] border border-white/12 bg-[#121216] p-6 shadow-2xl text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/8 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--t1ger-orange)]/15 text-[var(--t1ger-orange)]">
                <Sliders size={18} />
              </div>
              <div>
                <h3 className="font-mono text-sm font-bold tracking-wide text-white uppercase">
                  {isEs ? 'Calibrar Metas de T1GER' : 'Calibrate T1GER Goals'}
                </h3>
                <p className="text-[11px] text-zinc-400">
                  {isEs ? 'Personaliza cómo se calcula la Energía y el Hambre' : 'Customize how Energy & Hunger are calculated'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="mt-5 space-y-6">
            {/* 1. SCREEN TIME / ENERGY BUDGET */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
                  <Zap size={14} />
                </span>
                <span className="font-mono text-xs font-bold text-cyan-300 uppercase">
                  {isEs ? '1. Meta de Celular (Energía 🔋)' : '1. Screen Time Budget (Energy 🔋)'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
                {isEs
                  ? 'Si pasas menos tiempo del elegido en redes, la energía de T1GER se mantiene al 100%.'
                  : 'Stay under this screen time to keep T1GER at 100% Energy.'}
              </p>

              <div className="grid grid-cols-2 gap-2">
                {SCREEN_TIME_OPTIONS.map((opt) => {
                  const isSel = selectedMinutes === opt.minutes;
                  return (
                    <button
                      key={opt.minutes}
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(6);
                        setSelectedMinutes(opt.minutes);
                      }}
                      className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all active:scale-[0.97] cursor-pointer ${
                        isSel
                          ? 'border-cyan-500 bg-cyan-950/40 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                          : 'border-white/8 bg-white/[0.02] text-zinc-400 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono text-xs font-bold text-white">{opt.label}</span>
                        {isSel && <Check size={14} className="text-cyan-400" />}
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. LEARNING / HUNGER GOAL */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                  <Utensils size={14} />
                </span>
                <span className="font-mono text-xs font-bold text-amber-300 uppercase">
                  {isEs ? '2. Meta de Aprendizaje (Hambre 🍖)' : '2. Learning XP Goal (Hunger 🍖)'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
                {isEs
                  ? 'Cada lección te da +100 XP de comida. Alcanza tu meta para alimentar a T1GER al 100%.'
                  : 'Each lesson feeds T1GER +100 XP. Reach your target to keep him fully nourished.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {XP_GOAL_OPTIONS.map((opt) => {
                  const isSel = selectedXP === opt.xp;
                  return (
                    <button
                      key={opt.xp}
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(6);
                        setSelectedXP(opt.xp);
                      }}
                      className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all active:scale-[0.97] cursor-pointer ${
                        isSel
                          ? 'border-amber-500 bg-amber-950/40 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                          : 'border-white/8 bg-white/[0.02] text-zinc-400 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono text-xs font-bold text-white">{opt.label}</span>
                        {isSel && <Check size={14} className="text-amber-400" />}
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6">
            <button
              onClick={handleSave}
              className="w-full py-3.5 rounded-2xl bg-[var(--t1ger-orange)] text-black font-mono font-extrabold text-xs tracking-wider shadow-[0_0_25px_rgba(255,115,0,0.35)] active:scale-[0.97] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check size={16} strokeWidth={2.5} />
              <span>{isEs ? 'GUARDAR Y APLICAR METAS' : 'SAVE & APPLY TARGETS'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
