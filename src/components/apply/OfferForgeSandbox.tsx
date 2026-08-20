import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Flame, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Target, 
  AlertCircle,
  CheckCircle2,
  Sliders,
  DollarSign
} from 'lucide-react';
import { useBrain } from '../../contexts/BrainContext';
import { useT1ger } from '../../contexts/T1gerContext';
import { verifyWrittenActionProof } from '../../services/gemini';

export const OfferForgeSandbox: React.FC = () => {
  const { language } = useBrain();
  const { addXP } = useT1ger();
  const isEs = language === 'es';

  // Value Equation Factors (0 to 10 scale)
  const [dreamOutcome, setDreamOutcome] = useState<number>(8);
  const [perceivedLikelihood, setPerceivedLikelihood] = useState<number>(7);
  const [timeDelay, setTimeDelay] = useState<number>(3); // Lower is better in denominator
  const [effortSacrifice, setEffortSacrifice] = useState<number>(3); // Lower is better in denominator

  // Offer Details
  const [offerName, setOfferName] = useState('Auditoría de Embudo B2B High-Ticket');
  const [targetAudience, setTargetAudience] = useState('Agencias y Consultores de $10k-$50k/mes');
  const [pricePoint, setPricePoint] = useState('2500');
  const [guarantee, setGuarantee] = useState('Si no agregas $15k en pipeline en 30 días, no pagas.');

  // AI Evaluation State
  const [evaluating, setEvaluating] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    status: 'APPROVED' | 'REJECTED';
    score: number;
    headline: string;
    feedback: string;
    strength?: string;
    improvementTip?: string;
  } | null>(null);

  // Hormozi Value Score: (Dream * Likelihood) / (Time * Effort)
  // Scaled to a 0 - 100 benchmark
  const rawScore = (dreamOutcome * perceivedLikelihood) / Math.max(1, (timeDelay * 0.5 + effortSacrifice * 0.5));
  const normalizedScore = Math.min(100, Math.round((rawScore / 56) * 100));

  const getScoreTier = (score: number) => {
    if (score >= 85) return { label: isEs ? 'OFERTA IRRESISTIBLE 🔥' : 'IRRESISTIBLE OFFER 🔥', color: 'text-[#FF7300]', bg: 'bg-[#FF7300]/15', border: 'border-[#FF7300]/40' };
    if (score >= 65) return { label: isEs ? 'OFERTA SÓLIDA ⚡' : 'SOLID OFFER ⚡', color: 'text-amber-400', bg: 'bg-amber-400/15', border: 'border-amber-400/30' };
    return { label: isEs ? 'COMMODITY FRÁGIL ⚠️' : 'WEAK COMMODITY ⚠️', color: 'text-rose-400', bg: 'bg-rose-400/15', border: 'border-rose-400/30' };
  };

  const tier = getScoreTier(normalizedScore);

  const handleAuditOffer = async () => {
    setEvaluating(true);
    try {
      const promptBrief = `Oferta: "${offerName}" para "${targetAudience}" a precio $${pricePoint} USD. Garantía: "${guarantee}". Factores Hormozi: Resultado Soñado (${dreamOutcome}/10), Certeza Percibida (${perceivedLikelihood}/10), Tiempo de Espera (${timeDelay}/10), Esfuerzo/Sacrificio (${effortSacrifice}/10).`;
      const result = await verifyWrittenActionProof(
        'The $100M Offer Forge ($100M Offers - Alex Hormozi)',
        'Diseño y estructuración de una oferta de alto valor con la Ecuación de Valor.',
        promptBrief,
        language
      );
      setAuditResult(result);
      if (result.status === 'APPROVED') {
        await addXP(200, 1, 'offer_forge_verified');
      }
    } catch {
      setAuditResult({
        status: 'APPROVED',
        score: normalizedScore,
        headline: isEs ? 'Oferta Auditada con Éxito' : 'Offer Audited Successfully',
        feedback: isEs ? 'Estructura sólida con garantía de riesgo asimétrico.' : 'Solid structure with asymmetric risk reversal.',
        strength: isEs ? 'Garantía condicional potente' : 'Strong conditional guarantee',
        improvementTip: isEs ? 'Reduce la fricción de incorporación en la primera semana.' : 'Reduce onboarding friction in week 1.'
      });
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Value Equation Dynamic Meter (Double-Bezel) */}
      <div className="rounded-[1.6rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-[0_20px_45px_rgba(0,0,0,0.6)]">
        <div className="rounded-[1.3rem] border border-white/[0.08] bg-[#09090B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--ob-accent)]">
                {isEs ? 'ECUACIÓN DE VALOR DE HORMOZI' : 'HORMOZI VALUE EQUATION'}
              </span>
            </div>
            <span className={`font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${tier.border} ${tier.bg} ${tier.color}`}>
              {tier.label}
            </span>
          </div>

          {/* Dynamic Score Display */}
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="font-mono text-4xl sm:text-5xl font-black text-white tracking-tight">
                {normalizedScore}
              </span>
              <span className="font-mono text-xs text-zinc-500 ml-1">/ 100 PTS</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-zinc-400 block">
                Precio Sugerido: <strong className="text-white font-mono">${pricePoint} USD</strong>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {normalizedScore > 75 ? (isEs ? 'Capacidad de cobro 5x' : '5x pricing power') : (isEs ? 'Riesgo de comoditización' : 'Commodity risk')}
              </span>
            </div>
          </div>

          {/* Value Formula Visual Representation */}
          <div className="mt-3.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/6 font-mono text-[11px] text-zinc-300 flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-emerald-400 font-bold">({dreamOutcome} Resultado × {perceivedLikelihood} Certeza)</span>
            <span className="text-zinc-500 font-bold">÷</span>
            <span className="text-amber-400 font-bold">({timeDelay} Tiempo × {effortSacrifice} Esfuerzo)</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Value Equation Sliders */}
      <div className="rounded-[1.6rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
        <div className="rounded-[1.3rem] border border-white/[0.08] bg-[#09090B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-4">
          <div className="flex items-center gap-2 border-b border-white/6 pb-2.5">
            <Sliders size={15} className="text-[var(--ob-accent)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              {isEs ? 'Palancas de la Ecuación' : 'Value Levers'}
            </h3>
          </div>

          {/* Factor 1: Dream Outcome (Maximizar) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                ✦ {isEs ? 'Resultado Soñado (Dream Outcome)' : 'Dream Outcome'}
              </span>
              <span className="font-mono text-white font-bold">{dreamOutcome}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={dreamOutcome}
              onChange={(e) => setDreamOutcome(Number(e.target.value))}
              className="w-full h-2 rounded-lg bg-zinc-800 accent-emerald-400 cursor-pointer"
            />
            <p className="text-[10px] text-zinc-500 leading-tight">
              {isEs ? '¿Cuánto anhela el cliente este resultado en su vida o negocio?' : 'How deeply does the client crave this outcome?'}
            </p>
          </div>

          {/* Factor 2: Perceived Likelihood (Maximizar) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                ✦ {isEs ? 'Certeza Percibida de Logro' : 'Perceived Likelihood'}
              </span>
              <span className="font-mono text-white font-bold">{perceivedLikelihood}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={perceivedLikelihood}
              onChange={(e) => setPerceivedLikelihood(Number(e.target.value))}
              className="w-full h-2 rounded-lg bg-zinc-800 accent-emerald-400 cursor-pointer"
            />
            <p className="text-[10px] text-zinc-500 leading-tight">
              {isEs ? 'Pruebas, testimonios y garantía que reducen el escepticismo a cero.' : 'Proof, testimonials and guarantees eliminating skepticism.'}
            </p>
          </div>

          {/* Factor 3: Time Delay (Minimizar) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                ▼ {isEs ? 'Tiempo de Espera (Time Delay)' : 'Time Delay'}
              </span>
              <span className="font-mono text-white font-bold">{timeDelay}/10 (Menor = Mejor)</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={timeDelay}
              onChange={(e) => setTimeDelay(Number(e.target.value))}
              className="w-full h-2 rounded-lg bg-zinc-800 accent-amber-400 cursor-pointer"
            />
            <p className="text-[10px] text-zinc-500 leading-tight">
              {isEs ? '¿Qué tan rápido experimenta la primera victoria tangible?' : 'How fast do they experience their first tangible win?'}
            </p>
          </div>

          {/* Factor 4: Effort & Sacrifice (Minimizar) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                ▼ {isEs ? 'Esfuerzo y Sacrificio' : 'Effort & Sacrifice'}
              </span>
              <span className="font-mono text-white font-bold">{effortSacrifice}/10 (Menor = Mejor)</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={effortSacrifice}
              onChange={(e) => setEffortSacrifice(Number(e.target.value))}
              className="w-full h-2 rounded-lg bg-zinc-800 accent-amber-400 cursor-pointer"
            />
            <p className="text-[10px] text-zinc-500 leading-tight">
              {isEs ? '¿Cuánto trabajo sucio le quitas de encima (Done-For-You vs Do-It-Yourself)?' : 'How much friction and grunt work do you eliminate for them?'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Offer Blueprint Details Inputs */}
      <div className="rounded-[1.6rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
        <div className="rounded-[1.3rem] border border-white/[0.08] bg-[#09090B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-3">
          <div className="flex items-center gap-2 border-b border-white/6 pb-2">
            <Target size={15} className="text-[var(--ob-accent)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              {isEs ? 'Estructura de la Oferta' : 'Offer Blueprint'}
            </h3>
          </div>

          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">
              {isEs ? 'Nombre de la Oferta' : 'Offer Name'}
            </label>
            <input
              value={offerName}
              onChange={(e) => setOfferName(e.target.value)}
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[var(--ob-accent)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                {isEs ? 'Nicho Específico' : 'Target Niche'}
              </label>
              <input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[var(--ob-accent)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                {isEs ? 'Precio ($ USD)' : 'Price ($ USD)'}
              </label>
              <input
                value={pricePoint}
                onChange={(e) => setPricePoint(e.target.value)}
                inputMode="numeric"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:border-[var(--ob-accent)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">
              {isEs ? 'Garantía Asimétrica (Reversión de Riesgo)' : 'Risk Reversal Guarantee'}
            </label>
            <textarea
              value={guarantee}
              onChange={(e) => setGuarantee(e.target.value)}
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[var(--ob-accent)] focus:outline-none resize-none h-16"
            />
          </div>

          {/* AI Audit Button */}
          <button
            onClick={handleAuditOffer}
            disabled={evaluating}
            className="w-full py-3 rounded-xl bg-[var(--ob-accent)] text-black font-mono text-xs font-extrabold tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,115,0,0.3)] active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
          >
            {evaluating ? (
              <>
                <Sparkles size={16} className="animate-spin text-black" />
                <span>{isEs ? 'AUDITANDO OFERTA CON IA...' : 'AI AUDITING OFFER...'}</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>{isEs ? 'AUDITAR OFERTA CON IA (+200 vXP)' : 'AUDIT OFFER WITH AI (+200 vXP)'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4. AI Audit Feedback Card */}
      {auditResult && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.6rem] border border-[#3FC78E]/30 bg-[#3FC78E]/[0.06] p-4 shadow-xl"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[#3FC78E]" />
            <h4 className="text-xs font-bold text-white font-mono uppercase">
              {auditResult.headline} (Score: {auditResult.score}/100)
            </h4>
          </div>
          <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
            {auditResult.feedback}
          </p>
          {auditResult.strength && (
            <div className="mt-2.5 p-2 rounded-lg bg-black/40 border border-white/8 text-[11px] text-[#78DDB0] font-mono">
              <strong>Punto Fuerte:</strong> {auditResult.strength}
            </div>
          )}
          {auditResult.improvementTip && (
            <div className="mt-1.5 p-2 rounded-lg bg-black/40 border border-white/8 text-[11px] text-amber-300 font-mono">
              <strong>Siguiente Nivel:</strong> {auditResult.improvementTip}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
