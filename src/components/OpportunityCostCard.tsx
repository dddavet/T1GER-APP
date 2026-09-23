import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Clock3, ShieldAlert } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { AndroidScreenTimeService } from '../services/androidScreenTimeService';
import { ScreenTimeFreedomModal } from './ScreenTimeFreedomModal';
import { useDevHarnessState } from '../dev/devHarnessState';

export const OpportunityCostCard: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const { language, petState } = useBrain();
  const isEs = language === 'es';
  const devHarness = useDevHarnessState();
  const [modalOpen, setModalOpen] = useState(false);
  const [report, setReport] = useState(() => AndroidScreenTimeService.getReport());
  const configured = report.dataSource !== 'unconfigured';
  const overBudget = configured && report.totalMinutes > petState.dailyScreenTimeLimitMinutes;

  useEffect(() => {
    setReport(AndroidScreenTimeService.getReport());
  }, [devHarness.screenTime]);

  const closeModal = () => {
    setModalOpen(false);
    setReport(AndroidScreenTimeService.getReport());
  };

  return (
    <>
      <motion.button
        type="button"
        initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={reducedMotion ? undefined : { y: -2 }}
        whileTap={reducedMotion ? undefined : { scale: 0.98 }}
        onClick={() => setModalOpen(true)}
        className="group flex w-full items-center justify-between gap-3.5 rounded-[1.5rem] border border-white/10 bg-[#121216]/95 p-4 text-left shadow-[0_12px_28px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-all hover:border-[#FF7300]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7300] cursor-pointer min-h-[56px]"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border transition-colors ${
              overBudget
                ? 'border-[#FF7300]/50 bg-[#FF7300]/12 text-[#FF7300]'
                : 'border-white/10 bg-white/[0.04] text-zinc-400 group-hover:text-zinc-200'
            }`}
          >
            {overBudget ? <ShieldAlert size={20} /> : <Clock3 size={20} />}
          </div>
          <div className="min-w-0">
            <span className="block font-mono text-[9px] font-black uppercase tracking-wider text-[#FF8A1F]">
              {configured
                ? `${report.dataSource === 'native' ? 'LIVE' : report.dataSource === 'simulated' ? 'DEV' : 'MANUAL'} · ${report.awakeLifePercent}% ${isEs ? 'DEL DÍA' : 'OF DAY'}`
                : (isEs ? 'AUDITORÍA DE ENFOQUE' : 'FOCUS AUDIT')}
            </span>
            <p className="mt-0.5 truncate text-xs sm:text-sm font-extrabold text-white">
              {configured
                ? (isEs ? `${report.totalHours} h de scroll · ${report.daysLostPerYear} días/año perdidos` : `${report.totalHours} h scrolling · ${report.daysLostPerYear} days/year lost`)
                : (isEs ? 'Mide el coste real de tu tiempo en pantalla' : 'Measure the real cost of screen time')}
            </p>
          </div>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.04] border border-white/10 text-zinc-400 transition-colors group-hover:border-[#FF7300]/40 group-hover:text-[#FF7300]">
          <ArrowUpRight size={16} />
        </div>
      </motion.button>

      <ScreenTimeFreedomModal isOpen={modalOpen} onClose={closeModal} />
    </>
  );
};
