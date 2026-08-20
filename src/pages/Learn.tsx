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
  Bookmark,
  Gift,
  Award
} from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { MISSION_BANK, type BankMission, type TrackType } from '../services/missionBank';
import { localizeCurriculumLevel, localizeMission } from '../services/contentLocalization';
import { getNodeMemoryShield } from '../services/brainService';
import { KnowledgeNode } from '../components/learn/KnowledgeNode';
import { T1gerPetHero } from '../components/pet/T1gerPetHero';
import { BookChestRewardModal } from '../components/learn/BookChestRewardModal';

interface LearnProps {
  onStartMission?: (mission: BankMission) => void;
}

export const Learn: React.FC<LearnProps> = ({ onStartMission }) => {
  const { brainState, language, pathData, selectTrack } = useBrain();
  const isEs = language === 'es';

  const [activeRewardChest, setActiveRewardChest] = useState<{ title: string; badge: string } | null>(null);

  const completedMissionIds = useMemo(
    () =>
      new Set(
        brainState.missionHistory.filter((record) => record.completed).map((record) => record.missionId)
      ),
    [brainState.missionHistory]
  );

  const handleNodeClick = (mission: BankMission) => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(12);
    onStartMission?.(mission);
  };

  return (
    <div className="pb-28 pt-1 font-sans select-none max-w-lg mx-auto px-2 space-y-3.5">
      {/* 1. LIQUID TRACK SELECTOR (Executive Curriculums) */}
      <div className="rounded-[1.4rem] border border-white/10 bg-[#121216]/95 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-1 rounded-2xl border border-white/[0.06] bg-[#09090B] p-1">
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
                onClick={() => {
                  if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(10);
                  selectTrack(trackId);
                }}
                className={`relative flex-1 py-1.5 rounded-xl font-mono text-[10.5px] font-bold transition-colors cursor-pointer z-10 ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="track-selector-active"
                    className="absolute inset-0 rounded-xl bg-[var(--ob-accent)]/15 border border-[var(--ob-accent)]/30 shadow-[0_0_12px_rgba(255,115,0,0.2)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-20">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. T1GER VIRTUAL PET SANCTUARY (Focus & Digital Wellbeing) */}
      <div>
        <T1gerPetHero
          onStartLesson={() => {
            const firstIncomplete = pathData.track.levels
              .flatMap((l) => l.days)
              .flatMap((d) => d.missionIds)
              .find((id) => !completedMissionIds.has(id));
            const mission = MISSION_BANK.find((m) => m.id === firstIncomplete);
            if (mission) handleNodeClick(mission);
          }}
        />
      </div>

      {/* 3. EXECUTIVE BOOK PLAYBOOKS ROADMAP (Machined Hardbound Tomes) */}
      <div className="space-y-3.5">
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
          const progressPercent = Math.round((completedCount / totalDays) * 100);

          return (
            <motion.section
              key={level.levelId}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(levelIndex * 0.05, 0.2) }}
              className={`rounded-[1.75rem] border p-1.5 transition-all shadow-[0_20px_45px_rgba(0,0,0,0.6)] ${
                levelComplete
                  ? 'border-[#3FC78E]/30 bg-[#121216]/95'
                  : priorLevelsComplete
                  ? 'border-white/12 bg-[#121216]/95'
                  : 'border-white/6 bg-white/[0.02] opacity-45'
              }`}
            >
              <div className="rounded-[1.4rem] border border-white/[0.08] bg-[#09090B] overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                {/* Book Header Card */}
                <div className="p-3.5 sm:p-4 border-b border-white/6 bg-white/[0.02]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-mono text-xs font-black shadow-lg ${
                          levelComplete
                            ? 'bg-[#3FC78E] text-black shadow-[#3FC78E]/30'
                            : priorLevelsComplete
                            ? 'bg-gradient-to-br from-[var(--ob-accent)] to-[#FF5500] text-black shadow-[0_0_15px_rgba(255,115,0,0.35)]'
                            : 'bg-white/10 text-zinc-500'
                        }`}
                      >
                        {levelComplete ? <Check size={18} className="stroke-[3]" /> : <Bookmark size={18} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] uppercase tracking-[0.12em] font-extrabold text-[var(--ob-accent)]">
                            {isEs ? `TOMO #${level.levelNumber}` : `TOME #${level.levelNumber}`}
                          </span>
                          {levelComplete && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[8px] font-mono font-bold uppercase">
                              {isEs ? 'DOMINADO' : 'MASTERED'}
                            </span>
                          )}
                        </div>
                        <h2 className="text-sm sm:text-base font-black text-white leading-tight truncate mt-0.5">
                          {level.title}
                        </h2>
                        <p className="text-[10.5px] text-zinc-400 truncate">{level.subtitle}</p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-2.5 shrink-0">
                      {levelComplete && (
                        <button
                          onClick={() => setActiveRewardChest({ title: level.title, badge: `Maestro de ${level.title}` })}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-b from-amber-400 to-[var(--ob-accent)] text-black shadow-[0_0_14px_rgba(255,115,0,0.45)] animate-bounce active:scale-90 transition cursor-pointer"
                          aria-label="Abrir Cofre de Recompensas"
                        >
                          <Gift size={16} className="stroke-[2.5]" />
                        </button>
                      )}
                      <div>
                        <span className="font-mono text-xs font-black text-white tabular-nums">
                          {completedCount}/{totalDays}
                        </span>
                        <span className="block text-[8.5px] text-zinc-500 font-mono uppercase tracking-wider">
                          {progressPercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="mt-3 w-full h-1 rounded-full bg-white/6 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        levelComplete ? 'bg-[#3FC78E]' : 'bg-[var(--ob-accent)]'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Module Playbook Nodes & Apply Task */}
                {priorLevelsComplete && (
                  <div className="p-3 sm:p-3.5 space-y-2.5">
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
                      <div className="pt-1 border-t border-white/6">
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
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* 4. BOOK COMPLETION TREASURE CHEST MODAL */}
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
