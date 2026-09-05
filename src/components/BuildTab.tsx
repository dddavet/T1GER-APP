import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle, Flag, Target } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { useFieldMissions } from '../hooks/useFieldMissions';
import { FieldMissionService, isFieldMissionComplete, type FieldMission } from '../services/fieldMissionService';
import { getApplyDesign } from '../services/applyMissionDesign';
import { ApplyMissionModal } from './apply/ApplyMissionModal';
const Trading = React.lazy(() => import('./apply/PaperTradingSandbox').then(m => ({ default: m.PaperTradingSandbox })));

export const BuildTab = (_props: { onStartMission?: (mission: unknown) => void }) => {
  const { language, completeMission } = useBrain();
  const { addXP, setActiveView } = useT1ger();
  const { appUser } = useAuth();
  const userId = appUser?.uid || 'local';
  const locale = language === 'es' ? 'es' : 'en';
  const tr = (es: string, en: string) => locale === 'es' ? es : en;
  const missions = useFieldMissions(userId);
  const [view, setView] = useState<'active' | 'history' | 'tools'>('active');
  const [selected, setSelected] = useState<FieldMission | null>(null);
  const completed = useMemo(() => missions.filter(isFieldMissionComplete), [missions]);
  const active = useMemo(() => missions.filter(m => !isFieldMissionComplete(m) && m.lessonId.startsWith('learn-money-')), [missions]);
  useEffect(() => {
    const auto = active.find(m => m.autoOpen);
    if (!auto || selected) return;
    setSelected(auto); FieldMissionService.clearAutoOpen(userId, auto.id);
  }, [active, selected, userId]);

  const finish = async (mission: FieldMission) => {
    // The cloud transaction already awarded signed-in users; local preview uses an idempotent personal ledger.
    await addXP(mission.lessonXp + mission.executionXp, 2, `mission:${mission.id}`);
    completeMission(mission.lessonId, mission.learningScore ?? 100);
    completeMission(mission.id, 100);
  };
  return <div className="mx-auto max-w-lg space-y-5 pb-28 pt-3 text-white">
    <header><p className="font-mono text-[10px] uppercase tracking-[.2em] text-orange-300">{tr('APLICAR / UN PASO REAL', 'APPLY / ONE REAL STEP')}</p><h1 className="mt-3 text-3xl font-bold tracking-tight">{tr('Hazlo parte de tu vida.', 'Make it part of your life.')}</h1><p className="mt-3 text-sm leading-relaxed text-zinc-400">{tr('Acciones pequeñas que convierten ideas en hábitos. Haz la tuya y marca «Completada».', 'Small actions turn ideas into habits. Do yours and mark it complete.')}</p></header>
    <nav aria-label={tr('Secciones de Aplicar', 'Apply sections')} className="flex gap-1 rounded-2xl border border-white/10 bg-[#121216] p-1">{(['active', 'history', 'tools'] as const).map(id => <button key={id} aria-current={view === id ? 'page' : undefined} onClick={() => setView(id)} className={`min-h-12 flex-1 rounded-xl px-2 text-sm ${view === id ? 'bg-white/10 text-white' : 'text-zinc-400'}`}>{id === 'active' ? tr('Mis acciones', 'My actions') : id === 'history' ? tr('Victorias', 'Wins') : tr('Simulador', 'Simulator')}</button>)}</nav>
    {view === 'active' && <section className="space-y-4">
      {!active.length && <div className="rounded-2xl border border-dashed border-white/20 p-7 text-center"><Flag className="mx-auto text-orange-300" size={32} /><h2 className="mt-4 text-xl font-bold">{completed.length ? tr('Listo para tu siguiente paso.', 'Ready for your next step.') : tr('Tu primera acción empieza aprendiendo.', 'Your first action starts with learning.')}</h2><p className="mt-2 text-sm text-zinc-400">{tr('Cada lección desbloquea una misión concreta que puedes hacer hoy.', 'Every lesson unlocks a specific mission you can do today.')}</p><button onClick={() => setActiveView('learn')} className="t1ger-primary-button mt-5 w-full">{tr('Ir a mi camino', 'Go to my journey')}<ArrowRight size={20} /></button></div>}
      {active.map(mission => { const design = getApplyDesign(mission.lessonId, locale); return <article key={mission.id} className="rounded-2xl border border-orange-400/25 bg-[#121216] p-5"><div className="flex items-center justify-between text-xs text-orange-300"><span className="flex items-center gap-2"><Target size={18} />{tr('Lista para ti', 'Ready for you')}</span><span className="font-mono">{design?.minutes || 5} MIN</span></div><h2 className="mt-3 text-2xl font-bold">{design?.title || mission.title}</h2><p className="mt-3 text-sm leading-relaxed text-zinc-400">{design?.why || mission.description}</p><p className="mt-4 font-mono text-xs text-orange-300">+{mission.lessonXp + mission.executionXp} XP {tr('personales', 'personal')}</p><button onClick={() => setSelected(mission)} className="t1ger-primary-button mt-5 w-full">{tr('Ver mi acción', 'Open my action')}<ArrowRight size={20} /></button></article>; })}
    </section>}
    {view === 'history' && <section className="space-y-3"><h2 className="text-2xl font-bold">{completed.length} {tr('acciones completadas', 'completed actions')}</h2><p className="text-sm text-zinc-400">{tr('Tu progreso personal, paso a paso. Solo las acciones verificadas suman a la liga.', 'Your personal progress, step by step. Only verified actions score in leagues.')}</p>{!completed.length && <p className="rounded-2xl border border-dashed border-white/15 p-7 text-center text-zinc-400">{tr('Tu primera victoria aparecerá aquí.', 'Your first win will appear here.')}</p>}{completed.map(mission => <article key={mission.id} className="rounded-2xl border border-white/10 bg-[#121216] p-4"><div className="flex items-center gap-2 text-xs text-emerald-300"><CheckCircle size={18} weight="fill" />{mission.completionMode === 'self_reported' || !mission.submission?.proofUrl ? tr('Completada · autodeclarada', 'Completed · self-reported') : tr('Artefacto revisado', 'Reviewed artifact')}</div><h3 className="mt-2 font-semibold">{getApplyDesign(mission.lessonId, locale)?.title || mission.title}</h3><p className="mt-2 font-mono text-xs text-zinc-400">{new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(mission.submission?.createdAt || mission.updatedAt)} · +{mission.lessonXp + mission.executionXp} XP</p>{mission.submission?.proofText && <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-300">{mission.submission.proofText}</p>}{mission.submission?.proofUrl?.startsWith('https://') && <a href={mission.submission.proofUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block py-2 text-sm text-orange-300 underline">{tr('Ver prueba guardada', 'View saved proof')}</a>}</article>)}</section>}
    {view === 'tools' && <React.Suspense fallback={<p role="status">{tr('Cargando simulador…', 'Loading simulator…')}</p>}><Trading /></React.Suspense>}
    {selected && <ApplyMissionModal mission={selected} locale={locale} onClose={() => setSelected(null)} onComplete={() => finish(selected)} onReturn={() => { setSelected(null); setActiveView('learn'); }} />}
  </div>;
};
