import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  DollarSign, 
  Flame, 
  Play, 
  ShieldAlert, 
  Smartphone, 
  Sparkles, 
  TrendingUp, 
  X 
} from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { 
  AndroidScreenTimeService, 
  type ScreenTimeReport 
} from '../services/androidScreenTimeService';
import { ScreenTimeFreedomModal } from './ScreenTimeFreedomModal';

export const AndroidScreenTimeCard: React.FC = () => {
  const { language } = useBrain();
  const { setActiveView } = useT1ger();
  const isEs = language === 'es';

  const [report, setReport] = useState<ScreenTimeReport>(() =>
    AndroidScreenTimeService.getReport()
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<{
    title: string;
    body: string;
    ctaText: string;
  } | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    const update = () => setReport(AndroidScreenTimeService.getReport());
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const triggerLivePushNotification = async () => {
    setGeneratingAI(true);
    const script = await AndroidScreenTimeService.generateAINotificationScript(
      report,
      isEs ? 'es' : 'en'
    );
    setGeneratingAI(false);
    setActiveNotification(script);

    // Haptic vibration feedback
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([60, 100, 60]);
    }
  };

  const handleGrantPermission = () => {
    AndroidScreenTimeService.requestPermission();
    setReport(AndroidScreenTimeService.getReport());
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 290, damping: 30 }}
        className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0B2925] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_rgba(0,0,0,0.3)] font-sans text-white select-none"
      >
        {/* Header with Android Badge */}
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--t1ger-orange)] text-[#102622] shadow-[0_2px_10px_rgba(255,115,0,0.3)]">
              <Smartphone size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  {isEs ? 'Tiempo en Redes Android' : 'Android Screen Time'}
                </h3>
                <span className="flex items-center gap-0.5 rounded bg-[#3FC78E]/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#78DDB0] uppercase">
                  <Sparkles size={10} /> Live
                </span>
              </div>
              <p className="text-[11px] text-[#6F918A]">
                {isEs ? 'Análisis diario de costo de oportunidad' : 'Daily opportunity cost tracker'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 rounded-xl bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-[#87A9A2] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <span>{isEs ? 'Simulador' : 'Simulator'}</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Live Detected Apps Breakdown */}
        <div className="mt-4 space-y-2.5">
          <div className="flex justify-between items-baseline text-xs">
            <span className="font-semibold text-[#87A9A2]">
              {isEs ? 'Tiempo acumulado hoy:' : 'Total spent today:'}
            </span>
            <span className="font-mono text-sm font-bold text-[var(--t1ger-orange)]">
              {report.totalHours}h ({report.totalMinutes} min) = -${report.estimatedLossUSD} USD
            </span>
          </div>

          {/* Progress Bars for Top Apps */}
          <div className="space-y-2 pt-1">
            {report.apps.map(app => (
              <div key={app.packageName} className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-[#C6D9D5]">
                  <span className="flex items-center gap-1.5">
                    <span>{app.iconEmoji}</span>
                    <span>{app.appName}</span>
                  </span>
                  <span className="font-mono text-[11px] text-[#87A9A2]">{app.minutes} min ({app.percentage}%)</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--t1ger-orange)] to-[#FF9600]"
                    style={{ width: `${Math.max(app.percentage, 5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Push Notification Trigger / Demo Banner */}
        <div className="mt-5 rounded-2xl border border-white/8 bg-white/[.03] p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--t1ger-orange)]/20 text-[var(--t1ger-orange)]">
                <Bell size={15} />
              </div>
              <span className="text-xs font-semibold text-[#EAF4F1]">
                {isEs ? 'Alerta diaria de las 8:00 PM' : 'Daily 8:00 PM push alert'}
              </span>
            </div>

            <button
              onClick={triggerLivePushNotification}
              disabled={generatingAI}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--t1ger-orange)] px-3 py-1.5 font-sans text-xs font-bold text-[#102622] hover:bg-[#FF8C33] active:scale-95 transition-all cursor-pointer shadow-[0_2px_8px_rgba(255,115,0,0.3)] disabled:opacity-50"
            >
              {generatingAI ? (
                <span className="animate-spin text-xs">⏳</span>
              ) : (
                <Play size={12} className="fill-current" />
              )}
              <span>{isEs ? 'Simular Notificación' : 'Test Push Alert'}</span>
            </button>
          </div>
        </div>

        {/* Permission Status */}
        <div className="mt-3 flex items-center justify-between px-1 text-[11px] text-[#6F918A]">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-[#78DDB0]" />
            {isEs ? 'Android UsageStats API activo' : 'Android UsageStats API active'}
          </span>
          <span className="font-mono text-[10px] text-[#567A72]">
            {isEs ? 'Base: $15/hr' : 'Base: $15/hr'}
          </span>
        </div>
      </motion.section>

      {/* Interactive Android Native Push Notification Pop-up Simulation */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed top-3 left-4 right-4 z-[2000] mx-auto max-w-sm rounded-2xl border border-white/20 bg-[#162925]/98 p-4 text-white shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl select-none"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--t1ger-orange)] text-[#102622]">
                <Smartphone size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--t1ger-orange)]">
                    T1GER · ANDROID ALERT
                  </span>
                  <button
                    onClick={() => setActiveNotification(null)}
                    className="text-[#87A9A2] hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
                <h4 className="mt-1 text-xs font-bold text-white leading-tight">
                  {activeNotification.title}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-[#C6D9D5]">
                  {activeNotification.body}
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setActiveNotification(null);
                      setActiveView('learn');
                    }}
                    className="flex-1 rounded-xl bg-[var(--t1ger-orange)] py-2 text-center text-xs font-bold text-[#102622] hover:bg-[#FF8C33] active:scale-95 transition-all cursor-pointer"
                  >
                    {activeNotification.ctaText}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScreenTimeFreedomModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};
