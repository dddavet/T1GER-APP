import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Check,
  LockKeyhole,
  ShieldCheck,
  Target,
  Zap,
  Sparkles,
  ShieldAlert,
  Flame,
  ChevronRight,
  TrendingUp,
  Brain
} from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { MISSION_BANK, type BankMission, type TrackType } from '../services/missionBank';
import { localizeCurriculumLevel, localizeMission } from '../services/contentLocalization';
import {
  getNodeMemoryShield,
  getGlobalMemoryHealth,
  getVulnerableShieldNodes,
} from '../services/brainService';
import { KnowledgeNode } from '../components/learn/KnowledgeNode';
import { MemoryShieldBadge } from '../components/learn/MemoryShieldBadge';
import { InteractiveLessonPlayer } from '../components/learn/InteractiveLessonPlayer';
import { QuickShieldRefreshModal } from '../components/learn/QuickShieldRefreshModal';
import { MascotGuide } from '../components/MascotGuide';

interface LearnProps {
  onStartMission?: (mission: BankMission) => void;
}

export const Learn: React.FC<LearnProps> = ({ onStartMission }) => {
  const { brainState, language, pathData, switchTrack } = useBrain();
  const isEs = language === 'es';

  const [activeInteractiveMission, setActiveInteractiveMission] = useState<BankMission | null>(null);
  const [showRefreshModal, setShowRefreshModal] = useState(false);

  const completedMissionIds = useMemo(
    () =>
      new Set(
        brainState.missionHistory.filter((record) => record.completed).map((record) => record.missionId)
      ),
    [brainState.missionHistory]
  );

  const memoryHealth = useMemo(() => getGlobalMemoryHealth(brainState), [brainState]);
  const vulnerableNodes = useMemo(() => getVulnerableShieldNodes(brainState), [brainState]);

  const handleNodeClick = (mission: BankMission) => {
    // If it has theory/micro-cards, open the new Kinnu-style interactive player
    if (mission.nodeType === 'learn' || !mission.verificationMethod || mission.verificationMethod === 'honor_system') {
      setActiveInteractiveMission(mission);
    } else {
      // If it's a deep real-world execution task (e.g. paper trade / photo proof), use standard engine
      onStartMission?.(mission);
    }
  };

  const handleLessonCompleted = (missionId: string) => {
    setActiveInteractiveMission(null);
  };

  return (
    <div className="pb-12 pt-4 font-sans select-none max-w-2xl mx-auto">
      {/* 1. GLOBAL MEMORY SHIELD HUD (Kinnu-Inspired Hub) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 backdrop-blur-xl shadow-xl"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ob-accent)]/15 border border-[var(--ob-accent)]/30 text-[var(--ob-accent)] shadow-[0_0_20px_rgba(255,115,0,0.2)]">
              <Brain size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-[var(--ob-accent)]">
                  {isEs ? 'Índice de Retención FSRS' : 'FSRS Retention Index'}
                </span>
                <span className="flex items-center gap-1 font-mono text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  <Flame size={11} /> {brainState.learnStreak}d {isEs ? 'Racha' : 'Streak'}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-0.5 flex items-center gap-2">
                {memoryHealth.score}% {isEs ? 'Salud Cognitiva' : 'Memory Health'}
              </h2>
            </div>
          </div>

          <div className="shrink-0">
            <MemoryShieldBadge percentage={memoryHealth.score} size="md" showLabel={false} />
          </div>
        </div>

        {/* Vulnerable Shield Warning & Speed Round CTA */}
        {vulnerableNodes.length > 0 ? (
          <div className="mt-4 pt-4 border-t border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-rose-300">
              <ShieldAlert size={16} className="text-rose-400 shrink-0" />
              <span>
                <strong>{vulnerableNodes.length} {isEs ? 'escudos en riesgo' : 'shields decaying'}</strong>. {isEs ? 'La memoria se desvanece.' : 'Retention is fading.'}
              </span>
            </div>
            <button
              onClick={() => setShowRefreshModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-[var(--ob-accent)] text-black font-mono text-xs font-black tracking-wide flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
            >
              <Zap size={14} />
              <span>{isEs ? 'BLINDAR ESCUDOS (60s)' : 'RECHARGE SHIELDS (60s)'}</span>
            </button>
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 text-[#3FC78E]">
              <ShieldCheck size={15} />
              {isEs ? 'Todos los conceptos blindados con éxito' : 'All learned models fully protected'}
            </span>
            <span className="font-mono text-[11px] text-zinc-500">
              {memoryHealth.totalNodesLearned} {isEs ? 'nodos dominados' : 'nodes mastered'}
            </span>
          </div>
        )}
      </motion.div>

      {/* 2. TRACK SELECTOR TABS */}
      <div className="mb-6 flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/8">
        {(['investing', 'business', 'ai'] as TrackType[]).map((trackId) => {
          const isActive = brainState.currentTrackId === trackId;
          const label = {
            investing: isEs ? '📈 Inversiones' : '📈 Investing',
            business: isEs ? '⚡ Negocios' : '⚡ Business',
            ai: isEs ? '🤖 IA & Tech' : '🤖 AI & Tech',
          }[trackId];

          return (
            <button
              key={trackId}
              onClick={() => switchTrack(trackId)}
              className={`flex-1 py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white/10 text-white shadow-md border border-white/15'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 3. MASCOT GUIDE ADVICE */}
      <div className="mb-7">
        <MascotGuide surface="learn" />
      </div>

      {/* 4. CURRICULUM MODULES & SKILL TREE */}
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

          return (
            <motion.section
              key={level.levelId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(levelIndex * 0.05, 0.2) }}
              className={`overflow-hidden rounded-3xl border transition-all ${
                levelComplete
                  ? 'border-[#3FC78E]/30 bg-[#3FC78E]/[0.03]'
                  : priorLevelsComplete
                  ? 'border-white/12 bg-[#121216]/90 shadow-lg'
                  : 'border-white/6 bg-white/[0.01] opacity-40'
              }`}
            >
              {/* Module Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/6">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold ${
                      levelComplete
                        ? 'bg-[#3FC78E] text-black'
                        : priorLevelsComplete
                        ? 'bg-[var(--ob-accent)] text-black'
                        : 'bg-white/10 text-zinc-500'
                    }`}
                  >
                    {levelComplete ? <Check size={18} className="stroke-[3]" /> : level.levelNumber}
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-zinc-400">
                      {isEs ? `Módulo ${level.levelNumber}` : `Module ${level.levelNumber}`}
                    </span>
                    <h2 className="text-base font-bold text-white leading-tight mt-0.5">
                      {level.title}
                    </h2>
                  </div>
                </div>

                <span className="font-mono text-[11px] text-zinc-400">
                  {level.days.filter((d) => brainState.completedDayIds.includes(d.dayId)).length} / {level.days.length}
                </span>
              </div>

              {/* Module Node List */}
              {priorLevelsComplete && (
                <div className="p-4 space-y-3">
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

                  {/* Apply / Real-World Tactical Node */}
                  {applyMission && (
                    <div className="pt-2">
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

      {/* 5. INTERACTIVE MICRO-LESSON PLAYER (Kinnu-Style Modal) */}
      <AnimatePresence>
        {activeInteractiveMission && (
          <InteractiveLessonPlayer
            mission={activeInteractiveMission}
            onClose={() => setActiveInteractiveMission(null)}
            onComplete={handleLessonCompleted}
          />
        )}
      </AnimatePresence>

      {/* 6. QUICK SHIELD REFRESH SPEED ROUND */}
      <AnimatePresence>
        {showRefreshModal && (
          <QuickShieldRefreshModal
            vulnerableMissions={vulnerableNodes}
            onClose={() => setShowRefreshModal(false)}
            onSuccess={() => setShowRefreshModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
