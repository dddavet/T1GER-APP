import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Check, CheckCircle, Sparkle, TrendUp, X } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { useBrain } from '../../contexts/BrainContext';
import { useT1ger } from '../../contexts/T1gerContext';
import { FieldMissionService, isFieldMissionComplete, type FieldMission } from '../../services/fieldMissionService';
import { readLearningArtifacts, saveLearningArtifact } from '../../services/learningArtifactService';
import type { AtomicLesson, LearningLocale, SavedLearningArtifact } from '../../services/interactiveCurriculumTypes';
import { localizeLearning } from '../../services/interactiveCurriculumTypes';
import { SoundEffects } from '../../services/soundEffects';
import { ApplyMissionModal } from '../apply/ApplyMissionModal';
import { fireRewardConfetti } from '../ui/confetti';
import { MicroToolLab } from './MicroToolLab';

type Stage = 'prediction' | 'learn' | 'interact' | 'tool' | 'apply' | 'master' | 'reward';

interface Props {
  lesson: AtomicLesson;
  locale: LearningLocale;
  onClose: () => void;
  onComplete: (lessonId: string) => void;
  reviewOnly?: boolean;
}

const stageGroup = (stage: Stage) => stage === 'apply' ? 'apply' : stage === 'master' || stage === 'reward' ? 'master' : 'learn';

