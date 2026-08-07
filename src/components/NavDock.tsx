import React from 'react';
import { BookOpen, Home, Target, Trophy, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';

export const NavDock = React.memo(() => {
  const { activeView, setActiveView } = useT1ger();
  const { language } = useBrain();
  const isEs = language === 'es';
  const tabs = [
    { id: 'home', icon: Home, label: isEs ? 'Hoy' : 'Today' },
    { id: 'learn', icon: BookOpen, label: isEs ? 'Ruta' : 'Path' },
    { id: 'build', icon: Target, label: isEs ? 'Aplicar' : 'Apply' },
    { id: 'compete', icon: Trophy, label: isEs ? 'Liga' : 'League' },
    { id: 'profile', icon: User, label: isEs ? 'Perfil' : 'Profile' },
  ] as const;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[calc(.6rem+env(safe-area-inset-bottom))]">
      <nav aria-label={isEs ? 'Navegación principal' : 'Primary navigation'} className="pointer-events-auto flex w-full max-w-[25rem] items-center gap-1 rounded-[1.6rem] border border-white/10 bg-[#09231F]/95 p-1.5 shadow-[0_18px_48px_rgba(0,16,13,.42)] backdrop-blur-xl">
        {tabs.map(tab => {
          const active = activeView === tab.id;
          const Icon = tab.icon;
          return (
            <motion.button key={tab.id} whileTap={{ scale: .94 }} onClick={() => setActiveView(tab.id)} aria-current={active ? 'page' : undefined} className={`relative flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-[1.15rem] transition ${active ? 'text-[var(--t1ger-orange)]' : 'text-[#678B83] hover:text-[#9DBAB4]'}`}>
              {active && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-[1.15rem] bg-[var(--t1ger-orange)]/10" transition={{ type: 'spring', stiffness: 430, damping: 34 }} />}
              <Icon className="relative" size={19} strokeWidth={active ? 2.5 : 2} />
              <span className="relative text-[10px] font-semibold">{tab.label}</span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
});
