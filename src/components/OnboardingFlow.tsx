import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Blocks,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  LineChart,
  Loader2,
  PlaySquare,
  Rocket,
  ShieldCheck,
  Target,
  Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GlassButton } from './ui/apple-tahoe-liquid-glass-button';

type AnswerValue = string | number;

type Option = {
  id: string;
  value?: AnswerValue;
  label: string;
  description?: string;
  icon?: React.ReactNode;
};

type Step = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  options?: Option[];
  renderCustom?: 'level-slider' | 'plan-summary';
};

const STEPS: Step[] = [
  {
    id: 'goal',
    eyebrow: 'Outcome',
    title: 'What are you building toward?',
    subtitle: 'T1GER will turn this into daily missions, not generic motivation.',
    options: [
      {
        id: 'startup',
        label: 'Build a startup',
        description: 'Validate offers, talk to customers, and ship faster.',
        icon: <Rocket className="h-5 w-5" />,
      },
      {
        id: 'career',
        label: 'Grow my career',
        description: 'Stack useful skills and become harder to replace.',
        icon: <BriefcaseBusiness className="h-5 w-5" />,
      },
      {
        id: 'investing',
        label: 'Master investing',
        description: 'Learn capital, risk, accounting, and market judgment.',
        icon: <LineChart className="h-5 w-5" />,
      },
      {
        id: 'freedom',
        label: 'Financial freedom',
        description: 'Build discipline around income, assets, and execution.',
        icon: <Target className="h-5 w-5" />,
      },
    ],
  },
  {
    id: 'businessStage',
    eyebrow: 'Stage',
    title: 'Where are you right now?',
    subtitle: 'This keeps the first missions useful instead of overpowered.',
    options: [
      { id: 'idea', label: 'Idea stage', description: 'I need clarity and a first offer.' },
      { id: 'building', label: 'Building', description: 'I am creating the product, skill, or service.' },
      { id: 'selling', label: 'Selling', description: 'I need customers, content, or distribution.' },
      { id: 'scaling', label: 'Scaling', description: 'I have traction and need systems.' },
    ],
  },
  {
    id: 'dailyTime',
    eyebrow: 'Commitment',
    title: 'How much time can you defend daily?',
    subtitle: 'Choose the minimum you can actually protect on a bad day.',
    options: [
      { id: '10', value: 10, label: '10 minutes', description: 'Minimum viable progress.' },
      { id: '20', value: 20, label: '20 minutes', description: 'Enough for one tactical action.' },
      { id: '45', value: 45, label: '45 minutes', description: 'Deep work and proof of execution.' },
    ],
  },
  {
    id: 'experienceLevel',
    eyebrow: 'Calibration',
    title: 'What is your current level?',
    subtitle: '1 is a total beginner. 10 is already operating at a high level.',
    renderCustom: 'level-slider',
  },
  {
    id: 'learningStyle',
    eyebrow: 'Training style',
    title: 'When the work gets confusing, what helps most?',
    subtitle: 'Your missions and lessons will bias toward this format.',
    options: [
      {
        id: 'text',
        label: 'Written breakdown',
        description: 'I want steps, examples, and clear criteria.',
        icon: <FileText className="h-5 w-5" />,
      },
      {
        id: 'visual',
        label: 'Visual demonstration',
        description: 'I understand faster through examples and diagrams.',
        icon: <PlaySquare className="h-5 w-5" />,
      },
      {
        id: 'interactive',
        label: 'Action first',
        description: 'Give me the mission and let me learn by doing.',
        icon: <Blocks className="h-5 w-5" />,
      },
    ],
  },
  {
    id: 'plan',
    eyebrow: 'Your first protocol',
    title: 'T1GER is ready to generate your path.',
    subtitle: 'Review the setup, then enter the app with your first tactical profile.',
    renderCustom: 'plan-summary',
  },
];

const GOAL_TO_NICHE: Record<string, string> = {
  startup: 'business',
  career: 'career',
  investing: 'investing',
  freedom: 'finance',
};

const LABELS: Record<string, Record<string, string>> = {
  goal: {
    startup: 'Build a startup',
    career: 'Grow my career',
    investing: 'Master investing',
    freedom: 'Financial freedom',
  },
  businessStage: {
    idea: 'Idea stage',
    building: 'Building',
    selling: 'Selling',
    scaling: 'Scaling',
  },
  learningStyle: {
    text: 'Written breakdown',
    visual: 'Visual demonstration',
    interactive: 'Action first',
  },
};

