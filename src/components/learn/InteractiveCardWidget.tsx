import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, TrendingUp, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export type InteractiveWidgetType = 'swipe_classifier' | 'compound_slider' | 'habit_builder' | 'value_equation';

interface InteractiveCardWidgetProps {
  type: InteractiveWidgetType;
  onSuccess?: () => void;
  isEs?: boolean;
}

export const InteractiveCardWidget: React.FC<InteractiveCardWidgetProps> = ({
  type,
  onSuccess,
  isEs = true,
}) => {
  // 1. SWIPE CLASSIFIER (Activo vs Pasivo - Robert Kiyosaki)
  if (type === 'swipe_classifier') {
    const items = [
      { id: 1, text: 'Auto deportivo de lujo en leasing', isAsset: false, hint: 'Drena dinero mensual de tu bolsillo' },
      { id: 2, text: 'Fondo indexado VTI con dividendos', isAsset: true, hint: 'Pone dinero en tu bolsillo sin tu tiempo' },
      { id: 3, text: 'Suscripciones y membresías olvidadas', isAsset: false, hint: 'Fuga silenciosa de liquidez' },
      { id: 4, text: 'Bienes raíces con renta neta positiva', isAsset: true, hint: 'Flujo de caja neto generado cada mes' },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const currentItem = items[currentIndex];
    const isFinished = currentIndex >= items.length;

    const handleChoice = (chosenAsset: boolean) => {
      if (!currentItem || feedback !== null) return;
      const isCorrect = currentItem.isAsset === chosenAsset;
      setFeedback(isCorrect ? 'correct' : 'wrong');
      if (isCorrect) setScore((s) => s + 1);

      if (typeof window !== 'undefined' && window.navigator.vibrate) {
        window.navigator.vibrate(isCorrect ? 40 : [50, 40, 50]);
      }

      setTimeout(() => {
        setFeedback(null);
        setCurrentIndex((i) => i + 1);
        if (currentIndex + 1 >= items.length) {
          onSuccess?.();
        }
      }, 750);
    };

    return (
      <div className="rounded-2xl border border-white/10 bg-[#121216] p-4 text-center select-none shadow-lg">
        <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-zinc-400">
          <span className="text-[var(--ob-accent)] font-bold uppercase">
            {isEs ? '⚡ DECISIÓN RÁPIDA (ACTIVO O PASIVO)' : '⚡ FAST DECISION (ASSET OR LIABILITY)'}
          </span>
          <span>{Math.min(currentIndex + 1, items.length)}/{items.length}</span>
        </div>

        {!isFinished ? (
          <div>
            <motion.div
              key={currentItem.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`rounded-2xl border p-5 transition-all ${
                feedback === 'correct'
                  ? 'border-[#3FC78E] bg-[#3FC78E]/10'
                  : feedback === 'wrong'
                  ? 'border-rose-500 bg-rose-500/10'
                  : 'border-white/12 bg-white/[0.03]'
              }`}
            >
              <span className="text-xs text-zinc-400 font-medium block mb-1">
                {isEs ? '¿Cómo clasificas esto?' : 'How do you classify this?'}
              </span>
              <h4 className="text-base font-bold text-white leading-snug">
                "{currentItem.text}"
              </h4>

              {feedback && (
                <p className="mt-2 text-xs font-mono font-bold text-zinc-300">
                  {feedback === 'correct' ? '✅ ' : '❌ '} {currentItem.hint}
                </p>
              )}
            </motion.div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => handleChoice(false)}
                className="py-3 px-4 rounded-xl border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-mono text-xs font-bold transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <X size={16} />
                <span>{isEs ? 'PASIVO' : 'LIABILITY'}</span>
              </button>
              <button
                onClick={() => handleChoice(true)}
                className="py-3 px-4 rounded-xl border border-[#3FC78E]/40 bg-[#3FC78E]/15 hover:bg-[#3FC78E]/25 text-[#3FC78E] font-mono text-xs font-bold transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check size={16} />
                <span>{isEs ? 'ACTIVO' : 'ASSET'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-[#3FC78E] text-black font-black mb-2 shadow-lg">
              <Check size={24} className="stroke-[3]" />
            </div>
            <h4 className="text-base font-bold text-white">
              {isEs ? '¡Criterio Financiero Blindado!' : 'Financial Criteria Mastered!'}
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              {isEs ? `Acertaste ${score} de ${items.length} decisiones.` : `You got ${score} of ${items.length} correct.`}
            </p>
          </div>
        )}
      </div>
    );
  }

  // 2. COMPOUND INTEREST SLIDER (Morgan Housel - Psicología del Dinero)
  if (type === 'compound_slider') {
    const [monthlyContribution, setMonthlyContribution] = useState(250);
    const [years, setYears] = useState(20);
    const rate = 0.10; // 10% annual historical S&P 500

    // Compound Formula: FV = P * (((1 + r/n)^(n*t) - 1) / (r/n))
    const months = years * 12;
    const monthlyRate = rate / 12;
    const totalWealth = Math.round(
      monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    );
    const totalDeposited = monthlyContribution * months;
    const compoundGrowth = totalWealth - totalDeposited;

    return (
      <div className="rounded-2xl border border-white/10 bg-[#121216] p-4 select-none shadow-lg">
        <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-zinc-400">
          <span className="text-[var(--ob-accent)] font-bold uppercase">
            {isEs ? '📈 SIMULADOR DE INTERÉS COMPUESTO' : '📈 COMPOUND GROWTH SIMULATOR'}
          </span>
          <span className="text-emerald-400 font-bold">10% Anual Histórico</span>
        </div>

        {/* Wealth Output Card */}
        <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-b from-amber-400/10 to-transparent p-4 text-center mb-4">
          <span className="text-[11px] text-zinc-400 font-mono uppercase block">
            {isEs ? `Patrimonio acumulado en ${years} años` : `Accumulated wealth in ${years} years`}
          </span>
          <h3 className="text-3xl font-mono font-black text-amber-400 mt-1">
            ${totalWealth.toLocaleString()} USD
          </h3>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs font-mono text-zinc-400">
            <span>{isEs ? 'Tu ahorro:' : 'Deposited:'} <strong>${totalDeposited.toLocaleString()}</strong></span>
            <span>{isEs ? 'Ganancia pura:' : 'Interest:'} <strong className="text-emerald-400">+${compoundGrowth.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-zinc-400">{isEs ? 'Aporte mensual:' : 'Monthly deposit:'}</span>
              <span className="text-white font-bold">${monthlyContribution} USD</span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full accent-[var(--ob-accent)] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-zinc-400">{isEs ? 'Horizonte temporal:' : 'Time horizon:'}</span>
              <span className="text-white font-bold">{years} {isEs ? 'años' : 'years'}</span>
            </div>
            <input
              type="range"
              min="5"
              max="35"
              step="5"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-[var(--ob-accent)] cursor-pointer"
            />
          </div>
        </div>

        <p className="mt-3 text-[11px] text-zinc-400 italic text-center">
          {isEs ? '💡 La mayor parte de la riqueza no ocurre por suerte, sino por no interrumpir el tiempo.' : '💡 Most wealth comes from consistency, not luck.'}
        </p>
      </div>
    );
  }

  // 3. VALUE EQUATION MULTIPLIER ($100M Offers - Alex Hormozi)
  if (type === 'value_equation') {
    const [dreamOutcome, setDreamOutcome] = useState(9);
    const [perceivedLikelihood, setPerceivedLikelihood] = useState(8);
    const [timeDelay, setTimeDelay] = useState(2);
    const [effort, setEffort] = useState(2);

    const valueScore = Math.round((dreamOutcome * perceivedLikelihood) / Math.max(1, (timeDelay * effort) / 2));

    return (
      <div className="rounded-2xl border border-white/10 bg-[#121216] p-4 select-none shadow-lg">
        <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-zinc-400">
          <span className="text-[var(--ob-accent)] font-bold uppercase">
            {isEs ? '⚡ ECUACIÓN DE GRAN VALOR (HORMOZI)' : '⚡ VALUE EQUATION (HORMOZI)'}
          </span>
          <span className="text-amber-400 font-bold">{isEs ? 'Multiplicador de Precio' : 'Price Multiplier'}</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-center mb-4">
          <div className="text-xs text-zinc-400 font-mono mb-1">
            Valor = (Resultado × Certeza) ÷ (Tiempo × Esfuerzo)
          </div>
          <div className="text-2xl font-black font-mono text-white flex items-center justify-center gap-2">
            <span>Score de Oferta:</span>
            <span className="text-[var(--ob-accent)] bg-[var(--ob-accent)]/15 px-2.5 py-0.5 rounded-xl border border-[var(--ob-accent)]/30">
              {valueScore}x
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20">
            <span className="text-emerald-300 font-bold block mb-1">⬆️ Maximizar</span>
            <label className="text-[10px] text-zinc-400 block">Resultado Soñado: {dreamOutcome}/10</label>
            <input type="range" min="1" max="10" value={dreamOutcome} onChange={(e) => setDreamOutcome(Number(e.target.value))} className="w-full accent-emerald-400" />
            <label className="text-[10px] text-zinc-400 block mt-1">Certeza Percibida: {perceivedLikelihood}/10</label>
            <input type="range" min="1" max="10" value={perceivedLikelihood} onChange={(e) => setPerceivedLikelihood(Number(e.target.value))} className="w-full accent-emerald-400" />
          </div>

          <div className="p-2.5 rounded-xl bg-rose-500/[0.08] border border-rose-500/20">
            <span className="text-rose-300 font-bold block mb-1">⬇️ Reducir a Cero</span>
            <label className="text-[10px] text-zinc-400 block">Retraso Tiempo: {timeDelay}/10</label>
            <input type="range" min="1" max="10" value={timeDelay} onChange={(e) => setTimeDelay(Number(e.target.value))} className="w-full accent-rose-400" />
            <label className="text-[10px] text-zinc-400 block mt-1">Esfuerzo Cliente: {effort}/10</label>
            <input type="range" min="1" max="10" value={effort} onChange={(e) => setEffort(Number(e.target.value))} className="w-full accent-rose-400" />
          </div>
        </div>
      </div>
    );
  }

  return null;
};
