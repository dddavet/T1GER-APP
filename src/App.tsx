import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { T1gerProvider, useT1ger } from './contexts/T1gerContext';
import { BrainProvider, useBrain } from './contexts/BrainContext';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { AuthGate } from './components/AuthGate';
import { HUD } from './components/HUD';
import { NavDock } from './components/NavDock';
import { BuildTab } from './components/BuildTab';
import { Dashboard } from './pages/Dashboard';
import { Learn } from './pages/Learn';
import { Profile } from './pages/Profile';
import { Coach } from './pages/Coach';
import { MissionEngine } from './components/MissionEngine';
import { SquadTab } from './components/social/SquadTab';
import { EveningInterrogation } from './components/EveningInterrogation';
import { Simulator } from './pages/Simulator';
import { OfflineBanner } from './components/ui/OfflineBanner';

import { OnboardingFlow } from './components/OnboardingFlow';
import { generateAdaptiveLesson } from './services/gemini';
import { getUserWeaknesses } from './services/brainService';
import { AI_CURATED_CURRICULUM } from './services/aiCuratedLibrary';

import { AppSkeleton } from './components/ui/AppSkeleton';
import { MissionSkeleton } from './components/ui/MissionSkeleton';


const AppContent = () => {
  const { activeView, setActiveView } = useT1ger();
  const { dailyTacticalStatus, brainState } = useBrain();
  const { user, appUser, loading } = useAuth();
  const [activeMission, setActiveMission] = useState<any>(null);
  const mainRef = useRef<HTMLElement>(null);
  
  const [loadingMission, setLoadingMission] = useState(false);
  const [loadingText, setLoadingText] = useState('Sincronizando...');
  const [onboardingBypassed, setOnboardingBypassed] = useState(false);
  const forceOnboardingFromUrl = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('forceOnboarding') === '1';

  useEffect(() => {
    if (!activeView) {
      setActiveView('home');
    }
  }, [activeView, setActiveView]);

  useEffect(() => {
    const requestedView = new URLSearchParams(window.location.search).get('view');
    const allowedViews = ['home', 'learn', 'build', 'compete', 'profile', 'coach'];
    if (requestedView && allowedViews.includes(requestedView)) {
      setActiveView(requestedView as any);
    }
  }, [setActiveView]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeView]);

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
      const dailyTime = appUser?.dailyTime || 5;

      // Call dynamic generator service
      const personalizedLesson = await generateAdaptiveLesson(
        userNiche,
        userLevel,
        baseMission,
        weaknesses.weakCompetencies,
        weaknesses.recentFailedMissions,
        learningStyle,
        dailyTime
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
      
      const dailyTime = appUser?.dailyTime || 5;
      let questionCount = 3;
      if (dailyTime >= 10) questionCount = 5;
      if (dailyTime >= 15) questionCount = 7;

      // Generate synthetic fallback questions to ensure a multi-step lesson
      const syntheticQuestions = Array.from({ length: questionCount }).map((_, i) => ({
        text: `Review: ${baseMission.recallQuestion || `What is a key principle of ${baseMission.title}?`} (Part ${i + 1})`,
        options: baseMission.recallOptions || [
          { text: baseMission.keyTakeaway || "True", correct: true },
          { text: "False", correct: false }
        ],
        explanation: baseMission.recallExplanation || baseMission.concept
      }));

      setActiveMission({
        ...baseMission,
        concept_flashcard: baseMission.concept,
        business_scenario: baseMission.scenario,
        mission_brief: baseMission.taskBrief,
        curatedData: {
          quizQuestions: syntheticQuestions
        }
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
    return <AppSkeleton />;
  }

  const FORCE_ONBOARDING_TEST = import.meta.env.VITE_FORCE_ONBOARDING_TEST === 'true';

  if (((FORCE_ONBOARDING_TEST || forceOnboardingFromUrl) && !onboardingBypassed) || !appUser || !appUser.onboardingComplete) {
    return <OnboardingFlow onComplete={() => setOnboardingBypassed(true)} />;
  }

  const isFullscreen = activeView === 'mission' || activeView === 'debrief' || activeView === 'coach';

  // Simulator Mock Native Styles
  const simPlatform = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('sim_platform') : null;
  const platformClasses = simPlatform === 'ios' ? 'pt-14 pb-8 rounded-[40px] border border-black/10' : simPlatform === 'android' ? 'pt-8 pb-4 rounded-[30px] border border-black/10' : '';

  return (
    <div 
      className={`h-[100dvh] w-full max-w-md mx-auto sm:border-x sm:border-white/5 sm:shadow-[0_0_90px_rgba(0,20,16,.55)] relative flex flex-col bg-[#071C19] text-[#EAF4F1] font-sans font-medium overflow-hidden theme-${dayType} ${platformClasses}`}
    >
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_-10%,rgba(239,112,48,.11),transparent_32%),linear-gradient(180deg,#071C19_0%,#061815_100%)]" />
      
      <OfflineBanner />

      {/* HUD - visible on non-fullscreen views */}
      {!isFullscreen && <HUD />}
      
      {/* Main scrollable content area */}
      <main ref={mainRef} id="main-content" className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${isFullscreen ? '' : 'px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))]'}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
          <AnimatePresence mode="wait">
            {activeView === 'mission' && activeMission && (
              <motion.div key="mission" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MissionEngine mission={activeMission} onComplete={() => setActiveView('home')} />
              </motion.div>
            )}
            {activeView === 'debrief' && (
              <motion.div key="debrief" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EveningInterrogation onComplete={() => setActiveView('learn')} />
              </motion.div>
            )}
            {activeView === 'build' && (
              <motion.div key="build" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <BuildTab onStartMission={startMission} />
              </motion.div>
            )}
            {activeView === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <Dashboard onStartMission={startMission} />
              </motion.div>
            )}
            {activeView === 'learn' && (
              <motion.div key="learn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <Learn onStartMission={startMission} />
              </motion.div>
            )}
            {activeView === 'compete' && (
              <motion.div key="compete" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <SquadTab />
              </motion.div>
            )}
            {activeView === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <Profile />
              </motion.div>
            )}
            {activeView === 'coach' && (
              <motion.div key="coach" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <Coach />
              </motion.div>
            )}
          </AnimatePresence>
      </main>

      {!isFullscreen && <NavDock />}

      {/* Tactical Loading Overlay */}
      <AnimatePresence>
        {loadingMission && (
          <MissionSkeleton loadingText={loadingText} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  if (typeof window !== 'undefined' && window.location.pathname === '/sim') {
    return <Simulator />;
  }

  return (
    <AuthProvider>
      <BrainProvider>
        <T1gerProvider>
          <AppContent />
        </T1gerProvider>
      </BrainProvider>
    </AuthProvider>
  );
}
