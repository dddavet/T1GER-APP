import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Brain, Target, Compass, Lock, CheckCircle2, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { AuthGate } from './AuthGate'; // We'll use this for account creation
import { MissionEngine } from './MissionEngine';
import { MISSION_BANK } from '../services/missionBank';

type OnboardingStep = 
  | 'welcome'
  | 'topic'
  | 'motivation'
  | 'commitment'
  | 'diagnostic'
  | 'path_reveal'
  | 'first_lesson'
  | 'account_creation'
  | 'notification_permission'
  | 'data_consent';

export const OnboardingFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { appUser, updateAppUser } = useAuth();
  const { language } = useBrain();
  const isEs = language === 'es';

  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [topic, setTopic] = useState<string | null>(null);
  const [motivation, setMotivation] = useState<string | null>(null);
  const [commitment, setCommitment] = useState<number | null>(null);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);

  // Compute progress
  const steps: OnboardingStep[] = ['welcome', 'topic', 'motivation', 'commitment', 'diagnostic', 'path_reveal', 'first_lesson', 'account_creation', 'notification_permission', 'data_consent'];
  const progressIndex = steps.indexOf(step);
  const progressPercentage = progressIndex > 0 ? ((progressIndex) / (steps.length - 1)) * 100 : 0;

  // Save local config quietly when they reach path_reveal
  useEffect(() => {
    if (step === 'path_reveal') {
      updateAppUser({
        primaryTrack: topic === 'investing' ? 'investing' : 'business',
        dailyTime: commitment || 20,
        goal: motivation || 'none'
      });
    }
  }, [step, topic, commitment, motivation, updateAppUser]);

  // --- Step Content ---

  const renderWelcome = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full items-center justify-center p-6 text-center"
    >
      <div className="w-24 h-24 bg-[#009999] rounded-3xl flex items-center justify-center shadow-lg mb-8">
        <Target className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-4 uppercase">
        {isEs ? 'Invierte tu tiempo, no lo gastes.' : 'Invest your time, don\'t waste it.'}
      </h1>
      <p className="text-zinc-500 font-bold mb-12">
        {isEs ? 'El sistema operativo para tu crecimiento personal.' : 'The operating system for your personal growth.'}
      </p>
      
      <button
        onClick={() => setStep('topic')}
        className="w-full max-w-sm bg-[#FF7300] text-white font-black py-4 rounded-2xl shadow-[0_4px_0_#CC5C00] active:shadow-none active:translate-y-1 transition-all uppercase tracking-widest text-sm"
      >
        {isEs ? 'Comenzar' : 'Start'}
      </button>
    </motion.div>
  );

  const renderTopic = () => (
    <motion.div className="flex flex-col h-full p-6">
      <h2 className="text-2xl font-black text-zinc-900 mb-6 uppercase">
        {isEs ? '¿Qué quieres dominar primero?' : 'What do you want to master first?'}
      </h2>
      
      <div className="space-y-3">
        <button
          onClick={() => { setTopic('investing'); setTimeout(() => setStep('motivation'), 300); }}
          className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex justify-between items-center ${topic === 'investing' ? 'border-[#009999] bg-teal-50' : 'border-zinc-200 bg-white'}`}
        >
          <div>
            <div className="font-black text-zinc-900 uppercase">Investing & Wealth</div>
            <div className="text-xs font-bold text-zinc-500 mt-1">
              {isEs ? 'Construye patrimonio y toma el control.' : 'Build wealth and take control.'}
            </div>
          </div>
          {topic === 'investing' && <CheckCircle2 className="text-[#009999] w-6 h-6" />}
        </button>

        <button disabled className="w-full text-left p-5 rounded-2xl border-2 border-zinc-100 bg-zinc-50 opacity-60 flex justify-between items-center">
          <div>
            <div className="font-black text-zinc-400 uppercase">Business & Marketing</div>
            <div className="text-xs font-bold text-[#FF7300] mt-1">COMING SOON</div>
          </div>
        </button>
        
        <button disabled className="w-full text-left p-5 rounded-2xl border-2 border-zinc-100 bg-zinc-50 opacity-60 flex justify-between items-center">
          <div>
            <div className="font-black text-zinc-400 uppercase">AI Automation</div>
            <div className="text-xs font-bold text-[#FF7300] mt-1">COMING SOON</div>
          </div>
        </button>
      </div>

      <div className="mt-auto pt-6 flex gap-4">
        <button onClick={() => setStep('welcome')} className="p-4 bg-zinc-100 rounded-2xl text-zinc-600"><ArrowLeft className="w-6 h-6" /></button>
        <button 
          onClick={() => setStep('motivation')} 
          disabled={!topic}
          className={`flex-1 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm ${topic ? 'bg-[#FF7300] text-white shadow-[0_4px_0_#CC5C00]' : 'bg-zinc-200 text-zinc-400'}`}
        >
          {isEs ? 'Continuar' : 'Continue'}
        </button>
      </div>
    </motion.div>
  );

  const renderMotivation = () => (
    <motion.div className="flex flex-col h-full p-6">
      <h2 className="text-2xl font-black text-zinc-900 mb-6 uppercase">
        {isEs ? '¿Por qué elegiste esto?' : 'Why did you choose this?'}
      </h2>
      
      <div className="space-y-3">
        {[
          { id: 'freedom', es: 'Quiero libertad financiera', en: 'I want financial freedom' },
          { id: 'curiosity', es: 'Quiero entender cómo funciona el dinero', en: 'I want to understand how money works' },
          { id: 'protection', es: 'Proteger mi futuro contra la inflación', en: 'Protect my future against inflation' }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => { setMotivation(m.id); setTimeout(() => setStep('commitment'), 300); }}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex justify-between items-center ${motivation === m.id ? 'border-[#009999] bg-teal-50' : 'border-zinc-200 bg-white'}`}
          >
            <span className="font-bold text-zinc-800">{isEs ? m.es : m.en}</span>
            {motivation === m.id && <CheckCircle2 className="text-[#009999] w-6 h-6" />}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-6 flex gap-4">
        <button onClick={() => setStep('topic')} className="p-4 bg-zinc-100 rounded-2xl text-zinc-600"><ArrowLeft className="w-6 h-6" /></button>
        <button 
          onClick={() => setStep('commitment')} 
          disabled={!motivation}
          className={`flex-1 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm ${motivation ? 'bg-[#FF7300] text-white shadow-[0_4px_0_#CC5C00]' : 'bg-zinc-200 text-zinc-400'}`}
        >
          {isEs ? 'Continuar' : 'Continue'}
        </button>
      </div>
    </motion.div>
  );

  const renderCommitment = () => (
    <motion.div className="flex flex-col h-full p-6">
      <h2 className="text-2xl font-black text-zinc-900 mb-6 uppercase">
        {isEs ? '¿Cuánto tiempo puedes dedicar al día?' : 'How much time can you commit daily?'}
      </h2>
      <p className="text-sm text-zinc-500 font-bold mb-6">
        {isEs ? 'Se realista. La consistencia vence a la intensidad.' : 'Be realistic. Consistency beats intensity.'}
      </p>
      
      <div className="space-y-3">
        {[
          { val: 10, es: '10 Minutos (Relajado)', en: '10 Minutes (Casual)' },
          { val: 20, es: '20 Minutos (Enfocado)', en: '20 Minutes (Focused)' },
          { val: 45, es: '45+ Minutos (Intensivo)', en: '45+ Minutes (Intense)' }
        ].map(c => (
          <button
            key={c.val}
            onClick={() => { setCommitment(c.val); setTimeout(() => setStep('diagnostic'), 300); }}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex justify-between items-center ${commitment === c.val ? 'border-[#009999] bg-teal-50' : 'border-zinc-200 bg-white'}`}
          >
            <span className="font-bold text-zinc-800">{isEs ? c.es : c.en}</span>
            {commitment === c.val && <CheckCircle2 className="text-[#009999] w-6 h-6" />}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-6 flex gap-4">
        <button onClick={() => setStep('motivation')} className="p-4 bg-zinc-100 rounded-2xl text-zinc-600"><ArrowLeft className="w-6 h-6" /></button>
        <button 
          onClick={() => setStep('diagnostic')} 
          disabled={!commitment}
          className={`flex-1 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm ${commitment ? 'bg-[#FF7300] text-white shadow-[0_4px_0_#CC5C00]' : 'bg-zinc-200 text-zinc-400'}`}
        >
          {isEs ? 'Continuar' : 'Continue'}
        </button>
      </div>
    </motion.div>
  );

  const renderDiagnostic = () => (
    <motion.div className="flex flex-col h-full p-6">
      <h2 className="text-2xl font-black text-zinc-900 mb-6 uppercase">
        {isEs ? '¿Has invertido antes?' : 'Have you invested before?'}
      </h2>
      <p className="text-sm text-zinc-500 font-bold mb-6">
        {isEs ? 'Esto nos ayuda a calibrar tu punto de partida.' : 'This helps us calibrate your starting point.'}
      </p>
      
      <div className="space-y-3">
        {[
          { id: 'no', es: 'No, soy principiante', en: 'No, I am a beginner' },
          { id: 'some', es: 'Sí, un poco de experiencia', en: 'Yes, some experience' },
          { id: 'yes', es: 'Sí, tengo un portafolio activo', en: 'Yes, I have an active portfolio' }
        ].map(d => (
          <button
            key={d.id}
            onClick={() => { setDiagnostic(d.id); setTimeout(() => setStep('path_reveal'), 300); }}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex justify-between items-center ${diagnostic === d.id ? 'border-[#009999] bg-teal-50' : 'border-zinc-200 bg-white'}`}
          >
            <span className="font-bold text-zinc-800">{isEs ? d.es : d.en}</span>
            {diagnostic === d.id && <CheckCircle2 className="text-[#009999] w-6 h-6" />}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-6 flex gap-4">
        <button onClick={() => setStep('commitment')} className="p-4 bg-zinc-100 rounded-2xl text-zinc-600"><ArrowLeft className="w-6 h-6" /></button>
        <button 
          onClick={() => setStep('path_reveal')} 
          disabled={!diagnostic}
          className={`flex-1 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm ${diagnostic ? 'bg-[#FF7300] text-white shadow-[0_4px_0_#CC5C00]' : 'bg-zinc-200 text-zinc-400'}`}
        >
          {isEs ? 'Continuar' : 'Continue'}
        </button>
      </div>
    </motion.div>
  );

  const renderPathReveal = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col h-full bg-[#009999] text-white p-6 justify-center"
      >
        <div className="flex-1 flex flex-col justify-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tight">
            {isEs ? 'Tu Plan Está Listo' : 'Your Path is Ready'}
          </h2>
          <p className="text-white/80 font-bold mb-8 text-lg">
            {isEs 
              ? `Basado en tu compromiso de ${commitment} minutos diarios, hemos generado un currículo personalizado de Investing.`
              : `Based on your ${commitment}-minute daily commitment, we've built a custom Investing curriculum.`}
          </p>
          
          <div className="bg-white/10 p-5 rounded-2xl border border-white/20 mb-4">
            <h3 className="font-black uppercase tracking-widest text-sm text-[#FF7300] mb-1">Módulo 1</h3>
            <div className="font-bold">Foundations of Value</div>
            <div className="text-sm text-white/60 mt-2 flex items-center gap-2">
              <Compass className="w-4 h-4" /> 7 {isEs ? 'Lecciones' : 'Lessons'}
            </div>
          </div>
        </div>

        <button 
          onClick={() => setStep('first_lesson')}
          className="w-full bg-[#FF7300] text-white font-black py-4 rounded-2xl shadow-[0_4px_0_#CC5C00] active:shadow-none active:translate-y-1 transition-all uppercase tracking-widest text-sm mt-auto"
        >
          {isEs ? 'Tomar la Primera Lección' : 'Take First Lesson'}
        </button>
      </motion.div>
    );
  };

  const renderFirstLesson = () => {
    // Fetch a basic mock mission for the first lesson
    const firstMission = MISSION_BANK.find(m => m.id === 'inv-1-1') || MISSION_BANK[0];
    
    return (
      <div className="h-full bg-white relative">
        <MissionEngine 
          mission={firstMission as any} 
          onComplete={() => setStep('account_creation')}
        />
      </div>
    );
  };

  const renderAccountCreation = () => (
    <motion.div className="flex flex-col h-full p-6 bg-white overflow-y-auto">
      <h2 className="text-2xl font-black text-zinc-900 mb-2 uppercase">
        {isEs ? 'Protege tu Progreso' : 'Save Your Progress'}
      </h2>
      <p className="text-zinc-500 font-bold mb-8">
        {isEs 
          ? 'Acabas de completar tu primera lección. Crea una cuenta gratuita para guardar tu progreso y desbloquear el resto del plan.' 
          : 'You just completed your first lesson. Create a free account to save your progress and unlock the rest of the path.'}
      </p>

      {/* Render AuthGate as a component block instead of a gate */}
      <div className="flex-1 bg-zinc-50 p-4 rounded-3xl border border-zinc-200">
        <AuthGate 
          onAuthSuccess={() => setStep('notification_permission')} 
          embedded={true} 
        />
      </div>
    </motion.div>
  );

  const renderNotificationPermission = () => (
    <motion.div className="flex flex-col h-full p-6 text-center justify-center">
      <div className="w-24 h-24 bg-[#FF7300]/10 rounded-full flex items-center justify-center mx-auto mb-8">
        <Target className="w-12 h-12 text-[#FF7300]" />
      </div>
      <h2 className="text-3xl font-black text-zinc-900 mb-4 uppercase tracking-tight">
        {isEs ? 'Protege tu Racha' : 'Protect Your Streak'}
      </h2>
      <p className="text-zinc-500 font-bold mb-12 px-4">
        {isEs 
          ? 'La consistencia lo es todo. Permítenos recordarte cuando estés a punto de perder tu racha diaria.' 
          : 'Consistency is everything. Let us remind you right before your daily streak expires.'}
      </p>
      
      <div className="mt-auto space-y-4">
        <button 
          onClick={() => {
            // Request push permissions here
            updateAppUser({ notificationPreferences: { daily_reminder: true, streak_risk: true } });
            setStep('data_consent');
          }}
          className="w-full bg-[#009999] text-white font-black py-4 rounded-2xl shadow-[0_4px_0_#006666] active:shadow-none active:translate-y-1 transition-all uppercase tracking-widest text-sm"
        >
          {isEs ? 'Permitir Notificaciones' : 'Allow Notifications'}
        </button>
        <button 
          onClick={() => setStep('data_consent')}
          className="w-full font-bold py-4 text-zinc-400 uppercase tracking-widest text-sm"
        >
          {isEs ? 'Ahora No' : 'Not Now'}
        </button>
      </div>
    </motion.div>
  );

  const renderDataConsent = () => (
    <motion.div className="flex flex-col h-full p-6">
      <h2 className="text-2xl font-black text-zinc-900 mb-6 uppercase">
        {isEs ? 'Tus Datos, Tus Reglas' : 'Your Data, Your Rules'}
      </h2>
      
      <div className="space-y-4 mb-8 text-sm text-zinc-600 font-medium">
        <p>
          {isEs 
            ? 'Para personalizar tu algoritmo de aprendizaje, necesitamos recolectar y procesar datos sobre tus interacciones en la app.'
            : 'To personalize your learning algorithm, we need to collect and process data about your interactions in the app.'}
        </p>
        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-3">
          <div className="flex gap-3">
            <Check className="w-5 h-5 text-[#009999] shrink-0" />
            <span>{isEs ? 'Historial de misiones y progreso.' : 'Mission history and progress tracking.'}</span>
          </div>
          <div className="flex gap-3">
            <Check className="w-5 h-5 text-[#009999] shrink-0" />
            <span>{isEs ? 'Analíticas para mejorar la currícula.' : 'Analytics to improve the curriculum.'}</span>
          </div>
          <div className="flex gap-3">
            <Lock className="w-5 h-5 text-[#009999] shrink-0" />
            <span>{isEs ? 'Tus datos están encriptados y seguros.' : 'Your data is encrypted and secure.'}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <button 
          onClick={() => {
            updateAppUser({ onboardingComplete: true });
            onComplete();
          }}
          className="w-full bg-[#FF7300] text-white font-black py-4 rounded-2xl shadow-[0_4px_0_#CC5C00] active:shadow-none active:translate-y-1 transition-all uppercase tracking-widest text-sm"
        >
          {isEs ? 'Acepto y Terminar' : 'I Agree & Finish'}
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 bg-white z-[300] flex flex-col font-sans">
      {/* Progress Bar (hidden on welcome and path_reveal) */}
      {step !== 'welcome' && step !== 'path_reveal' && step !== 'first_lesson' && (
        <div className="h-2 w-full bg-zinc-100 shrink-0">
          <motion.div 
            className="h-full bg-[#009999]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div 
          key={step} 
          className="flex-1 overflow-y-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 'welcome' && renderWelcome()}
          {step === 'topic' && renderTopic()}
          {step === 'motivation' && renderMotivation()}
          {step === 'commitment' && renderCommitment()}
          {step === 'diagnostic' && renderDiagnostic()}
          {step === 'path_reveal' && renderPathReveal()}
          {step === 'first_lesson' && renderFirstLesson()}
          {step === 'account_creation' && renderAccountCreation()}
          {step === 'notification_permission' && renderNotificationPermission()}
          {step === 'data_consent' && renderDataConsent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
