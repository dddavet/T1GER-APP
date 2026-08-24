import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Clock3,
  DollarSign,
  ShieldCheck,
  Smartphone,
  X,
  Zap,
} from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import {
  AndroidScreenTimeService,
  type AppUsage,
  type ScreenTimeReport,
} from '../services/androidScreenTimeService';
import { T1gerMascot3D } from './T1gerMascot3D';

interface ScreenTimeFreedomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatCurrency = (value: number, language: 'es' | 'en') =>
  new Intl.NumberFormat(language === 'es' ? 'es-CO' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export const ScreenTimeFreedomModal: React.FC<ScreenTimeFreedomModalProps> = ({ isOpen, onClose }) => {
  const { language, getDailyPipelineMissions, petState } = useBrain();
  const isEs = language === 'es';
  const [report, setReport] = useState<ScreenTimeReport>(() => AndroidScreenTimeService.getReport());
  const [manualApps, setManualApps] = useState<AppUsage[]>(() => AndroidScreenTimeService.getManualApps());
  const [hourlyWage, setHourlyWage] = useState(() => AndroidScreenTimeService.getHourlyWage());

  useEffect(() => {
    if (!isOpen) return;
    const refresh = () => {
      const nextReport = AndroidScreenTimeService.getReport();
      setReport(nextReport);
      if (nextReport.dataSource !== 'native') setManualApps(AndroidScreenTimeService.getManualApps());
      setHourlyWage(nextReport.hourlyWage);
    };
    refresh();
    if (!AndroidScreenTimeService.isAndroidNative()) return;
    const interval = window.setInterval(refresh, 1800);
    return () => window.clearInterval(interval);
  }, [isOpen]);

  const requiresManualFallback = report.dataSource !== 'native';
  const overBudget = report.totalMinutes > petState.dailyScreenTimeLimitMinutes;
  const topApp = report.apps.find((app) => app.minutes > 0);

  const metrics = useMemo(() => [
    {
      icon: Clock3,
      label: isEs ? 'vida consciente quemada' : 'waking life burned',
      value: `${report.awakeLifePercent}%`,
      detail: isEs ? 'base: 16 h despierto' : 'based on 16 waking hours',
    },
    {
      icon: AlertTriangle,
      label: isEs ? 'días completos al año' : 'full days per year',
      value: `${report.daysLostPerYear}`,
      detail: isEs ? `${report.annualHoursLost} h de scroll` : `${report.annualHoursLost} h scrolling`,
    },
    {
      icon: DollarSign,
      label: isEs ? 'capital no creado / 10 años' : 'uncreated capital / 10 years',
      value: formatCurrency(report.compound10YearsUSD, language),
      detail: isEs ? 'aporte mensual · 8% anual' : 'monthly investing · 8% yearly',
    },
    {
      icon: BookOpen,
      label: isEs ? 'libros no leídos al año' : 'unread books per year',
      value: `${report.booksEquivalentYear}`,
      detail: isEs ? 'base: 4 h por libro' : 'based on 4 h per book',
    },
  ], [isEs, language, report]);

  const updateManualMinutes = (packageName: string, minutes: number) => {
    const nextApps = manualApps.map((app) => app.packageName === packageName ? { ...app, minutes } : app);
    setManualApps(nextApps);
    setReport(AndroidScreenTimeService.previewManualUsage(nextApps, hourlyWage));
  };

  const updateWage = (value: number) => {
    const safeWage = AndroidScreenTimeService.saveHourlyWage(value);
    setHourlyWage(safeWage);
    setReport(report.dataSource === 'native'
      ? AndroidScreenTimeService.getReport()
      : AndroidScreenTimeService.previewManualUsage(manualApps, safeWage));
  };

  const handlePermissionRequest = () => {
    AndroidScreenTimeService.requestPermission();
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const recoverFocus = () => {
    if (requiresManualFallback) {
      AndroidScreenTimeService.saveManualUsage(manualApps, hourlyWage);
    } else {
      AndroidScreenTimeService.saveHourlyWage(hourlyWage);
    }

    const dailyMission = getDailyPipelineMissions().learnNode;
    if (navigator.vibrate) navigator.vibrate([35, 30, 70]);
    window.dispatchEvent(new CustomEvent('t1ger_start_daily_rescue', {
      detail: { missionId: dailyMission?.id },
    }));
    onClose();
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="screen-time-audit-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] overflow-y-auto bg-[#09090B] text-white"
    >
      <div className="pointer-events-none fixed inset-0 opacity-[0.055] [background-image:repeating-linear-gradient(0deg,transparent,transparent_3px,#fff_4px)]" />
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col border-x border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(255,115,0,.12),transparent_34%),#09090B]">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/12 bg-[#09090B]/95 px-4 pb-3 pt-[calc(.75rem+env(safe-area-inset-top))] backdrop-blur-xl">
          <div>
            <p className="font-mono text-[9px] font-semibold tracking-[0.18em] text-[#FF7300]">[ AUDIT / LAST 24H ]</p>
            <p className="mt-1 font-mono text-[10px] tracking-[0.08em] text-zinc-500">
              {report.dataSource === 'native' ? 'ANDROID_USAGE_STATS · LIVE' : isEs ? 'ESTIMACIÓN MANUAL · PRIVADA' : 'MANUAL ESTIMATE · PRIVATE'}
            </p>
          </div>
          <button onClick={onClose} aria-label={isEs ? 'Cerrar auditoría' : 'Close audit'} className="grid h-10 w-10 place-items-center border border-white/12 bg-white/[.035] text-zinc-300 transition-colors hover:border-white/25 hover:text-white active:scale-95">
            <X size={18} />
          </button>
        </header>

        <main className="flex-1 px-4 pb-36 pt-5">
          <section className="grid grid-cols-[1fr_7rem] items-center border-b border-white/12 pb-5">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                {overBudget ? (isEs ? 'umbral superado' : 'threshold exceeded') : (isEs ? 'estado del sistema' : 'system status')}
              </p>
              <h1 id="screen-time-audit-title" className="mt-3 text-[clamp(2.45rem,11vw,4rem)] font-black uppercase leading-[.84] tracking-[-.065em]">
                {report.totalMinutes > 0
                  ? (isEs ? 'El scroll no fue gratis.' : 'The scroll was not free.')
                  : (isEs ? 'Mide lo que te roba foco.' : 'Measure what steals focus.')}
              </h1>
            </div>
            <div className="relative h-28 w-28 translate-x-1">
              <T1gerMascot3D
                mood={overBudget ? 'warning' : 'thinking'}
                health={overBudget ? Math.max(10, 100 - report.awakeLifePercent * 3) : 90}
                energy={overBudget ? 25 : 75}
                closeUp
                className="h-full w-full"
              />
            </div>
          </section>

          <section className="border-b border-white/12 py-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[.14em] text-zinc-500">{isEs ? 'distracción detectada' : 'detected distraction'}</p>
                <output className="mt-1 block font-mono text-5xl font-semibold tabular-nums tracking-[-.08em] text-[#FF7300]">
                  {report.totalHours}<span className="ml-1 text-lg tracking-normal text-zinc-500">H</span>
                </output>
              </div>
              <p className="max-w-[12rem] text-right text-xs leading-5 text-zinc-400">
                {topApp
                  ? (isEs ? `${topApp.appName} lideró el consumo con ${topApp.minutes} min.` : `${topApp.appName} led usage at ${topApp.minutes} min.`)
                  : (isEs ? 'Configura una estimación; nunca inventamos datos de uso.' : 'Set an estimate; we never invent usage data.')}
              </p>
            </div>
          </section>

          {report.isNativeAndroid && !report.hasPermission && (
            <section className="my-4 border border-[#FF7300]/55 bg-[#FF7300]/8 p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 shrink-0 text-[#FF7300]" size={20} />
                <div>
                  <h2 className="text-sm font-semibold">{isEs ? 'Activa lectura local de uso' : 'Enable local usage reading'}</h2>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    {isEs ? 'Android procesa los minutos en este dispositivo. T1GER sólo recibe el total de las seis apps seleccionadas.' : 'Android processes minutes on-device. T1GER only receives totals for the six selected apps.'}
                  </p>
                  <button onClick={handlePermissionRequest} className="mt-3 border border-[#FF7300] bg-[#FF7300] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[.1em] text-black active:translate-y-px">
                    {isEs ? 'Abrir acceso de uso →' : 'Open usage access →'}
                  </button>
                </div>
              </div>
            </section>
          )}

          {requiresManualFallback && (
            <section className="my-4 border-y border-white/12 py-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-mono text-[11px] font-bold uppercase tracking-[.12em]">{isEs ? 'Fallback manual' : 'Manual fallback'}</h2>
                  <p className="mt-1 text-[11px] text-zinc-500">{isEs ? 'Ajusta sólo lo usado durante las últimas 24 h.' : 'Enter usage from the last 24 hours only.'}</p>
                </div>
                <Smartphone size={19} className="text-[#FF7300]" />
              </div>
              <div className="space-y-4">
                {manualApps.map((app) => (
                  <label key={app.packageName} className="block">
                    <span className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[.08em]">
                      <span className="text-zinc-300">{app.iconEmoji} {app.appName}</span>
                      <data value={app.minutes} className="tabular-nums text-[#FF7300]">{app.minutes} MIN</data>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="240"
                      step="1"
                      value={app.minutes}
                      onChange={(event) => updateManualMinutes(app.packageName, Number(event.target.value))}
                      className="mt-2 h-1.5 w-full cursor-pointer appearance-none bg-white/12 accent-[#FF7300]"
                    />
                  </label>
                ))}
              </div>
            </section>
          )}

          <section className="grid grid-cols-2 gap-px border border-white/12 bg-white/12">
            {metrics.map(({ icon: Icon, label, value, detail }) => (
              <article key={label} className="min-h-32 bg-[#121216] p-3.5">
                <div className="flex items-center gap-2 text-[#FF7300]"><Icon size={15} /><span className="font-mono text-[8px] uppercase tracking-[.11em] text-zinc-500">{label}</span></div>
                <data className="mt-4 block break-words font-mono text-xl font-semibold leading-none tabular-nums text-white">{value}</data>
                <p className="mt-2 font-mono text-[8px] uppercase tracking-[.08em] text-zinc-600">{detail}</p>
              </article>
            ))}
          </section>

          <section className="mt-4 border border-white/12 bg-white/[.025] p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[9px] uppercase tracking-[.13em] text-zinc-500">{isEs ? 'valor de una hora' : 'value of one hour'}</p>
              <span className="font-mono text-sm font-semibold text-white">${hourlyWage}/H</span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-px bg-white/12">
              {[10, 15, 25, 50].map((wage) => (
                <button key={wage} onClick={() => updateWage(wage)} aria-pressed={hourlyWage === wage} className={`min-h-10 bg-[#121216] font-mono text-xs transition-colors ${hourlyWage === wage ? 'bg-[#FF7300] text-black' : 'text-zinc-400 hover:text-white'}`}>
                  ${wage}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-4 flex gap-3 border-l-2 border-[#FF7300] bg-[#FF7300]/7 p-4">
            <Zap size={18} className="mt-0.5 shrink-0 text-[#FF7300]" />
            <p className="text-xs leading-5 text-zinc-300">
              {isEs
                ? 'Completa la lección diaria para restaurar las vitales de T1GER, asegurar la racha de hoy y recibir XP verificado.'
                : 'Complete today’s lesson to restore T1GER’s vitals, secure today’s streak, and earn verified XP.'}
            </p>
          </section>
        </main>

        <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-white/12 bg-[#09090B]/96 px-4 pb-[calc(.8rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
          <button onClick={recoverFocus} className="t1ger-primary-button min-h-14 w-full !rounded-[.35rem] !bg-[#FF7300] !text-black !shadow-[0_5px_0_#9A3E00] active:!translate-y-[3px] active:!shadow-[0_2px_0_#9A3E00]">
            <span>{isEs ? 'Recuperar enfoque → Salvar a T1GER' : 'Reclaim focus → Save T1GER'}</span>
            <ArrowRight size={18} />
          </button>
        </footer>
      </div>
    </motion.div>,
    document.body,
  );
};
