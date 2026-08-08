import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Crown,
  LineChart,
  Lock,
  Mail,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  WalletCards,
} from 'lucide-react';
import { useAuth, type AppUser, type InvestmentProfile } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import type { Language } from '../services/i18n';
import { AuthGate } from './AuthGate';
import { MissionEngine } from './MissionEngine';
import { T1gerMascot3D, type MascotReaction } from './T1gerMascot3D';
import { MISSION_BANK } from '../services/missionBank';
import { fireRewardConfetti } from './ui/confetti';

type OnboardingStep =
  | 'arrival'
  | 'guide'
  | 'outcome'
  | 'experience'
  | 'application'
  | 'calibration'
  | 'daily_goal'
  | 'plan_build'
  | 'plan_reveal'
  | 'micro_lesson'
  | 'success'
  | 'save_progress'
  | 'reminders'
  | 'access';

type Outcome = 'first-investment' | 'long-term-wealth' | 'company-analysis' | 'retirement';
type Experience = 'new' | 'basic' | 'active';
type ApplicationPreference = 'stock' | 'portfolio' | 'risk' | 'news';
type CalibrationLevel = 'beginner' | 'foundation' | 'accelerated';
type ReminderStatus = 'idle' | 'enabled' | 'denied' | 'unsupported' | 'dismissed';
type LocalizedText = { es: string; en: string };

const localize = (text: LocalizedText, language: Language) => text[language];

interface CalibrationAnswer {
  questionId: string;
  optionId: string;
  correct: boolean;
}

interface OnboardingDraft {
  version: 1;
  step: OnboardingStep;
  outcome: Outcome | null;
  experience: Experience | null;
  applications: ApplicationPreference[];
  calibrationAnswers: CalibrationAnswer[];
  dailyGoal: number | null;
  planBuilt: boolean;
  lessonCompleted: boolean;
  reminderStatus: ReminderStatus;
  accessChoice: 'free' | 'super' | null;
}

const DRAFT_KEY = 't1ger_onboarding_draft_v1';
const FIRST_LESSON_ID = 'inv-m1-l1';
const ONBOARDING_XP = 100;

const STEP_ORDER: OnboardingStep[] = [
  'arrival',
  'guide',
  'outcome',
  'experience',
  'application',
  'calibration',
  'daily_goal',
  'plan_build',
  'plan_reveal',
  'micro_lesson',
  'success',
  'save_progress',
  'reminders',
  'access',
];

const defaultDraft: OnboardingDraft = {
  version: 1,
  step: 'arrival',
  outcome: null,
  experience: null,
  applications: [],
  calibrationAnswers: [],
  dailyGoal: 10,
  planBuilt: false,
  lessonCompleted: false,
  reminderStatus: 'idle',
  accessChoice: null,
};

const outcomes: Array<{ id: Outcome; title: LocalizedText; detail: LocalizedText; icon: React.ReactNode }> = [
  { id: 'first-investment', title: { es: 'Hacer mi primera inversión', en: 'Make my first investment' }, detail: { es: 'Empieza con reglas simples y práctica simulada.', en: 'Start with simple rules and paper practice.' }, icon: <WalletCards size={22} /> },
  { id: 'long-term-wealth', title: { es: 'Construir patrimonio a largo plazo', en: 'Build long-term wealth' }, detail: { es: 'Usa el interés compuesto, la asignación y la constancia.', en: 'Use compounding, allocation, and consistency.' }, icon: <LineChart size={22} /> },
  { id: 'company-analysis', title: { es: 'Aprender a analizar empresas', en: 'Learn to analyze companies' }, detail: { es: 'Lee estados financieros y evalúa la calidad con evidencia.', en: 'Read statements and judge quality with evidence.' }, icon: <BookOpen size={22} /> },
  { id: 'retirement', title: { es: 'Prepararme para el retiro', en: 'Prepare for retirement' }, detail: { es: 'Conecta tus cuentas, tu plazo y tu tolerancia al riesgo.', en: 'Connect accounts, time horizon, and risk.' }, icon: <ShieldCheck size={22} /> },
];

const experiences: Array<{ id: Experience; title: LocalizedText; detail: LocalizedText }> = [
  { id: 'new', title: { es: 'Estoy empezando', en: 'I am new to investing' }, detail: { es: 'Comienza con vocabulario y decisiones sencillas.', en: 'Start from vocabulary and simple decisions.' } },
  { id: 'basic', title: { es: 'Conozco lo básico', en: 'I know the basics' }, detail: { es: 'Avanza más rápido y enfócate en aplicar.', en: 'Move faster through concepts and focus on application.' } },
  { id: 'active', title: { es: 'Ya invierto', en: 'I already invest' }, detail: { es: 'Ajusta la ruta al análisis y las reglas de portafolio.', en: 'Calibrate the path around analysis and portfolio rules.' } },
];

const applicationOptions: Array<{ id: ApplicationPreference; title: LocalizedText; detail: LocalizedText }> = [
  { id: 'stock', title: { es: 'Evaluar una acción', en: 'Evaluate a stock' }, detail: { es: 'Practica tesis, fuentes y valoración.', en: 'Practice thesis, source, and valuation thinking.' } },
  { id: 'portfolio', title: { es: 'Construir un portafolio', en: 'Build a portfolio' }, detail: { es: 'Convierte la asignación en una rutina repetible.', en: 'Turn allocation into a repeatable routine.' } },
  { id: 'risk', title: { es: 'Gestionar el riesgo', en: 'Manage risk' }, detail: { es: 'Define tamaños de posición y límites emocionales.', en: 'Define position sizing and emotional guardrails.' } },
  { id: 'news', title: { es: 'Entender las noticias del mercado', en: 'Understand market news' }, detail: { es: 'Separa las señales útiles del ruido.', en: 'Separate useful signals from noise.' } },
];

