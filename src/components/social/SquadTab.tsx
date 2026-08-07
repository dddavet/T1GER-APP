import React from 'react';
import { BarChart3, ShieldCheck, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBrain } from '../../contexts/BrainContext';
import { useT1ger } from '../../contexts/T1gerContext';

export const SquadTab = () => {
  const { language } = useBrain();
  const { stats, setActiveView } = useT1ger();
  const { appUser } = useAuth();
  const isEs = language === 'es';
  const hasVerifiedProgress = stats.verifiedXP > 0;

  return (
    <div className="space-y-5 pb-8 pt-5">
      <header><p className="t1ger-kicker">{isEs ? 'Liga verificada' : 'Verified league'}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white">{isEs ? 'La tabla cuenta acciones, no promesas.' : 'The board counts actions, not claims.'}</h1><p className="mt-3 text-sm leading-6 text-[#87A9A2]">{isEs ? 'Solo el XP procedente de eventos verificables entra en la clasificación.' : 'Only XP from verifiable in-app events enters the ranking.'}</p></header>

      {hasVerifiedProgress ? (
        <section className="t1ger-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/8 p-5"><div><p className="t1ger-kicker">{isEs ? 'Temporada actual' : 'Current season'}</p><h2 className="mt-1 text-lg font-semibold text-white">Paper Portfolio League</h2></div><Trophy className="text-[var(--t1ger-orange)]" /></div>
          <div className="flex items-center gap-4 p-5"><span className="font-mono text-sm text-[#6F918A]">01</span><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--t1ger-orange)] text-sm font-semibold text-[#102622]">{(appUser?.displayName || 'T').charAt(0)}</div><div className="flex-1"><strong className="block text-sm text-white">{appUser?.displayName || (isEs ? 'Tú' : 'You')}</strong><span className="text-xs text-[#6F918A]">{isEs ? 'Cartera verificada' : 'Verified portfolio'}</span></div><div className="text-right"><span className="block font-mono text-sm font-semibold text-[#78DDB0]">{stats.verifiedXP}</span><span className="text-[10px] text-[#6F918A]">vXP</span></div></div>
        </section>
      ) : (
        <section className="t1ger-panel p-7 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3FC78E]/10 text-[#78DDB0]"><ShieldCheck size={26} /></div><h2 className="mt-5 text-xl font-semibold text-white">{isEs ? 'Tu puesto comienza con evidencia.' : 'Your rank starts with evidence.'}</h2><p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[#87A9A2]">{isEs ? 'Completa una operación dentro del simulador para obtener tu primer XP verificado.' : 'Complete an in-app paper trade to earn your first verified XP.'}</p><button onClick={() => setActiveView('build')} className="t1ger-primary-button mt-6 w-full">{isEs ? 'Ir a Aplicar' : 'Go to Apply'}</button></section>
      )}

      <div className="flex gap-3 rounded-[1.35rem] border border-white/7 bg-white/[.025] p-4"><BarChart3 className="shrink-0 text-[#6F918A]" size={19} /><p className="text-xs leading-5 text-[#6F918A]">{isEs ? 'Las temporadas y ligas entre usuarios requieren validación del servidor antes de publicarse. Este preview muestra únicamente tu progreso verificable local.' : 'Cross-user seasons require server validation before release. This preview shows only your locally verifiable progress.'}</p></div>
    </div>
  );
};
