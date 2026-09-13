import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, Copy, FloppyDisk, Sparkle } from '@phosphor-icons/react';
import type { ActionWidget, LearningLocale, SavedLearningArtifact, ToolField } from '../../services/interactiveCurriculumTypes';
import { localizeLearning } from '../../services/interactiveCurriculumTypes';

interface MicroToolLabProps {
  lessonId: string;
  trackId: SavedLearningArtifact['trackId'];
  widget: ActionWidget;
  locale: LearningLocale;
  onCommit: (artifact: SavedLearningArtifact) => void;
}

const numberValue = (values: Record<string, string | number>, key: string, fallback = 0): number => {
  const parsed = Number(values[key]);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const money = (value: number, locale: LearningLocale): string =>
  new Intl.NumberFormat(locale === 'es' ? 'es-US' : 'en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

function calculateResult(widget: ActionWidget, values: Record<string, string | number>, locale: LearningLocale): { headline: string; detail: string; artifact: string } {
  const es = locale === 'es';
  const text = (key: string) => String(values[key] || '').trim();

  switch (widget.engine) {
    case 'cash_cost': {
      const cash = numberValue(values, 'cash');
      const years = numberValue(values, 'years');
      const missed = cash * (Math.pow(1.08, years) - 1);
      return { headline: money(missed, locale), detail: es ? `sobre ${money(cash, locale)} durante ${years} años al 8% supuesto` : `on ${money(cash, locale)} over ${years} years at an assumed 8%`, artifact: es ? `Mantendré mi colchón separado y revisaré ${money(cash, locale)} de excedente antes de ${years} años.` : `I will keep my buffer separate and review ${money(cash, locale)} of surplus before ${years} years.` };
    }
    case 'compound_growth': {
      const monthly = numberValue(values, 'monthly');
      const years = numberValue(values, 'years');
      const annualRate = numberValue(values, 'rate') / 100;
      const months = years * 12;
      const monthlyRate = annualRate / 12;
      const future = monthlyRate === 0 ? monthly * months : monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      return { headline: money(future, locale), detail: es ? `${money(monthly, locale)} al mes durante ${years} años` : `${money(monthly, locale)} monthly for ${years} years`, artifact: es ? `Aportaré ${money(monthly, locale)} cada mes durante ${years} años y revisaré el plan una vez al año.` : `I will contribute ${money(monthly, locale)} monthly for ${years} years and review the plan once a year.` };
    }
    case 'etf_fee_drag': {
      const balance = numberValue(values, 'balance');
      const lowFee = numberValue(values, 'lowFee') / 100;
      const highFee = numberValue(values, 'highFee') / 100;
      const lowFuture = balance * Math.pow(1 + 0.08 - lowFee, 20);
      const highFuture = balance * Math.pow(1 + 0.08 - highFee, 20);
      const difference = Math.abs(lowFuture - highFuture);
      return { headline: money(difference, locale), detail: es ? 'diferencia aproximada solo por el ratio de gastos' : 'approximate difference from expense ratio alone', artifact: es ? `Descartaré fondos cuyo coste no esté justificado frente a una alternativa de ${numberValue(values, 'lowFee')}%.` : `I will reject funds whose cost is not justified against a ${numberValue(values, 'lowFee')}% alternative.` };
    }
    case 'dca_plan': {
      const monthly = numberValue(values, 'monthly');
      const payday = String(values.payday);
      const timing = payday === 'weekly' ? (es ? 'cada semana' : 'every week') : payday === '15' ? (es ? 'el día 16' : 'on day 16') : (es ? 'el día 2' : 'on day 2');
      return { headline: money(monthly * 12, locale), detail: es ? `al año, ejecutado ${timing}` : `per year, executed ${timing}`, artifact: es ? `Programaré ${money(monthly, locale)} ${timing} en una cartera diversificada de bajo coste.` : `I will schedule ${money(monthly, locale)} ${timing} into a low-cost diversified portfolio.` };
    }
    case 'risk_budget': {
      const portfolio = numberValue(values, 'portfolio');
      const riskPct = numberValue(values, 'riskPct');
      const stopPct = Math.max(0.1, numberValue(values, 'stopPct'));
      const maxLoss = portfolio * (riskPct / 100);
      const position = maxLoss / (stopPct / 100);
      return { headline: money(position, locale), detail: es ? `posición máxima para limitar la pérdida a ${money(maxLoss, locale)}` : `maximum position to cap loss at ${money(maxLoss, locale)}`, artifact: es ? `No arriesgaré más de ${riskPct}% de mi cartera por idea; con una salida a ${stopPct}%, mi posición máxima es ${money(position, locale)}.` : `I will risk no more than ${riskPct}% of my portfolio per idea; with a ${stopPct}% exit distance, my maximum position is ${money(position, locale)}.` };
    }
    case 'prompt_builder': {
      const artifact = es
        ? `Objetivo: ${text('goal')}\nContexto: ${text('context')}\nRestricciones: ${text('constraints')}\nFormato: ${text('format')}`
        : `Goal: ${text('goal')}\nContext: ${text('context')}\nConstraints: ${text('constraints')}\nFormat: ${text('format')}`;
      return { headline: es ? '4 bloques completos' : '4 blocks complete', detail: es ? 'listo para copiar y probar' : 'ready to copy and test', artifact };
    }
    case 'context_stack': {
      const artifact = es ? `Usuario y objetivo: ${text('user')}\nEvidencia: ${text('evidence')}\nCriterio: ${text('criteria')}` : `User and goal: ${text('user')}\nEvidence: ${text('evidence')}\nCriteria: ${text('criteria')}`;
      return { headline: es ? 'Contexto en 3 capas' : '3-layer context', detail: es ? 'sin documentos irrelevantes' : 'without irrelevant documents', artifact };
    }
    case 'model_router': {
      const risk = text('risk');
      const ambiguity = text('ambiguity');
      const route = risk === 'high' ? (es ? 'Modelo propone; humano aprueba' : 'Model proposes; human approves') : ambiguity === 'high' ? (es ? 'Modelo de razonamiento con contexto' : 'Reasoning model with context') : (es ? 'Modelo rápido con salida estructurada' : 'Fast model with structured output');
      return { headline: route, detail: text('task'), artifact: `${text('task')}: ${route}.` };
    }
    case 'workflow_map': {
      const artifact = `${text('trigger')} → ${text('transform')} → ${text('action')}`;
      return { headline: 'Trigger → Transform → Action', detail: es ? 'tres pasos observables' : 'three observable steps', artifact };
    }
    case 'agent_guardrails': {
      const artifact = es ? `Trabajo: ${text('job')}\nHerramientas: ${text('tools')}\nAprobación: ${text('approval')}\nParada: ${text('stop')}` : `Job: ${text('job')}\nTools: ${text('tools')}\nApproval: ${text('approval')}\nStop: ${text('stop')}`;
      return { headline: es ? 'Autonomía con límites' : 'Bounded autonomy', detail: es ? 'aprobación antes de acciones irreversibles' : 'approval before irreversible actions', artifact };
    }
    case 'hook_lab': {
      const artifact = es ? `${text('audience')}: ${text('pain')}. El cambio: ${text('mechanism')}.` : `${text('audience')}: ${text('pain')}. The shift: ${text('mechanism')}.`;
      return { headline: artifact, detail: es ? 'pruébalo en los primeros tres segundos' : 'test it in the first three seconds', artifact };
    }
    case 'pain_to_promise': {
      const artifact = es ? `Ayudo a ${text('person')} que ${text('moment')} a conseguir ${text('result')}.` : `I help ${text('person')} who ${text('moment')} achieve ${text('result')}.`;
      return { headline: artifact, detail: es ? 'persona, momento y resultado' : 'person, moment, and outcome', artifact };
    }
    case 'offer_value': {
      const score = Math.round((numberValue(values, 'outcome') * numberValue(values, 'certainty')) / Math.max(1, (numberValue(values, 'delay') * numberValue(values, 'effort')) / 10));
      const artifact = es ? `${text('offer')}: puntuación ${score}. Mejoraré primero la palanca más baja.` : `${text('offer')}: score ${score}. I will improve the weakest lever first.`;
      return { headline: `${score}`, detail: es ? 'índice relativo de valor' : 'relative value index', artifact };
    }
    case 'six_second_script': {
      const artifact = `0–2s: ${text('hook')}\n2–5s: ${text('proof')}\n5–6s: ${text('cta')}`;
      return { headline: es ? '6 segundos. 1 idea.' : '6 seconds. 1 idea.', detail: es ? 'hook, prueba y acción' : 'hook, proof, and action', artifact };
    }
    case 'distribution_plan': {
      const artifact = es ? `Tesis: ${text('thesis')}\nVideo: ${text('short')}\nEmail: ${text('email')}\nConversación: ${text('conversation')}` : `Thesis: ${text('thesis')}\nVideo: ${text('short')}\nEmail: ${text('email')}\nConversation: ${text('conversation')}`;
      return { headline: '1 → 4', detail: es ? 'una tesis, cuatro pruebas' : 'one thesis, four tests', artifact };
    }
    case 'strategy_map': {
      const artifact = es
        ? `Terreno: ${text('terrain')}\nVentaja táctica: ${text('advantage')}\nPlan de contingencia: ${text('retreat')}`
        : `Terrain: ${text('terrain')}\nTactical edge: ${text('advantage')}\nContingency plan: ${text('retreat')}`;
      return { headline: es ? 'Posición inexpugnable' : 'Unassailable position', detail: es ? 'cálculo previo completado' : 'prior calculation complete', artifact };
    }
    case 'control_filter': {
      const artifact = es
        ? `Bajo mi control: ${text('internal')}\nFuera de mi control: ${text('external')}\nRespuesta deliberada: ${text('response')}`
        : `Within my control: ${text('internal')}\nOutside my control: ${text('external')}\nDeliberate response: ${text('response')}`;
      return { headline: es ? 'Dicotomía aplicada' : 'Dichotomy applied', detail: es ? 'enfoque 100% en lo interno' : '100% focus on internal', artifact };
    }
    case 'focus_block': {
      const minutes = numberValue(values, 'minutes') || 90;
      const artifact = es
        ? `Bloque sagrado: ${minutes} min\nDistracción eliminada: ${text('distraction')}\nObjetivo único: ${text('goal')}`
        : `Sacred block: ${minutes} min\nEliminated distraction: ${text('distraction')}\nSingle goal: ${text('goal')}`;
      return { headline: `${minutes} min Deep Work`, detail: es ? 'cero notificaciones garantizadas' : 'zero notifications guaranteed', artifact };
    }
    case 'data_signal_filter': {
      const correlation = text('correlation');
      const confounder = text('confounder');
      const experiment = text('experiment');
      const artifact = es
        ? `Correlación: ${correlation}\nConfusor sospechoso: ${confounder}\nPrueba causal: ${experiment}`
        : `Correlation: ${correlation}\nSuspected confounder: ${confounder}\nCausal test: ${experiment}`;
      return {
        headline: es ? 'Hipótesis causal filtrada' : 'Causal hypothesis filtered',
        detail: es ? 'variable confusora aislada con prueba de control' : 'confounding variable isolated with control test',
        artifact,
      };
    }
    case 'north_star_builder': {
      const product = text('product');
      const valueMoment = text('valueMoment');
      const frequency = text('frequency');
      const freqLabel = frequency === 'daily' ? (es ? 'diaria' : 'daily') : frequency === 'weekly' ? (es ? 'semanal' : 'weekly') : (es ? 'mensual' : 'monthly');
      const artifact = es
        ? `Producto: ${product}\nMomento Aha: ${valueMoment}\nCadencia: ${freqLabel}\nMétrica North Star: Usuarios activos con ${valueMoment} (${freqLabel}).`
        : `Product: ${product}\nAha moment: ${valueMoment}\nCadence: ${freqLabel}\nNorth Star metric: Active users experiencing ${valueMoment} (${freqLabel}).`;
      return {
        headline: es ? `North Star (${freqLabel})` : `North Star (${freqLabel})`,
        detail: `${product} → ${valueMoment}`,
        artifact,
      };
    }
    case 'ab_test_calc': {
      const baseline = numberValue(values, 'baselineRate', 5);
      const mde = numberValue(values, 'mde', 20);
      const daily = numberValue(values, 'dailyTraffic', 500);
      const p = baseline / 100;
      const relMde = mde / 100;
      const perVariant = Math.round((16 * (1 - p)) / (p * relMde * relMde));
      const totalSample = perVariant * 2;
      const daysNeeded = Math.max(1, Math.ceil(totalSample / daily));
      const headline = es ? `${totalSample.toLocaleString()} visitantes (${daysNeeded} días)` : `${totalSample.toLocaleString()} visitors (${daysNeeded} days)`;
      const detail = es ? `${perVariant.toLocaleString()} por variante (A/B) al 80% poder y 95% confianza` : `${perVariant.toLocaleString()} per variant (A/B) at 80% power & 95% confidence`;
      const artifact = es
        ? `Línea base: ${baseline}%. MDE: ${mde}%. Muestra total requerida: ${totalSample.toLocaleString()} usuarios. Duración mínima sin espiar: ${daysNeeded} días.`
        : `Baseline: ${baseline}%. MDE: ${mde}%. Required total sample: ${totalSample.toLocaleString()} users. Minimum duration without peeking: ${daysNeeded} days.`;
      return { headline, detail, artifact };
    }
    case 'overfitting_check': {
      const trainAcc = numberValue(values, 'trainAccuracy', 98);
      const testAcc = numberValue(values, 'testAccuracy', 62);
      const features = numberValue(values, 'featureCount', 48);
      const gap = trainAcc - testAcc;
      const status = gap > 20
        ? (es ? 'Overfitting severo (Varianza extrema)' : 'Severe overfitting (High variance)')
        : gap > 10
        ? (es ? 'Overfitting moderado' : 'Moderate overfitting')
        : (es ? 'Modelo equilibrado' : 'Well-balanced model');
      const recommendation = gap > 15
        ? (es ? `Reducir variables (actuales: ${features}) y aplicar regularización L2/Dropout.` : `Prune features (current: ${features}) and apply L2/Dropout regularization.`)
        : (es ? 'Brecha aceptable entre train y test. Listo para validación cruzada.' : 'Acceptable train/test gap. Ready for cross-validation.');
      const artifact = es
        ? `Train: ${trainAcc}% | Test: ${testAcc}% (Brecha: ${gap}%).\nDiagnóstico: ${status}.\nAcción: ${recommendation}`
        : `Train: ${trainAcc}% | Test: ${testAcc}% (Gap: ${gap}%).\nDiagnosis: ${status}.\nAction: ${recommendation}`;
      return {
        headline: `${status} (Δ ${gap}%)`,
        detail: recommendation,
        artifact,
      };
    }
    case 'decision_analytics': {
      const metric = text('metricName');
      const threshold = numberValue(values, 'threshold', 45);
      const above = text('actionAbove');
      const below = text('actionBelow');
      const artifact = es
        ? `Contrato de decisión: ${metric}\nSi > ${threshold}: ${above}\nSi ≤ ${threshold}: ${below}`
        : `Decision contract: ${metric}\nIf > ${threshold}: ${above}\nIf ≤ ${threshold}: ${below}`;
      return {
        headline: es ? `Regla: ${metric} (Umbral ${threshold})` : `Rule: ${metric} (Threshold ${threshold})`,
        detail: es ? `> ${threshold} → ${above} | ≤ ${threshold} → ${below}` : `> ${threshold} → ${above} | ≤ ${threshold} → ${below}`,
        artifact,
      };
    }
  }
}

const initialValueForField = (field: ToolField, locale: LearningLocale): string | number => {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.kind === 'text' && field.placeholder) {
    return localizeLearning(field.placeholder, locale);
  }
  return '';
};

export const MicroToolLab: React.FC<MicroToolLabProps> = ({ lessonId, trackId, widget, locale, onCommit }) => {
  const [values, setValues] = useState<Record<string, string | number>>(() =>
    Object.fromEntries(widget.fields.map((field) => [field.id, initialValueForField(field, locale)]))
  );
  const [committed, setCommitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => calculateResult(widget, values, locale), [locale, values, widget]);
  const isValid = widget.fields.every((field) => field.kind !== 'text' || String(values[field.id] || '').trim().length >= (field.minLength || 1));

  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;
  const lastCommittedSummaryRef = useRef<string>('');

  // Auto-commit valid artifact to parent so player is never deadlocked
  useEffect(() => {
    if (isValid && result.artifact && result.artifact !== lastCommittedSummaryRef.current) {
      lastCommittedSummaryRef.current = result.artifact;
      const artifact: SavedLearningArtifact = {
        lessonId,
        trackId,
        title: localizeLearning(widget.artifactTitle, locale),
        summary: result.artifact,
        values,
        createdAt: Date.now(),
      };
      onCommitRef.current(artifact);
    }
  }, [isValid, lessonId, trackId, widget.artifactTitle, result.artifact, values, locale]);

  const updateValue = (id: string, value: string | number) => {
    setCommitted(false);
    setValues((current) => ({ ...current, [id]: value }));
  };

  const loadRecommendedTemplate = () => {
    const updated = { ...values };
    widget.fields.forEach((field) => {
      if (field.kind === 'text' && field.placeholder) {
        updated[field.id] = localizeLearning(field.placeholder, locale);
      }
    });
    setValues(updated);
    setCommitted(true);
    navigator.vibrate?.(12);
  };

  const commit = () => {
    if (!isValid) return;
    const artifact: SavedLearningArtifact = {
      lessonId,
      trackId,
      title: localizeLearning(widget.artifactTitle, locale),
      summary: result.artifact,
      values,
      createdAt: Date.now(),
    };
    setCommitted(true);
    navigator.vibrate?.([18, 30, 18]);
    onCommit(artifact);
  };

  const copyArtifact = async () => {
    try {
      await navigator.clipboard.writeText(result.artifact);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const hasTextFields = widget.fields.some((f) => f.kind === 'text');

  return (
    <div className="space-y-4">
      <div className="border-l-2 border-[#FF7300] pl-4">
        <h3 className="text-xl font-bold tracking-tight text-white">{localizeLearning(widget.title, locale)}</h3>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">{localizeLearning(widget.instruction, locale)}</p>
      </div>

      {hasTextFields && (
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] text-zinc-400">
            {locale === 'es' ? 'Plantilla precargada:' : 'Pre-loaded template:'}
          </span>
          <button
            type="button"
            onClick={loadRecommendedTemplate}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#FF7300]/30 bg-[#FF7300]/10 px-2.5 py-1 text-xs font-semibold text-[#FF9B4A] hover:bg-[#FF7300]/20 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkle size={13} weight="fill" />
            {locale === 'es' ? 'Restaurar plantilla recomendada' : 'Restore recommended template'}
          </button>
        </div>
      )}

      <div className="space-y-4 border-y border-white/8 py-4">
        {widget.fields.map((field) => (
          <label key={field.id} className="block space-y-2">
            <span className="flex items-center justify-between gap-3 text-xs font-semibold text-zinc-300">
              <span>{localizeLearning(field.label, locale)}</span>
              {field.kind === 'range' && (
                <span className="font-mono tabular-nums text-[#FF8A2A]">
                  {values[field.id]} {field.unit ? localizeLearning(field.unit, locale) : ''}
                </span>
              )}
            </span>
            {field.kind === 'range' && (
              <input className="learn-range w-full" type="range" min={field.min} max={field.max} step={field.step} value={Number(values[field.id])} onChange={(event) => updateValue(field.id, Number(event.target.value))} />
            )}
            {field.kind === 'text' && (
              <textarea
                rows={2}
                value={String(values[field.id] || '')}
                onChange={(event) => updateValue(field.id, event.target.value)}
                placeholder={localizeLearning(field.placeholder, locale)}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#FF7300]/60 focus:bg-white/[0.055]"
              />
            )}
            {field.kind === 'select' && (
              <select value={String(values[field.id])} onChange={(event) => updateValue(field.id, event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#17171C] px-3.5 py-3 text-sm text-white outline-none focus:border-[#FF7300]/60">
                {field.options.map((option) => <option key={option.value} value={option.value}>{localizeLearning(option.label, locale)}</option>)}
              </select>
            )}
          </label>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-[#FF7300]/25 bg-[#FF7300]/[0.07] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#FF9B4A]">{localizeLearning(widget.resultLabel, locale)}</span>
        <p className="mt-1 text-xl font-bold leading-snug text-white">{result.headline}</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400">{result.detail}</p>
        <button type="button" onClick={copyArtifact} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 transition hover:text-white active:scale-[0.98]">
          {copied ? <CheckCircle size={16} weight="fill" /> : <Copy size={16} weight="bold" />}
          {copied ? (locale === 'es' ? 'Copiado' : 'Copied') : (locale === 'es' ? 'Copiar resultado' : 'Copy result')}
        </button>
      </div>

      <button type="button" disabled={!isValid || committed} onClick={commit} className="t1ger-primary-button w-full disabled:cursor-not-allowed disabled:opacity-35">
        {committed ? <CheckCircle size={20} weight="fill" /> : <FloppyDisk size={20} weight="bold" />}
        {committed ? (locale === 'es' ? '✓ Artefacto guardado' : '✓ Artifact saved') : localizeLearning(widget.commitLabel, locale)}
      </button>
      {!isValid && <p className="text-center text-xs text-amber-300">{locale === 'es' ? 'Completa todos los campos para generar un artefacto real.' : 'Complete every field to generate a real artifact.'}</p>}
    </div>
  );
};