const calibrationQuestions = [
  {
    id: 'net-worth',
    prompt: { es: '¿Qué fórmula describe el patrimonio neto?', en: 'Which equation describes net worth?' },
    options: [
      { id: 'assets-minus-liabilities', text: { es: 'Activos menos pasivos', en: 'Assets minus liabilities' }, correct: true },
      { id: 'income-minus-spending', text: { es: 'Ingresos menos gastos', en: 'Income minus spending' }, correct: false },
      { id: 'cash-plus-debt', text: { es: 'Efectivo más deuda', en: 'Cash plus debt' }, correct: false },
    ],
    explanation: { es: 'Es lo que queda después de restar tus obligaciones a los activos que posees.', en: 'Net worth is what remains after subtracting obligations from owned assets.' },
  },
  {
    id: 'diversification',
    prompt: { es: '¿Por qué diversifican los inversionistas?', en: 'Why do investors diversify?' },
    options: [
      { id: 'guarantee-profit', text: { es: 'Para garantizar ganancias cada mes', en: 'To guarantee a profit every month' }, correct: false },
      { id: 'reduce-concentration', text: { es: 'Para depender menos de un solo activo', en: 'To reduce dependence on one asset' }, correct: true },
      { id: 'avoid-research', text: { es: 'Para evitar cualquier decisión', en: 'To avoid making any decisions' }, correct: false },
    ],
    explanation: { es: 'Diversificar reduce el riesgo de concentración, pero no elimina el riesgo del mercado.', en: 'Diversification reduces concentration risk. It does not remove market risk.' },
  },
];

function loadDraft(): OnboardingDraft {
  if (typeof window === 'undefined') return defaultDraft;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return defaultDraft;
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
    if (parsed.version !== 1 || !parsed.step || !STEP_ORDER.includes(parsed.step)) return defaultDraft;
    return {
      ...defaultDraft,
      ...parsed,
      applications: Array.isArray(parsed.applications) ? parsed.applications : [],
      calibrationAnswers: Array.isArray(parsed.calibrationAnswers) ? parsed.calibrationAnswers : [],
    };
  } catch {
    return defaultDraft;
  }
}

function saveDraft(draft: OnboardingDraft) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function clearDraft() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DRAFT_KEY);
}

function calculateCalibration(experience: Experience | null, answers: CalibrationAnswer[]): CalibrationLevel {
  const correct = answers.filter(answer => answer.correct).length;
  if (experience === 'active' && correct >= 1) return 'accelerated';
  if (correct >= 2 || (experience === 'basic' && correct >= 1)) return 'foundation';
  return 'beginner';
}

function levelNumber(level: CalibrationLevel) {
  if (level === 'accelerated') return 3;
  if (level === 'foundation') return 2;
  return 1;
}

function outcomeLabel(outcome: Outcome | null) {
  return outcomes.find(item => item.id === outcome)?.title.en || 'Build long-term wealth';
}

function applicationLabels(applications: ApplicationPreference[], language: Language = 'en') {
  if (!applications.length) return [language === 'es' ? 'Construir un portafolio' : 'Build a portfolio'];
  return applications.map(id => {
    const title = applicationOptions.find(item => item.id === id)?.title;
    return title ? localize(title, language) : language === 'es' ? 'Construir un portafolio' : 'Build a portfolio';
  });
}

function buildPersonalizedProfile(draft: OnboardingDraft): Partial<AppUser> {
  const calibration = calculateCalibration(draft.experience, draft.calibrationAnswers);
  const weeklyMinutes = (draft.dailyGoal || 10) * 5;
  const profile: InvestmentProfile = {
    goal: draft.outcome || 'long-term-wealth',
    experience: draft.experience || 'new',
    riskComfort: draft.applications.includes('risk') ? 'protect' : draft.applications.includes('stock') ? 'growth' : 'balanced',
    weeklyCommitment: weeklyMinutes,
    contentFormat: 'practice',
    learnWithFriends: false,
  };

  return {
    primaryTrack: 'investing',
    niche: 'investing',
    goal: outcomeLabel(draft.outcome),
    dailyTime: draft.dailyGoal || 10,
    experienceLevel: levelNumber(calibration),
    learningStyle: 'interactive',
    onboardingStep: draft.step,
    investmentProfile: profile,
    personalizedPlan: {
      title: `${calibration === 'accelerated' ? 'Accelerated' : calibration === 'foundation' ? 'Foundation' : 'Beginner'} Investing Path`,
      firstLessonId: FIRST_LESSON_ID,
      weeklyMinutes,
      focusAreas: applicationLabels(draft.applications),
    },
  };
}

function stageIndex(step: OnboardingStep) {
  return STEP_ORDER.indexOf(step);
}

function nextStep(step: OnboardingStep): OnboardingStep {
  return STEP_ORDER[Math.min(stageIndex(step) + 1, STEP_ORDER.length - 1)];
}

function previousStep(step: OnboardingStep): OnboardingStep {
  return STEP_ORDER[Math.max(stageIndex(step) - 1, 0)];
}

const easeTransition = { type: 'spring' as const, stiffness: 360, damping: 34 };

interface ShellProps {
  step: OnboardingStep;
  direction: number;
  onBack: () => void;
  children: React.ReactNode;
  hideProgress?: boolean;
  flush?: boolean;
  language: Language;
}

