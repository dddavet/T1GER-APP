import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useT1ger } from '../contexts/T1gerContext';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Flame, Zap, CheckCircle2, ChevronDown, BookOpen, Coffee, Target, 
  Settings2, Sparkles, Brain as BrainIcon, Home, Compass, Eye, EyeOff 
} from 'lucide-react';
import { type CurriculumTrack, CURRICULUM_TRACKS } from '../services/missionBank';

import { TacticalColumns } from '../components/TacticalColumns';
import { DailyCommitment } from '../components/DailyCommitment';
import { FocusPomodoro } from '../components/FocusPomodoro';
import { PredatorDen } from '../components/PredatorDen';

const DAILY_QUOTES_ES = [
  "La manada no duerme. Demuestra tu disciplina diaria.",
  "Las excusas no tienen valor. T1GER mide tus resultados ejecutados.",
  "Documenta el trabajo o no ocurrió. La ejecución es el único idioma verdadero.",
  "Tu competencia está descansando. Aprovecha esta hora para tomar la delantera.",
  "La disciplina es el puente inquebrantable entre los objetivos y el éxito.",
  "El único entrenamiento fallido es el que nunca comenzaste.",
  "La innovación constante separa a los verdaderos líderes de los seguidores."
];

const DAILY_QUOTES_EN = [
  "The pride doesn't sleep. Prove your daily grind.",
  "Excuses have no value. T1GER measures executed results.",
  "Document the work or it didn't happen. Execution is our only language.",
  "Your competition is sleeping. Use this hour to take the lead.",
  "Discipline is the unbreakable bridge between goals and accomplishment.",
  "The only failed workout is the one you never started.",
  "Relentless innovation separates true leaders from followers."
];

const MementoMoriWidget = ({ age, isEs }: { age?: number | null, isEs: boolean }) => {
  const currentAge = Math.max(18, Math.min(90, age || 22));
  const totalMonths = 90 * 12;
  const livedMonths = Math.min(totalMonths, Math.round(currentAge * 12));
  const weeksLeft = Math.max(0, Math.round((90 - currentAge) * 52));

  return (
    <section className="mx-5 bg-white shadow-sm rounded-[2rem] p-5 border border-zinc-200 relative overflow-hidden text-left">
      <div className="absolute -top-10 -right-8 w-28 h-28 rounded-full bg-red-500/10 blur-[48px] pointer-events-none" />
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className="text-[8px] font-black font-mono uppercase tracking-[0.25em] text-red-400">
            Memento Mori
          </span>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-800 leading-none mt-1">
            {isEs ? 'Tu vida en meses' : 'Your life in months'}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-red-400 leading-none">{weeksLeft.toLocaleString()}</p>
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">
            {isEs ? 'semanas restantes' : 'weeks left'}
          </span>
        </div>
      </div>

      <div className="grid gap-[3px] max-h-36 overflow-hidden" style={{ gridTemplateColumns: 'repeat(36, minmax(0, 1fr))' }}>
        {Array.from({ length: totalMonths }).map((_, index) => {
          const isLived = index < livedMonths;
          const isCurrentYear = index >= livedMonths && index < livedMonths + 12;
          return (
            <span
              key={index}
              className={`aspect-square rounded-[2px] ${
                isLived
                  ? 'bg-red-400/70 shadow-[0_0_6px_rgba(248,113,113,0.25)]'
                  : isCurrentYear
                    ? 'bg-[#FF7300]/60'
                    : 'bg-zinc-50'
              }`}
            />
          );
        })}
      </div>

      <p className="mt-4 text-[10px] font-semibold text-zinc-500 leading-relaxed">
        {isEs
          ? 'Cada punto representa un mes de vida. T1GER existe para convertir el aprendizaje en evidencia ejecutada antes de que los puntos se agoten.'
          : 'Every dot is one month. T1GER exists to turn consumed content into executed proof before those dots run out.'}
      </p>
    </section>
  );
};

const PhaseSystem = ({ isPro, isEs }: { isPro?: boolean, isEs: boolean }) => (
  <section className="px-5 grid grid-cols-3 gap-2 text-left">
    {[
      { label: isEs ? 'Aprender' : 'Learn', sub: isEs ? 'Micro-lecciones' : 'Micro-lessons', state: isEs ? 'Gratis' : 'Free' },
      { label: isEs ? 'Aplicar' : 'Apply', sub: isEs ? 'Evidencia fotográfica' : 'Photo proof', state: isPro ? (isEs ? 'Desbloqueado' : 'Unlocked') : 'Premium' },
      { label: isEs ? 'Repetir' : 'Repeat', sub: isEs ? 'Racha de 7 días' : '7-day hunt', state: isEs ? 'Activo' : 'Active' },
    ].map((phase, index) => (
      <div key={phase.label} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 min-h-[96px]">
        <span className="text-[8px] font-black font-mono uppercase tracking-widest text-zinc-600">
          {isEs ? `Fase 0${index + 1}` : `Phase 0${index + 1}`}
        </span>
        <h3 className="text-sm font-black uppercase tracking-tight text-zinc-800 mt-2">{phase.label}</h3>
        <p className="text-[9px] font-bold text-zinc-500 mt-1 leading-tight">{phase.sub}</p>
        <span className={`mt-3 inline-flex rounded-full px-2 py-1 text-[7px] font-black uppercase tracking-widest ${
          phase.state === 'Premium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-[#FF7300]/10 text-[#FF7300] border border-[#FF7300]/20'
        }`}>
          {phase.state}
        </span>
      </div>
    ))}
  </section>
);

