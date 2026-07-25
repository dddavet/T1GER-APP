import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { type TrackType } from '../services/missionBank';
import { Brain, Target, Zap, ChevronRight, PlaySquare, FileText, Blocks, Trophy, Sparkles, Check, ArrowRight, BookOpen, ThumbsUp, ThumbsDown, Instagram, Youtube, MessageSquare, ShieldAlert, Frown, Clock, HelpCircle, Activity } from 'lucide-react';
import { OnboardingArchetypeReveal } from './OnboardingArchetypeReveal';
import { OnboardingMicroLesson } from './OnboardingMicroLesson';
import { WheelPicker } from './WheelPicker';
import { RulerSlider } from './RulerSlider';
import { ExponentialGraph } from './ExponentialGraph';
import { PaceSlider } from './PaceSlider';
import { SCurveGraph } from './SCurveGraph';
import { BarChartComparison } from './BarChartComparison';
import { InterstitialHype } from './InterstitialHype';
import { SocialProofReviews } from './SocialProofReviews';
import { PrivacyTrust } from './PrivacyTrust';
import { ConnectNotifications } from './ConnectNotifications';
import { HardcoreModeToggle } from './HardcoreModeToggle';
import { RolloverMissions } from './RolloverMissions';
import { GeneratePlanIntro } from './GeneratePlanIntro';
import { LoadingPlanSimulation } from './LoadingPlanSimulation';
import { CustomPlanReady } from './CustomPlanReady';
import { SaveProgressAuth } from './SaveProgressAuth';
import { ReferralCode } from './ReferralCode';
import { PaywallIntro } from './PaywallIntro';

import { CHARACTER_CAST } from '../services/characterStateEngine';
import { T1gerInteractiveAvatar } from './T1gerInteractiveAvatar';
import { TigerMascot } from './TigerMascot';

interface DiagnosticQuestion {
  id: string;
  question: string;
  options: { label: string; correct: boolean }[];
}

const DIAGNOSTIC_QUESTIONS: Record<'business' | 'investing' | 'ai', {
  Q1: DiagnosticQuestion;
  Q2_Correct: DiagnosticQuestion;
  Q2_Incorrect: DiagnosticQuestion;
  Q3: DiagnosticQuestion;
}> = {
  ai: {
    Q1: {
      id: 'ai-q1',
      question: '¿Qué es exactamente un Modelo de Lenguaje Grande (LLM) como ChatGPT?',
      options: [
        { label: 'Una base de datos que busca respuestas exactas en internet', correct: false },
        { label: 'Un modelo probabilístico que predice la siguiente palabra más probable', correct: true },
        { label: 'Una inteligencia consciente y con sentimientos propios', correct: false }
      ]
    },
    Q2_Correct: {
      id: 'ai-q2-c',
      question: 'En ingeniería de prompts, ¿qué efecto tiene aumentar el parámetro "Temperature" (Temperatura)?',
      options: [
        { label: 'Incrementa la creatividad, variabilidad y aleatoriedad de las respuestas', correct: true },
        { label: 'Aumenta la velocidad de procesamiento del hardware gráfico', correct: false },
        { label: 'Fuerza al modelo a respetar un límite estricto de tokens', correct: false }
      ]
    },
    Q2_Incorrect: {
      id: 'ai-q2-i',
      question: '¿Qué es un "Prompt" en el contexto de la Inteligencia Artificial?',
      options: [
        { label: 'Un lenguaje de bajo nivel exclusivo de ingenieros', correct: false },
        { label: 'La instrucción en texto que le das a una IA para guiar su respuesta', correct: true },
        { label: 'El nombre técnico de la tarjeta de video de NVIDIA', correct: false }
      ]
    },
    Q3: {
      id: 'ai-q3',
      question: '¿Qué significa el término "Alucinación" en un modelo generativo?',
      options: [
        { label: 'Cuando la IA genera información falsa con total seguridad', correct: true },
        { label: 'Cuando el servidor entra en bucle y se desconecta', correct: false },
        { label: 'Cuando el filtro de seguridad bloquea una consulta indebida', correct: false }
      ]
    }
  },
  business: {
    Q1: {
      id: 'biz-q1',
      question: 'Según la Ecuación del Valor de Alex Hormozi, ¿cuáles factores debes reducir para maximizar el valor percibido?',
      options: [
        { label: 'El precio del producto y la inversión en publicidad', correct: false },
        { label: 'El tiempo de entrega (Time Delay) y el esfuerzo/sacrificio requerido del cliente', correct: true },
        { label: 'La cantidad de bonos incluidos en el paquete de venta', correct: false }
      ]
    },
    Q2_Correct: {
      id: 'biz-q2-c',
      question: 'Estás diseñando bonos para un curso de $997 USD. ¿Cuál estrategia genera más conversiones?',
      options: [
        { label: 'Ofrecer 50 PDFs aleatorios para inflar la percepción de volumen', correct: false },
        { label: 'Diseñar 3 bonos específicos que disuelvan las 3 objeciones principales de compra', correct: true },
        { label: 'No incluir bonos para no abaratar la estética premium del curso', correct: false }
      ]
    },
    Q2_Incorrect: {
      id: 'biz-q2-i',
      question: 'Cuando un cliente potencial altamente calificado te dice "Tengo que pensarlo" al final, ¿qué significa?',
      options: [
        { label: 'Que el cliente realmente necesita una hoja de Excel para calcular sus gastos', correct: false },
        { label: 'Es una objeción pantalla; no has logrado revelar el verdadero miedo o duda del comprador', correct: true },
        { label: 'Que el precio es demasiado barato y desconfía de la calidad', correct: false }
      ]
    },
    Q3: {
      id: 'biz-q3',
      question: '¿Qué es una oferta de tipo "Grand Slam Offer"?',
      options: [
        { label: 'Una oferta tan buena que las personas se sienten estúpidas diciendo que no', correct: true },
        { label: 'Un cupón de descuento masivo para liquidar stock viejo', correct: false },
        { label: 'Un patrocinio exclusivo firmado por atletas olímpicos', correct: false }
      ]
    }
  },
  investing: {
    Q1: {
      id: 'inv-q1',
      question: '¿Qué describe mejor la mecánica del Interés Compuesto?',
      options: [
        { label: 'Cobrar intereses únicamente sobre el capital inicial de depósito', correct: false },
        { label: 'Ganar intereses sobre tu capital inicial y también sobre los intereses acumulados con el tiempo', correct: true },
        { label: 'Invertir en divisas de alta volatilidad esperando una subida repentina', correct: false }
      ]
    },
    Q2_Correct: {
      id: 'inv-q2-c',
      question: '¿Cuál es la principal ventaja de hacer "Dollar-Cost Averaging" (DCA)?',
      options: [
        { label: 'Asegurar que compras siempre al precio más bajo absoluto del año', correct: false },
        { label: 'Comprar cantidades fijas en intervalos regulares para mitigar el riesgo de volatilidad', correct: true },
        { label: 'Evitar el pago de comisiones e impuestos en cuentas corporativas', correct: false }
      ]
    },
    Q2_Incorrect: {
      id: 'inv-q2-i',
      question: '¿Qué representa la "Inflación" para el dinero ahorrado en tu cuenta de banco?',
      options: [
        { label: 'El cobro del impuesto sobre la renta de dividendos', correct: false },
        { label: 'La pérdida gradual de tu poder adquisitivo real debido al alza general de precios', correct: true },
        { label: 'El crecimiento pasivo de tus inversiones en el mercado de bonos', correct: false }
      ]
    },
    Q3: {
      id: 'inv-q3',
      question: '¿Qué es un fondo de índice (Index Fund) de bajo costo?',
      options: [
        { label: 'Un portafolio diversificado que replica de forma pasiva el rendimiento de un mercado entero', correct: true },
        { label: 'Una cuenta de depósito a plazo fijo con un banco central', correct: false },
        { label: 'Un fondo mutuo que busca ganarle al mercado mediante trading intradiario', correct: false }
      ]
    }
  }
};