const OnboardingShell: React.FC<ShellProps> = ({ step, direction, onBack, children, hideProgress, flush, language }) => {
  const progress = ((stageIndex(step) + 1) / STEP_ORDER.length) * 100;
  const showBack = stageIndex(step) > 0 && step !== 'micro_lesson';

  return (
    <div className="t1ger-onboarding fixed inset-0 z-[300]">
      <div className="t1ger-onboarding-backdrop absolute inset-0" />
      <main className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden sm:border-x sm:border-white/10">
        {!hideProgress && (
          <header className="flex shrink-0 items-center gap-3 px-5 pb-3 pt-[calc(.9rem+env(safe-area-inset-top))]">
            {showBack ? (
              <button onClick={onBack} aria-label={language === 'es' ? 'Volver' : 'Go back'} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-[var(--ob-border)] bg-white/[.035] text-[var(--ob-muted-strong)] active:scale-[.97]">
                <ArrowLeft size={20} />
              </button>
            ) : <div className="h-11 w-11 shrink-0" />}
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-[var(--ob-accent)]" animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }} />
            </div>
            <span className="w-9 text-right font-mono text-[11px] text-[var(--ob-muted)]">{stageIndex(step) + 1}/{STEP_ORDER.length}</span>
          </header>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.section
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction >= 0 ? 28 : -28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction >= 0 ? -22 : 22 }}
            transition={easeTransition}
            className={flush ? 'min-h-0 flex-1 overflow-hidden' : 'min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]'}
          >
            {children}
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );
};

const TigerGuide: React.FC<{ mood?: 'ready' | 'thinking' | 'celebrate' | 'calm' | 'beast' | 'warning'; message?: string }> = ({ mood = 'ready', message }) => {
  const reactionMap: Record<string, MascotReaction> = {
    ready: 'idle',
    thinking: 'thinking',
    celebrate: 'celebrate',
    calm: 'idle',
    beast: 'beast',
    warning: 'warning',
  };

  return (
    <div className="grid grid-cols-[8.25rem_1fr] items-center gap-2">
      <div className="relative h-32 w-[8.25rem] shrink-0 overflow-visible pointer-events-none">
        <T1gerMascot3D mood={reactionMap[mood] || 'idle'} closeUp className="h-32 w-[8.25rem]" />
      </div>
      {message && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          className="relative rounded-[1.25rem] border border-[var(--ob-border)] bg-[var(--ob-surface)] px-4 py-3 text-[13px] font-semibold leading-5 text-[var(--ob-text)] shadow-[0_16px_36px_rgba(3,11,9,.2),inset_0_1px_0_rgba(255,255,255,.035)]"
        >
          <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border-b border-l border-[var(--ob-border)] bg-[var(--ob-surface)]" />
          {message}
        </motion.div>
      )}
    </div>
  );
};

const PrimaryAction: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }> = ({ className = '', variant = 'primary', children, ...props }) => {
  const classes = variant === 'primary'
    ? 't1ger-onboarding-primary active:translate-y-1'
    : 't1ger-onboarding-secondary active:translate-y-1 active:shadow-none';

  return (
    <button
      {...props}
      className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-[1rem] px-5 text-sm font-black uppercase tracking-[.08em] transition disabled:pointer-events-none disabled:opacity-40 ${classes} ${className}`}
    >
      {children}
    </button>
  );
};

interface ChoiceCardProps {
  title: string;
  detail: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  multi?: boolean;
}

const ChoiceCard: React.FC<ChoiceCardProps> = ({ title, detail, selected, onClick, icon, multi }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    data-selected={selected}
    className="t1ger-onboarding-choice group flex min-h-[4.75rem] w-full items-center gap-4 rounded-[1.15rem] border p-4 text-left transition active:scale-[.985]"
  >
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[.9rem] ${selected ? 'bg-[var(--ob-accent)] text-[var(--ob-accent-ink)]' : 'bg-white/[.045] text-[var(--ob-muted)]'}`}>
      {icon || <Target size={20} />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-[15px] font-semibold leading-5">{title}</span>
      <span className="mt-1 block text-xs leading-5 text-[var(--ob-muted)]">{detail}</span>
    </span>
    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)] text-[var(--ob-accent-ink)]' : 'border-[var(--ob-border)] text-transparent'}`}>
      {selected ? <Check size={16} /> : multi ? <span className="h-2 w-2 rounded-full bg-white/18" /> : null}
    </span>
  </button>
);

const ScreenHeader: React.FC<{ eyebrow?: string; title: string; body?: string; guide?: React.ReactNode }> = ({ eyebrow, title, body, guide }) => (
  <div className="pb-6 pt-2">
    {guide && <div className="mb-7">{guide}</div>}
    {eyebrow && <p className="font-mono text-[11px] font-semibold uppercase tracking-[.16em] text-[var(--ob-accent)]">{eyebrow}</p>}
    <h1 tabIndex={-1} className="mt-2 text-balance text-[2rem] font-black leading-[1.05] text-[var(--ob-text)] outline-none focus-visible:outline-none">{title}</h1>
    {body && <p className="mt-4 text-pretty text-[15px] font-medium leading-6 text-[var(--ob-muted)]">{body}</p>}
  </div>
);

const StickyActions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="t1ger-onboarding-sticky sticky bottom-0 -mx-5 mt-6 px-5 pb-2 pt-9">
    {children}
  </div>
);

