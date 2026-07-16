import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Zap, Lock, Crown, Star, BookOpen, Target, Lightbulb, Check, Building2, TrendingUp, Cpu, Play, Terminal } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { type TrackType } from '../services/missionBank';
import { AI_CURATED_CURRICULUM } from '../services/aiCuratedLibrary';

// ============================================================
// UI STYLING PER NICHE TRACK
// ============================================================
interface TrackStyle {
  icon: React.ReactNode;
  color: string;
}

const TRACK_STYLES: Record<TrackType, TrackStyle> = {
  investing: { icon: <TrendingUp className="w-4 h-4" />, color: '#10B981' },
  business: { icon: <Building2 className="w-4 h-4" />, color: '#3B82F6' },
  ai: { icon: <Cpu className="w-4 h-4" />, color: '#8B5CF6' },
};

// Zigzag pattern
const getNodePosition = (index: number): { xOffset: number } => {
  const pattern = [0, 60, 30, -60, -30, 0, 60, 30, -60, -30];
  return { xOffset: pattern[index % pattern.length] };
};

export const WindingPath = ({ onStart }: { onStart: (mission: any) => void }) => {
  const { pathData, brainState, getSessionMissions, dailyProgress } = useBrain();
  const { appUser } = useAuth();
  const learningStyle = appUser?.learningStyle || 'text';

  const activeLevel = pathData.track?.levels?.[pathData.currentLevelIndex] || pathData.track?.levels?.[0];
  const trackStyle = TRACK_STYLES[pathData.track?.trackId as TrackType] || TRACK_STYLES.investing;

  if (!activeLevel || !trackStyle) return null;

  // The node that represents the user's current exact spot
  const activeDayIndex = pathData.currentDayIndex;
  
  // Track if we just unlocked a literal new day, for pulsing animation
  const [justUnlockedIndex, setJustUnlockedIndex] = React.useState<number | null>(null);
  const prevDayRef = React.useRef(activeDayIndex);

  React.useEffect(() => {
    if (activeDayIndex > prevDayRef.current) {
      setJustUnlockedIndex(activeDayIndex);
      setTimeout(() => setJustUnlockedIndex(null), 3000); // clear after animation
    }
    prevDayRef.current = activeDayIndex;
  }, [activeDayIndex]);

  const missionsForCurrentDay = getSessionMissions();
  const nextMission = missionsForCurrentDay.find(m => !brainState.dailySession?.completedIds.includes(m.id));

  return (
    <div className="relative w-full flex flex-col items-center pb-4">

      {/* Path container */}
      {pathData.isFullyCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full text-center mb-6 p-5 rounded-2xl border"
          style={{ borderColor: `color-mix(in srgb, ${trackStyle.color} 40%, transparent)`, backgroundColor: `color-mix(in srgb, ${trackStyle.color} 10%, transparent)` }}
        >
          <p className="text-2xl mb-1">🎓</p>
          <h3 className="font-black text-lg" style={{ color: trackStyle.color }}>TRACK COMPLETED</h3>
          <p className="text-xs text-zinc-500 mt-1">You survived all levels in {pathData.track.title}.</p>
        </motion.div>
      )}

      {/* Path container */}
      <div className="relative w-full max-w-[300px]">
        {/* SVG connecting curves */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
          preserveAspectRatio="none"
        >
          {activeLevel.days.slice(0, -1).map((_, i) => {
            const from = getNodePosition(i);
            const to = getNodePosition(i + 1);
            const y1 = 44 + i * 100;
            const y2 = 44 + (i + 1) * 100;
            const x1 = 150 + from.xOffset;
            const x2 = 150 + to.xOffset;
            const midY = (y1 + y2) / 2;

            const isPrior = i < activeDayIndex;
            const isActive = i === activeDayIndex && !pathData.isFullyCompleted;

            return (
              <path
                key={i}
                d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                fill="none"
                stroke={isPrior || isActive ? trackStyle.color : '#E5E7EB'}
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </svg>

        {/* Mission nodes = Days */}
        {activeLevel.days.map((day, i: number) => {
          const isDone = i < activeDayIndex || brainState.completedDayIds.includes(day.dayId);
          const isActive = i === activeDayIndex && !pathData.isFullyCompleted;
          const { xOffset } = getNodePosition(i);
          const nodeSize = isActive ? 72 : 64;
          const isChest = (i + 1) % 5 === 0;

          return (
            <motion.div
              key={day.dayId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={justUnlockedIndex === i ? {
                opacity: 1, 
                scale: [0.8, 1.2, 1],
              } : { opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, duration: justUnlockedIndex === i ? 0.8 : 0 }}
              className="relative flex flex-col items-center"
              style={{
                marginTop: i === 0 ? 0 : 24,
                marginLeft: `calc(50% + ${xOffset}px - ${nodeSize / 2}px)`,
                width: nodeSize,
              }}
            >
              {justUnlockedIndex === i && (
                 <motion.div 
                   className="absolute inset-0 rounded-full"
                   style={{ backgroundColor: trackStyle.color }}
                   animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                   transition={{ duration: 1, ease: "easeOut" }}
                 />
              )}
              <motion.button
                aria-label={isActive ? `Empezar día ${day.dayNumber}: ${nextMission?.title || 'lección'}` : isDone ? `Día ${day.dayNumber} completado` : `Día ${day.dayNumber} bloqueado`}
                disabled={!isActive || !nextMission}
                whileTap={isActive ? { scale: 0.95 } : {}}
                whileHover={isActive ? { scale: 1.05 } : {}}
                onClick={() => {
                  if (isActive && nextMission) {
                    onStart({
                      ...nextMission,
                      dayNumber: day.dayNumber,
                      concept_flashcard: nextMission.concept,
                      business_scenario: nextMission.scenario,
                      mission_brief: nextMission.taskBrief,
                    });
                  } else if (!isActive && !isDone) {
                    console.log("Node is locked. Complete previous missions first.");
                  }
                }}
                className="relative flex items-center justify-center transition-all group outline-none"
                style={{
                  width: nodeSize,
                  height: nodeSize,
                  borderRadius: isChest ? '25%' : '50%',
                  background: isDone
                    ? '#FBBF24' // Yellow/Gold for completed
                    : isActive
                      ? trackStyle.color // Track color for active
                      : '#F3F4F6', // Light gray for locked
                  border: isDone
                    ? `3px solid #F59E0B`
                    : isActive
                      ? `3px solid color-mix(in srgb, ${trackStyle.color} 80%, black)`
                      : '3px solid #E5E7EB',
                }}
              >
                {isDone ? (
                  <Crown className="w-8 h-8 stroke-[2.5]" style={{ color: 'white', fill: 'white' }} />
                ) : isActive ? (
                  <Star className="w-8 h-8 stroke-[2.5] text-white fill-white relative z-10" />
                ) : (
                  <Lock className="w-6 h-6 stroke-[2.5] text-zinc-400" />
                )}

                {/* Progress indicator for multi-mission days */}
                {isActive && dailyProgress.total > 1 && (
                  <div className="absolute -bottom-2 bg-white border border-zinc-200 rounded-full px-2 py-0.5 text-[8px] font-black font-mono text-zinc-800 shadow-xl">
                    {dailyProgress.completed}/{dailyProgress.total}
                  </div>
                )}

                {/* Pulse ring for active */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ border: `2px solid ${trackStyle.color}` }}
                    animate={{ scale: [1, 1.3, 1.3], opacity: [0.6, 0, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
              </motion.button>

              {/* Label */}
              <div className={`mt-3 text-center max-w-[100px] ${isDone ? 'opacity-50' : isActive ? 'opacity-100' : 'opacity-25'}`}>
                <p className={`text-[11px] font-black uppercase tracking-tight leading-loose ${isActive ? 'text-zinc-800' : 'text-zinc-500'}`}>
                  DAY {day.dayNumber}
                </p>
                {isActive && (
                  <p className="text-[9px] font-bold line-clamp-2 mt-1 px-2" style={{ color: trackStyle.color }}>
                    {pathData.track.trackId === 'ai'
                      ? (AI_CURATED_CURRICULUM[day.dayNumber]?.title || nextMission?.title)
                      : (nextMission?.title || '')
                    }
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
