import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Brain, Check, Coins, Fire, LockKey, Path, Play, Robot, ShieldCheck, Sparkle, Target, TrendUp } from '@phosphor-icons/react';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { AtomicLessonPlayer } from '../components/learn/AtomicLessonPlayer';
import { QuickShieldRefreshModal } from '../components/learn/QuickShieldRefreshModal';
import { getInteractiveTrack, getInteractiveTrackIdFromLegacy, INTERACTIVE_MISSION_BANK, INTERACTIVE_TRACKS } from '../services/interactiveCurriculum';
import type { AtomicLesson, InteractiveTrackId } from '../services/interactiveCurriculumTypes';
import { localizeLearning } from '../services/interactiveCurriculumTypes';
import type { BankMission } from '../services/missionBank';
import { getGlobalMemoryHealth, getNodeMemoryShield } from '../services/brainService';

interface LearnProps {
  onStartMission?: (mission: BankMission) => void;
}

const TRACK_ICONS = { 'smart-money': TrendUp, 'ai-automation': Robot, 'viral-growth': Target } as const;
const NODE_POSITIONS = ['justify-start pl-8', 'justify-end pr-8', 'justify-start pl-16', 'justify-end pr-12', 'justify-start pl-9'];
const LazyT1gerMascot3D = React.lazy(() => import('../components/T1gerMascot3D').then((module) => ({ default: module.T1gerMascot3D })));

interface SkillNodeProps {
  lesson: AtomicLesson;
  locale: 'es' | 'en';
  state: 'completed' | 'current' | 'locked';
  onSelect: () => void;
  index: number;
  shieldPercentage: number | null;
}

const SkillNode: React.FC<SkillNodeProps> = ({ lesson, locale, state, onSelect, index, shieldPercentage }) => {
  const complete = state === 'completed';
  const current = state === 'current';
  const shieldTone = shieldPercentage === null
    ? 'text-zinc-600'
    : shieldPercentage >= 80
      ? 'text-emerald-400'
      : shieldPercentage >= 50
        ? 'text-amber-400'
        : 'text-rose-400';
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07, type: 'spring', stiffness: 150, damping: 20 }} className={`relative z-[1] flex w-full ${NODE_POSITIONS[index] || 'justify-start'}`}>
      <div className={`flex w-[16.5rem] items-center gap-3 ${index % 2 === 1 ? 'flex-row-reverse text-right' : 'text-left'}`}>
        <div className="relative shrink-0">
          {current && <motion.span aria-hidden className="absolute -inset-2 rounded-[1.65rem] border border-[#FF7300]/45" animate={{ scale: [1, 1.09, 1], opacity: [0.35, 0.75, 0.35] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} />}
          <button type="button" disabled={state === 'locked'} onClick={onSelect} aria-label={`${localizeLearning(lesson.title, locale)} — ${state}`} className={`relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.35rem] border text-white transition active:translate-y-0.5 active:scale-[0.97] ${complete ? 'border-emerald-300/45 bg-emerald-500 text-[#07130E] shadow-[0_7px_0_#08734E]' : current ? 'border-[#FF9B4A]/55 bg-[#FF7300] text-[#160A02] shadow-[0_7px_0_#A83D00]' : 'cursor-not-allowed border-white/8 bg-[#18181D] text-zinc-600 shadow-[0_6px_0_#0B0B0E]'}`}>
            {complete ? <Check size={30} weight="bold" /> : current ? <Play size={27} weight="fill" /> : <LockKey size={24} weight="bold" />}
          </button>
        </div>
        <button type="button" disabled={state === 'locked'} onClick={onSelect} className={`min-w-0 flex-1 rounded-2xl border px-3.5 py-3 transition active:scale-[0.985] ${state === 'locked' ? 'cursor-not-allowed border-white/[0.045] bg-white/[0.018]' : 'border-white/9 bg-[#121216]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] hover:border-white/16'}`}>
          <span className={`font-mono text-[9px] font-semibold uppercase tracking-[0.14em] ${complete ? 'text-emerald-400' : current ? 'text-[#FF8A2A]' : 'text-zinc-600'}`}>{state === 'completed' ? (locale === 'es' ? 'DOMINADO' : 'MASTERED') : state === 'current' ? (locale === 'es' ? 'SIGUIENTE' : 'NEXT') : (locale === 'es' ? 'BLOQUEADO' : 'LOCKED')}</span>
          <h3 className={`mt-1 text-sm font-bold leading-snug ${state === 'locked' ? 'text-zinc-600' : 'text-white'}`}>{localizeLearning(lesson.title, locale)}</h3>
          <span className="mt-1.5 flex items-center gap-1.5 font-mono text-[9px] tabular-nums text-zinc-500">
            <span>03:00 · {lesson.phases[3].xp} XP</span>
            {complete && shieldPercentage !== null && <span className={shieldTone}>· {shieldPercentage}% {locale === 'es' ? 'memoria' : 'memory'}</span>}
          </span>
        </button>
      </div>
    </motion.div>
  );
};

