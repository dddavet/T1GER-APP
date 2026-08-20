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
  Clock,
  Crown,
  DollarSign,
  Flame,
  Globe,
  LineChart,
  Lock,
  Mail,
  Play,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  TrendingDown,
  Trophy,
  WalletCards,
  Zap,
} from 'lucide-react';
import { useAuth, type AppUser, type InvestmentProfile } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import type { Language } from '../services/i18n';
import { T1gerMascot3D, type MascotReaction } from './T1gerMascot3D';
import { MISSION_BANK } from '../services/missionBank';
import { fireRewardConfetti } from './ui/confetti';
import { AndroidScreenTimeService } from '../services/androidScreenTimeService';

export type OnboardingStep =
  | 'welcome'
  | 'topic_select'
  | 'course_building'
  | 'acquisition_source'
  | 'knowledge_level'
  | 'encouragement'
  | 'motivation_reason'
  | 'weekly_promise'
  | 'screen_time'
  | 'daily_goal'
  | 'widget_preview'
  | 'achievement_roadmap'
  | 'starting_point'
  | 'micro_lesson'
  | 'success'
  | 'save_progress'
  | 'reminders'
  | 'access';

export type CourseTopic = 'finance' | 'tech' | 'humanities' | 'skills' | 'random';
export type KnowledgeLevel = 'zero' | 'basic' | 'intermediate' | 'competent' | 'advanced';
export type StartingPointChoice = 'scratch' | 'placement';
export type ReminderStatus = 'idle' | 'enabled' | 'denied' | 'unsupported' | 'dismissed';

interface LocalizedText {
  es: string;
  en: string;
}

const localize = (text: LocalizedText, language: Language) => text[language] || text.es;

interface OnboardingDraft {
  version: 2;
  step: OnboardingStep;
  topic: CourseTopic;
  acquisitionSource: string | null;
  knowledgeLevel: KnowledgeLevel;
  motivation: string | null;
  screenTimeHours: number;
  selectedDistractions?: string[];
  dailyGoal: number;
  startingPoint: StartingPointChoice;
  lessonCompleted: boolean;
  reminderStatus: ReminderStatus;
  accessChoice: 'free' | 'super' | null;
}

const DRAFT_KEY = 't1ger_onboarding_draft_v2';
const ONBOARDING_XP = 100;

export const STEP_ORDER: OnboardingStep[] = [
  'welcome',
  'topic_select',
  'course_building',
  'acquisition_source',
  'knowledge_level',
  'encouragement',
  'motivation_reason',
  'weekly_promise',
  'screen_time',
  'daily_goal',
  'widget_preview',
  'achievement_roadmap',
  'starting_point',
  'micro_lesson',
  'success',
  'save_progress',
  'reminders',
  'access',
];

const defaultDraft: OnboardingDraft = {
  version: 2,
  step: 'welcome',
  topic: 'finance',
  acquisitionSource: null,
  knowledgeLevel: 'zero',
  motivation: null,
  screenTimeHours: 3.5,
  dailyGoal: 10,
  startingPoint: 'scratch',
  lessonCompleted: false,
  reminderStatus: 'idle',
  accessChoice: null,
};

// Course Categories
export const COURSE_TOPICS: Array<{
  id: CourseTopic;
  title: LocalizedText;
  subtitle: LocalizedText;
  icon: string;
  badge?: LocalizedText;
}> = [
  {
    id: 'finance',
    title: { es: 'Finanzas & Inversión', en: 'Finance & Investing' },
    subtitle: { es: 'Acciones, interés compuesto, balances y negocios', en: 'Stocks, compounding, balance sheets & business' },
    icon: '💰',
    badge: { es: 'POPULAR', en: 'POPULAR' },
  },
  {
    id: 'tech',
    title: { es: 'Ciencia, IA & Tecnología', en: 'Science, AI & Tech' },
    subtitle: { es: 'Inteligencia artificial, ciberseguridad, física y código', en: 'Artificial intelligence, cybersecurity, physics & code' },
    icon: '🤖',
  },
  {
    id: 'skills',
    title: { es: 'Habilidades Prácticas', en: 'Practical Life Skills' },
    subtitle: { es: 'Ventas, negociación, comunicación y salud de alto rendimiento', en: 'Sales, negotiation, high-impact communication & health' },
    icon: '⚡',
  },
  {
    id: 'humanities',
    title: { es: 'Humanidades & Psicología', en: 'Humanities & Psychology' },
    subtitle: { es: 'Modelos mentales, toma de decisiones, historia y liderazgo', en: 'Mental models, decision making, history & leadership' },
    icon: '🧠',
  },
  {
    id: 'random',
    title: { es: 'Cultura & Curiosidades', en: 'Culture & Discovery' },
    subtitle: { es: 'Dinosaurios, mitología, astronomía y cultura general', en: 'Dinosaurs, mythology, deep astronomy & trivia' },
    icon: '🦖',
  },
];

// Acquisition Sources
const ACQUISITION_SOURCES: Array<{ id: string; title: LocalizedText; icon: string }> = [
  { id: 'friends', title: { es: 'Amigos o Familia', en: 'Friends / Family' }, icon: '🧑‍🤝‍🧑' },
  { id: 'tiktok', title: { es: 'TikTok', en: 'TikTok' }, icon: '🎵' },
  { id: 'instagram', title: { es: 'Instagram / Reels', en: 'Instagram / Reels' }, icon: '📸' },
  { id: 'youtube', title: { es: 'YouTube', en: 'YouTube' }, icon: '▶️' },
  { id: 'x', title: { es: 'X (Twitter)', en: 'X (Twitter)' }, icon: '𝕏' },
  { id: 'google', title: { es: 'Búsqueda en Google', en: 'Google Search' }, icon: '🔍' },
  { id: 'store', title: { es: 'Google Play / App Store', en: 'App Store' }, icon: '📲' },
  { id: 'other', title: { es: 'Otro', en: 'Other' }, icon: '✨' },
];

// Knowledge Levels with Signal Strength Bars
const KNOWLEDGE_LEVELS: Array<{ id: KnowledgeLevel; title: LocalizedText; bars: number }> = [
  { id: 'zero', title: { es: 'Estoy empezando desde cero', en: "I'm new to this topic" }, bars: 1 },
  { id: 'basic', title: { es: 'Conozco algunos conceptos básicos', en: 'I know some common concepts' }, bars: 2 },
  { id: 'intermediate', title: { es: 'Puedo tener conversaciones y debates', en: 'I can have basic discussions' }, bars: 3 },
  { id: 'competent', title: { es: 'Conozco varios temas a fondo', en: 'I can discuss various topics' }, bars: 4 },
  { id: 'advanced', title: { es: 'Dominio avanzado del tema', en: 'I can discuss most topics in detail' }, bars: 5 },
];