export const GoldStandardLessonPlayer: React.FC<Props> = ({ lesson, locale, onClose, onComplete, reviewOnly = false }) => {
  const design = lesson.learningDesign.goldStandard!;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const { appUser } = useAuth();
  const { brainState, completeMission, reviewMission } = useBrain();
  const { addXP } = useT1ger();
  const userId = appUser?.uid || 'local';
  const tr = (es: string, en: string) => locale === 'es' ? es : en;
  const sessionKey = `t1ger_gold_session_v1_${userId}_${lesson.id}`;
  const pendingStage = localStorage.getItem(sessionKey) as 'master' | 'reward' | null;
  const isSpacedReview = reviewOnly && !pendingStage;

  const existingMission = useMemo(() => FieldMissionService.list(userId).find(item => item.lessonId === lesson.id), [lesson.id, userId]);
  const existingArtifact = useMemo(() => readLearningArtifacts(userId).find(item => item.lessonId === lesson.id) || null, [lesson.id, userId]);

  // Session resume: If an artifact exists but mission was interrupted, ensure mission is queued
  const [artifact, setArtifact] = useState<SavedLearningArtifact | null>(existingArtifact);
  const [mission, setMission] = useState<FieldMission | null>(() => {
    if (existingMission) return existingMission;
    if (existingArtifact) {
      try {
        return FieldMissionService.queueFromLesson(lesson, existingArtifact, userId, locale, 100);
      } catch {
        return null;
      }
    }
    return null;
  });

  const initialStage: Stage = pendingStage === 'reward'
    ? 'reward'
    : pendingStage === 'master' || reviewOnly || (existingMission && isFieldMissionComplete(existingMission))
    ? 'master'
    : mission
      ? 'apply'
      : existingArtifact
        ? 'tool'
        : 'prediction';

  const [stage, setStage] = useState<Stage>(initialStage);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [predictionCommitted, setPredictionCommitted] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<'yr1' | 'yr10' | 'yr20'>('yr10');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [challengeChecked, setChallengeChecked] = useState(false);
  const [challengeCorrect, setChallengeCorrect] = useState(false);
  const [bridgeError, setBridgeError] = useState('');
  const [masterId, setMasterId] = useState<string | null>(null);
  const [masterChecked, setMasterChecked] = useState(false);
  const [rewardXp, setRewardXp] = useState(lesson.phases[3].xp + 50);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => { if (dialog?.open) dialog.close(); };
  }, []);

  useEffect(() => {
    if (dialogRef.current) dialogRef.current.scrollTop = 0;
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [stage]);

  const challenge = lesson.phases[1].challenge;

  const commitPrediction = () => {
    if (!predictionId) return;
    setPredictionCommitted(true);
    const chosen = design.prediction.options.find(o => o.id === predictionId);
    if (chosen?.correct) {
      SoundEffects.playCorrect();
      navigator.vibrate?.(18);
    } else {
      SoundEffects.playTap();
      navigator.vibrate?.([25, 20, 25]);
    }
  };

  const saveTool = (nextArtifact: SavedLearningArtifact): FieldMission | null => {
    saveLearningArtifact(userId, nextArtifact);
    setArtifact(nextArtifact);
    try {
      const nextMission = FieldMissionService.queueFromLesson(lesson, nextArtifact, userId, locale, challengeCorrect ? 100 : 75);
      setMission(nextMission);
      setBridgeError('');
      return nextMission;
    } catch (error) {
      console.error('Gold lesson Apply preparation failed:', error);
      setBridgeError(tr('Tu regla está guardada, pero no pudimos preparar Aplicar. Inténtalo de nuevo.', 'Your rule is saved, but we could not prepare Apply. Try again.'));
      return null;
    }
  };

  const handleToolCommitAndContinue = (nextArtifact: SavedLearningArtifact) => {
    const nextMission = saveTool(nextArtifact);
    if (nextMission) {
      setStage('apply');
    }
  };

  const completeApply = async () => {
    if (!mission) return;
    await addXP(mission.lessonXp + mission.executionXp, 2, `mission:${mission.id}`);
    completeMission(lesson.id, mission.learningScore || (challengeCorrect ? 100 : 75));
    completeMission(mission.id, 100);
  };

  const handleSelectChallenge = (id: string) => {
    setChallengeId(id);
    const correct = challenge.options?.find(option => option.id === id)?.correct === true;
    setChallengeCorrect(correct);
    setChallengeChecked(true);
    navigator.vibrate?.(correct ? 18 : [35, 25, 35]);
    correct ? SoundEffects.playCorrect() : SoundEffects.playIncorrect();
  };

  const handleSelectMaster = (id: string) => {
    setMasterId(id);
    setMasterChecked(true);
    const correct = design.master.options.find(option => option.id === id)?.correct === true;
    navigator.vibrate?.(correct ? 18 : [35, 25, 35]);
    correct ? SoundEffects.playCorrect() : SoundEffects.playIncorrect();
  };

  const finishMaster = (score: 40 | 60 | 80 | 100) => {
    reviewMission(lesson.id, score);
    if (isSpacedReview) {
      onComplete(lesson.id);
      return;
    }
    localStorage.setItem(sessionKey, 'reward');
    setStage('reward');
    navigator.vibrate?.([20, 35, 50]);
    fireRewardConfetti();
    SoundEffects.playCompletionFanfare();
  };

  const currentGroup = stageGroup(stage);
  const progress = stage === 'prediction' ? 12 : stage === 'learn' ? 28 : stage === 'interact' ? 43 : stage === 'tool' ? 58 : stage === 'apply' ? 74 : stage === 'master' ? 90 : 100;

  const body = stage === 'prediction' ? (
    <section data-stage="prediction" className="space-y-4">
      <div className="space-y-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF8A2A]">{tr('Paso 1 · Predicción real', 'Step 1 · Real prediction')}</p>
        <h2 className="text-2xl font-bold tracking-tight text-white">{localizeLearning(design.prediction.prompt, locale)}</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {tr('Compara a dos inversores. Elige tu predicción antes de ver los números reales.', 'Compare two investors. Choose your prediction before seeing the actual numbers.')}
        </p>
      </div>

      {/* Scenario cards comparing Investor A vs Investor B */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className={`rounded-2xl border p-4 transition-all ${predictionId === 'early' ? 'border-[#FF7300] bg-[#FF7300]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]' : 'border-white/10 bg-white/[0.025]'}`}>
          <button
            type="button"
            disabled={predictionCommitted}
            aria-pressed={predictionId === 'early'}
            onClick={() => setPredictionId('early')}
            className="w-full text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400">{tr('Inversor A · Empieza pronto', 'Investor A · Starts early')}</span>
              <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${predictionId === 'early' ? 'border-[#FF7300] bg-[#FF7300]' : 'border-white/20'}`}>
                {predictionId === 'early' && <span className="h-1.5 w-1.5 rounded-full bg-black" />}
              </span>
            </div>
            <p className="mt-2 text-lg font-bold text-white">$100 / {tr('mes', 'mo')}</p>
            <p className="text-xs text-zinc-400">{tr('Durante 20 años al 8% anual', 'For 20 years at 8% annual return')}</p>
            <div className="mt-2 rounded-xl bg-black/30 p-2.5 text-[11px] text-zinc-400">
              <span className="font-semibold text-zinc-300">{tr('Aporte total:', 'Total deposited:')}</span> $24,000
            </div>
          </button>
        </div>

        <div className={`rounded-2xl border p-4 transition-all ${predictionId === 'late' ? 'border-[#FF7300] bg-[#FF7300]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]' : 'border-white/10 bg-white/[0.025]'}`}>
          <button
            type="button"
            disabled={predictionCommitted}
            aria-pressed={predictionId === 'late'}
            onClick={() => setPredictionId('late')}
            className="w-full text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-400">{tr('Inversor B · Empieza tarde', 'Investor B · Starts late')}</span>
              <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${predictionId === 'late' ? 'border-[#FF7300] bg-[#FF7300]' : 'border-white/20'}`}>
                {predictionId === 'late' && <span className="h-1.5 w-1.5 rounded-full bg-black" />}
              </span>
            </div>
            <p className="mt-2 text-lg font-bold text-white">$200 / {tr('mes', 'mo')}</p>
            <p className="text-xs text-zinc-400">{tr('Durante 8 años al 8% anual', 'For 8 years at 8% annual return')}</p>
            <div className="mt-2 rounded-xl bg-black/30 p-2.5 text-[11px] text-zinc-400">
              <span className="font-semibold text-zinc-300">{tr('Aporte total:', 'Total deposited:')}</span> $19,200
            </div>
          </button>
        </div>
      </div>

      {/* Outcome reveal after committing */}
      {predictionCommitted && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="rounded-2xl border border-[#FF7300]/30 bg-[#FF7300]/[0.08] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#FF7300]/20 text-[#FF9B4A]">
                <TrendUp size={14} weight="bold" />
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-[#FF9B4A]">
                {predictionId === 'early'
                  ? tr('¡Predicción acertada!', 'Spot on prediction!')
                  : tr('Resultado sorprendente', 'Surprising outcome')}
              </p>
            </div>

            {/* Visual comparison bars */}
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-zinc-200">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle size={14} weight="fill" />
                    {tr('Inversor A (20 años)', 'Investor A (20 yrs)')}
                  </span>
                  <span className="font-mono text-[#FF9B4A] font-bold">~$58,902</span>
                </div>
                <div className="h-3.5 w-full rounded-full bg-zinc-800 overflow-hidden flex">
                  <div style={{ width: '40%' }} className="h-full bg-zinc-500" title={tr('Aportes: $24k', 'Deposited: $24k')} />
                  <div style={{ width: '60%' }} className="h-full bg-emerald-500" title={tr('Crecimiento: $34.9k', 'Growth: $34.9k')} />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-mono">
                  <span>{tr('Aportó: $24k', 'Deposited: $24k')}</span>
                  <span className="text-emerald-400">{tr('+$34.9k de interés', '+$34.9k interest')}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-zinc-200">
                  <span className="text-amber-400">{tr('Inversor B (8 años)', 'Investor B (8 yrs)')}</span>
                  <span className="font-mono text-zinc-300 font-bold">~$26,779</span>
                </div>
                <div className="h-3.5 w-full rounded-full bg-zinc-800 overflow-hidden flex">
                  <div style={{ width: '32%' }} className="h-full bg-zinc-500" title={tr('Aportes: $19.2k', 'Deposited: $19.2k')} />
                  <div style={{ width: '14%' }} className="h-full bg-amber-500" title={tr('Crecimiento: $7.6k', 'Growth: $7.6k')} />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-mono">
                  <span>{tr('Aportó: $19.2k', 'Deposited: $19.2k')}</span>
                  <span className="text-amber-400">{tr('+$7.6k de interés', '+$7.6k interest')}</span>
                </div>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-zinc-300 border-t border-white/10 pt-2.5">
              {localizeLearning(design.prediction.reveal, locale)}
            </p>
          </div>
        </motion.div>
      )}

      {/* Primary CTA: Locks prediction first, then immediately transforms into Next Action */}
      {!predictionCommitted ? (
        <button
          type="button"
          disabled={!predictionId}
          onClick={commitPrediction}
          className="t1ger-primary-button w-full disabled:opacity-35 cursor-pointer"
        >
          {tr('Confirmar mi predicción', 'Lock my prediction')}
          <Check size={20} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setStage('learn')}
          className="t1ger-primary-button w-full cursor-pointer"
        >
          {tr('Ver por qué funciona', 'See why it works')}
          <ArrowRight size={20} />
        </button>
      )}
    </section>
  ) : stage === 'learn' ? (
    <section data-stage="learn" className="space-y-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF8A2A]">{tr('Paso 2 · El modelo mental', 'Step 2 · The mental model')}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">{localizeLearning(lesson.phases[0].title, locale)}</h2>
      </div>

      {/* Interactive S-Curve Graph with Milestone Markers */}
      <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>{tr('Curva de capitalización compuesta', 'Compounding curve')}</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {selectedMilestone === 'yr1'
              ? tr('Hito: Año 1 (Base)', 'Milestone: Year 1 (Base)')
              : selectedMilestone === 'yr10'
              ? tr('Hito: Año 10 (Cruce)', 'Milestone: Year 10 (Crossover)')
              : tr('Hito: Año 20 (Exponencial)', 'Milestone: Year 20 (Exponential)')}
          </span>
        </div>

        <svg viewBox="0 0 340 160" role="img" aria-label={tr('La curva de interés compuesto acelera con el tiempo', 'Compounding curve accelerates over time')} className="h-auto w-full">
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#71717A" />
              <stop offset="50%" stopColor="#FF7300" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="areaFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Shaded growth area */}
          <path d="M 20 135 L 20 135 C 90 133 160 120 210 82 C 255 48 290 30 320 20 L 320 135 Z" fill="url(#areaFill)" />

          {/* Contributions baseline (linear) */}
          <line x1="20" y1="135" x2="320" y2="78" stroke="#52525B" strokeWidth="2" strokeDasharray="5 5" />
          <text x="24" y="125" fill="#71717A" fontSize="9" fontFamily="monospace">{tr('Aportes directos', 'Direct contributions')}</text>

          {/* Compounding Curve */}
          <path d="M 20 135 C 90 133 160 120 210 82 C 255 48 290 30 320 20" fill="none" stroke="url(#curveGradient)" strokeWidth="4" strokeLinecap="round" />

          {/* Milestone markers on curve */}
          {/* Year 1 */}
          <circle cx="20" cy="135" r={selectedMilestone === 'yr1' ? '7' : '4'} fill={selectedMilestone === 'yr1' ? '#FF7300' : '#71717A'} stroke="#09090B" strokeWidth="2" />
          {/* Year 8 (Crossover) */}
          <circle cx="210" cy="82" r={selectedMilestone === 'yr10' ? '8' : '5'} fill={selectedMilestone === 'yr10' ? '#10B981' : '#34D399'} stroke="#09090B" strokeWidth="2" />
          {/* Year 20 */}
          <circle cx="320" cy="20" r={selectedMilestone === 'yr20' ? '8' : '5'} fill={selectedMilestone === 'yr20' ? '#10B981' : '#059669'} stroke="#09090B" strokeWidth="2" />

          {/* Axis Labels */}
          <text x="20" y="152" fill={selectedMilestone === 'yr1' ? '#FF8A2A' : '#71717A'} fontSize="9" fontFamily="monospace" fontWeight={selectedMilestone === 'yr1' ? 'bold' : 'normal'}>Año 1</text>
          <text x="192" y="152" fill={selectedMilestone === 'yr10' ? '#34D399' : '#71717A'} fontSize="9" fontFamily="monospace" fontWeight={selectedMilestone === 'yr10' ? 'bold' : 'normal'}>{tr('Año 10', 'Year 10')}</text>
          <text x="290" y="152" fill={selectedMilestone === 'yr20' ? '#34D399' : '#71717A'} fontSize="9" fontFamily="monospace" fontWeight={selectedMilestone === 'yr20' ? 'bold' : 'normal'}>Año 20</text>
        </svg>

        {/* 3 Milestone Exploration Tabs */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => { setSelectedMilestone('yr1'); navigator.vibrate?.(12); }}
            className={`rounded-xl py-2 px-1 text-center text-xs font-semibold transition cursor-pointer ${
              selectedMilestone === 'yr1'
                ? 'border border-[#FF7300] bg-[#FF7300]/15 text-white'
                : 'border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tr('Año 1 · Inicio', 'Yr 1 · Start')}
          </button>
          <button
            type="button"
            onClick={() => { setSelectedMilestone('yr10'); navigator.vibrate?.(12); }}
            className={`rounded-xl py-2 px-1 text-center text-xs font-semibold transition cursor-pointer ${
              selectedMilestone === 'yr10'
                ? 'border border-emerald-400 bg-emerald-400/15 text-emerald-300'
                : 'border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tr('Año 10 · Cruce', 'Yr 10 · Crossover')}
          </button>
          <button
            type="button"
            onClick={() => { setSelectedMilestone('yr20'); navigator.vibrate?.(12); }}
            className={`rounded-xl py-2 px-1 text-center text-xs font-semibold transition cursor-pointer ${
              selectedMilestone === 'yr20'
                ? 'border border-emerald-400 bg-emerald-400/15 text-emerald-300'
                : 'border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tr('Año 20 · Exp.', 'Yr 20 · Exp.')}
          </button>
        </div>
      </div>

      {/* Dynamic Active Milestone Card */}
      <motion.div
        key={selectedMilestone}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="rounded-xl border border-white/10 bg-white/[0.025] p-3.5 space-y-1.5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white">
            {selectedMilestone === 'yr1'
              ? tr('Año 1 · El inicio lento', 'Year 1 · The slow start')
              : selectedMilestone === 'yr10'
              ? tr('Año 10 · El punto de cruce', 'Year 10 · The crossover point')
              : tr('Año 20 · Aceleración exponencial', 'Year 20 · Exponential acceleration')}
          </h3>
          <span className="text-[10px] font-mono text-zinc-400">
            {selectedMilestone === 'yr1'
              ? tr('Aportes: 92% · Interés: 8%', 'Deposits: 92% · Interest: 8%')
              : selectedMilestone === 'yr10'
              ? tr('Aportes: 66% · Interés: 34%', 'Deposits: 66% · Interest: 34%')
              : tr('Aportes: 40% · Interés: 60%', 'Deposits: 40% · Interest: 60%')}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-zinc-300">
          {selectedMilestone === 'yr1'
            ? tr('Casi todo el saldo viene de tu propio bolsillo. Parece aburrido y lento, pero estás construyendo la base que luego despegará.', 'Nearly all balance comes from your deposits. It feels slow, but you are building the foundation that will take off.')
            : selectedMilestone === 'yr10'
            ? tr('Momento clave: el crecimiento anual ya se acerca o supera el aporte anual de $1,200. El capital empieza a compartir el trabajo contigo.', 'Key moment: annual growth is now approaching or exceeding the $1,200 annual contribution. Capital begins sharing the work with you.')
            : tr('El efecto bola de nieve en su máxima expresión. Cerca del 60% del saldo final ($58,902) es crecimiento estimado generado por el tiempo.', 'The snowball effect at full power. Nearly 60% of the final balance ($58,902) is estimated growth generated by time.')}
        </p>
      </motion.div>

      {/* Persistent compact callout on unrecoverable lost time */}
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-3 flex items-start gap-2.5">
        <span className="text-amber-400 font-bold shrink-0 text-sm">⚠️</span>
        <div>
          <h4 className="text-xs font-bold text-amber-300">{tr('El tiempo perdido es irrecuperable', 'Lost time is unrecoverable')}</h4>
          <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-300">
            {tr('Esperar 5 años para empezar no te quita los primeros 5 años: te destruye los 5 años más exponenciales del final.', 'Waiting 5 years does not just remove the first 5 years: it destroys the most exponential 5 years at the very end.')}
          </p>
        </div>
      </div>

      <button type="button" onClick={() => setStage('interact')} className="t1ger-primary-button w-full cursor-pointer">
        {tr('Probar mi criterio', 'Test my judgment')}
        <ArrowRight size={20} />
      </button>
    </section>
  ) : stage === 'interact' ? (
    <section data-stage="interact" className="space-y-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF8A2A]">{tr('Paso 3 · Decisión práctica', 'Step 3 · Practical decision')}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">{localizeLearning(challenge.prompt, locale)}</h2>
      </div>

      <div className="space-y-2.5">
        {challenge.options?.map(option => (
          <button
            key={option.id}
            type="button"
            aria-pressed={challengeId === option.id}
            onClick={() => handleSelectChallenge(option.id)}
            className={`w-full rounded-2xl border p-4 text-left text-sm font-semibold transition-all cursor-pointer ${
              challengeId === option.id
                ? 'border-[#FF7300] bg-[#FF7300]/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'border-white/10 bg-white/[.025] text-zinc-300 hover:border-white/20'
            }`}
          >
            {localizeLearning(option.label, locale)}
          </button>
        ))}
      </div>

      {challengeChecked && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} role="status" className={`rounded-xl border p-4 text-sm ${challengeCorrect ? 'border-emerald-400/30 bg-emerald-400/5' : 'border-amber-400/30 bg-amber-400/5'}`}>
          <strong className="block text-white font-bold">{localizeLearning(challengeCorrect ? challenge.feedback.correct : challenge.feedback.incorrect, locale)}</strong>
          <p className="mt-1.5 text-zinc-300 leading-relaxed text-xs">{localizeLearning(challenge.feedback.explanation, locale)}</p>
        </motion.div>
      )}

      {/* Primary CTA: Available immediately once an option is selected */}
      <button
        type="button"
        disabled={!challengeId}
        onClick={() => setStage('tool')}
        className="t1ger-primary-button w-full disabled:opacity-35 cursor-pointer"
      >
        {tr('Construir mi regla', 'Build my rule')}
        <ArrowRight size={20} />
      </button>
    </section>
  ) : stage === 'tool' ? (
    <section data-stage="tool" className="space-y-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF8A2A]">{tr('Paso 4 · Simulación interactiva', 'Step 4 · Interactive simulation')}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">{tr('Proyecta tu máquina de capital', 'Project your capital engine')}</h2>
        <p className="text-xs text-zinc-400 mt-1">
          {tr('Ajusta tu aporte mensual y horizonte para crear tu regla personal. No se autocompleta con valores por defecto.', 'Adjust your monthly contribution and horizon to establish your personal rule. Does not auto-complete.')}
        </p>
      </div>

      <MicroToolLab
        lessonId={lesson.id}
        trackId={lesson.trackId}
        widget={lesson.phases[2].widget}
        locale={locale}
        onCommit={saveTool}
        onCommitAndContinue={handleToolCommitAndContinue}
        requireInteraction
        showCompoundBreakdown
      />

      {bridgeError && <p role="alert" className="text-sm text-red-300">{bridgeError}</p>}
    </section>
  ) : stage === 'apply' && mission ? (
    <div data-stage="apply">
      <ApplyMissionModal
        mission={mission}
        locale={locale}
        embedded
        onClose={onClose}
        onReturn={() => undefined}
        onComplete={completeApply}
        onApplied={xp => {
          setRewardXp(xp || mission.lessonXp + mission.executionXp);
          localStorage.setItem(sessionKey, 'master');
          setStage('master');
        }}
      />
    </div>
  ) : stage === 'master' ? (
    <section data-stage="master" className="space-y-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF8A2A]">{tr('Paso 5 · Recuperación activa', 'Step 5 · Active retrieval')}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">{localizeLearning(design.master.prompt, locale)}</h2>
        <p className="text-xs text-zinc-400 mt-1">{tr('Recupera el concepto sin ver el contenido de la lección.', 'Retrieve the concept without looking at lesson text.')}</p>
      </div>

      <div className="space-y-2.5">
        {design.master.options.map(option => (
          <button
            key={option.id}
            type="button"
            disabled={masterChecked}
            aria-pressed={masterId === option.id}
            onClick={() => handleSelectMaster(option.id)}
            className={`w-full rounded-2xl border p-4 text-left text-sm font-semibold transition-all cursor-pointer ${
              masterId === option.id
                ? 'border-[#FF7300] bg-[#FF7300]/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'border-white/10 bg-white/[.025] text-zinc-300 hover:border-white/20'
            }`}
          >
            {localizeLearning(option.label, locale)}
          </button>
        ))}
      </div>

      {masterChecked && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} role="status" className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-zinc-300">
          {localizeLearning(design.master.explanation, locale)}
        </motion.div>
      )}

      {/* Single tap rating selection immediately advances to reward */}
      {masterChecked && (
        design.master.options.find(option => option.id === masterId)?.correct ? (
          <div className="space-y-2.5 pt-1">
            <p className="text-center text-xs text-zinc-400">{tr('¿Qué tan fácil fue recordarlo?', 'How easy was it to recall?')}</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => finishMaster(60)}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs font-bold hover:bg-white/[0.06] active:scale-95 transition cursor-pointer"
              >
                {tr('Difícil', 'Hard')}
              </button>
              <button
                type="button"
                onClick={() => finishMaster(80)}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs font-bold hover:bg-white/[0.06] active:scale-95 transition cursor-pointer"
              >
                {tr('Bien', 'Good')}
              </button>
              <button
                type="button"
                onClick={() => finishMaster(100)}
                className="rounded-xl border border-[#FF7300]/40 bg-[#FF7300]/10 p-3 text-xs font-bold text-[#FF9B4A] hover:bg-[#FF7300]/20 active:scale-95 transition cursor-pointer"
              >
                {tr('Fácil', 'Easy')}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => finishMaster(40)} className="t1ger-primary-button w-full cursor-pointer">
            {tr('Repasar de nuevo (Again)', 'Review again (Again)')}
            <ArrowRight size={20} />
          </button>
        )
      )}
    </section>
  ) : (
    /* REWARD STAGE: Single celebration moment */
    <section data-stage="reward" role="status" className="flex min-h-[62vh] flex-col items-center justify-center text-center px-2">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="grid h-16 w-16 place-items-center rounded-2xl border border-[#FF7300]/30 bg-[#FF7300]/10 text-[#FF9B4A]"
      >
        <Sparkle size={32} weight="fill" />
      </motion.div>

      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF8A2A]">{tr('Lección dominada', 'Lesson mastered')}</p>
      <h2 className="mt-3 text-2xl sm:text-3xl font-bold leading-tight text-white max-w-md">
        {localizeLearning(design.outcome, locale)}
      </h2>

      <div className="mt-7 grid w-full grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-4 bg-white/[0.015] rounded-xl">
        <div>
          <p className="font-mono text-lg font-bold text-white">2 / 5</p>
          <span className="text-[9px] uppercase tracking-wider text-zinc-500">{tr('Ruta', 'Path')}</span>
        </div>
        <div>
          <p className="font-mono text-lg font-bold text-white">{brainState.learnStreak}</p>
          <span className="text-[9px] uppercase tracking-wider text-zinc-500">{tr('Racha', 'Streak')}</span>
        </div>
        <div>
          <p className="font-mono text-lg font-bold text-[#FF9B4A]">+{rewardXp}</p>
          <span className="text-[9px] uppercase tracking-wider text-zinc-500">XP</span>
        </div>
      </div>

      <button type="button" onClick={() => { localStorage.removeItem(sessionKey); onComplete(lesson.id); }} className="t1ger-primary-button mt-8 w-full">
        {tr('Volver a mi camino', 'Back to my path')}
        <ArrowRight size={20} />
      </button>
    </section>
  );

  return createPortal(
    <dialog
      ref={dialogRef}
      onCancel={event => { event.preventDefault(); onClose(); }}
      aria-label={localizeLearning(lesson.title, locale)}
      className="fixed inset-0 z-[200] m-0 h-[100dvh] max-h-none w-full max-w-none overflow-hidden border-0 bg-[#09090B] p-0 text-white"
    >
      <div className="mx-auto flex h-[100dvh] w-full max-w-lg flex-col">
        <header className="sticky top-0 z-10 shrink-0 border-b border-white/10 bg-[#09090B] px-4 pb-3 pt-[calc(1rem+env(safe-area-inset-top))]">
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="t1ger-icon-button" aria-label={tr('Cerrar lección', 'Close lesson')}>
              <X size={19} />
            </button>
            <div className="text-center">
              <p className="text-xs font-bold text-white">{localizeLearning(lesson.title, locale)}</p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                {isSpacedReview ? tr('Repaso FSRS', 'FSRS review') : tr('Aprender → Aplicar → Dominar', 'Learn → Apply → Master')}
              </p>
            </div>
            <span className="w-11" />
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div animate={{ width: `${progress}%` }} className="h-full bg-[#FF7300]" />
          </div>

          <div className="mt-2 grid grid-cols-3 text-center font-mono text-[9px] uppercase tracking-wider">
            {(['learn', 'apply', 'master'] as const).map(group => (
              <span key={group} className={currentGroup === group ? 'text-white font-bold' : 'text-zinc-600'}>
                {group === 'learn' ? tr('Aprender', 'Learn') : group === 'apply' ? tr('Aplicar', 'Apply') : tr('Dominar', 'Master')}
              </span>
            ))}
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto px-5 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          {body}
        </main>
      </div>
    </dialog>,
    document.body
  );
};
