import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BellRing, Bug, ChevronDown, Crown, Flame, Gauge, RotateCcw, Smartphone, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { AndroidScreenTimeService } from '../services/androidScreenTimeService';
import { NotificationService } from '../services/notificationService';
import { ScreenTimeFreedomModal } from '../components/ScreenTimeFreedomModal';
import {
  resetDevHarnessState,
  isDevHarnessEnabled,
  setDevHarnessState,
  useDevHarnessState,
  type DevEntitlementPreset,
  type DevScreenTimePreset,
  type DevStreakPreset,
} from './devHarnessState';

const PresetButton = ({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`min-h-10 border px-2 py-2 font-mono text-[9px] font-bold uppercase tracking-[.08em] transition active:translate-y-px ${active ? 'border-[#FF7300] bg-[#FF7300]/16 text-[#FF9B4A]' : 'border-white/10 bg-white/[.035] text-zinc-400 hover:border-white/25 hover:text-white'}`}
  >
    {children}
  </button>
);

export const DevHarness: React.FC = () => {
  const state = useDevHarnessState();
  const { appUser } = useAuth();
  const { petState, learnStreak, isLearnStreakAtRisk } = useBrain();
  const [isOpen, setIsOpen] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const report = useMemo(() => AndroidScreenTimeService.getReport(), [state.screenTime]);

  if (!isDevHarnessEnabled()) return null;

  const vibrate = () => navigator.vibrate?.(15);

  const setScreenTime = (screenTime: DevScreenTimePreset, openAudit: boolean = false) => {
    setDevHarnessState({ screenTime });
    vibrate();
    if (openAudit) {
      setIsOpen(false);
      setShowAudit(true);
    }
  };

  const setStreak = (streak: DevStreakPreset) => {
    setDevHarnessState({ streak });
    vibrate();
    if (streak === 'at_risk') {
      NotificationService.triggerStreakRiskAlert(appUser?.displayName || 'David', Math.max(7, learnStreak), 2);
    }
  };

  const setEntitlement = (entitlement: DevEntitlementPreset) => {
    setDevHarnessState({ entitlement });
    vibrate();
  };

  const reset = () => {
    resetDevHarnessState();
    vibrate();
  };

  return (
    <>
      <div className="pointer-events-none fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-3 z-[90] sm:right-[calc(50%-13.25rem)]">
        <motion.button
          type="button"
          layout
          onClick={() => setIsOpen(value => !value)}
          aria-label={isOpen ? 'Cerrar T1GER Dev Harness' : 'Abrir T1GER Dev Harness'}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center gap-2 rounded-xl border border-[#FF7300]/55 bg-[#09090B] font-mono text-[10px] font-black tracking-[.1em] text-[#FF8D31] shadow-[0_8px_24px_rgba(0,0,0,.65)] sm:w-auto sm:px-3"
        >
          <Bug size={15} /><span className="hidden sm:inline">DEV</span>
          <ChevronDown size={13} className={`hidden transition-transform sm:block ${isOpen ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.aside
              initial={{ opacity: 0, y: 12, scale: .98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: .98 }}
              className="pointer-events-auto absolute bottom-14 right-0 w-[min(23rem,calc(100vw-1.5rem))] overflow-hidden border border-white/14 bg-[#09090B]/98 text-white shadow-[0_24px_70px_rgba(0,0,0,.8)] backdrop-blur-2xl"
            >
              <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="font-mono text-[9px] font-black tracking-[.16em] text-[#FF7300]">T1GER / DEV HARNESS</p>
                  <p className="mt-1 text-[11px] text-zinc-500">Sólo existe en builds de desarrollo</p>
                </div>
                <button type="button" onClick={() => setIsOpen(false)} className="grid h-9 w-9 place-items-center border border-white/10 text-zinc-400 hover:text-white" aria-label="Cerrar panel"><X size={15} /></button>
              </header>

              <div className="max-h-[min(68vh,36rem)] space-y-4 overflow-y-auto p-4">
                <section>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-[.12em] text-zinc-300"><Gauge size={13} /> Screen Time</p>
                    <span className="font-mono text-[9px] text-[#FF9B4A]">{report.totalMinutes} MIN · {petState.careStatus}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <PresetButton active={state.screenTime === 'auto'} onClick={() => setScreenTime('auto')}>Auto</PresetButton>
                    <PresetButton active={state.screenTime === 'focused'} onClick={() => setScreenTime('focused')}>30 min</PresetButton>
                    <PresetButton active={state.screenTime === 'neglected'} onClick={() => setScreenTime('neglected', true)}>5 horas</PresetButton>
                  </div>
                  <button type="button" onClick={() => { setIsOpen(false); setShowAudit(true); }} className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 border border-[#FF7300]/35 bg-[#FF7300]/8 font-mono text-[9px] font-bold uppercase tracking-[.1em] text-[#FF9B4A]"><Smartphone size={13} /> Abrir confrontación</button>
                </section>

                <section>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-[.12em] text-zinc-300"><Flame size={13} /> Racha</p>
                    <span className={`font-mono text-[9px] ${isLearnStreakAtRisk ? 'text-red-400' : 'text-amber-400'}`}>{learnStreak} DÍAS · {isLearnStreakAtRisk ? 'EN RIESGO' : 'SEGURA'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <PresetButton active={state.streak === 'real'} onClick={() => setStreak('real')}>Real</PresetButton>
                    <PresetButton active={state.streak === 'active'} onClick={() => setStreak('active')}>Activa</PresetButton>
                    <PresetButton active={state.streak === 'at_risk'} onClick={() => setStreak('at_risk')}>Medianoche</PresetButton>
                  </div>
                </section>

                <section>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-[.12em] text-zinc-300"><Crown size={13} /> Entitlement</p>
                    <span className="font-mono text-[9px] text-cyan-300">{appUser?.isPro ? 'PRO / EARLY' : 'FREE'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <PresetButton active={state.entitlement === 'real'} onClick={() => setEntitlement('real')}>Real</PresetButton>
                    <PresetButton active={state.entitlement === 'free'} onClick={() => setEntitlement('free')}>Free</PresetButton>
                    <PresetButton active={state.entitlement === 'pro'} onClick={() => setEntitlement('pro')}>Pro</PresetButton>
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
                  <button type="button" onClick={() => NotificationService.triggerOpportunityAlert(appUser?.displayName || 'David', report.totalHours, report.estimatedLossUSD, learnStreak)} className="flex min-h-10 items-center justify-center gap-2 border border-white/10 bg-white/[.035] font-mono text-[9px] font-bold uppercase text-zinc-300"><BellRing size={13} /> Notificación</button>
                  <button type="button" onClick={reset} className="flex min-h-10 items-center justify-center gap-2 border border-white/10 bg-white/[.035] font-mono text-[9px] font-bold uppercase text-zinc-300"><RotateCcw size={13} /> Reset</button>
                </section>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <ScreenTimeFreedomModal isOpen={showAudit} onClose={() => setShowAudit(false)} />
    </>
  );
};
