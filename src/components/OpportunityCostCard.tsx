import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Clock3, ShieldAlert } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { AndroidScreenTimeService } from '../services/androidScreenTimeService';
import { ScreenTimeFreedomModal } from './ScreenTimeFreedomModal';
import { useDevHarnessState } from '../dev/devHarnessState';

export const OpportunityCostCard: React.FC = () => {
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ y: 2, scale: 0.99 }}
        onClick={() => setModalOpen(true)}
        className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 border border-white/12 bg-[#121216] p-3.5 text-left transition-colors hover:border-[#FF7300]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7300]"
      >
        <span className={`grid h-10 w-10 place-items-center border ${overBudget ? 'border-[#FF7300]/60 bg-[#FF7300]/12 text-[#FF7300]' : 'border-white/12 bg-white/[.035] text-zinc-400'}`}>
          {overBudget ? <ShieldAlert size={18} /> : <Clock3 size={18} />}
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-[8px] font-bold uppercase tracking-[.14em] text-[#FF7300]">
            {configured
              ? `${report.dataSource === 'native' ? 'LIVE' : report.dataSource === 'simulated' ? 'DEV' : 'MANUAL'} · ${report.awakeLifePercent}% ${isEs ? 'DEL DÍA' : 'OF DAY'}`
              : (isEs ? 'AUDITORÍA SIN CONFIGURAR' : 'AUDIT NOT CONFIGURED')}
          </span>
          <strong className="mt-1 block truncate text-sm font-semibold text-white">
            {configured
              ? (isEs ? `${report.totalHours} h de scroll · ${report.daysLostPerYear} días/año` : `${report.totalHours} h scrolling · ${report.daysLostPerYear} days/year`)
              : (isEs ? 'Mide el coste real de tu scroll' : 'Measure the real cost of scrolling')}
          </strong>
        </span>
        <ArrowUpRight size={17} className="text-zinc-600 transition-colors group-hover:text-[#FF7300]" />
      </motion.button>

      <ScreenTimeFreedomModal isOpen={modalOpen} onClose={closeModal} />
    </>
  );
};