function haptic() {
  if (window.navigator?.vibrate) {
    window.navigator.vibrate(10);
  }
}

function getAnswerLabel(stepId: string, value: AnswerValue | undefined) {
  if (value === undefined) return 'Not set';
  if (stepId === 'dailyTime') return `${value} min/day`;
  if (stepId === 'experienceLevel') return `Level ${value}`;
  return LABELS[stepId]?.[String(value)] || String(value);
}

export const OnboardingFlow: React.FC = () => {
  const { updateAppUser } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [sliderValue, setSliderValue] = useState(4);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState('');

  const currentStep = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const planPreview = useMemo(() => {
    return [
      { label: 'Outcome', value: getAnswerLabel('goal', answers.goal), icon: <Target className="h-4 w-4" /> },
      { label: 'Stage', value: getAnswerLabel('businessStage', answers.businessStage), icon: <ShieldCheck className="h-4 w-4" /> },
      { label: 'Daily floor', value: getAnswerLabel('dailyTime', answers.dailyTime), icon: <Clock3 className="h-4 w-4" /> },
      { label: 'Level', value: getAnswerLabel('experienceLevel', answers.experienceLevel), icon: <Zap className="h-4 w-4" /> },
      { label: 'Style', value: getAnswerLabel('learningStyle', answers.learningStyle), icon: <Blocks className="h-4 w-4" /> },
    ];
  }, [answers]);

  const completeOnboarding = async (finalAnswers: Record<string, AnswerValue>) => {
    setError('');
    setIsFinishing(true);

    try {
      const goal = String(finalAnswers.goal || 'startup');
      await updateAppUser({
        ...finalAnswers,
        goal,
        niche: GOAL_TO_NICHE[goal] || 'business',
        experienceLevel: Number(finalAnswers.experienceLevel || 4),
        dailyTime: Number(finalAnswers.dailyTime || 20),
        learningStyle: (finalAnswers.learningStyle || 'interactive') as 'visual' | 'text' | 'interactive',
        onboardingStep: 'complete',
        onboardingComplete: true,
      });
    } catch (err) {
      console.error('Onboarding failed', err);
      setError('We could not save your setup. Try once more.');
      setIsFinishing(false);
    }
  };

  const advance = (nextAnswers = answers) => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((prev) => prev + 1);
      return;
    }

    void completeOnboarding(nextAnswers);
  };

  const selectOption = (option: Option) => {
    haptic();
    const value = option.value ?? option.id;
    const nextAnswers = { ...answers, [currentStep.id]: value };
    setAnswers(nextAnswers);
    window.setTimeout(() => advance(nextAnswers), 120);
  };

  const submitSlider = () => {
    haptic();
    const nextAnswers = { ...answers, [currentStep.id]: sliderValue };
    setAnswers(nextAnswers);
    advance(nextAnswers);
  };

  const goBack = () => {
    if (stepIndex === 0 || isFinishing) return;
    haptic();
    setStepIndex((prev) => prev - 1);
  };

  if (isFinishing) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-8 bg-[#050505] px-6 text-white">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
            className="h-24 w-24 rounded-full border border-white/10 border-t-[var(--accent-main)]"
          />
          <Loader2 className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-[var(--accent-main)]" />
        </div>
        <div className="max-w-xs space-y-2 text-center">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Building your protocol</h2>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500">
            Calibrating missions, pace, and proof standards.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full overflow-hidden bg-[#050505] text-white">
      <div className="mx-auto grid min-h-[100dvh] w-full max-w-6xl grid-cols-1 gap-0 md:grid-cols-[minmax(0,1fr)_360px]">
        <main className="flex min-h-[100dvh] flex-col px-5 py-6 sm:px-8 md:px-10">
          <div className="mb-8 flex items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={stepIndex === 0}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition active:scale-95 disabled:opacity-30"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">
                <span>Step {stepIndex + 1} of {STEPS.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full border border-white/10 bg-white/[0.04] p-0.5">
                <motion.div
                  className="h-full rounded-full bg-[var(--accent-main)]"
                  animate={{ width: `${progress}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                />
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.section
              key={currentStep.id}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="flex flex-1 flex-col"
            >
              <div className="mb-8 max-w-2xl">
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.28em] text-[var(--accent-main)]">
                  {currentStep.eyebrow}
                </p>
                <h1 className="max-w-[16ch] text-4xl font-black uppercase italic leading-[0.98] tracking-tighter sm:max-w-[18ch] sm:text-5xl">
                  {currentStep.title}
                </h1>
                <p className="mt-5 max-w-[58ch] text-sm font-semibold uppercase leading-relaxed tracking-wide text-zinc-500">
                  {currentStep.subtitle}
                </p>
              </div>

              {currentStep.options && (
                <div className="grid gap-3 pb-8">
                  {currentStep.options.map((option, index) => {
                    const selected = answers[currentStep.id] === (option.value ?? option.id);
                    return (
                      <motion.button
                        key={option.id}
                        type="button"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        onClick={() => selectOption(option)}
                        className={`group grid min-h-[88px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-[1.75rem] border p-4 text-left transition active:scale-[0.99] ${
                          selected
                            ? 'border-[var(--accent-main)]/50 bg-[var(--accent-main)]/12'
                            : 'border-white/10 bg-white/[0.045] hover:bg-white/[0.07]'
                        }`}
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] border border-white/10 bg-zinc-950 text-[var(--accent-main)]">
                          {option.icon || <CheckCircle2 className="h-5 w-5" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-black uppercase tracking-tight text-white">{option.label}</span>
                          {option.description && (
                            <span className="mt-1 block text-[11px] font-semibold uppercase leading-relaxed tracking-wide text-zinc-500">
                              {option.description}
                            </span>
                          )}
                        </span>
                        <ChevronRight className="h-5 w-5 text-zinc-600 transition group-hover:translate-x-1 group-hover:text-white" />
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {currentStep.renderCustom === 'level-slider' && (
                <div className="flex flex-1 flex-col justify-center gap-10 pb-8">
                  <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
                    <div className="mb-8 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-500">Current level</p>
                        <p className="mt-2 text-7xl font-black italic tracking-tighter text-[var(--accent-main)]">{sliderValue}</p>
                      </div>
                      <p className="mb-3 text-right text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
                        {sliderValue <= 3 ? 'Beginner' : sliderValue <= 7 ? 'Operator' : 'Advanced'}
                      </p>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={sliderValue}
                      onChange={(event) => setSliderValue(Number(event.target.value))}
                      className="w-full accent-[var(--accent-main)]"
                    />
                    <div className="mt-4 flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-600">
                      <span>Level 1</span>
                      <span>Level 10</span>
                    </div>
                  </div>
                  <GlassButton onClick={submitSlider} intensity="strong" className="w-full sm:max-w-sm">
                    Sync response
                  </GlassButton>
                </div>
              )}

              {currentStep.renderCustom === 'plan-summary' && (
                <div className="flex flex-1 flex-col justify-between gap-8 pb-8">
                  <div className="grid gap-3">
                    {planPreview.map((item) => (
                      <div key={item.label} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-main)]/10 text-[var(--accent-main)]">
                          {item.icon}
                        </span>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-600">{item.label}</p>
                          <p className="mt-1 text-sm font-black uppercase tracking-tight text-white">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {error && <p className="text-sm font-bold text-red-300">{error}</p>}
                    <GlassButton onClick={() => completeOnboarding(answers)} intensity="strong" className="w-full">
                      Enter T1GER
                    </GlassButton>
                  </div>
                </div>
              )}
            </motion.section>
          </AnimatePresence>
        </main>

        <aside className="hidden border-l border-white/10 bg-white/[0.025] p-7 md:flex md:flex-col md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-600">Live plan</p>
            <div className="mt-6 space-y-4">
              {planPreview.map((item) => (
                <div key={item.label} className="border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2 text-[var(--accent-main)]">
                    {item.icon}
                    <p className="text-[10px] font-black uppercase tracking-[0.22em]">{item.label}</p>
                  </div>
                  <p className="mt-2 text-sm font-black uppercase tracking-tight text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-zinc-950/70 p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white">Why this matters</p>
            <p className="mt-3 text-xs font-semibold uppercase leading-relaxed tracking-wide text-zinc-500">
              The first missions should be specific enough to complete today. Your answers set the level, proof standard, and time budget.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
