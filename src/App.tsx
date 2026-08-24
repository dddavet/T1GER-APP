import React, { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { T1gerProvider, useT1ger } from './contexts/T1gerContext';
import { BrainProvider, useBrain } from './contexts/BrainContext';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { HUD } from './components/HUD';
import { NavDock } from './components/NavDock';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { CoachFAB } from './components/CoachFAB';
import { getUserWeaknesses } from './services/brainService';
import { AchievementTracker } from './components/AchievementTracker';
import { TacticalPomodoro } from './components/TacticalPomodoro';

import { AppSkeleton } from './components/ui/AppSkeleton';
import { MissionSkeleton } from './components/ui/MissionSkeleton';
import { MISSION_BANK } from './services/missionBank';
import type { BankMission } from './services/missionBank';

type ActiveMission = BankMission & {
  dayNumber?: number;
  isCuratedAI?: boolean;
  curatedData?: unknown;
  concept_flashcard?: string;
  business_scenario?: string;
  mission_brief?: string;
};

const BuildTab = lazy(() => import('./components/BuildTab').then(module => ({ default: module.BuildTab })));
const Learn = lazy(() => import('./pages/Learn').then(module => ({ default: module.Learn })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const Coach = lazy(() => import('./pages/Coach').then(module => ({ default: module.Coach })));
const MissionEngine = lazy(() => import('./components/MissionEngine').then(module => ({ default: module.MissionEngine })));
const CuratedLessonPlayer = lazy(() => import('./components/learn/CuratedLessonPlayer').then(module => ({ default: module.CuratedLessonPlayer })));
const SquadTab = lazy(() => import('./components/social/SquadTab').then(module => ({ default: module.SquadTab })));
const EveningInterrogation = lazy(() => import('./components/EveningInterrogation').then(module => ({ default: module.EveningInterrogation })));
const OnboardingFlow = lazy(() => import('./components/OnboardingFlow').then(module => ({ default: module.OnboardingFlow })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(module => ({ default: module.TermsOfService })));
const Simulator = lazy(() => import('./pages/Simulator').then(module => ({ default: module.Simulator })));

const TAB_VIEW_ORDER = ['learn', 'build', 'compete', 'profile'] as const;
const PAGE_VARIANTS = {
  initial: ({ direction, isTab }: { direction: number; isTab: boolean }) => ({
    opacity: 0,
    y: isTab ? 8 : 0,
    scale: isTab ? 0.985 : 1,
  }),
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 600, damping: 35, mass: 0.6 }
  },
  exit: ({ direction, isTab }: { direction: number; isTab: boolean }) => ({
    opacity: 0,
    y: isTab ? -4 : 0,
    scale: isTab ? 0.99 : 1,
    transition: { duration: 0.08, ease: [0.23, 1, 0.32, 1] as const }
  }),
};

const AppContent = () => {
  const { activeView, setActiveView } = useT1ger();
  const { dailyTacticalStatus, brainState, language, getDailyPipelineMissions } = useBrain();
  const { appUser, loading } = useAuth();
  const [activeMission, setActiveMission] = useState<ActiveMission | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const previousViewRef = useRef(activeView);
  
  const [loadingMission, setLoadingMission] = useState(false);
  const [loadingText, setLoadingText] = useState('Sincronizando...');
  const forceOnboardingFromUrl = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('forceOnboarding') === '1';
  const [onboardingBypassed, setOnboardingBypassed] = useState(() => {
    if (typeof window !== 'undefined') {
      return !forceOnboardingFromUrl && localStorage.getItem('t1ger_onboarding_completed') === 'true';
    }
    return false;
  });
  const previewAppFromUrl = import.meta.env.DEV && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('previewApp') === '1';

  // Register the global push deep-link bridge. The SDK itself is initialized
  // when there is a user to identify, avoiding duplicate/racing init calls.
  useEffect(() => {
    const handlePushDeepLink = (event: any) => {
      const data = event.detail;
      if (data?.screen === 'daily_mission' || data?.view === 'learn') {
        setActiveView('learn');
        if (data?.missionId) {
          const found = MISSION_BANK.find(m => m.id === data.missionId);
          if (found) setActiveMission(found);
        }
      } else if (data?.view) {
        setActiveView(data.view);
      }
    };

    window.addEventListener('t1ger_push_deeplink', handlePushDeepLink);
    return () => {
      window.removeEventListener('t1ger_push_deeplink', handlePushDeepLink);
    };
  }, [setActiveView]);

  useEffect(() => {
    if (appUser?.uid) {
      let cancelled = false;
      import('./services/oneSignalService').then(async ({ OneSignalService }) => {
        await OneSignalService.init();
        if (cancelled) return;
        await OneSignalService.identifyUser(appUser.uid, {
          streak_days: brainState.learnStreak,
          language,
        });
      });

      return () => {
        cancelled = true;
      };
    }
  }, [appUser?.uid, brainState.learnStreak, language]);

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

  const startMission = async (baseMission: ActiveMission) => {
    if (baseMission.competency === 'ai') {
      const dayNum = baseMission.dayNumber || 1;
      const { AI_CURATED_CURRICULUM } = await import('./services/aiCuratedLibrary');
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
      const { generateAdaptiveLesson } = await import('./services/gemini');
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

  useEffect(() => {
    const startDailyRescue = (event: Event) => {
      const requestedMissionId = (event as CustomEvent<{ missionId?: string }>).detail?.missionId;
      const requestedMission = requestedMissionId
        ? MISSION_BANK.find((mission) => mission.id === requestedMissionId)
        : undefined;
      const dailyMission = getDailyPipelineMissions().learnNode;
      const completedMissionIds = new Set(
        brainState.missionHistory.filter((record) => record.completed).map((record) => record.missionId)
      );
      const fallbackMission = MISSION_BANK.find((mission) =>
        (mission.nodeType === 'learn' || mission.type === 'book_lesson')
        && !completedMissionIds.has(mission.id)
      );
      const targetMission = requestedMission || dailyMission || fallbackMission;

      if (targetMission) {
        void startMission(targetMission);
      } else {
        setActiveView('learn');
      }
    };

    window.addEventListener('t1ger_start_daily_rescue', startDailyRescue);
    return () => window.removeEventListener('t1ger_start_daily_rescue', startDailyRescue);
  }, [brainState.missionHistory, getDailyPipelineMissions, setActiveView]);

  const dayType = dailyTacticalStatus.dayType || 'focus';

  const viewFromUrl = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('view') : null;
  if (viewFromUrl === 'privacy') return <PrivacyPolicy onBack={() => window.history.back()} />;
  if (viewFromUrl === 'terms') return <TermsOfService onBack={() => window.history.back()} />;

  if (loading) {
    return <AppSkeleton />;
  }

  const FORCE_ONBOARDING_TEST = import.meta.env.VITE_FORCE_ONBOARDING_TEST === 'true';

  // Simulator Mock Native Styles
  const simPlatform = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('sim_platform') : null;
  const platformClasses = simPlatform === 'ios' ? 'pt-14 pb-8 rounded-[40px] border border-black/10' : simPlatform === 'android' ? 'pt-8 pb-4 rounded-[30px] border border-black/10' : '';

  if (!previewAppFromUrl && (((FORCE_ONBOARDING_TEST || forceOnboardingFromUrl) && !onboardingBypassed) || !appUser || !appUser.onboardingComplete)) {
    return (
      <OnboardingFlow
        onComplete={() => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('t1ger_onboarding_completed', 'true');
          }
          setOnboardingBypassed(true);
        }}
      />
    );
  }

  if (activeMission) {
    if (activeMission.type === 'book_lesson' || activeMission.nodeType === 'learn') {
      return (
        <MotionConfig reducedMotion="user">
          <div className={`h-[100dvh] w-full max-w-md mx-auto relative flex flex-col bg-[#09090B] text-[#FFFFFF] font-sans font-medium overflow-hidden theme-${dayType} ${platformClasses}`}>
            <CuratedLessonPlayer
              mission={activeMission}
              onClose={() => {
                setActiveMission(null);
                setActiveView('learn');
              }}
              onExecuteApplyMission={(applyMission) => {
                setActiveMission(applyMission);
                setActiveView('mission');
              }}
            />
          </div>
        </MotionConfig>
      );
    }
    return (
      <MotionConfig reducedMotion="user">
        <div className={`h-[100dvh] w-full max-w-md mx-auto relative flex flex-col bg-[#09090B] text-[#FFFFFF] font-sans font-medium overflow-hidden theme-${dayType} ${platformClasses}`}>
          <MissionEngine
            mission={activeMission}
            onComplete={() => {
              setActiveMission(null);
              setActiveView('learn');
            }}
          />
        </div>
      </MotionConfig>
    );
  }

  const isFullscreen = activeView === 'debrief' || activeView === 'coach';

  const previousTabIndex = TAB_VIEW_ORDER.indexOf(previousViewRef.current as typeof TAB_VIEW_ORDER[number]);
  const currentTabIndex = TAB_VIEW_ORDER.indexOf(activeView as typeof TAB_VIEW_ORDER[number]);
  const isTabTransition = previousTabIndex >= 0 && currentTabIndex >= 0;
  const direction = !isTabTransition || currentTabIndex >= previousTabIndex ? 1 : -1;
  const transitionContext = { direction, isTab: isTabTransition };

  const activeContent = (() => {
    if (activeView === 'debrief') return <EveningInterrogation onComplete={() => setActiveView('learn')} />;
    if (activeView === 'build') return <BuildTab onStartMission={startMission} />;
    if (activeView === 'learn') return <Learn onStartMission={startMission} />;
    if (activeView === 'compete') return <SquadTab />;
    if (activeView === 'profile') return <Profile />;
    if (activeView === 'coach') return <Coach />;
    return null;
  })();

  const mainLayout = (
    <MotionConfig reducedMotion="user">
    <div className={`h-[100dvh] w-full max-w-md mx-auto sm:border-x sm:border-white/5 sm:shadow-[0_0_90px_rgba(0,0,0,.8)] relative flex flex-col bg-[#09090B] text-[#FFFFFF] font-sans font-medium overflow-hidden theme-${dayType} ${platformClasses}`}>
      <a href="#main-content" className="skip-link">{language === 'es' ? 'Saltar al contenido' : 'Skip to content'}</a>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_-10%,rgba(255,115,0,.12),transparent_35%),linear-gradient(180deg,#09090B_0%,#050507_100%)]" />
      
      <AchievementTracker />
      <TacticalPomodoro />
      <OfflineBanner />

      {/* HUD - visible on non-fullscreen views */}
      {!isFullscreen && <HUD />}
      
      {/* Main content area */}
      <main
        ref={mainRef}
        id="main-content"
        className={`t1ger-scroll-area flex-1 min-h-0 ${
          isFullscreen
            ? 'overflow-hidden flex flex-col'
            : 'overflow-y-auto overflow-x-hidden px-3.5 sm:px-4 pb-[calc(5rem+env(safe-area-inset-bottom))]'
        }`}
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
              className={isFullscreen ? 'h-full flex flex-col will-change-transform w-full' : 'min-h-full will-change-transform w-full'}
            >
              {activeContent}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {!isFullscreen && <CoachFAB />}
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

  return mainLayout;
};

export default function App() {
  if (typeof window !== 'undefined' && window.location.pathname === '/sim') {
    return <Suspense fallback={<AppSkeleton />}><Simulator /></Suspense>;
  }

  return (
    <AuthProvider>
      <BrainProvider>
        <T1gerProvider>
          <Suspense fallback={<AppSkeleton />}>
            <AppContent />
          </Suspense>
        </T1gerProvider>
      </BrainProvider>
    </AuthProvider>
  );
}