// Motivation Reasons
const MOTIVATION_REASONS: Array<{ id: string; title: LocalizedText; icon: string }> = [
  { id: 'career', title: { es: 'Impulsar mi carrera o negocio', en: 'Support my career or business' }, icon: '💼' },
  { id: 'wealth', title: { es: 'Construir patrimonio e invertir mejor', en: 'Build wealth & invest smarter' }, icon: '💰' },
  { id: 'productivity', title: { es: 'Aprovechar mi tiempo productivamente', en: 'Spend time productively' }, icon: '⏳' },
  { id: 'future_tech', title: { es: 'Dominar la inteligencia artificial', en: 'Master AI & modern skills' }, icon: '🚀' },
  { id: 'fun', title: { es: 'Por curiosidad y diversión', en: 'Just for fun & curiosity' }, icon: '🎉' },
  { id: 'other', title: { es: 'Otro motivo', en: 'Other reason' }, icon: '✨' },
];

function loadDraft(): OnboardingDraft {
  if (typeof window === 'undefined') return defaultDraft;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return defaultDraft;
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
    if (parsed.version !== 2 || !parsed.step || !STEP_ORDER.includes(parsed.step)) return defaultDraft;
    return { ...defaultDraft, ...parsed };
  } catch {
    return defaultDraft;
  }
}

function saveDraft(draft: OnboardingDraft) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

// Reusable Top Mascot Speech Bubble Header (Duolingo Style)
const DuolingoHeader: React.FC<{
  speech: string;
  mood?: MascotReaction;
  eyebrow?: string;
  title?: string;
}> = ({ speech, mood = 'idle', eyebrow, title }) => (
  <div className="flex flex-col items-center text-center pt-2 pb-4 select-none">
    {eyebrow && (
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ob-accent)] mb-2">
        {eyebrow}
      </span>
    )}

    {/* Mascot with Speech Bubble */}
    <div className="flex flex-col items-center relative w-full max-w-xs mb-3">
      {/* Speech Bubble with pointer pointing down at mascot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 rounded-2xl border border-white/15 bg-[#121216]/95 backdrop-blur-md px-5 py-3 text-sm font-bold leading-5 text-white shadow-xl max-w-sm mb-2"
      >
        {speech}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-b border-r border-white/15 bg-[#121216]" />
      </motion.div>

      {/* 3D Mascot */}
      <div className="h-32 w-32 relative flex items-center justify-center pointer-events-none">
        <T1gerMascot3D mood={mood} closeUp className="h-32 w-32" />
      </div>
    </div>

    {title && (
      <h2 className="text-xl font-black text-white tracking-tight leading-tight mt-1">
        {title}
      </h2>
    )}
  </div>
);

