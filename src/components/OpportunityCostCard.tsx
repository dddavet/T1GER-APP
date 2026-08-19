import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, DollarSign, Smartphone, Sparkles, TrendingUp } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { ScreenTimeFreedomModal } from './ScreenTimeFreedomModal';

export const OpportunityCostCard: React.FC = () => {
  const { language, learnStreak } = useBrain();
  const isEs = language === 'es';
  const [modalOpen, setModalOpen] = useState(false);

  const dailyHours = typeof window !== 'undefined'
    ? parseFloat(localStorage.getItem('t1ger_screen_time_hours') || '3')
    : 3;
  const hourlyWage = typeof window !== 'undefined'
    ? parseFloat(localStorage.getItem('t1ger_hourly_wage') || '15')
    : 15;

  const annualValue = Math.round(dailyHours * 365 * hourlyWage);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={() => setModalOpen(true)}
        className="group relative flex items-center justify-between gap-3 overflow-hidden rounded-[1.35rem] border border-white/8 bg-[#0B2925] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_6px_20px_rgba(0,0,0,0.25)] transition-all hover:border-[var(--t1ger-orange)]/40 hover:bg-[#0D332D] cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--t1ger-orange)]/15 text-[var(--t1ger-orange)] transition-transform group-hover:scale-105">
            <Smartphone size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--t1ger-orange)]">
                {isEs ? 'Redes vs Libertad' : 'Screen Time vs Wealth'}
              </span>
              <span className="flex items-center gap-0.5 rounded bg-[#3FC78E]/20 px-1 py-0.2 text-[8.5px] font-bold text-[#78DDB0] uppercase">
                <TrendingUp size={9} /> {isEs ? 'Calculadora' : 'Calculator'}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs font-semibold text-white">
              {isEs
                ? `${dailyHours}h/día en redes = $${annualValue.toLocaleString()}/año en juego`
                : `${dailyHours}h/day on feeds = $${annualValue.toLocaleString()}/yr at stake`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#6F918A] group-hover:text-white transition-colors">
          <span className="text-[11px] font-medium hidden sm:inline">{isEs ? 'Calcular' : 'Calculate'}</span>
          <ChevronRight size={17} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      </motion.section>

      <ScreenTimeFreedomModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};
