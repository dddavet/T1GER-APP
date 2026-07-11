import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, ChevronRight, Cpu, Gamepad2, LineChart, Play, X } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { WindingPath } from '../components/WindingPath';
import { CURRICULUM_TRACKS } from '../services/missionBank';

const trackMeta = {
  investing: { icon: LineChart, label: 'Inversiones', color: '#b8f500' },
  business: { icon: BookOpen, label: 'Negocios', color: '#60a5fa' },
  ai: { icon: Cpu, label: 'Inteligencia artificial', color: '#c084fc' },
};

const learningModes = [
  { id: 'text', label: 'Leer', icon: BookOpen },
  { id: 'visual', label: 'Ver', icon: Play },
  { id: 'interactive', label: 'Practicar', icon: Gamepad2 },
] as const;

export const Learn = ({ onStartMission }: { onStartMission?: (mission: any) => void }) => {
  const { pathData, currentTrackId, selectTrack, brainState } = useBrain();
  const { appUser, updateAppUser } = useAuth();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const meta = trackMeta[currentTrackId];
  const TrackIcon = meta.icon;
  const currentLevel = pathData.track.levels[pathData.currentLevelIndex] || pathData.track.levels[0];
  const totalDays = pathData.track.levels.reduce((total, level) => total + level.days.length, 0);
  const completedDays = brainState.completedDayIds.filter(id => id.startsWith(`${currentTrackId.slice(0, 3)}-`)).length;
  const completion = Math.min(100, Math.round((completedDays / Math.max(totalDays, 1)) * 100));
  const plan = appUser?.personalizedPlan;

  return (
    <div className="-mx-5 min-h-full bg-[#060806] pb-28 text-white">
      <header className="border-b border-white/10 px-5 pb-6 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#b8f500]/25 bg-[#b8f500]/10 text-[#b8f500]">
              <TrackIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-zinc-500">Ruta activa</p>
              <h1 className="text-lg font-black leading-5">{meta.label}</h1>
            </div>
          </div>
          <button type="button" onClick={() => setIsSelectorOpen(true)} className="flex min-h-10 items-center gap-1 rounded-xl border border-white/10 px-3 text-xs font-bold text-zinc-300">
            Cambiar <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase text-[#b8f500]">Sesión de hoy</p>
            <h2 className="max-w-[260px] text-[1.7rem] font-black leading-[1.08]">Aprende una idea. Úsala en una decisión.</h2>
          </div>
          <div className="shrink-0 text-right">
            <strong className="block text-xl text-[#b8f500]">{appUser?.dailyTime || 10}</strong>
            <span className="text-xs text-zinc-500">minutos</span>
          </div>
        </div>
      </header>

      <main className="px-5 pt-5">
        {plan && (
          <section className="mb-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">Plan personal</p>
                <h3 className="text-sm font-bold">{plan.title}</h3>
              </div>
              <span className="rounded-lg bg-[#b8f500]/10 px-2.5 py-1 text-xs font-bold text-[#b8f500]">{completion}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#b8f500]" style={{ width: `${Math.max(completion, 3)}%` }} />
            </div>
            <p className="mt-3 text-xs leading-5 text-zinc-500">Ahora: {currentLevel?.title || 'Fundamentos'} · {plan.focusAreas[0]}</p>
          </section>
        )}

        <div className="mb-8 grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-white/[0.025] p-1">
          {learningModes.map(mode => {
            const Icon = mode.icon;
            const selected = appUser?.learningStyle === mode.id || (!appUser?.learningStyle && mode.id === 'text');
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => updateAppUser({ learningStyle: mode.id })}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-xs font-bold transition-colors ${selected ? 'bg-[#b8f500] text-black' : 'text-zinc-500'}`}
              >
                <Icon className="h-4 w-4" /> {mode.label}
              </button>
            );
          })}
        </div>

        <div className="mb-5">
          <p className="mb-1 text-xs font-bold uppercase text-[#b8f500]">Tu progreso</p>
          <h2 className="text-xl font-black">Ruta de aprendizaje</h2>
          <p className="mt-1 text-sm text-zinc-500">Completa cada nodo para desbloquear el siguiente.</p>
        </div>

        {onStartMission && <WindingPath onStart={onStartMission} />}

        <p className="mt-8 border-t border-white/10 pt-5 text-center text-xs leading-5 text-zinc-600">
          Contenido educativo. T1GER no ofrece asesoramiento financiero personalizado.
        </p>
      </main>

      <AnimatePresence>
        {isSelectorOpen && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center p-4">
            <motion.button type="button" aria-label="Cerrar selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSelectorOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.section initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0d0b] p-5">
              <div className="mb-5 flex items-center justify-between">
                <div><p className="text-xs text-zinc-500">Biblioteca</p><h2 className="text-xl font-black">Elige una ruta</h2></div>
                <button type="button" aria-label="Cerrar" onClick={() => setIsSelectorOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-2">
                {Object.values(CURRICULUM_TRACKS).map(track => {
                  const item = trackMeta[track.trackId];
                  const Icon = item.icon;
                  const active = track.trackId === currentTrackId;
                  return (
                    <button key={track.trackId} type="button" onClick={() => { selectTrack(track.trackId); setIsSelectorOpen(false); }} className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left ${active ? 'border-[#b8f500]/40 bg-[#b8f500]/5' : 'border-white/10 bg-white/[0.02]'}`}>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05]" style={{ color: item.color }}><Icon className="h-5 w-5" /></span>
                      <span className="flex-1"><strong className="block text-sm">{item.label}</strong><small className="text-xs text-zinc-500">{track.levels.length} niveles</small></span>
                      {active ? <span className="text-xs font-bold text-[#b8f500]">Activa</span> : <ChevronRight className="h-4 w-4 text-zinc-600" />}
                    </button>
                  );
                })}
              </div>
            </motion.section>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