export const Learn: React.FC<LearnProps> = () => {
  const { brainState, language, selectTrack, petState, learnStreak } = useBrain();
  const { stats } = useT1ger();
  const locale = language === 'es' ? 'es' : 'en';
  const activeTrackId = getInteractiveTrackIdFromLegacy(brainState.currentTrackId);
  const activeTrack = getInteractiveTrack(activeTrackId);
  const [activeLesson, setActiveLesson] = useState<AtomicLesson | null>(null);
  const [showSmartReview, setShowSmartReview] = useState(false);
  const completedIds = useMemo(() => new Set(brainState.missionHistory.filter((record) => record.completed).map((record) => record.missionId)), [brainState.missionHistory]);
  const memoryHealth = useMemo(() => getGlobalMemoryHealth(brainState), [brainState]);
  const vulnerableMissions = useMemo(() => INTERACTIVE_MISSION_BANK.filter((mission) => {
    if (!completedIds.has(mission.id)) return false;
    return getNodeMemoryShield(mission.id, brainState).percentage < 80;
  }).sort((a, b) => getNodeMemoryShield(a.id, brainState).percentage - getNodeMemoryShield(b.id, brainState).percentage), [brainState, completedIds]);
  const completedCount = activeTrack.lessons.filter((lesson) => completedIds.has(lesson.id)).length;
  const firstIncompleteIndex = activeTrack.lessons.findIndex((lesson) => !completedIds.has(lesson.id));
  const currentIndex = firstIncompleteIndex === -1 ? activeTrack.lessons.length - 1 : firstIncompleteIndex;
  const currentLesson = activeTrack.lessons[currentIndex];
  const progress = Math.round((completedCount / activeTrack.lessons.length) * 100);
  const Icon = TRACK_ICONS[activeTrack.id];

  const switchTrack = (trackId: InteractiveTrackId) => {
    const track = INTERACTIVE_TRACKS.find((item) => item.id === trackId);
    if (!track) return;
    navigator.vibrate?.(9);
    selectTrack(track.legacyTrackId);
  };
  const openLesson = (lesson: AtomicLesson) => { navigator.vibrate?.(12); setActiveLesson(lesson); };

  if (!activeTrack.lessons.length) {
    return <div className="mx-auto max-w-lg px-5 py-16 text-center"><Brain className="mx-auto text-zinc-600" size={42} weight="duotone" /><h2 className="mt-4 text-xl font-bold text-white">{locale === 'es' ? 'Este camino se está calibrando' : 'This path is being calibrated'}</h2><p className="mt-2 text-sm text-zinc-500">{locale === 'es' ? 'Elige otro árbol para continuar aprendiendo.' : 'Choose another tree to keep learning.'}</p></div>;
  }

  return (
    <div className="mx-auto max-w-lg select-none space-y-5 px-3 pb-28 pt-2 font-sans">
      <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#121216]/88 shadow-[0_20px_45px_rgba(0,0,0,.38)] backdrop-blur-xl">
        <div className="grid grid-cols-[1fr_8.25rem] items-center gap-1 px-5 pt-5">
          <div className="min-w-0"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#FF7300]/30 bg-[#FF7300]/10 text-[#FF8A2A]"><Icon size={18} weight="bold" /></span><span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{locale === 'es' ? 'CAMINO ACTIVO' : 'ACTIVE PATH'}</span></div><h1 className="mt-3 text-[1.7rem] font-bold leading-[1.02] tracking-[-0.035em] text-white">{localizeLearning(activeTrack.title, locale)}</h1><p className="mt-2 text-xs leading-relaxed text-zinc-400">{localizeLearning(activeTrack.promise, locale)}</p></div>
          <div className="relative h-32 w-32 translate-x-1">
            <React.Suspense fallback={<img src="/mascot/t1ger-icon.png" alt="" aria-hidden className="h-full w-full object-contain p-2" />}>
              <LazyT1gerMascot3D mood={completedCount === activeTrack.lessons.length ? 'celebrate' : 'happy'} closeUp className="h-full w-full" />
            </React.Suspense>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 divide-x divide-white/8 border-y border-white/8 bg-white/[0.02] py-3.5">
          <div className="text-center"><Path className="mx-auto text-[#FF8A2A]" size={17} weight="bold" /><p className="mt-1 font-mono text-sm font-bold tabular-nums text-white">{completedCount}/{activeTrack.lessons.length}</p><span className="text-[8px] uppercase tracking-wider text-zinc-500">{locale === 'es' ? 'Nodos' : 'Nodes'}</span></div>
          <div className="text-center"><Fire className="mx-auto text-orange-400" size={17} weight="fill" /><p className="mt-1 font-mono text-sm font-bold tabular-nums text-white">{learnStreak}</p><span className="text-[8px] uppercase tracking-wider text-zinc-500">{locale === 'es' ? 'Racha' : 'Streak'}</span></div>
          <div className="text-center"><Coins className="mx-auto text-amber-400" size={17} weight="fill" /><p className="mt-1 font-mono text-sm font-bold tabular-nums text-white">{stats.xp}</p><span className="text-[8px] uppercase tracking-wider text-zinc-500">XP</span></div>
        </div>
        <div className="p-4"><div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-500"><span>{locale === 'es' ? 'Dominio del árbol' : 'Tree mastery'}</span><span className="tabular-nums text-zinc-300">{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/7"><motion.div initial={false} animate={{ scaleX: progress / 100 }} transition={{ type: 'spring', stiffness: 120, damping: 22 }} style={{ transformOrigin: 'left' }} className="h-full w-full rounded-full bg-[#FF7300]" /></div></div>
      </section>

      <div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/8 bg-[#121216] p-1">
        {INTERACTIVE_TRACKS.map((track) => { const TrackIcon = TRACK_ICONS[track.id]; const selected = track.id === activeTrack.id; return <button key={track.id} type="button" onClick={() => switchTrack(track.id)} className={`relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition active:scale-[0.98] ${selected ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{selected && <motion.span layoutId="learn-active-track" className="absolute inset-0 rounded-xl border border-[#FF7300]/25 bg-[#FF7300]/10" transition={{ type: 'spring', stiffness: 340, damping: 28 }} />}<TrackIcon className="relative" size={17} weight={selected ? 'fill' : 'bold'} /><span className="relative text-[9px] font-bold leading-none">{localizeLearning(track.shortTitle, locale)}</span></button>; })}
      </div>

      <section className="overflow-hidden rounded-[1.5rem] border border-white/8 bg-[#121216] shadow-[inset_0_1px_0_rgba(255,255,255,.045)]">
        <div className="flex items-start justify-between gap-4 p-4">
          <div className="flex min-w-0 gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-300">
              <ShieldCheck size={25} weight="duotone" />
              <span className="absolute -bottom-1 -right-1 rounded-full border border-[#121216] bg-cyan-300 px-1.5 py-0.5 font-mono text-[8px] font-black text-[#061014]">{memoryHealth.score}</span>
            </div>
            <div className="min-w-0">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-cyan-300">{locale === 'es' ? 'BANCO DE CONOCIMIENTO' : 'KNOWLEDGE BANK'}</span>
              <h2 className="mt-1 text-base font-bold text-white">{locale === 'es' ? 'Lo aprendido debe sobrevivir.' : 'What you learn must survive.'}</h2>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                {memoryHealth.totalNodesLearned === 0
                  ? (locale === 'es' ? 'Completa tu primer Orb para activar la memoria adaptativa.' : 'Complete your first Orb to activate adaptive memory.')
                  : vulnerableMissions.length > 0
                    ? (locale === 'es' ? `${vulnerableMissions.length} concepto${vulnerableMissions.length === 1 ? '' : 's'} necesita${vulnerableMissions.length === 1 ? '' : 'n'} recuperación activa.` : `${vulnerableMissions.length} concept${vulnerableMissions.length === 1 ? '' : 's'} need active recall.`)
                    : (locale === 'es' ? 'Todos tus conceptos siguen protegidos.' : 'Every learned concept is still protected.')}
              </p>
            </div>
          </div>
          <span className="font-mono text-lg font-black tabular-nums text-white">{memoryHealth.score}%</span>
        </div>
        <div className="flex items-center gap-2 border-t border-white/7 bg-black/10 px-4 py-3">
          <div className="flex flex-1 gap-1.5" aria-label={locale === 'es' ? 'Estado de memoria por Orb' : 'Memory state per Orb'}>
            {activeTrack.lessons.map((lesson) => {
              const complete = completedIds.has(lesson.id);
              const shield = complete ? getNodeMemoryShield(lesson.id, brainState) : null;
              const color = !shield ? 'bg-white/8' : shield.percentage >= 80 ? 'bg-emerald-400' : shield.percentage >= 50 ? 'bg-amber-400' : 'bg-rose-400';
              return <span key={lesson.id} title={complete ? `${shield?.percentage}%` : (locale === 'es' ? 'Bloqueado' : 'Locked')} className={`h-2 flex-1 rounded-full ${color}`} />;
            })}
          </div>
          <button type="button" disabled={vulnerableMissions.length === 0} onClick={() => { navigator.vibrate?.(10); setShowSmartReview(true); }} className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-wider text-cyan-200 transition active:scale-[0.97] disabled:cursor-default disabled:opacity-35">
            {locale === 'es' ? 'Reforzar' : 'Strengthen'}
          </button>
        </div>
      </section>

      {currentLesson && <motion.button type="button" whileTap={{ scale: 0.985 }} onClick={() => openLesson(currentLesson)} className="group w-full overflow-hidden rounded-[1.5rem] border border-[#FF7300]/30 bg-[#FF7300]/[0.075] p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,.07)]"><div className="flex items-center justify-between gap-4"><div className="min-w-0"><div className="flex items-center gap-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#FF9B4A]"><Sparkle size={13} weight="fill" />{firstIncompleteIndex === -1 ? (locale === 'es' ? 'REPASO DISPONIBLE' : 'REVIEW AVAILABLE') : (locale === 'es' ? 'MISIÓN DE HOY' : 'TODAY’S MISSION')}</div><h2 className="mt-1.5 truncate text-lg font-bold text-white">{localizeLearning(currentLesson.title, locale)}</h2><p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">{localizeLearning(currentLesson.objective, locale)}</p></div><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF7300] text-[#180B02] shadow-[0_5px_0_#A83D00] transition group-active:translate-y-0.5 group-active:shadow-[0_3px_0_#A83D00]"><ArrowRight size={20} weight="bold" /></span></div></motion.button>}

      <section className="relative overflow-hidden rounded-[1.75rem] border border-white/8 bg-[#0E0E12] px-3 py-7">
        <div className="mb-7 px-2"><span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{locale === 'es' ? 'RUTA DE EJECUCIÓN' : 'EXECUTION PATH'}</span><h2 className="mt-1 text-xl font-bold tracking-tight text-white">{locale === 'es' ? 'Cinco victorias. Cinco artefactos.' : 'Five wins. Five artifacts.'}</h2><p className="mt-1 text-xs leading-relaxed text-zinc-500">{localizeLearning(activeTrack.outcome, locale)}</p></div>
        <svg aria-hidden viewBox="0 0 320 590" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-4 top-32 h-[590px] w-[calc(100%-2rem)] opacity-60"><path d="M75 42 C255 84 258 166 198 220 C125 286 73 300 91 365 C112 441 257 444 244 540" fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="8" strokeLinecap="round" /><motion.path d="M75 42 C255 84 258 166 198 220 C125 286 73 300 91 365 C112 441 257 444 244 540" fill="none" stroke="#FF7300" strokeWidth="3" strokeLinecap="round" initial={false} animate={{ pathLength: progress / 100 }} transition={{ type: 'spring', stiffness: 90, damping: 24 }} /></svg>
        <div className="relative space-y-9">{activeTrack.lessons.map((lesson, index) => { const completed = completedIds.has(lesson.id); const unlocked = index === 0 || completedIds.has(activeTrack.lessons[index - 1].id); const state = completed ? 'completed' : unlocked ? 'current' : 'locked'; const shield = completed ? getNodeMemoryShield(lesson.id, brainState).percentage : null; return <SkillNode key={lesson.id} lesson={lesson} locale={locale} state={state} index={index} shieldPercentage={shield} onSelect={() => unlocked && openLesson(lesson)} />; })}</div>
      </section>

      <div className="flex items-center justify-between border-t border-white/8 px-2 pt-4 text-[10px] text-zinc-600"><span>{locale === 'es' ? 'Cada nodo genera prueba de trabajo' : 'Every node creates proof of work'}</span><span className="font-mono tabular-nums">T1GER · {Math.round(petState.energy)}% {locale === 'es' ? 'ENERGÍA' : 'ENERGY'}</span></div>
      <AnimatePresence>{activeLesson && <AtomicLessonPlayer lesson={activeLesson} locale={locale} onClose={() => setActiveLesson(null)} onComplete={() => setActiveLesson(null)} />}</AnimatePresence>
      <AnimatePresence>{showSmartReview && vulnerableMissions.length > 0 && <QuickShieldRefreshModal vulnerableMissions={vulnerableMissions} onClose={() => setShowSmartReview(false)} onSuccess={() => setShowSmartReview(false)} />}</AnimatePresence>
    </div>
  );
};
