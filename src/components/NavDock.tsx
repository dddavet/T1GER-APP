import React from 'react';
import { BookOpen, Target, Trophy, UserCircle } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';

export const NavDock = React.memo(() => {
  const { activeView, setActiveView } = useT1ger();
  const { language } = useBrain();
  const isEs = language === 'es';
  const tabs = [
    { id: 'learn', icon: BookOpen, label: isEs ? 'Aprender' : 'Learn' },
    { id: 'build', icon: Target, label: isEs ? 'Aplicar' : 'Apply' },
    { id: 'compete', icon: Trophy, label: isEs ? 'Competir' : 'Compete' },
    { id: 'profile', icon: UserCircle, label: isEs ? 'Perfil' : 'Profile' },
  ] as const;

  const haptic = () => {
    if (typeof window === 'undefined' || !window.navigator.vibrate) return;
    window.navigator.vibrate(12);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[calc(.5rem+env(safe-area-inset-bottom))] select-none">
      <div className="pointer-events-auto w-full max-w-[22.5rem] rounded-[1.75rem] border border-white/10 bg-[#121216] p-1.5 shadow-[0_18px_42px_rgba(0,0,0,0.58)]">
        <nav
          aria-label={isEs ? 'Navegación principal' : 'Primary navigation'}
          className="flex w-full items-center gap-1 rounded-[1.4rem] border border-white/[0.08] bg-[#09090B] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
        >
          {tabs.map(tab => {
            const active = activeView === tab.id;
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  if (active) return;
                  haptic();
                  setActiveView(tab.id);
                }}
                aria-current={active ? 'page' : undefined}
                className={`relative flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl transition-colors duration-200 cursor-pointer ${
                  active ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="navdock-active-pill"
                    className="absolute inset-0 rounded-2xl border border-[var(--ob-accent)]/30 bg-[var(--ob-accent)]/13"
                    transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
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
                  className={`relative z-10 text-[10px] font-semibold ${
                    active ? 'text-white' : 'text-zinc-500'
                  }`}
                  animate={{ y: active ? -1 : 0 }}
                  transition={{ duration: 0.1 }}
                >
                  {tab.label}
                </motion.span>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </div>
  );
});
