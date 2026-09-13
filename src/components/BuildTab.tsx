import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle, Flag, Target } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { useFieldMissions } from '../hooks/useFieldMissions';
import { FieldMissionService, isFieldMissionComplete, type FieldMission } from '../services/fieldMissionService';
import { getApplyDesign } from '../services/applyMissionDesign';
const Trading = React.lazy(() => import('./apply/PaperTradingSandbox').then(m => ({ default: m.PaperTradingSandbox })));
import { ApplyMissionModal } from './apply/ApplyMissionModal';

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
  // Include all pending field missions across all tracks
  const active = useMemo(() => missions.filter(m => !isFieldMissionComplete(m)), [missions]);

  useEffect(() => {
    const auto = active.find(m => m.autoOpen);
    if (!auto || selected) return;
    setSelected(auto);
    FieldMissionService.clearAutoOpen(userId, auto.id);
  }, [active, selected, userId]);

  const finish = async (mission: FieldMission) => {
    // The cloud transaction already awarded signed-in users; local preview uses an idempotent personal ledger.
    await addXP(mission.lessonXp + mission.executionXp, 2, `mission:${mission.id}`);
    completeMission(mission.lessonId, mission.learningScore ?? 100);
    completeMission(mission.id, 100);
  };

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-28 pt-3 text-white px-2">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[.2em] text-orange-400 font-semibold">
          {tr('APLICAR / UN PASO REAL', 'APPLY / ONE REAL STEP')}
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
          {tr('Hazlo parte de tu vida.', 'Make it part of your life.')}
        </h1>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-400">
          {tr('Acciones pequeñas que convierten ideas en hábitos. Haz la tuya y marca «Completada».', 'Small actions turn ideas into habits. Do yours and mark it complete.')}
        </p>
      </header>

      {/* Navigation Tabs */}
      <nav aria-label={tr('Secciones de Aplicar', 'Apply sections')} className="flex gap-1 rounded-xl border border-white/10 bg-[#121216] p-1">
        {(['active', 'history', 'tools'] as const).map(id => (
          <button
            key={id}
            aria-current={view === id ? 'page' : undefined}
            onClick={() => setView(id)}
            className={`min-h-11 flex-1 rounded-lg px-2 text-xs sm:text-sm font-semibold transition-all ${
              view === id ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {id === 'active' ? tr('Mis acciones', 'My actions') : id === 'history' ? tr('Victorias', 'Wins') : tr('Simulador', 'Simulator')}
          </button>
        ))}
      </nav>

      {/* Active Tab */}
      {view === 'active' && (
        <section className="space-y-4">
          {!active.length && (
            <div className="rounded-2xl border border-dashed border-white/15 bg-[#121216]/60 p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Flag className="text-orange-400" size={24} weight="duotone" />
              </div>
              <h2 className="mt-3 text-lg font-bold text-white">
                {completed.length ? tr('Listo para tu siguiente paso.', 'Ready for your next step.') : tr('Tu primera acción empieza aprendiendo.', 'Your first action starts with learning.')}
              </h2>
              <p className="mt-1.5 text-xs text-zinc-400 max-w-sm mx-auto">
                {tr('Cada lección desbloquea una misión concreta que puedes hacer hoy.', 'Every lesson unlocks a specific mission you can do today.')}
              </p>
              <button onClick={() => setActiveView('learn')} className="t1ger-primary-button mt-4 w-full">
                {tr('Ir a mi camino', 'Go to my journey')}
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {active.map(mission => {
            const design = getApplyDesign(mission.lessonId, locale);
            return (
              <article key={mission.id} className="rounded-2xl border border-orange-500/30 bg-[#121216] p-5 shadow-sm">
                <div className="flex items-center justify-between text-xs text-orange-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Target size={16} weight="bold" />
                    {tr('Lista para ti', 'Ready for you')}
                  </span>
                  <span className="font-mono bg-orange-500/10 px-2 py-0.5 rounded text-[11px] font-semibold border border-orange-500/20">
                    {design?.minutes || 5} MIN
                  </span>
                </div>
                <h2 className="mt-3 text-lg sm:text-xl font-bold text-white leading-snug">
                  {design?.title || mission.title}
                </h2>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-400">
                  {design?.why || mission.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-orange-400">
                    +{mission.lessonXp + mission.executionXp} XP {tr('personales', 'personal')}
                  </span>
                </div>
                <button onClick={() => setSelected(mission)} className="t1ger-primary-button mt-4 w-full">
                  {tr('Ver mi acción', 'Open my action')}
                  <ArrowRight size={18} />
                </button>
              </article>
            );
          })}
        </section>
      )}

      {/* History / Wins Tab */}
      {view === 'history' && (
        <section className="space-y-3">
          <div className="p-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {completed.length} {tr('acciones completadas', 'completed actions')}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              {tr('Tu progreso personal, paso a paso. Solo las acciones verificadas suman a la liga.', 'Your personal progress, step by step. Only verified actions score in leagues.')}
            </p>
          </div>

          {!completed.length && (
            <p className="rounded-2xl border border-dashed border-white/15 p-7 text-center text-xs text-zinc-400">
              {tr('Tu primera victoria aparecerá aquí.', 'Your first win will appear here.')}
            </p>
          )}

          {completed.map(mission => (
            <article key={mission.id} className="rounded-2xl border border-white/10 bg-[#121216] p-4">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <CheckCircle size={16} weight="fill" />
                {mission.completionMode === 'self_reported' || !mission.submission?.proofUrl
                  ? tr('Completada · autodeclarada', 'Completed · self-reported')
                  : tr('Artefacto revisado', 'Reviewed artifact')}
              </div>
              <h3 className="mt-2 text-sm sm:text-base font-semibold text-zinc-100">
                {getApplyDesign(mission.lessonId, locale)?.title || mission.title}
              </h3>
              <p className="mt-1.5 font-mono text-[11px] text-zinc-400">
                {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(mission.submission?.createdAt || mission.updatedAt)} · +{mission.lessonXp + mission.executionXp} XP
              </p>
              {mission.submission?.proofText && (
                <p className="mt-2.5 whitespace-pre-wrap text-xs sm:text-sm text-zinc-300 bg-black/30 p-3 rounded-lg border border-white/5">
                  {mission.submission.proofText}
                </p>
              )}
              {mission.submission?.proofUrl?.startsWith('https://') && (
                <a href={mission.submission.proofUrl} target="_blank" rel="noreferrer" className="mt-2.5 inline-block py-1 text-xs text-orange-400 underline">
                  {tr('Ver prueba guardada', 'View saved proof')}
                </a>
              )}
            </article>
          ))}
        </section>
      )}

      {/* Tools / Simulator Tab */}
      {view === 'tools' && (
        <React.Suspense fallback={<p role="status" className="text-sm text-zinc-400 text-center py-8">{tr('Cargando simulador…', 'Loading simulator…')}</p>}>
          <Trading />
        </React.Suspense>
      )}

      {selected && (
        <ApplyMissionModal
          mission={selected}
          locale={locale}
          onClose={() => setSelected(null)}
          onComplete={() => finish(selected)}
          onReturn={() => {
            setSelected(null);
            setActiveView('learn');
          }}
        />
      )}
    </div>
  );
};
