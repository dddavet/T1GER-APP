import React, { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Brain,
  Check,
  CheckCircle,
  LockKey,
  Lightbulb,
  ListChecks,
  Sparkle,
  Target,
  X,
} from '@phosphor-icons/react';
import { useAuth } from '../../contexts/AuthContext';
import { useT1ger } from '../../contexts/T1gerContext';
import { FieldMissionService } from '../../services/fieldMissionService';
import type { AtomicLesson, ChallengeOption, LearningLocale, SavedLearningArtifact } from '../../services/interactiveCurriculumTypes';
import { localizeLearning } from '../../services/interactiveCurriculumTypes';
import { T1gerMascot3D } from '../T1gerMascot3D';
import { MicroToolLab } from './MicroToolLab';

interface AtomicLessonPlayerProps {
  lesson: AtomicLesson;
  locale: LearningLocale;
  onClose: () => void;
  onComplete: (lessonId: string) => void;
}

const ARTIFACT_STORAGE_KEY = 't1ger_learning_artifacts_v1';

const playFeedback = (correct: boolean) => {
  navigator.vibrate?.(correct ? [18, 24, 36] : [45, 35, 45]);
  try {
    const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;
    const context = new AudioContextConstructor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(correct ? 520 : 170, context.currentTime);
    if (correct) oscillator.frequency.exponentialRampToValueAtTime(760, context.currentTime + 0.12);
    gain.gain.setValueAtTime(0.04, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.16);
    oscillator.addEventListener('ended', () => void context.close(), { once: true });
  } catch {
    // Audio feedback is progressive enhancement; haptics and visual feedback remain.
  }
};

function saveArtifact(artifact: SavedLearningArtifact) {
  try {
    const current = JSON.parse(localStorage.getItem(ARTIFACT_STORAGE_KEY) || '[]') as SavedLearningArtifact[];
    const withoutDuplicate = current.filter((item) => item.lessonId !== artifact.lessonId);
    localStorage.setItem(ARTIFACT_STORAGE_KEY, JSON.stringify([artifact, ...withoutDuplicate].slice(0, 100)));
  } catch {
    localStorage.setItem(ARTIFACT_STORAGE_KEY, JSON.stringify([artifact]));
  }
}

interface ChallengeViewProps {
  lesson: AtomicLesson;
  locale: LearningLocale;
  onMastered: (correct: boolean) => void;
}

