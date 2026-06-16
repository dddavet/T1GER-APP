import React, { useEffect, useState, Suspense, lazy } from 'react';
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
import { ApexEvolution } from './components/animations/ApexEvolution';

import { OnboardingFlow } from './components/OnboardingFlow';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-full w-full bg-[#050505] gap-4">
    <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
    <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest">Loading Predator Profile...</p>
  </div>
);

const AppContent = () => {
  const { activeView, setActiveView } = useT1ger();
  const { dailyTacticalStatus } = useBrain();
  const { user, appUser, loading } = useAuth();
  const [activeMission, setActiveMission] = useState<any>(null);

  useEffect(() => {
    if (!activeView) {
      setActiveView('home');
    }
  }, [activeView, setActiveView]);

  const startMission = (mission: any) => {
    setActiveMission(mission);
    setActiveView('mission');
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

  // Intercept the entire app experience if onboarding isn't complete
  if (!appUser) {
    return <LoadingSpinner />;
  }

  if (!appUser.onboardingComplete) {
    return <OnboardingFlow />;
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
                <MissionEngine mission={activeMission} onComplete={() => setActiveView('home')} />
              </motion.div>
            )}
            {activeView === 'debrief' && (
              <motion.div key="debrief" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EveningInterrogation onComplete={() => setActiveView('home')} />
              </motion.div>
            )}
            {activeView === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
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

      {/* Bottom Nav + Coach FAB */}
      {!isFullscreen && <CoachFAB />}
      {!isFullscreen && <NavDock />}
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
