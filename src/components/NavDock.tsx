import React from 'react';
import { useT1ger } from '../contexts/T1gerContext';
import { Shield, BookOpen, RotateCcw, User } from 'lucide-react';
import { motion } from 'motion/react';

import { Trophy, Hammer } from 'lucide-react';

const tabs = [
  { id: 'learn', icon: BookOpen, label: 'Learn' },
  { id: 'build', icon: Hammer, label: 'Build' },
  { id: 'compete', icon: Trophy, label: 'Compete' },
  { id: 'profile', icon: User, label: 'Perfil' },
] as const;

export const NavDock = React.memo(() => {
  const { activeView, setActiveView } = useT1ger();

  const haptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(15);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-2 pointer-events-none">
      <div role="tablist" aria-label="Main Navigation" className="flex justify-around items-center p-2.5 bg-white rounded-[2.5rem] mx-auto max-w-md pointer-events-auto shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-zinc-200">
        {tabs.map(tab => {
          const isActive = activeView === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onClick={() => { haptic(); setActiveView(tab.id as any); }}
              className="relative flex flex-col items-center gap-1 p-2.5 rounded-2xl w-18 group btn-haptic active:translate-y-0.5"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-2xl bg-zinc-100 border-b-2 border-zinc-200"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
              <tab.icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
                className={`relative z-10 transition-all duration-200 ${
                  isActive ? 'text-[var(--accent-main)]' : 'text-zinc-500 group-hover:text-zinc-500'
                }`}
              />
              <span
                className={`relative z-10 text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                  isActive ? 'text-[var(--accent-main)]' : 'text-zinc-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
