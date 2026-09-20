import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, CheckCircle, X } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { getApplyDesign } from '../../services/applyMissionDesign';
import { FieldMissionService, type FieldMission } from '../../services/fieldMissionService';
import { SoundEffects } from '../../services/soundEffects';
import { fireRewardConfetti } from '../ui/confetti';
import type { LearningLocale } from '../../services/interactiveCurriculumTypes';

export function ApplyMissionModal({ mission, locale, onClose, onComplete, onReturn, embedded = false, onApplied }: {
  mission: FieldMission; locale: LearningLocale; onClose: () => void;
  onComplete: () => Promise<void>; onReturn: () => void;
  embedded?: boolean; onApplied?: (xp: number) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const inFlight = useRef(false);
  const reducedMotion = useReducedMotion();
  const [reflection, setReflection] = useState(mission.submission?.proofText || '');
  const [saving, setSaving] = useState(false);
  const [reward, setReward] = useState<number | null>(null);
  const [error, setError] = useState('');
  const tr = (es: string, en: string) => locale === 'es' ? es : en;
  const design = getApplyDesign(mission.lessonId, locale);
  useEffect(() => {
    if (embedded) return;
    const el = dialog.current;
    if (el && !el.open) el.showModal();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (el?.open) el.close();
    };
  }, [embedded, onClose, saving]);
  const complete = async () => {
    if (inFlight.current) return;
    inFlight.current = true; setSaving(true); setError('');
    try {
      const xp = await FieldMissionService.completeSelfReported(mission, reflection);
      await onComplete();
      if (embedded) {
        onApplied?.(xp);
        return;
      }
      setReward(xp);
      navigator.vibrate?.([20, 30, 40]);
      fireRewardConfetti();
      SoundEffects.playCompletionFanfare();
    } catch {
      setError(tr('No pudimos guardar la acción. Conservamos tu reflexión; comprueba la conexión e inténtalo de nuevo. No se duplicará el premio.', 'We could not save the action. Your reflection is preserved; check your connection and retry. Rewards will not be duplicated.'));
    } finally { setSaving(false); inFlight.current = false; }
  };
  const [showCustomNote, setShowCustomNote] = useState(Boolean(mission.submission?.proofText));
  const intentionChips = [
    { id: 'todo', label: tr('Añadido a mi lista financiera', 'Added to my financial list') },
    { id: 'weekend', label: tr('Revisaré este fin de semana', 'Reviewing this weekend') },
    { id: 'auto', label: tr('Ya tengo un aporte automático', 'Already have automatic transfer') },
  ];
  const content = <>
    <header className="flex items-start justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-widest text-orange-300">{tr('Del aprendizaje a tu vida', 'From learning to living')}</p><h2 id="apply-title" className="mt-2 text-2xl font-bold">{design?.title || mission.title}</h2></div>{!embedded && <button disabled={saving} onPointerDown={() => SoundEffects.playTap()} onClick={onClose} aria-label={tr('Cerrar acción', 'Close action')} className="t1ger-icon-button shrink-0"><X size={20} /></button>}</header>
    {reward !== null ? <motion.section initial={reducedMotion ? false : { scale: .92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} role="status" className="py-9 text-center">
      <CheckCircle size={72} weight="fill" className="mx-auto text-emerald-400" /><h3 className="mt-4 text-3xl font-bold">{tr('Lo llevaste a la práctica.', 'You put it into practice.')}</h3>
      <p className="mt-3 font-mono text-2xl text-orange-300">+{reward} XP</p><p className="mt-3 text-sm text-zinc-300">{tr('Acción guardada. Tu racha y T1GER avanzan contigo.', 'Action saved. Your streak and T1GER grow with you.')}</p>
      <p className="mt-2 text-xs text-zinc-400">{tr('Progreso personal autodeclarado. No suma puntos a la liga.', 'Self-reported personal progress. No league points awarded.')}</p><button className="t1ger-primary-button mt-7 w-full" onPointerDown={() => SoundEffects.playTap()} onClick={onReturn}>{tr('Volver a mi camino', 'Back to my journey')}<ArrowRight size={20} /></button>
    </motion.section> : <section className="mt-5 space-y-5">
      <p className="text-sm leading-relaxed text-zinc-300">{design?.why || mission.description}</p>
      <p className="font-mono text-xs text-orange-300">{design?.minutes || 5} MIN · +{mission.lessonXp + mission.executionXp} XP {tr('PERSONALES', 'PERSONAL')}</p>
      <ol className="space-y-4">{(design?.steps || mission.instructions).map((step, i) => <li key={i} className="flex gap-3 text-sm leading-relaxed"><span className="font-mono text-orange-300">0{i + 1}</span><span>{step}</span></li>)}</ol>
      {mission.supportPayload && <details className="rounded-xl border border-white/10 p-3"><summary className="cursor-pointer py-1 text-sm font-semibold">{tr('Mi herramienta de la lección', 'My lesson tool')}</summary><p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-zinc-400">{mission.supportPayload}</p></details>}
      <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm"><strong>{tr('Está completa cuando…', 'Done means…')}</strong><p className="mt-2 text-zinc-300">{design?.done || tr('He realizado la acción descrita.', 'I carried out the action described.')}</p></div>

      {/* Intention / trigger quick chips */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-zinc-300">
          {tr('Compromiso o disparador (opcional, 1 toque):', 'Commitment or trigger (optional, 1 tap):')}
        </span>
        <div className="flex flex-wrap gap-2">
          {intentionChips.map(chip => {
            const active = reflection === chip.label;
            return (
              <button
                key={chip.id}
                type="button"
                disabled={saving}
                onClick={() => {
                  setReflection(active ? '' : chip.label);
                  navigator.vibrate?.(12);
                }}
                className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                  active
                    ? 'border-[#FF7300] bg-[#FF7300]/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20'
                }`}
              >
                {active ? '✓ ' : ''}{chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapsed reflection textarea to prevent mobile keyboard auto-open */}
      {!showCustomNote ? (
        <div>
          <button
            type="button"
            disabled={saving}
            onClick={() => setShowCustomNote(true)}
            className="text-xs text-zinc-400 hover:text-zinc-200 underline decoration-dotted transition cursor-pointer"
          >
            {tr('+ Añadir una nota personal (opcional)', '+ Add personal note (optional)')}
          </button>
        </div>
      ) : (
        <label className="block text-sm space-y-1.5" htmlFor="apply-reflection">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-300">{tr('Nota personal (opcional)', 'Personal note (optional)')}</span>
            <button
              type="button"
              onClick={() => setShowCustomNote(false)}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              {tr('Ocultar', 'Hide')}
            </button>
          </div>
          <textarea
            id="apply-reflection"
            maxLength={500}
            value={reflection}
            onChange={e => setReflection(e.target.value)}
            disabled={saving}
            rows={2}
            placeholder={tr('Escribe un recordatorio o detalle...', 'Write a reminder or detail...')}
            className="w-full rounded-xl border border-white/15 bg-black/20 p-3 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-[#FF7300]/60"
          />
        </label>
      )}

      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button disabled={saving} onPointerDown={() => SoundEffects.playTap()} onClick={() => void complete()} className="t1ger-primary-button w-full disabled:opacity-50">{saving ? tr('Guardando…', 'Saving…') : tr('He completado la acción', 'I completed the action')}<CheckCircle size={22} /></button>
    </section>}
  </>;
  if (embedded) return <section aria-labelledby="apply-title" className="text-white">{content}</section>;
  return createPortal(<dialog ref={dialog} aria-labelledby="apply-title" onCancel={event => { event.preventDefault(); if (!saving) onClose(); }} onClick={event => { if (event.target === dialog.current && !saving) onClose(); }} className="fixed inset-0 m-auto max-h-[94dvh] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto rounded-3xl border border-white/15 bg-[#121216] p-5 text-white backdrop:bg-black/80 cursor-default">{content}</dialog>, document.body);
}
