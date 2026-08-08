import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, ShieldCheck, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBrain } from '../../contexts/BrainContext';
import { useT1ger } from '../../contexts/T1gerContext';
import { MascotGuide } from '../MascotGuide';

export const SquadTab = () => {
  const { language } = useBrain();
  const { stats, setActiveView } = useT1ger();
  const { appUser } = useAuth();
  const isEs = language === 'es';
  const hasVerifiedProgress = stats.verifiedXP > 0;

  return (
    <div className="space-y-5 pb-8 pt-5">
      <header><p className="t1ger-kicker">{isEs ? 'Liga verificada' : 'Verified league'}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white">{isEs ? 'Aquí cuentan tus acciones.' : 'Your actions count here.'}</h1><p className="mt-3 text-sm leading-6 text-[#87A9A2]">{isEs ? 'Sólo el progreso que T1GER puede verificar mejora tu posición.' : 'Only progress T1GER can verify improves your rank.'}</p></header>

      <MascotGuide surface="compete" />

      {hasVerifiedProgress ? (
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 31, delay: .06 }} className="t1ger-panel transform-gpu overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/8 p-5"><div><p className="t1ger-kicker">{isEs ? 'Temporada actual' : 'Current season'}</p><h2 className="mt-1 text-lg font-semibold text-white">{isEs ? 'Liga de Portafolio Simulado' : 'Paper Portfolio League'}</h2></div><Trophy className="text-[var(--t1ger-orange)]" /></div>
          <div className="flex items-center gap-4 p-5"><span className="font-mono text-sm text-[#6F918A]">01</span><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--t1ger-orange)] text-sm font-semibold text-[#102622]">{(appUser?.displayName || 'T').charAt(0)}</div><div className="flex-1"><strong className="block text-sm text-white">{appUser?.displayName || (isEs ? 'Tú' : 'You')}</strong><span className="text-xs text-[#6F918A]">{isEs ? 'Cartera verificada' : 'Verified portfolio'}</span></div><div className="text-right"><span className="block font-mono text-sm font-semibold text-[#78DDB0]">{stats.verifiedXP}</span><span className="text-[10px] text-[#6F918A]">vXP</span></div></div>
        </motion.section>
      ) : (
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 31, delay: .06 }} className="t1ger-panel transform-gpu p-7 text-center"><motion.div initial={{ scale: .8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 24, delay: .1 }} className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3FC78E]/10 text-[#78DDB0]"><ShieldCheck size={26} /></motion.div><h2 className="mt-5 text-xl font-semibold text-white">{isEs ? 'Aún no apareces en la clasificación.' : 'You are not ranked yet.'}</h2><p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[#87A9A2]">{isEs ? 'Registra una operación simulada para obtener tu primer XP verificado.' : 'Record a paper trade to earn your first verified XP.'}</p><button onClick={() => setActiveView('build')} className="t1ger-primary-button mt-6 w-full">{isEs ? 'Completar mi primera acción' : 'Complete my first action'}</button></motion.section>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .14, duration: .24 }} className="flex gap-3 rounded-[1.35rem] border border-white/7 bg-white/[.025] p-4"><BarChart3 className="shrink-0 text-[#6F918A]" size={19} /><p className="text-xs leading-5 text-[#6F918A]">{isEs ? 'Esta vista previa muestra sólo tu progreso local. Las ligas entre usuarios se activarán cuando la validación del servidor esté lista.' : 'This preview shows only your local progress. Cross-user leagues will launch after server validation is ready.'}</p></motion.div>
    </div>
  );
};
