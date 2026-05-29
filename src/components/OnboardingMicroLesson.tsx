import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Check, Award, BookOpen, Star } from 'lucide-react';

interface LessonData {
  trackName: string;
  conceptTitle: string;
  conceptText: string;
  mentorTip: string;
  puzzleQuestion: string;
  options: { label: string; correct: boolean; explanation: string }[];
}

const MICRO_LESSONS: Record<'ai' | 'business' | 'investing', LessonData> = {
  ai: {
    trackName: 'Inteligencia Artificial',
    conceptTitle: 'One-Shot Prompting',
    conceptText: 'El One-Shot Prompting consiste en proveer exactamente un ejemplo real de Entrada (Input) y Salida (Output) esperado dentro de tu instrucción para que la IA replique ese patrón con precisión matemática sin cometer fallos.',
    mentorTip: 'En lugar de ordenarle a la IA "escribe esto formalmente", dale un ejemplo: "Mensaje: Hola -> Formal: Estimado usuario. Así nunca fallará el tono.',
    puzzleQuestion: 'Quieres que la IA convierta nombres a mayúsculas estrictas. ¿Cuál de estos prompts implementa correctamente One-Shot Prompting?',
    options: [
      { 
        label: 'IA, por favor convierte el nombre "david" a mayúsculas ahora.', 
        correct: false, 
        explanation: 'Esto es una orden directa (Zero-Shot). La IA puede inventar el formato.' 
      },
      { 
        label: "Entrada: 'david' -> Salida: 'DAVID'\nEntrada: 'maria' -> Salida:", 
        correct: true, 
        explanation: '¡Excelente! Le diste un ejemplo completo del patrón a seguir. La IA sabrá exactamente qué hacer.' 
      },
      { 
        label: 'Escribe una función de Python usando el método .upper() sobre strings.', 
        correct: false, 
        explanation: 'Esto es código de programación, no un patrón de prompt conversacional.' 
      }
    ]
  },
  business: {
    trackName: 'Modelos de Negocios',
    conceptTitle: 'Ecuación de Valor',
    conceptText: 'Para que tu producto sea irresistible, debes aumentar el valor percibido. La forma más rápida de lograrlo es Reduciendo a Cero el Tiempo de Entrega (Time Delay) y el Esfuerzo y Sacrificio que el cliente debe hacer para obtener el resultado.',
    mentorTip: 'La gente no quiere comprar una membresía de gimnasio y sudar 6 meses (alto esfuerzo y tiempo). Quieren pastillas mágicas. Acércate lo más posible a esa "magia".',
    puzzleQuestion: 'Estás vendiendo asesoría de fitness online. ¿Cuál oferta tiene mayor valor percibido al reducir a cero el esfuerzo y el tiempo?',
    options: [
      { 
        label: 'Una guía PDF de 200 páginas con recetas saludables y ejercicios para que te organices solo.', 
        correct: false, 
        explanation: 'Esto requiere demasiado esfuerzo y sacrificio del cliente para leer y organizarse.' 
      },
      { 
        label: 'Entrenamiento presencial riguroso 5 veces por semana en un gimnasio comercial durante 6 meses.', 
        correct: false, 
        explanation: 'Tiene un Time Delay muy alto y exige un gran nivel de esfuerzo físico antes de ver resultados.' 
      },
      { 
        label: 'Preparamos y enviamos las 7 comidas saludables optimizadas a tu puerta semanalmente en 24 horas.', 
        correct: true, 
        explanation: '¡Sublime! Eliminas por completo el esfuerzo de cocinar/comprar y aceleras el tiempo de inicio al instante.' 
      }
    ]
  },
  investing: {
    trackName: 'Finanzas e Inversiones',
    conceptTitle: 'Interés Compuesto',
    conceptText: 'El Interés Compuesto es la fuerza de acumulación de riqueza más poderosa. Funciona reinvirtiendo los intereses que ganas en tu inversión inicial, logrando que los nuevos intereses se calculen sobre un capital cada vez mayor.',
    mentorTip: 'Es un efecto bola de nieve. El secreto no es la cantidad de dinero inicial, sino la consistencia del tiempo y dejar que los intereses trabajen sin retirarlos.',
    puzzleQuestion: 'Inviertes $1,000 USD al 10% anual de interés compuesto. ¿Cuánto dinero tienes acumulado al final del segundo año?',
    options: [
      { 
        label: '$1,100 USD (ganas $100 el primer año y nada el segundo).', 
        correct: false, 
        explanation: 'Esto significaría que no ganaste nada de interés en el segundo año.' 
      },
      { 
        label: '$1,200 USD (ganas $100 fijos cada año sin reinversión).', 
        correct: false, 
        explanation: 'Esto es Interés Simple. Retiraste las ganancias en lugar de dejar que generaran más dinero.' 
      },
      { 
        label: '$1,210 USD (ganas $100 el año 1, y reinviertes sumando $110 adicionales el año 2).', 
        correct: true, 
        explanation: '¡Matemático! En el año 2, ganas el 10% sobre los $1,100 acumulados, ganando $10 extras gracias a la reinversión.' 
      }
    ]
  }
};

