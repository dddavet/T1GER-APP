import React from 'react';
import { Flame, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';

export const HUD = React.memo(() => {
  const { learnStreak, language } = useBrain();
  const { stats } = useT1ger();
  const { appUser } = useAuth();

  return (
    <header className="z-40 flex w-full flex-none items-center justify-between border-b border-white/6 bg-[#071C19]/92 px-5 pb-3 pt-[calc(.8rem+env(safe-area-inset-top))] backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--t1ger-orange)] text-sm font-black tracking-[-.08em] text-[#102622]">T1</div>
        <div><span className="block text-sm font-semibold tracking-[-.02em] text-white">T1GER</span><span className="block text-[10px] text-[#64877F]">{language === 'es' ? 'Inversión' : 'Investing'} · {language === 'es' ? 'Nivel' : 'Level'} {appUser?.level || 1}</span></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-9 items-center gap-1.5 rounded-xl bg-white/[.045] px-2.5 font-mono text-xs text-[#E8B271]"><Flame size={16} />{learnStreak}</div>
        <div className="flex h-9 items-center gap-1.5 rounded-xl bg-[#3FC78E]/9 px-2.5 font-mono text-xs text-[#78DDB0]" aria-label={`${stats.verifiedXP} ${language === 'es' ? 'XP verificado' : 'verified XP'}`}><ShieldCheck size={16} />{stats.verifiedXP}</div>
      </div>
    </header>
  );
});
