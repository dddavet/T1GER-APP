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
import { AuthGate } from './AuthGate';
import { MissionEngine } from './MissionEngine';
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

const outcomes: Array<{ id: Outcome; title: string; detail: string; icon: React.ReactNode }> = [
  { id: 'first-investment', title: 'Make my first investment', detail: 'Start with simple rules and paper practice.', icon: <WalletCards size={22} /> },
  { id: 'long-term-wealth', title: 'Build long-term wealth', detail: 'Use compounding, allocation, and consistency.', icon: <LineChart size={22} /> },
  { id: 'company-analysis', title: 'Learn to analyze companies', detail: 'Read statements and judge quality with evidence.', icon: <BookOpen size={22} /> },
  { id: 'retirement', title: 'Prepare for retirement', detail: 'Connect accounts, time horizon, and risk.', icon: <ShieldCheck size={22} /> },
];

const experiences: Array<{ id: Experience; title: string; detail: string }> = [
  { id: 'new', title: 'I am new to investing', detail: 'Start from vocabulary and simple decisions.' },
  { id: 'basic', title: 'I know the basics', detail: 'Move faster through concepts and focus on application.' },
  { id: 'active', title: 'I already invest', detail: 'Calibrate the path around analysis and portfolio rules.' },
];

const applicationOptions: Array<{ id: ApplicationPreference; title: string; detail: string }> = [
  { id: 'stock', title: 'Evaluate a stock', detail: 'Practice thesis, source, and valuation thinking.' },
  { id: 'portfolio', title: 'Build a portfolio', detail: 'Turn allocation into a repeatable routine.' },
  { id: 'risk', title: 'Manage risk', detail: 'Define position sizing and emotional guardrails.' },
  { id: 'news', title: 'Understand market news', detail: 'Separate useful signals from noise.' },
];

