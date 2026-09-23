import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CaretDown,
  CaretLeft,
  Check,
  Fire,
  Play,
  Sparkle,
  TreeStructure,
} from '@phosphor-icons/react';
import { SoundEffects } from '../services/soundEffects';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { useT1ger } from '../contexts/T1gerContext';
import { useFieldMissions } from '../hooks/useFieldMissions';
import { isFieldMissionComplete } from '../services/fieldMissionService';
import { getLocalDateString } from '../services/brainService';
import { readLearningArtifacts } from '../services/learningArtifactService';
import { getInteractiveTrack, getInteractiveTrackIdFromLegacy } from '../services/interactiveCurriculum';
import { getJourneyNodes, getSectionsForTrack, type JourneyNode } from '../services/learningJourney';
import { type AtomicLesson, type InteractiveTrackId, localizeLearning } from '../services/interactiveCurriculumTypes';
import type { BankMission } from '../services/missionBank';
import {
  getDomainById,
  getReadyPathwayForTrack,
  isPathwayAvailable,
  type DomainId,
  type KinnuDomain,
  type KinnuPathway,
} from '../services/curriculumCatalog';
import { KnowledgeTree, resolveCurriculumIcon } from '../components/learn/KnowledgeTree';
import { DuolingoOrbTrail } from '../components/learn/DuolingoOrbTrail';
import { DomainCatalogModal } from '../components/learn/DomainCatalogModal';
const T1gerMascot3D = React.lazy(() => import('../components/T1gerMascot3D').then(m => ({ default: m.T1gerMascot3D })));
const Player = React.lazy(() =>
  import('../components/learn/AtomicLessonPlayer').then(m => ({ default: m.AtomicLessonPlayer }))
);