const ChallengeView: React.FC<ChallengeViewProps> = ({ lesson, locale, onMastered }) => {
  const challenge = lesson.phases[1].challenge;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [order, setOrder] = useState<ChallengeOption[]>(() => [...(challenge.options || [])].reverse());
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);

  const rightOptions = useMemo(() => [...(challenge.pairs || [])].reverse(), [challenge.pairs]);
  const ready = challenge.kind === 'matching'
    ? Object.keys(matches).length === (challenge.pairs?.length || 0)
    : challenge.kind === 'ordering'
      ? order.length > 0
      : selectedId !== null;

  const checkAnswer = () => {
    let nextCorrect = false;
    if (challenge.kind === 'ordering') nextCorrect = order.map((item) => item.id).join('|') === (challenge.orderedIds || []).join('|');
    else if (challenge.kind === 'matching') nextCorrect = (challenge.pairs || []).every((pair) => matches[pair.id] === pair.id);
    else nextCorrect = challenge.options?.find((option) => option.id === selectedId)?.correct === true;
    setCorrect(nextCorrect);
    setChecked(true);
    playFeedback(nextCorrect);
    onMastered(nextCorrect);
  };

  const retry = () => {
    setChecked(false);
    setCorrect(false);
    if (challenge.kind === 'matching') setMatches({});
    if (challenge.kind !== 'ordering') setSelectedId(null);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    setOrder((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    navigator.vibrate?.(8);
  };

  return (
    <div className="space-y-5">
      <div>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FF8A2A]">{locale === 'es' ? 'DESAFÍO FLASH' : 'FLASH CHALLENGE'}</span>
        <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-white">{localizeLearning(lesson.phases[1].title, locale)}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-zinc-300">{localizeLearning(challenge.prompt, locale)}</p>
      </div>

      {(challenge.kind === 'multiple_choice' || challenge.kind === 'error_detection') && (
        <div className="space-y-2.5">
          {challenge.options?.map((option, index) => {
            const selected = selectedId === option.id;
            const revealCorrect = checked && option.correct;
            const revealWrong = checked && selected && !option.correct;
            return (
              <button key={option.id} type="button" disabled={checked} onClick={() => { setSelectedId(option.id); navigator.vibrate?.(8); }} className={`w-full rounded-2xl border p-4 text-left transition active:scale-[0.985] ${revealCorrect ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-100' : revealWrong ? 'border-red-400/60 bg-red-400/10 text-red-100' : selected ? 'border-[#FF7300]/70 bg-[#FF7300]/10 text-white' : 'border-white/10 bg-white/[0.025] text-zinc-300 hover:border-white/20'}`}>
                <span className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-current/30 font-mono text-xs font-bold">{String.fromCharCode(65 + index)}</span>
                  <span className="pt-0.5 text-sm leading-relaxed">{localizeLearning(option.label, locale)}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {challenge.kind === 'ordering' && (
        <div className="space-y-2.5">
          {order.map((option, index) => (
            <motion.div layout key={option.id} className={`grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 rounded-2xl border p-3 ${checked ? (correct ? 'border-emerald-400/50 bg-emerald-400/8' : 'border-red-400/40 bg-red-400/8') : 'border-white/10 bg-white/[0.025]'}`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] font-mono text-xs font-bold text-[#FF9B4A]">{index + 1}</span>
              <span className="text-sm leading-snug text-zinc-200">{localizeLearning(option.label, locale)}</span>
              <span className="grid grid-cols-2 gap-1">
                <button type="button" disabled={checked || index === 0} onClick={() => move(index, -1)} className="t1ger-icon-button h-8 w-8 disabled:opacity-20" aria-label={locale === 'es' ? 'Mover arriba' : 'Move up'}><ArrowUp size={15} weight="bold" /></button>
                <button type="button" disabled={checked || index === order.length - 1} onClick={() => move(index, 1)} className="t1ger-icon-button h-8 w-8 disabled:opacity-20" aria-label={locale === 'es' ? 'Mover abajo' : 'Move down'}><ArrowDown size={15} weight="bold" /></button>
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {challenge.kind === 'matching' && (
        <div className="space-y-3">
          {challenge.pairs?.map((pair) => (
            <label key={pair.id} className="block rounded-2xl border border-white/10 bg-white/[0.025] p-3.5">
              <span className="mb-2 block text-xs font-semibold text-zinc-200">{localizeLearning(pair.left, locale)}</span>
              <select disabled={checked} value={matches[pair.id] || ''} onChange={(event) => setMatches((current) => ({ ...current, [pair.id]: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-[#17171C] px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF7300]/60">
                <option value="">{locale === 'es' ? 'Selecciona la consecuencia' : 'Select the consequence'}</option>
                {rightOptions.map((right) => <option key={right.id} value={right.id}>{localizeLearning(right.right, locale)}</option>)}
              </select>
            </label>
          ))}
        </div>
      )}

      <AnimatePresence>
        {checked && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`rounded-2xl border p-4 ${correct ? 'border-emerald-400/35 bg-emerald-400/[0.08]' : 'border-red-400/35 bg-red-400/[0.08]'}`}>
            <div className="flex items-start gap-3">
              {correct ? <CheckCircle className="mt-0.5 shrink-0 text-emerald-400" size={21} weight="fill" /> : <Target className="mt-0.5 shrink-0 text-red-300" size={21} weight="bold" />}
              <div>
                <p className="text-sm font-bold text-white">{localizeLearning(correct ? challenge.feedback.correct : challenge.feedback.incorrect, locale)}</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">{localizeLearning(challenge.feedback.explanation, locale)}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!checked ? (
        <button type="button" disabled={!ready} onClick={checkAnswer} className="t1ger-primary-button w-full disabled:cursor-not-allowed disabled:opacity-35"><Check size={20} weight="bold" />{locale === 'es' ? 'Comprobar decisión' : 'Check decision'}</button>
      ) : !correct ? (
        <button type="button" onClick={retry} className="t1ger-secondary-button w-full">{locale === 'es' ? 'Corregir y dominar' : 'Correct and master'}</button>
      ) : null}
    </div>
  );
};

export const AtomicLessonPlayer: React.FC<AtomicLessonPlayerProps> = ({ lesson, locale, onClose, onComplete }) => {
  const { setActiveView } = useT1ger();
  const { appUser } = useAuth();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [impactStep, setImpactStep] = useState(0);
  const [challengeMastered, setChallengeMastered] = useState(false);
  const [artifact, setArtifact] = useState<SavedLearningArtifact | null>(null);
  const [bridging, setBridging] = useState(false);
  const [bridgeError, setBridgeError] = useState<string | null>(null);
  const queuedRef = useRef(false);
  const phase = lesson.phases[phaseIndex];

  const persistArtifact = (nextArtifact: SavedLearningArtifact) => {
    saveArtifact(nextArtifact);
    setArtifact(nextArtifact);
  };

  const prepareFieldMission = () => {
    if (!artifact || bridging || queuedRef.current) return;
    setBridging(true);
    setBridgeError(null);
    try {
      FieldMissionService.queueFromLesson(lesson, artifact, appUser?.uid || 'local', locale);
      queuedRef.current = true;
      setPhaseIndex(3);
      navigator.vibrate?.([18, 28, 42]);
    } catch (error) {
      setBridgeError(locale === 'es' ? 'No pudimos preparar la misión. Tu herramienta sigue guardada; toca para reintentar.' : 'We could not prepare the mission. Your tool is still saved; tap to retry.');
      console.error('Field mission handoff failed:', error);
    } finally {
      setBridging(false);
    }
  };

  const openBuild = () => {
    onComplete(lesson.id);
    setActiveView('build');
  };

  const next = () => {
    if (phaseIndex === 0 && impactStep < 2) setImpactStep((current) => current + 1);
    else if (phaseIndex === 0) setPhaseIndex(1);
    else if (phaseIndex === 1 && challengeMastered) setPhaseIndex(2);
    else if (phaseIndex === 2) prepareFieldMission();
  };

  const labels = locale === 'es' ? ['Orb', 'Desafío', 'Acción', 'Misión'] : ['Orb', 'Challenge', 'Action', 'Mission'];
  const continueLabel = phaseIndex === 0
    ? impactStep === 0
      ? (locale === 'es' ? 'Abrir Orb' : 'Open Orb')
      : impactStep === 1
        ? (locale === 'es' ? 'Construir el modelo' : 'Build the model')
        : (locale === 'es' ? 'Probar mi criterio' : 'Test my judgment')
    : (locale === 'es' ? 'Continuar' : 'Continue');

  const player = (
    <div className="fixed inset-0 z-[200] min-h-[100dvh] overflow-hidden bg-[#09090B] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_-8%,rgba(255,115,0,.15),transparent_34%),linear-gradient(180deg,#09090B_0%,#0D0D11_100%)]" />
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-lg flex-col">
        <header className="border-b border-white/8 bg-[#09090B]/88 px-4 pb-3 pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button type="button" onClick={onClose} className="t1ger-icon-button" aria-label={locale === 'es' ? 'Cerrar lección' : 'Close lesson'}><X size={19} weight="bold" /></button>
            <div className="min-w-0 text-center">
              <p className="truncate text-xs font-bold text-zinc-200">{localizeLearning(lesson.title, locale)}</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">03:00 · {lesson.phases[3].xp + 50} XP LOCKED</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/[0.035] text-[#FF8A2A]"><Sparkle size={19} weight="fill" /></span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {lesson.phases.map((item, index) => (
              <div key={item.type}>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/8"><motion.div initial={false} animate={{ scaleX: index <= phaseIndex ? 1 : 0 }} transition={{ type: 'spring', stiffness: 180, damping: 24 }} style={{ transformOrigin: 'left' }} className={`h-full rounded-full ${index < phaseIndex ? 'bg-emerald-400' : index === phaseIndex ? 'bg-[#FF7300]' : 'bg-transparent'}`} /></div>
                <span className={`mt-1 block text-center font-mono text-[8px] uppercase tracking-wide ${index === phaseIndex ? 'text-zinc-200' : 'text-zinc-600'}`}>{labels[index]}</span>
              </div>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-5">
          <AnimatePresence mode="wait">
            <motion.section key={phase.type} initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ type: 'spring', stiffness: 170, damping: 24 }} className="mx-auto min-h-full w-full max-w-md">
              {phase.type === 'impact' && (
                <AnimatePresence mode="wait">
                  {impactStep === 0 ? (
                    <motion.div key="prime" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} className="min-h-full">
                      <div className="flex items-center justify-between gap-4"><div><span className="font-mono text-[9px] font-bold uppercase tracking-[.2em] text-[#FF8A2A]">{locale === 'es' ? 'ANTES DE APRENDER' : 'BEFORE YOU LEARN'}</span><h1 className="mt-2 text-[2rem] font-bold leading-[1.02] tracking-[-.04em]">{localizeLearning(lesson.learningDesign.curiosityQuestion, locale)}</h1></div><div className="h-28 w-28 shrink-0"><T1gerMascot3D mood="thinking" closeUp className="h-full w-full" /></div></div>
                      <p className="mt-6 text-sm leading-relaxed text-zinc-400">{locale === 'es' ? 'No tienes que responder todavía. Dale a tu cerebro una pregunta para que sepa qué buscar.' : 'You do not need to answer yet. Give your brain a question so it knows what to look for.'}</p>
                      <div className="mt-6 rounded-[1.5rem] border border-[#FF7300]/22 bg-[#FF7300]/[.07] p-5"><div className="flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[.16em] text-[#FF9B4A]"><Brain size={17} weight="duotone" />{locale === 'es' ? 'HAZ UNA PREDICCIÓN' : 'MAKE A PREDICTION'}</div><p className="mt-3 text-base font-semibold leading-relaxed text-white">{localizeLearning(lesson.learningDesign.predictionPrompt, locale)}</p><p className="mt-3 text-[11px] leading-relaxed text-zinc-500">{locale === 'es' ? 'Una predicción imperfecta crea una ranura mental para la respuesta correcta.' : 'An imperfect prediction creates a mental slot for the correct answer.'}</p></div>
                      <div className="mt-5 grid grid-cols-3 gap-2">{lesson.learningDesign.summaryPoints.map((point, index) => <div key={index} className="rounded-xl border border-white/8 bg-white/[.025] p-3"><span className="font-mono text-[9px] font-bold text-zinc-600">0{index + 1}</span><p className="mt-2 line-clamp-3 text-[10px] leading-relaxed text-zinc-400">{localizeLearning(point, locale)}</p></div>)}</div>
                    </motion.div>
                  ) : impactStep === 1 ? (
                    <motion.div key="story" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}>
                      <span className="font-mono text-[9px] font-bold uppercase tracking-[.2em] text-[#FF8A2A]">{localizeLearning(phase.eyebrow, locale)} · ORB</span>
                      <h1 className="mt-2 text-[2rem] font-bold leading-[1.02] tracking-[-.04em]">{localizeLearning(phase.title, locale)}</h1>
                      <p className="mt-4 text-sm leading-relaxed text-zinc-400">{localizeLearning(phase.body, locale)}</p>
                      <div className="relative mt-7 space-y-3 before:absolute before:bottom-6 before:left-[1.15rem] before:top-6 before:w-px before:bg-gradient-to-b before:from-[#FF7300] before:via-white/15 before:to-emerald-400/40">{lesson.learningDesign.storyBeats.map((storyBeat, index) => <motion.article key={index} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .1 }} className="relative grid grid-cols-[2.35rem_1fr] gap-3 rounded-2xl border border-white/8 bg-[#121216] p-4"><span className={`relative z-[1] grid h-9 w-9 place-items-center rounded-xl border font-mono text-[10px] font-bold ${index === 2 ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-300' : 'border-[#FF7300]/30 bg-[#FF7300]/10 text-[#FF9B4A]'}`}>{index + 1}</span><div><h2 className="text-sm font-bold">{localizeLearning(storyBeat.title, locale)}</h2><p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{localizeLearning(storyBeat.body, locale)}</p></div></motion.article>)}</div>
                    </motion.div>
                  ) : (
                    <motion.div key="schema" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}>
                      <div className="flex items-center gap-2"><span className="grid h-10 w-10 place-items-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300"><Lightbulb size={21} weight="duotone" /></span><div><span className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-amber-300">{locale === 'es' ? 'MODELO MENTAL' : 'MENTAL MODEL'}</span><h1 className="mt-0.5 text-2xl font-bold tracking-tight">{localizeLearning(lesson.title, locale)}</h1></div></div>
                      {phase.metric && <div className="mt-6 border-y border-white/8 py-5"><p className="font-mono text-4xl font-semibold tabular-nums tracking-[-.05em] text-[#FF8A2A]">{phase.metric.value}</p><p className="mt-1 max-w-[32ch] text-xs leading-relaxed text-zinc-400">{localizeLearning(phase.metric.label, locale)}</p></div>}
                      <div className="mt-5 rounded-2xl border border-red-400/18 bg-red-400/[.055] p-4"><span className="font-mono text-[9px] font-bold uppercase tracking-[.16em] text-red-300">{locale === 'es' ? 'ERROR INTUITIVO' : 'INTUITIVE TRAP'}</span><p className="mt-2 text-sm leading-relaxed text-zinc-200">{localizeLearning(lesson.learningDesign.misconception, locale)}</p></div>
                      <div className="mt-5"><div className="flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[.16em] text-zinc-500"><ListChecks size={16} weight="bold" />{locale === 'es' ? 'COMPRIME EL ORB' : 'COMPRESS THE ORB'}</div><div className="mt-3 space-y-2">{lesson.learningDesign.summaryPoints.map((point, index) => <div key={index} className="flex gap-3 rounded-xl bg-white/[.025] p-3 text-xs leading-relaxed text-zinc-300"><CheckCircle size={17} weight="fill" className="shrink-0 text-emerald-400" />{localizeLearning(point, locale)}</div>)}</div></div>
                      <div className="mt-5 border-l-2 border-[#FF7300] bg-white/[.025] py-3 pl-4 pr-3"><span className="font-mono text-[9px] font-semibold uppercase tracking-[.16em] text-zinc-500">{locale === 'es' ? 'REGLA TÁCTICA' : 'TACTICAL RULE'}</span><p className="mt-1 text-sm font-semibold leading-relaxed text-white">{localizeLearning(phase.tacticalRule, locale)}</p></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
              {phase.type === 'challenge' && <ChallengeView lesson={lesson} locale={locale} onMastered={(correct) => setChallengeMastered(correct)} />}
              {phase.type === 'action' && <MicroToolLab lessonId={lesson.id} trackId={lesson.trackId} widget={phase.widget} locale={locale} onCommit={persistArtifact} />}
              {phase.type === 'reward' && (
                <div className="flex min-h-full flex-col items-center justify-center py-4 text-center">
                  <motion.div initial={{ scale: 0.72, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 150, damping: 17 }} className="h-44 w-44"><T1gerMascot3D mood="beast" className="h-full w-full" /></motion.div>
                  <span className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FF8A2A]">{locale === 'es' ? 'MISIÓN DE CAMPO LISTA' : 'FIELD MISSION READY'}</span>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">{locale === 'es' ? 'Aprender no es terminar.' : 'Learning is not finishing.'}</h2>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">{locale === 'es' ? 'Tu micro-herramienta está lista. Ejecuta la acción real y sube evidencia en Build para liberar XP, proteger la racha y rescatar a T1GER.' : 'Your micro-tool is ready. Execute the real action and upload proof in Build to unlock XP, protect your streak, and rescue T1GER.'}</p>
                  <div className="mt-7 grid w-full grid-cols-3 divide-x divide-white/8 border-y border-white/8 py-4">
                    <div><Sparkle className="mx-auto text-[#FF8A2A]" size={20} weight="fill" /><p className="mt-1 font-mono text-lg font-bold tabular-nums">3:00</p><span className="text-[9px] uppercase tracking-wider text-zinc-500">{locale === 'es' ? 'Aprendido' : 'Learned'}</span></div>
                    <div><LockKey className="mx-auto text-amber-400" size={20} weight="fill" /><p className="mt-1 font-mono text-lg font-bold tabular-nums">+{lesson.phases[3].xp + 50}</p><span className="text-[9px] uppercase tracking-wider text-zinc-500">XP {locale === 'es' ? 'pend.' : 'pending'}</span></div>
                    <div><Target className="mx-auto text-emerald-400" size={20} weight="fill" /><p className="mt-1 font-mono text-lg font-bold tabular-nums">1</p><span className="text-[9px] uppercase tracking-wider text-zinc-500">{locale === 'es' ? 'Prueba' : 'Proof'}</span></div>
                  </div>
                  {artifact && <div className="mt-5 w-full rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left"><div className="flex items-center gap-2 text-xs font-bold text-zinc-200"><LockKey size={16} weight="bold" className="text-[#FF8A2A]" />{artifact.title}</div><p className="mt-2 line-clamp-3 whitespace-pre-line text-xs leading-relaxed text-zinc-500">{artifact.summary}</p></div>}
                  {bridgeError && <button type="button" onClick={prepareFieldMission} className="mt-4 text-xs font-semibold text-red-300 underline underline-offset-4">{bridgeError}</button>}
                </div>
              )}
            </motion.section>
          </AnimatePresence>
        </main>

        <footer className="border-t border-white/8 bg-[#09090B]/92 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
          {(phaseIndex > 0 && phaseIndex < 3 || phaseIndex === 0 && impactStep > 0) && <button type="button" onClick={() => { if (phaseIndex === 0) setImpactStep((current) => Math.max(0, current - 1)); else setPhaseIndex((current) => Math.max(0, current - 1)); }} className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 transition hover:text-zinc-200"><ArrowLeft size={15} weight="bold" />{locale === 'es' ? 'Anterior' : 'Previous'}</button>}
          {phaseIndex === 3 ? (
            <button type="button" onClick={openBuild} className="t1ger-primary-button w-full">
              {locale === 'es' ? 'Ejecutar ahora en Build' : 'Execute now in Build'}
              <ArrowRight size={20} weight="bold" />
            </button>
          ) : phaseIndex === 1 && !challengeMastered ? null : (
            <button type="button" onClick={next} disabled={(phaseIndex === 1 && !challengeMastered) || (phaseIndex === 2 && !artifact) || bridging} className="t1ger-primary-button w-full disabled:cursor-not-allowed disabled:opacity-35">
              {phaseIndex === 2 ? (locale === 'es' ? 'Crear Misión de Campo' : 'Create Field Mission') : continueLabel}
              <ArrowRight size={20} weight="bold" />
            </button>
          )}
        </footer>
      </div>
    </div>
  );

  return createPortal(player, document.body);
};
