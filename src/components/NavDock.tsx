import React, { useState, Suspense } from 'react';
import { BookOpen, Target, Trophy, UserCircle } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { useAuth } from '../contexts/AuthContext';
import { SoundEffects } from '../services/soundEffects';

const MentorPaywallModal = React.lazy(() =>
  import('./MentorPaywallModal').then(m => ({ default: m.MentorPaywallModal }))
);

interface NavTab {
  id: 'learn' | 'build' | 'compete' | 'profile';
  icon: React.ComponentType<{ size?: number; weight?: 'fill' | 'bold' | 'regular' | 'light' | 'thin' | 'duotone'; className?: string }>;
  label: string;
}

export const NavDock = React.memo(() => {
  const reducedMotion = useReducedMotion();
  const { activeView, setActiveView } = useT1ger();
  const { language } = useBrain();
  const { appUser } = useAuth();
  const [showMentorPaywall, setShowMentorPaywall] = useState(false);
  const isEs = language === 'es';
  const isPro = Boolean(appUser?.isPro || appUser?.isFounder);

  const leftTabs: NavTab[] = [
    { id: 'learn', icon: BookOpen, label: isEs ? 'Aprender' : 'Learn' },
    { id: 'build', icon: Target, label: isEs ? 'Aplicar' : 'Apply' },
  ];

  const rightTabs: NavTab[] = [
    { id: 'compete', icon: Trophy, label: isEs ? 'Competir' : 'Compete' },
    { id: 'profile', icon: UserCircle, label: isEs ? 'Perfil' : 'Profile' },
  ];

  const haptic = () => {
    if (typeof window === 'undefined' || !window.navigator.vibrate) return;
    window.navigator.vibrate(12);
  };

  const handleMentorClick = () => {
    haptic();
    SoundEffects.playTap();
    if (isPro) {
      setActiveView('coach');
    } else {
      setShowMentorPaywall(true);
    }
  };

  const renderTab = (tab: NavTab) => {
    const active = activeView === tab.id;
    const Icon = tab.icon;
    return (
      <motion.button
        key={tab.id}
        type="button"
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.02 }}
        onPointerDown={() => {
          if (!active) SoundEffects.playToggle();
        }}
        onClick={() => {
          if (active) return;
          haptic();
          setActiveView(tab.id);
        }}
        aria-current={active ? 'page' : undefined}
        className={`relative flex min-h-11 flex-1 min-w-0 flex-col items-center justify-center gap-0.5 rounded-2xl transition-colors duration-200 cursor-pointer ${
          active ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        {active && (
          <motion.span
            layoutId="navdock-active-pill"
            className="absolute inset-0 rounded-2xl border border-[var(--ob-accent)]/35 bg-[var(--ob-accent)]/15 shadow-[0_0_12px_rgba(255,115,0,0.15)]"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
        <motion.span
          className="relative flex z-10"
          animate={{ y: active ? -1 : 0, scale: active ? 1.08 : 1 }}
          transition={{ type: 'spring', stiffness: 600, damping: 35 }}
        >
          <Icon size={18} weight={active ? 'fill' : 'bold'} className={active ? 'text-[var(--ob-accent)]' : ''} />
        </motion.span>
        <motion.span
          className={`relative z-10 text-[10px] font-semibold truncate max-w-full px-1 ${
            active ? 'text-white' : 'text-zinc-500'
          }`}
          animate={{ y: active ? -1 : 0 }}
          transition={{ duration: 0.1 }}
        >
          {tab.label}
        </motion.span>
      </motion.button>
    );
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[calc(.5rem+env(safe-area-inset-bottom))] select-none">
        <div className="pointer-events-auto w-full max-w-[23.5rem] rounded-[1.75rem] border border-white/12 bg-[#121216]/85 backdrop-blur-2xl p-1.5 shadow-[0_20px_48px_rgba(0,0,0,0.65),0_0_1px_rgba(255,255,255,0.15)]">
          <nav
            aria-label={isEs ? 'Navegación principal' : 'Primary navigation'}
            className="flex w-full items-center gap-1 rounded-[1.4rem] border border-white/[0.08] bg-[#09090B]/90 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            {/* Left tabs: Learn, Apply */}
            {leftTabs.map(renderTab)}

            {/* Center elevated Mentor circular button */}
            <div className="relative flex flex-col items-center justify-center shrink-0 px-1.5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.88, y: 3 }}
                whileHover={{ scale: 1.06 }}
                animate={
                  reducedMotion
                    ? undefined
                    : {
                        boxShadow: [
                          '0 10px 24px rgba(255,115,0,0.45)',
                          '0 14px 30px rgba(255,115,0,0.7)',
                          '0 10px 24px rgba(255,115,0,0.45)',
                        ],
                      }
                }
                transition={{
                  repeat: Infinity,
                  duration: 2.8,
                  ease: 'easeInOut',
                }}
                onPointerDown={() => SoundEffects.playTap()}
                onClick={handleMentorClick}
                aria-label={isEs ? 'Mentor IA T1GER' : 'T1GER AI Mentor'}
                className="relative -mt-6 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gradient-to-tr from-[#FF5500] via-[#FF7300] to-[#FFA033] p-[2px] ring-4 ring-[#121216]/90 shadow-[0_8px_20px_rgba(255,115,0,0.4)] cursor-pointer"
              >
                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#FF8A2A] to-[#E65100] shadow-[inset_0_1px_2px_rgba(255,255,255,0.45)] overflow-hidden">
                  <img
                    src="/t1ger-avatar.png"
                    alt="T1GER Mentor"
                    className="h-10 w-10 scale-110 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] select-none pointer-events-none transition-transform hover:scale-125"
                  />
                </div>
                {!isPro && (
                  <span className="absolute -top-1 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-black shadow-md ring-2 ring-[#121216]">
                    ★
                  </span>
                )}
              </motion.button>
              <span className="mt-0.5 text-[9px] font-bold text-amber-400/90 tracking-tight">
                {isEs ? 'Mentor' : 'Mentor'}
              </span>
            </div>

            {/* Right tabs: Compete, Profile */}
            {rightTabs.map(renderTab)}
          </nav>
        </div>
      </div>

      <Suspense fallback={null}>
        {showMentorPaywall && (
          <MentorPaywallModal
            isOpen={showMentorPaywall}
            onClose={() => setShowMentorPaywall(false)}
          />
        )}
      </Suspense>
    </>
  );
});