const calibrationQuestions = [
  {
    id: 'net-worth',
    prompt: 'Which equation describes net worth?',
    options: [
      { id: 'assets-minus-liabilities', text: 'Assets minus liabilities', correct: true },
      { id: 'income-minus-spending', text: 'Income minus spending', correct: false },
      { id: 'cash-plus-debt', text: 'Cash plus debt', correct: false },
    ],
    explanation: 'Net worth is what remains after subtracting obligations from owned assets.',
  },
  {
    id: 'diversification',
    prompt: 'Why do investors diversify?',
    options: [
      { id: 'guarantee-profit', text: 'To guarantee a profit every month', correct: false },
      { id: 'reduce-concentration', text: 'To reduce dependence on one asset', correct: true },
      { id: 'avoid-research', text: 'To avoid making any decisions', correct: false },
    ],
    explanation: 'Diversification reduces concentration risk. It does not remove market risk.',
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
  return outcomes.find(item => item.id === outcome)?.title || 'Build long-term wealth';
}

function applicationLabels(applications: ApplicationPreference[]) {
  if (!applications.length) return ['Build a portfolio'];
  return applications.map(id => applicationOptions.find(item => item.id === id)?.title || 'Build a portfolio');
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

const stepTitles: Record<OnboardingStep, string> = {
  arrival: 'Build your investing path',
  guide: 'Meet your guide',
  outcome: 'Choose your outcome',
  experience: 'Set your starting point',
  application: 'Choose how you will apply it',
  calibration: 'Calibrate your path',
  daily_goal: 'Choose your daily goal',
  plan_build: 'Building your plan',
  plan_reveal: 'Your first week',
  micro_lesson: 'First lesson',
  success: 'Lesson complete',
  save_progress: 'Save progress',
  reminders: 'Set reminders',
  access: 'Choose access',
};

const easeTransition = { type: 'spring' as const, stiffness: 360, damping: 34 };

interface ShellProps {
  step: OnboardingStep;
  direction: number;
  onBack: () => void;
  children: React.ReactNode;
  hideProgress?: boolean;
  flush?: boolean;
}

const OnboardingShell: React.FC<ShellProps> = ({ step, direction, onBack, children, hideProgress, flush }) => {
  const progress = ((stageIndex(step) + 1) / STEP_ORDER.length) * 100;
  const showBack = stageIndex(step) > 0 && step !== 'micro_lesson';

  return (
    <div className="fixed inset-0 z-[300] bg-[#051C18] text-[#EAF4F1]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#082821_0%,#041612_100%)]" />
      <main className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden sm:border-x sm:border-white/10">
        {!hideProgress && (
          <header className="flex shrink-0 items-center gap-3 px-5 pb-3 pt-[calc(.9rem+env(safe-area-inset-top))]">
            {showBack ? (
              <button onClick={onBack} aria-label="Go back" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[.045] text-[#CBE0DC]">
                <ArrowLeft size={20} />
              </button>
            ) : <div className="h-11 w-11 shrink-0" />}
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-[#FF7300]" animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }} />
            </div>
            <span className="w-9 text-right font-mono text-[11px] text-[#7EA39B]">{stageIndex(step) + 1}/{STEP_ORDER.length}</span>
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

const TigerGuide: React.FC<{ mood?: 'ready' | 'thinking' | 'celebrate' | 'calm'; message?: string }> = ({ mood = 'ready', message }) => {
  const reduceMotion = useReducedMotion();
  const mouth = mood === 'celebrate' ? 'h-3 w-6 rounded-b-full' : mood === 'thinking' ? 'h-1.5 w-5 rounded-full' : 'h-2 w-5 rounded-b-full';

  return (
    <div className="flex items-end gap-3">
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative h-24 w-24 shrink-0 rounded-[1.8rem] bg-[#E98532] shadow-[inset_0_-10px_0_rgba(115,54,15,.2),0_18px_40px_rgba(0,0,0,.28)]"
      >
        <span className="absolute -left-2 top-3 h-8 w-8 rotate-[-28deg] rounded-xl bg-[#E98532]" />
        <span className="absolute -right-2 top-3 h-8 w-8 rotate-[28deg] rounded-xl bg-[#E98532]" />
        <span className="absolute left-5 top-0 h-12 w-2 rotate-[24deg] rounded-full bg-[#15110D]" />
        <span className="absolute left-11 top-0 h-12 w-2 rounded-full bg-[#15110D]" />
        <span className="absolute right-5 top-0 h-12 w-2 rotate-[-24deg] rounded-full bg-[#15110D]" />
        <span className="absolute bottom-4 left-1/2 h-12 w-16 -translate-x-1/2 rounded-[1.4rem] bg-[#FFE2C3]" />
        <span className="absolute left-7 top-10 h-3 w-3 rounded-full bg-[#12110F]" />
        <span className="absolute right-7 top-10 h-3 w-3 rounded-full bg-[#12110F]" />
        <span className="absolute bottom-10 left-1/2 h-3 w-4 -translate-x-1/2 rounded-full bg-[#3A2015]" />
        <span className={`absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#3A2015] ${mouth}`} />
      </motion.div>
      {message && (
        <div className="mb-2 max-w-[13rem] rounded-[1.25rem] border border-white/10 bg-white/[.07] px-4 py-3 text-sm font-medium leading-5 text-[#DCEAE7] shadow-[0_16px_36px_rgba(0,0,0,.18)]">
          {message}
        </div>
      )}
    </div>
  );
};

const PrimaryAction: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }> = ({ className = '', variant = 'primary', children, ...props }) => {
  const classes = variant === 'primary'
    ? 'bg-[#FF7300] text-[#1A1108] shadow-[0_5px_0_#B95009] active:translate-y-1 active:shadow-[0_1px_0_#B95009]'
    : 'border border-white/12 bg-white/[.06] text-[#DCEAE7] shadow-[0_5px_0_rgba(255,255,255,.06)] active:translate-y-1 active:shadow-none';

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
    className={`group flex min-h-[4.75rem] w-full items-center gap-4 rounded-[1.15rem] border p-4 text-left transition active:scale-[.985] ${selected ? 'border-[#FF7300] bg-[#FF7300]/12 text-white shadow-[0_8px_24px_rgba(255,115,0,.12)]' : 'border-white/10 bg-white/[.045] text-[#DCEAE7] hover:border-white/20'}`}
  >
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[.9rem] ${selected ? 'bg-[#FF7300] text-[#1A1108]' : 'bg-white/[.06] text-[#87A9A2]'}`}>
      {icon || <Target size={20} />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-[15px] font-semibold leading-5">{title}</span>
      <span className="mt-1 block text-xs leading-5 text-[#91AEA8]">{detail}</span>
    </span>
    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-[#FF7300] bg-[#FF7300] text-[#1A1108]' : 'border-white/14 text-transparent'}`}>
      {selected ? <Check size={16} /> : multi ? <span className="h-2 w-2 rounded-full bg-white/18" /> : null}
    </span>
  </button>
);

const ScreenHeader: React.FC<{ eyebrow?: string; title: string; body?: string; guide?: React.ReactNode }> = ({ eyebrow, title, body, guide }) => (
  <div className="pb-6 pt-2">
    {guide && <div className="mb-7">{guide}</div>}
    {eyebrow && <p className="font-mono text-[11px] font-semibold uppercase tracking-[.16em] text-[#FFB17B]">{eyebrow}</p>}
    <h1 tabIndex={-1} className="mt-2 text-balance text-[2rem] font-black leading-[1.05] text-white outline-none">{title}</h1>
    {body && <p className="mt-4 text-pretty text-[15px] font-medium leading-6 text-[#9DBAB4]">{body}</p>}
  </div>
);

const StickyActions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="sticky bottom-0 -mx-5 mt-6 bg-[linear-gradient(180deg,rgba(5,28,24,0)_0%,#051C18_22%)] px-5 pb-2 pt-9">
    {children}
  </div>
);

const PlanBuilder: React.FC<{ onComplete: () => void; onSkip: () => void }> = ({ onComplete, onSkip }) => {
  const reduceMotion = useReducedMotion();
  const [completed, setCompleted] = useState(reduceMotion ? 3 : 0);
  const lines = ['Calibrating the starting level', 'Matching Learn and Apply missions', 'Setting the daily rhythm'];

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
      <TigerGuide mood="thinking" message="I am matching the first week to your answers." />
      <div className="mt-10 rounded-[1.6rem] border border-white/10 bg-white/[.045] p-5">
        <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full rounded-full bg-[#FF7300]" animate={{ width: `${(completed / 3) * 100}%` }} />
        </div>
        <div className="space-y-4">
          {lines.map((line, index) => {
            const done = completed > index;
            return (
              <div key={line} className="flex items-center gap-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${done ? 'bg-[#3FC78E] text-[#05251F]' : 'bg-white/8 text-[#6F9990]'}`}>
                  {done ? <Check size={16} /> : index + 1}
                </span>
                <span className={done ? 'text-sm font-semibold text-white' : 'text-sm font-medium text-[#87A9A2]'}>{line}</span>
              </div>
            );
          })}
        </div>
      </div>
      <button onClick={onSkip} className="mt-6 min-h-12 text-sm font-semibold text-[#87A9A2]">
        Skip animation
      </button>
    </div>
  );
};

const PathReveal: React.FC<{ draft: OnboardingDraft; onContinue: () => void }> = ({ draft, onContinue }) => {
  const calibration = calculateCalibration(draft.experience, draft.calibrationAnswers);
  const minutes = draft.dailyGoal || 10;
  const focus = applicationLabels(draft.applications)[0];
  const nodes = [
    { title: 'Learn', detail: 'Assets vs Liabilities', icon: <BookOpen size={20} /> },
    { title: 'Apply', detail: focus, icon: <Target size={20} /> },
    { title: 'Verified Progress', detail: 'Evidence earns leaderboard XP', icon: <ShieldCheck size={20} /> },
  ];

  return (
    <div className="flex min-h-full flex-col py-3">
      <ScreenHeader
        eyebrow="First week ready"
        title="Your path starts with real decisions."
        body={`Starting level: ${calibration}. Daily rhythm: ${minutes} minutes. T1GER will teach the concept, then move you into an Apply mission.`}
        guide={<TigerGuide mood="ready" message="This is the loop: learn, apply, prove progress." />}
      />
      <div className="relative mt-2 space-y-4">
        <div className="absolute bottom-10 left-9 top-10 w-px bg-[#FF7300]/35" />
        {nodes.map((node, index) => (
          <motion.div
            key={node.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.12 }}
            className="relative flex gap-4 rounded-[1.25rem] border border-white/10 bg-white/[.045] p-4"
          >
            <span className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-[#FF7300] text-[#1A1108]">{node.icon}</span>
            <span>
              <strong className="block text-base text-white">{node.title}</strong>
              <span className="mt-1 block text-sm leading-5 text-[#91AEA8]">{node.detail}</span>
            </span>
          </motion.div>
        ))}
      </div>
      <StickyActions>
        <PrimaryAction onClick={onContinue}>Try the first lesson <Play size={18} /></PrimaryAction>
      </StickyActions>
    </div>
  );
};

export const OnboardingFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { appUser, updateAppUser } = useAuth();
  const firstLesson = useMemo(() => MISSION_BANK.find(mission => mission.id === FIRST_LESSON_ID), []);
  const [draft, setDraft] = useState<OnboardingDraft>(() => loadDraft());
  const [direction, setDirection] = useState(1);
  const [calibrationIndex, setCalibrationIndex] = useState(0);
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
      setError('Profile save failed. Your answers are still here; try again.');
      setFinalizing(false);
    }
  };

  if (step === 'micro_lesson') {
    if (!firstLesson) {
      return (
        <OnboardingShell step={step} direction={direction} onBack={back}>
          <div className="flex min-h-full flex-col justify-center">
            <ScreenHeader title="The first lesson is unavailable." body="The Investing curriculum is missing its first lesson. Return to the plan and try again." />
            <PrimaryAction onClick={() => goTo('plan_reveal', -1)} variant="secondary">Back to plan</PrimaryAction>
          </div>
        </OnboardingShell>
      );
    }

    return (
      <OnboardingShell step={step} direction={direction} onBack={back} hideProgress flush>
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
          <div className="flex min-h-full flex-col justify-end pb-2 pt-[calc(2rem+env(safe-area-inset-top))]">
            <div className="flex-1 pt-8">
              <TigerGuide mood="ready" />
              <div className="mt-10">
                <p className="font-mono text-xs font-black uppercase tracking-[.18em] text-[#FFB17B]">T1GER Investing</p>
                <h1 tabIndex={-1} className="mt-4 text-[3.15rem] font-black leading-[.92] text-white outline-none">Learn it. Apply it. Prove it.</h1>
                <p className="mt-5 max-w-sm text-base font-medium leading-7 text-[#9DBAB4]">
                  Build an investing path that starts with short lessons and ends in real-world practice.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <PrimaryAction onClick={() => goTo('guide')}>Build my path <ChevronRight size={18} /></PrimaryAction>
              <PrimaryAction onClick={() => goTo('save_progress')} variant="secondary">I already have an account</PrimaryAction>
            </div>
          </div>
        );

      case 'guide':
        return (
          <div className="flex min-h-full flex-col py-3">
            <ScreenHeader
              guide={<TigerGuide mood="calm" message="Answer a few decisions, then you will try a real lesson before signup." />}
              eyebrow="Seven quick decisions"
              title="I will build the first week around your goal."
              body="No fake topics, no generic survey. Every answer changes your Investing path or daily rhythm."
            />
            <div className="mt-auto rounded-[1.4rem] border border-white/10 bg-white/[.045] p-5">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  ['Learn', 'Short concept'],
                  ['Apply', 'Real action'],
                  ['Verify', 'Evidence XP'],
                ].map(([title, detail]) => (
                  <div key={title} className="rounded-[1rem] bg-white/[.045] p-3">
                    <strong className="block text-sm text-white">{title}</strong>
                    <span className="mt-1 block text-[11px] leading-4 text-[#87A9A2]">{detail}</span>
                  </div>
                ))}
              </div>
            </div>
            <StickyActions><PrimaryAction onClick={advance}>Continue <ArrowRight size={18} /></PrimaryAction></StickyActions>
          </div>
        );

      case 'outcome':
        return (
          <div className="min-h-full py-3">
            <ScreenHeader eyebrow="Your outcome" title="What should investing help you do first?" body="Pick the outcome that would make the first month feel useful." />
            <div className="space-y-3">
              {outcomes.map(item => (
                <ChoiceCard key={item.id} {...item} selected={draft.outcome === item.id} onClick={() => selectAndAdvance({ outcome: item.id })} />
              ))}
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="min-h-full py-3">
            <ScreenHeader guide={<TigerGuide mood="thinking" message="No judgment here. Calibration keeps the first lessons useful." />} eyebrow="Starting point" title="How much investing have you done?" />
            <div className="space-y-3">
              {experiences.map(item => (
                <ChoiceCard key={item.id} {...item} selected={draft.experience === item.id} onClick={() => selectAndAdvance({ experience: item.id })} />
              ))}
            </div>
          </div>
        );

      case 'application':
        return (
          <div className="flex min-h-full flex-col py-3">
            <ScreenHeader eyebrow="Apply focus" title="Where do you want to use this knowledge?" body="Choose one or more. This changes the Apply missions T1GER emphasizes." />
            <div className="space-y-3">
              {applicationOptions.map(item => (
                <ChoiceCard key={item.id} {...item} multi selected={draft.applications.includes(item.id)} onClick={() => toggleApplication(item.id)} />
              ))}
            </div>
            <StickyActions><PrimaryAction disabled={!draft.applications.length} onClick={advance}>Continue <ArrowRight size={18} /></PrimaryAction></StickyActions>
          </div>
        );

      case 'calibration': {
        const question = calibrationQuestions[calibrationIndex];
        const answered = Boolean(currentCalibrationAnswer);
        const selectedOption = currentCalibrationAnswer?.optionId;
        return (
          <div className="flex min-h-full flex-col py-3">
            <ScreenHeader eyebrow={`Question ${calibrationIndex + 1} of ${calibrationQuestions.length}`} title={question.prompt} body="Two quick checks help us avoid starting too high or too low." />
            <div className="space-y-3" role="radiogroup" aria-label={question.prompt}>
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
                    className={`min-h-16 w-full rounded-[1.15rem] border p-4 text-left text-sm font-semibold leading-5 transition ${correct ? 'border-[#3FC78E] bg-[#3FC78E]/12 text-white' : wrong ? 'border-[#E56A65] bg-[#E56A65]/10 text-white' : selected ? 'border-[#FF7300] bg-[#FF7300]/12 text-white' : 'border-white/10 bg-white/[.045] text-[#DCEAE7]'}`}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div role="status" className="mt-5 rounded-[1rem] border border-white/10 bg-white/[.045] p-4 text-sm leading-6 text-[#B8D0CA]">
                <strong className="block text-white">{currentCalibrationAnswer?.correct ? 'Good read.' : 'Useful signal.'}</strong>
                {question.explanation}
              </div>
            )}
            <StickyActions><PrimaryAction disabled={!answered} onClick={continueCalibration}>Continue <ArrowRight size={18} /></PrimaryAction></StickyActions>
          </div>
        );
      }

      case 'daily_goal':
        return (
          <div className="flex min-h-full flex-col py-3">
            <ScreenHeader guide={<TigerGuide mood="ready" message="Consistency beats intensity. Ten minutes is the default because it survives busy days." />} eyebrow="Daily rhythm" title="How much time can you protect each day?" />
            <div className="grid grid-cols-2 gap-3">
              {[5, 10, 15, 20].map(minutes => (
                <button
                  key={minutes}
                  aria-pressed={draft.dailyGoal === minutes}
                  onClick={() => patchDraft({ dailyGoal: minutes })}
                  className={`min-h-32 rounded-[1.2rem] border p-4 text-left transition ${draft.dailyGoal === minutes ? 'border-[#FF7300] bg-[#FF7300]/12' : 'border-white/10 bg-white/[.045]'}`}
                >
                  {minutes === 10 && <span className="mb-3 inline-flex rounded-full bg-[#FF7300] px-2 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[#1A1108]">Recommended</span>}
                  <strong className="block text-3xl font-black text-white">{minutes}</strong>
                  <span className="mt-1 block text-sm text-[#91AEA8]">min/day</span>
                  <span className="mt-3 block text-xs leading-5 text-[#7EA39B]">{Math.round((minutes * 5) / 10)} lessons plus Apply practice weekly</span>
                </button>
              ))}
            </div>
            <StickyActions><PrimaryAction onClick={advance}>Build my plan <Sparkles size={18} /></PrimaryAction></StickyActions>
          </div>
        );

      case 'plan_build':
        return <PlanBuilder onSkip={() => goTo('plan_reveal')} onComplete={() => { patchDraft({ planBuilt: true, step: 'plan_reveal' }); setDirection(1); }} />;

      case 'plan_reveal':
        return <PathReveal draft={draft} onContinue={advance} />;

      case 'success':
        return (
          <div className="flex min-h-full flex-col justify-center py-6 text-center">
            <TigerGuide mood="celebrate" message="First lesson done. This is personal XP, not verified leaderboard XP." />
            <div className="mt-10 rounded-[1.7rem] border border-white/10 bg-white/[.045] p-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[#FF7300] text-[#1A1108]"><Trophy size={30} /></div>
              <p className="mt-6 font-mono text-xs font-black uppercase tracking-[.16em] text-[#FFB17B]">Personal progress</p>
              <h1 tabIndex={-1} className="mt-2 text-4xl font-black text-white outline-none">+{ONBOARDING_XP} XP</h1>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-[#9DBAB4]">
                Next, T1GER turns this concept into an Apply mission: paper trading when it can verify data, structured reflection when it cannot.
              </p>
            </div>
            <PrimaryAction onClick={advance} className="mt-6">Save progress <Lock size={18} /></PrimaryAction>
          </div>
        );

      case 'save_progress':
        return (
          <div className="flex min-h-full flex-col py-3">
            <ScreenHeader eyebrow="Save progress" title="Create your free account after the first win." body="Your answers and lesson completion stay intact if sign-in fails or you cancel." />
            {appUser && authAdvanced ? (
              <div className="rounded-[1.4rem] border border-[#3FC78E]/30 bg-[#3FC78E]/10 p-5">
                <div className="flex items-center gap-3 text-[#BCEAD5]"><CheckCircle2 size={22} /><strong>Progress is attached to this profile.</strong></div>
                <p className="mt-3 text-sm leading-6 text-[#91AEA8]">{appUser.email || appUser.displayName || 'Local preview profile'}</p>
                <PrimaryAction onClick={() => goTo('reminders')} className="mt-5">Continue <ArrowRight size={18} /></PrimaryAction>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#F7F2E8] text-zinc-900">
                <AuthGate embedded onAuthSuccess={() => { setAuthAdvanced(true); goTo('reminders'); }} />
              </div>
            )}
            {import.meta.env.DEV && !authAdvanced && (
              <PrimaryAction onClick={() => { setAuthAdvanced(true); goTo('reminders'); }} variant="secondary" className="mt-4">
                Continue local preview <Mail size={18} />
              </PrimaryAction>
            )}
          </div>
        );

      case 'reminders':
        return (
          <div className="flex min-h-full flex-col py-3">
            <ScreenHeader
              guide={<TigerGuide mood="calm" message={`A ${draft.dailyGoal || 10}-minute reminder protects the path you chose.`} />}
              eyebrow="Reminders"
              title="Protect the daily streak before it starts."
              body="T1GER will ask the operating system only after you tap enable."
            />
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[.045] p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#FF7300]/14 text-[#FFB17B]"><Bell size={23} /></span>
                <div>
                  <strong className="text-white">Daily lesson and Apply reminders</strong>
                  <p className="mt-2 text-sm leading-6 text-[#91AEA8]">If notifications are denied or unsupported, you can still finish onboarding and use the app.</p>
                </div>
              </div>
              {draft.reminderStatus !== 'idle' && (
                <p role="status" className="mt-4 rounded-[1rem] bg-white/[.045] p-3 text-sm text-[#B8D0CA]">
                  {draft.reminderStatus === 'enabled' && 'Reminders enabled.'}
                  {draft.reminderStatus === 'denied' && 'Notifications are denied. You can enable them later in settings.'}
                  {draft.reminderStatus === 'unsupported' && 'Notifications are not supported in this preview.'}
                  {draft.reminderStatus === 'dismissed' && 'Reminder prompt dismissed. You can enable it later.'}
                </p>
              )}
            </div>
            <StickyActions>
              <div className="space-y-3">
                <PrimaryAction onClick={requestReminder}>Enable reminders <Bell size={18} /></PrimaryAction>
                <PrimaryAction onClick={advance} variant="secondary">Not now</PrimaryAction>
              </div>
            </StickyActions>
          </div>
        );

      case 'access':
        return (
          <div className="flex min-h-full flex-col py-3">
            <ScreenHeader eyebrow="Access" title="Choose how you want to start." body="Free keeps the Learn and Apply loop available. Super can be wired to the real subscription flow when checkout is ready." />
            <div className="space-y-3">
              <button onClick={() => finalize('free')} disabled={finalizing} className="min-h-36 w-full rounded-[1.25rem] border border-[#3FC78E]/35 bg-[#3FC78E]/10 p-5 text-left transition active:scale-[.99]">
                <span className="flex items-center justify-between">
                  <strong className="text-xl text-white">Start free</strong>
                  <CheckCircle2 className="text-[#78DDB0]" />
                </span>
                <span className="mt-3 block text-sm leading-6 text-[#B8D0CA]">Daily lessons, Apply missions, personal XP, and verified XP when evidence qualifies.</span>
              </button>
              <button onClick={() => finalize('super')} disabled={finalizing} className="min-h-36 w-full rounded-[1.25rem] border border-[#FF7300]/35 bg-[#FF7300]/10 p-5 text-left transition active:scale-[.99]">
                <span className="flex items-center justify-between">
                  <strong className="text-xl text-white">Super T1GER</strong>
                  <Crown className="text-[#FFB17B]" />
                </span>
                <span className="mt-3 block text-sm leading-6 text-[#D7BDAA]">Preview the premium path without marking a purchase successful. Real checkout remains controlled by the subscription system.</span>
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
    <OnboardingShell step={step} direction={direction} onBack={back} hideProgress={step === 'arrival'}>
      {renderStep()}
    </OnboardingShell>
  );
};
