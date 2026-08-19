import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, FileCheck2, LockKeyhole, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { MISSION_BANK } from '../services/missionBank';
import { MascotGuide } from './MascotGuide';
import { localizeMission } from '../services/contentLocalization';

export const BuildTab = ({ onStartMission }: { onStartMission?: (mission: any) => void }) => {
  const { language, brainState, pathData } = useBrain();
  const { appUser } = useAuth();
  const isEs = language === 'es';
  const level = pathData.track.levels[pathData.currentLevelIndex];
  const sourceMission = level?.applyNodeId ? MISSION_BANK.find(item => item.id === level.applyNodeId) : undefined;
  const mission = sourceMission ? localizeMission(sourceMission, language) : undefined;
  const completed = mission ? brainState.missionHistory.some(record => record.missionId === mission.id && record.completed) : false;
  const lessonsReady = level?.days.every(day => brainState.completedDayIds.includes(day.dayId)) || false;
  const paperTrades = useMemo(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(`t1ger_paper_trades_${appUser?.uid || 'local'}`) || '[]'); } catch { return []; }
  }, [appUser?.uid, completed]);

  return (
    <div className="space-y-5 pb-8 pt-5">
      <header>
        <p className="t1ger-kicker">{isEs ? 'Aplicar' : 'Apply'}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white">{isEs ? 'Convierte lo aprendido en acción.' : 'Turn what you learned into action.'}</h1>
        <p className="mt-3 text-sm leading-6 text-[#87A9A2]">{isEs ? 'Las acciones verificables también mejoran tu posición en la liga.' : 'Verified actions also improve your league rank.'}</p>
      </header>

      <MascotGuide surface="apply" completedApply={completed} applyAvailable={Boolean(mission && lessonsReady)} />

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 31, mass: .78, delay: .06 }}
        className="t1ger-panel transform-gpu overflow-hidden"
      >
        <div className="border-b border-white/8 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${completed ? 'bg-[#3FC78E]/15 text-[#67D5A4]' : lessonsReady ? 'bg-[var(--t1ger-orange)]/12 text-[var(--t1ger-orange)]' : 'bg-white/5 text-[#55776F]'}`}>
              {completed ? <CheckCircle2 size={23} /> : lessonsReady ? <Target size={23} /> : <LockKeyhole size={20} />}
            </div>
            <span className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[.12em] ${mission?.verificationTier === 1 ? 'bg-[#3FC78E]/12 text-[#78DDB0]' : 'bg-white/6 text-[#87A9A2]'}`}>
              {mission?.verificationTier === 1 ? (isEs ? 'Verificada' : 'Verified') : (isEs ? 'Personal' : 'Personal')}
            </span>
          </div>
          <h2 className="mt-6 text-xl font-semibold text-white">{mission?.title || (isEs ? 'Próxima misión' : 'Next mission')}</h2>
          <p className="mt-2 text-sm leading-6 text-[#87A9A2]">{mission?.taskBrief || (isEs ? 'Completa el módulo actual para descubrir la siguiente acción.' : 'Complete the current module to reveal the next action.')}</p>
        </div>
        <div className="p-5">
          {mission?.frameworkSteps?.map((step, index) => <div key={step.title} className="flex gap-3 py-2.5"><span className="font-mono text-xs text-[var(--t1ger-orange)]">0{index + 1}</span><div><strong className="block text-sm font-medium text-[#EAF4F1]">{step.title}</strong><p className="mt-1 text-xs leading-5 text-[#6F918A]">{step.desc}</p></div></div>)}
          <button disabled={!mission || !lessonsReady} onClick={() => mission && onStartMission?.(mission)} className="t1ger-primary-button mt-5 w-full disabled:opacity-35">
            {completed ? (isEs ? 'Misión completada' : 'Mission completed') : lessonsReady ? (isEs ? 'Ejecutar ahora' : 'Execute now') : (isEs ? 'Termina las lecciones primero' : 'Finish lessons first')} {lessonsReady && !completed && <ArrowRight size={18} />}
          </button>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 31, mass: .78, delay: .1 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="rounded-[1.35rem] bg-[#0B2925] p-4"><TrendingUp className="text-[var(--t1ger-orange)]" size={20} /><span className="mt-4 block font-mono text-xl font-semibold text-white">{paperTrades.length}</span><span className="mt-1 block text-xs text-[#73968E]">{isEs ? 'operaciones simuladas' : 'paper trades'}</span></div>
        <div className="rounded-[1.35rem] bg-[#0B2925] p-4"><ShieldCheck className="text-[#67D5A4]" size={20} /><span className="mt-4 block font-mono text-xl font-semibold text-white">{brainState.missionHistory.filter(record => record.completed && MISSION_BANK.find(item => item.id === record.missionId)?.verificationTier === 1).length}</span><span className="mt-1 block text-xs text-[#73968E]">{isEs ? 'acciones verificadas' : 'verified actions'}</span></div>
      </motion.section>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .15, duration: .24 }} className="flex gap-3 rounded-[1.35rem] border border-white/7 bg-white/[.025] p-4"><FileCheck2 className="shrink-0 text-[#6F918A]" size={19} /><p className="text-xs leading-5 text-[#6F918A]">{isEs ? 'Las reflexiones personales generan XP personal. Las operaciones registradas dentro del simulador pueden generar XP verificado.' : 'Personal reflections earn personal XP. Trades recorded inside the simulator can earn verified XP.'}</p></motion.div>
    </div>
  );
};
