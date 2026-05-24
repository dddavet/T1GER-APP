import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { type TrackType } from '../services/missionBank';
import { Brain, Target, Zap, ChevronRight, PlaySquare, FileText, Blocks, Trophy, Sparkles, Check, ArrowRight, BookOpen } from 'lucide-react';

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

const QUESTIONS = [
  {
    id: 'goal',
    title: 'What brings you to T1GER?',
    subtitle: 'We will personalize your initial curriculum.',
    options: [
      { id: 'startup', label: 'Build a Startup', icon: <Target className="w-5 h-5" /> },
      { id: 'investing', label: 'Master Investing', icon: <Zap className="w-5 h-5" /> },
      { id: 'career', label: 'Grow My Career', icon: <Brain className="w-5 h-5" /> },
      { id: 'freedom', label: 'Financial Freedom', icon: <Target className="w-5 h-5" /> }
    ]
  },
  {
    id: 'placementChoice',
    title: 'Choose your entry point',
    subtitle: 'Beginners start at Level 1. Advanced users can test out of basics.',
    options: [
      { id: 'beginner', label: 'I am a complete beginner', description: 'Start from Level 1 foundations', icon: <BookOpen className="w-5 h-5 text-accent" /> },
      { id: 'test', label: 'Take the Placement Challenge', description: 'Test your skills to skip introductory levels', icon: <Trophy className="w-5 h-5 text-accent" /> }
    ]
  },
  {
    id: 'ageRange',
    title: 'How old are you?',
    subtitle: 'This helps our AI tailor the analogies and tone.',
    options: [
      { id: 'under18', label: '17 or younger' },
      { id: '18-24', label: '18 - 24' },
      { id: '25-34', label: '25 - 34' },
      { id: '35-44', label: '35 - 44' },
      { id: '45+', label: '45 or older' }
    ]
  },
  {
    id: 'learningStyle',
    title: 'You hit a deeply complex problem. What is your first instinct?',
    subtitle: 'This will customize how the T1GER Engine feeds you missions.',
    options: [
      { id: 'text', label: 'Look for a written guide', description: 'I want to read the step-by-step breakdown.', icon: <FileText className="w-5 h-5 text-[var(--accent-main)]" /> },
      { id: 'visual', label: 'Watch someone solve it', description: 'I like seeing a demonstration or diagram.', icon: <PlaySquare className="w-5 h-5 text-[#FF6B00]" /> },
      { id: 'interactive', label: 'Start experimenting', description: 'I learn by trying, failing, and adapting.', icon: <Blocks className="w-5 h-5 text-[#FF6B00]" /> }
    ]
  }
];

