import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, Compass, Fire, Flag, LockKey, Plant, Play, ShieldCheck } from '@phosphor-icons/react';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { useT1ger } from '../contexts/T1gerContext';
import { useFieldMissions } from '../hooks/useFieldMissions';
import { isFieldMissionComplete } from '../services/fieldMissionService';
import { getInteractiveTrack } from '../services/interactiveCurriculum';
import { getJourneyNodes, INVESTING_SECTIONS, type JourneyNode } from '../services/learningJourney';
import { localizeLearning, type AtomicLesson } from '../services/interactiveCurriculumTypes';
import type { BankMission } from '../services/missionBank';

const Player = React.lazy(() => import('../components/learn/AtomicLessonPlayer').then(m => ({ default: m.AtomicLessonPlayer })));
const landmarks = { seed: Plant, compass: Compass, summit: Flag };
const track = getInteractiveTrack('smart-money');

export const Learn: React.FC<{ onStartMission?: (mission: BankMission) => void }> = () => {
  const { brainState, language, learnStreak } = useBrain();
  const { appUser } = useAuth();
  const { setActiveView, stats } = useT1ger();
  const missions = useFieldMissions(appUser?.uid || 'local');
  const locale = language === 'es' ? 'es' : 'en';
  const tr = (es: string, en: string) => locale === 'es' ? es : en;
  const nodes = useMemo(() => getJourneyNodes(track, brainState, missions.filter(isFieldMissionComplete).map(m => m.id)), [brainState, missions]);
  const completed = nodes.filter(node => node.state === 'completed').length;
  const next = nodes.find(node => node.state !== 'completed');
  const pending = next && missions.find(m => m.lessonId === next.lesson.id && !isFieldMissionComplete(m));
  const [lesson, setLesson] = useState<AtomicLesson | null>(null);
  const [review, setReview] = useState(false);
  const open = (node: JourneyNode) => {
    if (node.state === 'locked') return;
    if (node.state === 'review') { setReview(true); setLesson(track.lessons.find(item => item.id === node.reviewIds[0]) || null); }
    else if (node.state !== 'completed' && missions.some(m => m.lessonId === node.lesson.id && !isFieldMissionComplete(m))) setActiveView('build');
    else { setReview(node.state === 'completed'); setLesson(node.lesson); }
  };
  const labels = { completed: tr('Completada · repasar', 'Completed · review'), current: tr('Tu siguiente paso', 'Your next step'), review: tr('Refuerza para avanzar', 'Refresh to advance'), locked: tr('Completa los pasos anteriores', 'Complete earlier steps') };

  return <div className="journey-page mx-auto max-w-lg pb-28 text-white">
    <header className="px-2 pb-6 pt-3">
      <div className="flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-orange-300">T1GER / {tr('Tu camino', 'Your journey')}</p><span className="flex items-center gap-1.5 text-sm"><Fire weight="fill" className="text-orange-400" />{learnStreak} {tr('días', 'days')}</span></div>
      <h1 className="mt-4 text-4xl font-bold tracking-tight">{tr('Invierte en tu criterio.', 'Invest in your judgment.')}</h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{tr('Una idea. Una acción. Un paso más cerca de entender tu dinero.', 'One idea. One action. One step closer to understanding your money.')}</p>
      <p className="mt-3 font-mono text-xs text-orange-300">{stats.xp} XP {tr('personales', 'personal')}</p>
      <div className="mt-5 flex items-center gap-3"><progress aria-label={tr('Progreso de Inversiones', 'Investing progress')} value={completed} max={nodes.length} className="journey-progress" /><span className="font-mono text-xs text-zinc-400">{completed}/{nodes.length}</span></div>
    </header>
    <section className="mb-6 rounded-2xl border border-orange-400/25 bg-[#121216] p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-orange-300">{next?.state === 'review' ? tr('Primero, un repaso', 'First, a quick refresh') : tr('Continúa tu aventura', 'Continue your journey')}</p>
      <h2 className="mt-2 text-xl font-bold">{next ? localizeLearning(next.lesson.title, locale) : tr('Tu base ya está construida.', 'Your foundation is built.')}</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{next?.state === 'review' ? tr('Recupera un concepto anterior antes de sumar otro. Tus victorias siguen intactas.', 'Refresh a previous concept before adding another. Your wins remain intact.') : tr('Aprende en 3 minutos y completa una acción a tu ritmo. Sin subir pruebas.', 'Learn in 3 minutes, then complete an action at your pace. No proof uploads.')}</p>
      <button className="t1ger-primary-button mt-4 w-full" onClick={() => next ? open(next) : setActiveView('build')}>{next ? next.state === 'review' ? tr('Reforzar mi memoria', 'Refresh my memory') : pending ? tr('Continuar en Aplicar', 'Continue in Apply') : tr('Empezar lección', 'Start lesson') : tr('Ver mis acciones', 'See my actions')}<ArrowRight size={20} /></button>
    </section>
    {INVESTING_SECTIONS.map((section, sectionIndex) => {
      const Icon = landmarks[section.landmark];
      const sectionNodes = nodes.filter(node => section.lessonIds.includes(node.lesson.id));
      const allDone = sectionNodes.every(node => node.state === 'completed');
      return <section key={section.id} className={`journey-region journey-region-${section.landmark}`} aria-labelledby={`region-${section.id}`}>
        <header className="flex items-start gap-3"><span className="journey-landmark"><Icon size={26} weight="duotone" /></span><div><p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">{tr('Etapa', 'Chapter')} 0{sectionIndex + 1} {allDone && '· ✓'}</p><h2 id={`region-${section.id}`} className="mt-1 text-xl font-bold">{localizeLearning(section.title, locale)}</h2><p className="mt-1 text-xs text-zinc-400">{localizeLearning(section.description, locale)}</p></div></header>
        <ol className="journey-trail">{sectionNodes.map(node => <li key={node.lesson.id} className={`journey-stop journey-stop-${node.lesson.order % 2 ? 'left' : 'right'}`}>
          <button onClick={() => open(node)} disabled={node.state === 'locked'} aria-label={`${localizeLearning(node.lesson.title, locale)}. ${labels[node.state]}`} aria-current={node.state === 'current' || node.state === 'review' ? 'step' : undefined} className={`journey-node journey-node-${node.state}`}>
            {node.state === 'completed' ? <Check size={28} weight="bold" /> : node.state === 'locked' ? <LockKey size={25} /> : node.state === 'review' ? <ShieldCheck size={28} /> : <Play size={26} weight="fill" />}
          </button>
          <div className="journey-caption"><span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{labels[node.state]}</span><h3 className="mt-1 text-sm font-semibold">{localizeLearning(node.lesson.title, locale)}</h3><p className="mt-1 font-mono text-[10px] text-zinc-400">03:00 · +{node.lesson.phases[3].xp + 50} XP {tr('al aplicar', 'with Apply')}</p></div>
        </li>)}</ol>
        <div className="journey-checkpoint"><Flag size={16} /><span>{allDone ? tr('Etapa conquistada', 'Chapter complete') : tr('Aprender → Aplicar → Avanzar', 'Learn → Apply → Advance')}</span></div>
      </section>;
    })}
    <p className="px-3 pt-5 text-center text-xs leading-relaxed text-zinc-400">{tr('Educación y simulaciones. No necesitas invertir dinero real para completar este camino.', 'Education and simulations. No real-money investment is needed to complete this journey.')}</p>
    {lesson && <React.Suspense fallback={<div role="status" className="fixed inset-0 z-[200] grid place-items-center bg-[#09090B]">{tr('Preparando lección…', 'Preparing lesson…')}</div>}><Player lesson={lesson} locale={locale} reviewOnly={review} onClose={() => setLesson(null)} onComplete={() => setLesson(null)} /></React.Suspense>}
  </div>;
};
