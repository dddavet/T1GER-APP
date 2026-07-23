import React from 'react';
import { motion } from 'motion/react';
import { Lock, Crown, Star, BookOpen, Building2, TrendingUp, Cpu } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { type TrackType } from '../services/missionBank';
import { AI_CURATED_CURRICULUM } from '../services/aiCuratedLibrary';

// UI STYLING PER NICHE TRACK
interface TrackStyle {
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
}

const TRACK_STYLES: Record<TrackType, TrackStyle> = {
  investing: { 
    icon: <TrendingUp className="w-4 h-4" />, 
    color: '#FF7300', 
    borderColor: '#CC5C00', 
    bgColor: '#FFF7F0' 
  },
  business: { 
    icon: <Building2 className="w-4 h-4" />, 
    color: '#1CB0F6', 
    borderColor: '#1899D6', 
    bgColor: '#F0F9FF' 
  },
  ai: { 
    icon: <Cpu className="w-4 h-4" />, 
    color: '#CE82FF', 
    borderColor: '#A559D6', 
    bgColor: '#FAF5FF' 
  },
};

// Zigzag position calculator (Duolingo style curve)
const getNodePosition = (index: number): { xOffset: number } => {
  const pattern = [0, 55, 30, -55, -30, 0, 55, 30, -55, -30];
  return { xOffset: pattern[index % pattern.length] };
};