// 3D Tactile Primary Button (Duolingo Style)
export const PrimaryAction: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }
> = ({ className = '', variant = 'primary', children, ...props }) => {
  const isPrimary = variant === 'primary';
  return (
    <button
      {...props}
      className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black uppercase tracking-wider transition-all active:translate-y-1 active:shadow-none cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
        isPrimary
          ? 'bg-[var(--ob-accent)] text-black shadow-[0_5px_0_#C2410C,0_10px_20px_rgba(255,115,0,0.25)] hover:bg-[#FF8C33]'
          : 'bg-white/[.06] border border-white/10 text-zinc-300 hover:bg-white/[.1] shadow-[0_4px_0_rgba(255,255,255,0.05)]'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const OnboardingFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const {
    appUser,
    updateAppUser,
    googleSignIn,
    appleSignIn,
    emailPasswordSignIn,
    emailPasswordSignUp,
  } = useAuth();
  const { language, setLanguage } = useBrain();
  const isEs = language === 'es';
  const tr = (es: string, en: string) => (isEs ? es : en);

  const [draft, setDraft] = useState<OnboardingDraft>(() => loadDraft());
  const [direction, setDirection] = useState(1);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-up');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [selectedLessonOption, setSelectedLessonOption] = useState<number | null>(null);
  const [lessonChecked, setLessonChecked] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState('');

  // Auto-detect browser/system language on initial mount if not set
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const detected = navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
      if (detected !== language) {
        setLanguage(detected);
      }
    }
  }, []);

  const step = draft.step;
  const currentStepIndex = STEP_ORDER.indexOf(step);
  const progressPercent = Math.max(5, ((currentStepIndex + 1) / STEP_ORDER.length) * 100);

  useEffect(() => {
    saveDraft(draft);
    updateAppUser({
      niche: draft.topic,
      dailyTime: draft.dailyGoal,
      onboardingComplete: false,
    }).catch(() => undefined);
  }, [draft, updateAppUser]);

  useEffect(() => {
    if (step === 'success' && draft.lessonCompleted) {
      fireRewardConfetti();
    }
  }, [draft.lessonCompleted, step]);

  const patchDraft = (patch: Partial<OnboardingDraft>) => {
    setDraft((curr) => ({ ...curr, ...patch }));
  };

  const goTo = (target: OnboardingStep, nextDirection = 1) => {
    setDirection(nextDirection);
    setError('');
    setDraft((curr) => ({ ...curr, step: target }));
  };

  const advance = () => {
    const nextIdx = Math.min(currentStepIndex + 1, STEP_ORDER.length - 1);
    goTo(STEP_ORDER[nextIdx], 1);
  };

  const back = () => {
    const prevIdx = Math.max(currentStepIndex - 1, 0);
    goTo(STEP_ORDER[prevIdx], -1);
  };

  const currentTopicObj = COURSE_TOPICS.find((t) => t.id === draft.topic) || COURSE_TOPICS[0];
  const topicName = localize(currentTopicObj.title, language);

  const requestReminder = async () => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          patchDraft({ reminderStatus: 'enabled' });
        } else {
          patchDraft({ reminderStatus: 'denied' });
        }
      } else {
        // Native Android webview / mobile: enable reminders by default in user preferences
        patchDraft({ reminderStatus: 'enabled' });
      }
    } catch {
      patchDraft({ reminderStatus: 'enabled' });
    }
    advance();
  };

  const finalize = async (choice: 'free' | 'super') => {
    setFinalizing(true);
    patchDraft({ accessChoice: choice });
    try {
      await updateAppUser({
        onboardingComplete: true,
        isSuperT1ger: choice === 'super',
        dailyTime: draft.dailyGoal,
        niche: draft.topic,
      });
      window.localStorage.removeItem(DRAFT_KEY);
      onComplete();
    } catch (e: any) {
      setError(tr('No se pudo finalizar. Intenta nuevamente.', 'Failed to finalize. Please try again.'));
      setFinalizing(false);
    }
  };

  // Render Step Switch
  const renderStepContent = () => {
    switch (step) {
      // Frame 1: Welcome (Duolingo Style centered mascot + speech bubble)
      case 'welcome':
        return (
          <div className="flex min-h-full flex-col justify-between py-6">
            <div className="flex justify-end">
              <button
                onClick={() => setLanguage(isEs ? 'en' : 'es')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[.06] border border-white/10 text-xs font-bold text-zinc-300 cursor-pointer"
              >
                <Globe size={14} />
                <span>{isEs ? 'EN' : 'ES'}</span>
              </button>
            </div>

            <div className="flex flex-col items-center text-center my-auto">
              {/* Speech bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative rounded-2xl border border-white/15 bg-[#121216] px-6 py-3.5 text-base font-black text-white shadow-2xl mb-4"
              >
                {tr('¡Hola! ¡Soy T1GER!', "Hi there! I'm T1GER!")}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-b border-r border-white/15 bg-[#121216]" />
              </motion.div>

              {/* 3D Mascot Centered */}
              <div className="h-56 w-56 relative flex items-center justify-center pointer-events-none my-2">
                <T1gerMascot3D mood="happy" className="h-56 w-56" />
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white mt-4">
                T1GER
              </h1>
              <p className="text-sm font-medium text-zinc-400 mt-1 max-w-xs">
                {tr(
                  'El mejor aprendizaje del mundo convertido en acciones y criterio real.',
                  'World-class education turned into real actions and financial judgment.'
                )}
              </p>
            </div>

            <div className="space-y-3 pt-6">
              <PrimaryAction onClick={advance}>
                {tr('EMPEZAR', 'GET STARTED')} <ChevronRight size={18} />
              </PrimaryAction>
              <button
                onClick={() => goTo('save_progress')}
                className="w-full py-2.5 text-center text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition cursor-pointer"
              >
                {tr('YA TENGO UNA CUENTA', 'I ALREADY HAVE AN ACCOUNT')}
              </button>
            </div>
          </div>
        );

      // Frame 2: Topic Selection ("What would you like to learn?")
      case 'topic_select':
        return (
          <div className="flex min-h-full flex-col py-3">
            <DuolingoHeader
              speech={tr('¿Qué te gustaría aprender hoy?', 'What would you like to learn?')}
              mood="thinking"
              eyebrow={tr('Elige tu tema', 'Choose your path')}
            />

            <div className="space-y-2.5 my-auto">
              {COURSE_TOPICS.map((topic) => {
                const isSelected = draft.topic === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => patchDraft({ topic: topic.id })}
                    className={`flex items-center gap-3.5 w-full p-4 rounded-2xl border text-left transition-all active:scale-[0.985] cursor-pointer ${
                      isSelected
                        ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)]/15 text-white shadow-[0_0_20px_rgba(255,115,0,0.25)] ring-1 ring-[var(--ob-accent)]'
                        : 'border-white/10 bg-white/[.03] text-zinc-300 hover:bg-white/[.06]'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{topic.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-white block">
                          {localize(topic.title, language)}
                        </strong>
                        {topic.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-[var(--ob-accent)] text-black text-[9px] font-black uppercase">
                            {localize(topic.badge, language)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400 block mt-0.5 line-clamp-1">
                        {localize(topic.subtitle, language)}
                      </span>
                    </div>
                    <span
                      className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)] text-black'
                          : 'border-white/20 text-transparent'
                      }`}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4">
              <PrimaryAction onClick={advance}>
                {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
              </PrimaryAction>
            </div>
          </div>
        );

      // Frame 3: Course Building Interstitial
      case 'course_building':
        return (
          <div className="flex min-h-full flex-col justify-between py-8 text-center">
            <div />
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="h-48 w-48 relative flex items-center justify-center pointer-events-none mb-4"
              >
                <T1gerMascot3D mood="celebrate" className="h-48 w-48" />
              </motion.div>

              <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[var(--ob-accent)]">
                {tr('CREANDO TU CURSO...', 'COURSE BUILDING...')}
              </p>
              <h2 className="text-2xl font-black text-white mt-2 max-w-xs">
                {tr(
                  `Prepárate para dominar ${topicName} con la mejor educación del mundo.`,
                  `Get ready to master ${topicName} with world-class frameworks.`
                )}
              </h2>
            </div>

            <PrimaryAction onClick={advance}>
              {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
            </PrimaryAction>
          </div>
        );

      // Frame 4: Acquisition Source ("How did you hear about T1GER?")
      case 'acquisition_source':
        return (
          <div className="flex min-h-full flex-col py-3">
            <DuolingoHeader
              speech={tr('¿Cómo te enteraste de T1GER?', 'How did you hear about T1GER?')}
              mood="happy"
            />

            <div className="space-y-2 my-auto">
              {ACQUISITION_SOURCES.map((src) => {
                const isSelected = draft.acquisitionSource === src.id;
                return (
                  <button
                    key={src.id}
                    onClick={() => patchDraft({ acquisitionSource: src.id })}
                    className={`flex items-center gap-3 w-full p-3.5 rounded-2xl border text-left transition-all active:scale-[0.985] cursor-pointer ${
                      isSelected
                        ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)]/15 text-white shadow-[0_0_15px_rgba(255,115,0,0.2)]'
                        : 'border-white/10 bg-white/[.03] text-zinc-300 hover:bg-white/[.06]'
                    }`}
                  >
                    <span className="text-xl shrink-0">{src.icon}</span>
                    <span className="text-sm font-semibold flex-1">
                      {localize(src.title, language)}
                    </span>
                    {isSelected && <Check size={16} className="text-[var(--ob-accent)]" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-4">
              <PrimaryAction disabled={!draft.acquisitionSource} onClick={advance}>
                {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
              </PrimaryAction>
            </div>
          </div>
        );

      // Frame 5: Knowledge Level ("How much do you know?")
      case 'knowledge_level':
        return (
          <div className="flex min-h-full flex-col py-3">
            <DuolingoHeader
              speech={tr(`¿Cuánto sabes sobre ${topicName}?`, `How much ${topicName} do you know?`)}
              mood="thinking"
            />

            <div className="space-y-2.5 my-auto">
              {KNOWLEDGE_LEVELS.map((lvl) => {
                const isSelected = draft.knowledgeLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => patchDraft({ knowledgeLevel: lvl.id })}
                    className={`flex items-center gap-3.5 w-full p-4 rounded-2xl border text-left transition-all active:scale-[0.985] cursor-pointer ${
                      isSelected
                        ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)]/15 text-white shadow-[0_0_15px_rgba(255,115,0,0.2)]'
                        : 'border-white/10 bg-white/[.03] text-zinc-300 hover:bg-white/[.06]'
                    }`}
                  >
                    {/* Signal strength bars */}
                    <div className="flex items-end gap-1 h-5 shrink-0">
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <div
                          key={bar}
                          className={`w-1 rounded-full ${
                            bar <= lvl.bars
                              ? isSelected
                                ? 'bg-[var(--ob-accent)]'
                                : 'bg-white/80'
                              : 'bg-white/20'
                          }`}
                          style={{ height: `${bar * 20}%` }}
                        />
                      ))}
                    </div>

                    <span className="text-sm font-semibold flex-1">
                      {localize(lvl.title, language)}
                    </span>
                    {isSelected && <Check size={16} className="text-[var(--ob-accent)]" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-4">
              <PrimaryAction onClick={advance}>
                {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
              </PrimaryAction>
            </div>
          </div>
        );

      // Frame 6: Encouragement Interstitial
      case 'encouragement':
        return (
          <div className="flex min-h-full flex-col justify-between py-8 text-center">
            <div />
            <div className="flex flex-col items-center">
              <div className="h-44 w-44 relative flex items-center justify-center pointer-events-none mb-3">
                <T1gerMascot3D mood="happy" className="h-44 w-44" />
              </div>

              <h2 className="text-2xl font-black text-white">
                {draft.knowledgeLevel === 'zero'
                  ? tr('¡Perfecto! Empezaremos desde cero con decisiones prácticas.', "Okay, we'll start fresh with real practice!")
                  : tr('¡Excelente! Adaptaremos el ritmo a tu nivel actual.', "Great! We'll tailor the pace to your current skill.")}
              </h2>
              <p className="text-xs text-zinc-400 mt-2 max-w-xs">
                {tr('Sin teoría aburrida: cada lección es una decisión real.', 'No boring theory: every lesson is an actionable decision.')}
              </p>
            </div>

            <PrimaryAction onClick={advance}>
              {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
            </PrimaryAction>
          </div>
        );

      // Frame 7: Motivation Reason ("Why are you learning?")
      case 'motivation_reason':
        return (
          <div className="flex min-h-full flex-col py-3">
            <DuolingoHeader
              speech={tr(`¿Por qué quieres aprender ${topicName}?`, `Why are you learning ${topicName}?`)}
              mood="happy"
            />

            <div className="space-y-2.5 my-auto">
              {MOTIVATION_REASONS.map((mot) => {
                const isSelected = draft.motivation === mot.id;
                return (
                  <button
                    key={mot.id}
                    onClick={() => patchDraft({ motivation: mot.id })}
                    className={`flex items-center gap-3.5 w-full p-4 rounded-2xl border text-left transition-all active:scale-[0.985] cursor-pointer ${
                      isSelected
                        ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)]/15 text-white shadow-[0_0_15px_rgba(255,115,0,0.2)]'
                        : 'border-white/10 bg-white/[.03] text-zinc-300 hover:bg-white/[.06]'
                    }`}
                  >
                    <span className="text-xl shrink-0">{mot.icon}</span>
                    <span className="text-sm font-semibold flex-1">
                      {localize(mot.title, language)}
                    </span>
                    {isSelected && <Check size={16} className="text-[var(--ob-accent)]" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-4">
              <PrimaryAction disabled={!draft.motivation} onClick={advance}>
                {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
              </PrimaryAction>
            </div>
          </div>
        );

      // Frame 8: Weekly Promise Interstitial
      case 'weekly_promise':
        return (
          <div className="flex min-h-full flex-col justify-between py-8 text-center">
            <div />
            <div className="flex flex-col items-center">
              <div className="h-44 w-44 relative flex items-center justify-center pointer-events-none mb-3">
                <T1gerMascot3D mood="celebrate" className="h-44 w-44" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF7300]/20 border border-[#FF7300]/40 text-[#FF8C33] text-xs font-black uppercase mb-3">
                <Zap size={14} /> {tr('Impacto Rápido', 'Fast Impact')}
              </div>

              <h2 className="text-3xl font-black text-white">
                {tr('¡Eso son más de 20 conceptos y decisiones en tu primera semana!', "That's 20+ concepts & real decisions in your first week!")}
              </h2>
            </div>

            <PrimaryAction onClick={advance}>
              {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
            </PrimaryAction>
          </div>
        );

      // Frame 9: Screen Time Hook & T1GER Health Pact
      case 'screen_time': {
        const hours = draft.screenTimeHours || 1.5;
        const selectedApps = draft.selectedDistractions || ['instagram', 'tiktok'];

        const DISTRACTION_APPS = [
          { id: 'tiktok', name: 'TikTok', icon: '🎵' },
          { id: 'instagram', name: 'Instagram', icon: '📸' },
          { id: 'youtube', name: 'YouTube', icon: '▶️' },
          { id: 'x', name: 'X (Twitter)', icon: '𝕏' },
          { id: 'games', name: 'Juegos', icon: '🎮' },
          { id: 'browse', name: 'Doomscroll', icon: '📱' },
        ];

        const toggleApp = (appId: string) => {
          const current = new Set(selectedApps);
          if (current.has(appId)) current.delete(appId);
          else current.add(appId);
          patchDraft({ selectedDistractions: Array.from(current) });
        };

        return (
          <div className="flex min-h-full flex-col py-3 select-none">
            <DuolingoHeader
              speech={tr(
                'El celular no debe controlar tu vida. Vamos a proteger tu tiempo y la salud de tu T1GER.',
                'Your phone shouldn’t control your life. Let’s protect your time and T1GER’s health.'
              )}
              mood="thinking"
              eyebrow={tr('Pacto de Enfoque & Salud', 'Focus & Health Pact')}
              title={tr('¿En qué apps pierdes más el tiempo?', 'Where do you lose the most time?')}
            />

            {/* App Pickers */}
            <div className="grid grid-cols-3 gap-2 mb-3.5">
              {DISTRACTION_APPS.map((app) => {
                const isSel = selectedApps.includes(app.id);
                return (
                  <button
                    key={app.id}
                    onClick={() => toggleApp(app.id)}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                      isSel
                        ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)]/20 text-white font-bold'
                        : 'border-white/10 bg-white/[.03] text-zinc-400'
                    }`}
                  >
                    <span>{app.icon}</span>
                    <span className="text-xs">{app.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Target Daily Limit Selector */}
            <p className="text-xs font-bold text-zinc-300 mb-2">
              {tr('Tu límite máximo diario en estas apps:', 'Your max daily target limit on these apps:')}
            </p>
            <div className="grid grid-cols-4 gap-1.5 mb-3.5">
              {[0.75, 1.0, 1.5, 2.0].map((h) => (
                <button
                  key={h}
                  onClick={() => {
                    patchDraft({ screenTimeHours: h });
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('t1ger_screen_time_hours', h.toString());
                    }
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2 transition active:scale-95 cursor-pointer ${
                    hours === h
                      ? 'border-cyan-500 bg-cyan-950/40 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'border-white/10 bg-white/[.03] text-zinc-400'
                  }`}
                >
                  <span className="text-sm font-black">{h === 0.75 ? '45m' : `${h}h`}</span>
                  <span className="text-[9px]">{tr('máximo', 'max')}</span>
                </button>
              ))}
            </div>

            {/* Health Mechanics Alert Card */}
            <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-500/10 to-transparent p-3.5 space-y-2 shadow-lg mb-2">
              <div className="flex items-center gap-2">
                <span className="text-rose-400 text-base">❤️</span>
                <span className="font-mono text-xs font-bold text-rose-300">
                  {tr('Impacto en la Vida de T1GER', 'Impact on T1GER Health')}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                {tr(
                  `Si usas tus redes más de ${hours === 0.75 ? '45 min' : `${hours} horas`} al día, T1GER perderá Vida (❤️). ¡Mantenlo sano aprendiendo y respetando tu límite!`,
                  `If you scroll more than ${hours === 0.75 ? '45 min' : `${hours} hours`} daily, T1GER loses Health (❤️). Keep him alive by staying under budget!`
                )}
              </p>
            </div>

            <div className="pt-2">
              <PrimaryAction onClick={advance}>
                {tr('PROTEGER MI TIEMPO & T1GER', 'PROTECT MY TIME & T1GER')} <ArrowRight size={18} />
              </PrimaryAction>
            </div>
          </div>
        );
      }

      // Frame 10: Daily Commitment ("How much time can you commit?")
      case 'daily_goal':
        return (
          <div className="flex min-h-full flex-col py-3">
            <DuolingoHeader
              speech={tr('¿Cuánto tiempo puedes proteger cada día?', 'How much time can you protect each day?')}
              mood="happy"
              eyebrow={tr('Ritmo Diario', 'Daily Rhythm')}
            />

            <div className="grid grid-cols-2 gap-3 my-auto">
              {[5, 10, 15, 20].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => patchDraft({ dailyGoal: minutes })}
                  className={`min-h-28 rounded-2xl border p-4 text-left transition-all active:scale-95 cursor-pointer ${
                    draft.dailyGoal === minutes
                      ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)]/15 shadow-[0_0_15px_rgba(255,115,0,0.25)]'
                      : 'border-white/10 bg-white/[.03]'
                  }`}
                >
                  {minutes === 10 && (
                    <span className="mb-2 inline-flex rounded-full bg-[var(--ob-accent)] px-2 py-0.5 text-[9px] font-black uppercase text-black">
                      {tr('Recomendado', 'Recommended')}
                    </span>
                  )}
                  <strong className="block text-2xl font-black text-white">{minutes}</strong>
                  <span className="text-xs text-zinc-400">{tr('min al día', 'min/day')}</span>
                </button>
              ))}
            </div>

            <div className="pt-4">
              <PrimaryAction onClick={advance}>
                {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
              </PrimaryAction>
            </div>
          </div>
        );

      // Frame 11: Home Screen Widget Preview
      case 'widget_preview':
        return (
          <div className="flex min-h-full flex-col justify-between py-4 text-center">
            <DuolingoHeader
              speech={tr('¡Te animaré todos los días desde tu pantalla de inicio!', "I'll cheer you on from your home screen!")}
              mood="happy"
            />

            {/* Android Phone Widget Graphic */}
            <div className="my-auto flex flex-col items-center">
              <div className="w-56 h-36 rounded-3xl bg-zinc-900 border-2 border-zinc-700 p-3 shadow-2xl flex flex-col justify-between text-left relative overflow-hidden ring-1 ring-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🐅</span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#FF7300]">T1GER</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                    <Flame size={12} className="text-[#FF7300] fill-[#FF7300]" /> 1
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF7300]/20 flex items-center justify-center text-xl">
                    🔥
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-white block leading-tight">
                      {tr('¡Protege tu racha!', 'Protect your streak!')}
                    </strong>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      {tr('5 min restantes hoy', '5 min left today')}
                    </span>
                  </div>
                </div>

                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-2/3 rounded-full bg-[var(--ob-accent)]" />
                </div>
              </div>
            </div>

            <PrimaryAction onClick={advance}>
              {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
            </PrimaryAction>
          </div>
        );

      // Frame 12: 3-Month Achievement Roadmap
      case 'achievement_roadmap':
        return (
          <div className="flex min-h-full flex-col py-3">
            <DuolingoHeader
              speech={tr('¡Esto es lo que lograrás en 3 meses!', "Here's what you can achieve in 3 months!")}
              mood="celebrate"
            />

            <div className="space-y-3 my-auto">
              {[
                {
                  icon: '💬',
                  title: tr('Decisiones con confianza', 'Decide with confidence'),
                  desc: tr('Criterio técnico y financiero sin estrés ni dudas', 'Stress-free financial & technical judgment'),
                },
                {
                  icon: '📈',
                  title: tr('Construir proyectos y portafolio', 'Build your real portfolio'),
                  desc: tr('Pasos prácticos aplicados a la vida real', 'Hands-on steps and verifiable evidence'),
                },
                {
                  icon: '⏰',
                  title: tr('Hábito diario de alto rendimiento', 'High-performance daily habit'),
                  desc: tr('Recordatorios inteligentes y rachas protegidas', 'Smart reminders and streak protection'),
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 p-4 rounded-2xl border border-white/10 bg-white/[.03] text-left"
                >
                  <span className="text-2xl shrink-0 mt-0.5">{card.icon}</span>
                  <div>
                    <strong className="text-sm font-bold text-white block">{card.title}</strong>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <PrimaryAction onClick={advance}>
                {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
              </PrimaryAction>
            </div>
          </div>
        );

      // Frame 13: Starting Point Choice ("Now let's find the best place to start!")
      case 'starting_point':
        return (
          <div className="flex min-h-full flex-col py-3">
            <DuolingoHeader
              speech={tr('¡Ahora encontremos el mejor lugar para comenzar!', "Now let's find the best place to start!")}
              mood="idle"
            />

            <div className="space-y-3 my-auto">
              <button
                onClick={() => {
                  patchDraft({ startingPoint: 'scratch' });
                  advance();
                }}
                className="w-full p-5 rounded-2xl border border-[#3FC78E]/40 bg-[#3FC78E]/10 text-left transition-all active:scale-[0.985] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-[#3FC78E] text-black text-[9px] font-black uppercase">
                    {tr('RECOMENDADO', 'RECOMMENDED')}
                  </span>
                  <CheckCircle2 className="text-[#3FC78E]" size={20} />
                </div>
                <strong className="text-base font-bold text-white block mt-2">
                  {tr(`¿Aprendiendo ${topicName} por primera vez?`, `Learning ${topicName} for the first time?`)}
                </strong>
                <p className="text-xs text-zinc-300 mt-1">
                  {tr('Empieza desde las bases con micro-lecciones interactivas.', 'Start from scratch with interactive lessons.')}
                </p>
              </button>

              <button
                onClick={() => {
                  patchDraft({ startingPoint: 'placement' });
                  advance();
                }}
                className="w-full p-5 rounded-2xl border border-white/10 bg-white/[.03] text-left transition-all active:scale-[0.985] cursor-pointer hover:bg-white/[.06]"
              >
                <strong className="text-base font-bold text-white block">
                  {tr(`¿Ya conoces las bases de ${topicName}?`, `Already know some ${topicName}?`)}
                </strong>
                <p className="text-xs text-zinc-400 mt-1">
                  {tr('Haremos un test rápido para ubicar tu nivel.', "Let's find your starting point with a quick check!")}
                </p>
              </button>
            </div>

            <div className="pt-4">
              <PrimaryAction onClick={advance}>
                {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
              </PrimaryAction>
            </div>
          </div>
        );

      // Frame 14: Hands-on Micro-Lesson
      case 'micro_lesson': {
        const questionPrompt = tr(
          '¿Cuál es la diferencia fundamental entre un Activo y un Pasivo?',
          'What is the fundamental difference between an Asset and a Liability?'
        );
        const options = [
          {
            id: 0,
            text: tr(
              'Un Activo pone dinero en tu bolsillo; un Pasivo saca dinero de tu bolsillo.',
              'An Asset puts money into your pocket; a Liability takes money out of your pocket.'
            ),
            correct: true,
          },
          {
            id: 1,
            text: tr(
              'Un Pasivo es un préstamo que siempre genera ganancias garantizadas.',
              'A Liability is a loan that always produces guaranteed profits.'
            ),
            correct: false,
          },
          {
            id: 2,
            text: tr(
              'Son exactamente lo mismo en contabilidad e inversiones.',
              'They are the exact same thing in accounting and investing.'
            ),
            correct: false,
          },
        ];

        const isCorrect = selectedLessonOption === 0;

        return (
          <div className="flex min-h-full flex-col py-3">
            <DuolingoHeader
              speech={
                lessonChecked
                  ? isCorrect
                    ? tr('¡Extraordinario! Los activos generan flujo positivo.', 'Awesome! Assets generate positive cash flow.')
                    : tr('Cuidado: recuerda la regla de flujos de efectivo.', 'Careful: remember the cash flow rule.')
                  : tr('Demuestra tu criterio para ganar tus primeros +100 XP.', 'Prove your judgement to earn your first +100 XP.')
              }
              mood={lessonChecked ? (isCorrect ? 'celebrate' : 'warning') : 'idle'}
              eyebrow={tr('Micro-Lección Práctica', 'Hands-on Micro-Lesson')}
              title={tr('Tu Primera Decisión', 'Your First Decision')}
            />

            <p className="text-sm font-semibold text-zinc-300 text-center mb-3">
              {questionPrompt}
            </p>

            <div className="space-y-2.5 my-auto">
              {options.map((opt) => {
                const isSelected = selectedLessonOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (!lessonChecked) setSelectedLessonOption(opt.id);
                    }}
                    className={`flex items-center gap-3.5 w-full p-4 rounded-2xl border text-left transition-all active:scale-[0.985] cursor-pointer ${
                      lessonChecked
                        ? opt.correct
                          ? 'border-[#3FC78E] bg-[#3FC78E]/15 text-white shadow-[0_0_15px_rgba(63,199,142,0.25)]'
                          : isSelected
                          ? 'border-[#E56A65] bg-[#E56A65]/15 text-white'
                          : 'border-white/5 bg-white/[.02] text-zinc-500 opacity-40'
                        : isSelected
                        ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)]/15 text-white shadow-[0_0_15px_rgba(255,115,0,0.2)]'
                        : 'border-white/10 bg-white/[.03] text-zinc-300 hover:bg-white/[.06]'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold text-xs ${
                        isSelected ? 'bg-[var(--ob-accent)] text-black' : 'bg-white/10 text-zinc-400'
                      }`}
                    >
                      {String.fromCharCode(65 + opt.id)}
                    </span>
                    <span className="text-sm font-semibold leading-snug flex-1">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {lessonChecked && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`my-3 rounded-2xl p-3.5 border text-xs leading-relaxed ${
                  isCorrect
                    ? 'border-[#3FC78E]/40 bg-[#3FC78E]/10 text-[#C5E8DE]'
                    : 'border-[#E56A65]/40 bg-[#E56A65]/10 text-[#FADBD8]'
                }`}
              >
                <strong className="block text-sm font-bold text-white mb-0.5">
                  {isCorrect ? tr('¡Correcto! +100 XP desbloqueados', 'Correct! +100 XP unlocked') : tr('Respuesta correcta:', 'Correct answer:')}
                </strong>
                {tr(
                  'Un activo pone dinero en tu bolsillo. Un pasivo resta liquidez.',
                  'An asset produces cash flow. A liability drains your liquidity.'
                )}
              </motion.div>
            )}

            <div className="pt-3">
              {!lessonChecked ? (
                <PrimaryAction
                  disabled={selectedLessonOption === null}
                  onClick={() => setLessonChecked(true)}
                >
                  {tr('COMPROBAR', 'CHECK')} <Check size={18} />
                </PrimaryAction>
              ) : (
                <PrimaryAction
                  onClick={() => {
                    patchDraft({ lessonCompleted: true, step: 'success' });
                    setDirection(1);
                  }}
                >
                  {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
                </PrimaryAction>
              )}
            </div>
          </div>
        );
      }

      // Frame 15: Success (+100 XP Celebration)
      case 'success':
        return (
          <div className="flex min-h-full flex-col justify-between py-6 text-center">
            <div />
            <div className="flex flex-col items-center">
              <div className="h-44 w-44 relative flex items-center justify-center pointer-events-none mb-2">
                <T1gerMascot3D mood="celebrate" className="h-44 w-44" />
              </div>

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ob-accent)] text-black mb-3">
                <Trophy size={28} />
              </div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--ob-accent)]">
                {tr('PROGRESO DESBLOQUEADO', 'PROGRESS UNLOCKED')}
              </p>
              <h1 className="mt-1 text-4xl font-black text-white">+{ONBOARDING_XP} XP</h1>
              <p className="mx-auto mt-2 max-w-xs text-xs text-zinc-400">
                {tr('Completaste tu primera victoria. Guarda tu perfil para asegurar tu racha.', 'First win done! Create your profile to protect your streak.')}
              </p>
            </div>

            <PrimaryAction onClick={advance}>
              {tr('GUARDAR PROGRESO', 'SAVE PROGRESS')} <Lock size={18} />
            </PrimaryAction>
          </div>
        );

      // Frame 16: Profile Creation (Duolingo 1-Tap Google Sign-In)
      case 'save_progress': {
        const handleGoogle = async () => {
          setAuthError('');
          setAuthLoading(true);
          try {
            // CRITICAL: Save all local state BEFORE redirecting
            // so we don't lose the user's answers when the page reloads on mobile
            await updateAppUser({
              niche: draft.topic || 'investing',
              goal: draft.motivation || 'wealth',
              experienceLevel: Number(draft.knowledgeLevel) || 1,
              learningStyle: 'interactive',
              dailyTime: 15,
              onboardingComplete: false, // Wait until auth confirms
            });

            await googleSignIn();
            
            // If using popup, we reach here. If redirect, page unloads.
            goTo('reminders');
          } catch (err: any) {
            console.error('Google Auth Error:', err);
            setAuthError(err.message || tr('Error al conectar con Google.', 'Failed to connect with Google.'));
          } finally {
            setAuthLoading(false);
          }
        };

        const handleApple = async () => {
          setAuthError('');
          setAuthLoading(true);
          try {
            await appleSignIn();
            goTo('reminders');
          } catch (err: any) {
            console.error('Apple Auth Error:', err);
            setAuthError(err.message || tr('Error al conectar con Apple.', 'Failed to connect with Apple.'));
          } finally {
            setAuthLoading(false);
          }
        };

        const handleEmailSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!authEmail.trim() || !authPassword.trim()) {
            setAuthError(tr('Ingresa tu correo y contraseña.', 'Please enter email and password.'));
            return;
          }
          if (authPassword.length < 6) {
            setAuthError(tr('La contraseña debe tener al menos 6 caracteres.', 'Password must be at least 6 characters.'));
            return;
          }

          setAuthError('');
          setAuthLoading(true);
          try {
            if (authMode === 'sign-up') {
              await emailPasswordSignUp(authEmail, authPassword);
            } else {
              await emailPasswordSignIn(authEmail, authPassword);
            }
            goTo('reminders');
          } catch (err: any) {
            console.error('Email auth error:', err);
            setAuthError(tr('Verifica tus datos o continúa con Google.', 'Verify credentials or continue with Google.'));
          } finally {
            setAuthLoading(false);
          }
        };

        return (
          <div className="flex min-h-full flex-col py-3">
            <DuolingoHeader
              speech={tr(
                '¡Crea tu perfil para guardar tus +100 XP y proteger tu racha!',
                'Create your profile to save your +100 XP and protect your streak!'
              )}
              mood="celebrate"
              eyebrow={tr('Guarda tu Progreso', 'Save Your Progress')}
              title={tr('Crea tu Perfil', 'Create Your Profile')}
            />

            <div className="space-y-3 my-auto">
              {/* Google 1-Tap Button */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={authLoading}
                className="flex items-center justify-center gap-3 w-full min-h-14 rounded-2xl bg-white text-zinc-900 font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#D4D4D8] hover:bg-zinc-100 active:translate-y-1 active:shadow-none transition cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {authLoading ? tr('Conectando…', 'Connecting…') : tr('Continuar con Google', 'Sign in with Google')}
              </button>

              {/* Apple Button */}
              <button
                type="button"
                onClick={handleApple}
                disabled={authLoading}
                className="flex items-center justify-center gap-3 w-full min-h-14 rounded-2xl bg-black border border-white/20 text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#27272A] hover:bg-zinc-900 active:translate-y-1 active:shadow-none transition cursor-pointer"
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98 1.4-2.05 2.72-3.68 2.72-1.63 0-2.12-.96-3.95-.96-1.83 0-2.37.96-3.95.96-1.63 0-2.8-1.46-3.95-3.36-1.15-1.9-2.05-5.38-2.05-8.38 0-4.32 2.8-6.62 5.58-6.62 1.63 0 3.03 1.1 4.05 1.1 1.03 0 2.75-1.1 4.58-1.1 1.1 0 3.95.13 5.8 2.88-0.15.1-2.55 1.46-2.55 4.53 0 3.55 3.05 4.88 3.2 4.96-0.03.06-0.5 1.78-1.7 3.58zM12.55 4.5c0-2.1 1.5-4.1 3.75-4.35-0.2 0.9-0.7 2.1-2.05 3.65-1.35 1.55-2.9 2.3-4.45 2.15 0.15-0.9 0.7-2.1 2.05-3.65z"/>
                </svg>
                {tr('Continuar con Apple', 'Sign in with Apple')}
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  {tr('O con tu correo', 'Or with email')}
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-2">
                <input
                  type="email"
                  placeholder={tr('Correo electrónico', 'Email')}
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full h-12 rounded-xl bg-white/[.05] border border-white/10 px-4 text-sm text-white placeholder-zinc-500 focus:border-[var(--ob-accent)] outline-none"
                />
                <input
                  type="password"
                  placeholder={tr('Contraseña (mínimo 6 caracteres)', 'Password (min 6 chars)')}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full h-12 rounded-xl bg-white/[.05] border border-white/10 px-4 text-sm text-white placeholder-zinc-500 focus:border-[var(--ob-accent)] outline-none"
                />
                <PrimaryAction type="submit" disabled={authLoading}>
                  {authMode === 'sign-up' ? tr('CREAR CUENTA', 'CREATE ACCOUNT') : tr('INICIAR SESIÓN', 'SIGN IN')}
                </PrimaryAction>
              </form>

              {authError && (
                <p className="text-xs text-[#E56A65] text-center font-semibold mt-1">
                  {authError}
                </p>
              )}
            </div>

            <div className="pt-3 text-center">
              <button
                type="button"
                onClick={() => goTo('reminders')}
                className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition py-2 cursor-pointer"
              >
                {tr('GUARDAR MÁS TARDE (INVITADO)', 'SAVE LATER (GUEST)')}
              </button>
            </div>
          </div>
        );
      }

      // Frame 17: Notification Reminders
      case 'reminders':
        return (
          <div className="flex min-h-full flex-col justify-between py-4">
            <DuolingoHeader
              speech={tr(
                'Un recordatorio diario protege tu racha antes de que el scroll te robe el día.',
                'A daily reminder protects your streak before scrolling takes over your day.'
              )}
              mood="idle"
              eyebrow={tr('Recordatorios', 'Reminders')}
              title={tr('Haz espacio para tu racha diaria', 'Make room for your daily streak')}
            />

            <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5 my-auto text-left">
              <div className="flex items-start gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-[var(--ob-accent)]/20 text-[var(--ob-accent)] flex items-center justify-center shrink-0">
                  <Bell size={24} />
                </div>
                <div>
                  <strong className="text-sm text-white block">
                    {tr('Alarma de Racha a las 10:00 PM', '10:00 PM Streak Alarm')}
                  </strong>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {tr('Solo te avisaremos si no has completado tu micro-lección del día.', 'We only remind you if your daily lesson is still pending.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-4">
              <PrimaryAction onClick={requestReminder}>
                {tr('ACTIVAR RECORDATORIOS', 'ENABLE REMINDERS')} <Bell size={18} />
              </PrimaryAction>
              <button
                onClick={advance}
                className="w-full py-2.5 text-center text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition cursor-pointer"
              >
                {tr('AHORA NO', 'NOT NOW')}
              </button>
            </div>
          </div>
        );

      // Frame 18: 100% Free Learning Commitment (Duolingo-style)
      case 'access':
        return (
          <div className="flex min-h-full flex-col justify-between py-4">
            <DuolingoHeader
              speech={tr('¡Todo listo! Tu educación práctica es 100% gratis.', "You're all set! Your practical learning is 100% free.")}
              mood="celebrate"
              eyebrow={tr('Tu Compromiso', 'Your Commitment')}
              title={tr('Aprende Gratis para Siempre', 'Learn Free Forever')}
            />

            <div className="space-y-4 my-auto">
              <div className="rounded-3xl border border-[#3FC78E]/40 bg-[#3FC78E]/10 p-6 text-left space-y-3 shadow-[0_0_30px_rgba(63,199,142,0.15)]">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#3FC78E] text-black font-black text-xs uppercase tracking-wider">
                    {tr('100% GRATIS', '100% FREE')}
                  </span>
                  <CheckCircle2 className="text-[#3FC78E]" size={24} />
                </div>
                <strong className="text-xl text-white font-black block">
                  {tr('Plan Personalizado Activado', 'Personalized Plan Activated')}
                </strong>
                <p className="text-xs text-[#BCEAD5] leading-relaxed">
                  {tr(
                    'Micro-lecciones diarias de 5 minutos, práctica con decisiones reales, rachas continuas y mentoría con IA sin suscripciones.',
                    '5-minute daily micro-lessons, real decision practice, habit streaks, and AI coaching with zero subscriptions.'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[.03] border border-white/8 text-left">
                <span className="text-2xl">🔥</span>
                <div>
                  <strong className="text-xs text-white font-bold block">
                    {tr('Meta: 1 Lección Diaria', 'Goal: 1 Daily Lesson')}
                  </strong>
                  <span className="text-[11px] text-zinc-400">
                    {tr('Construye tu hábito financiero día a día.', 'Build your wealth habit day by day.')}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs text-[#E56A65] text-center font-semibold mb-2">
                {error}
              </p>
            )}

            <div className="pt-2">
              <PrimaryAction onClick={() => finalize('free')} disabled={finalizing}>
                {tr('ENTRAR A T1GER', 'ENTER T1GER')} <ChevronRight size={18} />
              </PrimaryAction>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const showTopProgress = step !== 'welcome';
  const showBackBtn = currentStepIndex > 0;

  return (
    <div className="t1ger-onboarding fixed inset-0 z-[300] bg-[#09090B]">
      <main className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden sm:border-x sm:border-white/10 bg-[#09090B] text-white">
        {/* Top Progress Bar & Back Arrow */}
        {showTopProgress && (
          <header className="flex shrink-0 items-center gap-3 px-5 pb-2 pt-[calc(0.75rem+env(safe-area-inset-top))]">
            {showBackBtn ? (
              <button
                onClick={back}
                aria-label={isEs ? 'Volver' : 'Back'}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[.04] text-zinc-300 active:scale-95 cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
            ) : (
              <div className="h-10 w-10 shrink-0" />
            )}

            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#FF7300] to-[#FF8C33]"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <span className="w-10 text-right font-mono text-[11px] font-bold text-zinc-400">
              {currentStepIndex + 1}/{STEP_ORDER.length}
            </span>
          </header>
        )}

        {/* Animated Step View Container */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.section
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction >= 0 ? 25 : -25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction >= 0 ? -20 : 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
          >
            {renderStepContent()}
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );
};
