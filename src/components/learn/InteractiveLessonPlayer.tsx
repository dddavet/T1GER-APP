import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  HelpCircle,
  TrendingUp,
  X,
  Target,
  Trophy
} from 'lucide-react';
import type { BankMission, MicroLessonCard, QuizOption } from '../../services/missionBank';
import { getMissionMicroCards } from '../../services/missionBank';
import { useT1ger } from '../../contexts/T1gerContext';
import { useBrain } from '../../contexts/BrainContext';
import { fireRewardConfetti } from '../ui/confetti';
import { MemoryShieldBadge } from './MemoryShieldBadge';

interface InteractiveLessonPlayerProps {
  mission: BankMission;
  onClose: () => void;
  onComplete: (missionId: string) => void;
}

export const InteractiveLessonPlayer: React.FC<InteractiveLessonPlayerProps> = ({
  mission,
  onClose,
  onComplete,
}) => {
  const { addXP } = useT1ger();
  const { completeMission } = useBrain();
  const cards = getMissionMicroCards(mission);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentCard = cards[currentCardIndex];
  const isLastCard = currentCardIndex === cards.length - 1;

  const handleNext = () => {
    if (currentCard.type === 'recall' && !isAnswerChecked) {
      setIsAnswerChecked(true);
      return;
    }

    if (isLastCard) {
      handleFinish();
    } else {
      setCurrentCardIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    }
  };

  const handleFinish = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      addXP(mission.xpReward || 100);
      completeMission(mission.id, 100);
      fireRewardConfetti();
      setIsFinished(true);
      setTimeout(() => {
        onComplete(mission.id);
      }, 2500);
    } catch (e) {
      console.error('Error completing micro-lesson:', e);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const correctOptionIndex = currentCard.options?.findIndex((opt) => opt.correct) ?? 0;
  const isCorrect = selectedOption === correctOptionIndex;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#09090B] text-zinc-100 select-none overflow-hidden">
      {/* Top Navigation & Segmented Progress Bar */}
      <div className="safe-top px-4 pt-4 pb-2 border-b border-white/8 bg-[#09090B]/90 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 mb-3">
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[var(--ob-accent)]">
            <Sparkles size={14} /> +{mission.xpReward} XP
          </div>

          <div className="h-9 w-9" /> {/* Spacer */}
        </div>

        {/* Kinnu-Style Segmented Progress Bar */}
        <div className="flex items-center gap-1.5 w-full">
          {cards.map((card, idx) => (
            <div
              key={card.id}
              className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden"
            >
              <div
                className={`h-full transition-all duration-300 ${
                  idx < currentCardIndex
                    ? 'w-full bg-[#3FC78E]'
                    : idx === currentCardIndex
                    ? 'w-full bg-[var(--ob-accent)]'
                    : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-between p-6 max-w-lg mx-auto w-full overflow-y-auto">
        <AnimatePresence mode="wait">
          {isFinished ? (
            /* Celebration Screen */
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center my-auto py-8"
            >
              <div className="relative mb-6">
                <div className="h-28 w-28 rounded-full bg-[#3FC78E]/15 border-2 border-[#3FC78E]/40 flex items-center justify-center shadow-[0_0_40px_rgba(63,199,142,0.3)]">
                  <Trophy size={48} className="text-[#3FC78E]" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute -bottom-2 -right-2 rounded-full bg-[var(--ob-accent)] p-2 text-black font-bold shadow-lg"
                >
                  <Sparkles size={16} />
                </motion.div>
              </div>

              <span className="font-mono text-xs uppercase font-bold tracking-[0.2em] text-[#3FC78E]">
                LECCIÓN DOMINADA
              </span>
              <h2 className="text-3xl font-black text-white mt-1">
                +{mission.xpReward} XP Ganados
              </h2>

              <p className="text-zinc-400 text-xs mt-2 max-w-xs leading-relaxed">
                Tu escudo de memoria para <strong>{mission.title}</strong> ha sido blindado al 100%.
              </p>

              <div className="mt-6 flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
                <MemoryShieldBadge percentage={100} size="md" />
                <div className="text-left">
                  <p className="text-xs font-bold text-white">Escudo Cognitivo FSRS</p>
                  <p className="text-[11px] text-zinc-400">Próximo repaso inteligente en 3 días</p>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Card Flow */
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-between py-2"
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[var(--ob-accent)] bg-[var(--ob-accent)]/10 px-2.5 py-1 rounded-full border border-[var(--ob-accent)]/20">
                    {currentCard.subtitle || 'MODELO TÁCTICO'}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    Paso {currentCardIndex + 1} de {cards.length}
                  </span>
                </div>

                {/* Main Card Title */}
                <h1 className="text-2xl font-bold text-white tracking-tight leading-snug">
                  {currentCard.title}
                </h1>

                {/* Main Body Content */}
                <p className="mt-4 text-base leading-relaxed text-zinc-300 font-normal">
                  {currentCard.content}
                </p>

                {/* Visual / Diagram Slot */}
                {currentCard.visual && (
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {currentCard.visual.items?.map((item, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col justify-between"
                      >
                        <span className="text-xs font-medium text-zinc-400">{item.label}</span>
                        <span
                          className={`text-2xl font-mono font-black mt-2 ${
                            item.positive ? 'text-[#3FC78E]' : 'text-[var(--ob-accent)]'
                          }`}
                        >
                          {item.value}
                        </span>
                        {item.desc && (
                          <span className="text-[10px] text-zinc-500 mt-1 leading-tight">
                            {item.desc}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Key Highlight Banner */}
                {currentCard.highlight && (
                  <div className="mt-6 rounded-2xl border border-[var(--ob-accent)]/30 bg-[var(--ob-accent)]/[0.06] p-4 flex items-start gap-3">
                    <Zap size={20} className="text-[var(--ob-accent)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">
                        Regla de Oro
                      </p>
                      <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                        {currentCard.highlight}
                      </p>
                    </div>
                  </div>
                )}

                {/* Quiz / Dilemma Interactive Options */}
                {currentCard.options && currentCard.options.length > 0 && (
                  <div className="mt-6 space-y-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Elige tu respuesta táctica:
                    </p>
                    {currentCard.options.map((option, optIdx) => {
                      const isSelected = selectedOption === optIdx;
                      let optionStyle = 'border-white/10 bg-white/[0.03] text-zinc-200 hover:border-white/20';

                      if (isSelected && !isAnswerChecked) {
                        optionStyle = 'border-[var(--ob-accent)] bg-[var(--ob-accent)]/10 text-white';
                      } else if (isAnswerChecked) {
                        if (option.correct) {
                          optionStyle = 'border-[#3FC78E] bg-[#3FC78E]/15 text-[#3FC78E] font-semibold';
                        } else if (isSelected && !option.correct) {
                          optionStyle = 'border-rose-500 bg-rose-500/15 text-rose-300';
                        } else {
                          optionStyle = 'border-white/5 bg-white/[0.01] text-zinc-600 opacity-50';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isAnswerChecked}
                          onClick={() => setSelectedOption(optIdx)}
                          className={`w-full text-left p-4 rounded-2xl border text-sm leading-relaxed transition flex items-start gap-3 cursor-pointer ${optionStyle}`}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-mono font-bold mt-0.5">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">{option.text}</span>
                          {isAnswerChecked && option.correct && (
                            <CheckCircle2 size={18} className="text-[#3FC78E] shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Feedback Box */}
                {isAnswerChecked && currentCard.feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 rounded-2xl p-4 border text-xs leading-relaxed ${
                      isCorrect
                        ? 'border-[#3FC78E]/40 bg-[#3FC78E]/10 text-[#D1F2E8]'
                        : 'border-rose-500/40 bg-rose-500/10 text-[#FADBD8]'
                    }`}
                  >
                    <strong className="block text-sm font-bold text-white mb-1">
                      {isCorrect ? '¡Excelente Criterio!' : 'Lección Clave:'}
                    </strong>
                    {isCorrect ? currentCard.feedback.correct : currentCard.feedback.incorrect}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Bottom Action Button */}
        {!isFinished && (
          <div className="pt-6 pb-2">
            <button
              onClick={handleNext}
              disabled={currentCard.type === 'recall' && selectedOption === null && !isAnswerChecked}
              className={`w-full py-4 rounded-2xl font-mono font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer ${
                currentCard.type === 'recall' && selectedOption === null && !isAnswerChecked
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-[var(--ob-accent)] hover:brightness-110 text-black shadow-[0_0_25px_rgba(255,115,0,0.3)]'
              }`}
            >
              {currentCard.type === 'recall' && !isAnswerChecked ? (
                <>
                  <span>COMPROBAR RESPUESTA</span>
                  <Check size={18} />
                </>
              ) : isLastCard ? (
                <>
                  <span>BLINDAR MEMORIA</span>
                  <ShieldCheck size={18} />
                </>
              ) : (
                <>
                  <span>CONTINUAR</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
