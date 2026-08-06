import React from 'react';
import { useT1ger } from '../contexts/T1gerContext';
import { useBrain } from '../contexts/BrainContext';
import { BookOpen, Zap, Trophy, User } from 'lucide-react';
import { motion } from 'motion/react';

export const NavDock = React.memo(() => {
  const { activeView, setActiveView } = useT1ger();
  const { language } = useBrain();

  const haptic = () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(15);
      } catch (e) {
        // ignore
      }
    }
  };

  const tabs = [
    { id: 'learn', icon: BookOpen, label: language === 'es' ? 'Aprender' : 'Learn' },
    { id: 'build', icon: Zap, label: language === 'es' ? 'Táctico' : 'Tactical' },
    { id: 'compete', icon: Trophy, label: language === 'es' ? 'Compete' : 'Compete' },
    { id: 'profile', icon: User, label: language === 'es' ? 'Perfil' : 'Profile' },
  ] as const;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4 pb-[env(safe-area-inset-bottom)] pointer-events-none flex justify-center select-none">
      <nav 
        aria-label="Navegación principal"
        className="pointer-events-auto w-full max-w-sm bg-white/80 backdrop-blur-2xl border-2 border-white/80 shadow-[0_12px_36px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] rounded-[2.2rem] p-1.5 flex items-center justify-between gap-1 ring-1 ring-black/5"
      >
        {tabs.map(tab => {
          const isActive = activeView === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.90 }}
              onClick={() => {
                haptic();
                setActiveView(tab.id as any);
              }}
              className={`relative flex-1 py-2 px-2 rounded-[1.6rem] flex flex-col items-center justify-center transition-all cursor-pointer ${
                isActive 
                  ? 'text-[#FF7300]' 
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {/* Liquid Glass Active Pill */}
              {isActive && (
                <motion.div
                  layoutId="floatingGlassPill"
                  className="absolute inset-0 bg-gradient-to-b from-[#FF7300]/15 to-[#FF7300]/5 border border-[#FF7300]/30 rounded-[1.6rem] shadow-[0_4px_14px_rgba(255,115,0,0.18)]"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-110 stroke-[2.5] text-[#FF7300]' : 'stroke-2'}`} />
                <span className={`text-[10px] font-black uppercase tracking-wider leading-none ${
                  isActive ? 'text-[#FF7300]' : 'text-zinc-400'
                }`}>
                  {tab.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
});


