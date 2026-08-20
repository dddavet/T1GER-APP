import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Zap,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { T1gerMascot3D } from './T1gerMascot3D';
import { AndroidScreenTimeService } from '../services/androidScreenTimeService';

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
  const report = AndroidScreenTimeService.getReport();

  // Load from local storage or default to 3 hours/day, $15/hr wage
  const [dailyHours, setDailyHours] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('t1ger_screen_time_hours');
      if (saved) return parseFloat(saved);
    }
    return report.totalHours > 0 ? report.totalHours : 2.5;
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

  // ActivityWatch-Style Timeline Distribution
  const morningMinutes = Math.round(dailyHours * 60 * 0.25);
  const afternoonMinutes = Math.round(dailyHours * 60 * 0.45);
  const eveningMinutes = Math.round(dailyHours * 60 * 0.30);

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

  if (!isOpen) return null;

  const modalNode = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md font-sans select-none"
      >
        <motion.div
          initial={{ scale: 0.94, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-y-auto rounded-[2rem] border border-white/10 bg-[#121216] text-white shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
        >
          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/8 bg-[#121216]/95 px-5 py-4 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ob-accent)] text-black font-bold">
                <Smartphone size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">
                  {isEs ? 'Auditoría de Tiempo en Redes' : 'Screen Time Freedom Audit'}
                </h2>
                <p className="text-[10px] text-zinc-400">
                  {isEs ? 'Análisis estilo ActivityWatch + Costo Real' : 'ActivityWatch style timeline & compound cost'}
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

          <div className="space-y-4 p-5">
            {/* Top Mascot Banner */}
            <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-3.5">
              <div className="pointer-events-none h-14 w-14 shrink-0 overflow-visible">
                <T1gerMascot3D mood={dailyHours >= 3.5 ? 'warning' : 'thinking'} closeUp className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-[var(--ob-accent)] uppercase tracking-wider">
                  {isEs ? 'Pacto de Libertad T1GER' : 'T1GER Freedom Pact'}
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-zinc-300">
                  {isEs
                    ? 'El algoritmo gana cuando tú consumes. Tú ganas cuando tú construyes e inviertes.'
                    : 'The algorithm wins when you consume. You win when you build and invest.'}
                </p>
              </div>
            </div>

            {/* ActivityWatch Hourly Timeline Distribution */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-300">
                  <BarChart3 size={14} className="text-cyan-400" />
                  {isEs ? 'Picos de Uso Diario' : 'Daily Distraction Peaks'}
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">
                  {report.totalHours}h {isEs ? 'registradas' : 'tracked'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="flex flex-col items-center bg-black/40 border border-white/5 rounded-xl p-2 text-center">
                  <span className="text-[9px] text-zinc-400 font-mono">{isEs ? '🌅 Mañana' : '🌅 Morning'}</span>
                  <span className="font-mono text-xs font-bold text-white mt-0.5">{morningMinutes}m</span>
                  <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>

                <div className="flex flex-col items-center bg-black/40 border border-white/5 rounded-xl p-2 text-center">
                  <span className="text-[9px] text-zinc-400 font-mono">{isEs ? '☀️ Tarde' : '☀️ Afternoon'}</span>
                  <span className="font-mono text-xs font-bold text-amber-400 mt-0.5">{afternoonMinutes}m</span>
                  <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '70%' }} />
                  </div>
                </div>

                <div className="flex flex-col items-center bg-black/40 border border-white/5 rounded-xl p-2 text-center">
                  <span className="text-[9px] text-zinc-400 font-mono">{isEs ? '🌙 Noche' : '🌙 Evening'}</span>
                  <span className="font-mono text-xs font-bold text-rose-400 mt-0.5">{eveningMinutes}m</span>
                  <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-rose-400 h-full rounded-full" style={{ width: '50%' }} />
                  </div>
                </div>
              </div>

              {/* App breakdown chips */}
              {report.apps && report.apps.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {report.apps.map((app) => (
                    <span
                      key={app.appName}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300"
                    >
                      <span>{app.iconEmoji}</span>
                      <span>{app.appName}:</span>
                      <strong className="text-white">{app.minutes}m</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Sliders */}
            <div className="space-y-3 rounded-2xl border border-white/8 bg-white/[.025] p-3.5">
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-zinc-300">
                  <span>{isEs ? 'Horas diarias en redes:' : 'Daily social hours:'}</span>
                  <span className="font-mono text-sm font-bold text-[var(--ob-accent)]">
                    {dailyHours} {isEs ? 'hrs/día' : 'hrs/day'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                  className="mt-2 h-1.5 w-full appearance-none rounded-lg bg-white/10 accent-[var(--ob-accent)] cursor-pointer"
                />
              </div>

              {/* Hourly Wage Selector */}
              <div className="pt-2 border-t border-white/5">
                <div className="flex justify-between items-center text-xs font-semibold text-zinc-300 mb-1.5">
                  <span>{isEs ? 'Valor de tu hora:' : 'Your hourly value:'}</span>
                  <span className="font-mono text-xs font-bold text-white">${hourlyWage}/hr</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[10, 15, 25, 50].map((wage) => (
                    <button
                      key={wage}
                      type="button"
                      onClick={() => setHourlyWage(wage)}
                      className={`rounded-xl py-1 font-mono text-xs font-semibold transition-all cursor-pointer ${
                        hourlyWage === wage
                          ? 'border border-[var(--ob-accent)] bg-[var(--ob-accent)]/20 text-[var(--ob-accent)] font-bold'
                          : 'border border-white/6 bg-white/5 text-zinc-400 hover:bg-white/10'
                      }`}
                    >
                      ${wage}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* High Impact Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Lost Income Card */}
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3.5">
                <div className="flex items-center gap-1 text-[var(--ob-accent)]">
                  <DollarSign size={14} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">{isEs ? 'Ingreso Anual' : 'Annual Value'}</span>
                </div>
                <span className="mt-1.5 block font-mono text-lg font-bold text-white">
                  {formatCurrency(annualIncomeLost)}
                </span>
                <span className="mt-0.5 block text-[9px] text-zinc-400">
                  {isEs ? `(${formatCurrency(monthlyIncomeLost)}/mes)` : `(${formatCurrency(monthlyIncomeLost)}/mo)`}
                </span>
              </div>

              {/* Books Equivalent */}
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3.5">
                <div className="flex items-center gap-1 text-[#3FC78E]">
                  <BookOpen size={14} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">{isEs ? 'Conocimiento' : 'Knowledge'}</span>
                </div>
                <span className="mt-1.5 block font-mono text-lg font-bold text-white">
                  ~{booksReadPerYear} {isEs ? 'libros' : 'books'}
                </span>
                <span className="mt-0.5 block text-[9px] text-zinc-400">
                  {isEs ? `${annualHours}h maestría` : `${annualHours}h mastery`}
                </span>
              </div>
            </div>

            {/* S&P 500 Compounding Future Wealth Card */}
            <div className="rounded-2xl border border-[#3FC78E]/30 bg-[#3FC78E]/[0.05] p-3.5 shadow-[0_4px_20px_rgba(63,199,142,0.1)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#3FC78E]">
                  <TrendingUp size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isEs ? 'Si inviertes el 50% de ese tiempo' : 'If you invest 50% of this time'}
                  </span>
                </div>
                <span className="rounded bg-[#3FC78E]/20 px-2 py-0.5 font-mono text-[9px] font-bold text-[#3FC78E]">
                  8% S&P 500
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-xl font-black text-white drop-shadow-sm">
                  {formatCurrency(compound10Years)}
                </span>
                <span className="text-[11px] text-[#3FC78E] font-medium">{isEs ? 'en 10 años' : 'in 10 years'}</span>
              </div>
              <p className="mt-1.5 text-[10px] leading-4 text-zinc-300">
                {isEs
                  ? 'Redirigiendo la mitad de tu tiempo hacia trabajo o ahorro productivo acumulas una fortuna.'
                  : 'Redirecting half your screen time into productive work builds a true fortune.'}
              </p>
            </div>

            {/* Micro Challenge CTA */}
            <div className="rounded-2xl border border-[var(--ob-accent)]/30 bg-[var(--ob-accent)]/10 p-3.5">
              <div className="flex items-center gap-1.5 text-[var(--ob-accent)]">
                <Zap size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isEs ? 'El Intercambio T1GER' : 'The T1GER Swap'}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-4 text-zinc-200">
                {isEs
                  ? 'Cada lección de 4 minutos en T1GER te ahorra tiempo perdido y alimenta la vida de tu mascota.'
                  : 'Every 4-minute lesson on T1GER saves lost time and feeds your mascot.'}
              </p>

              <button
                onClick={() => {
                  setCommitted(true);
                  setTimeout(() => {
                    onClose();
                  }, 800);
                }}
                className="mt-3 w-full py-3 rounded-xl font-mono text-xs font-black uppercase tracking-wider bg-[var(--ob-accent)] hover:brightness-110 text-black shadow-[0_4px_15px_rgba(255,115,0,0.35)] active:scale-98 transition-all cursor-pointer"
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
