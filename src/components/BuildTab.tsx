import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  FileCheck2, 
  LockKeyhole, 
  ShieldCheck, 
  Target, 
  TrendingUp, 
  Sliders, 
  PieChart, 
  Sparkles,
  Zap,
  DollarSign,
  Flame
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { MISSION_BANK } from '../services/missionBank';
import { MascotGuide } from './MascotGuide';
import { localizeMission } from '../services/contentLocalization';
import { OfferForgeSandbox } from './apply/OfferForgeSandbox';
import { PaperTradingSandbox } from './apply/PaperTradingSandbox';
import { CashflowAuditorSandbox } from './apply/CashflowAuditorSandbox';

type SandboxMode = 'bounty' | 'trading' | 'offer' | 'cashflow';

export const BuildTab = ({ onStartMission }: { onStartMission?: (mission: any) => void }) => {
  const { language, brainState, pathData } = useBrain();
  const { appUser } = useAuth();
  const isEs = language === 'es';
  
  const [activeMode, setActiveMode] = useState<SandboxMode>('bounty');

  const level = pathData.track.levels[pathData.currentLevelIndex];
  const sourceMission = level?.applyNodeId ? MISSION_BANK.find(item => item.id === level.applyNodeId) : undefined;
  const mission = sourceMission ? localizeMission(sourceMission, language) : undefined;
  const completed = mission ? brainState.missionHistory.some(record => record.missionId === mission.id && record.completed) : false;
  const lessonsReady = level?.days.every(day => brainState.completedDayIds.includes(day.dayId)) || false;
  
  const paperTrades = useMemo(() => {
    if (typeof window === 'undefined') return [];
    try { 
      return JSON.parse(localStorage.getItem(`t1ger_paper_portfolio_${appUser?.uid || 'local'}`) || '[]'); 
    } catch { 
      return []; 
    }
  }, [appUser?.uid, completed]);

  const verifiedActionsCount = useMemo(() => {
    return brainState.missionHistory.filter(
      record => record.completed && MISSION_BANK.find(item => item.id === record.missionId)?.verificationTier === 1
    ).length;
  }, [brainState.missionHistory]);

  const modes = [
    { id: 'bounty' as const, label: isEs ? '🎯 Misión Activa' : '🎯 Main Bounty', icon: Target },
    { id: 'trading' as const, label: isEs ? '📈 Paper Trading' : '📈 Trading', icon: TrendingUp },
    { id: 'offer' as const, label: isEs ? '⚡ Offer Forge' : '⚡ Offer Forge', icon: Sliders },
    { id: 'cashflow' as const, label: isEs ? '🛡️ Flujo de Caja' : '🛡️ Cashflow', icon: DollarSign },
  ];

  return (
    <div className="space-y-4 pb-24 pt-1 max-w-lg mx-auto select-none">
      {/* 1. Header & Section Kicker */}
      <header className="px-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase font-bold tracking-[0.2em] text-[var(--ob-accent)]">
            {isEs ? 'TACTICAL SANDBOX & EXECUTION' : 'TACTICAL SANDBOX & EXECUTION'}
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
            <Sparkles size={11} /> {verifiedActionsCount} {isEs ? 'Acciones Verificadas' : 'Verified Actions'}
          </span>
        </div>
        <h1 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-white">
          {isEs ? 'Convierte el Criterio en Ejecución.' : 'Turn Tactical Knowledge into Action.'}
        </h1>
      </header>

      {/* 2. Interactive Tool Selector Pills */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/8">
        {modes.map((mode) => {
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => {
                if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(8);
                setActiveMode(mode.id);
              }}
              className={`flex-1 py-1.5 px-1 rounded-xl font-mono text-[10px] sm:text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                isActive
                  ? 'bg-white/15 text-white shadow-md border border-white/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="truncate">{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Content Views (Double-Bezel Architecture) */}
      <AnimatePresence mode="wait">
        {activeMode === 'bounty' && (
          <motion.div
            key="bounty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <MascotGuide surface="apply" completedApply={completed} applyAvailable={Boolean(mission && lessonsReady)} />

            {/* Double-Bezel Active Bounty Card */}
            <div className="rounded-[1.75rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              <div className="rounded-[1.4rem] border border-white/[0.08] bg-[#09090B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="flex items-start justify-between gap-3 border-b border-white/6 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono font-bold ${
                      completed 
                        ? 'bg-[#3FC78E] text-black shadow-[0_0_15px_rgba(63,199,142,0.4)]' 
                        : lessonsReady 
                        ? 'bg-[var(--ob-accent)] text-black shadow-[0_0_15px_rgba(255,115,0,0.35)]' 
                        : 'bg-white/5 text-zinc-600 border border-white/5'
                    }`}>
                      {completed ? <CheckCircle2 size={20} /> : lessonsReady ? <Target size={20} /> : <LockKeyhole size={18} />}
                    </div>
                    <div>
                      <span className="font-mono text-[9px] uppercase font-bold tracking-wider text-[var(--ob-accent)]">
                        {isEs ? 'MISIÓN PRINCIPAL DEL LIBRO' : 'MAIN LEVEL BOUNTY'}
                      </span>
                      <h2 className="text-base font-bold text-white leading-tight mt-0.5">
                        {mission?.title || (isEs ? 'Próxima Misión Táctica' : 'Next Tactical Bounty')}
                      </h2>
                    </div>
                  </div>

                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider border ${
                    mission?.verificationTier === 1 
                      ? 'bg-[#3FC78E]/12 text-[#78DDB0] border-[#3FC78E]/30' 
                      : 'bg-white/6 text-zinc-400 border-white/10'
                  }`}>
                    {mission?.verificationTier === 1 ? (isEs ? 'Verificada' : 'Verified') : (isEs ? 'Personal' : 'Personal')}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-zinc-300">
                  {mission?.taskBrief || (isEs ? 'Completa las lecciones del libro actual para desbloquear la misión de ejecución.' : 'Complete the current book lessons to unlock the action bounty.')}
                </p>

                {/* Framework Steps */}
                {mission?.frameworkSteps && (
                  <div className="mt-3.5 space-y-2 border-t border-white/6 pt-3">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                      {isEs ? 'Pasos de Ejecución Táctica' : 'Tactical Execution Steps'}
                    </span>
                    {mission.frameworkSteps.map((step, index) => (
                      <div key={step.title} className="flex gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="font-mono text-xs text-[var(--ob-accent)] font-bold shrink-0">
                          0{index + 1}
                        </span>
                        <div>
                          <strong className="block text-xs font-semibold text-white">{step.title}</strong>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-400">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Primary CTA Button */}
                <button
                  disabled={!mission || !lessonsReady}
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(12);
                    if (mission) onStartMission?.(mission);
                  }}
                  className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--ob-accent)] to-amber-400 text-black font-mono text-xs font-black tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,115,0,0.35)] active:scale-[0.98] transition cursor-pointer disabled:opacity-40"
                >
                  {completed ? (
                    <span>{isEs ? 'MISIÓN COMPLETADA' : 'MISSION COMPLETED'}</span>
                  ) : lessonsReady ? (
                    <>
                      <span>{isEs ? 'EJECUTAR MISIÓN AHORA (+250 vXP)' : 'EXECUTE BOUNTY NOW (+250 vXP)'}</span>
                      <ArrowRight size={16} />
                    </>
                  ) : (
                    <span>{isEs ? 'COMPLETA LAS LECCIONES PRIMERO' : 'FINISH LESSONS FIRST'}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[1.4rem] border border-white/8 bg-[#121216] p-3.5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ob-accent)]/15 text-[var(--ob-accent)] border border-[var(--ob-accent)]/30">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <span className="font-mono text-base font-bold text-white block leading-tight">
                    {paperTrades.length}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {isEs ? 'Trades Simulados' : 'Paper Trades'}
                  </span>
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-white/8 bg-[#121216] p-3.5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3FC78E]/15 text-[#3FC78E] border border-[#3FC78E]/30">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <span className="font-mono text-base font-bold text-white block leading-tight">
                    {verifiedActionsCount}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {isEs ? 'Acciones Verificadas' : 'Verified Proofs'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeMode === 'trading' && (
          <motion.div
            key="trading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <PaperTradingSandbox />
          </motion.div>
        )}

        {activeMode === 'offer' && (
          <motion.div
            key="offer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <OfferForgeSandbox />
          </motion.div>
        )}

        {activeMode === 'cashflow' && (
          <motion.div
            key="cashflow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <CashflowAuditorSandbox />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