const QUESTIONS: any[] = [
  {
    id: 'goal',
    title: 'What brings you to T1GER?',
    subtitle: 'We will personalize your initial curriculum.',
    type: 'options',
    options: [
      { id: 'startup', label: 'Build a Startup', labelEs: 'Construir una Startup', description: 'Scale a business to +$1M MRR', descriptionEs: 'Escalar una empresa a +$1M MRR', icon: <Target className="w-6 h-6" />, badgeBg: 'bg-orange-500' },
      { id: 'investing', label: 'Master Investing', labelEs: 'Dominar Inversiones', description: 'Stocks, valuation & compounding', descriptionEs: 'Acciones, valuación e interés compuesto', icon: <Zap className="w-6 h-6" />, badgeBg: 'bg-blue-500' },
      { id: 'career', label: 'Grow My Career', labelEs: 'Acelerar Carrera', description: 'Executive leadership & AI tools', descriptionEs: 'Liderazgo ejecutivo y herramientas de IA', icon: <Brain className="w-6 h-6" />, badgeBg: 'bg-emerald-500' },
      { id: 'freedom', label: 'Financial Freedom', labelEs: 'Libertad Financiera', description: 'Passive income & asset allocation', descriptionEs: 'Ingresos pasivos y gestión de capital', icon: <Target className="w-6 h-6" />, badgeBg: 'bg-purple-500' }
    ]
  },
  {
    id: 'placementChoice',
    title: 'Choose your entry point',
    subtitle: 'Beginners start at Level 1. Advanced users can test out of basics.',
    type: 'options',
    options: [
      { id: 'beginner', label: 'I am a complete beginner', labelEs: 'Soy principiante absoluto', description: 'Start from Day 1 foundations', descriptionEs: 'Comenzar desde las bases del Día 1', icon: <BookOpen className="w-6 h-6" />, badgeBg: 'bg-[#FF7300]' },
      { id: 'test', label: 'Take Placement Challenge', labelEs: 'Desafío de Nivelación', description: '3 quick questions to skip basics', descriptionEs: '3 preguntas para saltar niveles', icon: <Trophy className="w-6 h-6" />, badgeBg: 'bg-[#1CB0F6]' }
    ]
  },
  {
    id: 'timeCommitment',
    title: '¿Cuánto tiempo tienes al día?',
    subtitle: 'Desliza para establecer tu compromiso diario en minutos.',
    type: 'slider',
    min: 5,
    max: 60,
    step: 5,
  },
  {
    id: 'pace',
    type: 'pace'
  },
  {
    id: 'comparison',
    type: 'barchart'
  },
  {
    id: 'obstacles',
    title: 'What is stopping you from reaching your goals?',
    subtitle: 'Be honest with yourself.',
    type: 'options',
    options: [
      { id: 'consistency', label: 'Lack of consistency', labelEs: 'Falta de consistencia', icon: <Activity className="w-6 h-6" />, badgeBg: 'bg-red-500' },
      { id: 'distractions', label: 'Too many distractions', labelEs: 'Muchas distracciones', icon: <Frown className="w-6 h-6" />, badgeBg: 'bg-amber-500' },
      { id: 'support', label: 'Lack of mentors', labelEs: 'Falta de mentores', icon: <ShieldAlert className="w-6 h-6" />, badgeBg: 'bg-indigo-500' },
      { id: 'time', label: 'Busy schedule', labelEs: 'Agenda muy ocupada', icon: <Clock className="w-6 h-6" />, badgeBg: 'bg-blue-500' }
    ]
  },
  {
    id: 'birthYear',
    title: 'When were you born?',
    subtitle: 'Used to calibrate AI mentors and examples.',
    type: 'wheel',
    wheelOptions: Array.from({ length: 60 }, (_, i) => {
      const year = new Date().getFullYear() - 14 - i;
      return { label: year.toString(), value: year };
    })
  },
  {
    id: 'heardAboutUs',
    title: 'How did you hear about T1GER?',
    subtitle: 'Help us understand our pack.',
    type: 'options',
    options: [
      { id: 'tiktok', label: 'TikTok', labelEs: 'TikTok', description: 'Shorts & viral videos', descriptionEs: 'Videos virales y Shorts', icon: <PlaySquare className="w-6 h-6" />, badgeBg: 'bg-[#FE2C55]' },
      { id: 'youtube', label: 'YouTube', labelEs: 'YouTube', description: 'Longform videos & podcasts', descriptionEs: 'Canal de YouTube y guías', icon: <Youtube className="w-6 h-6" />, badgeBg: 'bg-[#FF0000]' },
      { id: 'instagram', label: 'Instagram', labelEs: 'Instagram', description: 'Reels & posts', descriptionEs: 'Reels y publicaciones', icon: <Instagram className="w-6 h-6" />, badgeBg: 'bg-[#E4405F]' },
      { id: 'friend', label: 'Friend or Colleague', labelEs: 'Amigo o Colega', description: 'Word of mouth recommendation', descriptionEs: 'Recomendación directa', icon: <MessageSquare className="w-6 h-6" />, badgeBg: 'bg-[#00E5FF]' }
    ]
  },
  {
    id: 'triedOtherApps',
    title: 'Have you tried other learning apps?',
    subtitle: 'Like Duolingo, Brilliant, or Masterclass.',
    type: 'options',
    options: [
      { id: 'yes', label: 'Yes, I want more depth', labelEs: 'Sí, pero busco más nivel', icon: <ThumbsUp className="w-6 h-6" />, badgeBg: 'bg-emerald-500' },
      { id: 'no', label: 'No, this is my first time', labelEs: 'No, es mi primera vez', icon: <ThumbsDown className="w-6 h-6" />, badgeBg: 'bg-zinc-500' }
    ]
  },
  {
    id: 'potential',
    type: 'scurve'
  },
  {
    id: 'hype',
    type: 'interstitial'
  },
  {
    id: 'hardcoreMode',
    type: 'hardcoreMode'
  },
  {
    id: 'rollover',
    type: 'rollover'
  },
  {
    id: 'socialProofReviews',
    type: 'socialProofReviews'
  },
  {
    id: 'generatePlanIntro',
    type: 'generatePlanIntro'
  },
  {
    id: 'loadingSimulation',
    type: 'loadingSimulation'
  },
  {
    id: 'planReady',
    type: 'planReady'
  },
  {
    id: 'paywallIntro',
    type: 'paywallIntro'
  },
  {
    id: 'saveProgress',
    type: 'saveProgress'
  },
  {
    id: 'connectNotifications',
    type: 'connectNotifications'
  },
  {
    id: 'privacyTrust',
    type: 'privacyTrust'
  },
  {
    id: 'referralCode',
    type: 'referralCode'
  }
];

