import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CaretDown,
  CaretLeft,
  Fire,
  Play,
  Sparkle,
  TreeStructure,
} from '@phosphor-icons/react';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { useT1ger } from '../contexts/T1gerContext';
import { useFieldMissions } from '../hooks/useFieldMissions';
import { isFieldMissionComplete } from '../services/fieldMissionService';
import { getInteractiveTrack, getInteractiveTrackIdFromLegacy } from '../services/interactiveCurriculum';
import { getJourneyNodes, getSectionsForTrack, type JourneyNode } from '../services/learningJourney';
import { type AtomicLesson, type InteractiveTrackId } from '../services/interactiveCurriculumTypes';
import type { BankMission } from '../services/missionBank';
import {
  getDomainById,
  getDomainForTrackId,
  type DomainId,
  type KinnuDomain,
  type KinnuPathway,
} from '../services/curriculumCatalog';
import { KnowledgeTree, resolveCurriculumIcon } from '../components/learn/KnowledgeTree';
import { DuolingoOrbTrail } from '../components/learn/DuolingoOrbTrail';
import { DomainCatalogModal } from '../components/learn/DomainCatalogModal';
import { T1gerMascot3D } from '../components/T1gerMascot3D';
const Player = React.lazy(() =>
  import('../components/learn/AtomicLessonPlayer').then(m => ({ default: m.AtomicLessonPlayer }))
);

