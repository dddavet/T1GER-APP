import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Sparkles,
  X,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Flame
} from 'lucide-react';
import type { BankMission } from '../../services/missionBank';
import { useT1ger } from '../../contexts/T1gerContext';
import { useBrain } from '../../contexts/BrainContext';
import { fireRewardConfetti } from '../ui/confetti';
import { MemoryShieldBadge } from './MemoryShieldBadge';

interface QuickShieldRefreshModalProps {
  vulnerableMissions: BankMission[];
  onClose: () => void;
  onSuccess: () => void;
}

export const QuickShieldRefreshModal: React.FC<QuickShieldRefreshModalProps> = ({
  vulnerableMissions,
  onClose,
  onSuccess,
}) => {
  const { addXP } = useT1ger();
  const { completeMission } = useBrain();

  // Queue up to 3 questions
  const questions = vulnerableMissions.slice(0, 3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentMission = questions[currentIndex];
  const options = currentMission?.recallOptions || currentMission?.options || [
    { text: currentMission?.keyTakeaway || 'Aplica evidencia y consistencia.', correct: true },
    { text: 'Aceptar riesgo desmedido siempre da el mejor resultado.', correct: false },
    { text: 'La complejidad sin ejecución es superior.', correct: false },
  ];

  const correctIndex = options.findIndex((opt) => opt.correct);
  const isCorrect = selectedOption === correctIndex;

  const handleCheck = () => {
    setChecked(true);
    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    // Complete mission to update FSRS memory shield
    completeMission(currentMission.id, currentMission.competency, isCorrect ? 100 : 60);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setChecked(false);
    } else {
      finishSpeedRound();
    }
  };

  const finishSpeedRound = () => {
    addXP(150);
    fireRewardConfetti();
    setFinished(true);
    setTimeout(() => {
      onSuccess();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-3xl border border-white/12 bg-[#121216] p-6 text-zinc-100 shadow-2xl overflow-hidden relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <X size={16} />
        </button>

        {finished ? (
          /* Finished Celebration */
          <div className="text-center py-6">
            <div className="mx-auto h-20 w-20 rounded-full bg-[#3FC78E]/20 border border-[#3FC78E]/40 flex items-center justify-center text-[#3FC78E] mb-4 shadow-[0_0_30px_rgba(63,199,142,0.4)]">
              <Trophy size={40} />
            </div>

            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#3FC78E]">
              ¡ESCUDOS BLINDADOS AL 100%!
            </span>
            <h2 className="text-2xl font-black text-white mt-1">+150 XP Recibidos</h2>
            <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto leading-relaxed">
              Completaste la ronda relámpago con éxito. Tu racha y tu memoria cognitiva están aseguradas.
            </p>

            <div className="mt-6 flex justify-center">
              <MemoryShieldBadge percentage={100} size="lg" />
            </div>
          </div>
        ) : (
          /* Active Question Flow */
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <Zap size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Ronda Relámpago (60s)
                  <Flame size={14} className="text-[var(--ob-accent)]" />
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Pregunta {currentIndex + 1} de {questions.length}
                </p>
              </div>
            </div>

            {/* Progress segment */}
            <div className="flex gap-1.5 mb-5">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i <= currentIndex ? 'bg-amber-400' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            {/* Question title & concept */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 mb-4">
              <span className="font-mono text-[10px] uppercase font-bold text-[var(--ob-accent)]">
                {currentMission.title}
              </span>
              <p className="text-sm font-semibold text-white mt-1 leading-snug">
                {currentMission.recallQuestion || currentMission.concept}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2 mb-5">
              {options.map((opt, i) => {
                const isSelected = selectedOption === i;
                let btnStyle = 'border-white/10 bg-white/[0.02] text-zinc-300 hover:bg-white/[0.05]';

                if (isSelected && !checked) {
                  btnStyle = 'border-amber-400 bg-amber-400/10 text-white';
                } else if (checked) {
                  if (opt.correct) {
                    btnStyle = 'border-[#3FC78E] bg-[#3FC78E]/15 text-[#3FC78E] font-bold';
                  } else if (isSelected && !opt.correct) {
                    btnStyle = 'border-rose-500 bg-rose-500/15 text-rose-300';
                  } else {
                    btnStyle = 'border-white/5 bg-white/[0.01] opacity-40 text-zinc-600';
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={checked}
                    onClick={() => setSelectedOption(i)}
                    className={`w-full p-3.5 rounded-xl border text-xs text-left transition flex items-start gap-2.5 cursor-pointer ${btnStyle}`}
                  >
                    <span className="h-4 w-4 rounded-full border border-current flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                    {checked && opt.correct && (
                      <CheckCircle2 size={16} className="text-[#3FC78E] shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action button */}
            {!checked ? (
              <button
                disabled={selectedOption === null}
                onClick={handleCheck}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Comprobar
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full py-3.5 rounded-xl bg-[var(--ob-accent)] hover:brightness-110 text-black font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{currentIndex < questions.length - 1 ? 'Siguiente Pregunta' : 'Finalizar y Blindar'}</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