export const OnboardingFlow: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { skipDaysForPlacement, language } = useBrain();
  const { updateAppUser, googleSignIn } = useAuth();
  const isEs = language === 'es';
  
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({
    timeCommitment: 15,
    birthYear: 2000,
    pace: 1
  });
  const [isFinishing, setIsFinishing] = useState(false);
  const [onboardingStage, setOnboardingStage] = useState<'landing' | 'questions' | 'archetype' | 'microlesson'>('landing');

  // Diagnostic Test State Machine
  const [diagnosticActive, setDiagnosticActive] = useState(false);
  const [diagnosticStep, setDiagnosticStep] = useState<'q1' | 'q2' | 'q3' | 'result'>('q1');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedDiagnosticOpt, setSelectedDiagnosticOpt] = useState<number | null>(null);
  const [diagnosticQ1Correct, setDiagnosticQ1Correct] = useState<boolean | null>(null);

  const currentQuestion = QUESTIONS[stepIndex];

  // Resolve study track based on goal choice
  const resolvedTrackId = useMemo((): 'business' | 'investing' | 'ai' => {
    const goal = answers.goal || 'career';
    if (goal === 'investing') return 'investing';
    if (goal === 'startup' || goal === 'career' || goal === 'freedom') return 'business';
    return 'ai';
  }, [answers.goal]);

  // Resolve diagnostic questions dynamically
  const activeDiagnosticQ = useMemo((): DiagnosticQuestion => {
    const track = resolvedTrackId;
    const questions = DIAGNOSTIC_QUESTIONS[track];
    
    if (diagnosticStep === 'q1') return questions.Q1;
    if (diagnosticStep === 'q2') {
      return diagnosticQ1Correct ? questions.Q2_Correct : questions.Q2_Incorrect;
    }
    return questions.Q3; // q3
  }, [resolvedTrackId, diagnosticStep, diagnosticQ1Correct]);

  const haptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const advanceStep = () => {
    setStepIndex(currentStep => {
      if (currentStep < QUESTIONS.length - 1) return currentStep + 1;
      setOnboardingStage('archetype');
      return currentStep;
    });
  };

  const submitAnswers = (placedLevelOverride?: number, xpEarned = 0, coinsEarned = 0) => {
    let niche = 'none';
    const goal = answers.goal;
    if (goal === 'investing') niche = 'investing';
    else if (goal === 'startup') niche = 'business';

    const placedLevel = placedLevelOverride || 1;

    // Apply skipping in context
    if (placedLevel > 1) {
      skipDaysForPlacement(resolvedTrackId, placedLevel);
    }

    updateAppUser({
      ...answers,
      niche,
      experienceLevel: placedLevel,
      onboardingStep: 'complete',
      onboardingComplete: true,
      xp: xpEarned,
      coins: coinsEarned,
      level: 1
    });
  };

  const handleSelect = (optionId: string) => {
    haptic();
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
    
    setTimeout(() => {
      if (currentQuestion.id === 'placementChoice') {
        if (optionId === 'test') {
          // Launch placement challenge flow!
          setDiagnosticActive(true);
          setDiagnosticStep('q1');
          setCorrectAnswers(0);
          setSelectedDiagnosticOpt(null);
          return;
        } else {
          // Start as beginner, skip diagnostic, move to age range
          advanceStep();
        }
      } else {
        advanceStep();
      }
    }, 400);
  };

  const handleSelectDiagnosticOpt = (index: number) => {
    if (selectedDiagnosticOpt !== null) return; // locked
    setSelectedDiagnosticOpt(index);
  };

  const handleNextDiagnostic = () => {
    if (selectedDiagnosticOpt === null) return;
    
    const isCorrect = activeDiagnosticQ.options[selectedDiagnosticOpt].correct;
    
    haptic();
    
    if (diagnosticStep === 'q1') {
      setDiagnosticQ1Correct(isCorrect);
      if (isCorrect) setCorrectAnswers(prev => prev + 1);
      setDiagnosticStep('q2');
    } else if (diagnosticStep === 'q2') {
      if (isCorrect) setCorrectAnswers(prev => prev + 1);
      setDiagnosticStep('q3');
    } else if (diagnosticStep === 'q3') {
      if (isCorrect) {
        setCorrectAnswers(prev => prev + 1);
      }
      setDiagnosticStep('result');
    }
    
    setSelectedDiagnosticOpt(null);
  };

  const finishPlacementAndContinue = () => {
    haptic();
    setDiagnosticActive(false);
    
    // Map correct answers score to skipped level
    let placedLevel = 1;
    if (correctAnswers === 1) placedLevel = 2; // Beginner advanced (Day 2)
    else if (correctAnswers === 2) placedLevel = 3; // Intermediate (Day 3 / Level 2 depending on track)
    else if (correctAnswers === 3) {
      // Advanced placement! Skip all Phase 1 foundations
      placedLevel = resolvedTrackId === 'business' ? 4 : 2; // business has level 2 starting at Day 4, ai has Level 2 (or completed) at Day 2
    }

    setAnswers(prev => ({ ...prev, placementChoice: 'test', experienceLevel: placedLevel }));
    
    // Resume standard onboarding flow
    advanceStep();
  };

  if (isFinishing) {
    return (
      <div className="w-full h-full bg-white text-zinc-800 flex flex-col items-center justify-center p-6 space-y-8">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
           className="w-24 h-24 rounded-full border-[2px] border-t-accent border-r-transparent border-b-accent border-l-transparent shadow-sm"
        />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">Analyzing Responses</h2>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Tailoring the T1GER Engine...</p>
        </div>
      </div>
    );
  }

  if (onboardingStage === 'landing') {
    return (
      <div className="w-full h-full bg-white text-zinc-800 flex flex-col px-6 pt-[calc(1.5rem+var(--safe-top-inset,env(safe-area-inset-top)))] pb-[calc(2.5rem+var(--safe-bottom-inset,env(safe-area-inset-bottom)))] relative z-50 overflow-hidden">
        
        <div className="flex-1 flex flex-col justify-center items-center text-center max-w-sm mx-auto w-full mt-4">
          
          {/* Gráfico Visual Superior */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 w-full relative flex justify-center"
          >
            {/* Glow de fondo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#FF6B00]/20 rounded-full blur-[60px]" />
            <T1gerInteractiveAvatar characterId="t1ger" emotion="PREDATOR" size={140} />
          </motion.div>

          {/* Logo y Propuesta de valor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="space-y-3"
          >
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-zinc-800">
              T1GER APP
            </h1>
            <h2 className="text-2xl font-bold tracking-tight leading-snug text-zinc-500">
              Aprende Negocios,<br />IA e Inversiones.
            </h2>
            <p className="text-sm font-semibold text-[#FF6B00] uppercase tracking-widest mt-2">
              Rápido y Letal.
            </p>
          </motion.div>
        </div>

        {/* Botones */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-sm mx-auto space-y-4 mt-8"
        >
          <button
            onClick={() => {
              haptic();
              setOnboardingStage('questions');
            }}
            className="w-full bg-[#FF6B00] text-[#050505] py-5 rounded-[2rem] font-black uppercase tracking-wide text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_8px_0_0_#CC5500]"
          >
            Comenzar <ArrowRight size={18} className="stroke-[3]" />
          </button>
          
          <button
            onClick={() => {
              haptic();
              onComplete?.();
            }}
            className="w-full bg-transparent text-zinc-800 border-2 border-zinc-200 py-5 rounded-[2rem] font-bold text-sm active:scale-[0.98] transition-all hover:bg-zinc-50"
          >
            Entrar al prototipo
          </button>
        </motion.div>
      </div>
    );
  }

  // ============================================================
  // ADAPTIVE PLACEMENT TEST SCREEN
  // ============================================================
  if (diagnosticActive) {
    const mentor = resolvedTrackId === 'ai'
      ? CHARACTER_CAST.l1ly
      : resolvedTrackId === 'investing'
        ? CHARACTER_CAST.eddy
        : CHARACTER_CAST.zar1;

    if (diagnosticStep === 'result') {
      const skippedLevelsText = correctAnswers === 3 
        ? 'Todos los módulos básicos de Fase 1' 
        : correctAnswers === 2 
          ? 'Nivel 1 básico (Primeras lecciones)' 
          : correctAnswers === 1 
            ? 'Conceptos introductorios del Día 1' 
            : 'Ninguno. Inicias desde las bases';

      const assignedRank = correctAnswers === 3 ? 'Apex Hunter' : correctAnswers === 2 ? 'Hunter Cub' : 'New Predator';

      return (
        <div className="w-full h-full bg-[#020204] text-zinc-800 flex flex-col justify-between pt-[calc(1.5rem+var(--safe-top-inset,env(safe-area-inset-top)))] pb-[calc(1.5rem+var(--safe-bottom-inset,env(safe-area-inset-bottom)))] px-6 relative z-50 overflow-hidden">
          {/* Neon Atmosphere */}
          <div 
            className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-10 pointer-events-none" 
            style={{ backgroundColor: mentor.accentColor }}
          />

          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <div className="mb-6">
              <T1gerInteractiveAvatar 
                characterId={mentor.id} 
                emotion={correctAnswers >= 2 ? 'PROUD' : 'DISAPPOINTED'} 
                size={160} 
              />
            </div>

            <span className="text-[10px] font-black font-mono bg-zinc-50 border px-3 py-1 rounded-full uppercase tracking-widest mb-3" style={{ color: mentor.accentColor, borderColor: `${mentor.accentColor}33` }}>
              Cuestionario Completado
            </span>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2 leading-none">
              Ubicación Calculada
            </h1>
            <p className="text-lg font-bold font-mono mb-6" style={{ color: mentor.accentColor }}>{correctAnswers}/3 ACIERTOS</p>

            <div className="w-full bg-zinc-50 border border-zinc-200 rounded-3xl p-5 text-left space-y-3 shadow-xl mb-6">
              <div>
                <span className="text-[8px] font-black font-mono text-zinc-500 uppercase tracking-wider block">Rango Asignado</span>
                <span className="text-sm font-black uppercase text-zinc-800 tracking-tight">{assignedRank}</span>
              </div>
              <div className="h-[1px] bg-zinc-50" />
              <div>
                <span className="text-[8px] font-black font-mono text-zinc-500 uppercase tracking-wider block">Módulos Omitidos</span>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: mentor.accentColor }}>{skippedLevelsText}</span>
              </div>
            </div>
          </div>

          <button
            onClick={finishPlacementAndContinue}
            className="w-full py-5 rounded-2xl btn-gamified-3d flex items-center justify-center gap-2 max-w-md mx-auto"
            style={{ 
              backgroundColor: mentor.accentColor, 
              color: '#020204',
              boxShadow: `0 8px 0 0 ${mentor.accentColor}cc, 0 8px 24px 0 ${mentor.glowColor}`
            }}
          >
            Continuar Onboarding <ArrowRight size={18} className="stroke-[3]" />
          </button>
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-[#020204] text-zinc-800 flex flex-col justify-between pt-[calc(1.5rem+var(--safe-top-inset,env(safe-area-inset-top)))] pb-[calc(1.5rem+var(--safe-bottom-inset,env(safe-area-inset-bottom)))] px-6 relative z-50 overflow-hidden">
        {/* Progress bar */}
        <div className="w-full h-2 bg-white shadow-sm rounded-full mb-10 overflow-hidden shadow-sm border-zinc-200 p-0.5">
          <motion.div 
            className="h-full rounded-full"
            style={{ backgroundColor: mentor.accentColor, boxShadow: `0 0 12px ${mentor.glowColor}` }}
            animate={{ width: `${(diagnosticStep === 'q1' ? 33 : diagnosticStep === 'q2' ? 66 : 100)}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          {/* Mascot asking question */}
          <div className="flex items-start gap-4 mb-8">
            <div className="relative flex-shrink-0">
              <T1gerInteractiveAvatar 
                characterId={mentor.id} 
                emotion={selectedDiagnosticOpt !== null ? 'PROUD' : 'RESTING'} 
                size={64} 
              />
            </div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, x: -10 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 15 }}
              className="bg-white border border-zinc-200 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-white after:border-l after:border-b after:border-zinc-200 after:rotate-45 after:-translate-y-1/2"
              style={{ boxShadow: `0 4px 20px ${mentor.glowColor}` }}
            >
              <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: mentor.accentColor }}>
                {mentor.name} ({mentor.title}) — {diagnosticStep.toUpperCase()}
              </span>
              <p className="text-sm font-bold leading-snug text-zinc-800 font-sans">
                {activeDiagnosticQ.question}
              </p>
            </motion.div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {activeDiagnosticQ.options.map((opt, i) => {
              const isSelected = selectedDiagnosticOpt === i;

              return (
                <button
                  key={i}
                  onClick={() => handleSelectDiagnosticOpt(i)}
                  className={`w-full p-4 rounded-[1.5rem] border text-left font-bold text-xs transition-all duration-300 flex items-center justify-between active:scale-[0.98] ${
                    isSelected ? '' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-200 hover:bg-zinc-50 text-zinc-500'
                  }`}
                  style={isSelected ? {
                    backgroundColor: `${mentor.accentColor}0d`,
                    borderColor: mentor.accentColor,
                    color: mentor.accentColor,
                    boxShadow: `0 0 15px ${mentor.glowColor}`
                  } : {}}
                >
                  <span className="leading-snug max-w-[85%]">{opt.label}</span>
                  <div 
                    className={`w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[9px] font-black flex-shrink-0`}
                    style={isSelected ? {
                      borderColor: mentor.accentColor,
                      backgroundColor: mentor.accentColor,
                      color: '#020204'
                    } : {
                      borderColor: '#3f3f46',
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      color: '#71717a'
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full max-w-sm mx-auto mt-8">
          <button
            disabled={selectedDiagnosticOpt === null}
            onClick={handleNextDiagnostic}
            className="w-full py-5 rounded-2xl btn-gamified-3d flex items-center justify-center gap-2 cursor-pointer"
            style={selectedDiagnosticOpt !== null ? {
              backgroundColor: mentor.accentColor,
              color: '#020204',
              boxShadow: `0 8px 0 0 ${mentor.accentColor}cc, 0 8px 24px 0 ${mentor.glowColor}`
            } : {}}
          >
            Siguiente Pregunta <ArrowRight size={18} className="stroke-[3]" />
          </button>
        </div>
      </div>
    );
  }

  // Render Archetype Reveal screen
  if (onboardingStage === 'archetype') {
    return (
      <OnboardingArchetypeReveal
        track={resolvedTrackId}
        score={correctAnswers}
        onNext={() => setOnboardingStage('microlesson')}
      />
    );
  }

  // Render Fast Offline Micro-Lesson screen
  if (onboardingStage === 'microlesson') {
    return (
      <OnboardingMicroLesson
        track={resolvedTrackId}
        onComplete={(xpEarned, coinsEarned) => {
          setIsFinishing(true);
          submitAnswers(answers.experienceLevel, xpEarned, coinsEarned);
          if (onComplete) {
            onComplete();
          }
        }}
      />
    );
  }

  // ============================================================
  // STANDARD QUESTIONS SCREEN
  // ============================================================
  return (
    <div className="w-full h-full bg-white text-zinc-800 flex flex-col pt-[calc(2.5rem+var(--safe-top-inset,env(safe-area-inset-top)))] pb-[calc(1rem+var(--safe-bottom-inset,env(safe-area-inset-bottom)))] px-6 relative z-50 overflow-hidden">
      {/* Back Button & Progress Bar */}
      <div className="flex items-center gap-4 mb-8 z-20 relative shrink-0">
        <button 
          onClick={() => { haptic(); if(stepIndex > 0) { setStepIndex(currentStep => currentStep - 1); } else setOnboardingStage('landing'); }}
          className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-200 active:scale-95"
        >
          <ArrowRight className="w-5 h-5 text-zinc-800 rotate-180" />
        </button>
        <div className="flex-1 h-1.5 bg-zinc-50 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#FF6B00] rounded-full shadow-[0_0_10px_#FF6B00]"
            animate={{ width: `${((stepIndex + 1) / QUESTIONS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
          />
        </div>
      </div>

      <div className="flex-1 relative w-full min-h-0 overflow-hidden">
        <div
          key={stepIndex}
          className="relative flex flex-col w-full h-full overflow-y-auto hide-scrollbar pr-0.5"
        >
          {!['graph', 'scurve', 'interstitial', 'barchart', 'socialProofReviews', 'privacyTrust', 'connectNotifications', 'hardcoreMode', 'rollover', 'generatePlanIntro', 'loadingSimulation', 'planReady', 'saveProgress', 'paywallIntro', 'referralCode'].includes(currentQuestion.type) && (
            <div className="mb-6 space-y-4 shrink-0">
              {/* Duolingo 3D Tiger Mascot Companion with Speech Bubble */}
              <TigerMascot
                pose={stepIndex % 2 === 0 ? 'welcome' : 'coaching'}
                speech={
                  currentQuestion.id === 'goal'
                    ? (isEs ? "¡Hola! Bienvenido a T1GER. ¿Cuál es tu objetivo principal?" : "Welcome to T1GER! What is your main goal?")
                    : currentQuestion.id === 'placementChoice'
                      ? (isEs ? "¿Desde qué nivel prefieres comenzar tu ruta?" : "Where would you like to start your path?")
                      : currentQuestion.id === 'timeCommitment'
                        ? (isEs ? "¿Cuántos minutos al día entrenaremos tu mente?" : "How many minutes a day will we train?")
                        : currentQuestion.id === 'obstacles'
                          ? (isEs ? "¿Cuál ha sido tu mayor obstáculo en el pasado?" : "What was your main obstacle in the past?")
                          : (isEs ? "¡Excelente! Sigamos configurando tu plan personalizado." : "Great! Let's build your tailored plan.")
                }
              />
            </div>
          )}

          <div className="space-y-3.5 flex-1 min-h-fit pb-4 flex flex-col justify-start sm:justify-center">
            
            {/* 3D VISUAL OPTIONS RENDER (DUOLINGO STYLE) */}
            {(!currentQuestion.type || currentQuestion.type === 'options') && currentQuestion.options?.map((opt: any) => {
              const isSelected = answers[currentQuestion.id] === opt.id;
              const label = isEs ? (opt.labelEs || opt.label) : opt.label;
              const description = isEs ? (opt.descriptionEs || opt.description) : opt.description;

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full text-left p-4.5 rounded-2xl transition-all duration-200 flex items-center justify-between group cursor-pointer border-2 border-b-4 ${
                    isSelected 
                      ? 'bg-[#FF7300] text-white border-[#CC5C00] shadow-lg active:translate-y-1' 
                      : 'bg-white text-zinc-800 border-zinc-200 border-b-zinc-300 hover:bg-zinc-50 active:translate-y-1'
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {opt.icon && (
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-b-4 text-white shadow-sm ${
                        opt.badgeBg || (isSelected ? 'bg-[#FF7300] border-[#CC5C00]' : 'bg-zinc-800 border-zinc-900')
                      }`}>
                        {React.cloneElement(opt.icon as React.ReactElement<any>, { className: 'w-6 h-6 stroke-[2.5]' })}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-black text-sm tracking-wide uppercase italic">{label}</h3>
                      {description && (
                        <p className={`text-[11px] font-semibold mt-0.5 leading-snug ${isSelected ? 'text-white/90' : 'text-zinc-500'}`}>
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className={`ml-3 h-5 w-5 shrink-0 transition-transform ${isSelected ? 'translate-x-1 text-white' : 'group-hover:translate-x-1 text-zinc-400'}`} />
                </button>
              );
            })}

              {currentQuestion.type === 'wheel' && (
                <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in zoom-in duration-500">
                  <WheelPicker 
                    options={currentQuestion.wheelOptions || []}
                    value={answers[currentQuestion.id] || 2000}
                    onChange={(val) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }))}
                  />
                  <button onClick={() => { haptic(); advanceStep(); }} className="mt-8 w-full py-5 rounded-[2rem] bg-white text-black font-black uppercase tracking-wide active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">Continue</button>
                </div>
              )}

              {currentQuestion.type === 'slider' && (
                <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in zoom-in duration-500">
                  <RulerSlider 
                    min={currentQuestion.min || 0}
                    max={currentQuestion.max || 100}
                    step={currentQuestion.step || 1}
                    value={answers[currentQuestion.id] || 15}
                    onChange={(val) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }))}
                    formatValue={(val) => `${val} min`}
                  />
                  <button onClick={() => { haptic(); advanceStep(); }} className="mt-8 w-full py-5 rounded-[2rem] bg-white text-black font-black uppercase tracking-wide active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">Continue</button>
                </div>
              )}

              {currentQuestion.type === 'graph' && (
                <div className="w-full flex-1 flex flex-col justify-center">
                  <ExponentialGraph />
                  <button onClick={() => { haptic(); advanceStep(); }} className="mt-8 w-full py-5 rounded-[2rem] bg-[#FF6B00] text-black font-black uppercase tracking-wide active:scale-95 transition-transform shadow-[0_8px_0_0_#CC5500]">Continue</button>
                </div>
              )}

              {currentQuestion.type === 'pace' && (
                <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in zoom-in duration-500">
                  <PaceSlider 
                    value={answers[currentQuestion.id] || 0}
                    onChange={(val) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }))}
                  />
                  <button onClick={() => { haptic(); advanceStep(); }} className="mt-8 w-full py-5 rounded-[2rem] bg-white text-black font-black uppercase tracking-wide active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">Continue</button>
                </div>
              )}

              {currentQuestion.type === 'interstitial' && (
                <div className="w-full flex-1 flex flex-col justify-center">
                  <InterstitialHype timeCommitment={answers.timeCommitment} />
                  <button onClick={() => { haptic(); advanceStep(); }} className="mt-8 w-full py-5 rounded-[2rem] bg-white text-black font-black uppercase tracking-wide active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">Continue</button>
                </div>
              )}

              {currentQuestion.type === 'scurve' && (
                <div className="w-full flex-1 flex flex-col justify-center">
                  <SCurveGraph />
                  <button onClick={() => { haptic(); advanceStep(); }} className="mt-8 w-full py-5 rounded-[2rem] bg-white text-black font-black uppercase tracking-wide active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">Continue</button>
                </div>
              )}

              {currentQuestion.type === 'barchart' && (
                <div className="w-full flex-1 flex flex-col justify-center">
                  <BarChartComparison />
                  <button onClick={() => { haptic(); advanceStep(); }} className="mt-8 w-full py-5 rounded-[2rem] bg-[#FF6B00] text-black font-black uppercase tracking-wide active:scale-95 transition-transform shadow-[0_8px_0_0_#CC5500]">Continue</button>
                </div>
              )}

              {currentQuestion.type === 'socialProofReviews' && (
                <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in zoom-in duration-500">
                  <SocialProofReviews />
                  <button onClick={() => { haptic(); advanceStep(); }} className="mt-8 w-full py-5 rounded-[2rem] bg-white text-black font-black uppercase tracking-wide active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">Continue</button>
                </div>
              )}

              {currentQuestion.type === 'privacyTrust' && (
                <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in zoom-in duration-500">
                  <PrivacyTrust />
                  <button onClick={() => { haptic(); advanceStep(); }} className="mt-8 w-full py-5 rounded-[2rem] bg-white text-black font-black uppercase tracking-wide active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">Continue</button>
                </div>
              )}

              {currentQuestion.type === 'connectNotifications' && (
                <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in zoom-in duration-500">
                  <ConnectNotifications />
                  <div className="mt-8 flex flex-col gap-3">
                    <button onClick={() => { haptic(); advanceStep(); }} className="w-full py-5 rounded-[2rem] bg-white text-black font-black uppercase tracking-wide active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">Continue</button>
                    <button onClick={() => { haptic(); advanceStep(); }} className="w-full py-5 rounded-[2rem] bg-transparent border border-zinc-200 text-zinc-800 font-bold uppercase tracking-wide active:scale-95 transition-transform">Not now</button>
                  </div>
                </div>
              )}

              {currentQuestion.type === 'hardcoreMode' && (
                <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in zoom-in duration-500">
                  <HardcoreModeToggle />
                  <div className="mt-8 flex gap-3">
                    <button onClick={() => { haptic(); setAnswers(prev => ({...prev, hardcore: false})); advanceStep(); }} className="flex-1 py-5 rounded-[2rem] bg-white border border-zinc-200 text-zinc-800 font-bold uppercase tracking-wide active:scale-95 transition-transform">No</button>
                    <button onClick={() => { haptic(); setAnswers(prev => ({...prev, hardcore: true})); advanceStep(); }} className="flex-1 py-5 rounded-[2rem] bg-[#FF6B00] text-black font-black uppercase tracking-wide active:scale-95 transition-transform shadow-[0_8px_0_0_#CC5500]">Yes</button>
                  </div>
                </div>
              )}

              {currentQuestion.type === 'rollover' && (
                <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in zoom-in duration-500">
                  <RolloverMissions />
                  <div className="mt-8 flex gap-3">
                    <button onClick={() => { haptic(); setAnswers(prev => ({...prev, rollover: false})); advanceStep(); }} className="flex-1 py-5 rounded-[2rem] bg-white border border-zinc-200 text-zinc-800 font-bold uppercase tracking-wide active:scale-95 transition-transform">No</button>
                    <button onClick={() => { haptic(); setAnswers(prev => ({...prev, rollover: true})); advanceStep(); }} className="flex-1 py-5 rounded-[2rem] bg-white text-black font-black uppercase tracking-wide active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">Yes</button>
                  </div>
                </div>
              )}

              {currentQuestion.type === 'generatePlanIntro' && (
                <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in zoom-in duration-500">
                  <GeneratePlanIntro />
                  <button onClick={() => { haptic(); advanceStep(); }} className="mt-8 w-full py-5 rounded-[2rem] bg-white text-black font-black uppercase tracking-wide active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">Continue</button>
                </div>
              )}

              {currentQuestion.type === 'loadingSimulation' && (
                <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in duration-500">
                  <LoadingPlanSimulation onComplete={() => { haptic(); advanceStep(); }} />
                </div>
              )}

              {currentQuestion.type === 'planReady' && (
                <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in zoom-in duration-500">
                  <CustomPlanReady />
                  <button onClick={() => { haptic(); advanceStep(); }} className="mt-8 w-full py-5 rounded-[2rem] bg-white text-black font-black uppercase tracking-wide active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">Let's get started!</button>
                </div>
              )}

              {currentQuestion.type === 'paywallIntro' && (
                <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in zoom-in duration-500">
                  <PaywallIntro />
                  <div className="mt-8 flex flex-col items-center space-y-4">
                    <button onClick={() => { haptic(); advanceStep(); }} className="w-full py-5 rounded-[2rem] bg-white text-black font-black uppercase tracking-wide active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">Continue</button>
                    <span className="text-zinc-500 text-xs font-semibold">Just $29.99 per year ($2.49/mo)</span>
                  </div>
                </div>
              )}

              {currentQuestion.type === 'saveProgress' && (
                <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in zoom-in duration-500">
                  <SaveProgressAuth 
                    onSignIn={() => { haptic(); googleSignIn().then(() => advanceStep()).catch(e => { console.error(e); advanceStep(); }) }}
                    onSkip={() => { haptic(); advanceStep(); }}
                  />
                </div>
              )}

              {currentQuestion.type === 'referralCode' && (
                <div className="w-full flex-1 flex flex-col justify-center animate-in fade-in zoom-in duration-500">
                  <ReferralCode 
                    onSubmit={(code) => { haptic(); setAnswers(prev => ({...prev, referralCode: code})); advanceStep(); }}
                    onSkip={() => { haptic(); advanceStep(); }}
                  />
                </div>
              )}
              
            </div>
        </div>
      </div>
    </div>
  );
};
