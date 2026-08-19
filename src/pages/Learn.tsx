import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Check,
  LockKeyhole,
  Target,
  Sparkles,
  ChevronRight,
  Flame,
  Bookmark
} from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { MISSION_BANK, type BankMission, type TrackType } from '../services/missionBank';
import { localizeCurriculumLevel, localizeMission } from '../services/contentLocalization';
import { getNodeMemoryShield } from '../services/brainService';
import { KnowledgeNode } from '../components/learn/KnowledgeNode';
import { CuratedLessonPlayer } from '../components/learn/CuratedLessonPlayer';
import { MascotGuide } from '../components/MascotGuide';
import { BookChestRewardModal } from '../components/learn/BookChestRewardModal';
import { Gift } from 'lucide-react';

interface LearnProps {
  onStartMission?: (mission: BankMission) => void;
}

export const Learn: React.FC<LearnProps> = ({ onStartMission }) => {
  const { brainState, language, pathData, switchTrack } = useBrain();
  const isEs = language === 'es';

  const [activePlaybookMission, setActivePlaybookMission] = useState<BankMission | null>(null);
  const [activeRewardChest, setActiveRewardChest] = useState<{ title: string; badge: string } | null>(null);

  const completedMissionIds = useMemo(
    () =>
      new Set(
        brainState.missionHistory.filter((record) => record.completed).map((record) => record.missionId)
      ),
    [brainState.missionHistory]
  );

  const handleNodeClick = (mission: BankMission) => {
    if (mission.nodeType === 'learn' || !mission.verificationMethod || mission.verificationMethod === 'honor_system') {
      setActivePlaybookMission(mission);
    } else {
      onStartMission?.(mission);
    }
  };

  const handleExecuteApply = (mission: BankMission) => {
    setActivePlaybookMission(null);
    onStartMission?.(mission);
  };

  return (
    <div className="pb-36 pt-2 font-sans select-none max-w-lg mx-auto px-1">
      {/* 1. TRACK SELECTOR TABS (Minimalist & Sleek) */}
      <div className="mb-4 flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/8">
        {(['investing', 'business', 'ai'] as TrackType[]).map((trackId) => {
          const isActive = brainState.currentTrackId === trackId;
          const label = {
            investing: isEs ? '📈 Inversión' : '📈 Investing',
            business: isEs ? '⚡ Negocios' : '⚡ Business',
            ai: isEs ? '🤖 IA & Tech' : '🤖 AI & Tech',
          }[trackId];

          return (
            <button
              key={trackId}
              onClick={() => switchTrack(trackId)}
              className={`flex-1 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white/12 text-white shadow-sm border border-white/15'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 2. MASCOT GUIDE ADVICE (Dark Theme Matched) */}
      <div className="mb-6">
        <MascotGuide surface="learn" />
      </div>

      {/* 3. DUOLINGO-STYLE BOOK ROADMAP */}
      <div className="space-y-6">
        {pathData.track.levels.map((sourceLevel, levelIndex) => {
          const level = localizeCurriculumLevel(sourceLevel, language);
          const priorLevelsComplete = pathData.track.levels.slice(0, levelIndex).every((item) =>
            item.days.every((day) => brainState.completedDayIds.includes(day.dayId)) &&
            (!item.applyNodeId || completedMissionIds.has(item.applyNodeId))
          );
          const lessonsComplete = level.days.every((day) => brainState.completedDayIds.includes(day.dayId));
          const applyComplete = !level.applyNodeId || completedMissionIds.has(level.applyNodeId);
          const levelComplete = lessonsComplete && applyComplete;
          const sourceApplyMission = MISSION_BANK.find((mission) => mission.id === level.applyNodeId);
          const applyMission = sourceApplyMission ? localizeMission(sourceApplyMission, language) : undefined;

          const completedCount = level.days.filter((d) => brainState.completedDayIds.includes(d.dayId)).length;
          const totalDays = level.days.length;

          return (
            <motion.section
              key={level.levelId}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(levelIndex * 0.05, 0.2) }}
              className={`overflow-hidden rounded-3xl border transition-all ${
                levelComplete
                  ? 'border-[#3FC78E]/30 bg-[#3FC78E]/[0.03]'
                  : priorLevelsComplete
                  ? 'border-white/12 bg-[#121216] shadow-xl'
                  : 'border-white/6 bg-white/[0.01] opacity-40'
              }`}
            >
              {/* Book Header Card */}
              <div className="flex items-center justify-between p-4 border-b border-white/6 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-mono text-sm font-bold shadow-md ${
                      levelComplete
                        ? 'bg-[#3FC78E] text-black'
                        : priorLevelsComplete
                        ? 'bg-[var(--ob-accent)] text-black shadow-[0_0_15px_rgba(255,115,0,0.3)]'
                        : 'bg-white/10 text-zinc-500'
                    }`}
                  >
                    {levelComplete ? <Check size={18} className="stroke-[3]" /> : <Bookmark size={18} />}
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-[var(--ob-accent)]">
                      {isEs ? `LIBRO #${level.levelNumber}` : `BOOK #${level.levelNumber}`}
                    </span>
                    <h2 className="text-base font-bold text-white leading-tight mt-0.5">
                      {level.title}
                    </h2>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{level.subtitle}</p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-2">
                  {levelComplete && (
                    <button
                      onClick={() => setActiveRewardChest({ title: level.title, badge: `Maestro de ${level.title}` })}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-amber-400 to-[var(--ob-accent)] text-black shadow-[0_0_15px_rgba(255,115,0,0.4)] animate-bounce active:scale-90 transition cursor-pointer"
                      aria-label="Abrir Cofre de Recompensas"
                    >
                      <Gift size={18} className="stroke-[2.5]" />
                    </button>
                  )}
                  <div>
                    <span className="font-mono text-xs font-bold text-zinc-300">
                      {completedCount}/{totalDays}
                    </span>
                    <span className="block text-[10px] text-zinc-500 font-mono uppercase">
                      {levelComplete ? (isEs ? 'Dominado' : 'Mastered') : (isEs ? 'En curso' : 'Active')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Module Playbook Nodes & Apply Task */}
              {priorLevelsComplete && (
                <div className="p-3.5 space-y-3">
                  {level.days.map((day, dayIndex) => {
                    const sourceMission = MISSION_BANK.find((item) => item.id === day.missionIds[0]);
                    if (!sourceMission) return null;
                    const mission = localizeMission(sourceMission, language);
                    const done = brainState.completedDayIds.includes(day.dayId);
                    const unlocked =
                      dayIndex === 0 || brainState.completedDayIds.includes(level.days[dayIndex - 1].dayId);
                    const shield = getNodeMemoryShield(mission.id, brainState);

                    return (
                      <KnowledgeNode
                        key={day.dayId}
                        mission={mission}
                        shield={shield}
                        isUnlocked={unlocked}
                        isCompleted={done}
                        index={dayIndex}
                        onSelect={() => handleNodeClick(mission)}
                      />
                    );
                  })}

                  {/* Real-World Execution Task (Apply) */}
                  {applyMission && (
                    <div className="pt-1">
                      <KnowledgeNode
                        mission={applyMission}
                        shield={getNodeMemoryShield(applyMission.id, brainState)}
                        isUnlocked={lessonsComplete}
                        isCompleted={applyComplete}
                        isApply={true}
                        index={level.days.length}
                        onSelect={() => handleNodeClick(applyMission)}
                      />
                    </div>
                  )}
                </div>
              )}
            </motion.section>
          );
        })}
      </div>

      {/* 4. CURATED EXECUTIVE PLAYBOOK READER (Learn -> Apply) */}
      <AnimatePresence>
        {activePlaybookMission && (
          <CuratedLessonPlayer
            mission={activePlaybookMission}
            onClose={() => setActivePlaybookMission(null)}
            onExecuteApplyMission={handleExecuteApply}
          />
        )}
      </AnimatePresence>

      {/* 5. BOOK COMPLETION TREASURE CHEST MODAL */}
      <BookChestRewardModal
        isOpen={Boolean(activeRewardChest)}
        onClose={() => setActiveRewardChest(null)}
        bookTitle={activeRewardChest?.title || ''}
        badgeName={activeRewardChest?.badge || ''}
        isEs={isEs}
      />
    </div>
  );
};