export const OnboardingFlow: React.FC = () => {
  const { updateAppUser } = useAuth();
  const { skipDaysForPlacement } = useBrain();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isFinishing, setIsFinishing] = useState(false);

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
    if (goal === 'startup') return 'business';
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
    if (stepIndex < QUESTIONS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setIsFinishing(true);
      submitAnswers();
    }
  };

  const submitAnswers = (placedLevelOverride?: number) => {
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
      onboardingComplete: true
    });
  };

  const handleSelect = (optionId: string) => {
    haptic();
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
    
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
      <div className="w-full h-full bg-[#050505] text-white flex flex-col items-center justify-center p-6 space-y-8">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
           className="w-24 h-24 rounded-full border-[2px] border-t-accent border-r-transparent border-b-accent border-l-transparent shadow-3d-accent"
        />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">Analyzing Responses</h2>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Tailoring the T1GER Engine...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ADAPTIVE PLACEMENT TEST SCREEN
  // ============================================================
  if (diagnosticActive) {
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
        <div className="w-full h-full bg-[#020204] text-white flex flex-col justify-between pt-16 pb-12 px-6 relative z-50 overflow-hidden">
          {/* Neon Atmosphere */}
          <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full blur-[100px] bg-[var(--accent-glow)] opacity-10 pointer-events-none" />

          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            {/* Dynamic mascot celebrating */}
            <motion.img 
              src={correctAnswers >= 2 ? "/lion_happy.png" : "/lion_sad.png"} 
              alt="T1GER Mascot" 
              className="w-40 h-40 object-contain drop-shadow-[0_0_20px_var(--accent-glow)] mb-6"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />

            <span className="text-[10px] font-black font-mono text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full uppercase tracking-widest mb-3">
              Cuestionario Completado
            </span>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2 leading-none">
              Ubicación Calculada
            </h1>
            <p className="text-lg font-bold text-accent font-mono mb-6">{correctAnswers}/3 ACIERTOS</p>

            <div className="w-full bg-white/[0.02] border border-white/10 rounded-3xl p-5 text-left space-y-3 shadow-xl mb-6">
              <div>
                <span className="text-[8px] font-black font-mono text-zinc-500 uppercase tracking-wider block">Rango Asignado</span>
                <span className="text-sm font-black uppercase text-white tracking-tight">{assignedRank}</span>
              </div>
              <div className="h-[1px] bg-white/5" />
              <div>
                <span className="text-[8px] font-black font-mono text-zinc-500 uppercase tracking-wider block">Módulos Omitidos</span>
                <span className="text-xs font-semibold text-accent uppercase tracking-wide">{skippedLevelsText}</span>
              </div>
            </div>
          </div>

          <button
            onClick={finishPlacementAndContinue}
            className="w-full py-5 rounded-2xl btn-gamified-3d flex items-center justify-center gap-2 max-w-md mx-auto"
          >
            Continuar Onboarding <ArrowRight size={18} className="stroke-[3]" />
          </button>
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-[#020204] text-white flex flex-col justify-between pt-16 pb-12 px-6 relative z-50 overflow-hidden">
        {/* Progress bar */}
        <div className="w-full h-2 liquid-glass rounded-full mb-10 overflow-hidden shadow-3d border-white/10 p-0.5">
          <motion.div 
            className="h-full bg-accent rounded-full shadow-3d-accent"
            animate={{ width: `${(diagnosticStep === 'q1' ? 33 : diagnosticStep === 'q2' ? 66 : 100)}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          {/* Mascot asking question */}
          <div className="flex items-start gap-4 mb-8">
            <img 
              src="/lion_happy.png" 
              alt="Lion T1GER" 
              className="w-16 h-16 object-contain flex-shrink-0"
            />
            <div className="bg-[#0f0f13] border border-white/10 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-[#0f0f13] after:border-l after:border-b after:border-white/10 after:rotate-45 after:-translate-y-1/2">
              <span className="text-[9px] font-black uppercase tracking-widest text-accent block mb-1">
                T1GER Placement Challenge — {diagnosticStep.toUpperCase()}
              </span>
              <p className="text-sm font-bold leading-snug text-white font-sans">
                {activeDiagnosticQ.question}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {activeDiagnosticQ.options.map((opt, i) => {
              const isSelected = selectedDiagnosticOpt === i;
              
              let cls = 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04] text-zinc-300';
              if (isSelected) {
                cls = 'bg-accent/5 border-accent text-accent shadow-[0_0_15px_rgba(204,255,0,0.08)]';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelectDiagnosticOpt(i)}
                  className={`w-full p-4 rounded-[1.5rem] border text-left font-bold text-xs transition-all duration-300 flex items-center justify-between active:scale-[0.98] ${cls}`}
                >
                  <span className="leading-snug max-w-[85%]">{opt.label}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[9px] font-black flex-shrink-0 ${
                    isSelected 
                      ? 'border-accent bg-accent text-black' 
                      : 'border-zinc-700 bg-black/40 text-zinc-500'
                  }`}>
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
          >
            Siguiente Pregunta <ArrowRight size={18} className="stroke-[3]" />
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // STANDARD QUESTIONS SCREEN
  // ============================================================
  return (
    <div className="w-full h-full bg-[#050505] text-white flex flex-col pt-16 pb-8 px-6 relative z-50 overflow-hidden">
      {/* 3D Progress Bar */}
      <div className="w-full h-2 liquid-glass rounded-full mb-10 overflow-hidden shadow-3d border-white/10 p-0.5">
        <motion.div 
          className="h-full bg-accent rounded-full shadow-3d-accent"
          animate={{ width: `${((stepIndex + 1) / QUESTIONS.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "circOut" }}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-3">
          {currentQuestion.title}
        </h1>
        <p className="text-xs font-medium text-zinc-500 mb-10 leading-relaxed uppercase tracking-wider">
          {currentQuestion.subtitle}
        </p>

        <div className="space-y-4 flex-1 overflow-y-auto pb-4 hide-scrollbar">
          
          {/* OPTIONS RENDER */}
          {currentQuestion.options?.map((opt) => {
            const isSelected = answers[currentQuestion.id] === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-full text-left p-5 rounded-[2rem] transition-all duration-300 flex items-center justify-between group active:scale-[0.98] shadow-3d border border-white/10
                  ${isSelected 
                    ? 'liquid-glass-accent shadow-3d-accent border-accent/20' 
                    : 'liquid-glass hover:bg-white/[0.08]'
                  }`}
              >
                <div className="flex items-center gap-4">
                  {opt.icon && (
                    <div className="w-12 h-12 rounded-[1.5rem] bg-black/40 flex items-center justify-center shadow-inner border border-white/5">
                      {opt.icon}
                    </div>
                  )}
                  <div>
                    <h3 className="font-black text-sm tracking-tight uppercase">{opt.label}</h3>
                    {'description' in opt && (
                      <p className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-tight">{opt.description}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-zinc-600 transition-transform ${isSelected ? 'translate-x-1 text-white' : 'group-hover:translate-x-1'}`} />
              </button>
            );
          })}
          
        </div>
      </div>
    </div>
  );
};
