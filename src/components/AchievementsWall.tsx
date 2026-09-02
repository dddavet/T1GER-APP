import React from 'react';
import { Award, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { ACHIEVEMENTS } from '../services/achievements';

export const AchievementsWall: React.FC = () => {
  const { appUser } = useAuth();
  const { language } = useBrain();
  const isEs = language === 'es';
  const unlocked = appUser?.unlockedAchievements || [];

  return (
    <section className="w-full" aria-labelledby="achievements-title">
      <div className="mb-3 flex items-center gap-2 px-1">
        <Award className="h-5 w-5 text-[#FF8A2A]" />
        <h3 id="achievements-title" className="text-sm font-black text-white">{isEs ? 'Logros' : 'Achievements'}</h3>
        <span className="ml-auto font-mono text-xs tabular-nums text-zinc-500">{unlocked.length} / {ACHIEVEMENTS.length}</span>
      </div>

      <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ACHIEVEMENTS.map(achievement => {
          const isUnlocked = unlocked.includes(achievement.id);
          return (
            <article key={achievement.id} className={`relative min-h-36 w-36 shrink-0 snap-start overflow-hidden rounded-2xl border p-3 ${isUnlocked ? 'border-white/10 bg-[#121216]' : 'border-white/[0.04] bg-black/25 opacity-60 grayscale'}`}>
              {isUnlocked && <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${achievement.color} opacity-15 blur-2xl`} />}
              <div className={`relative grid h-10 w-10 place-items-center rounded-xl text-xl ${isUnlocked ? 'bg-white/10' : 'bg-white/5'}`}>
                {isUnlocked ? achievement.icon : <Lock size={16} className="text-zinc-600" />}
              </div>
              <h4 className="relative mt-3 text-[11px] font-black leading-tight text-white">{isEs ? achievement.name : achievement.nameEn}</h4>
              <p className="relative mt-1 text-[9px] leading-snug text-zinc-400">{isEs ? achievement.description : achievement.descriptionEn}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
};
