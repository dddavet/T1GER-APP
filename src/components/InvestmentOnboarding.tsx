import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Brain, TrendingUp, Sparkles, BookOpen, Clock, Bell, Crown, Flame, Target, Users, Check, PlaySquare, Youtube, Instagram, MessageSquare, ShieldAlert, Frown, Activity, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, type InvestmentProfile } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { TigerMascot } from './TigerMascot';

type OnboardingStep = 
  | 'splash'
  | 'mascot_intro'
  | 'source'
  | 'topic'
  | 'building_course'
  | 'experience'
  | 'motivation'
  | 'pace'
  | 'notifications'
  | 'paywall'
  | 'ready';

export const InvestmentOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateAppUser } = useAuth();
  const { selectTrack, language } = useBrain();
  const isEs = language === 'es';
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('splash');
  const [answers, setAnswers] = useState<Partial<InvestmentProfile>>({ learnWithFriends: true });
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [acquisitionSource, setAcquisitionSource] = useState<string>('');

  useEffect(() => {
    if (currentStep === 'building_course') {
      const timer = setTimeout(() => {
        setCurrentStep('experience');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  useEffect(() => {
    const steps: OnboardingStep[] = ['mascot_intro', 'source', 'topic', 'building_course', 'experience', 'motivation', 'pace', 'notifications', 'paywall', 'ready'];
    const index = steps.indexOf(currentStep);
    if (index >= 0) {
      setProgress(((index + 1) / steps.length) * 100);
    } else {
      setProgress(0);
    }
  }, [currentStep]);

  const handleFinish = async (isSuper: boolean = false) => {
    setSaving(true);
    selectTrack('investing');
    
    const finalAnswers = {
      goal: answers.goal || 'long-term-wealth',
      experience: answers.experience || 'new',
      riskComfort: answers.riskComfort || 'balanced',
      weeklyCommitment: answers.weeklyCommitment || 10,
      contentFormat: answers.contentFormat || 'practice',
    };

    const plan = {
      title: finalAnswers.experience === 'active' ? 'Investor Decision Lab' : 'Investment Foundations',
      firstLessonId: 'inv-e1',
      weeklyMinutes: (finalAnswers.weeklyCommitment as number) * 5,
      focusAreas: ['Fundamentos de Mercado', 'Gestión de Riesgo', 'Mentalidad Predator'],
    };

    await updateAppUser({
      niche: 'investing',
      primaryTrack: 'investing',
      goal: finalAnswers.goal,
      dailyTime: finalAnswers.weeklyCommitment,
      learningStyle: 'interactive',
      experienceLevel: finalAnswers.experience === 'active' ? 3 : finalAnswers.experience === 'basic' ? 2 : 1,
      investmentProfile: finalAnswers as InvestmentProfile,
      personalizedPlan: plan,
      onboardingStep: 'complete',
      onboardingComplete: true,
      isSuperT1ger: isSuper,
      acquisitionSource
    });
    
    setSaving(false);
    onComplete();
  };

  const TopBar = () => {
    if (currentStep === 'splash' || currentStep === 'paywall') return null;
    
    const goBack = () => {
      const history: Record<OnboardingStep, OnboardingStep> = {
        mascot_intro: 'splash',
        source: 'mascot_intro',
        topic: 'source',
        building_course: 'topic',
        experience: 'topic',
        motivation: 'experience',
        pace: 'motivation',
        notifications: 'pace',
        paywall: 'notifications',
        ready: 'paywall',
        splash: 'splash'
      };
      setCurrentStep(history[currentStep]);
    };

    return (
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center gap-4 z-20 pt-[calc(1.5rem+var(--safe-top-inset,env(safe-area-inset-top)))]">
        <button 
          onClick={goBack}
          className="text-zinc-400 hover:text-zinc-600 transition-colors p-1"
        >
          <ArrowLeft size={24} strokeWidth={3} />
        </button>
        <div className="h-3.5 flex-1 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200 p-0.5">
          <div 
            className="h-full bg-[#FF7300] rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  const OptionButton = ({ onClick, icon: Icon, label, description, selected, badgeBg }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-b-4 transition-all duration-200 active:translate-y-1 text-left cursor-pointer
        ${selected 
          ? 'border-[#CC5C00] bg-[#FF7300] text-white shadow-lg' 
          : 'border-zinc-200 border-b-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800'
        }
      `}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-b-4 shrink-0 text-white shadow-sm ${badgeBg || (selected ? 'bg-white/20 border-white/30' : 'bg-zinc-800 border-zinc-900')}`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-black uppercase tracking-wider text-[15px] italic ${selected ? 'text-white' : 'text-zinc-800'}`}>
          {label}
        </h3>
        {description && (
          <p className={`text-[12px] font-semibold leading-snug mt-0.5 ${selected ? 'text-white/90' : 'text-zinc-500'}`}>
            {description}
          </p>
        )}
      </div>
    </button>
  );

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto relative flex flex-col bg-[#F7F7F7] overflow-hidden text-zinc-800 font-sans">
      <TopBar />

      <AnimatePresence mode="wait">
        {/* STEP 1: SPLASH */}
        {currentStep === 'splash' && (
          <motion.div 
            key="splash"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="flex-1 flex flex-col items-center justify-center">
              <TigerMascot
                pose="welcome"
                size="lg"
                speech={isEs ? "¡Bienvenido a T1GER! El simulador ejecutivo de negocios e inversiones." : "Welcome to T1GER! The elite business & investment simulator."}
              />
            </div>
            <div className="w-full pb-8 flex flex-col gap-3">
              <button 
                onClick={() => setCurrentStep('mascot_intro')}
                className="w-full py-4 rounded-2xl bg-[#FF7300] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#CC5C00] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-lg"
              >
                {isEs ? 'Comenzar' : 'Get Started'}
              </button>
              <button 
                onClick={() => onComplete()}
                className="w-full py-4 rounded-2xl bg-white text-[#FF7300] font-black text-[15px] uppercase tracking-widest border-2 border-zinc-200 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all cursor-pointer"
              >
                {isEs ? 'Ya tengo una cuenta' : 'I already have an account'}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: MASCOT INTRO */}
        {currentStep === 'mascot_intro' && (
          <motion.div 
            key="mascot_intro"
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
            className="flex-1 flex flex-col pt-24 p-6 justify-between"
          >
            <div className="flex-1 flex flex-col items-center justify-center">
              <TigerMascot
                pose="welcome"
                size="lg"
                speech={isEs ? "¡Hola! Soy T1GER. Solo 7 preguntas rápidas antes de nuestra primera misión." : "I'm T1ger. Just seven quick questions before we start our first mission."}
              />
            </div>

            <button 
              onClick={() => setCurrentStep('source')}
              className="w-full py-4 rounded-2xl bg-[#FF7300] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#CC5C00] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-lg mt-8"
            >
              {isEs ? 'Continuar ➔' : 'Continue ➔'}
            </button>
          </motion.div>
        )}

        {/* STEP 2.5: SOURCE (How did you hear about T1GER?) */}
        {currentStep === 'source' && (
          <motion.div 
            key="source"
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
            className="flex-1 flex flex-col pt-24 p-6 overflow-y-auto"
          >
            <div className="mb-6">
              <TigerMascot
                pose="coaching"
                size="md"
                speech={isEs ? "¿Dónde te enteraste de T1GER?" : "How did you hear about T1GER?"}
              />
            </div>

            <div className="flex-1 space-y-3.5 pb-6">
              <OptionButton 
                icon={PlaySquare} 
                label="TikTok" 
                description={isEs ? "Videos cortos y virales" : "Shorts & viral videos"}
                badgeBg="bg-[#FE2C55] border-[#CC1F40]"
                selected={acquisitionSource === 'tiktok'}
                onClick={() => {
                  setAcquisitionSource('tiktok');
                  setTimeout(() => setCurrentStep('topic'), 300);
                }}
              />
              <OptionButton 
                icon={Youtube} 
                label="YouTube" 
                description={isEs ? "Videos largos y guías" : "Longform videos & podcasts"}
                badgeBg="bg-[#FF0000] border-[#CC0000]"
                selected={acquisitionSource === 'youtube'}
                onClick={() => {
                  setAcquisitionSource('youtube');
                  setTimeout(() => setCurrentStep('topic'), 300);
                }}
              />
              <OptionButton 
                icon={Instagram} 
                label="Instagram" 
                description={isEs ? "Reels y publicaciones" : "Reels & posts"}
                badgeBg="bg-[#E4405F] border-[#B82E47]"
                selected={acquisitionSource === 'instagram'}
                onClick={() => {
                  setAcquisitionSource('instagram');
                  setTimeout(() => setCurrentStep('topic'), 300);
                }}
              />
              <OptionButton 
                icon={Users} 
                label={isEs ? "Amigos o Familia" : "Friends / Family"} 
                description={isEs ? "Recomendación boca a boca" : "Word of mouth recommendation"}
                badgeBg="bg-[#00E5FF] border-[#00B2C7]"
                selected={acquisitionSource === 'friends'}
                onClick={() => {
                  setAcquisitionSource('friends');
                  setTimeout(() => setCurrentStep('topic'), 300);
                }}
              />
            </div>
          </motion.div>
        )}

        {/* STEP 3: TOPIC */}
        {currentStep === 'topic' && (
          <motion.div 
            key="topic"
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
            className="flex-1 flex flex-col pt-24 p-6 overflow-y-auto"
          >
            <div className="mb-6">
              <TigerMascot
                pose="thinking"
                size="md"
                speech={isEs ? "¿Qué tema principal quieres dominar primero?" : "What core topic do you want to master first?"}
              />
            </div>

            <div className="flex-1 space-y-3.5 pb-6">
              <OptionButton 
                icon={TrendingUp} 
                label={isEs ? "Inversiones y Finanzas" : "Investing & Markets"} 
                description={isEs ? "Acciones, valuación e interés compuesto" : "Stocks, valuation & compounding"}
                badgeBg="bg-blue-500 border-blue-600"
                selected={answers.goal === 'investing'}
                onClick={() => {
                  setAnswers({ ...answers, goal: 'investing' });
                  setTimeout(() => setCurrentStep('building_course'), 300);
                }}
              />
              <OptionButton 
                icon={Brain} 
                label={isEs ? "Inteligencia Artificial" : "Artificial Intelligence"} 
                description={isEs ? "Automatización y modelos LLM" : "Automation & LLM prompting"}
                badgeBg="bg-emerald-500 border-emerald-600"
                selected={answers.goal === 'ai'}
                onClick={() => {
                  setAnswers({ ...answers, goal: 'ai' });
                  setTimeout(() => setCurrentStep('building_course'), 300);
                }}
              />
              <OptionButton 
                icon={Target} 
                label={isEs ? "Ventas y Negocios" : "Sales & Offer Creation"} 
                description={isEs ? "Creación de ofertas Grand Slam" : "Build +$1M Grand Slam offers"}
                badgeBg="bg-orange-500 border-orange-600"
                selected={answers.goal === 'sales'}
                onClick={() => {
                  setAnswers({ ...answers, goal: 'sales' });
                  setTimeout(() => setCurrentStep('building_course'), 300);
                }}
              />
            </div>
          </motion.div>
        )}

        {/* STEP 4: COURSE BUILDING ANIMATION */}
        {currentStep === 'building_course' && (
          <motion.div 
            key="building_course"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          >
            <TigerMascot
              pose="celebrating"
              size="lg"
              speech={isEs ? "¡Preparando tu plan de entrenamiento ejecutivo personalizado!" : "Preparing your custom executive learning path!"}
            />
            <div className="w-16 h-16 rounded-full border-4 border-zinc-200 border-t-[#FF7300] animate-spin mx-auto mt-8" />
          </motion.div>
        )}

        {/* STEP 5: EXPERIENCE LEVEL */}
        {currentStep === 'experience' && (
          <motion.div 
            key="experience"
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
            className="flex-1 flex flex-col pt-24 p-6 overflow-y-auto"
          >
            <div className="mb-6">
              <TigerMascot
                pose="coaching"
                size="md"
                speech={isEs ? "¿Cuál es tu nivel de experiencia actual?" : "What is your current experience level?"}
              />
            </div>

            <div className="flex-1 space-y-3.5 pb-6">
              <OptionButton 
                icon={BookOpen} 
                label={isEs ? "Principiante Absoluto" : "Complete Beginner"} 
                description={isEs ? "Comenzar desde las bases del Nivel 1" : "Start from Level 1 foundations"}
                selected={answers.experience === 'new'}
                onClick={() => {
                  setAnswers({ ...answers, experience: 'new' });
                  setTimeout(() => setCurrentStep('motivation'), 300);
                }}
              />
              <OptionButton 
                icon={Sparkles} 
                label={isEs ? "Intermedio" : "Intermediate"} 
                description={isEs ? "Tengo conceptos básicos pero quiero estructura" : "I know basics but need structured execution"}
                selected={answers.experience === 'basic'}
                onClick={() => {
                  setAnswers({ ...answers, experience: 'basic' });
                  setTimeout(() => setCurrentStep('motivation'), 300);
                }}
              />
              <OptionButton 
                icon={Crown} 
                label={isEs ? "Avanzado / Ejecutivo" : "Advanced Executive"} 
                description={isEs ? "Busco escalar sistemas y acelerar resultados" : "Scale systems and accelerate results"}
                selected={answers.experience === 'active'}
                onClick={() => {
                  setAnswers({ ...answers, experience: 'active' });
                  setTimeout(() => setCurrentStep('motivation'), 300);
                }}
              />
            </div>
          </motion.div>
        )}

        {/* STEP 6: MOTIVATION */}
        {currentStep === 'motivation' && (
          <motion.div 
            key="motivation"
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
            className="flex-1 flex flex-col pt-24 p-6 overflow-y-auto"
          >
            <div className="mb-6">
              <TigerMascot
                pose="proud"
                size="md"
                speech={isEs ? "¿Cuál es tu motivación principal para entrenar?" : "What is your main motivation to train?"}
              />
            </div>

            <div className="flex-1 space-y-3.5 pb-6">
              <OptionButton 
                icon={TrendingUp} 
                label={isEs ? "Aumentar mis ingresos" : "Grow my income"} 
                description={isEs ? "Escalar flujo de caja y rentabilidad" : "Scale cash flow and profit"}
                selected={answers.contentFormat === 'practice'}
                onClick={() => {
                  setAnswers({ ...answers, contentFormat: 'practice' });
                  setTimeout(() => setCurrentStep('pace'), 300);
                }}
              />
              <OptionButton 
                icon={Flame} 
                label={isEs ? "Construir disciplina indestructible" : "Build bulletproof discipline"} 
                description={isEs ? "Misiones diarias y streak consistente" : "Daily missions and consistent streak"}
                selected={answers.contentFormat === 'read'}
                onClick={() => {
                  setAnswers({ ...answers, contentFormat: 'read' });
                  setTimeout(() => setCurrentStep('pace'), 300);
                }}
              />
            </div>
          </motion.div>
        )}

        {/* STEP 7: PACE */}
        {currentStep === 'pace' && (
          <motion.div 
            key="pace"
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
            className="flex-1 flex flex-col pt-24 p-6 justify-between"
          >
            <div className="mb-6">
              <TigerMascot
                pose="coaching"
                size="md"
                speech={isEs ? "¿Cuántos minutos al día estás dispuesto a invertir?" : "How many minutes a day will you commit?"}
              />
            </div>

            <div className="space-y-3.5 my-auto">
              <OptionButton 
                icon={Clock} 
                label={isEs ? "5 min / día" : "5 min / day"} 
                description={isEs ? "Ritmo Relajado" : "Casual Pace"}
                selected={answers.weeklyCommitment === 5}
                onClick={() => setAnswers({ ...answers, weeklyCommitment: 5 })}
              />
              <OptionButton 
                icon={Target} 
                label={isEs ? "15 min / día" : "15 min / day"} 
                description={isEs ? "Enfoque Ejecutivo (Recomendado)" : "Executive Focus (Recommended)"}
                selected={answers.weeklyCommitment === 15}
                onClick={() => setAnswers({ ...answers, weeklyCommitment: 15 })}
              />
              <OptionButton 
                icon={Flame} 
                label={isEs ? "30 min / día" : "30 min / day"} 
                description={isEs ? "Modo Bestia / Predator" : "Beast / Predator Mode"}
                selected={answers.weeklyCommitment === 30}
                onClick={() => setAnswers({ ...answers, weeklyCommitment: 30 })}
              />
            </div>

            <button 
              onClick={() => setCurrentStep('notifications')}
              className="w-full py-4 rounded-2xl bg-[#FF7300] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#CC5C00] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-lg mt-6"
            >
              {isEs ? 'Continuar ➔' : 'Continue ➔'}
            </button>
          </motion.div>
        )}

        {/* STEP 8: NOTIFICATIONS */}
        {currentStep === 'notifications' && (
          <motion.div 
            key="notifications"
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
            className="flex-1 flex flex-col pt-24 p-6 justify-between text-center"
          >
            <div className="my-auto flex flex-col items-center">
              <TigerMascot
                pose="coaching"
                size="lg"
                speech={isEs ? "¿Activamos recordatorios para no romper tu racha?" : "Enable reminders so you never break your streak?"}
              />
            </div>

            <div className="space-y-3 mt-8">
              <button 
                onClick={() => setCurrentStep('paywall')}
                className="w-full py-4 rounded-2xl bg-[#FF7300] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#CC5C00] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <Bell size={20} />
                {isEs ? 'Activar Recordatorios' : 'Enable Reminders'}
              </button>
              <button 
                onClick={() => setCurrentStep('paywall')}
                className="w-full py-3.5 text-zinc-400 font-bold text-sm hover:text-zinc-600 transition-colors cursor-pointer"
              >
                {isEs ? 'Ahora no' : 'Not now'}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 9: PAYWALL */}
        {currentStep === 'paywall' && (
          <motion.div 
            key="paywall"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col p-6 pt-12 justify-between"
          >
            <div className="text-center space-y-4 my-auto">
              <TigerMascot
                pose="celebrating"
                size="lg"
                speech={isEs ? "¡Tu plan de entrenamiento T1GER está listo! Activa T1GER Super para misiones ilimitadas." : "Your T1GER learning path is ready! Unlock Super T1GER for unlimited missions."}
              />

              <div className="bg-white border-2 border-zinc-200 rounded-3xl p-5 shadow-lg space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#58CC02]" strokeWidth={3} />
                  <span className="font-bold text-sm text-zinc-800">{isEs ? 'Acceso a todas las rutas ejecuctivas' : 'Access to all executive learning tracks'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#58CC02]" strokeWidth={3} />
                  <span className="font-bold text-sm text-zinc-800">{isEs ? 'Vidas ilimitadas & Escudo de Racha' : 'Unlimited Hearts & Streak Shield'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#58CC02]" strokeWidth={3} />
                  <span className="font-bold text-sm text-zinc-800">{isEs ? 'Generación de lecciones con IA Gemini' : 'Gemini AI adaptive lesson engine'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6">
              <button 
                onClick={() => handleFinish(true)}
                className="w-full py-4 rounded-2xl bg-[#58CC02] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#46A302] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-lg"
              >
                {isEs ? 'Probar 7 Días Gratis' : 'Start 7-Day Free Trial'}
              </button>
              <button 
                onClick={() => handleFinish(false)}
                className="w-full py-3 text-zinc-400 font-bold text-xs uppercase tracking-wider hover:text-zinc-600 transition-colors cursor-pointer"
              >
                {isEs ? 'Continuar con versión gratuita' : 'Continue with Free Version'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
