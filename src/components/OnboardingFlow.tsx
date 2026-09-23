import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
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
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  RefreshCw,
  Target,
  TrendingDown,
  Trophy,
  WalletCards,
  Zap,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useAuth, type InvestmentProfile } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import type { Language } from '../services/i18n';
import { T1gerMascot3D, type MascotReaction } from './T1gerMascot3D';
import { MISSION_BANK } from '../services/missionBank';
import { fireRewardConfetti } from './ui/confetti';
import { AndroidScreenTimeService } from '../services/androidScreenTimeService';
import { OneSignalService } from '../services/oneSignalService';
import { ProofVerificationService } from '../services/proofVerificationService';
import { revenueCat, CHECKOUT_ENABLED } from '../services/revenueCatService';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';
import {
  DEFAULT_ONBOARDING_TOPIC,
  getOnboardingExperienceLevel,
  getOnboardingTrack,
  type OnboardingCourseTopic,
  type OnboardingKnowledgeLevel,
} from '../services/onboardingProfile';

const OnboardingMascot: React.FC<{
  mood: MascotReaction;
  className: string;
  closeUp?: boolean;
}> = ({ mood, className, closeUp }) => (
  <T1gerMascot3D mood={mood} closeUp={closeUp} className={className} />
);

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

export type CourseTopic = OnboardingCourseTopic;
export type KnowledgeLevel = OnboardingKnowledgeLevel;
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

const STEP_ORDER: OnboardingStep[] = [
  'welcome',
  'topic_select',
  'knowledge_level',
  'daily_goal',
  'micro_lesson',
  'success',
  'save_progress',
  'reminders',
  'access',
];

const defaultDraft: OnboardingDraft = {
  version: 2,
  step: 'welcome',
  topic: DEFAULT_ONBOARDING_TOPIC,
  acquisitionSource: null,
  knowledgeLevel: 'zero',
  motivation: null,
  screenTimeHours: 1.5,
  dailyGoal: 10,
  startingPoint: 'scratch',
  lessonCompleted: false,
  reminderStatus: 'idle',
  accessChoice: null,
};

