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

import { InvestmentOnboarding } from './components/InvestmentOnboarding';
import { generateAdaptiveLesson } from './services/gemini';
import { getUserWeaknesses } from './services/brainService';
import { AI_CURATED_CURRICULUM } from './services/aiCuratedLibrary';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-full w-full bg-white gap-4">
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
  const forceOnboardingFromUrl = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('forceOnboarding') === '1';

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

      // Curated investing and business lessons are the source of truth for the MVP.
      // They should open instantly and must not depend on an AI model being available.
      if (baseMission.competency !== 'ai') {
        setActiveMission({
          ...baseMission,
          concept_flashcard: baseMission.concept,
          business_scenario: baseMission.scenario,
          mission_brief: baseMission.taskBrief,
        });
        setActiveView('mission');
        clearInterval(phraseInterval);
        setLoadingMission(false);
        return;
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
    relaxed: { main: '#FF7300', glow: 'rgba(255, 115, 0, 0.4)', bg1: 'rgba(255, 115, 0, 0.1)', bg2: 'rgba(255, 115, 0, 0.05)' },
    rest: { main: '#FF7300', glow: 'rgba(255, 115, 0, 0.4)', bg1: 'rgba(255, 115, 0, 0.1)', bg2: 'rgba(255, 115, 0, 0.05)' },
    focus: { main: '#FF7300', glow: 'rgba(255, 115, 0, 0.4)', bg1: 'rgba(255, 115, 0, 0.1)', bg2: 'rgba(255, 115, 0, 0.02)' },
    normal: { main: '#FF7300', glow: 'rgba(255, 115, 0, 0.4)', bg1: 'rgba(255, 115, 0, 0.1)', bg2: 'rgba(255, 115, 0, 0.02)' },
    beast: { main: '#FF7300', glow: 'rgba(255, 115, 0, 0.2)', bg1: 'rgba(255, 115, 0, 0.03)', bg2: 'rgba(255, 115, 0, 0.01)' }
  };

  const dayType = dailyTacticalStatus.dayType || 'focus';
  const currentTheme = themeColors[dayType] || themeColors.focus;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user && !appUser) {
    return <AuthGate />;
  }

  const FORCE_ONBOARDING_TEST = import.meta.env.VITE_FORCE_ONBOARDING_TEST === 'true';

  if (!appUser) {
    return <LoadingSpinner />;
  }

  if (((FORCE_ONBOARDING_TEST || forceOnboardingFromUrl) && !onboardingBypassed) || !appUser.onboardingComplete) {
    return <InvestmentOnboarding onComplete={() => setOnboardingBypassed(true)} />;
  }

  const isFullscreen = activeView === 'mission' || activeView === 'debrief';

  return (
    <div 
      className={`min-h-screen bg-[#F7F7F7] text-zinc-800 font-sans font-medium overflow-hidden transition-colors duration-1000 theme-${dayType}`}
    >
      {/* Gamified clean background */}
      <div className="absolute inset-0 bg-[#F7F7F7] z-[-1]" />
      
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
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md"
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