export const WindingPath = ({ onStart }: { onStart: (mission: any) => void }) => {
  const { pathData, brainState, getSessionMissions, dailyProgress, language } = useBrain();
  const { appUser } = useAuth();

  const activeLevel = pathData.track?.levels?.[pathData.currentLevelIndex] || pathData.track?.levels?.[0];
  const trackStyle = TRACK_STYLES[pathData.track?.trackId as TrackType] || TRACK_STYLES.investing;

  if (!activeLevel || !trackStyle) return null;

  const activeDayIndex = pathData.currentDayIndex;
  const [justUnlockedIndex, setJustUnlockedIndex] = React.useState<number | null>(null);
  const prevDayRef = React.useRef(activeDayIndex);

  React.useEffect(() => {
    if (activeDayIndex > prevDayRef.current) {
      setJustUnlockedIndex(activeDayIndex);
      setTimeout(() => setJustUnlockedIndex(null), 3000);
    }
    prevDayRef.current = activeDayIndex;
  }, [activeDayIndex]);

  const missionsForCurrentDay = getSessionMissions();
  const nextMission = missionsForCurrentDay.find(m => !brainState.dailySession?.completedIds.includes(m.id));

  return (
    <div className="relative w-full flex flex-col items-center pb-8 pt-2">
      
      {/* Completion Banner if Track Finished */}
      {pathData.isFullyCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center mb-6 p-5 rounded-3xl border-2 border-[#58CC02] bg-[#58CC02]/10 border-b-4 border-b-[#58A700]"
        >
          <p className="text-3xl mb-1">🎓</p>
          <h3 className="font-black text-lg text-[#58CC02] uppercase tracking-tight">¡TRACK COMPLETADO!</h3>
          <p className="text-xs font-bold text-zinc-600 mt-1">Has dominado todas las lecciones de {pathData.track.title}.</p>
        </motion.div>
      )}

      {/* 3D PATH CONTAINER */}
      <div className="relative w-full max-w-[300px] flex flex-col items-center">
        {/* SVG Connecting Snake Path */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
          preserveAspectRatio="none"
        >
          {activeLevel.days.slice(0, -1).map((_, i) => {
            const from = getNodePosition(i);
            const to = getNodePosition(i + 1);
            const y1 = 48 + i * 110;
            const y2 = 48 + (i + 1) * 110;
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
                stroke={isPrior || isActive ? '#58CC02' : '#E5E7EB'}
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </svg>

        {/* MISSION NODES = DAYS */}
        {activeLevel.days.map((day, i: number) => {
          const isDone = i < activeDayIndex || brainState.completedDayIds.includes(day.dayId);
          const isActive = i === activeDayIndex && !pathData.isFullyCompleted;
          const { xOffset } = getNodePosition(i);
          const nodeSize = isActive ? 76 : 68;

          return (
            <div
              key={day.dayId}
              className="relative flex flex-col items-center z-10"
              style={{
                marginTop: i === 0 ? 0 : 32,
                marginLeft: `calc(50% + ${xOffset}px - ${nodeSize / 2}px)`,
                width: nodeSize,
              }}
            >
              {/* FLOATING 3D MASCOT CALLOUT TOOLTIP ABOVE ACTIVE NODE */}
              {isActive && (
                <motion.div
                  initial={{ y: -6, opacity: 0 }}
                  animate={{ y: [0, -6, 0], opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  className="absolute -top-12 z-20 flex flex-col items-center pointer-events-none whitespace-nowrap"
                >
                  <div className="bg-[#58CC02] border-b-4 border-[#58A700] text-white font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5">
                    <span>{language === 'es' ? '¡EMPEZAR (+100 XP)!' : 'START (+100 XP)!'}</span>
                  </div>
                  {/* Callout Arrow */}
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#58CC02] -mt-0.5" />
                </motion.div>
              )}

              {/* 3D PHYSICAL KEY BUTTON NODE */}
              <motion.button
                aria-label={isActive ? `${language === 'es' ? 'Empezar día' : 'Start day'} ${day.dayNumber}: ${nextMission?.title || 'lección'}` : isDone ? `${language === 'es' ? 'Día' : 'Day'} ${day.dayNumber} ${language === 'es' ? 'completado' : 'completed'}` : `${language === 'es' ? 'Día' : 'Day'} ${day.dayNumber} ${language === 'es' ? 'bloqueado' : 'locked'}`}
                disabled={!isActive || !nextMission}
                whileTap={isActive ? { y: 6 } : {}}
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
                  }
                }}
                className={`relative flex items-center justify-center transition-all cursor-pointer outline-none rounded-full ${
                  isDone
                    ? 'bg-[#FBBF24] border-b-[6px] border-[#D97706] shadow-md'
                    : isActive
                      ? 'bg-[#58CC02] border-b-[8px] border-[#58A700] shadow-2xl'
                      : 'bg-[#E5E7EB] border-b-[6px] border-[#C4C4C4] text-zinc-400 opacity-60 cursor-not-allowed'
                }`}
                style={{
                  width: nodeSize,
                  height: nodeSize,
                }}
              >
                {isDone ? (
                  <Crown className="w-8 h-8 stroke-[2.5] text-white fill-white" />
                ) : isActive ? (
                  <Star className="w-9 h-9 stroke-[2.5] text-white fill-white relative z-10" />
                ) : (
                  <Lock className="w-6 h-6 stroke-[2.5] text-zinc-400" />
                )}

                {/* Multi-mission progress badge */}
                {isActive && dailyProgress.total > 1 && (
                  <div className="absolute -bottom-2 bg-white border-2 border-zinc-200 rounded-full px-2 py-0.5 text-[8px] font-black font-mono text-zinc-800 shadow-md z-20">
                    {dailyProgress.completed}/{dailyProgress.total}
                  </div>
                )}

                {/* Animated active pulse ring */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ border: `3px solid #58CC02` }}
                    animate={{ scale: [1, 1.35, 1.35], opacity: [0.7, 0, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
              </motion.button>

              {/* NODE DAY LABEL */}
              <div className="mt-2 text-center max-w-[110px]">
                <p className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-zinc-800' : 'text-zinc-400'}`}>
                  {language === 'es' ? `DÍA ${day.dayNumber}` : `DAY ${day.dayNumber}`}
                </p>
                {isActive && (
                  <p className="text-[9px] font-extrabold text-[#58CC02] line-clamp-2 mt-0.5 leading-tight">
                    {pathData.track.trackId === 'ai'
                      ? (AI_CURATED_CURRICULUM[day.dayNumber]?.title || nextMission?.title)
                      : (nextMission?.title || '')
                    }
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