// Course Categories (Canonical Kinnu Domains)
const COURSE_TOPICS: Array<{
  id: CourseTopic;
  title: LocalizedText;
  subtitle: LocalizedText;
  icon: string;
  badge?: LocalizedText;
}> = [
  {
    id: 'investing',
    title: { es: 'Inversión & Mercados', en: 'Investing & Markets' },
    subtitle: { es: 'Fundamentos, fondos indexados y gestión de riesgo', en: 'Foundations, index funds & risk management' },
    icon: '💰',
    badge: { es: 'RUTA PRINCIPAL', en: 'FLAGSHIP' },
  },
  {
    id: 'technology',
    title: { es: 'Technology', en: 'Technology' },
    subtitle: { es: 'IA, Data Science, Ciberseguridad & Computación', en: 'AI, Data Science, Cybersecurity & Computing' },
    icon: '🤖',
    badge: { es: 'PRIORIDAD', en: 'PRIORITY' },
  },
  {
    id: 'mindset',
    title: { es: 'Psicología & Conducta', en: 'Psychology & Behavior' },
    subtitle: { es: 'Sesgos cognitivos, aprendizaje y toma de decisiones', en: 'Cognitive biases, learning & decision-making' },
    icon: '🧠',
    badge: { es: 'PRIORIDAD', en: 'PRIORITY' },
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

const triggerHaptic = (duration = 10) => {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  } catch {
    // Safe fallback for browsers/platforms without vibration
  }
};

// Dynamic contextual mascot responses (Active Personalization & Commitment Bias)
const TOPIC_FEEDBACK: Record<CourseTopic, LocalizedText> = {
  technology: {
    es: 'Entiende cómo funciona la IA moderna y aprende a usarla con criterio.',
    en: 'Understand how modern AI works and learn to use it with sound judgment.',
  },
  tech: {
    es: 'Entiende cómo funciona la IA moderna y aprende a usarla con criterio.',
    en: 'Understand how modern AI works and learn to use it with sound judgment.',
  },
  business: {
    es: 'Aprende cómo se crean, prueban y mejoran productos útiles.',
    en: 'Learn how useful products are shaped, tested, and improved.',
  },
  skills: {
    es: 'Aprende cómo se crean, prueban y mejoran productos útiles.',
    en: 'Learn how useful products are shaped, tested, and improved.',
  },
  investing: {
    es: 'Construye criterio financiero sólido con lecciones prácticas basadas en evidencia.',
    en: 'Build sound financial judgment with practical, evidence-based lessons.',
  },
  finance: {
    es: 'Construye criterio financiero sólido con lecciones prácticas basadas en evidencia.',
    en: 'Build sound financial judgment with practical, evidence-based lessons.',
  },
  mindset: {
    es: 'Descubre cómo la atención, los sesgos y las emociones influyen en tus decisiones.',
    en: 'Discover how attention, bias, and emotion shape your decisions.',
  },
  productivity: {
    es: 'Aprende a proteger tu atención y convertirla en progreso sostenible.',
    en: 'Learn to protect your attention and turn it into sustainable progress.',
  },
  history: {
    es: 'Usa decisiones del pasado para comprender mejor el presente.',
    en: 'Use decisions from the past to understand the present more clearly.',
  },
};

const KNOWLEDGE_FEEDBACK: Record<KnowledgeLevel, LocalizedText> = {
  zero: {
    es: 'Empezaremos con fundamentos claros y una decisión práctica desde el primer día.',
    en: 'We will start with clear foundations and one practical decision from day one.',
  },
  basic: {
    es: '¡Buen punto de partida! Nos saltaremos lo obvio e iremos directo a lo que funciona.',
    en: 'Great starting point! We’ll skip the obvious and focus on what works.',
  },
  intermediate: {
    es: 'Conectaremos lo que ya sabes con decisiones y aplicaciones más exigentes.',
    en: 'We will connect what you know to more demanding decisions and applications.',
  },
  competent: {
    es: 'Te propondremos escenarios complejos y repasos adaptados a tu nivel.',
    en: 'You will get complex scenarios and reviews calibrated to your level.',
  },
  advanced: {
    es: 'Iremos directo a matices, casos límite y retención a largo plazo.',
    en: 'We will focus on nuance, edge cases, and long-term retention.',
  },
};

const MOTIVATION_FEEDBACK: Record<string, LocalizedText> = {
  career: {
    es: 'Convertiremos conocimiento útil en decisiones que puedas usar en tu trabajo.',
    en: 'We will turn useful knowledge into decisions you can use at work.',
  },
  wealth: {
    es: 'Construiremos fundamentos para tomar decisiones financieras más informadas.',
    en: 'We will build the foundations for more informed financial decisions.',
  },
  productivity: {
    es: 'Diseñaremos una rutina breve que proteja tu atención sin saturarte.',
    en: 'We will design a short routine that protects your attention without overload.',
  },
  future_tech: {
    es: 'Aprenderás qué puede hacer la IA, dónde falla y cómo aplicarla con criterio.',
    en: 'You will learn what AI can do, where it fails, and how to apply it thoughtfully.',
  },
  fun: {
    es: 'Explorarás ideas útiles mediante desafíos breves y experiencias interactivas.',
    en: 'You will explore useful ideas through short challenges and interactive experiences.',
  },
  other: {
    es: 'Personalizaremos el camino y siempre dejaremos claro qué hacer después.',
    en: 'We will personalize the path and always make the next step clear.',
  },
};

const GOAL_FEEDBACK: Record<number, LocalizedText> = {
  5: {
    es: 'Un ritmo breve y sostenible para aprender algo útil cada día.',
    en: 'A short, sustainable pace for learning something useful every day.',
  },
  10: {
    es: 'Tiempo suficiente para aprender, practicar y volver mañana.',
    en: 'Enough time to learn, practice, and return tomorrow.',
  },
  15: {
    es: 'Un ritmo enfocado con espacio para profundizar y aplicar.',
    en: 'A focused pace with room to go deeper and apply what you learn.',
  },
  20: {
    es: 'Una sesión más larga para quienes quieren explorar y repasar más.',
    en: 'A longer session for learners who want more exploration and review.',
  },
};

function loadDraft(): OnboardingDraft {
  if (typeof window === 'undefined') return defaultDraft;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return defaultDraft;
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
    if (parsed.version !== 2 || !parsed.step || !STEP_ORDER.includes(parsed.step)) return defaultDraft;
    const migrated = { ...defaultDraft, ...parsed };
    if (![0.75, 1, 1.5, 2].includes(migrated.screenTimeHours)) migrated.screenTimeHours = 1.5;
    return migrated;
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
        key={speech}
        initial={{ opacity: 0, scale: 0.92, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 450, damping: 26 }}
        className="relative z-10 rounded-2xl border border-white/15 bg-[#121216]/95 backdrop-blur-md px-5 py-3 text-sm font-bold leading-5 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] max-w-sm mb-2 text-center"
      >
        {speech}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-b border-r border-white/15 bg-[#121216]" />
      </motion.div>

      {/* 3D Mascot */}
      <div className="h-28 w-28 sm:h-32 sm:w-32 relative flex items-center justify-center pointer-events-none">
        <OnboardingMascot mood={mood} closeUp className="h-28 w-28 sm:h-32 sm:w-32" />
      </div>
    </div>

    {title && (
      <h2 className="text-xl font-black text-white tracking-tight leading-tight mt-1">
        {title}
      </h2>
    )}
  </div>
);

// Labor Illusion Synthesis Screen (Buell & Norton, HBS Framework)
const CourseBuildingView: React.FC<{
  topicName: string;
  dailyGoal: number;
  language: Language;
  onDone: () => void;
}> = ({ topicName, dailyGoal, language, onDone }) => {
  const [percent, setPercent] = useState(14);
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);
  const isEs = language === 'es';
  const tr = (es: string, en: string) => (isEs ? es : en);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2400;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round(14 + (elapsed / duration) * 86));
      setPercent(progress);

      if (progress >= 38 && progress < 72) {
        setPhase(2);
      } else if (progress >= 72 && progress < 100) {
        setPhase(3);
      } else if (progress >= 100) {
        setPhase(4);
        clearInterval(interval);
        triggerHaptic(25);
        fireRewardConfetti();
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  const mood: MascotReaction = phase === 4 ? 'celebrate' : phase === 3 ? 'beast' : 'thinking';

  return (
    <div className="flex min-h-full flex-col justify-between py-5 text-center select-none">
      <div className="pt-2">
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[var(--ob-accent)]">
          {phase === 4 ? tr('RUTA PERSONAL LISTA', 'PERSONAL PATH READY') : tr('SÍNTESIS INTELIGENTE', 'SMART SYNTHESIS')}
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
          {phase === 4
            ? tr('Tu ruta de aprendizaje está lista', 'Your learning path is ready')
            : tr('Creando tu Ruta de Maestría', 'Building Your Mastery Path')}
        </h2>
      </div>

      <div className="flex flex-col items-center my-auto py-2">
        {/* Mascot */}
        <motion.div
          animate={phase === 4 ? { scale: [1, 1.06, 1] } : { scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
          className="h-36 w-36 sm:h-40 sm:w-40 relative flex items-center justify-center pointer-events-none mb-3"
        >
          <OnboardingMascot mood={mood} className="h-36 w-36 sm:h-40 sm:w-40" />
        </motion.div>

        {/* Progress Meter with Glowing Gradient */}
        <div className="w-full max-w-xs space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 font-bold truncate max-w-[200px] text-left">
              {phase === 1 && tr('Analizando perfil y nivel...', 'Analyzing profile & level...')}
              {phase === 2 && tr('Calibrando ritmo diario...', 'Calibrating daily pace...')}
              {phase === 3 && tr(`Sintetizando ruta de ${topicName}...`, `Synthesizing ${topicName}...`)}
              {phase === 4 && tr('¡100% Calibrado con éxito!', '100% Calibrated!')}
            </span>
            <span className="font-black text-[var(--ob-accent)] shrink-0">{percent}%</span>
          </div>

          <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--ob-accent)] to-[#FF8C33] shadow-[0_0_12px_rgba(255,115,0,0.5)] transition-all duration-75"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Milestones Checklist (Labor Illusion) */}
        <div className="w-full max-w-xs space-y-2 text-left">
          <div className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all duration-300 ${
            phase >= 1
              ? 'border-emerald-500/30 bg-emerald-500/[.06] text-white shadow-[0_0_15px_rgba(16,185,129,0.08)]'
              : 'border-white/5 bg-[#121216]/60 text-zinc-500'
          }`}>
            <CheckCircle2 size={16} className={phase >= 2 ? 'text-emerald-400 shrink-0' : 'text-zinc-500 animate-pulse shrink-0'} />
            <span className="text-xs font-semibold leading-tight">
              {tr('Perfil de aprendizaje diagnosticado', 'Learning profile diagnosed')}
            </span>
          </div>

          <div className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all duration-300 ${
            phase >= 2
              ? 'border-emerald-500/30 bg-emerald-500/[.06] text-white shadow-[0_0_15px_rgba(16,185,129,0.08)]'
              : 'border-white/5 bg-[#121216]/60 text-zinc-500'
          }`}>
            <CheckCircle2 size={16} className={phase >= 3 ? 'text-emerald-400 shrink-0' : phase === 2 ? 'text-amber-400 animate-pulse shrink-0' : 'text-zinc-600 shrink-0'} />
            <span className="text-xs font-semibold leading-tight">
              {tr(`${dailyGoal} min/día · Ritmo sostenible`, `${dailyGoal} min/day · Sustainable pace`)}
            </span>
          </div>

          <div className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all duration-300 ${
            phase >= 3
              ? 'border-emerald-500/30 bg-emerald-500/[.06] text-white shadow-[0_0_15px_rgba(16,185,129,0.08)]'
              : 'border-white/5 bg-[#121216]/60 text-zinc-500'
          }`}>
            <CheckCircle2 size={16} className={phase >= 4 ? 'text-emerald-400 shrink-0' : phase === 3 ? 'text-cyan-400 animate-pulse shrink-0' : 'text-zinc-600 shrink-0'} />
            <span className="text-xs font-semibold leading-tight">
              {tr(`Ruta de 30 días para ${topicName} lista`, `30-day ${topicName} pathway ready`)}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3">
        <PrimaryAction disabled={phase < 4} onClick={() => { triggerHaptic(); onDone(); }}>
          {tr('COMENZAR MI PRIMERA LECCIÓN', 'START MY FIRST LESSON')} <ArrowRight size={18} />
        </PrimaryAction>
      </div>
    </div>
  );
};

// Shared machined control used across onboarding.
export const PrimaryAction: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }
> = ({ className = '', variant = 'primary', children, ...props }) => {
  const isPrimary = variant === 'primary';
  return (
    <button
      {...props}
      className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black uppercase tracking-wider transition-all active:scale-[0.97] cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
        isPrimary
          ? 't1ger-primary-button text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_24px_rgba(0,0,0,0.35)]'
          : 'border border-white/10 bg-white/[.06] text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-white/[.1]'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const OnboardingFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const {
    updateAppUser,
    googleSignIn,
    appleSignIn,
    emailPasswordSignIn,
    emailPasswordSignUp,
  } = useAuth();
  const { language, setLanguage, selectTrack, updatePetSettings } = useBrain();
  const { addXP } = useT1ger();
  const isEs = language === 'es';
  const tr = (es: string, en: string) => (isEs ? es : en);

  const [draft, setDraft] = useState<OnboardingDraft>(() => loadDraft());
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-up');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [selectedLessonOption, setSelectedLessonOption] = useState<number | null>(null);
  const [lessonChecked, setLessonChecked] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState('');
  const [paywallPackages, setPaywallPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPaywallPkgId, setSelectedPaywallPkgId] = useState<string>('$rc_annual');
  const [purchasingPaywall, setPurchasingPaywall] = useState(false);
  const [paywallNotice, setPaywallNotice] = useState('');
  const [restoringPaywall, setRestoringPaywall] = useState(false);
  const [accessSubPage, setAccessSubPage] = useState<1 | 2 | 3>(1);

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

  useEffect(() => {
    if (step === 'access') {
      void (async () => {
        try {
          const pkgs = await revenueCat.getDisplayPackages();
          if (pkgs.length > 0) {
            setPaywallPackages(pkgs);
            const annual = pkgs.find(p => p.identifier.includes('annual'));
            if (annual) setSelectedPaywallPkgId(annual.identifier);
            else setSelectedPaywallPkgId(pkgs[0].identifier);
          }
        } catch (err) {
          console.warn('Failed loading onboarding paywall packages:', err);
        }
      })();
    }
  }, [step]);
  const currentStepIndex = Math.max(0, STEP_ORDER.indexOf(step));
  const baseEndowed = 18;
  const totalSteps = Math.max(1, STEP_ORDER.length - 1);
  const progressPercent = Math.min(
    100,
    Math.max(
      baseEndowed,
      step === 'access'
        ? Math.round(baseEndowed + ((currentStepIndex + (accessSubPage - 1) / 2) / totalSteps) * (100 - baseEndowed))
        : Math.round(baseEndowed + (currentStepIndex / totalSteps) * (100 - baseEndowed))
    )
  );

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  useEffect(() => {
    if (step === 'success' && draft.lessonCompleted) {
      fireRewardConfetti();
    }
  }, [draft.lessonCompleted, step]);

  const patchDraft = (patch: Partial<OnboardingDraft>) => {
    setDraft((curr) => ({ ...curr, ...patch }));
  };

  const goTo = (target: OnboardingStep, _nextDirection = 1) => {
    setError('');
    setDraft((curr) => ({ ...curr, step: target }));
  };

  const advance = () => {
    const nextIdx = Math.min(currentStepIndex + 1, STEP_ORDER.length - 1);
    goTo(STEP_ORDER[nextIdx], 1);
  };

  const back = () => {
    if (step === 'access' && accessSubPage > 1) {
      setAccessSubPage((curr) => (curr - 1) as 1 | 2 | 3);
      return;
    }
    const prevIdx = Math.max(currentStepIndex - 1, 0);
    goTo(STEP_ORDER[prevIdx], -1);
  };

  const currentTopicObj = COURSE_TOPICS.find((t) => t.id === draft.topic) || COURSE_TOPICS[0];
  const topicName = localize(currentTopicObj.title, language);
  const primaryTrack = getOnboardingTrack(draft.topic);

  const getProfilePatch = (onboardingComplete: boolean) => ({
    niche: primaryTrack,
    primaryTrack,
    goal: draft.motivation || 'productivity',
    experienceLevel: getOnboardingExperienceLevel(draft.knowledgeLevel),
    onboardingKnowledgeLevel: draft.knowledgeLevel,
    onboardingMotivation: draft.motivation || undefined,
    onboardingDistractions: draft.selectedDistractions || [],
    screenTimeLimitMinutes: Math.round(draft.screenTimeHours * 60),
    onboardingStartingPoint: draft.startingPoint,
    acquisitionSource: draft.acquisitionSource || undefined,
    learningStyle: 'interactive' as const,
    dailyTime: draft.dailyGoal,
    onboardingComplete,
    notificationPreferences: {
      daily_reminder: draft.reminderStatus === 'enabled',
      streak_risk: draft.reminderStatus === 'enabled',
      apply_reminder: draft.reminderStatus === 'enabled',
    },
  });

  const requestReminder = async () => {
    try {
      const granted = await OneSignalService.requestPermission();
      patchDraft({ reminderStatus: granted ? 'enabled' : 'denied' });
    } catch {
      patchDraft({ reminderStatus: 'denied' });
    }
    advance();
  };

  const finalize = async (choice: 'free' | 'super') => {
    setFinalizing(true);
    patchDraft({ accessChoice: choice });
    try {
      selectTrack(primaryTrack);
      updatePetSettings(Math.round(draft.screenTimeHours * 60), Math.max(50, draft.dailyGoal * 10));
      await updateAppUser({
        ...getProfilePatch(true),
      });
      await ProofVerificationService.claimOnboardingReward().catch((claimError) => {
        console.warn('Onboarding cloud reward deferred:', claimError);
        return null;
      });
      await addXP(ONBOARDING_XP, 2, 'onboarding:v2');
      window.localStorage.removeItem(DRAFT_KEY);
      onComplete();
    } catch (e: any) {
      setError(tr('No se pudo finalizar. Intenta nuevamente.', 'Failed to finalize. Please try again.'));
      setFinalizing(false);
    }
  };

  const handleOnboardingPurchase = async () => {
    if (!CHECKOUT_ENABLED) return;
    const pkg = paywallPackages.find(p => p.identifier === selectedPaywallPkgId) || paywallPackages[0];
    if (!pkg) return;

    setPurchasingPaywall(true);
    setPaywallNotice('');
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await revenueCat.purchase(pkg);
        if (result.success && result.isPro) {
          fireRewardConfetti();
          await finalize('super');
        } else {
          setPaywallNotice(tr('Debes activar un plan para desbloquear la aplicación.', 'You must activate a plan to unlock the application.'));
        }
      } else {
        setPaywallNotice(tr('Las compras no están disponibles en la web.', 'Purchases are unavailable on the web.'));
      }
    } catch (err: any) {
      if (err?.userCancelled) {
        setPaywallNotice(tr('Compra cancelada. Se requiere una membresía activa para acceder a T1GER.', 'Purchase cancelled. An active membership is required to access T1GER.'));
      } else {
        setPaywallNotice(tr('No se pudo procesar el pago con Google Play.', 'Could not process payment with Google Play.'));
      }
    } finally {
      setPurchasingPaywall(false);
    }
  };

  const handleOnboardingRestore = async () => {
    setRestoringPaywall(true);
    setPaywallNotice('');
    try {
      const result = await revenueCat.restore();
      if (result.isPro) {
        fireRewardConfetti();
        await finalize('super');
      } else {
        setPaywallNotice(tr('No encontramos compras previas activas en esta cuenta.', 'No active past purchases found on this account.'));
      }
    } catch {
      setPaywallNotice(tr('Error al restaurar compras.', 'Error restoring purchases.'));
    } finally {
      setRestoringPaywall(false);
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
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="relative rounded-2xl border border-white/15 bg-[#121216] px-6 py-3.5 text-base font-black text-white shadow-2xl mb-4"
              >
                {tr('¡Hola! ¡Soy T1GER!', "Hi there! I'm T1GER!")}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-b border-r border-white/15 bg-[#121216]" />
              </motion.div>

              {/* 3D Mascot Centered */}
              <div className="h-56 w-56 relative flex items-center justify-center pointer-events-none my-2">
                <OnboardingMascot mood="happy" className="h-56 w-56" />
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white mt-4">
                T1GER
              </h1>
              <p className="text-sm font-medium text-zinc-400 mt-1 max-w-xs">
                {tr(
                  'Descubre. Aprende. Aplica. Domina.',
                  'Discover. Learn. Apply. Master.'
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
      case 'topic_select': {
        const topicFeedback = draft.topic ? TOPIC_FEEDBACK[draft.topic] : null;
        return (
          <div className="flex min-h-full flex-col py-3 select-none">
            <DuolingoHeader
              speech={topicFeedback ? localize(topicFeedback, language) : tr('¿Qué tema despierta más tu curiosidad?', 'What topic are you most curious about?')}
              mood={draft.topic ? 'beast' : 'thinking'}
              eyebrow={tr('Elige tu primer camino', 'Choose your first path')}
              title={tr('¿Qué te gustaría aprender?', 'What would you like to learn?')}
            />

            <div className="space-y-2.5 my-auto">
              {COURSE_TOPICS.map((topic) => {
                const isSelected = draft.topic === topic.id;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      triggerHaptic();
                      patchDraft({ topic: topic.id });
                    }}
                    className={`flex items-center gap-3.5 w-full py-3 px-3.5 rounded-2xl border text-left transition-all active:scale-[0.985] cursor-pointer min-h-[60px] ${
                      isSelected
                        ? 'border-[var(--ob-accent)] bg-gradient-to-r from-[var(--ob-accent)]/20 to-[var(--ob-accent)]/5 text-white shadow-[0_0_20px_rgba(255,115,0,0.22),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-[var(--ob-accent)]/60'
                        : 'border-white/10 bg-[#121216]/80 backdrop-blur-md text-zinc-300 hover:border-white/20 hover:bg-[#16161c] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-colors ${
                      isSelected ? 'bg-[var(--ob-accent)]/20 border border-[var(--ob-accent)]/40 shadow-sm' : 'bg-white/[.04] border border-white/5'
                    }`}>
                      {topic.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-white block truncate">
                          {localize(topic.title, language)}
                        </strong>
                        {topic.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-[var(--ob-accent)] text-black text-[9px] font-black uppercase tracking-wider shrink-0 shadow-sm">
                            {localize(topic.badge, language)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400 block mt-0.5 line-clamp-1">
                        {localize(topic.subtitle, language)}
                      </span>
                    </div>
                    <span
                      className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 transition-all duration-150 ${
                        isSelected
                          ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)] text-black shadow-[0_0_10px_rgba(255,115,0,0.5)]'
                          : 'border-white/20 bg-white/[.03] text-transparent'
                      }`}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4">
              <PrimaryAction onClick={() => { triggerHaptic(); advance(); }}>
                {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
              </PrimaryAction>
            </div>
          </div>
        );
      }

      // Frame 3: Course Building (Labor Illusion & Operational Transparency)
      case 'course_building':
        return (
          <CourseBuildingView
            topicName={topicName}
            dailyGoal={draft.dailyGoal}
            language={language}
            onDone={advance}
          />
        );

      // Frame 4: Acquisition Source ("How did you hear about T1GER?")
      case 'acquisition_source':
        return (
          <div className="flex min-h-full flex-col py-3 select-none">
            <DuolingoHeader
              speech={draft.acquisitionSource ? tr('Gracias. Esto nos ayuda a construir una mejor experiencia para cada estudiante.', 'Thanks. This helps us build a better experience for every learner.') : tr('¿Cómo te enteraste de T1GER?', 'How did you hear about T1GER?')}
              mood={draft.acquisitionSource ? 'happy' : 'idle'}
              eyebrow={tr('Comunidad T1GER', 'T1GER Community')}
              title={tr('¿De dónde vienes?', 'Where are you from?')}
            />

            <div className="grid grid-cols-2 gap-2.5 my-auto">
              {ACQUISITION_SOURCES.map((src) => {
                const isSelected = draft.acquisitionSource === src.id;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      patchDraft({ acquisitionSource: src.id });
                    }}
                    className={`relative flex min-h-[58px] sm:min-h-16 items-center gap-2.5 rounded-2xl border py-2.5 px-3 text-left transition-all active:scale-[0.985] cursor-pointer ${
                      isSelected
                        ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)]/15 text-white shadow-[0_0_18px_rgba(255,115,0,0.2),inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-[var(--ob-accent)]/50'
                        : 'border-white/10 bg-[#121216]/80 backdrop-blur-md text-zinc-300 hover:border-white/20 hover:bg-[#16161c] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                    }`}
                  >
                    <span className="text-xl shrink-0">{src.icon}</span>
                    <span className="text-xs font-semibold leading-snug flex-1">
                      {localize(src.title, language)}
                    </span>
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-[var(--ob-accent)] text-black flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-4">
              <PrimaryAction disabled={!draft.acquisitionSource} onClick={() => { triggerHaptic(); advance(); }}>
                {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
              </PrimaryAction>
            </div>
          </div>
        );

      // Frame 5: Knowledge Level ("How much do you know?")
      case 'knowledge_level': {
        const knowledgeFeedback = KNOWLEDGE_FEEDBACK[draft.knowledgeLevel];
        return (
          <div className="flex min-h-full flex-col py-3 select-none">
            <DuolingoHeader
              speech={localize(knowledgeFeedback, language)}
              mood={draft.knowledgeLevel === 'zero' ? 'happy' : 'beast'}
              eyebrow={tr('Diagnóstico Inicial', 'Initial Diagnostic')}
              title={tr(`¿Cuál es tu nivel en ${topicName}?`, `What is your level in ${topicName}?`)}
            />

            <div className="space-y-2.5 my-auto">
              {KNOWLEDGE_LEVELS.map((lvl) => {
                const isSelected = draft.knowledgeLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      patchDraft({ knowledgeLevel: lvl.id });
                    }}
                    className={`flex items-center gap-3.5 w-full py-3 px-3.5 rounded-2xl border text-left transition-all active:scale-[0.985] cursor-pointer min-h-[58px] ${
                      isSelected
                        ? 'border-[var(--ob-accent)] bg-gradient-to-r from-[var(--ob-accent)]/20 to-[var(--ob-accent)]/5 text-white shadow-[0_0_20px_rgba(255,115,0,0.22),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-[var(--ob-accent)]/60'
                        : 'border-white/10 bg-[#121216]/80 backdrop-blur-md text-zinc-300 hover:border-white/20 hover:bg-[#16161c] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    }`}
                  >
                    {/* Signal strength bars */}
                    <div className="flex items-end gap-1 h-5 shrink-0 px-1">
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <div
                          key={bar}
                          className={`w-1 rounded-full transition-colors ${
                            bar <= lvl.bars
                              ? isSelected
                                ? 'bg-[var(--ob-accent)] shadow-[0_0_6px_rgba(255,115,0,0.6)]'
                                : 'bg-white/80'
                              : 'bg-white/15'
                          }`}
                          style={{ height: `${bar * 20}%` }}
                        />
                      ))}
                    </div>

                    <span className="text-sm font-semibold flex-1">
                      {localize(lvl.title, language)}
                    </span>
                    <span
                      className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 transition-all duration-150 ${
                        isSelected
                          ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)] text-black shadow-[0_0_10px_rgba(255,115,0,0.5)]'
                          : 'border-white/20 bg-white/[.03] text-transparent'
                      }`}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4">
              <PrimaryAction onClick={() => { triggerHaptic(); advance(); }}>
                {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
              </PrimaryAction>
            </div>
          </div>
        );
      }

      // Frame 6: Encouragement Interstitial
      case 'encouragement':
        return (
          <div className="flex min-h-full flex-col justify-between py-8 text-center">
            <div />
            <div className="flex flex-col items-center">
              <div className="h-44 w-44 relative flex items-center justify-center pointer-events-none mb-3">
                <OnboardingMascot mood="happy" className="h-44 w-44" />
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
      case 'motivation_reason': {
        const motFeedback = draft.motivation ? MOTIVATION_FEEDBACK[draft.motivation] : null;
        return (
          <div className="flex min-h-full flex-col py-3 select-none">
            <DuolingoHeader
              speech={motFeedback ? localize(motFeedback, language) : tr(`¿Por qué quieres dominar ${topicName}?`, `Why do you want to master ${topicName}?`)}
              mood={draft.motivation ? 'beast' : 'happy'}
              eyebrow={tr('Tu Gran Porqué', 'Your Core Why')}
              title={tr('Tu Motivación Principal', 'Your Main Motivation')}
            />

            <div className="space-y-2.5 my-auto">
              {MOTIVATION_REASONS.map((mot) => {
                const isSelected = draft.motivation === mot.id;
                return (
                  <button
                    key={mot.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      patchDraft({ motivation: mot.id });
                    }}
                    className={`flex items-center gap-3.5 w-full py-3 px-3.5 rounded-2xl border text-left transition-all active:scale-[0.985] cursor-pointer min-h-[58px] ${
                      isSelected
                        ? 'border-[var(--ob-accent)] bg-gradient-to-r from-[var(--ob-accent)]/20 to-[var(--ob-accent)]/5 text-white shadow-[0_0_20px_rgba(255,115,0,0.22),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-[var(--ob-accent)]/60'
                        : 'border-white/10 bg-[#121216]/80 backdrop-blur-md text-zinc-300 hover:border-white/20 hover:bg-[#16161c] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                      isSelected ? 'bg-[var(--ob-accent)]/20 border border-[var(--ob-accent)]/40' : 'bg-white/[.04] border border-white/5'
                    }`}>
                      {mot.icon}
                    </div>
                    <span className="text-sm font-semibold flex-1">
                      {localize(mot.title, language)}
                    </span>
                    <span
                      className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 transition-all duration-150 ${
                        isSelected
                          ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)] text-black shadow-[0_0_10px_rgba(255,115,0,0.5)]'
                          : 'border-white/20 bg-white/[.03] text-transparent'
                      }`}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4">
              <PrimaryAction disabled={!draft.motivation} onClick={() => { triggerHaptic(); advance(); }}>
                {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
              </PrimaryAction>
            </div>
          </div>
        );
      }

      // Frame 8: Weekly Promise Interstitial
      case 'weekly_promise':
        return (
          <div className="flex min-h-full flex-col justify-between py-8 text-center select-none">
            <div />
            <div className="flex flex-col items-center">
              <div className="h-44 w-44 relative flex items-center justify-center pointer-events-none mb-3">
                <OnboardingMascot mood="celebrate" className="h-44 w-44" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF7300]/20 border border-[#FF7300]/40 text-[#FF8C33] text-xs font-black uppercase mb-3">
                <Zap size={14} /> {tr('Impacto Rápido', 'Fast Impact')}
              </div>

              <h2 className="text-3xl font-black text-white">
                {tr('¡Eso son más de 20 conceptos y decisiones en tu primera semana!', "That's 20+ concepts & real decisions in your first week!")}
              </h2>
            </div>

            <PrimaryAction onClick={() => { triggerHaptic(); advance(); }}>
              {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
            </PrimaryAction>
          </div>
        );

      // Frame 9: Screen Time Hook & T1GER Health Pact (Loss Aversion Engine)
      case 'screen_time': {
        const hours = [0.75, 1, 1.5, 2].includes(draft.screenTimeHours) ? draft.screenTimeHours : 1.5;
        const selectedApps = draft.selectedDistractions || ['instagram', 'tiktok'];
        const reclaimedHoursYear = Math.round(Math.max(0.5, 3.5 - hours) * 365);

        const DISTRACTION_APPS = [
          { id: 'tiktok', name: { es: 'TikTok', en: 'TikTok' }, icon: '🎵' },
          { id: 'instagram', name: { es: 'Instagram', en: 'Instagram' }, icon: '📸' },
          { id: 'youtube', name: { es: 'YouTube', en: 'YouTube' }, icon: '▶️' },
          { id: 'x', name: { es: 'X (Twitter)', en: 'X (Twitter)' }, icon: '𝕏' },
          { id: 'games', name: { es: 'Juegos', en: 'Games' }, icon: '🎮' },
          { id: 'browse', name: { es: 'Doomscroll', en: 'Doomscroll' }, icon: '📱' },
        ];

        const toggleApp = (appId: string) => {
          triggerHaptic();
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
            <div className="grid grid-cols-3 gap-2 mb-3">
              {DISTRACTION_APPS.map((app) => {
                const isSel = selectedApps.includes(app.id);
                return (
                  <button
                    key={app.id}
                    onClick={() => toggleApp(app.id)}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-2xl border transition-all active:scale-95 cursor-pointer ${
                      isSel
                        ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)]/20 text-white font-bold shadow-[0_0_14px_rgba(255,115,0,0.25)]'
                        : 'border-white/10 bg-[#121216]/80 backdrop-blur-md text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <span className="text-base">{app.icon}</span>
                    <span className="text-xs">{localize(app.name, language)}</span>
                  </button>
                );
              })}
            </div>

            {/* Loss Aversion / Opportunity Cost Reclaimed Metric */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[.07] px-3.5 py-2.5 mb-3 flex items-center gap-2.5 text-left shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <span className="text-xl shrink-0">⏳</span>
              <p className="text-xs text-emerald-300 leading-snug">
                {tr(
                  `Recuperarás ~${reclaimedHoursYear} horas al año para construir tu negocio e invertir.`,
                  `You will reclaim ~${reclaimedHoursYear} hours/year to build your business & wealth.`
                )}
              </p>
            </div>

            {/* Target Daily Limit Selector */}
            <p className="text-xs font-bold text-zinc-300 mb-2">
              {tr('Tu límite máximo diario en estas apps:', 'Your max daily target limit on these apps:')}
            </p>
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {[0.75, 1.0, 1.5, 2.0].map((h) => (
                <button
                  key={h}
                  onClick={() => {
                    triggerHaptic();
                    patchDraft({ screenTimeHours: h });
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('t1ger_screen_time_hours', h.toString());
                    }
                  }}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-2 transition-all active:scale-95 cursor-pointer ${
                    hours === h
                      ? 'border-cyan-500 bg-cyan-950/40 text-white font-bold shadow-[0_0_14px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/50'
                      : 'border-white/10 bg-[#121216]/80 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <span className="text-sm font-black">{h === 0.75 ? '45m' : `${h}h`}</span>
                  <span className="text-[9px]">{tr('máximo', 'max')}</span>
                </button>
              ))}
            </div>

            {/* Health Mechanics Alert Card */}
            <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-500/10 to-transparent p-3.5 space-y-1.5 shadow-lg mb-2 text-left">
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
              <PrimaryAction onClick={() => { triggerHaptic(); advance(); }}>
                {tr('PROTEGER MI TIEMPO & T1GER', 'PROTECT MY TIME & T1GER')} <ArrowRight size={18} />
              </PrimaryAction>
            </div>
          </div>
        );
      }

      // Frame 10: Daily Commitment ("How much time can you commit?")
      case 'daily_goal': {
        const goalFeedback = GOAL_FEEDBACK[draft.dailyGoal] || GOAL_FEEDBACK[10];
        const GOAL_OPTIONS: Array<{
          minutes: number;
          tag: LocalizedText;
          icon: string;
          desc: LocalizedText;
          featured?: boolean;
        }> = [
          {
            minutes: 5,
            tag: { es: 'Relajado', en: 'Casual' },
            icon: '🌱',
            desc: { es: '1 lección diaria', en: '1 daily lesson' },
          },
          {
            minutes: 10,
            tag: { es: 'Recomendado', en: 'Recommended' },
            icon: '⚡',
            desc: { es: '2 lecciones diarias', en: '2 daily lessons' },
            featured: true,
          },
          {
            minutes: 15,
            tag: { es: 'Enfocado', en: 'Focused' },
            icon: '🎯',
            desc: { es: '3 lecciones diarias', en: '3 daily lessons' },
          },
          {
            minutes: 20,
            tag: { es: 'Profundo', en: 'Deep dive' },
            icon: '🧠',
            desc: { es: 'Aprender + repasar', en: 'Learn + review' },
          },
        ];

        return (
          <div className="flex min-h-full flex-col py-3 select-none">
            <DuolingoHeader
              speech={localize(goalFeedback, language)}
              mood={draft.dailyGoal >= 15 ? 'beast' : 'happy'}
              eyebrow={tr('Ritmo Diario', 'Daily Rhythm')}
              title={tr('¿Cuánto tiempo puedes proteger cada día?', 'How much time can you protect each day?')}
            />

            <div className="grid grid-cols-2 gap-3 my-auto">
              {GOAL_OPTIONS.map((opt) => {
                const isSelected = draft.dailyGoal === opt.minutes;
                return (
                  <button
                    key={opt.minutes}
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      patchDraft({ dailyGoal: opt.minutes });
                    }}
                    className={`relative flex flex-col justify-between min-h-32 rounded-2xl border p-3.5 text-left transition-all active:scale-[0.97] cursor-pointer ${
                      isSelected
                        ? 'border-[var(--ob-accent)] bg-gradient-to-br from-[var(--ob-accent)]/20 to-[var(--ob-accent)]/5 shadow-[0_0_22px_rgba(255,115,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-[var(--ob-accent)]/60'
                        : 'border-white/10 bg-[#121216]/80 backdrop-blur-md hover:border-white/20 hover:bg-[#16161c] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    }`}
                  >
                    {/* Top row: Symmetrical badge and check indicator */}
                    <div className="flex items-center justify-between gap-1 w-full mb-1">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                          opt.featured
                            ? 'bg-[var(--ob-accent)] text-black font-black'
                            : isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-white/10 text-zinc-300'
                        }`}
                      >
                        <span>{opt.icon}</span>
                        <span>{localize(opt.tag, language)}</span>
                      </span>
                      {isSelected && (
                        <Check size={14} className="text-[var(--ob-accent)] shrink-0" strokeWidth={3} />
                      )}
                    </div>

                    {/* Middle row: Big number */}
                    <div className="my-1">
                      <div className="flex items-baseline gap-1">
                        <strong className="text-3xl font-black text-white leading-none">{opt.minutes}</strong>
                        <span className="text-xs font-semibold text-zinc-400">{tr('min', 'min')}</span>
                      </div>
                    </div>

                    {/* Bottom row: Cadence description */}
                    <p className="text-[11px] text-zinc-400 font-medium leading-tight">
                      {localize(opt.desc, language)}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="pt-4">
              <PrimaryAction onClick={() => { triggerHaptic(); advance(); }}>
                {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
              </PrimaryAction>
            </div>
          </div>
        );
      }

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

            <div className="space-y-3.5 my-auto">
              {[
                {
                  id: 'scratch' as const,
                  badge: { es: 'RECOMENDADO', en: 'RECOMMENDED' },
                  icon: '🌱',
                  title: tr(`¿Aprendiendo ${topicName} por primera vez?`, `Learning ${topicName} for the first time?`),
                  desc: tr('Empieza desde las bases con micro-lecciones interactivas.', 'Start from scratch with interactive lessons.'),
                  featured: true,
                },
                {
                  id: 'placement' as const,
                  badge: { es: 'TEST DE NIVEL', en: 'PLACEMENT TEST' },
                  icon: '⚡',
                  title: tr(`¿Ya conoces las bases de ${topicName}?`, `Already know some ${topicName}?`),
                  desc: tr('Haremos una comprobación rápida para ubicar tu punto óptimo.', "Let's find your starting point with a quick check!"),
                  featured: false,
                },
              ].map((opt) => {
                const isSelected = draft.startingPoint === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => patchDraft({ startingPoint: opt.id })}
                    className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
                      isSelected
                        ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)]/15 text-white shadow-[0_0_20px_rgba(255,115,0,0.2)] ring-1 ring-[var(--ob-accent)]'
                        : 'border-white/10 bg-white/[.03] text-zinc-300 hover:border-white/20 hover:bg-white/[.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          opt.featured
                            ? 'bg-[var(--ob-accent)] text-black'
                            : isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-white/10 text-zinc-300'
                        }`}
                      >
                        <span>{opt.icon}</span>
                        <span>{localize(opt.badge, language)}</span>
                      </span>
                      <span
                        className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)] text-black'
                            : 'border-white/20 text-transparent'
                        }`}
                      >
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </span>
                    </div>
                    <strong className="text-sm sm:text-base font-bold text-white block">
                      {opt.title}
                    </strong>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {opt.desc}
                    </p>
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

      // Frame 14: Hands-on Micro-Lesson
      case 'micro_lesson': {
        const lessonByTopic: Record<CourseTopic, { prompt: string; promptEn: string; explanation: string; explanationEn: string; options: Array<{ es: string; en: string; correct: boolean }> }> = {
          technology: {
            prompt: '¿Qué mejora más la respuesta de un modelo de IA en una tarea real?',
            promptEn: 'What improves an AI model’s output most for a real task?',
            explanation: 'Un objetivo, contexto, restricciones y formato de salida reducen la ambigüedad y hacen el resultado utilizable.',
            explanationEn: 'A goal, context, constraints, and output format reduce ambiguity and make the result usable.',
            options: [
              { es: 'Definir objetivo, contexto, restricciones y formato.', en: 'Define the goal, context, constraints, and format.', correct: true },
              { es: 'Pedir simplemente que sea “mejor y más inteligente”.', en: 'Simply ask it to be “better and smarter”.', correct: false },
              { es: 'Hacer el prompt larguísimo sin estructura alguna.', en: 'Make the prompt extremely long without structure.', correct: false },
            ],
          },
          tech: {
            prompt: '¿Qué mejora más un prompt para una tarea real?',
            promptEn: 'What improves a prompt for a real task most?',
            explanation: 'Un objetivo, contexto, restricciones y formato de salida reducen la ambigüedad y hacen el resultado utilizable.',
            explanationEn: 'A goal, context, constraints, and output format reduce ambiguity and make the result usable.',
            options: [
              { es: 'Definir objetivo, contexto, restricciones y formato.', en: 'Define the goal, context, constraints, and format.', correct: true },
              { es: 'Pedir simplemente que sea “mejor”.', en: 'Simply ask it to be “better”.', correct: false },
              { es: 'Hacer el prompt largo sin estructura.', en: 'Make the prompt long without structure.', correct: false },
            ],
          },
          business: {
            prompt: '¿Qué hace que una oferta o producto gane tracción real de cero a uno?',
            promptEn: 'What gives an offer or product real zero-to-one traction?',
            explanation: 'Resolver un dolor urgente y específico para una persona identificable supera a cualquier marketing masivo.',
            explanationEn: 'Solving an urgent, specific pain for an identifiable customer beats any mass marketing.',
            options: [
              { es: 'Resolver un dolor urgente y específico para un cliente claro.', en: 'Solving an urgent, specific pain for a clear customer.', correct: true },
              { es: 'Gastar mucho en anuncios antes de tener clientes felices.', en: 'Spending heavily on ads before having happy customers.', correct: false },
              { es: 'Esperar a que el producto tenga 50 funciones terminadas.', en: 'Waiting until the product has 50 finished features.', correct: false },
            ],
          },
          skills: {
            prompt: '¿Qué hace fuerte a un hook de tres segundos?',
            promptEn: 'What makes a three-second hook strong?',
            explanation: 'Una tensión específica y relevante promete una recompensa clara antes de que la audiencia deslice.',
            explanationEn: 'Specific, relevant tension promises a clear payoff before the audience scrolls.',
            options: [
              { es: 'Tensión específica y una recompensa clara.', en: 'Specific tension and a clear payoff.', correct: true },
              { es: 'Una introducción larga sobre el creador.', en: 'A long introduction about the creator.', correct: false },
              { es: 'Muchos temas diferentes a la vez.', en: 'Many different topics at once.', correct: false },
            ],
          },
          investing: {
            prompt: '¿Cuál es el motor matemático más potente de la creación de riqueza?',
            promptEn: 'What is the most powerful mathematical engine of wealth creation?',
            explanation: 'Aportes consistentes reinvertidos durante décadas generan retornos exponenciales que superan cualquier especulación.',
            explanationEn: 'Consistent contributions reinvested over decades create exponential returns beating any speculation.',
            options: [
              { es: 'Aportar periódicamente y reinvertir rendimientos con horizonte largo.', en: 'Contribute regularly and reinvest returns with a long horizon.', correct: true },
              { es: 'Intentar adivinar el suelo y techo del mercado cada semana.', en: 'Try to guess market bottoms and tops every week.', correct: false },
              { es: 'Mantener todo el capital en efectivo bajo el colchón.', en: 'Keep all capital in cash under the mattress.', correct: false },
            ],
          },
          finance: {
            prompt: '¿Qué acción aprovecha mejor el interés compuesto?',
            promptEn: 'Which action uses compound growth best?',
            explanation: 'Invertir una cantidad constante y reinvertir rendimientos convierte el tiempo en tu ventaja.',
            explanationEn: 'Investing consistently and reinvesting returns turns time into your advantage.',
            options: [
              { es: 'Invertir cada mes y reinvertir los rendimientos.', en: 'Invest monthly and reinvest the returns.', correct: true },
              { es: 'Esperar a encontrar el momento perfecto.', en: 'Wait until you find the perfect moment.', correct: false },
              { es: 'Cambiar de estrategia cada semana.', en: 'Change strategies every week.', correct: false },
            ],
          },
          mindset: {
            prompt: '¿Qué acción reduce mejor el sesgo de confirmación?',
            promptEn: 'Which action best reduces confirmation bias?',
            explanation: 'Definir qué evidencia cambiaría tu opinión convierte una creencia en una hipótesis que sí puede ponerse a prueba.',
            explanationEn: 'Defining what evidence would change your mind turns a belief into a hypothesis that can actually be tested.',
            options: [
              { es: 'Buscar una prueba que podría demostrar que estás equivocado.', en: 'Seek a test that could show you are wrong.', correct: true },
              { es: 'Reunir más opiniones que ya coinciden contigo.', en: 'Collect more opinions that already agree with you.', correct: false },
              { es: 'Ignorar los datos que complican la decisión.', en: 'Ignore data that complicates the decision.', correct: false },
            ],
          },
          productivity: {
            prompt: '¿Qué protege la calidad de una sesión de Deep Work (trabajo profundo)?',
            promptEn: 'What protects the quality of a Deep Work session?',
            explanation: 'Eliminar el cambio de contexto y notificaciones permite alcanzar el estado de flujo cognitivo máximo.',
            explanationEn: 'Eliminating context switching and notifications allows reaching peak cognitive flow.',
            options: [
              { es: 'Cero notificaciones y una sola tarea de alto impacto.', en: 'Zero notifications and a single high-impact task.', correct: true },
              { es: 'Responder mensajes mientras trabajas en el proyecto.', en: 'Replying to messages while working on the project.', correct: false },
              { es: 'Trabajar 10 horas seguidas sin pausas planificadas.', en: 'Working 10 straight hours without planned breaks.', correct: false },
            ],
          },
          history: {
            prompt: 'Según el arte de la estrategia, ¿cuándo se decide la victoria?',
            promptEn: 'According to the art of strategy, when is victory decided?',
            explanation: 'Los estrategas victoriosos vencen primero mediante cálculo previo de terreno y recursos antes de entrar en batalla.',
            explanationEn: 'Victorious strategists win first through prior calculation of terrain and resources before entering battle.',
            options: [
              { es: 'Antes de la batalla, mediante cálculo previo de terreno y recursos.', en: 'Before battle, through prior calculation of terrain and resources.', correct: true },
              { es: 'Confiando en la suerte y la improvisación durante el conflicto.', en: 'Relying on luck and improvisation during the conflict.', correct: false },
              { es: 'Atacando frontalmente donde el enemigo es más fuerte.', en: 'Attacking head-on where the enemy is strongest.', correct: false },
            ],
          },
        };
        const lesson = lessonByTopic[draft.topic];
        const questionPrompt = tr(lesson.prompt, lesson.promptEn);
        const options = lesson.options.map((option, index) => ({
          id: index,
          text: tr(option.es, option.en),
          correct: option.correct,
        }));
        /*
         * This first retrieval check is deliberately retryable: a mistake gives
         * corrective feedback but never awards completion or XP.
         */
        const selectedOption = options.find((option) => option.id === selectedLessonOption);
        const isCorrect = Boolean(selectedOption?.correct);

        return (
          <div className="flex min-h-full flex-col py-3 select-none">
            <DuolingoHeader
              speech={
                lessonChecked
                  ? isCorrect
                    ? tr('¡Extraordinario! Demostraste criterio de alto nivel.', 'Awesome! You proved high-level judgment.')
                    : tr('Cuidado: reflexiona sobre la regla fundamental.', 'Careful: reflect on the core principle.')
                  : tr('Demuestra tu criterio para ganar tus primeros +100 XP.', 'Prove your judgement to earn your first +100 XP.')
              }
              mood={lessonChecked ? (isCorrect ? 'celebrate' : 'warning') : 'idle'}
              eyebrow={tr('Micro-Lección Práctica', 'Hands-on Micro-Lesson')}
              title={tr('Tu Primera Decisión', 'Your First Decision')}
            />

            <p className="text-sm font-bold text-zinc-200 text-center mb-3.5 px-2 leading-snug">
              {questionPrompt}
            </p>

            <div className="space-y-2.5 my-auto">
              {options.map((opt) => {
                const isSelected = selectedLessonOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (!lessonChecked) {
                        triggerHaptic();
                        setSelectedLessonOption(opt.id);
                      }
                    }}
                    className={`flex items-center gap-3.5 w-full p-4 rounded-2xl border text-left transition-all active:scale-[0.985] cursor-pointer ${
                      lessonChecked
                        ? opt.correct
                          ? 'border-[#3FC78E] bg-[#3FC78E]/15 text-white shadow-[0_0_22px_rgba(63,199,142,0.28)] ring-1 ring-[#3FC78E]/60'
                          : isSelected
                          ? 'border-[#E56A65] bg-[#E56A65]/15 text-white shadow-[0_0_18px_rgba(229,106,101,0.2)] ring-1 ring-[#E56A65]/60'
                          : 'border-white/5 bg-white/[.02] text-zinc-500 opacity-40'
                        : isSelected
                        ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)]/15 text-white shadow-[0_0_20px_rgba(255,115,0,0.22),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-[var(--ob-accent)]/60'
                        : 'border-white/10 bg-[#121216]/80 backdrop-blur-md text-zinc-300 hover:border-white/20 hover:bg-[#16161c] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-black text-xs transition-colors ${
                        lessonChecked
                          ? opt.correct
                            ? 'bg-[#3FC78E] text-black shadow-sm'
                            : isSelected
                            ? 'bg-[#E56A65] text-white shadow-sm'
                            : 'bg-white/10 text-zinc-500'
                          : isSelected
                          ? 'bg-[var(--ob-accent)] text-black shadow-sm'
                          : 'bg-white/10 text-zinc-400'
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
                    ? 'border-[#3FC78E]/40 bg-[#3FC78E]/10 text-[#C5E8DE] shadow-[0_0_20px_rgba(63,199,142,0.15)]'
                    : 'border-[#E56A65]/40 bg-[#E56A65]/10 text-[#FADBD8] shadow-[0_0_15px_rgba(229,106,101,0.1)]'
                }`}
              >
                <strong className="block text-sm font-bold text-white mb-0.5">
                  {isCorrect ? tr('¡Correcto! +100 XP desbloqueados', 'Correct! +100 XP unlocked') : tr('Respuesta correcta:', 'Correct answer:')}
                </strong>
                {tr(
                  lesson.explanation,
                  lesson.explanationEn
                )}
              </motion.div>
            )}

            <div className="pt-3">
              {!lessonChecked ? (
                <PrimaryAction
                  disabled={selectedLessonOption === null}
                  onClick={() => {
                    triggerHaptic(isCorrect ? 20 : 35);
                    if (isCorrect) fireRewardConfetti();
                    setLessonChecked(true);
                  }}
                >
                  {tr('COMPROBAR', 'CHECK')} <Check size={18} />
                </PrimaryAction>
              ) : isCorrect ? (
                <PrimaryAction
                  onClick={() => {
                    triggerHaptic();
                    patchDraft({ lessonCompleted: true, step: 'success' });
                  }}
                >
                  {tr('CONTINUAR', 'CONTINUE')} <ArrowRight size={18} />
                </PrimaryAction>
              ) : (
                <PrimaryAction
                  onClick={() => {
                    triggerHaptic();
                    setSelectedLessonOption(null);
                    setLessonChecked(false);
                  }}
                >
                  {tr('INTENTAR DE NUEVO', 'TRY AGAIN')} <ArrowRight size={18} />
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
                <OnboardingMascot mood="celebrate" className="h-44 w-44" />
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
            await updateAppUser(getProfilePatch(false));

            await googleSignIn();
            goTo('reminders');
          } catch (err: any) {
            console.error('Google Auth Error:', err);
            const msg = err.message || '';
            if (msg.includes('auth/popup-closed-by-user')) {
              setAuthError('');
            } else if (msg.includes('auth/native-unsupported-provider') || msg.includes('auth/unauthorized-domain')) {
              setAuthError(tr('Para esta red/dispositivo, por favor ingresa con tu correo abajo o continúa como invitado.', 'For this connection/device, please use email below or continue as guest.'));
            } else {
              setAuthError(tr('No se pudo conectar con Google. Puedes usar tu correo abajo o continuar como invitado.', 'Could not connect with Google. You can use email below or continue as guest.'));
            }
          } finally {
            setAuthLoading(false);
          }
        };

        const handleApple = async () => {
          setAuthError('');
          setAuthLoading(true);
          try {
            await updateAppUser(getProfilePatch(false));
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
            await updateAppUser(getProfilePatch(false));
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

      // Frame 18: Elite Calm/Headspace Multi-Page Paywall Sequence (3 Pages)
      case 'access': {
        if (!CHECKOUT_ENABLED) return (
          <div className="flex min-h-full flex-col justify-center gap-6 py-6">
            <DuolingoHeader speech={tr('Tu siguiente paso es aprender y aplicar una idea.', 'Your next step is to learn and apply one idea.')} mood="happy" title={tr('Tu camino está listo', 'Your journey is ready')} />
            <p className="text-sm leading-relaxed text-zinc-300">{tr('Empieza gratis. No se iniciará ninguna prueba ni suscripción. Podrás explorar una lección y completar tu primera acción.', 'Start free. No trial or subscription will begin. Explore a lesson and complete your first action.')}</p>
            <PrimaryAction disabled={finalizing} onClick={() => finalize('free')}>{finalizing ? tr('Guardando…', 'Saving…') : tr('Empezar mi camino', 'Start my journey')}</PrimaryAction>
          </div>
        );
        // --- SUB-PAGE 1: Personalization Climax & Projected Habit Formation Chart ---
        if (accessSubPage === 1) {
          return (
            <div className="flex min-h-full flex-col justify-between py-2 text-left">
              <DuolingoHeader
                speech={tr(
                  'He analizado tus respuestas y tu nivel de experiencia. Tu protocolo de 30 días está configurado.',
                  'I analyzed your answers and experience level. Your 30-day protocol is ready.'
                )}
                mood="celebrate"
                eyebrow={tr('DIAGNÓSTICO PERSONALIZADO // 1 DE 3', 'PERSONALIZED DIAGNOSIS // 1 OF 3')}
                title={tr('Tu Plan T1GER está Listo', 'Your T1GER Plan is Ready')}
              />

              <div className="space-y-3.5 my-auto overflow-y-auto max-h-[calc(100dvh-235px)] pr-0.5 hide-scrollbar">
                {/* 30-Day Projected Graph Card */}
                <div className="rounded-3xl border border-[#FF7300]/35 bg-gradient-to-b from-[#FF7300]/15 via-black/50 to-transparent p-4 text-left relative overflow-hidden shadow-[0_0_30px_rgba(255,115,0,0.15)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FF7300]/20 text-[#FF7300] border border-[#FF7300]/30">
                      {tr('TU CICLO DE APRENDIZAJE', 'YOUR LEARNING LOOP')}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {tr('5 ETAPAS', '5 STAGES')}
                    </span>
                  </div>

                  {/* SVG Chart */}
                  <div className="h-28 w-full relative py-2">
                    <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="proGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF7300" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#FF7300" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                      <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                      <line x1="0" y1="80" x2="300" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

                      {/* Drop curve */}
                      <path
                        d="M 10 65 Q 80 50 150 75 T 290 92"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                      {/* Growth area */}
                      <path
                        d="M 10 75 Q 80 60 150 35 T 290 10 L 290 95 L 10 95 Z"
                        fill="url(#proGradient)"
                      />
                      {/* Growth line */}
                      <path
                        d="M 10 75 Q 80 60 150 35 T 290 10"
                        fill="none"
                        stroke="#FF7300"
                        strokeWidth="3.5"
                      />
                      <circle cx="290" cy="10" r="4.5" fill="#FF7300" stroke="#FFFFFF" strokeWidth="2" />
                    </svg>

                    <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 pt-1">
                      <span>{tr('Descubrir', 'Discover')}</span>
                      <span>{tr('Aplicar', 'Apply')}</span>
                      <span className="text-[#FF7300] font-bold">{tr('Volver', 'Return')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-[10px]">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <span className="w-2.5 h-0.5 bg-red-500 inline-block" />
                      <span>{tr('Sin guía: fuentes dispersas', 'No guide: scattered sources')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#FF8C33] font-bold">
                      <span className="w-2.5 h-1 bg-[#FF7300] rounded inline-block" />
                      <span>{tr('Con T1GER: un próximo paso', 'With T1GER: one next step')}</span>
                    </div>
                  </div>
                </div>

                {/* Metric Bento */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-2xl bg-white/[.03] border border-white/8 text-center">
                    <Clock size={16} className="text-[#FF7300] mx-auto mb-1" />
                    <span className="text-xs font-mono font-black text-white block">LEARN</span>
                    <span className="text-[9px] text-zinc-400 leading-tight block">{tr('Modelo + reto', 'Model + challenge')}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[.03] border border-white/8 text-center">
                    <Flame size={16} className="text-amber-400 mx-auto mb-1" />
                    <span className="text-xs font-mono font-black text-white block">APPLY</span>
                    <span className="text-[9px] text-zinc-400 leading-tight block">{tr('Acción real', 'Real action')}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[.03] border border-white/8 text-center">
                    <Zap size={16} className="text-emerald-400 mx-auto mb-1" />
                    <span className="text-xs font-mono font-black text-white block">MASTER</span>
                    <span className="text-[9px] text-zinc-400 leading-tight block">{tr('Repaso inteligente', 'Smart review')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <PrimaryAction onClick={() => setAccessSubPage(2)}>
                  {tr('VER CÓMO FUNCIONA', 'SEE HOW IT WORKS')} <ChevronRight size={18} />
                </PrimaryAction>
              </div>
            </div>
          );
        }

        // --- SUB-PAGE 2: The Value & Social Proof Bridge ---
        if (accessSubPage === 2) {
          return (
            <div className="flex min-h-full flex-col justify-between py-2 text-left">
              <DuolingoHeader
                speech={tr(
                  'El conocimiento útil se pierde cuando solo se consume. T1GER conecta cada lección con una acción y un repaso.',
                  'Useful knowledge fades when it is only consumed. T1GER connects every lesson to action and review.'
                )}
                mood="happy"
                eyebrow={tr('EL MÉTODO // 2 DE 3', 'THE METHOD // 2 OF 3')}
                title={tr('¿Por Qué Funciona T1GER?', 'Why Does T1GER Work?')}
              />

              <div className="space-y-3 my-auto overflow-y-auto max-h-[calc(100dvh-235px)] pr-0.5 hide-scrollbar">
                {/* Comparison Bento */}
                <div className="grid grid-cols-2 gap-2.5 text-left">
                  <div className="p-3.5 rounded-2xl border border-red-500/20 bg-red-500/[.04] space-y-2">
                    <span className="text-[9px] font-mono font-black uppercase tracking-wider text-red-400 block">
                      {tr('SIN ESTRUCTURA', 'UNSTRUCTURED')}
                    </span>
                    <ul className="text-[10px] text-zinc-400 space-y-1.5 leading-snug">
                      <li>• {tr('Fuentes dispersas', 'Scattered sources')}</li>
                      <li>• {tr('Contenido pasivo', 'Passive content')}</li>
                      <li>• {tr('Olvido sin repaso', 'Forgetting without review')}</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-[#FF7300]/40 bg-gradient-to-b from-[#FF7300]/15 to-transparent space-y-2 shadow-[0_0_20px_rgba(255,115,0,0.1)]">
                    <span className="text-[9px] font-mono font-black uppercase tracking-wider text-[#FF7300] block">
                      {tr('⚡ Con T1GER Pro', '⚡ With T1GER Pro')}
                    </span>
                    <ul className="text-[10px] text-zinc-200 space-y-1.5 leading-snug">
                      <li>✓ {tr('Rutas de fuentes curadas', 'Curated-source paths')}</li>
                      <li>✓ {tr('Aplicación en la vida real', 'Real-world application')}</li>
                      <li>✓ {tr('Repasos adaptativos', 'Adaptive reviews')}</li>
                    </ul>
                  </div>
                </div>

                {/* Product loop explanation */}
                <div className="p-4 rounded-2xl border border-amber-500/30 bg-white/[.02] text-left space-y-2">
                  <div className="flex items-center gap-2 text-amber-400">
                    <BookOpen size={16} />
                    <span className="text-[10px] font-mono font-bold text-zinc-300">{tr('APRENDE → APLICA → DOMINA', 'LEARN → APPLY → MASTER')}</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {tr(
                      'Aprende una idea con interacción, aplícala en una decisión real y vuelve a recuperarla antes de olvidarla.',
                      'Learn one idea interactively, apply it in a real decision, and retrieve it again before it fades.'
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <PrimaryAction onClick={() => setAccessSubPage(3)}>
                  {tr('EXPLORAR OPCIONES DE ACCESO', 'EXPLORE ACCESS OPTIONS')} <Sparkles size={18} />
                </PrimaryAction>
              </div>
            </div>
          );
        }

        // --- SUB-PAGE 3: Optional membership, using store-provided product terms ---

        return (
          <div className="flex h-full flex-col justify-between py-1 text-left overflow-hidden select-none">
            {/* Top Badge & Header */}
            <div className="text-center pt-0.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-gradient-to-r from-emerald-500/20 via-[#FF7300]/20 to-transparent text-orange-400 border border-orange-500/30">
                {tr('MEMBRESÍA OPCIONAL', 'OPTIONAL MEMBERSHIP')}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5 leading-tight">
                {tr('Desbloquea la experiencia completa', 'Unlock the complete learning experience')}
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
                {tr(
                  'Explora más rutas, aplica lo aprendido y conserva el conocimiento con repasos.',
                  'Explore more paths, apply what you learn, and retain it through review.'
                )}
              </p>
            </div>

            {/* Plan Cards - Compact 2-option selector */}
            <div className="space-y-2 my-auto py-1">
              <p className="text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400 px-1">
                {tr('Elige tu modalidad de acceso', 'Choose your access tier')}
              </p>

              {paywallPackages.length > 0 ? (
                paywallPackages.slice(0, 2).map(pkg => {
                  const isSelected = selectedPaywallPkgId === pkg.identifier;
                  const isPkgAnnual = pkg.identifier.includes('annual');

                  return (
                    <button
                      key={pkg.identifier}
                      type="button"
                      onClick={() => setSelectedPaywallPkgId(pkg.identifier)}
                      className={`relative w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FF7300]/15 border-[#FF7300] shadow-[0_0_18px_rgba(255,115,0,0.2)]'
                          : 'bg-white/[.03] border-white/10 hover:border-white/20'
                      }`}
                    >
                      {isPkgAnnual && (
                        <span className="absolute -top-2 right-3 px-2 py-0.2 rounded-full text-[8px] font-black uppercase bg-gradient-to-r from-emerald-400 to-[#3FC78E] text-black shadow-sm">
                          {tr('PLAN ANUAL', 'ANNUAL PLAN')}
                        </span>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#FF7300] bg-[#FF7300]' : 'border-zinc-500'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white leading-tight">{pkg.product.title}</h4>
                            <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                              {pkg.product.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs sm:text-sm font-black text-white font-mono block">
                            {pkg.product.priceString}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-3 rounded-2xl bg-white/[.03] border border-white/10 text-center text-xs text-zinc-400">
                  {tr('Cargando planes de Google Play...', 'Loading Google Play plans...')}
                </div>
              )}

              <div className="rounded-xl border border-white/8 bg-white/[.02] px-3 py-2 text-center text-[10px] leading-relaxed text-zinc-400">
                {tr(
                  'Google Play confirmará el precio y cualquier prueba disponible antes de comprar.',
                  'Google Play will confirm the price and any available trial before purchase.'
                )}
              </div>
            </div>

            {/* Error / Notice message */}
            {(paywallNotice || error) && (
              <p role="alert" className="rounded-xl border border-[#FF4B4B]/30 bg-[#FF4B4B]/10 p-1.5 text-center text-[11px] font-bold text-[#FF8F8F] my-1">
                {paywallNotice || error}
              </p>
            )}

            {/* Paid and free access choices */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleOnboardingPurchase}
                disabled={purchasingPaywall || finalizing}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF7300] to-[#FF8C33] text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_4px_22px_rgba(255,115,0,0.38)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {purchasingPaywall ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    {tr('PROCESANDO...', 'PROCESSING...')}
                  </>
                ) : (
                  <>
                    <span>{tr('CONTINUAR CON PRO', 'CONTINUE WITH PRO')}</span>
                    <Sparkles size={18} />
                  </>
                )}
              </button>

              {/* Button 2: Big Empezar Gratis Button */}
              <button
                type="button"
                onClick={() => finalize('free')}
                disabled={purchasingPaywall || finalizing}
                className="w-full py-3 px-4 rounded-2xl border border-white/20 bg-white/[0.04] text-zinc-200 hover:text-white hover:bg-white/[0.08] font-bold text-xs sm:text-sm tracking-wide active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {finalizing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    {tr('PREPARANDO ACCESO...', 'PREPARING ACCESS...')}
                  </>
                ) : (
                  <span>{tr('Empezar gratis', 'Start for free')}</span>
                )}
              </button>

              {/* Footer Trust & Restore */}
              <div className="flex items-center justify-between px-2 pt-0.5 text-[9px] font-mono text-zinc-500">
                <button
                  type="button"
                  onClick={handleOnboardingRestore}
                  disabled={restoringPaywall || purchasingPaywall}
                  className="hover:text-zinc-300 underline cursor-pointer"
                >
                  {restoringPaywall ? tr('Restaurando...', 'Restoring...') : tr('Restaurar compras', 'Restore purchases')}
                </button>
                <div className="flex items-center gap-1 text-zinc-400">
                  <Shield size={11} className="text-emerald-400" />
                  <span>{tr('Compra segura con Google Play', 'Secure purchase with Google Play')}</span>
                </div>
              </div>
            </div>
          </div>
        );
      }

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

        {/* Keep this container mounted so the WebGL mascot survives step changes. */}
        <section className="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          {renderStepContent()}
        </section>
      </main>
    </div>
  );
};
