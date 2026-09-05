import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, CheckCircle, X } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { getApplyDesign } from '../../services/applyMissionDesign';
import { FieldMissionService, type FieldMission } from '../../services/fieldMissionService';
import type { LearningLocale } from '../../services/interactiveCurriculumTypes';

export function ApplyMissionModal({ mission, locale, onClose, onComplete, onReturn }: {
  mission: FieldMission; locale: LearningLocale; onClose: () => void;
  onComplete: () => Promise<void>; onReturn: () => void;
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
  useEffect(() => { dialog.current?.showModal(); }, []);
  const complete = async () => {
    if (inFlight.current) return;
    inFlight.current = true; setSaving(true); setError('');
    try {
      const xp = await FieldMissionService.completeSelfReported(mission, reflection);
      await onComplete();
      setReward(xp);
      navigator.vibrate?.([20, 30, 40]);
    } catch {
      setError(tr('No pudimos guardar la acción. Conservamos tu reflexión; comprueba la conexión e inténtalo de nuevo. No se duplicará el premio.', 'We could not save the action. Your reflection is preserved; check your connection and retry. Rewards will not be duplicated.'));
    } finally { setSaving(false); inFlight.current = false; }
  };
  return createPortal(<dialog ref={dialog} aria-labelledby="apply-title" onCancel={event => { event.preventDefault(); if (!saving) onClose(); }} className="fixed inset-0 m-auto max-h-[94dvh] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto rounded-3xl border border-white/15 bg-[#121216] p-5 text-white backdrop:bg-black/80">
    <header className="flex items-start justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-widest text-orange-300">{tr('Del aprendizaje a tu vida', 'From learning to living')}</p><h2 id="apply-title" className="mt-2 text-2xl font-bold">{design?.title || mission.title}</h2></div><button disabled={saving} onClick={onClose} aria-label={tr('Cerrar acción', 'Close action')} className="t1ger-icon-button shrink-0"><X size={20} /></button></header>
    {reward !== null ? <motion.section initial={reducedMotion ? false : { scale: .92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} role="status" className="py-9 text-center">
      <CheckCircle size={72} weight="fill" className="mx-auto text-emerald-400" /><h3 className="mt-4 text-3xl font-bold">{tr('Lo llevaste a la práctica.', 'You put it into practice.')}</h3>
      <p className="mt-3 font-mono text-2xl text-orange-300">+{reward} XP</p><p className="mt-3 text-sm text-zinc-300">{tr('Acción guardada. Tu racha y T1GER avanzan contigo.', 'Action saved. Your streak and T1GER grow with you.')}</p>
      <p className="mt-2 text-xs text-zinc-400">{tr('Progreso personal autodeclarado. No suma puntos a la liga.', 'Self-reported personal progress. No league points awarded.')}</p><button className="t1ger-primary-button mt-7 w-full" onClick={onReturn}>{tr('Volver a mi camino', 'Back to my journey')}<ArrowRight size={20} /></button>
    </motion.section> : <section className="mt-5 space-y-5">
      <p className="text-sm leading-relaxed text-zinc-300">{design?.why || mission.description}</p>
      <p className="font-mono text-xs text-orange-300">{design?.minutes || 5} MIN · +{mission.lessonXp + mission.executionXp} XP {tr('PERSONALES', 'PERSONAL')}</p>
      <ol className="space-y-4">{(design?.steps || mission.instructions).map((step, i) => <li key={i} className="flex gap-3 text-sm leading-relaxed"><span className="font-mono text-orange-300">0{i + 1}</span><span>{step}</span></li>)}</ol>
      {mission.supportPayload && <details className="rounded-xl border border-white/10 p-3"><summary className="cursor-pointer py-1 text-sm font-semibold">{tr('Mi herramienta de la lección', 'My lesson tool')}</summary><p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-zinc-400">{mission.supportPayload}</p></details>}
      <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm"><strong>{tr('Está completa cuando…', 'Done means…')}</strong><p className="mt-2 text-zinc-300">{design?.done || tr('He realizado la acción descrita.', 'I carried out the action described.')}</p></div>
      <label className="block text-sm" htmlFor="apply-reflection">{tr('Algo que quieras recordar (opcional)', 'Something to remember (optional)')}<textarea id="apply-reflection" maxLength={500} value={reflection} onChange={e => setReflection(e.target.value)} disabled={saving} rows={3} className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 p-3 text-sm" /><span className="text-xs text-zinc-400">{tr('Puedes dejarlo vacío. No necesitas subir ninguna prueba.', 'You can leave this blank. No proof upload is needed.')}</span></label>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button disabled={saving} onClick={() => void complete()} className="t1ger-primary-button w-full disabled:opacity-50">{saving ? tr('Guardando…', 'Saving…') : tr('He completado la acción', 'I completed the action')}<CheckCircle size={22} /></button>
    </section>}
  </dialog>, document.body);
}
