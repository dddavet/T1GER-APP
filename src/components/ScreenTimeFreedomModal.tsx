import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  ArrowRight, 
  BookOpen, 
  Clock, 
  DollarSign, 
  Flame, 
  LineChart, 
  Smartphone, 
  Sparkles, 
  TrendingUp, 
  X, 
  Zap 
} from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { T1gerMascot3D } from './T1gerMascot3D';

interface ScreenTimeFreedomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScreenTimeFreedomModal: React.FC<ScreenTimeFreedomModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useBrain();
  const isEs = language === 'es';

  // Load from local storage or default to 3 hours/day, $15/hr wage
  const [dailyHours, setDailyHours] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('t1ger_screen_time_hours');
      if (saved) return parseFloat(saved);
    }
    return 3;
  });

  const [hourlyWage, setHourlyWage] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('t1ger_hourly_wage');
      if (saved) return parseFloat(saved);
    }
    return 15;
  });

  const [committed, setCommitted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('t1ger_screen_time_hours', dailyHours.toString());
      localStorage.setItem('t1ger_hourly_wage', hourlyWage.toString());
    }
  }, [dailyHours, hourlyWage]);

  if (!isOpen) return null;

  // Compounding & Opportunity Calculations
  const annualHours = Math.round(dailyHours * 365);
  const annualIncomeLost = Math.round(annualHours * hourlyWage);
  const monthlyIncomeLost = Math.round((annualHours / 12) * hourlyWage);
  const booksReadPerYear = Math.round(annualHours / 8); // ~8 hours per non-fiction book
  
  // Future Compound Value in 10 Years (monthly contribution invested at 8% annual return in S&P 500)
  const monthlyContribution = (dailyHours * 30.4 * hourlyWage) * 0.5; // If even 50% was invested
  const r = 0.08 / 12;
  const n = 120; // 10 years * 12 months
  const compound10Years = Math.round(
    monthlyContribution * ((Math.pow(1 + r, n) - 1) / r)
  );

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat(isEs ? 'es-CO' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md font-sans select-none"
      >
        <motion.div
          initial={{ scale: 0.94, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-y-auto rounded-[2rem] border border-white/10 bg-[#071C19] text-white shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
        >
          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/8 bg-[#0B2925]/95 px-5 py-4 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--t1ger-orange)] text-[#102622]">
                <Smartphone size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">
                  {isEs ? 'Costo de Redes Sociales' : 'Screen Time Cost'}
                </h2>
                <p className="text-[10px] text-[#6F918A]">
                  {isEs ? 'Tu tiempo convertido en libertad financiera' : 'Your time transformed into wealth'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
            >
              <X size={17} />
            </button>
          </div>

          <div className="space-y-5 p-5">
            {/* Top Mascot Banner */}
            <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-[#0B2925] p-4">
              <div className="pointer-events-none h-16 w-16 shrink-0 overflow-visible">
                <T1gerMascot3D mood={dailyHours >= 4 ? 'warning' : 'thinking'} closeUp className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-[var(--t1ger-orange)] uppercase tracking-wider">
                  {isEs ? 'Regla de Oro T1GER' : 'T1GER Golden Rule'}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-[#DCEAE7]">
                  {isEs
                    ? 'El algoritmo gana cuando tú consumes. Tú ganas cuando tú construyes e inviertes.'
                    : 'The algorithm wins when you consume. You win when you build and invest.'}
                </p>
              </div>
            </div>

            {/* Interactive Sliders */}
            <div className="space-y-4 rounded-2xl border border-white/8 bg-white/[.025] p-4">
              {/* Daily Hours Slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-[#87A9A2]">
                  <span>{isEs ? 'Horas diarias en redes sociales:' : 'Daily social media hours:'}</span>
                  <span className="font-mono text-base font-bold text-[var(--t1ger-orange)]">
                    {dailyHours} {isEs ? (dailyHours === 1 ? 'hora/día' : 'horas/día') : (dailyHours === 1 ? 'hr/day' : 'hrs/day')}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8"
                  step="0.5"
                  value={dailyHours}
                  onChange={e => setDailyHours(parseFloat(e.target.value))}
                  className="mt-2.5 h-2 w-full appearance-none rounded-lg bg-white/10 accent-[var(--t1ger-orange)] cursor-pointer"
                />
                <div className="mt-1 flex justify-between text-[10px] text-[#55776F]">
                  <span>30 min</span>
                  <span>4 hrs</span>
                  <span>8 hrs</span>
                </div>
              </div>

              {/* Hourly Wage Selector */}
              <div className="pt-2 border-t border-white/5">
                <div className="flex justify-between items-center text-xs font-semibold text-[#87A9A2] mb-2">
                  <span>{isEs ? 'Valor estimado de tu hora:' : 'Your estimated hourly value:'}</span>
                  <span className="font-mono text-xs font-bold text-white">${hourlyWage}/hr</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[10, 15, 25, 50].map(wage => (
                    <button
                      key={wage}
                      onClick={() => setHourlyWage(wage)}
                      className={`rounded-xl py-1.5 font-mono text-xs font-semibold transition-all cursor-pointer ${
                        hourlyWage === wage
                          ? 'border border-[var(--t1ger-orange)] bg-[var(--t1ger-orange)]/20 text-white font-bold'
                          : 'border border-white/6 bg-white/5 text-[#87A9A2] hover:bg-white/10'
                      }`}
                    >
                      ${wage}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* High Impact Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Lost Income Card */}
              <div className="rounded-2xl border border-white/8 bg-[#0B2925] p-4">
                <div className="flex items-center gap-1.5 text-[#FF7300]">
                  <DollarSign size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{isEs ? 'Ingreso Anual' : 'Annual Value'}</span>
                </div>
                <span className="mt-2 block font-mono text-xl font-bold text-white">
                  {formatCurrency(annualIncomeLost)}
                </span>
                <span className="mt-1 block text-[10px] text-[#6F918A]">
                  {isEs ? `(${formatCurrency(monthlyIncomeLost)} / mes)` : `(${formatCurrency(monthlyIncomeLost)} / mo)`}
                </span>
              </div>

              {/* Books Equivalent */}
              <div className="rounded-2xl border border-white/8 bg-[#0B2925] p-4">
                <div className="flex items-center gap-1.5 text-[#3FC78E]">
                  <BookOpen size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{isEs ? 'Conocimiento' : 'Knowledge'}</span>
                </div>
                <span className="mt-2 block font-mono text-xl font-bold text-white">
                  {booksReadPerYear} {isEs ? 'libros' : 'books'}
                </span>
                <span className="mt-1 block text-[10px] text-[#6F918A]">
                  {isEs ? `${annualHours} hrs de maestría` : `${annualHours} hrs mastery`}
                </span>
              </div>
            </div>

            {/* S&P 500 Compounding Future Wealth Card */}
            <div className="rounded-2xl border border-[#3FC78E]/30 bg-[#062923] p-4 shadow-[0_4px_20px_rgba(63,199,142,0.1)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#78DDB0]">
                  <TrendingUp size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isEs ? 'Si inviertes el 50% de ese tiempo' : 'If you invest 50% of this time'}
                  </span>
                </div>
                <span className="rounded bg-[#3FC78E]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#78DDB0]">
                  8% S&P 500
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-black text-white drop-shadow-sm">
                  {formatCurrency(compound10Years)}
                </span>
                <span className="text-xs text-[#78DDB0] font-medium">{isEs ? 'en 10 años' : 'in 10 years'}</span>
              </div>
              <p className="mt-2 text-[11px] leading-4 text-[#87A9A2]">
                {isEs
                  ? `Redirigiendo solo la mitad de tu tiempo en redes hacia trabajo o ahorro productivo acumulaste una fortuna.`
                  : `Redirecting just half your screen time into productive work or investing builds a true fortune.`}
              </p>
            </div>

            {/* Micro Challenge / Action CTA */}
            <div className="rounded-2xl border border-[var(--t1ger-orange)]/30 bg-[var(--t1ger-orange)]/10 p-4">
              <div className="flex items-center gap-2 text-[var(--t1ger-orange)]">
                <Zap size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isEs ? 'El Intercambio T1GER' : 'The T1GER Swap'}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-5 text-[#EAF4F1]">
                {isEs
                  ? 'Cada lección de 4 minutos en T1GER te ahorra $1.00 de tiempo perdido y construye tu criterio financiero.'
                  : 'Every 4-minute lesson on T1GER saves $1.00 of wasted time and builds your financial edge.'}
              </p>

              <button
                onClick={() => {
                  setCommitted(true);
                  setTimeout(() => {
                    onClose();
                  }, 800);
                }}
                className="t1ger-primary-button mt-4 w-full cursor-pointer"
              >
                {committed
                  ? (isEs ? '✓ ¡Compromiso Guardado!' : '✓ Commitment Saved!')
                  : (isEs ? 'Reducir mi tiempo en redes hoy' : 'Reduce my screen time today')}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
