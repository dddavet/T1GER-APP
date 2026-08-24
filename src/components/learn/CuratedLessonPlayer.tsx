import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Target,
  Layers,
  Wrench,
  Check,
  ChevronRight,
  Flame
} from 'lucide-react';
import type { BankMission } from '../../services/missionBank';
import { getMissionPlaybook, MISSION_BANK } from '../../services/missionBank';
import { shouldCelebrateStreakToday, markStreakCelebratedToday } from '../../services/brainService';
import { useT1ger } from '../../contexts/T1gerContext';
import { useBrain } from '../../contexts/BrainContext';

import { LessonSummaryModal } from './LessonSummaryModal';
import { StreakCelebrationModal } from '../StreakCelebrationModal';
import { InteractiveCardWidget } from './InteractiveCardWidget';

interface CuratedLessonPlayerProps {
  mission: BankMission;
  onClose: () => void;
  onExecuteApplyMission: (mission: BankMission) => void;
}

export const CuratedLessonPlayer: React.FC<CuratedLessonPlayerProps> = ({
  mission,
  onClose,
  onExecuteApplyMission,
}) => {
  const { addXP } = useT1ger();
  const { language, completeMission, brainState, pathData } = useBrain();
  const isEs = language === 'es';

  const playbook = getMissionPlaybook(mission);
  const [currentCard, setCurrentCard] = useState(0); // 0 to 3 (4 cards)
  const totalCards = 4;

  const [startTime] = useState<number>(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const completionHandledRef = useRef(false);

  const applyMission = useMemo(() => {
    const sourceLevel = pathData.track.levels.find(level =>
      level.days.some(day => day.missionIds.includes(mission.id))
    );
    if (!sourceLevel?.applyNodeId) return null;

    const allLessonsComplete = sourceLevel.days.every(day =>
      day.missionIds.every(missionId =>
        missionId === mission.id || brainState.missionHistory.some(
          record => record.missionId === missionId && record.completed
        )
      )
    );

    return allLessonsComplete
      ? MISSION_BANK.find(item => item.id === sourceLevel.applyNodeId) || null
      : null;
  }, [brainState.missionHistory, mission.id, pathData.track.levels]);

  const learnStreak = Math.max(1, brainState.learnStreak || 1);

  const handleNext = async () => {
    if (currentCard < totalCards - 1) {
      setCurrentCard((prev) => prev + 1);
    } else {
      if (completionHandledRef.current) return;
      completionHandledRef.current = true;
      // Completed all 4 cards -> Show Duolingo celebratory summary!
      const totalTime = Math.max(12, Math.round((Date.now() - startTime) / 1000));
      setElapsedSeconds(totalTime);
      completeMission(mission.id);
      await addXP(mission.xpReward || 100, 1, `mission:${mission.id}`);
      setShowSummary(true);
    }
  };

  const continueToNextStep = () => {
    if (applyMission) {
      onExecuteApplyMission(applyMission);
      return;
    }
    onClose();
  };

  const handleSummaryContinue = () => {
    setShowSummary(false);
    if (shouldCelebrateStreakToday()) {
      markStreakCelebratedToday();
      setShowStreakModal(true);
    } else {
      continueToNextStep();
    }
  };

  const handleStreakClose = () => {
    setShowStreakModal(false);
    continueToNextStep();
  };

  const handlePrev = () => {
    if (currentCard > 0) {
      setCurrentCard((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] w-full h-[100dvh] flex flex-col bg-[#09090B] text-zinc-100 select-none overflow-hidden">
      {/* Top Header & Segmented Progress Bar */}
      <div className="px-4 pt-[calc(1.2rem+env(safe-area-inset-top))] pb-3 border-b border-white/8 bg-[#09090B]/90 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 mb-3">
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[var(--ob-accent)]">
            <BookOpen size={14} /> PLAYBOOK EJECUTIVO
          </div>

          <div className="flex items-center gap-1 font-mono text-xs text-zinc-400 font-bold">
            <Sparkles size={13} className="text-amber-400" /> +{mission.xpReward} XP
          </div>
        </div>

        {/* 4-Segment Progress Bar */}
        <div className="flex items-center gap-1.5 w-full">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden"
            >
              <div
                className={`h-full transition-all duration-300 ${
                  idx < currentCard
                    ? 'w-full bg-[#3FC78E]'
                    : idx === currentCard
                    ? 'w-full bg-[var(--ob-accent)]'
                    : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Carousel */}
      <div className="flex-1 flex flex-col justify-between p-6 max-w-lg mx-auto w-full overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* CARD 1: SOURCE & MENTAL MODEL */}
          {currentCard === 0 && (
            <motion.div
              key="card-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-between py-2"
            >
              <div>
                {/* Source Citation Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-zinc-300 mb-4">
                  <span className="font-mono text-[10px] uppercase font-bold text-[var(--ob-accent)]">
                    FUENTE DESTILADA
                  </span>
                  <span>•</span>
                  <span className="truncate max-w-[200px]">{playbook.source.title}</span>
                </div>

                <h1 className="text-2xl font-bold text-white tracking-tight leading-snug">
                  {playbook.mentalModel.title}
                </h1>

                {/* Core Concept */}
                <p className="mt-4 text-base leading-relaxed text-zinc-300">
                  {playbook.mentalModel.concept}
                </p>

                {/* Interactive Tactical Widget (Swipe, Sliders, Value Formula) */}
                <div className="mt-5">
                  {mission.id === 'inv-m1-l1' && (
                    <InteractiveCardWidget type="swipe_classifier" isEs={isEs} />
                  )}
                  {(mission.id === 'inv-m2-l2' || mission.id === 'inv-m3-l2') && (
                    <InteractiveCardWidget type="compound_slider" isEs={isEs} />
                  )}
                  {mission.id === 'inv-m4-l1' && (
                    <InteractiveCardWidget type="value_equation" isEs={isEs} />
                  )}
                </div>

                {/* Author Quote Box */}
                {playbook.source.keyQuote && !mission.id.includes('inv-m1-l1') && (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4 relative">
                    <p className="text-sm italic text-zinc-200 leading-relaxed">
                      "{playbook.source.keyQuote}"
                    </p>
                    <p className="mt-2 text-xs font-mono font-bold text-[var(--ob-accent)] uppercase">
                      — {playbook.source.author}
                    </p>
                  </div>
                )}

                {/* Why it Matters */}
                <div className="mt-5 rounded-2xl border border-[#3FC78E]/30 bg-[#3FC78E]/[0.06] p-4 flex items-start gap-3">
                  <Zap size={20} className="text-[#3FC78E] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-xs font-bold uppercase tracking-wider text-[#3FC78E]">
                      ¿Por qué importa este criterio?
                    </strong>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      {playbook.mentalModel.whyItMatters}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CARD 2: TOOLS & PLATFORMS COMPARISON */}
          {currentCard === 1 && (
            <motion.div
              key="card-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-between py-2"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[var(--ob-accent)] bg-[var(--ob-accent)]/10 px-2.5 py-1 rounded-full border border-[var(--ob-accent)]/20">
                    HERRAMIENTAS & PLATAFORMAS
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">Paso 2 de 4</span>
                </div>

                <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                  ¿Dónde y cuándo ejecutar?
                </h2>
                <p className="mt-2 text-xs text-zinc-400">
                  Las mejores opciones probadas para aplicar este concepto sin perder tiempo en pruebas.
                </p>

                {/* Tool Cards */}
                <div className="mt-5 space-y-3">
                  {playbook.toolComparisons?.map((tool, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        tool.recommended
                          ? 'border-[var(--ob-accent)]/40 bg-[var(--ob-accent)]/[0.04] shadow-[0_0_20px_rgba(255,115,0,0.1)]'
                          : 'border-white/10 bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wrench size={16} className={tool.recommended ? 'text-[var(--ob-accent)]' : 'text-zinc-400'} />
                          <h3 className="text-sm font-bold text-white">{tool.name}</h3>
                        </div>
                        {tool.recommended && (
                          <span className="px-2 py-0.5 rounded-full bg-[var(--ob-accent)] text-black font-mono text-[10px] font-black uppercase">
                            Recomendada
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-300 mt-2 font-medium">
                        <strong>Mejor para:</strong> {tool.bestFor}
                      </p>

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {tool.pros.map((pro, pIdx) => (
                          <span
                            key={pIdx}
                            className="inline-flex items-center gap-1 text-[10px] font-mono bg-white/[0.04] text-zinc-400 px-2 py-0.5 rounded-md border border-white/6"
                          >
                            <Check size={10} className="text-[#3FC78E]" /> {pro}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* CARD 3: STEP-BY-STEP PROTOCOL */}
          {currentCard === 2 && (
            <motion.div
              key="card-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-between py-2"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[var(--ob-accent)] bg-[var(--ob-accent)]/10 px-2.5 py-1 rounded-full border border-[var(--ob-accent)]/20">
                    PROTOCOLO DE EJECUCIÓN
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">Paso 3 de 4</span>
                </div>

                <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                  Checklist Paso a Paso
                </h2>
                <p className="mt-2 text-xs text-zinc-400">
                  Sigue esta secuencia exacta para no cometer errores de principiante.
                </p>

                {/* Protocol Steps List */}
                <div className="mt-5 space-y-3">
                  {playbook.protocolSteps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-start gap-3"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/10 font-mono text-xs font-bold text-[var(--ob-accent)] border border-white/10">
                        {step.stepNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white leading-tight">
                          {step.title}
                        </h4>
                        <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                          {step.instruction}
                        </p>
                        {step.proTip && (
                          <p className="text-[11px] text-amber-300/90 mt-1.5 font-medium flex items-center gap-1">
                            <Sparkles size={11} className="shrink-0" /> Tip: {step.proTip}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* CARD 4: THE ACTION BRIDGE (Apply in real life) */}
          {currentCard === 3 && (
            <motion.div
              key="card-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-between py-2 text-center"
            >
              <div>
                <div className="mx-auto h-20 w-20 rounded-full bg-[var(--ob-accent)]/15 border-2 border-[var(--ob-accent)]/40 flex items-center justify-center text-[var(--ob-accent)] mb-4 shadow-[0_0_35px_rgba(255,115,0,0.3)]">
                  <Target size={38} />
                </div>

                <span className="font-mono text-xs uppercase font-extrabold tracking-[0.2em] text-[var(--ob-accent)]">
                  MOMENTO DE LA VERDAD
                </span>

                <h2 className="text-3xl font-black text-white mt-1 leading-tight">
                  Aplica lo aprendido hoy
                </h2>

                <p className="mt-3 text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  Ya tienes el criterio y el framework en tu cabeza. Ahora ejecútalo en el simulador o en tu entorno real para desbloquear tu progreso.
                </p>

                {/* Deliverable Box */}
                <div className="mt-6 rounded-2xl border border-white/12 bg-white/[0.03] p-4 text-left">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#3FC78E] bg-[#3FC78E]/10 px-2 py-0.5 rounded-full border border-[#3FC78E]/20">
                      ENTREGABLE TÁCTICO
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">~5 minutos</span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-1">
                    {playbook.applyMissionPrompt.deliverableTitle}
                  </h3>

                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    {playbook.applyMissionPrompt.actionDescription}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Navigation Buttons */}
      <div className="pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 px-4 border-t border-white/10 bg-[#09090B] max-w-lg mx-auto w-full">
        <div className="flex items-center gap-3">
          {currentCard > 0 && (
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(8);
                handlePrev();
              }}
              className="flex h-13 w-13 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.05] text-zinc-300 hover:text-white hover:bg-white/10 transition active:scale-[0.96] cursor-pointer shrink-0"
              title={isEs ? 'Anterior' : 'Previous'}
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(12);
              handleNext();
            }}
            className="flex-1 py-4 px-6 rounded-2xl font-mono font-extrabold text-sm tracking-wider flex items-center justify-center gap-2.5 bg-[#FF7300] hover:brightness-110 text-black shadow-[0_0_35px_rgba(255,115,0,0.45)] border border-[#FFA500]/50 transition-all active:scale-[0.97] cursor-pointer"
          >
            {currentCard < totalCards - 1 ? (
              <>
                <span className="font-extrabold">{isEs ? 'CONTINUAR' : 'CONTINUE'}</span>
                <ArrowRight size={19} strokeWidth={2.5} />
              </>
            ) : (
              <>
                <span className="font-extrabold">
                  {applyMission
                    ? (isEs ? '⚡ COMPLETAR Y APLICAR' : '⚡ COMPLETE & APPLY')
                    : (isEs ? 'COMPLETAR LECCIÓN' : 'COMPLETE LESSON')}
                </span>
                <ChevronRight size={19} strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* DUOLINGO LESSON SUMMARY MODAL (Time, Accuracy, Total XP, Mascot celebration) */}
      <LessonSummaryModal
        isOpen={showSummary}
        onContinue={handleSummaryContinue}
        xpEarned={mission.xpReward || 100}
        timeSpentSeconds={elapsedSeconds}
        accuracyPercentage={100}
        lessonTitle={mission.title}
        isEs={isEs}
      />

      {/* STREAK CELEBRATION MODAL */}
      <StreakCelebrationModal
        isOpen={showStreakModal}
        onClose={handleStreakClose}
        previousStreak={Math.max(0, learnStreak - 1)}
        newStreak={learnStreak}
      />
    </div>
  );
};
