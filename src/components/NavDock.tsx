import React from 'react';
import { BookOpen, Brain, Target, UserCircle } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { SoundEffects } from '../services/soundEffects';

interface NavTab {
  id: 'learn' | 'build' | 'master' | 'profile';
  icon: React.ComponentType<{ size?: number; weight?: 'fill' | 'bold' | 'regular' | 'light' | 'thin' | 'duotone'; className?: string }>;
  label: string;
}

export const NavDock = React.memo(() => {
  const { activeView, setActiveView } = useT1ger();
  const { language } = useBrain();
  const isEs = language === 'es';
  const tabs: NavTab[] = [
    { id: 'learn', icon: BookOpen, label: isEs ? 'Aprender' : 'Learn' },
    { id: 'build', icon: Target, label: isEs ? 'Aplicar' : 'Apply' },
    { id: 'master', icon: Brain, label: isEs ? 'Dominar' : 'Master' },
    { id: 'profile', icon: UserCircle, label: isEs ? 'Perfil' : 'Profile' },
  ];

  const haptic = () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(12);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[calc(.5rem+env(safe-area-inset-bottom))] select-none">
      <div className="pointer-events-auto w-full max-w-[23.5rem] rounded-[1.85rem] border border-white/10 bg-[#121216]/90 p-1.5 shadow-[0_24px_48px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
        <nav aria-label={isEs ? 'Navegación principal' : 'Primary navigation'} className="flex w-full items-center gap-1 rounded-[1.45rem] border border-white/[0.06] bg-[#09090B]/95 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          {tabs.map(tab => {
            const active = activeView === tab.id;
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                type="button"
                whileTap={{ scale: 0.92 }}
                onPointerDown={() => { if (!active) SoundEffects.playToggle(); }}
                onClick={() => {
                  if (active) return;
                  haptic();
                  setActiveView(tab.id);
                }}
                aria-current={active ? 'page' : undefined}
                className={`relative flex min-h-12 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl transition-colors duration-200 ${active ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                {active && (
                  <motion.span layoutId="navdock-active-pill" className="absolute inset-0 rounded-2xl border border-white/10 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_8px_rgba(0,0,0,0.4)]" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                )}
                <span className="relative z-10 flex"><Icon size={19} weight={active ? 'fill' : 'bold'} className={active ? 'text-[var(--ob-accent)]' : ''} /></span>
                <span className={`relative z-10 max-w-full truncate px-1 text-[10px] ${active ? 'font-bold text-white' : 'font-semibold text-zinc-500'}`}>{tab.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </div>
  );
});