export const Learn: React.FC<{ onStartMission?: (mission: BankMission) => void }> = () => {
  const { brainState, language, learnStreak, selectTrack } = useBrain();
  const { appUser } = useAuth();
  const { setActiveView, stats } = useT1ger();
  const missions = useFieldMissions(appUser?.uid || 'local');
  const locale = language === 'es' ? 'es' : 'en';
  const tr = (es: string, en: string) => (locale === 'es' ? es : en);

  // Sync initial domain with user's current track
  const activeTrackId: InteractiveTrackId = useMemo(() => {
    return getInteractiveTrackIdFromLegacy(brainState.currentTrackId || 'investing');
  }, [brainState.currentTrackId]);

  const initialDomain = useMemo(() => getDomainForTrackId(activeTrackId), [activeTrackId]);

  const [selectedDomainId, setSelectedDomainId] = useState<DomainId>(initialDomain.id);
  const currentDomain: KinnuDomain = useMemo(() => getDomainById(selectedDomainId), [selectedDomainId]);

  // Selected pathway inside the domain (defaults to first pathway of domain)
  const [selectedPathway, setSelectedPathway] = useState<KinnuPathway>(() => currentDomain.pathways[0]);

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
  const next = nodes.find(node => node.state !== 'completed');
  const pending = next && missions.find(m => m.lessonId === next.lesson.id && !isFieldMissionComplete(m));
  const [lesson, setLesson] = useState<AtomicLesson | null>(null);
  const [review, setReview] = useState(false);

  const handleSelectPathway = (pathway: KinnuPathway, domain?: KinnuDomain) => {
    if (domain && domain.id !== selectedDomainId) {
      setSelectedDomainId(domain.id);
    }
    setSelectedPathway(pathway);
    setViewMode('path');
    selectTrack(
      pathway.interactiveTrackId === 'smart-money'
        ? 'investing'
        : pathway.interactiveTrackId === 'history-strategy'
        ? 'history'
        : pathway.interactiveTrackId === 'mindset-stoic'
        ? 'mindset'
        : pathway.interactiveTrackId === 'peak-performance'
        ? 'performance'
        : pathway.interactiveTrackId === 'data-science' || pathway.interactiveTrackId === 'ai-automation'
        ? 'ai'
        : 'business'
    );
  };

  const open = (node: JourneyNode) => {
    if (node.state === 'locked') return;
    if (node.state === 'review') {
      setReview(true);
      setLesson(currentTrack.lessons.find(item => item.id === node.reviewIds[0]) || null);
    } else if (node.state !== 'completed' && missions.some(m => m.lessonId === node.lesson.id && !isFieldMissionComplete(m))) {
      setActiveView('build');
    } else {
      setReview(false);
      setLesson(node.lesson);
    }
  };

  return (
    <div className="journey-page mx-auto max-w-lg pb-32 text-white px-2 sm:px-3">
      {/* Top Header: Duolingo Course Picker & Streak Status */}
      <header className="px-1 pt-2 pb-2">
        <div className="flex items-center justify-between gap-2">
          {/* Sleek Course Picker Button */}
          <button
            data-testid="course-picker-button"
            onClick={() => setIsCatalogOpen(true)}
            className="flex items-center gap-2 py-1.5 px-3 rounded-2xl bg-[#14141A] hover:bg-[#1C1C24] border border-white/15 text-white shadow-sm transition-all cursor-pointer group select-none"
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
              <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 leading-none">
                {currentDomain.title[locale]}
              </span>
              <span className="block text-xs font-black truncate max-w-[130px] sm:max-w-[160px] text-white group-hover:text-orange-300 transition-colors">
                {selectedPathway.title[locale]}
              </span>
            </div>
            <CaretDown size={14} weight="bold" className="text-zinc-400 group-hover:text-white transition-transform group-hover:translate-y-0.5" />
          </button>

          {/* Controls: Mode Switcher & Streak Counter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(v => (v === 'path' ? 'tree' : 'path'))}
              aria-label={viewMode === 'path' ? tr('Ver Árbol del Saber', 'View Knowledge Tree') : tr('Ver Sendero de Orbes', 'View Orb Trail')}
              className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-white/[0.06] hover:bg-white/15 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer select-none"
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

            <span className="flex items-center gap-1.5 text-xs font-black text-zinc-200 bg-[#14141A] px-2.5 py-1.5 rounded-full border border-white/10 shadow-sm">
              <Fire weight="fill" className="text-orange-400 animate-pulse" />
              <span>{learnStreak}</span>
            </span>
          </div>
        </div>
      </header>

      {/* VIEW 1: Duolingo-style Winding Orb Trail (Immediate Dopamine & Action) */}
      {viewMode === 'path' ? (
        <div className="mt-2 space-y-4">
          {/* Duolingo Hero Unit Banner with Lively Mascot */}
          <div
            className="rounded-[2rem] border p-4 sm:p-5 shadow-xl relative overflow-hidden text-white"
            style={{
              background: 'linear-gradient(135deg, #181822 0%, #111116 100%)',
              borderColor: `${currentDomain.accentColor}40`,
              boxShadow: `0 10px 30px -10px ${currentDomain.glowColor}`,
            }}
          >
            {/* Ambient Background Glow */}
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none opacity-25"
              style={{ backgroundColor: currentDomain.accentColor }}
            />

            {/* Top Unit Badge & Pedigree Citation */}
            <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
              <span
                className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${currentDomain.accentColor}20`,
                  borderColor: `${currentDomain.accentColor}45`,
                  color: currentDomain.accentColor,
                }}
              >
                {currentDomain.title[locale]} · {tr('UNIDAD 1', 'UNIT 1')}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 truncate max-w-[200px]">
                <Sparkle size={10} weight="fill" className="text-orange-400 shrink-0" />
                {selectedPathway.curatedSources[locale].split('·')[0]}
              </span>
            </div>

            {/* Mascot Dialogue: Motivating Coach Speech */}
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center pointer-events-none">
                <React.Suspense
                  fallback={
                    <img
                      src="/t1ger-avatar.png"
                      alt="T1ger"
                      className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-[0_8px_16px_rgba(255,115,0,0.3)]"
                    />
                  }
                >
                  <T1gerMascot3D
                    mood="beast"
                    closeUp
                    className="w-20 h-20 sm:w-24 sm:h-24"
                  />
                </React.Suspense>
              </div>

              {/* Speech Dialogue Bubble */}
              <div className="relative flex-1 rounded-2xl border border-white/15 bg-[#141419]/90 backdrop-blur-md p-3 text-left shadow-md">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rotate-45 border-b border-l border-white/15 bg-[#141419]" />
                <p className="text-xs sm:text-sm text-white font-bold leading-snug">
                  {learnStreak === 0
                    ? tr(
                        '¡Enciende tu racha hoy! Conquista tu primer orbe en solo 3 minutos.',
                        'Ignite your streak today! Conquer your first orb in just 3 minutes.'
                      )
                    : completed > 0
                    ? tr(
                        '¡Imparable! Conquista el siguiente paso hacia la maestría.',
                        'Unstoppable! Conquer the next step towards mastery.'
                      )
                    : tr(
                        '3 minutos de aprendizaje activo para dominar esta habilidad.',
                        '3 minutes of active learning to master this skill.'
                      )}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 mb-4 relative z-10">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-300 font-bold">{selectedPathway.title[locale]}</span>
                <span className="text-orange-400 font-bold">
                  {completed}/{nodes.length} {tr('Orbes', 'Orbs')}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-black/50 border border-white/10 overflow-hidden">
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.max(8, (completed / nodes.length) * 100)}%`,
                    backgroundColor: currentDomain.accentColor,
                    boxShadow: `0 0 12px ${currentDomain.accentColor}`,
                  }}
                />
              </div>
            </div>

            {/* Giant Tactile 3D Action Button */}
            <button
              onClick={() => (next ? open(next) : setActiveView('build'))}
              className="w-full py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider text-black flex items-center justify-center gap-2 cursor-pointer select-none transition-all duration-100 shadow-[0_6px_0_#9a3412] hover:brightness-110 active:translate-y-1.5 active:shadow-[0_1px_0_#9a3412]"
              style={{
                backgroundColor: '#FF7300',
              }}
            >
              <span>
                {next
                  ? next.state === 'review'
                    ? tr('Reforzar memoria (+15 XP)', 'Refresh memory (+15 XP)')
                    : pending
                    ? tr('Continuar en Aplicar', 'Continue in Apply')
                    : tr(`Empezar Orbe ${completed + 1} (+20 XP)`, `Start Orb ${completed + 1} (+20 XP)`)
                  : tr('Ver mis acciones', 'See my actions')}
              </span>
              <ArrowRight size={18} weight="bold" />
            </button>
          </div>

          {/* Daily Quest Dopamine Strip */}
          <div className="mx-1 flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Fire size={16} weight="fill" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">
                  {tr('Meta Diaria', 'Daily Goal')}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {completed > 0
                    ? tr('1 / 1 Orbe completado ✓', '1 / 1 Orb completed ✓')
                    : tr('0 / 1 Orbe completado', '0 / 1 Orb completed')}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-500/30">
              +20 XP
            </span>
          </div>

          {/* The Stepping Stones / Duolingo Orb Trail */}
          <DuolingoOrbTrail
            sections={sections}
            nodes={nodes}
            locale={locale}
            accentColor={currentDomain.accentColor}
            glowColor={currentDomain.glowColor}
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