const PlanBuilder: React.FC<{ onComplete: () => void; onSkip: () => void; language: Language }> = ({ onComplete, onSkip, language }) => {
  const reduceMotion = useReducedMotion();
  const [completed, setCompleted] = useState(reduceMotion ? 3 : 0);
  const lines = language === 'es'
    ? ['Ajustando tu nivel inicial', 'Conectando lecciones y práctica', 'Definiendo tu ritmo diario']
    : ['Calibrating the starting level', 'Matching lessons and practice', 'Setting the daily rhythm'];

  useEffect(() => {
    if (reduceMotion) {
      const timer = window.setTimeout(onComplete, 650);
      return () => window.clearTimeout(timer);
    }

    const timers = [
      window.setTimeout(() => setCompleted(1), 650),
      window.setTimeout(() => setCompleted(2), 1450),
      window.setTimeout(() => setCompleted(3), 2250),
      window.setTimeout(onComplete, 2900),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [onComplete, reduceMotion]);

  return (
    <div className="flex min-h-full flex-col justify-center py-8">
      <TigerGuide mood="thinking" message={language === 'es' ? 'Estoy adaptando la primera semana a tus respuestas.' : 'I am matching the first week to your answers.'} />
      <div className="mt-10 rounded-[1.6rem] border border-white/10 bg-white/[.045] p-5">
        <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full rounded-full bg-[var(--ob-accent)]" animate={{ width: `${(completed / 3) * 100}%` }} />
        </div>
        <div className="space-y-4">
          {lines.map((line, index) => {
            const done = completed > index;
            return (
              <div key={line} className="flex items-center gap-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${done ? 'bg-[#3FC78E] text-[#05251F]' : 'bg-white/8 text-[#6F9990]'}`}>
                  {done ? <Check size={16} /> : index + 1}
                </span>
                <span className={done ? 'text-sm font-semibold text-[var(--ob-text)]' : 'text-sm font-medium text-[var(--ob-muted)]'}>{line}</span>
              </div>
            );
          })}
        </div>
      </div>
      <button onClick={onSkip} className="mt-6 min-h-12 text-sm font-semibold text-[var(--ob-muted)]">
        {language === 'es' ? 'Saltar animación' : 'Skip animation'}
      </button>
    </div>
  );
};

const PathReveal: React.FC<{ draft: OnboardingDraft; onContinue: () => void; language: Language }> = ({ draft, onContinue, language }) => {
  const calibration = calculateCalibration(draft.experience, draft.calibrationAnswers);
  const minutes = draft.dailyGoal || 10;
  const focus = applicationLabels(draft.applications, language)[0];
  const nodes = [
    { title: language === 'es' ? 'Aprende' : 'Learn', detail: language === 'es' ? 'Activos y pasivos' : 'Assets vs Liabilities', icon: <BookOpen size={20} /> },
    { title: language === 'es' ? 'Aplica' : 'Apply', detail: focus, icon: <Target size={20} /> },
    { title: language === 'es' ? 'Progreso verificado' : 'Verified progress', detail: language === 'es' ? 'La evidencia suma XP competitivo' : 'Evidence earns leaderboard XP', icon: <ShieldCheck size={20} /> },
  ];

  return (
    <div className="flex min-h-full flex-col py-3">
      <ScreenHeader
        eyebrow={language === 'es' ? 'Tu primera semana está lista' : 'First week ready'}
        title={language === 'es' ? 'Tu ruta empieza con decisiones reales.' : 'Your path starts with real decisions.'}
        body={language === 'es' ? `Nivel inicial: ${calibration === 'accelerated' ? 'avanzado' : calibration === 'foundation' ? 'fundamentos' : 'principiante'}. Ritmo diario: ${minutes} minutos.` : `Starting level: ${calibration}. Daily rhythm: ${minutes} minutes.`}
        guide={<TigerGuide mood="ready" message={language === 'es' ? 'El ciclo es simple: aprende, aplica y demuestra tu progreso.' : 'The loop is simple: learn, apply, and prove progress.'} />}
      />
      <div className="relative mt-2 space-y-4">
        <div className="absolute bottom-10 left-9 top-10 w-px bg-[var(--ob-accent)]/35" />
        {nodes.map((node, index) => (
          <motion.div
            key={node.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.12 }}
            className="relative flex gap-4 rounded-[1.25rem] border border-white/10 bg-white/[.045] p-4"
          >
            <span className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-[var(--ob-accent)] text-[var(--ob-accent-ink)]">{node.icon}</span>
            <span>
              <strong className="block text-base text-white">{node.title}</strong>
              <span className="mt-1 block text-sm leading-5 text-[var(--ob-muted)]">{node.detail}</span>
            </span>
          </motion.div>
        ))}
      </div>
      <StickyActions>
        <PrimaryAction onClick={onContinue}>{language === 'es' ? 'Probar la primera lección' : 'Try the first lesson'} <Play size={18} /></PrimaryAction>
      </StickyActions>
    </div>
  );
};

export const OnboardingFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { appUser, updateAppUser } = useAuth();
  const { language, setLanguage } = useBrain();
  const isEs = language === 'es';
  const tr = (es: string, en: string) => isEs ? es : en;
  const firstLesson = useMemo(() => MISSION_BANK.find(mission => mission.id === FIRST_LESSON_ID), []);
  const [draft, setDraft] = useState<OnboardingDraft>(() => loadDraft());
  const [direction, setDirection] = useState(1);
  const [calibrationIndex, setCalibrationIndex] = useState(0);
  const [splashRevealed, setSplashRevealed] = useState(false);
  const [error, setError] = useState('');
  const [finalizing, setFinalizing] = useState(false);
  const [authAdvanced, setAuthAdvanced] = useState(false);
  const headingRef = useRef(0);

  const step = draft.step;
  const calibration = calculateCalibration(draft.experience, draft.calibrationAnswers);

  useEffect(() => {
    saveDraft(draft);
    updateAppUser({ ...buildPersonalizedProfile(draft), onboardingComplete: false }).catch(() => undefined);
  }, [draft, updateAppUser]);

  useEffect(() => {
    headingRef.current += 1;
    window.setTimeout(() => {
      const heading = document.querySelector<HTMLHeadingElement>('h1[tabindex="-1"]');
      heading?.focus();
    }, 50);
  }, [step]);

  useEffect(() => {
    if (step === 'save_progress' && appUser && !authAdvanced) {
      setAuthAdvanced(true);
    }
  }, [appUser, authAdvanced, step]);

  useEffect(() => {
    if (step === 'success' && draft.lessonCompleted) {
      fireRewardConfetti();
    }
  }, [draft.lessonCompleted, step]);

  const patchDraft = (patch: Partial<OnboardingDraft>) => {
    setDraft(current => ({ ...current, ...patch }));
  };

  const goTo = (target: OnboardingStep, nextDirection = 1) => {
    setDirection(nextDirection);
    setError('');
    setDraft(current => ({ ...current, step: target }));
  };

  const advance = () => goTo(nextStep(step), 1);
  const back = () => {
    if (step === 'calibration' && calibrationIndex > 0) {
      setCalibrationIndex(index => index - 1);
      return;
    }
    goTo(previousStep(step), -1);
  };

  const selectAndAdvance = <T,>(patch: Partial<OnboardingDraft>) => {
    patchDraft(patch);
    window.setTimeout(() => {
      setDirection(1);
      setDraft(current => ({ ...current, ...patch, step: nextStep(current.step) }));
    }, 230);
  };

  const toggleApplication = (id: ApplicationPreference) => {
    setDraft(current => {
      const exists = current.applications.includes(id);
      const applications = exists
        ? current.applications.filter(item => item !== id)
        : [...current.applications, id];
      return { ...current, applications };
    });
  };

  const answerCalibration = (option: { id: string; correct: boolean }) => {
    const question = calibrationQuestions[calibrationIndex];
    setDraft(current => {
      const remaining = current.calibrationAnswers.filter(answer => answer.questionId !== question.id);
      return {
        ...current,
        calibrationAnswers: [...remaining, { questionId: question.id, optionId: option.id, correct: option.correct }],
      };
    });
  };

  const currentCalibrationAnswer = draft.calibrationAnswers.find(answer => answer.questionId === calibrationQuestions[calibrationIndex]?.id);

  const continueCalibration = () => {
    if (calibrationIndex < calibrationQuestions.length - 1) {
      setCalibrationIndex(index => index + 1);
      return;
    }
    advance();
  };

  const requestReminder = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      patchDraft({ reminderStatus: 'unsupported' });
      await updateAppUser({ notificationPreferences: { daily_reminder: false, streak_risk: false, apply_reminder: false } });
      return;
    }

    try {
      const permission = await window.Notification.requestPermission();
      const enabled = permission === 'granted';
      patchDraft({ reminderStatus: enabled ? 'enabled' : permission === 'denied' ? 'denied' : 'dismissed' });
      await updateAppUser({ notificationPreferences: { daily_reminder: enabled, streak_risk: enabled, apply_reminder: enabled } });
    } catch {
      patchDraft({ reminderStatus: 'unsupported' });
    }
  };

  const finalize = async (accessChoice: 'free' | 'super') => {
    if (finalizing) return;
    setFinalizing(true);
    setError('');
    const finalDraft = { ...draft, accessChoice, step: 'access' as const };
    try {
      await updateAppUser({
        ...buildPersonalizedProfile(finalDraft),
        onboardingComplete: true,
        onboardingStep: 'complete',
        isSuperT1ger: accessChoice === 'super' ? appUser?.isSuperT1ger : appUser?.isSuperT1ger,
      });
      clearDraft();
      onComplete();
    } catch (err) {
      console.error('Onboarding finalization failed', err);
      setError(tr('No pudimos guardar el perfil. Tus respuestas siguen aquí; inténtalo de nuevo.', 'We could not save your profile. Your answers are still here; try again.'));
      setFinalizing(false);
    }
  };

  if (step === 'micro_lesson') {
    if (!firstLesson) {
      return (
        <OnboardingShell step={step} direction={direction} onBack={back} language={language}>
          <div className="flex min-h-full flex-col justify-center">
            <ScreenHeader title={tr('La primera lección no está disponible.', 'The first lesson is unavailable.')} body={tr('No encontramos la primera lección de inversión. Vuelve al plan e inténtalo de nuevo.', 'The Investing curriculum is missing its first lesson. Return to the plan and try again.')} />
            <PrimaryAction onClick={() => goTo('plan_reveal', -1)} variant="secondary">{tr('Volver al plan', 'Back to plan')}</PrimaryAction>
          </div>
        </OnboardingShell>
      );
    }

    return (
      <OnboardingShell step={step} direction={direction} onBack={back} hideProgress flush language={language}>
        <MissionEngine
          mission={firstLesson}
          onComplete={() => {
            patchDraft({ lessonCompleted: true, step: 'success' });
            setDirection(1);
          }}
        />
      </OnboardingShell>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 'arrival':
        return (
          <div className="relative flex min-h-full flex-col pb-2 pt-[calc(1.25rem+env(safe-area-inset-top))]">
            <AnimatePresence>
              {!splashRevealed && (
                <motion.button
                  type="button"
                  aria-label={tr('Comenzar onboarding de T1GER', 'Start T1GER onboarding')}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setSplashRevealed(true)}
                  className="t1ger-onboarding t1ger-onboarding-splash fixed inset-0 z-[600] flex cursor-pointer select-none flex-col items-center overflow-hidden px-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] text-left"
                >
                  <div className="flex w-full items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-[.18em] text-[var(--ob-muted)]">
                    <span>T1GER</span>
                    <span>{tr('Aprende haciendo', 'Learn by doing')}</span>
                  </div>

                  <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.018, 1], y: [0, -3, 0] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="h-[25rem] w-full"
                    >
                      <T1gerMascot3D mood="idle" className="h-full w-full" />
                    </motion.div>
                  </div>

                  <div className="w-full">
                    <h2 className="text-[2.65rem] font-black leading-none tracking-[-.055em] text-[var(--ob-text)]">T1GER</h2>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="h-px flex-1 bg-[var(--ob-accent)]/55" />
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[.18em] text-[var(--ob-accent)]">{tr('Toca para empezar', 'Tap to begin')}</span>
                    </div>
                  </div>
                </motion.button>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.52, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[.16em] text-[var(--ob-muted)]">{tr('Idioma', 'Language')}</span>
                <div className="flex rounded-full border border-[var(--ob-border)] bg-white/[.035] p-1" aria-label={tr('Seleccionar idioma', 'Choose language')}>
                  {(['es', 'en'] as const).map(option => (
                    <button key={option} type="button" onClick={() => setLanguage(option)} aria-pressed={language === option} className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${language === option ? 'bg-[var(--ob-accent)] text-[var(--ob-accent-ink)]' : 'text-[var(--ob-muted)]'}`}>
                      {option.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative -mr-5 h-[17rem] w-[calc(100%+1.25rem)] shrink-0 self-end pointer-events-none">
                <T1gerMascot3D mood="idle" className="h-full w-full" />
              </div>
              <div className="-mt-3 text-left">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[.18em] text-[var(--ob-accent)]">{tr('T1GER Inversión', 'T1GER Investing')}</p>
                <h1 tabIndex={-1} className="mt-3 max-w-[10ch] text-[2.8rem] font-black leading-[.94] tracking-[-.045em] text-[var(--ob-text)] outline-none focus-visible:outline-none">{tr('Aprende. Aplica. Demuéstralo.', 'Learn it. Apply it. Prove it.')}</h1>
                <p className="mt-4 max-w-[36ch] text-[15px] font-medium leading-6 text-[var(--ob-muted)]">
                  {tr('Lecciones cortas que se convierten en decisiones reales, con evidencia cuando importa.', 'Short lessons become real investing decisions, with proof when it matters.')}
                </p>
              </div>
            </motion.div>
            <div className="relative z-10 mt-6 space-y-3">
              <PrimaryAction onClick={() => goTo('guide')}>{tr('Crear mi ruta', 'Build my path')} <ChevronRight size={18} /></PrimaryAction>
              <PrimaryAction onClick={() => goTo('save_progress')} variant="secondary">{tr('Ya tengo una cuenta', 'I already have an account')}</PrimaryAction>
            </div>
          </div>
        );

      case 'guide':
        return (
          <div className="flex min-h-full flex-col py-3">
            <ScreenHeader
              guide={<TigerGuide mood="calm" message={tr('Responde unas preguntas y prueba una lección antes de registrarte.', 'Answer a few questions, then try a real lesson before signup.')} />}
              eyebrow={tr('Siete decisiones rápidas', 'Seven quick decisions')}
              title={tr('Crearé tu primera semana según tu objetivo.', 'I will build the first week around your goal.')}
              body={tr('Cada respuesta ajusta tu ruta o tu ritmo diario.', 'Every answer adjusts your path or daily rhythm.')}
            />
            <div className="mt-auto rounded-[1.4rem] border border-[var(--ob-border)] bg-white/[.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.025)]">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  [tr('Aprende', 'Learn'), tr('Idea breve', 'Short concept')],
                  [tr('Aplica', 'Apply'), tr('Acción real', 'Real action')],
                  [tr('Demuestra', 'Verify'), tr('XP con evidencia', 'Evidence XP')],
                ].map(([title, detail]) => (
                  <div key={title} className="rounded-[1rem] bg-white/[.035] p-3">
                    <strong className="block text-sm text-[var(--ob-text)]">{title}</strong>
                    <span className="mt-1 block text-[11px] leading-4 text-[var(--ob-muted)]">{detail}</span>
                  </div>
                ))}
              </div>
            </div>
            <StickyActions><PrimaryAction onClick={advance}>{tr('Continuar', 'Continue')} <ArrowRight size={18} /></PrimaryAction></StickyActions>
          </div>
        );

      case 'outcome':
        return (
          <div className="min-h-full py-3">
            <ScreenHeader eyebrow={tr('Tu objetivo', 'Your outcome')} title={tr('¿Qué quieres lograr primero con tus inversiones?', 'What should investing help you do first?')} body={tr('Elige el resultado que haría útil tu primer mes.', 'Pick the outcome that would make the first month feel useful.')} />
            <div className="space-y-3">
              {outcomes.map(item => (
                <ChoiceCard key={item.id} icon={item.icon} title={localize(item.title, language)} detail={localize(item.detail, language)} selected={draft.outcome === item.id} onClick={() => selectAndAdvance({ outcome: item.id })} />
              ))}
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="min-h-full py-3">
            <ScreenHeader guide={<TigerGuide mood="thinking" message={tr('No hay respuestas malas. Esto sólo ajusta el punto de partida.', 'No judgment here. This only adjusts your starting point.')} />} eyebrow={tr('Punto de partida', 'Starting point')} title={tr('¿Cuánta experiencia tienes invirtiendo?', 'How much investing have you done?')} />
            <div className="space-y-3">
              {experiences.map(item => (
                <ChoiceCard key={item.id} title={localize(item.title, language)} detail={localize(item.detail, language)} selected={draft.experience === item.id} onClick={() => selectAndAdvance({ experience: item.id })} />
              ))}
            </div>
          </div>
        );

      case 'application':
        return (
          <div className="flex min-h-full flex-col py-3">
            <ScreenHeader eyebrow={tr('Enfoque práctico', 'Practice focus')} title={tr('¿Dónde quieres usar este conocimiento?', 'Where do you want to use this knowledge?')} body={tr('Elige una o más opciones. Así adaptaremos tus misiones de práctica.', 'Choose one or more. We will adapt your practice missions around them.')} />
            <div className="space-y-3">
              {applicationOptions.map(item => (
                <ChoiceCard key={item.id} title={localize(item.title, language)} detail={localize(item.detail, language)} multi selected={draft.applications.includes(item.id)} onClick={() => toggleApplication(item.id)} />
              ))}
            </div>
            <StickyActions><PrimaryAction disabled={!draft.applications.length} onClick={advance}>{tr('Continuar', 'Continue')} <ArrowRight size={18} /></PrimaryAction></StickyActions>
          </div>
        );

      case 'calibration': {
        const question = calibrationQuestions[calibrationIndex];
        const answered = Boolean(currentCalibrationAnswer);
        const selectedOption = currentCalibrationAnswer?.optionId;
        return (
          <div className="flex min-h-full flex-col py-3">
            <ScreenHeader eyebrow={tr(`Pregunta ${calibrationIndex + 1} de ${calibrationQuestions.length}`, `Question ${calibrationIndex + 1} of ${calibrationQuestions.length}`)} title={localize(question.prompt, language)} body={tr('Dos preguntas nos ayudan a elegir el nivel correcto.', 'Two quick checks help us choose the right level.')} />
            <div className="space-y-3" role="radiogroup" aria-label={localize(question.prompt, language)}>
              {question.options.map(option => {
                const selected = selectedOption === option.id;
                const correct = answered && option.correct;
                const wrong = answered && selected && !option.correct;
                return (
                  <button
                    key={option.id}
                    role="radio"
                    aria-checked={selected}
                    disabled={answered}
                    onClick={() => answerCalibration(option)}
                    className={`min-h-16 w-full rounded-[1.15rem] border p-4 text-left text-sm font-semibold leading-5 transition ${correct ? 'border-[#3FC78E] bg-[#3FC78E]/12 text-white' : wrong ? 'border-[#E56A65] bg-[#E56A65]/10 text-white' : selected ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)]/10 text-[var(--ob-text)]' : 'border-[var(--ob-border)] bg-white/[.035] text-[var(--ob-muted-strong)]'}`}
                  >
                    {localize(option.text, language)}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div role="status" className="mt-5 rounded-[1rem] border border-white/10 bg-white/[.045] p-4 text-sm leading-6 text-[#B8D0CA]">
                <strong className="block text-white">{currentCalibrationAnswer?.correct ? tr('¡Bien!', 'Nice work!') : tr('Ahora ya lo sabes.', 'Now you know.')}</strong>
                {localize(question.explanation, language)}
              </div>
            )}
            <StickyActions><PrimaryAction disabled={!answered} onClick={continueCalibration}>{tr('Continuar', 'Continue')} <ArrowRight size={18} /></PrimaryAction></StickyActions>
          </div>
        );
      }

      case 'daily_goal':
        return (
          <div className="flex min-h-full flex-col py-3">
            <ScreenHeader guide={<TigerGuide mood="ready" message={tr('La constancia gana. Diez minutos caben incluso en un día ocupado.', 'Consistency wins. Ten minutes fits even on a busy day.')} />} eyebrow={tr('Ritmo diario', 'Daily rhythm')} title={tr('¿Cuánto tiempo puedes dedicar cada día?', 'How much time can you protect each day?')} />
            <div className="grid grid-cols-2 gap-3">
              {[5, 10, 15, 20].map(minutes => (
                <button
                  key={minutes}
                  aria-pressed={draft.dailyGoal === minutes}
                  onClick={() => patchDraft({ dailyGoal: minutes })}
                  className={`min-h-32 rounded-[1.2rem] border p-4 text-left transition ${draft.dailyGoal === minutes ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)]/10' : 'border-[var(--ob-border)] bg-white/[.035]'}`}
                >
                  {minutes === 10 && <span className="mb-3 inline-flex rounded-full bg-[var(--ob-accent)] px-2 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[var(--ob-accent-ink)]">{tr('Recomendado', 'Recommended')}</span>}
                  <strong className="block text-3xl font-black text-white">{minutes}</strong>
                  <span className="mt-1 block text-sm text-[var(--ob-muted)]">{tr('min al día', 'min/day')}</span>
                  <span className="mt-3 block text-xs leading-5 text-[#7EA39B]">{tr(`${Math.round((minutes * 5) / 10)} lecciones más práctica semanal`, `${Math.round((minutes * 5) / 10)} lessons plus weekly practice`)}</span>
                </button>
              ))}
            </div>
            <StickyActions><PrimaryAction onClick={advance}>{tr('Crear mi plan', 'Build my plan')} <Sparkles size={18} /></PrimaryAction></StickyActions>
          </div>
        );

      case 'plan_build':
        return <PlanBuilder language={language} onSkip={() => goTo('plan_reveal')} onComplete={() => { patchDraft({ planBuilt: true, step: 'plan_reveal' }); setDirection(1); }} />;

      case 'plan_reveal':
        return <PathReveal draft={draft} onContinue={advance} language={language} />;

      case 'success':
        return (
          <div className="flex min-h-full flex-col justify-center py-6 text-center">
            <TigerGuide mood="celebrate" message={tr('Primera lección lista. Este XP es personal; el XP competitivo exige evidencia.', 'First lesson done. This is personal XP; competitive XP requires evidence.')} />
            <div className="mt-10 rounded-[1.7rem] border border-white/10 bg-white/[.045] p-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[var(--ob-accent)] text-[var(--ob-accent-ink)]"><Trophy size={30} /></div>
              <p className="mt-6 font-mono text-xs font-black uppercase tracking-[.16em] text-[var(--ob-accent)]">{tr('Progreso personal', 'Personal progress')}</p>
              <h1 tabIndex={-1} className="mt-2 text-4xl font-black text-white outline-none">+{ONBOARDING_XP} XP</h1>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-[var(--ob-muted)]">
                {tr('Ahora convertirás esta idea en una acción: una operación simulada cuando podamos verificarla o una reflexión guiada cuando no.', 'Now you will turn this idea into action: a paper trade when it can be verified or a guided reflection when it cannot.')}
              </p>
            </div>
            <PrimaryAction onClick={advance} className="mt-6">{tr('Guardar progreso', 'Save progress')} <Lock size={18} /></PrimaryAction>
          </div>
        );

      case 'save_progress':
        return (
          <div className="flex min-h-full flex-col py-3">
            <ScreenHeader eyebrow={tr('Guarda tu progreso', 'Save progress')} title={tr('Crea tu cuenta después de tu primera victoria.', 'Create your account after your first win.')} body={tr('Conservaremos tus respuestas y tu lección aunque canceles el inicio de sesión.', 'We will keep your answers and lesson even if you cancel sign-in.')} />
            {appUser && authAdvanced ? (
              <div className="rounded-[1.4rem] border border-[#3FC78E]/30 bg-[#3FC78E]/10 p-5">
                <div className="flex items-center gap-3 text-[#BCEAD5]"><CheckCircle2 size={22} /><strong>{tr('Tu progreso está guardado en este perfil.', 'Your progress is saved to this profile.')}</strong></div>
                <p className="mt-3 text-sm leading-6 text-[var(--ob-muted)]">{appUser.email || appUser.displayName || tr('Perfil local de prueba', 'Local preview profile')}</p>
                <PrimaryAction onClick={() => goTo('reminders')} className="mt-5">{tr('Continuar', 'Continue')} <ArrowRight size={18} /></PrimaryAction>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#F7F2E8] text-zinc-900">
                <AuthGate embedded onAuthSuccess={() => { setAuthAdvanced(true); goTo('reminders'); }} />
              </div>
            )}
            {import.meta.env.DEV && !authAdvanced && (
              <PrimaryAction onClick={() => { setAuthAdvanced(true); goTo('reminders'); }} variant="secondary" className="mt-4">
                {tr('Continuar en modo local', 'Continue local preview')} <Mail size={18} />
              </PrimaryAction>
            )}
          </div>
        );

      case 'reminders':
        return (
          <div className="flex min-h-full flex-col py-3">
            <ScreenHeader
              guide={<TigerGuide mood="calm" message={tr(`Un recordatorio de ${draft.dailyGoal || 10} minutos protege el hábito que elegiste.`, `A ${draft.dailyGoal || 10}-minute reminder protects the habit you chose.`)} />}
              eyebrow={tr('Recordatorios', 'Reminders')}
              title={tr('Haz espacio para tu racha diaria.', 'Make room for your daily streak.')}
              body={tr('Sólo pediremos permiso cuando pulses Activar.', 'We will ask for permission only after you tap Enable.')}
            />
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[.045] p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[var(--ob-accent)]/12 text-[var(--ob-accent)]"><Bell size={23} /></span>
                <div>
                  <strong className="text-white">{tr('Recordatorios para aprender y aplicar', 'Learn and practice reminders')}</strong>
                  <p className="mt-2 text-sm leading-6 text-[var(--ob-muted)]">{tr('Si no das permiso, podrás terminar y usar la app normalmente.', 'If you do not grant permission, you can still finish and use the app.')}</p>
                </div>
              </div>
              {draft.reminderStatus !== 'idle' && (
                <p role="status" className="mt-4 rounded-[1rem] bg-white/[.045] p-3 text-sm text-[#B8D0CA]">
                  {draft.reminderStatus === 'enabled' && tr('Recordatorios activados.', 'Reminders enabled.')}
                  {draft.reminderStatus === 'denied' && tr('Notificaciones desactivadas. Puedes activarlas después en Perfil.', 'Notifications are off. You can enable them later in Profile.')}
                  {draft.reminderStatus === 'unsupported' && tr('Este dispositivo no admite notificaciones en la vista previa.', 'This preview does not support notifications.')}
                  {draft.reminderStatus === 'dismissed' && tr('Ahora no. Puedes activarlas más adelante.', 'Not now. You can enable them later.')}
                </p>
              )}
            </div>
            <StickyActions>
              <div className="space-y-3">
                <PrimaryAction onClick={requestReminder}>{tr('Activar recordatorios', 'Enable reminders')} <Bell size={18} /></PrimaryAction>
                <PrimaryAction onClick={advance} variant="secondary">{tr('Ahora no', 'Not now')}</PrimaryAction>
              </div>
            </StickyActions>
          </div>
        );

      case 'access':
        return (
          <div className="flex min-h-full flex-col py-3">
            <ScreenHeader eyebrow={tr('Tu plan', 'Your plan')} title={tr('Elige cómo quieres empezar.', 'Choose how you want to start.')} body={tr('Puedes aprender y practicar gratis. Super añade una experiencia más completa.', 'You can learn and practice for free. Super adds a more complete experience.')} />
            <div className="space-y-3">
              <button onClick={() => finalize('free')} disabled={finalizing} className="min-h-36 w-full rounded-[1.25rem] border border-[#3FC78E]/35 bg-[#3FC78E]/10 p-5 text-left transition active:scale-[.99]">
                <span className="flex items-center justify-between">
                  <strong className="text-xl text-white">{tr('Empezar gratis', 'Start free')}</strong>
                  <CheckCircle2 className="text-[#78DDB0]" />
                </span>
                <span className="mt-3 block text-sm leading-6 text-[#B8D0CA]">{tr('Lecciones diarias, práctica, XP personal y XP verificado cuando la evidencia califique.', 'Daily lessons, practice missions, personal XP, and verified XP when evidence qualifies.')}</span>
              </button>
              <button onClick={() => finalize('super')} disabled={finalizing} className="min-h-36 w-full rounded-[1.25rem] border border-[var(--ob-accent)]/35 bg-[var(--ob-accent)]/10 p-5 text-left transition active:scale-[.99]">
                <span className="flex items-center justify-between">
                  <strong className="text-xl text-white">Super T1GER</strong>
                  <Crown className="text-[var(--ob-accent)]" />
                </span>
                <span className="mt-3 block text-sm leading-6 text-[#D7BDAA]">{tr('Prueba la experiencia premium. No se realizará ningún cobro en esta vista previa.', 'Preview the premium experience. No purchase is made in this preview.')}</span>
              </button>
            </div>
            {error && <p role="alert" className="mt-5 rounded-[1rem] border border-[#E56A65]/25 bg-[#E56A65]/10 p-4 text-sm text-[#F2C5C2]">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <OnboardingShell step={step} direction={direction} onBack={back} hideProgress={step === 'arrival'} language={language}>
      {renderStep()}
    </OnboardingShell>
  );
};
