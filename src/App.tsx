import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { T1gerProvider, useT1ger } from './contexts/T1gerContext';
import { BrainProvider, useBrain } from './contexts/BrainContext';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { AuthGate } from './components/AuthGate';
import { HUD } from './components/HUD';
import { NavDock } from './components/NavDock';
import { CoachFAB } from './components/CoachFAB';
import { Loader2 } from 'lucide-react';

import { Dashboard } from './pages/Dashboard';
import { TacticalSetup } from './pages/TacticalSetup';
import { Learn } from './pages/Learn';
import { Friends } from './pages/Friends';
import { Profile } from './pages/Profile';
import { Coach } from './pages/Coach';
import { MissionEngine } from './components/MissionEngine';
import { SquadTab } from './components/social/SquadTab';
import { EveningInterrogation } from './components/EveningInterrogation';

import { OnboardingFlow } from './components/OnboardingFlow';
import { generateAdaptiveLesson } from './services/gemini';
import { getUserWeaknesses } from './services/brainService';
import { AI_CURATED_CURRICULUM } from './services/aiCuratedLibrary';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-full w-full bg-[#050505] gap-4">
    <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
    <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest">Loading Predator Profile...</p>
  </div>
);

const AppContent = () => {
  const { activeView, setActiveView } = useT1ger();
  const { dailyTacticalStatus, brainState } = useBrain();
  const { user, appUser, loading } = useAuth();
  const [activeMission, setActiveMission] = useState<any>(null);
  
  const [loadingMission, setLoadingMission] = useState(false);
  const [loadingText, setLoadingText] = useState('Sincronizando...');
  const [onboardingBypassed, setOnboardingBypassed] = useState(false);

  useEffect(() => {
    if (!activeView) {
      setActiveView('learn');
    }
  }, [activeView, setActiveView]);

  const startMission = async (baseMission: any) => {
    setLoadingMission(true);
    
    const loadingPhrases = [
      'Accediendo al núcleo cognitivo de T1GER...',
      'Analizando tu perfil de competencias y debilidades...',
      'Escaneando historial de errores para redención...',
      'Orquestando recursos del mercado en tiempo real...',
      'Afilando garras del Predator conceptual...',
      'Sincronizando implantes de neón tácticos...'
    ];
    
    let phraseIndex = 0;
    setLoadingText(loadingPhrases[0]);
    
    const phraseInterval = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
      setLoadingText(loadingPhrases[phraseIndex]);
    }, 800);

    try {
      if (baseMission.competency === 'ai') {
        const dayNum = baseMission.dayNumber || 1;
        const curated = AI_CURATED_CURRICULUM[dayNum];
        if (curated) {
          setActiveMission({
            ...baseMission,
            isCuratedAI: true,
            curatedData: curated,
            title: curated.title,
            concept: curated.reading.takeaway,
          });
          setActiveView('mission');
          clearInterval(phraseInterval);
          setLoadingMission(false);
          return;
        }
      }

      // Compile user weaknesses from state
      const weaknesses = getUserWeaknesses(brainState);
      const userNiche = appUser?.niche || 'general';
      const userLevel = appUser?.level || 1;
      const learningStyle = appUser?.learningStyle || 'text';

      // Call dynamic generator service
      const personalizedLesson = await generateAdaptiveLesson(
        userNiche,
        userLevel,
        baseMission,
        weaknesses.weakCompetencies,
        weaknesses.recentFailedMissions,
        learningStyle
      );

      // Successfully generated dynamic custom lesson!
      setActiveMission({
        ...personalizedLesson,
        concept_flashcard: personalizedLesson.concept,
        business_scenario: personalizedLesson.scenario,
        mission_brief: personalizedLesson.taskBrief || baseMission.taskBrief
      });
      setActiveView('mission');
    } catch (e) {
      console.warn('[BirdBrain] Generation failed. Falling back to static lesson:', e);
      // Fallback seamlessly to the high-fidelity pre-compiled mission
      setActiveMission({
        ...baseMission,
        concept_flashcard: baseMission.concept,
        business_scenario: baseMission.scenario,
        mission_brief: baseMission.taskBrief
      });
      setActiveView('mission');
    } finally {
      clearInterval(phraseInterval);
      setLoadingMission(false);
    }
  };

  const themeColors: Record<string, any> = {
    relaxed: { main: '#60A5FA', glow: 'rgba(96, 165, 250, 0.4)', bg1: 'rgba(96, 165, 250, 0.1)', bg2: 'rgba(0, 229, 255, 0.05)' },
    rest: { main: '#60A5FA', glow: 'rgba(96, 165, 250, 0.4)', bg1: 'rgba(96, 165, 250, 0.1)', bg2: 'rgba(0, 229, 255, 0.05)' },
    focus: { main: '#CCFF00', glow: 'rgba(204, 255, 0, 0.4)', bg1: 'rgba(204, 255, 0, 0.1)', bg2: 'rgba(255, 255, 255, 0.02)' },
    normal: { main: '#CCFF00', glow: 'rgba(204, 255, 0, 0.4)', bg1: 'rgba(204, 255, 0, 0.1)', bg2: 'rgba(255, 255, 255, 0.02)' },
    beast: { main: '#FF6B00', glow: 'rgba(255, 107, 0, 0.4)', bg1: 'rgba(255, 107, 0, 0.1)', bg2: 'rgba(204, 255, 0, 0.05)' }
  };

  const themeClassMap: Record<string, string> = {
    rest: 'theme-relaxed',
    relaxed: 'theme-relaxed',
    normal: 'theme-focus',
    focus: 'theme-focus',
    beast: 'theme-beast'
  };

  const dayType = dailyTacticalStatus.dayType || 'focus';
  const theme = themeColors[dayType] || themeColors.focus;
  const themeClass = themeClassMap[dayType] || 'theme-focus';

  // Futuristic theme change flicker
  const [isFlickering, setIsFlickering] = React.useState(false);
  React.useEffect(() => {
    setIsFlickering(true);
    const timer = setTimeout(() => setIsFlickering(false), 200);
    return () => clearTimeout(timer);
  }, [dailyTacticalStatus.dayType]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthGate />;
  }

  // Developer testing override: useful when comparing the Cal AI-style flow locally.
  const FORCE_ONBOARDING_TEST = import.meta.env.VITE_FORCE_ONBOARDING_TEST === 'true';

  if (!appUser) {
    return <LoadingSpinner />;
  }

  // Intercept the app experience if onboarding isn't complete or if local testing asks for it.
  if ((FORCE_ONBOARDING_TEST && !onboardingBypassed) || !appUser.onboardingComplete) {
    return <OnboardingFlow onComplete={() => setOnboardingBypassed(true)} />;
  }

  const isFullscreen = activeView === 'mission' || activeView === 'debrief';

  return (
    <div 
      className={`flex flex-col h-full bg-[#050505] text-white font-sans overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${themeClass} ${isFlickering ? 'brightness-150 saturate-200' : ''}`}
      style={{
        '--accent-main': theme.main,
        '--accent-glow': theme.glow,
        '--bg-glow-1': theme.bg1,
        '--bg-glow-2': theme.bg2,
      } as any}
    >
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] bg-[var(--bg-glow-1)] opacity-50 transition-colors duration-1000" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full blur-[100px] bg-[var(--bg-glow-2)] opacity-30 transition-colors duration-1000" />
      </div>
      {/* Scanline Effect Overlay during flicker */}
      {isFlickering && (
        <div className="absolute inset-0 z-[9999] pointer-events-none bg-scanline opacity-20" />
      )}
      {/* HUD - visible on non-fullscreen views */}
      {!isFullscreen && <HUD />}
      
      {/* Main scrollable content area */}
      <main className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${isFullscreen ? '' : 'px-5 pb-32'}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
          <AnimatePresence mode="wait">
            {activeView === 'mission' && activeMission && (
              <motion.div key="mission" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MissionEngine mission={activeMission} onComplete={() => setActiveView('learn')} />
              </motion.div>
            )}
            {activeView === 'debrief' && (
              <motion.div key="debrief" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EveningInterrogation onComplete={() => setActiveView('learn')} />
              </motion.div>
            )}
            {activeView === 'proof' && (
              <motion.div key="proof" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <Dashboard onStartMission={startMission} />
              </motion.div>
            )}
            {activeView === 'tactical' && (
              <motion.div key="tactical" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <TacticalSetup />
              </motion.div>
            )}
            {activeView === 'learn' && (
              <motion.div key="learn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <Learn onStartMission={startMission} />
              </motion.div>
            )}
            {activeView === 'friends' && (
              <motion.div key="friends" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <SquadTab />
              </motion.div>
            )}
            {activeView === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <Profile onPlayMission={(m) => {
                  setActiveMission(m);
                  setActiveView('mission');
                }} />
              </motion.div>
            )}
            {activeView === 'coach' && (
              <motion.div key="coach" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <Coach />
              </motion.div>
            )}
          </AnimatePresence>
      </main>

      {/* Bottom Nav + Coach FAB */}
      {!isFullscreen && <CoachFAB />}
      {!isFullscreen && <NavDock />}

      {/* Tactical Loading Overlay */}
      <AnimatePresence>
        {loadingMission && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020204]/95 backdrop-blur-md"
          >
            {/* Pulsing neons */}
            <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full blur-[120px] bg-[var(--accent-glow)] opacity-10 pointer-events-none animate-pulse-glow" />

            <div className="relative flex flex-col items-center justify-center p-6 text-center max-w-xs">
              {/* Spinner wrapper */}
              <div className="relative mb-6">
                <motion.div 
                  className="w-16 h-16 rounded-full border-2 border-white/5 border-t-[var(--accent-main)] shadow-[0_0_15px_var(--accent-glow)]"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center font-black text-xs font-mono text-[var(--accent-main)]">
                  T1
                </div>
              </div>

              {/* Status information */}
              <span className="text-[10px] font-black font-mono text-[var(--accent-main)] uppercase tracking-[0.25em] mb-2 animate-pulse">
                Sincronizando Cerebro
              </span>
              <h2 className="text-sm font-bold text-white uppercase tracking-tight mb-3">
                Cargando Reto Adaptativo
              </h2>
              
              {/* Animated phrase */}
              <div className="h-10 flex items-center justify-center">
                <p className="text-xs font-mono text-zinc-500 font-bold uppercase tracking-wider leading-relaxed animate-fade-in" key={loadingText}>
                  {loadingText}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <T1gerProvider>
        <BrainProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </BrainProvider>
      </T1gerProvider>
    </AuthProvider>
  );
}
