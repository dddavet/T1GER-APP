import React from 'react';
import { useT1ger } from '../contexts/T1gerContext';
import { useBrain } from '../contexts/BrainContext';
import { BookOpen, Hammer, Trophy, User } from 'lucide-react';
import { Dock, DockIcon, DockItem, DockLabel } from './ui/dock';

export const NavDock = React.memo(() => {
  const { activeView, setActiveView } = useT1ger();
  const { language } = useBrain();

  const haptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(15);
    }
  };

  const tabs = [
    { id: 'learn', icon: BookOpen, label: language === 'es' ? 'Aprender' : 'Learn' },
    { id: 'build', icon: Hammer, label: language === 'es' ? 'Táctico' : 'Tactical' },
    { id: 'compete', icon: Trophy, label: language === 'es' ? 'Social' : 'Squad' },
    { id: 'profile', icon: User, label: language === 'es' ? 'Perfil' : 'Profile' },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pointer-events-none">
      <div className="mx-auto max-w-md pointer-events-auto flex justify-center">
        <Dock className="items-end pb-3 bg-white/70 backdrop-blur-xl border border-zinc-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          {tabs.map(tab => {
            const isActive = activeView === tab.id;

            return (
              <DockItem
                key={tab.id}
                onClick={() => { haptic(); setActiveView(tab.id as any); }}
                className={`aspect-square rounded-full transition-colors ${isActive ? 'bg-[#FF7300]/10 border border-[#FF7300]/20' : 'bg-transparent hover:bg-zinc-100'}`}
              >
                <DockLabel className="font-bold">{tab.label}</DockLabel>
                <DockIcon>
                  <tab.icon
                    className={`h-full w-full transition-colors ${
                      isActive ? 'text-[#FF7300]' : 'text-zinc-500'
                    }`}
                  />
                </DockIcon>
              </DockItem>
            );
          })}
        </Dock>
      </div>
    </div>
  );
});
