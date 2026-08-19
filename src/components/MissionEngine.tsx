import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ExternalLink,
  FileText,
  ImagePlus,
  Link2,
  ShieldCheck,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import type { BankMission, QuizOption } from '../services/missionBank';
import { localizeMission } from '../services/contentLocalization';
import { fireRewardConfetti } from './ui/confetti';
import { T1gerMascot3D, type MascotReaction } from './T1gerMascot3D';
import { StreakCelebrationModal } from './StreakCelebrationModal';

interface MissionEngineProps {
  mission: BankMission;
  onComplete: () => void;
}

type LearnStage = 'concept' | 'check';
type ApplyStage = 'brief' | 'execute' | 'evidence';
type PaperTrade = { ticker: string; amount: number; thesis: string };

const PAPER_ASSETS = [
  { ticker: 'VTI', label: { es: 'Mercado total de EE. UU.', en: 'US total market' } },
  { ticker: 'VXUS', label: { es: 'Acciones internacionales', en: 'International equity' } },
  { ticker: 'BND', label: { es: 'Bonos de EE. UU.', en: 'US bond market' } },
  { ticker: 'AAPL', label: { es: 'Apple', en: 'Apple' } },
  { ticker: 'MSFT', label: { es: 'Microsoft', en: 'Microsoft' } },
];
const formatMoney = (value: number, language: 'es' | 'en') =>
  new Intl.NumberFormat(language === 'es' ? 'es-CO' : 'en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export const MissionEngine: React.FC<MissionEngineProps> = ({ mission: sourceMission, onComplete }) => {
  const { addXP } = useT1ger();
  const { completeMission, language, brainState } = useBrain();
  const { appUser } = useAuth();
  const isEs = language === 'es';
  const mission = useMemo(() => localizeMission(sourceMission, language), [language, sourceMission]);
  const isApply = mission.nodeType === 'apply' || mission.type === 'real_world_task';
  const alreadyCompleted = brainState.missionHistory.some(record => record.missionId === mission.id && record.completed);

  const [learnStage, setLearnStage] = useState<LearnStage>('concept');
  const [applyStage, setApplyStage] = useState<ApplyStage>('brief');
  const [completedFramework, setCompletedFramework] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [reflection, setReflection] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [tradeTicker, setTradeTicker] = useState('VTI');
  const [tradeAmount, setTradeAmount] = useState('10000');
  const [tradeThesis, setTradeThesis] = useState('');
  const [trades, setTrades] = useState<PaperTrade[]>([]);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(alreadyCompleted);
  const [submitting, setSubmitting] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);

  const options = useMemo<QuizOption[]>(() => {
    if (mission.recallOptions?.length) return mission.recallOptions;
    if (mission.options?.length) return mission.options;
    return [
      { text: mission.keyTakeaway || mission.concept || 'Use evidence and a repeatable process.', correct: true },
      { text: isEs ? 'El resultado de corto plazo siempre prueba que la decisión fue correcta.' : 'A short-term result always proves the decision was correct.', correct: false },
      { text: isEs ? 'Más riesgo siempre produce un mejor resultado.' : 'Taking more risk always produces a better outcome.', correct: false },
    ];
  }, [isEs, mission]);

  const correctOption = options.findIndex(option => option.correct);
  const answerIsCorrect = selectedOption === correctOption;

  const mascotMood = useMemo<MascotReaction>(() => {
    if (complete) return 'celebrate';
    if (error) return 'warning';
    if (!isApply) {
      if (learnStage === 'concept') return 'thinking';
      if (!answerChecked) return 'idle';
      return selectedOption === correctOption ? 'celebrate' : 'mistake';
    }
    if (applyStage === 'brief') return 'thinking';
    if (applyStage === 'execute') return 'beast';
    return 'idle';
  }, [applyStage, answerChecked, complete, correctOption, error, isApply, learnStage, selectedOption]);

  const framework = mission.frameworkSteps || [];
  const frameworkReady = framework.length === 0 || completedFramework.length === framework.length;
  const minimumReflection = mission.minReflectionLength || 80;
  const requiredTrades = mission.requiredTrades || 1;
  const tradeTotal = trades.reduce((sum, trade) => sum + trade.amount, 0);

  const evidenceValid = useMemo(() => {
    if (mission.verificationMethod === 'paper_trade') {
      return trades.length >= requiredTrades && new Set(trades.map(trade => trade.ticker)).size >= requiredTrades;
    }
    if (mission.verificationMethod === 'photo') return Boolean(photoName);
    if (mission.verificationMethod === 'link') {
      return reflection.length >= minimumReflection && /https?:\/\//i.test(reflection);
    }
    return reflection.length >= minimumReflection;
  }, [mission.verificationMethod, minimumReflection, photoName, reflection, requiredTrades, trades]);

  const progress = complete
    ? 100
    : isApply
      ? ({ brief: 18, execute: 52, evidence: 82 } as const)[applyStage]
      : learnStage === 'concept' ? 35 : 78;

  const addTrade = () => {
    setError('');
    const amount = Number(tradeAmount);
    if (!Number.isFinite(amount) || amount < 100 || amount > 25000) {
      setError(isEs ? 'Usa un monto entre $100 y $25,000.' : 'Use an amount between $100 and $25,000.');
      return;
    }
    if (tradeThesis.trim().length < 20) {
      setError(isEs ? 'Escribe una tesis de al menos 20 caracteres.' : 'Write a thesis of at least 20 characters.');
      return;
    }
    if (trades.some(trade => trade.ticker === tradeTicker)) {
      setError(isEs ? 'Usa un activo diferente para cada posición.' : 'Use a different asset for each position.');
      return;
    }
    if (tradeTotal + amount > 100000) {
      setError(isEs ? 'El portafolio simulado no puede superar los $100.000.' : 'The simulated portfolio cannot exceed $100,000.');
      return;
    }
    setTrades(current => [...current, { ticker: tradeTicker, amount, thesis: tradeThesis.trim() }]);
    setTradeThesis('');
  };

  const finishMission = async () => {
    if (submitting || (!isApply && !answerIsCorrect) || (isApply && !evidenceValid)) return;
    setSubmitting(true);
    setError('');
    try {
      if (mission.verificationMethod === 'paper_trade' && typeof window !== 'undefined') {
        const key = `t1ger_paper_trades_${appUser?.uid || 'local'}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        localStorage.setItem(key, JSON.stringify([
          ...existing,
          ...trades.map(trade => ({ ...trade, missionId: mission.id, createdAt: Date.now(), environment: 'simulation' })),
        ]));
      }
      completeMission(mission.id, 100);
      await addXP(mission.xpReward || 100, mission.verificationTier, `mission:${mission.id}`);
      fireRewardConfetti();
      setComplete(true);
      setShowStreakCelebration(true);
    } finally {
      setSubmitting(false);
    }
  };

  const eyebrow = isApply
    ? (isEs ? 'Misión práctica' : 'Practice mission')
    : (isEs ? 'Lección diaria' : 'Daily lesson');

  if (complete) {
    return (
      <>
        <main className="t1ger-mission-shell min-h-[100dvh] px-5 pb-8 pt-[calc(1.25rem+env(safe-area-inset-top))]">
          <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center">
            <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="t1ger-panel p-7 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[var(--t1ger-orange)] text-white shadow-[0_14px_32px_rgba(239,112,48,.28)]">
                {mission.verificationTier === 1 ? <ShieldCheck size={32} /> : <CheckCircle2 size={32} />}
              </div>
              <p className="t1ger-kicker">{mission.verificationTier === 1 ? (isEs ? 'Progreso verificado' : 'Verified progress') : (isEs ? 'Progreso personal' : 'Personal progress')}</p>
              <h1 className="mt-2 text-balance text-3xl font-semibold tracking-[-0.04em] text-white">
                {isApply
                  ? (isEs ? 'Convertiste una idea en acción.' : 'You turned an idea into action.')
                  : (isEs ? 'Aprendiste una idea clave.' : 'You learned a key idea.')}
              </h1>
              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#9DBAB4]">
                {isEs ? `Progreso guardado: +${mission.xpReward} XP.` : `Progress saved: +${mission.xpReward} XP.`}
              </p>
              <button onClick={() => setShowStreakCelebration(true)} className="t1ger-primary-button mt-8 w-full">
                {isEs ? 'Ver Racha' : 'View Streak'} <ArrowRight size={18} />
              </button>
            </motion.section>
          </div>
        </main>

        <StreakCelebrationModal
          isOpen={showStreakCelebration}
          onClose={() => {
            setShowStreakCelebration(false);
            onComplete();
          }}
          previousStreak={Math.max(0, brainState.learnStreak - 1)}
          newStreak={Math.max(1, brainState.learnStreak)}
        />
      </>
    );
  }

  return (
    <main className="t1ger-mission-shell min-h-[100dvh] px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-md flex-col">
        <header className="mb-6 flex items-center gap-4">
          <button onClick={onComplete} aria-label={isEs ? 'Cerrar misión' : 'Close mission'} className="t1ger-icon-button">
            <ArrowLeft size={20} />
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-[var(--t1ger-orange)]" animate={{ width: `${progress}%` }} />
          </div>
          <span className="w-9 text-right font-mono text-xs text-[#7EA39B]">{progress}%</span>
        </header>

        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="t1ger-kicker">{eyebrow}</p>
            <h1 className="mt-2 text-balance text-2xl font-semibold leading-[1.05] tracking-[-0.045em] text-white">{mission.title}</h1>
          </div>
          <div className="relative shrink-0 w-24 h-24 flex items-center justify-center pointer-events-none">
            <T1gerMascot3D mood={mascotMood} className="w-24 h-24" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isApply && learnStage === 'concept' && (
            <motion.section key="concept" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} className="flex flex-1 flex-col">
              <article className="t1ger-panel flex-1 p-6">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#173F38] text-[var(--t1ger-orange)]"><BookOpen size={23} /></div>
                <p className="text-pretty text-lg font-medium leading-8 text-[#EAF4F1]">{mission.concept}</p>
                <div className="my-7 h-px bg-white/8" />
                <p className="t1ger-kicker">{isEs ? 'Idea para recordar' : 'Keep this idea'}</p>
                <p className="mt-3 text-pretty text-sm leading-6 text-[#9DBAB4]">{mission.keyTakeaway}</p>
                {mission.sources?.[0]?.url && (
                  <a href={mission.sources[0].url} target="_blank" rel="noreferrer" className="mt-6 flex items-center justify-between rounded-xl border border-white/8 bg-white/[.03] p-3 text-xs text-[#87A9A2] hover:border-[var(--t1ger-orange)]/35 hover:text-white">
                    <span><strong className="block font-medium text-[#DCEAE7]">{mission.sources[0].title}</strong><span className="mt-0.5 block">{mission.sources[0].author}</span></span><ExternalLink size={15} />
                  </a>
                )}
              </article>
              <button onClick={() => setLearnStage('check')} className="t1ger-primary-button mt-5 w-full">
                {isEs ? 'Comprobar comprensión' : 'Check understanding'} <ArrowRight size={18} />
              </button>
            </motion.section>
          )}

          {!isApply && learnStage === 'check' && (
            <motion.section key="check" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex flex-1 flex-col">
              <div className="t1ger-panel p-6">
                <p className="t1ger-kicker">{isEs ? 'Decisión' : 'Decision check'}</p>
                <h2 className="mt-2 text-xl font-semibold leading-7 text-white">
                  {mission.recallQuestion || (isEs ? '¿Qué idea describe mejor esta lección?' : 'Which idea best represents this lesson?')}
                </h2>
                <div className="mt-6 space-y-3" role="radiogroup">
                  {options.map((option, index) => {
                    const selected = selectedOption === index;
                    const correct = answerChecked && option.correct;
                    const wrong = answerChecked && selected && !option.correct;
                    return (
                      <button
                        key={`${option.text}-${index}`}
                        role="radio"
                        aria-checked={selected}
                        disabled={answerChecked}
                        onClick={() => setSelectedOption(index)}
                        className={`w-full rounded-2xl border p-4 text-left text-sm font-medium leading-5 transition ${correct ? 'border-[#3FC78E] bg-[#3FC78E]/12 text-white' : wrong ? 'border-[#E56A65] bg-[#E56A65]/10 text-white' : selected ? 'border-[var(--t1ger-orange)] bg-[var(--t1ger-orange)]/10 text-white' : 'border-white/10 bg-white/[.035] text-[#BED1CC] hover:border-white/20'}`}
                      >
                        <span className="flex items-start gap-3"><span className="mt-0.5 font-mono text-xs text-[#6F9990]">{String.fromCharCode(65 + index)}</span>{option.text}</span>
                      </button>
                    );
                  })}
                </div>
                {answerChecked && (
                  <div className={`mt-5 flex gap-3 rounded-2xl p-4 text-sm ${answerIsCorrect ? 'bg-[#3FC78E]/10 text-[#BCEAD5]' : 'bg-[#E56A65]/10 text-[#F2C5C2]'}`}>
                    {answerIsCorrect ? <CheckCircle2 className="shrink-0" size={19} /> : <AlertCircle className="shrink-0" size={19} />}
                    <p>{answerIsCorrect ? (mission.recallExplanation || (isEs ? 'Correcto. La idea central está clara.' : 'Correct. You have the core idea.')) : (isEs ? 'Vuelve a la idea principal e inténtalo otra vez.' : 'Review the core idea and try again.')}</p>
                  </div>
                )}
              </div>
              {!answerChecked ? (
                <button disabled={selectedOption === null} onClick={() => setAnswerChecked(true)} className="t1ger-primary-button mt-5 w-full disabled:opacity-40">
                  {isEs ? 'Comprobar respuesta' : 'Check answer'}
                </button>
              ) : answerIsCorrect ? (
                <button disabled={submitting} onClick={finishMission} className="t1ger-primary-button mt-5 w-full">
                  {isEs ? 'Completar lección' : 'Complete lesson'} <Check size={18} />
                </button>
              ) : (
                <button onClick={() => { setSelectedOption(null); setAnswerChecked(false); }} className="t1ger-secondary-button mt-5 w-full">
                  {isEs ? 'Intentar de nuevo' : 'Try again'}
                </button>
              )}
            </motion.section>
          )}

          {isApply && applyStage === 'brief' && (
            <motion.section key="brief" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} className="flex flex-1 flex-col">
              <article className="t1ger-panel flex-1 p-6">
                <div className="flex items-start justify-between gap-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--t1ger-orange)]/12 text-[var(--t1ger-orange)]"><Target size={24} /></div>
                  <span className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[.12em] ${mission.verificationTier === 1 ? 'bg-[#3FC78E]/12 text-[#78DDB0]' : 'bg-white/7 text-[#9DBAB4]'}`}>
                    {mission.verificationTier === 1 ? (isEs ? 'Verificación en app' : 'In-app verified') : (isEs ? 'Reflexión estructurada' : 'Structured reflection')}
                  </span>
                </div>
                <p className="mt-7 text-pretty text-lg font-medium leading-8 text-[#EAF4F1]">{mission.taskBrief}</p>
                <div className="mt-7 rounded-2xl bg-[#082C27] p-4 text-sm leading-6 text-[#9DBAB4]">
                  <strong className="block text-[#EAF4F1]">{isEs ? 'Qué cuenta como evidencia' : 'What counts as evidence'}</strong>
                  {mission.verificationMethod === 'paper_trade'
                    ? (isEs ? `${requiredTrades} ${requiredTrades === 1 ? 'operación simulada registrada' : 'operaciones simuladas registradas'} en T1GER, con monto y tesis.` : `${requiredTrades} simulated ${requiredTrades === 1 ? 'trade' : 'trades'} recorded in T1GER with an amount and thesis.`)
                    : (isEs ? 'Una reflexión específica que incluya datos, fuente y una decisión siguiente.' : 'A specific reflection containing data, a source, and a next decision.')}
                </div>
              </article>
              <p className="mt-4 text-center text-xs leading-5 text-[#6F9990]">{isEs ? 'Simulación educativa. No constituye asesoría financiera.' : 'Educational simulation. This is not financial advice.'}</p>
              <button onClick={() => setApplyStage('execute')} className="t1ger-primary-button mt-4 w-full">
                {isEs ? 'Comenzar la acción' : 'Begin action'} <ArrowRight size={18} />
              </button>
            </motion.section>
          )}

          {isApply && applyStage === 'execute' && (
            <motion.section key="execute" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} className="flex flex-1 flex-col">
              <div className="space-y-3">
                {framework.map((step, index) => {
                  const done = completedFramework.includes(index);
                  const enabled = index === 0 || completedFramework.includes(index - 1);
                  return (
                    <button
                      key={step.title}
                      disabled={!enabled}
                      onClick={() => setCompletedFramework(current => done ? current : [...current, index])}
                      className={`w-full rounded-[1.25rem] border p-5 text-left transition ${done ? 'border-[#3FC78E]/40 bg-[#3FC78E]/9' : enabled ? 'border-white/12 bg-white/[.045] hover:border-[var(--t1ger-orange)]/50' : 'border-white/6 bg-white/[.02] opacity-45'}`}
                    >
                      <span className="flex items-start gap-4">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs ${done ? 'bg-[#3FC78E] text-[#05251F]' : 'bg-white/7 text-[#87A9A2]'}`}>{done ? <Check size={16} /> : index + 1}</span>
                        <span><strong className="block text-sm font-semibold text-white">{step.title}</strong><span className="mt-1 block text-xs leading-5 text-[#87A9A2]">{step.desc}</span></span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <button disabled={!frameworkReady} onClick={() => setApplyStage('evidence')} className="t1ger-primary-button mt-auto w-full disabled:opacity-35">
                {isEs ? 'Registrar evidencia' : 'Record evidence'} <ArrowRight size={18} />
              </button>
            </motion.section>
          )}

          {isApply && applyStage === 'evidence' && (
            <motion.section key="evidence" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} className="flex flex-1 flex-col">
              {mission.verificationMethod === 'paper_trade' ? (
                <div className="t1ger-panel p-5">
                  <div className="flex items-center justify-between">
                  <div><p className="t1ger-kicker">{isEs ? 'Portafolio simulado' : 'Paper portfolio'}</p><p className="mt-1 font-mono text-lg text-white">{formatMoney(100000 - tradeTotal, language)} <span className="text-xs text-[#6F9990]">{isEs ? 'disponible' : 'cash'}</span></p></div>
                    <TrendingUp className="text-[var(--t1ger-orange)]" />
                  </div>
                  {trades.length > 0 && <div className="mt-5 space-y-2">{trades.map(trade => <div key={trade.ticker} className="flex items-center justify-between rounded-xl bg-white/[.045] px-4 py-3"><span className="font-mono text-sm font-semibold text-white">{trade.ticker}</span><span className="font-mono text-xs text-[#9DBAB4]">{formatMoney(trade.amount, language)}</span></div>)}</div>}
                  {trades.length < requiredTrades && (
                    <div className="mt-5 space-y-3 border-t border-white/8 pt-5">
                      <div className="grid grid-cols-2 gap-3">
                        <label className="t1ger-field-label">{isEs ? 'Activo' : 'Asset'}<select value={tradeTicker} onChange={event => setTradeTicker(event.target.value)} className="t1ger-input">{PAPER_ASSETS.map(asset => <option key={asset.ticker} value={asset.ticker}>{asset.ticker} · {asset.label[language]}</option>)}</select></label>
                        <label className="t1ger-field-label">{isEs ? 'Monto' : 'Amount'}<input value={tradeAmount} onChange={event => setTradeAmount(event.target.value)} inputMode="numeric" className="t1ger-input" /></label>
                      </div>
                      <label className="t1ger-field-label">{isEs ? 'Tesis de inversión' : 'Investment thesis'}<textarea value={tradeThesis} onChange={event => setTradeThesis(event.target.value)} className="t1ger-input min-h-24 resize-none" placeholder={isEs ? 'Por qué encaja esta posición y cuál es el riesgo principal…' : 'Why this position fits and its main risk…'} /></label>
                      <button onClick={addTrade} className="t1ger-secondary-button w-full">{isEs ? 'Añadir operación' : 'Add paper trade'} · {trades.length}/{requiredTrades}</button>
                    </div>
                  )}
                </div>
              ) : mission.verificationMethod === 'photo' ? (
                <label className="t1ger-panel flex cursor-pointer flex-col items-center p-8 text-center">
                  <ImagePlus className="text-[var(--t1ger-orange)]" size={32} />
                  <strong className="mt-4 text-white">{photoName || (isEs ? 'Capturar evidencia' : 'Capture evidence')}</strong>
                  <span className="mt-2 text-xs text-[#87A9A2]">{isEs ? 'La imagen permanece asociada a esta misión.' : 'The image remains associated with this mission.'}</span>
                  <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={event => setPhotoName(event.target.files?.[0]?.name || '')} />
                </label>
              ) : (
                <div className="t1ger-panel p-5">
                  <div className="flex items-center gap-3 text-[var(--t1ger-orange)]">{mission.verificationMethod === 'link' ? <Link2 size={20} /> : <FileText size={20} />}<p className="t1ger-kicker">{isEs ? 'Evidencia estructurada' : 'Structured evidence'}</p></div>
                  <p className="mt-4 text-sm leading-6 text-[#9DBAB4]">{mission.reflectionPrompt}</p>
                  <textarea value={reflection} onChange={event => setReflection(event.target.value)} className="t1ger-input mt-5 min-h-40 resize-none" placeholder={isEs ? 'Escribe datos concretos, tu fuente y la decisión que tomarás…' : 'Write concrete data, your source, and the decision you will make…'} />
                  <div className="mt-2 flex justify-between text-[11px] text-[#6F9990]"><span>{mission.verificationMethod === 'link' ? (isEs ? 'Incluye https://…' : 'Include https://…') : ''}</span><span className="font-mono">{reflection.length}/{minimumReflection}</span></div>
                </div>
              )}
              {error && <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl bg-[#E56A65]/10 p-3 text-xs text-[#F2C5C2]"><AlertCircle size={16} />{error}</p>}
              <button disabled={!evidenceValid || submitting} onClick={finishMission} className="t1ger-primary-button mt-auto w-full disabled:opacity-35">
                {mission.verificationTier === 1 ? <ShieldCheck size={18} /> : <Trophy size={18} />}
                {submitting ? (isEs ? 'Guardando…' : 'Saving…') : mission.verificationTier === 1 ? (isEs ? 'Verificar y completar' : 'Verify and complete') : (isEs ? 'Completar misión' : 'Complete mission')}
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};