const ModeSelectorTop = ({ current, onSelect, isEs }: { current: string, onSelect: (id: any) => void, isEs: boolean }) => {
  const haptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(12);
    }
  };

  const modes = [
    { id: 'rest', icon: Coffee, color: 'text-blue-400', label: isEs ? 'Relajado' : 'Relaxed' },
    { id: 'normal', icon: Target, color: 'text-accent', label: isEs ? 'Enfoque' : 'Focus' },
    { id: 'beast', icon: Flame, color: 'text-orange-500', label: isEs ? 'Bestia' : 'Beast' },
  ];

  return (
    <div className="flex items-center justify-center gap-1.5 p-1.5 bg-white shadow-sm rounded-[2rem] mx-auto w-fit mb-6">
      {modes.map((m) => {
        const isActive = current === m.id;
        return (
          <button
            key={m.id}
            onClick={() => { haptic(); onSelect(m.id); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[1.25rem] transition-all duration-300 active:scale-95 cursor-pointer ${
              isActive
                ? 'bg-white shadow-sm-accent shadow-sm scale-[0.98]'
                : 'text-zinc-500 hover:text-zinc-500 hover:bg-zinc-50'
            }`}
          >
            <m.icon className={`w-4 h-4 ${isActive ? m.color : ''}`} />
            <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? 'text-zinc-800' : ''}`}>
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const StoryBanner = ({ track, levelIndex, appUser, isEs }: { track: CurriculumTrack, levelIndex: number, appUser: any, isEs: boolean }) => {
  const level = track?.levels?.[levelIndex] || track?.levels?.[0] || { title: isEs ? 'Fundamentos Ejecutivos' : 'Executive Foundations' };
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const dailyQuote = isEs ? DAILY_QUOTES_ES[dayOfYear % DAILY_QUOTES_ES.length] : DAILY_QUOTES_EN[dayOfYear % DAILY_QUOTES_EN.length];

  const hour = new Date().getHours();
  const greeting = isEs 
    ? (hour < 12 ? "Informe Matutino" : hour < 18 ? "Operaciones de Tarde" : "Reflexión Nocturna")
    : (hour < 12 ? "Morning Briefing" : hour < 18 ? "Afternoon Ops" : "Evening Debrief");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white shadow-sm rounded-[2.5rem] p-7 mx-5 my-4 relative overflow-hidden border-zinc-200 text-left"
    >
      <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.03] bg-scanline" />

      <motion.div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--bg-glow-1) 0%, transparent 70%)' }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="px-2.5 py-1 rounded-full bg-[#FF7300]/10 border border-[#FF7300]/20">
          <span className="text-[8px] font-black uppercase tracking-[0.25em] text-[#FF7300]">
            {level.title}
          </span>
        </div>
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{greeting}</span>
      </div>

      <div className="relative z-10 space-y-3">
        <h1 className="text-3xl font-black italic tracking-tighter leading-none text-zinc-800 uppercase">
          {isEs ? (
            <>LA MANADA TIENE <span className="text-[#FF7300] drop-shadow-[0_0_20px_rgba(255,115,0,0.3)]">HAMBRE DE ÉXITO.</span></>
          ) : (
            <>THE PRIDE <span className="text-[#FF7300] drop-shadow-[0_0_20px_rgba(255,115,0,0.3)]">STAYS HUNGRY.</span></>
          )}
        </h1>
        <p className="text-[11px] font-medium text-zinc-500 leading-relaxed italic border-l-2 border-[#FF7300]/30 pl-4">
          "{dailyQuote}"
        </p>
      </div>
    </motion.div>
  );
};

export const Dashboard = ({ onStartMission }: { onStartMission: (mission: any) => void }) => {
  const { setActiveView } = useT1ger();
  const { 
    currentTrackId, 
    dailyTacticalStatus,
    setDayType,
    pathData,
    language 
  } = useBrain();
  const { appUser } = useAuth();
  const isEs = language === 'es';

  const currentTrack = CURRICULUM_TRACKS[currentTrackId] || CURRICULUM_TRACKS.investing;
  const currentDayType = dailyTacticalStatus.dayType || 'normal';

  return (
    <div className="space-y-6 pb-28 min-h-full">
      <StoryBanner 
        track={currentTrack} 
        levelIndex={pathData.currentLevelIndex} 
        appUser={appUser}
        isEs={isEs} 
      />

      <ModeSelectorTop 
        current={currentDayType} 
        onSelect={(type) => setDayType(type)} 
        isEs={isEs}
      />

      <PhaseSystem isPro={appUser?.isPro} isEs={isEs} />

      <TacticalColumns />

      <FocusPomodoro />

      <PredatorDen />

      <MementoMoriWidget age={appUser?.age} isEs={isEs} />
    </div>
  );
};
