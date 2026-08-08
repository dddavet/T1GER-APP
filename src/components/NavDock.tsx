import React from 'react';
import { BookOpen, Target, Trophy, UserRound } from 'lucide-react';
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
    { id: 'profile', icon: UserRound, label: isEs ? 'Perfil' : 'Profile' },
  ] as const;

  const haptic = () => {
    if (typeof window === 'undefined' || !window.navigator.vibrate) return;
    window.navigator.vibrate(12);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[calc(.65rem+env(safe-area-inset-bottom))]">
      <nav
        aria-label={isEs ? 'Navegación principal' : 'Primary navigation'}
        className="pointer-events-auto flex w-full max-w-[25rem] items-center gap-1 rounded-[1.65rem] border border-white/[.09] bg-[#0A2722]/98 p-1.5 shadow-[0_20px_52px_rgba(0,16,13,.48),inset_0_1px_0_rgba(255,255,255,.055)]"
      >
        {tabs.map(tab => {
          const active = activeView === tab.id;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              type="button"
              whileTap={{ scale: .94, y: 1 }}
              onClick={() => {
                if (active) return;
                haptic();
                setActiveView(tab.id);
              }}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-h-13 flex-1 flex-col items-center justify-center gap-1 rounded-[1.18rem] transition-colors duration-300 ${active ? 'text-[#FF8A4C]' : 'text-[#688C84] hover:text-[#A8C0BA]'}`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-[1.18rem] bg-[#F07B3E]/10 shadow-[inset_0_1px_0_rgba(255,255,255,.045)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <motion.span
                className="relative flex"
                animate={{ y: active ? -1 : 0, scale: active ? 1.06 : 1 }}
                transition={{ type: 'spring', stiffness: 440, damping: 28 }}
              >
                <Icon size={19} strokeWidth={active ? 2.35 : 1.9} />
              </motion.span>
              <motion.span
                className="relative text-[10px] font-semibold tracking-[-.01em]"
                animate={{ opacity: active ? 1 : .78, y: active ? -1 : 0 }}
                transition={{ duration: .18 }}
              >
                {tab.label}
              </motion.span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
});