interface OnboardingMicroLessonProps {
  track: 'business' | 'investing' | 'ai';
  onComplete: (xpEarned: number, coinsEarned: number) => void;
}

export const OnboardingMicroLesson: React.FC<OnboardingMicroLessonProps> = ({ track, onComplete }) => {
  const lesson = MICRO_LESSONS[track];
  const [stage, setStage] = useState<'learn' | 'puzzle' | 'success'>('learn');
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  
  // Gold Coins Animation Array
  const [coins, setCoins] = useState<{ id: number; left: number; delay: number; duration: number }[]>([]);

  const haptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsWrong(false);
  };

  const handleVerify = () => {
    if (selectedOpt === null || isAnswered) return;

    const opt = lesson.options[selectedOpt];
    haptic();

    if (opt.correct) {
      setIsAnswered(true);
      setFeedbackText(opt.explanation);
      
      // Spawn falling gold coins particle effect!
      const spawnedCoins = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: Math.random() * 95, // % left
        delay: Math.random() * 0.8, // seconds
        duration: 1.5 + Math.random() * 1.0 // seconds
      }));
      setCoins(spawnedCoins);
      
      // Complete after delay
      setTimeout(() => {
        setStage('success');
      }, 1500);
    } else {
      setIsWrong(true);
      setFeedbackText(opt.explanation);
      // Vibrate shake haptic
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([50, 50, 50]);
      }
    }
  };

  const handleClaim = () => {
    haptic();
    onComplete(50, 25);
  };

  return (
    <div className="w-full h-full bg-[#020204] text-white flex flex-col justify-between pt-[calc(1rem+var(--safe-top-inset,env(safe-area-inset-top)))] pb-[calc(1.5rem+var(--safe-bottom-inset,env(safe-area-inset-bottom)))] px-6 relative z-50 overflow-hidden">
      
      {/* COINS SHOWER LAYER */}
      <AnimatePresence>
        {coins.length > 0 && stage !== 'success' && (
          <div className="absolute inset-0 pointer-events-none z-[999] overflow-hidden">
            {coins.map((coin) => (
              <motion.div
                key={coin.id}
                initial={{ y: -50, x: `${coin.left}vw`, rotate: 0, opacity: 1 }}
                animate={{ y: '110vh', rotate: 360 * 3, opacity: [1, 1, 0] }}
                transition={{
                  duration: coin.duration,
                  delay: coin.delay,
                  ease: 'linear'
                }}
                className="absolute w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center border border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)] font-mono text-[9px] font-black text-amber-900"
              >
                $
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* STAGE: LEARN */}
      {stage === 'learn' && (
        <div className="flex-1 flex flex-col justify-between h-full">
          <div>
            {/* Header progress info */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[8px] font-black font-mono text-zinc-500 uppercase tracking-widest">
                MISIÓN DE INDUCCIÓN
              </span>
              <span className="text-[8px] font-mono font-black text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
                Día 1 Fundaciones
              </span>
            </div>

            <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-1 text-white">
              {lesson.conceptTitle}
            </h1>
            <span className="text-[10px] font-mono text-accent uppercase tracking-wider block mb-6">
              Track {lesson.trackName}
            </span>

            {/* Core Concept Card */}
            <motion.div 
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 shadow-2xl space-y-4"
            >
              <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent">
                <BookOpen size={20} />
              </div>
              <p className="text-xs text-zinc-300 font-medium leading-relaxed font-sans">
                {lesson.conceptText}
              </p>
            </motion.div>
          </div>

          {/* Mentor Mascot speech bubble */}
          <div className="flex items-end gap-3 my-6 max-w-md w-full">
            <img 
              src="/lion_happy.png" 
              alt="Mascot" 
              className="w-16 h-16 object-contain flex-shrink-0 animate-bounce"
            />
            <div className="bg-[#0f0f13] border border-white/10 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:bottom-4 after:w-4 after:h-4 after:bg-[#0f0f13] after:border-l after:border-b after:border-white/10 after:rotate-45 after:-translate-y-1/2">
              <span className="text-[8px] font-black uppercase tracking-widest text-accent block mb-0.5">T1GER CONSEJO</span>
              <p className="text-[11px] font-semibold leading-relaxed text-zinc-300 font-sans">
                "{lesson.mentorTip}"
              </p>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => { haptic(); setStage('puzzle'); }}
            className="w-full py-5 rounded-2xl btn-gamified-3d flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97]"
          >
            Afrontar Desafío Técnico <ArrowRight size={18} className="stroke-[3]" />
          </button>
        </div>
      )}

      {/* STAGE: PUZZLE */}
      {stage === 'puzzle' && (
        <div className="flex-1 flex flex-col justify-between h-full">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] font-black font-mono text-zinc-500 uppercase tracking-widest">
                MICRO-RETO COGNITIVO
              </span>
              <span className="text-[8px] font-mono font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full uppercase tracking-widest inline-flex items-center gap-1">
                <Star size={8} className="fill-amber-400 text-amber-400" /> +50 XP
              </span>
            </div>

            <h2 className="text-lg font-black uppercase text-white tracking-tight leading-snug mb-6">
              {lesson.puzzleQuestion}
            </h2>

            {/* Selection Options */}
            <div className="space-y-3">
              {lesson.options.map((opt, i) => {
                const isSelected = selectedOpt === i;
                
                let optionStyle = 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.03] text-zinc-300';
                if (isSelected) {
                  if (isAnswered && opt.correct) {
                    optionStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.08)]';
                  } else if (isWrong && isSelected) {
                    optionStyle = 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.08)]';
                  } else {
                    optionStyle = 'bg-accent/5 border-accent text-accent shadow-[0_0_15px_rgba(204,255,0,0.08)]';
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(i)}
                    className={`w-full p-4 rounded-[1.5rem] border text-left font-bold text-xs transition-all duration-300 flex items-center justify-between active:scale-[0.98] ${optionStyle} ${
                      isWrong && isSelected ? 'animate-shake' : ''
                    }`}
                  >
                    <span className="leading-snug max-w-[85%] whitespace-pre-line">{opt.label}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[9px] font-black flex-shrink-0 ${
                      isSelected 
                        ? isAnswered && opt.correct 
                          ? 'border-emerald-500 bg-emerald-500 text-white' 
                          : isWrong && isSelected 
                            ? 'border-rose-500 bg-rose-500 text-white' 
                            : 'border-accent bg-accent text-black' 
                        : 'border-zinc-700 bg-black/40 text-zinc-500'
                    }`}>
                      {isAnswered && opt.correct && isSelected ? <Check size={10} className="stroke-[3]" /> : String.fromCharCode(65 + i)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Section */}
          <div className="my-4">
            <AnimatePresence mode="wait">
              {(isAnswered || isWrong) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-[1.5rem] border flex items-start gap-3 ${
                    isAnswered 
                      ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' 
                      : 'bg-rose-950/20 border-rose-900/40 text-rose-400'
                  }`}
                >
                  <img 
                    src={isAnswered ? "/lion_proud.png" : "/lion_sad.png"} 
                    alt="Mascot Feedback" 
                    className="w-12 h-12 object-contain flex-shrink-0"
                  />
                  <div className="flex-1 text-left font-sans">
                    <span className="text-[8px] font-black uppercase tracking-wider block mb-0.5">
                      {isAnswered ? '¡ACIERTO TOTAL!' : 'RESPUESTA INCORRECTA'}
                    </span>
                    <p className="text-[10px] font-medium leading-relaxed">
                      {feedbackText}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Verify / Action Button */}
          <div className="w-full max-w-md mx-auto">
            <button
              disabled={selectedOpt === null || isAnswered}
              onClick={handleVerify}
              className="w-full py-5 rounded-2xl btn-gamified-3d flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comprobar Respuesta <Check size={18} className="stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE: SUCCESS (REWARDS REVEAL) */}
      {stage === 'success' && (
        <div className="flex-1 flex flex-col justify-between items-center text-center h-full max-w-sm mx-auto">
          <div />

          <div className="space-y-6">
            {/* Mascot Celebrating */}
            <motion.img 
              src="/lion_proud.png" 
              alt="T1GER Mascot" 
              className="w-40 h-40 object-contain drop-shadow-[0_0_20px_var(--accent-glow)] mb-4"
              animate={{ y: [0, -8, 0], scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />

            <span className="text-[10px] font-black font-mono text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full uppercase tracking-widest">
              NIVEL DE INDUCCIÓN CONCLUIDO
            </span>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">
              ¡Caza Completada!
            </h1>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-xs font-sans">
              Has demostrado un instinto formidable. Has asimilado tu primer concepto clave y estás listo para reclamar tus primeras recompensas de Predator.
            </p>

            {/* Core Earned Rewards Box */}
            <div className="grid grid-cols-2 gap-4 bg-white/[0.02] border border-white/10 rounded-[2rem] p-5 shadow-inner">
              <div className="text-center">
                <span className="text-[7px] font-black font-mono text-zinc-500 uppercase tracking-widest block mb-1">XP GANADO</span>
                <span className="text-2xl font-black text-accent font-mono block">+50</span>
              </div>
              <div className="text-center border-l border-white/5">
                <span className="text-[7px] font-black font-mono text-zinc-500 uppercase tracking-widest block mb-1">MONEDAS T1GER</span>
                <span className="text-2xl font-black text-amber-400 font-mono block">+25</span>
              </div>
            </div>
          </div>

          {/* Claim and Proceed to App */}
          <button
            onClick={handleClaim}
            className="w-full py-5 rounded-2xl btn-gamified-3d flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97]"
          >
            Reclamar y Entrar al Dashboard <Award size={18} className="stroke-[3]" />
          </button>
        </div>
      )}

    </div>
  );
};
