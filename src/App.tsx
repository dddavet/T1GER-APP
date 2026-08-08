import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { T1gerProvider, useT1ger } from './contexts/T1gerContext';
import { BrainProvider, useBrain } from './contexts/BrainContext';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { AuthGate } from './components/AuthGate';
import { HUD } from './components/HUD';
import { NavDock } from './components/NavDock';
import { BuildTab } from './components/BuildTab';
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

const TAB_VIEW_ORDER = ['learn', 'build', 'compete', 'profile'] as const;
const PAGE_SPRING = { type: 'spring' as const, stiffness: 360, damping: 34, mass: .72 };
const PAGE_VARIANTS = {
  initial: ({ direction, isTab }: { direction: number; isTab: boolean }) => ({
    opacity: 0,
    x: isTab ? direction * 18 : 0,
    scale: isTab ? .992 : 1,
  }),
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: ({ direction, isTab }: { direction: number; isTab: boolean }) => ({
    opacity: 0,
    x: isTab ? direction * -12 : 0,
    scale: isTab ? .996 : 1,
  }),
};

const AppContent = () => {
  const { activeView, setActiveView } = useT1ger();
  const { dailyTacticalStatus, brainState, language } = useBrain();
  const { appUser, loading } = useAuth();
  const [activeMission, setActiveMission] = useState<any>(null);
  const mainRef = useRef<HTMLElement>(null);
  const previousViewRef = useRef(activeView);
  
  const [loadingMission, setLoadingMission] = useState(false);
  const [loadingText, setLoadingText] = useState('Sincronizando...');
  const [onboardingBypassed, setOnboardingBypassed] = useState(false);
  const forceOnboardingFromUrl = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('forceOnboarding') === '1';
  const previewAppFromUrl = import.meta.env.DEV && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('previewApp') === '1';

  useEffect(() => {
    if (!activeView) {
      setActiveView('learn');
    }
  }, [activeView, setActiveView]);

  useEffect(() => {
    const requestedView = new URLSearchParams(window.location.search).get('view');
    const allowedViews = ['learn', 'build', 'compete', 'profile', 'coach'];
    if (requestedView === 'home') {
      setActiveView('learn');
    } else if (requestedView && allowedViews.includes(requestedView)) {
      setActiveView(requestedView as any);
    }
  }, [setActiveView]);

  useLayoutEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    previousViewRef.current = activeView;
  }, [activeView]);

  const startMission = async (baseMission: any) => {
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
        return;
      }
    }

    // Curated investing and business lessons open immediately and never wait on AI.
    if (baseMission.competency !== 'ai') {
      setActiveMission({
        ...baseMission,
        concept_flashcard: baseMission.concept,
        business_scenario: baseMission.scenario,
        mission_brief: baseMission.taskBrief,
      });
      setActiveView('mission');
      return;
    }

    setLoadingMission(true);
    const loadingPhrases = [
      'Personalizando tu siguiente lección...',
      'Revisando tu progreso reciente...',
      'Preparando un reto a tu nivel...',
    ];
    let phraseIndex = 0;
    setLoadingText(loadingPhrases[0]);
    const phraseInterval = window.setInterval(() => {
      phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
      setLoadingText(loadingPhrases[phraseIndex]);
    }, 1100);

    try {

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

  const dayType = dailyTacticalStatus.dayType || 'focus';

  if (loading) {
    return <AppSkeleton />;
  }

  const FORCE_ONBOARDING_TEST = import.meta.env.VITE_FORCE_ONBOARDING_TEST === 'true';

  if (!previewAppFromUrl && (((FORCE_ONBOARDING_TEST || forceOnboardingFromUrl) && !onboardingBypassed) || !appUser || !appUser.onboardingComplete)) {
    return <OnboardingFlow onComplete={() => setOnboardingBypassed(true)} />;
  }

  const isFullscreen = activeView === 'mission' || activeView === 'debrief' || activeView === 'coach';

  // Simulator Mock Native Styles
  const simPlatform = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('sim_platform') : null;
  const platformClasses = simPlatform === 'ios' ? 'pt-14 pb-8 rounded-[40px] border border-black/10' : simPlatform === 'android' ? 'pt-8 pb-4 rounded-[30px] border border-black/10' : '';
  const previousTabIndex = TAB_VIEW_ORDER.indexOf(previousViewRef.current as typeof TAB_VIEW_ORDER[number]);
  const currentTabIndex = TAB_VIEW_ORDER.indexOf(activeView as typeof TAB_VIEW_ORDER[number]);
  const isTabTransition = previousTabIndex >= 0 && currentTabIndex >= 0;
  const direction = !isTabTransition || currentTabIndex >= previousTabIndex ? 1 : -1;
  const transitionContext = { direction, isTab: isTabTransition };

  const activeContent = (() => {
    if (activeView === 'mission' && activeMission) return <MissionEngine mission={activeMission} onComplete={() => setActiveView('learn')} />;
    if (activeView === 'debrief') return <EveningInterrogation onComplete={() => setActiveView('learn')} />;
    if (activeView === 'build') return <BuildTab onStartMission={startMission} />;
    if (activeView === 'learn') return <Learn onStartMission={startMission} />;
    if (activeView === 'compete') return <SquadTab />;
    if (activeView === 'profile') return <Profile />;
    if (activeView === 'coach') return <Coach />;
    return null;
  })();

  return (
    <MotionConfig reducedMotion="user">
    <div className={`h-[100dvh] w-full max-w-md mx-auto sm:border-x sm:border-white/5 sm:shadow-[0_0_90px_rgba(0,20,16,.55)] relative flex flex-col bg-[#071C19] text-[#EAF4F1] font-sans font-medium overflow-hidden theme-${dayType} ${platformClasses}`}>
      <a href="#main-content" className="skip-link">{language === 'es' ? 'Saltar al contenido' : 'Skip to content'}</a>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_-10%,rgba(239,112,48,.11),transparent_32%),linear-gradient(180deg,#071C19_0%,#061815_100%)]" />
      
      <OfflineBanner />

      {/* HUD - visible on non-fullscreen views */}
      {!isFullscreen && <HUD />}
      
      {/* Main scrollable content area */}
      <main ref={mainRef} id="main-content" className={`t1ger-scroll-area flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${isFullscreen ? '' : 'px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))]'}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
          <AnimatePresence initial={false} mode="popLayout" custom={transitionContext}>
            {activeContent && (
              <motion.div
                key={activeView}
                custom={transitionContext}
                variants={PAGE_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ ...PAGE_SPRING, opacity: { duration: .16, ease: [0.22, 1, 0.36, 1] } }}
                className="min-h-full transform-gpu"
              >
                {activeContent}
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
    </MotionConfig>
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
