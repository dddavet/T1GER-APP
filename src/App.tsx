import React, { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { T1gerProvider, useT1ger } from './contexts/T1gerContext';
import { BrainProvider, useBrain } from './contexts/BrainContext';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { HUD } from './components/HUD';
import { NavDock } from './components/NavDock';
import { OfflineBanner } from './components/ui/OfflineBanner';
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

const loadBuildTab = () => import('./components/BuildTab').then(module => ({ default: module.BuildTab }));
const loadLearn = () => import('./pages/Learn').then(module => ({ default: module.Learn }));
const loadProfile = () => import('./pages/Profile').then(module => ({ default: module.Profile }));
const loadSquadTab = () => import('./components/social/SquadTab').then(module => ({ default: module.SquadTab }));
const BuildTab = lazy(loadBuildTab);
const Learn = lazy(loadLearn);
const Profile = lazy(loadProfile);
const Coach = lazy(() => import('./pages/Coach').then(module => ({ default: module.Coach })));
const MissionEngine = lazy(() => import('./components/MissionEngine').then(module => ({ default: module.MissionEngine })));
const CuratedLessonPlayer = lazy(() => import('./components/learn/CuratedLessonPlayer').then(module => ({ default: module.CuratedLessonPlayer })));
const SquadTab = lazy(loadSquadTab);
const EveningInterrogation = lazy(() => import('./components/EveningInterrogation').then(module => ({ default: module.EveningInterrogation })));
const OnboardingFlow = lazy(() => import('./components/OnboardingFlow').then(module => ({ default: module.OnboardingFlow })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(module => ({ default: module.TermsOfService })));
const DeleteAccount = lazy(() => import('./pages/DeleteAccount').then(module => ({ default: module.DeleteAccount })));
const Simulator = lazy(() => import('./pages/Simulator').then(module => ({ default: module.Simulator })));
const DevHarness = import.meta.env.DEV
  ? lazy(() => import('./dev/DevHarness').then(module => ({ default: module.DevHarness })))
  : null;

const TAB_VIEW_ORDER = ['learn', 'build', 'compete', 'profile'] as const;
const PAGE_VARIANTS = {
  initial: ({ direction, isTab }: { direction: number; isTab: boolean }) => ({
    opacity: 0,
    x: isTab ? direction * 10 : 0,
  }),
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] as const }
  },
  exit: ({ direction, isTab }: { direction: number; isTab: boolean }) => ({
    opacity: 0,
    x: isTab ? direction * -8 : 0,
    transition: { duration: 0.12, ease: [0.23, 1, 0.32, 1] as const }
  }),
};

const AppContent = () => {
  const { activeView, setActiveView } = useT1ger();
  const { dailyTacticalStatus, brainState, language, getDailyPipelineMissions } = useBrain();
  const { appUser, loading } = useAuth();
  const [activeMission, setActiveMission] = useState<ActiveMission | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const previousViewRef = useRef(activeView);
  const urlViewAppliedRef = useRef(false);
  
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
    let cancelled = false;
    let removeListener: (() => Promise<void>) | undefined;
    const openAppUrl = (rawUrl: string) => {
      try {
        const incoming = new URL(rawUrl);
        const inviteUid = incoming.pathname.match(/^\/invite\/([^/?#]+)/i)?.[1]
          || (incoming.hostname === 'invite' ? incoming.pathname.replace(/^\//, '') : '');
        if (inviteUid) {
          sessionStorage.setItem('t1ger_pending_invite_uid', decodeURIComponent(inviteUid));
          setActiveView('compete');
        }
      } catch {
        // Ignore malformed URLs from third-party intents.
      }
    };

    void import('@capacitor/app').then(async ({ App }) => {
      const launch = await App.getLaunchUrl();
      if (!cancelled && launch?.url) openAppUrl(launch.url);
      const listener = await App.addListener('appUrlOpen', event => openAppUrl(event.url));
      removeListener = () => listener.remove();
      if (cancelled) await listener.remove();
    }).catch(() => undefined);

    return () => {
      cancelled = true;
      void removeListener?.();
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

  // Warm the primary tab chunks after the first screen is interactive. This
  // keeps the initial bundle small while making the first tab switch instant.
  useEffect(() => {
    if (!appUser?.onboardingComplete && !onboardingBypassed) return;
    const timers = [
      window.setTimeout(() => { void loadBuildTab(); }, 900),
      window.setTimeout(() => { void loadSquadTab(); }, 1700),
      window.setTimeout(() => { void loadProfile(); }, 2500),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [appUser?.onboardingComplete, onboardingBypassed]);


  useEffect(() => {
    if (urlViewAppliedRef.current) return;
    urlViewAppliedRef.current = true;
    const inviteUid = window.location.pathname.match(/^\/invite\/([^/?#]+)/i)?.[1];
    if (inviteUid) {
      sessionStorage.setItem('t1ger_pending_invite_uid', decodeURIComponent(inviteUid));
      setActiveView('compete');
      return;
    }
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
    const startDailyRescue = () => {
      // The guided journey owns readiness; never bypass it with an unrelated legacy mission.
      setActiveMission(null);
      setActiveView('learn');
    };

    window.addEventListener('t1ger_start_daily_rescue', startDailyRescue);
    return () => window.removeEventListener('t1ger_start_daily_rescue', startDailyRescue);
  }, [setActiveView]);

  const dayType = dailyTacticalStatus.dayType || 'focus';

  const viewFromUrl = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('view') : null;
  if (viewFromUrl === 'privacy') return <PrivacyPolicy onBack={() => window.history.back()} />;
  if (viewFromUrl === 'terms') return <TermsOfService onBack={() => window.history.back()} />;
  if (window.location.pathname === '/delete-account') return <DeleteAccount />;

  useEffect(() => {
    if (!activeView) {
      setActiveView('learn');
    }
  }, [activeView, setActiveView]);

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
            onFieldMissionReady={() => {
              setActiveMission(null);
              setActiveView('build');
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
      {DevHarness && <Suspense fallback={null}><DevHarness /></Suspense>}

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
        {activeContent && (
          <motion.div
            key={activeView}
            custom={transitionContext}
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            className={isFullscreen ? 'h-full flex flex-col w-full' : 'min-h-full w-full'}
          >
            {activeContent}
          </motion.div>
        )}
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
