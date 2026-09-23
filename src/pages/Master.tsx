import React, { useMemo, useState } from 'react';
import { ArrowRight, Brain, CheckCircle, ClockCounterClockwise, Lightning, WarningCircle } from '@phosphor-icons/react';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { buildMasterySnapshot, type MasteryItem } from '../services/masteryService';
import { MasterReviewSession } from '../components/master/MasterReviewSession';

export const Master: React.FC = () => {
  const { brainState, language } = useBrain();
  const { setActiveView } = useT1ger();
  const [reviewQueue, setReviewQueue] = useState<MasteryItem[] | null>(null);
  const locale = language === 'es' ? 'es' : 'en';
  const snapshot = useMemo(() => buildMasterySnapshot(brainState), [brainState]);
  const tr = (es: string, en: string) => locale === 'es' ? es : en;

  if (reviewQueue) {
    return <MasterReviewSession items={reviewQueue} locale={locale} onClose={() => setReviewQueue(null)} />;
  }

  return (
    <div className="mx-auto w-full max-w-md pb-5 pt-4 text-white">
      <header className="px-1">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF8A2A]">Master · {tr('repetición espaciada', 'spaced repetition')}</p>
        <h1 className="mt-2 text-[2rem] font-extrabold leading-none tracking-[-0.05em]">{tr('Haz que se quede.', 'Make it stick.')}</h1>
        <p className="mt-3 max-w-sm text-sm leading-5 text-zinc-400">{tr('Recupera ideas sin pistas. T1GER programa el siguiente repaso según tu memoria real.', 'Recall ideas without hints. T1GER schedules the next review from your actual memory.')}</p>
      </header>

      <section className="mt-7 overflow-hidden rounded-[1.75rem] bg-[#121216] px-5 pb-5 pt-6 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.07)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">{tr('Ahora', 'Due now')}</p>
            <p className="mt-1 font-mono text-6xl font-semibold leading-none tabular-nums tracking-[-0.08em]">{snapshot.due.length}</p>
          </div>
          <span className={`grid h-12 w-12 place-items-center rounded-2xl ${snapshot.isCaughtUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/12 text-[#FF8A2A]'}`}>
            {snapshot.isCaughtUp ? <CheckCircle size={25} weight="fill" /> : <ClockCounterClockwise size={25} weight="bold" />}
          </span>
        </div>
        <h2 className="mt-6 text-xl font-bold tracking-tight">{snapshot.isCaughtUp ? tr('Memoria al día', 'Memory is current') : tr('Tu memoria necesita una vuelta', 'Your memory needs a pass')}</h2>
        <p className="mt-1.5 text-sm leading-5 text-zinc-400">
          {snapshot.isCaughtUp
            ? tr('No hay conceptos vencidos. Continúa aprendiendo y vuelve cuando FSRS programe el próximo repaso.', 'Nothing is overdue. Keep learning and return when FSRS schedules the next review.')
            : tr(`${snapshot.due.length} ${snapshot.due.length === 1 ? 'concepto está listo' : 'conceptos están listos'} para recuperar.`, `${snapshot.due.length} ${snapshot.due.length === 1 ? 'concept is' : 'concepts are'} ready for retrieval.`)}
        </p>
        {!snapshot.isCaughtUp && (
          <p className="mt-3 font-mono text-[11px] text-zinc-500">
            {tr('Duración estimada', 'Estimated time')} · ~{Math.max(1, Math.ceil(snapshot.due.length / 2))} min
          </p>
        )}
        <button type="button" onClick={() => snapshot.isCaughtUp ? setActiveView('learn') : setReviewQueue([...snapshot.due])} className="t1ger-primary-button mt-6 w-full justify-between px-5 text-black">
          <span>{snapshot.isCaughtUp ? tr('Continuar aprendiendo', 'Keep learning') : tr(`Repasar ${snapshot.due.length} ahora`, `Review ${snapshot.due.length} now`)}</span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-black/15"><ArrowRight size={16} weight="bold" /></span>
        </button>
      </section>

      <section className="mt-8 px-1" aria-labelledby="knowledge-strength-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-600">{tr('Memoria', 'Memory')}</p>
            <h2 id="knowledge-strength-title" className="mt-1 text-lg font-bold tracking-tight">{tr('Fuerza del conocimiento', 'Knowledge strength')}</h2>
          </div>
          <p className="font-mono text-xs text-zinc-500">{snapshot.strength.total} {tr('programados', 'scheduled')}</p>
        </div>
        {snapshot.strength.total > 0 ? (
          <dl className="mt-4 grid grid-cols-3 divide-x divide-white/8 rounded-2xl bg-white/[.035] py-4 ring-1 ring-white/[.07]">
            <div className="px-3"><dt className="text-[10px] text-zinc-500">{tr('Aprendiendo', 'Learning')}</dt><dd className="mt-1 font-mono text-xl tabular-nums">{snapshot.strength.learning}</dd></div>
            <div className="px-3"><dt className="text-[10px] text-zinc-500">{tr('En repaso', 'Reviewing')}</dt><dd className="mt-1 font-mono text-xl tabular-nums">{snapshot.strength.reviewing}</dd></div>
            <div className="px-3"><dt className="text-[10px] text-zinc-500">{tr('Reforzando', 'Relearning')}</dt><dd className="mt-1 font-mono text-xl tabular-nums">{snapshot.strength.relearning}</dd></div>
          </dl>
        ) : (
          <div className="mt-4 flex items-start gap-3 rounded-2xl bg-white/[.035] p-4 ring-1 ring-white/[.07]">
            <Brain size={20} className="mt-0.5 shrink-0 text-zinc-500" />
            <p className="text-sm leading-5 text-zinc-400">{tr('Completa tu primera lección y su Apply para empezar a construir memoria duradera.', 'Complete your first lesson and Apply step to start building durable memory.')}</p>
          </div>
        )}
      </section>

      {snapshot.recent.length > 0 && (
        <section className="mt-8 px-1" aria-labelledby="recent-title">
          <h2 id="recent-title" className="text-lg font-bold tracking-tight">{tr('Aprendido recientemente', 'Recently learned')}</h2>
          <div className="mt-3 divide-y divide-white/[.07] border-y border-white/[.07]">
            {snapshot.recent.map((item) => (
              <article key={item.lesson.id} className="flex items-center gap-3 py-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[.05] text-zinc-400"><Lightning size={17} weight="fill" /></span>
                <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">{item.lesson.title[locale]}</h3><p className="mt-0.5 truncate text-[11px] text-zinc-500">{item.lesson.keyConcept[locale]}</p></div>
                <span className="font-mono text-[10px] text-zinc-600">{item.latestScore}%</span>
              </article>
            ))}
          </div>
        </section>
      )}

      {snapshot.weak.length > 0 && (
        <section className="mt-8 px-1" aria-labelledby="weak-title">
          <div className="flex items-center gap-2"><WarningCircle size={17} className="text-amber-400" /><h2 id="weak-title" className="text-lg font-bold tracking-tight">{tr('Necesita refuerzo', 'Needs reinforcement')}</h2></div>
          <p className="mt-1 text-xs text-zinc-500">{tr('Sólo mostramos conceptos con recuerdo débil registrado.', 'Only concepts with recorded weak recall appear here.')}</p>
          <ul className="mt-3 space-y-2">
            {snapshot.weak.map((item) => <li key={item.lesson.id} className="flex items-center justify-between gap-3 rounded-xl bg-amber-500/[.06] px-3.5 py-3 ring-1 ring-amber-400/15"><span className="min-w-0 truncate text-sm font-medium">{item.lesson.title[locale]}</span><span className="font-mono text-[10px] text-amber-300">{item.latestScore}%</span></li>)}
          </ul>
        </section>
      )}
    </div>
  );
};