export const Learn: React.FC<{ onStartMission?: (mission: BankMission) => void }> = () => {
  const { brainState, language, selectTrack } = useBrain();
  const { appUser } = useAuth();
  const { setActiveView, stats } = useT1ger();
  const missions = useFieldMissions(appUser?.uid || 'local');
  const locale = language === 'es' ? 'es' : 'en';
  const tr = (es: string, en: string) => (locale === 'es' ? es : en);

  // Sync initial domain with user's current track
  const activeTrackId: InteractiveTrackId = useMemo(() => {
    return getInteractiveTrackIdFromLegacy(brainState.currentTrackId || 'investing');
  }, [brainState.currentTrackId]);


  const [selectedPathway, setSelectedPathway] = useState<KinnuPathway>(() => getReadyPathwayForTrack(activeTrackId));
  const selectedDomainId = selectedPathway.domainId;
  const currentDomain: KinnuDomain = useMemo(() => getDomainById(selectedDomainId), [selectedDomainId]);

  // Selected pathway inside the domain (defaults to first pathway of domain)
  useEffect(() => { setSelectedPathway(getReadyPathwayForTrack(activeTrackId)); }, [activeTrackId, appUser?.uid]);

  // View mode: defaults to 'path' (Duolingo-style winding orb trail) for immediate action and motivation
  const [viewMode, setViewMode] = useState<'path' | 'tree'>('path');

  // Modal for exploring the 6 domains and 24 pathways
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Interactive track corresponding to the selected pathway
  const selectedTrackId = selectedPathway.interactiveTrackId;
  const currentTrack = useMemo(() => getInteractiveTrack(selectedTrackId), [selectedTrackId]);
  const sections = useMemo(() => getSectionsForTrack(selectedTrackId), [selectedTrackId]);

  const nodes = useMemo(() => {
    const completedApplyIds = missions.filter(isFieldMissionComplete).map(m => m.id);
    return getJourneyNodes(currentTrack, brainState, completedApplyIds);
  }, [currentTrack, brainState, missions]);

  const completed = nodes.filter(node => node.state === 'completed').length;
  const completedToday = missions.some(m => isFieldMissionComplete(m) && getLocalDateString(new Date(m.submission?.createdAt || m.updatedAt)) === getLocalDateString());
  const hasArtifact = (lessonId: string) => {
    return readLearningArtifacts(appUser?.uid || 'local').some(item => item.lessonId === lessonId);
  };

  const next = nodes.find(node => node.state !== 'completed');
  const pending = next && hasArtifact(next.lesson.id) && missions.find(m => m.lessonId === next.lesson.id && !isFieldMissionComplete(m));
  const nextStage: 'learn' | 'apply' | 'master' = !next || next.state === 'review'
    ? 'master'
    : pending
      ? 'apply'
      : 'learn';
  const nextStageCopy = !next
    ? tr('Camino completado. Master mantendrá frescos los conceptos.', 'Path complete. Master will help keep these concepts fresh.')
    : nextStage === 'learn'
    ? tr('Siguiente: aprende el concepto y prueba tu criterio.', 'Next: learn the concept and test your judgment.')
    : nextStage === 'apply'
      ? tr('Siguiente: lleva tu herramienta a una acción real.', 'Next: use your tool in one real action.')
      : tr('Siguiente: repasa para conservar lo aprendido.', 'Next: review to retain what you learned.');
  const activeSectionIndex = Math.max(0, sections.findIndex(s => next ? s.lessonIds.includes(next.lesson.id) : false));
  const activeSection = sections[activeSectionIndex] || sections[0];
  const [lesson, setLesson] = useState<AtomicLesson | null>(null);
  const [review, setReview] = useState(false);

  const handleSelectPathway = (pathway: KinnuPathway, domain?: KinnuDomain) => {
    if (!isPathwayAvailable(pathway)) return;
    setSelectedPathway(pathway);
    setViewMode('path');
    selectTrack(getInteractiveTrack(pathway.interactiveTrackId).legacyTrackId);
  };

  const open = (node: JourneyNode) => {
    if (node.state === 'locked') return;
    if (node.state === 'review') {
      setReview(true);
      setLesson(currentTrack.lessons.find(item => item.id === node.reviewIds[0]) || null);
    } else if (node.state !== 'completed' && hasArtifact(node.lesson.id) && missions.some(m => m.lessonId === node.lesson.id && !isFieldMissionComplete(m))) {
      if (node.lesson.learningDesign?.goldStandard) {
        setReview(false);
        setLesson(node.lesson);
      } else {
        setActiveView('build');
      }
    } else {
      setReview(node.state === 'completed');
      setLesson(node.lesson);
    }
  };

  return (
    <div className="journey-page mx-auto max-w-lg pb-44 text-white px-1 sm:px-2">
      <h1 className="sr-only">{selectedPathway.title[locale]}</h1>
      {/* Course picker and path view control; the HUD owns streak status. */}
      <header className="px-1 pt-2 pb-2">
        <div className="flex items-center justify-between gap-2">
          {/* Sleek Course Picker Button */}
          <button
            data-testid="course-picker-button"
            onPointerDown={() => SoundEffects.playTap()}
            onClick={() => setIsCatalogOpen(true)}
            className="flex items-center gap-2 py-1.5 px-3 rounded-2xl bg-[#14141A] hover:bg-[#1C1C24] border border-white/15 text-white shadow-sm transition-all duration-100 ease-out cursor-pointer group select-none active:scale-[0.96] active:translate-y-0.5"
          >
            <span
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${currentDomain.accentColor}25`,
                color: currentDomain.accentColor,
              }}
            >
              {resolveCurriculumIcon(currentDomain.iconName, 14, 'bold')}
            </span>
            <div className="text-left">
              <span data-testid="course-domain-label" className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 leading-none">
                {currentDomain.title[locale]}
              </span>
              <span className="block text-xs font-black truncate max-w-[130px] sm:max-w-[160px] text-white group-hover:text-orange-300 transition-colors">
                {selectedPathway.title[locale]}
              </span>
            </div>
            <CaretDown size={14} weight="bold" className="text-zinc-400 group-hover:text-white transition-transform group-hover:translate-y-0.5" />
          </button>

          <div className="flex items-center">
            <button
              onPointerDown={() => SoundEffects.playToggle()}
              onClick={() => setViewMode(v => (v === 'path' ? 'tree' : 'path'))}
              aria-label={viewMode === 'path' ? tr('Ver Árbol del Saber', 'View Knowledge Tree') : tr('Ver Sendero de Orbes', 'View Orb Trail')}
              className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-xs font-bold text-zinc-300 transition-colors duration-150 hover:bg-white/15 hover:text-white cursor-pointer select-none active:scale-[0.97]"
            >
              {viewMode === 'path' ? (
                <>
                  <TreeStructure size={14} weight="bold" className="text-orange-400" />
                  <span className="hidden xs:inline">{tr('Árbol', 'Tree')}</span>
                </>
              ) : (
                <>
                  <Play size={13} weight="fill" className="text-orange-400" />
                  <span className="hidden xs:inline">{tr('Orbes', 'Orbs')}</span>
                </>
              )}
            </button>

          </div>
        </div>
      </header>

      <section aria-label={tr('Ciclo de aprendizaje', 'Learning loop')} className="mx-1 mb-4 border-b border-white/[.07] px-1 pb-3 pt-1">
        <ol className="grid grid-cols-3 gap-1" aria-label={tr('Etapas del ciclo', 'Loop stages')}>
          {([
            ['learn', tr('Aprender', 'Learn')],
            ['apply', tr('Aplicar', 'Apply')],
            ['master', tr('Dominar', 'Master')],
          ] as const).map(([stage, label], index) => {
            const isCurrent = nextStage === stage;
            return (
              <li key={stage} aria-current={isCurrent ? 'step' : undefined} className="flex min-w-0 items-center gap-1.5">
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border font-mono text-[8px] font-bold ${isCurrent ? 'border-[#FF7300] bg-[#FF7300] text-black' : 'border-white/15 bg-white/[.04] text-zinc-500'}`}>{index + 1}</span>
                <span className={`truncate text-[10px] font-bold ${isCurrent ? 'text-white' : 'text-zinc-500'}`}>{label}</span>
              </li>
            );
          })}
        </ol>
        <p role="status" className="mt-2 text-[10px] leading-relaxed text-zinc-500">{nextStageCopy}</p>
      </section>

      {/* VIEW 1: Duolingo-style Winding Orb Trail (Immediate Dopamine & Action) */}
      {viewMode === 'path' ? (
        <div className="mt-1 space-y-2.5">
          {/* Duolingo Hero Unit Banner with Lively Mascot - Double-Bezel Architecture */}
          <div className="rounded-[1.75rem] bg-[#121216] p-4 sm:p-5 relative overflow-hidden text-white ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_18px_42px_rgba(0,0,0,.35)]">
              {/* Top Unit Badge & Pedigree Citation */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3 relative z-10">
                <span
                  className="inline-flex items-center text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.05] text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                >
                  {tr('UNIDAD', 'UNIT')} {activeSectionIndex + 1}: {localizeLearning(activeSection.title, locale)}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                  <Sparkle size={10} weight="fill" className="text-orange-400 shrink-0" />
                  <span className="text-zinc-300 font-semibold">
                    {selectedPathway.curatedSources[locale].split('(')[0].split('·')[0].trim()}
                  </span>
                </span>
              </div>

              {/* Mascot Dialogue: Motivating Coach Speech */}
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="w-18 h-18 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center pointer-events-none">
                  <React.Suspense
                    fallback={
                      <div className="w-18 h-18 sm:w-22 sm:h-22 flex items-center justify-center">
                        <img
                          src="/mascot/t1ger-avatar.png"
                          alt="T1ger"
                          className="w-full h-full object-contain opacity-80"
                        />
                      </div>
                    }
                  >
                    <T1gerMascot3D
                      mood="beast"
                      closeUp
                      className="w-18 h-18 sm:w-22 sm:h-22"
                    />
                  </React.Suspense>
                </div>

                <div className="relative min-w-0 flex-1 py-2 text-left">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[.15em] text-[#FF9A4A]">
                    {!next ? tr('Camino completado', 'Path complete') : nextStage === 'apply' ? tr('Tu siguiente acción', 'Your next action') : nextStage === 'master' ? tr('Repaso pendiente', 'Review needed') : tr('Siguiente lección', 'Next lesson')}
                  </p>
                  <h2 className="mt-1 text-sm font-extrabold leading-tight tracking-tight text-white sm:text-base">
                    {next ? next.lesson.title[locale] : tr('Camino completado', 'Path complete')}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-zinc-400">
                    {!next
                      ? tr('Ve a Master para mantener frescas estas ideas.', 'Go to Master to keep these ideas fresh.')
                      : nextStage === 'apply'
                        ? tr('Usa la herramienta que acabas de crear en una acción real.', 'Use the tool you just built in one real action.')
                        : nextStage === 'master'
                          ? tr('Recupera el concepto antes de avanzar.', 'Recall the concept before moving on.')
                          : next.lesson.objective[locale]}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 mb-3.5 relative z-10">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-zinc-300 font-bold">{selectedPathway.title[locale]}</span>
                  <span className="text-zinc-400 font-bold">
                    <span className="text-[var(--ob-accent)] font-extrabold">{completed}</span>/{nodes.length} {tr('Orbes', 'Orbs')}
                  </span>
                </div>
                <div role="progressbar" aria-label={tr('Progreso del camino', 'Journey progress')} aria-valuemin={0} aria-valuemax={nodes.length} aria-valuenow={completed} className="h-2 w-full rounded-full bg-black/60 border border-white/10 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${nodes.length ? (completed / nodes.length) * 100 : 0}%`,
                      backgroundColor: currentDomain.accentColor,
                    }}
                  />
                </div>
              </div>

              {/* Button-in-Button CTA Architecture */}
              <button
                onPointerDown={() => SoundEffects.playTap()}
                onClick={() => {
                  if (next) open(next);
                  else setActiveView('master');
                }}
                className="t1ger-primary-button w-full cursor-pointer select-none text-black flex items-center justify-between !py-2.5 !px-4 group"
              >
                <span className="font-extrabold uppercase tracking-wide text-xs sm:text-sm pl-1">
                  {next
                    ? next.state === 'review'
                      ? tr('Reforzar memoria', 'Refresh memory')
                      : pending
                      ? tr('Continuar en Aplicar', 'Continue in Apply')
                      : tr(`Empezar lección ${completed + 1}`, `Start lesson ${completed + 1}`)
                    : tr('Ir a Master', 'Go to Master')}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15 transition-transform duration-120 group-hover:translate-x-0.5 group-active:scale-95">
                  <ArrowRight size={16} weight="bold" />
                </span>
              </button>
            </div>

          {/* Daily Quest Strip - Directional Elevation */}
          <div
            className={`mx-0.5 rounded-2xl border px-3.5 py-3 transition-all ${
              completedToday
                ? 'bg-emerald-950/20 border-emerald-500/25 shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]'
                : 'bg-[#121216]/90 border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.05)]'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Left Status Icon */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  completedToday
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/[0.06] text-[#FF8A2A] border border-white/10'
                }`}
              >
                {completedToday ? (
                  <Check size={20} weight="bold" />
                ) : (
                  <Fire size={20} weight="fill" />
                )}
              </div>

              {/* One daily state; the lesson hero remains the primary action. */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold tracking-tight text-white">
                  {completedToday ? tr('Acción de hoy completa', "Today's action complete") : tr('Acción de hoy', "Today's action")}
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-zinc-400">
                  {completedToday ? tr('Racha protegida', 'Streak protected') : tr('Completa Apply para cuidar tu racha', 'Complete Apply to protect your streak')}
                </p>
              </div>
              <span className={`shrink-0 font-mono text-xs font-bold tabular-nums ${completedToday ? 'text-emerald-300' : 'text-zinc-400'}`}>
                {completedToday ? '1 / 1' : '0 / 1'}
              </span>

            </div>
          </div>

          {/* The Stepping Stones / Duolingo Orb Trail */}
          <DuolingoOrbTrail
            sections={sections}
            nodes={nodes}
            locale={locale}
            accentColor={currentDomain.accentColor}
            onOpenNode={open}
          />
        </div>
      ) : (
        /* VIEW 2: Bird's Eye Knowledge Tree of the Selected Domain */
        <div className="mt-3">
          <div className="mb-3 flex items-center justify-between px-1">
            <button
              onClick={() => setViewMode('path')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer"
            >
              <CaretLeft size={16} weight="bold" />
              <span>{tr('Volver al Sendero de Orbes', 'Back to Orb Trail')}</span>
            </button>
            <span className="font-mono text-xs text-orange-300">{stats.xp} XP</span>
          </div>

          <KnowledgeTree
            domain={currentDomain}
            activePathwayId={selectedPathway.id}
            locale={locale}
            onSelectPathway={(pathway) => handleSelectPathway(pathway, currentDomain)}
          />
        </div>
      )}

      {/* Bottom Modal for Switching Domains & Pathways */}
      <DomainCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        selectedDomainId={selectedDomainId}
        selectedPathwayId={selectedPathway.id}
        locale={locale}
        onSelectPathway={handleSelectPathway}
      />

      {/* Lesson Player (Opens on node tap or hero button tap) */}
      {lesson && (
        <React.Suspense
          fallback={
            <div role="status" className="fixed inset-0 z-[200] grid place-items-center bg-[#09090B]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                <span className="text-sm font-medium text-zinc-300">
                  {tr('Preparando lección interactiva…', 'Preparing interactive lesson…')}
                </span>
              </div>
            </div>
          }
        >
          <Player
            lesson={lesson}
            locale={locale}
            reviewOnly={review}
            onClose={() => setLesson(null)}
            onComplete={() => setLesson(null)}
          />
        </React.Suspense>
      )}
    </div>
  );
};
