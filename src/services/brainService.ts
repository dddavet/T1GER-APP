// ============================================================
// T1GER BRAIN SERVICE v3 (Curriculum Path)
// ============================================================
// Upgraded to support linear Curriculum Tracks (Paths) instead
// of just dynamic random 70/30 sessions.
// ============================================================

import {
  type Competency,
  type Difficulty,
  type BankMission,
  type TrackType,
  type CurriculumTrack,
  type CurriculumLevel,
  type CurriculumDay,
  ALL_COMPETENCIES,
  MISSION_BANK,
  CURRICULUM_TRACKS,
} from './missionBank';

// ============================================================
// TYPES
// ============================================================

export interface CompetencyProfile {
  offer: number;
  sales: number;
  marketing: number;
  mindset: number;
  operations: number;
  investing: number;
  accounting: number;
  ai: number;
}

export interface MissionRecord {
  missionId: string;
  competency: Competency;
  difficulty: Difficulty;
  completed: boolean;
  score: number;
  timestamp: number;
}

export interface DailySession {
  date: string;
  missionIds: string[];
  completedIds: string[];
}

export type NicheType = 'ecommerce' | 'coaching' | 'agency' | 'saas' | 'content' | 'general' | 'investing' | 'accounting';

export interface BrainState {
  competencies: CompetencyProfile;
  missionHistory: MissionRecord[];
  currentDifficulty: Record<Competency, Difficulty>;
  lastActiveDate: Record<Competency, number>;
  dailySession: DailySession | null;
  niche: NicheType;
  
  // Curriculum specific tracking
  currentTrackId: TrackType;
  completedDayIds: string[]; // List of CurriculumDay IDs the user has fully completed

  // Dual Streak System
  learnStreak: number;
  tacticalStreak: number;
  lastLearnDate: string | null; // ISO Date YYYY-MM-DD
  lastTacticalDate: string | null; // ISO Date YYYY-MM-DD

  // Custom Tactical System
  customHabits: TacticalTask[];
  customWorkTasks: TacticalTask[];
  customLessonTasks: TacticalTask[];
  dailyTacticalStatus: Record<string, DailyTacticalRecord>; // ISO Date -> Status
}

export interface TacticalTask {
  id: string;
  label: string;
  type: 'habit' | 'work' | 'lesson';
  icon?: string; // Lucide icon name
  createdAt?: number;
  recurrence?: 'daily' | 'weekdays' | 'weekly' | 'custom';
  recurrenceInterval?: number; // e.g. repeats every N days
  recurrenceDayOfWeek?: number; // e.g. 0-6 for weekly
}

export type DayType = 'rest' | 'normal' | 'beast';

export interface DailyTacticalRecord {
  dayType: DayType;
  committedHabitIds: string[]; // Habits chosen for today
  committedWorkIds: string[]; // Work tasks chosen for today
  committedLessonIds: string[]; // Lessons chosen for today
  completedIds: string[];
  proofs: Record<string, { url?: string; text?: string; verified?: boolean }>;
}

export interface RescueProtocolSelectionInput {
  availableHabitIds: string[];
  workTasks: TacticalTask[];
  lessonTasks: TacticalTask[];
}

export interface RescueProtocolSelection {
  dayType: 'rest';
  habitIds: string[];
  workIds: string[];
  lessonIds: string[];
}

// ============================================================
// DEFAULTS
// ============================================================

export const DEFAULT_BRAIN_STATE: BrainState = {
  competencies: {
    offer: 20,
    sales: 20,
    marketing: 20,
    mindset: 30,
    operations: 15,
    investing: 20,
    accounting: 20,
    ai: 20,
  },
  missionHistory: [],
  currentDifficulty: {
    offer: 'easy',
    sales: 'easy',
    marketing: 'easy',
    mindset: 'easy',
    operations: 'easy',
    investing: 'easy',
    accounting: 'easy',
    ai: 'easy',
  },
  lastActiveDate: {
    offer: Date.now(),
    sales: Date.now(),
    marketing: Date.now(),
    mindset: Date.now(),
    operations: Date.now(),
    investing: Date.now(),
    accounting: Date.now(),
    ai: Date.now(),
  },
  dailySession: null,
  niche: 'general',
  currentTrackId: 'investing',
  completedDayIds: [],
  learnStreak: 0,
  tacticalStreak: 0,
  lastLearnDate: null,
  lastTacticalDate: null,
  customHabits: [
    { id: 'h1', label: 'Go to the gym', type: 'habit', icon: 'Dumbbell', createdAt: Date.now() },
    { id: 'h2', label: 'Make your bed', type: 'habit', icon: 'Bed', createdAt: Date.now() },
    { id: 'h3', label: 'Brush your teeth', type: 'habit', icon: 'Droplets', createdAt: Date.now() },
  ],
  customWorkTasks: [
    { id: 'w1', label: 'Code feature', type: 'work', icon: 'Code', createdAt: Date.now() },
    { id: 'w2', label: 'Marketing', type: 'work', icon: 'BarChart3', createdAt: Date.now() },
  ],
  customLessonTasks: [
    { id: 'l1', label: 'Business Strategy', type: 'lesson', icon: 'Book', createdAt: Date.now() },
    { id: 'l2', label: 'Market Research', type: 'lesson', icon: 'Brain', createdAt: Date.now() },
  ],
  dailyTacticalStatus: {},
};

export function buildRescueProtocolSelection({
  availableHabitIds,
  workTasks,
  lessonTasks,
}: RescueProtocolSelectionInput): RescueProtocolSelection {
  const firstHabitId = availableHabitIds[0];
  const firstWorkTask = workTasks.find(task => task.type === 'work');
  const firstLessonTask = lessonTasks.find(task => task.type === 'lesson');

  return {
    dayType: 'rest',
    habitIds: firstHabitId ? [firstHabitId] : [],
    workIds: firstWorkTask ? [firstWorkTask.id] : [],
    lessonIds: firstLessonTask ? [firstLessonTask.id] : [],
  };
}

// ============================================================
// CURRICULUM PATH HELPERS
// ============================================================

/**
 * Given the current BrainState, retrieves the full selected Track
 * and calculates the user's progress through it.
 */
export function getCurrentPathData(state: BrainState) {
  const track = CURRICULUM_TRACKS[state.currentTrackId] || CURRICULUM_TRACKS['investing'];
  let currentLevelIndex = 0;
  let currentDayIndex = 0;
  
  // Find the first uncompleted Day in this Track
  for (let l = 0; l < track.levels.length; l++) {
    const level = track.levels[l];
    for (let d = 0; d < level.days.length; d++) {
      const day = level.days[d];
      if (!state.completedDayIds.includes(day.dayId)) {
        return { track, currentLevelIndex: l, currentDayIndex: d, isFullyCompleted: false };
      }
    }
  }

  // If all completed, return end state
  return { 
    track, 
    currentLevelIndex: track.levels.length - 1, 
    currentDayIndex: track.levels[track.levels.length - 1].days.length - 1,
    isFullyCompleted: true
  };
}

/**
 * Builds the current "Daily Session" based on the user's Curriculum position.
 */
export function buildCurriculumSession(state: BrainState): DailySession {
  const today = new Date().toISOString().split('T')[0];

  // We map the active 'Day' inside the Curriculum to the 'dailySession'
  const pathData = getCurrentPathData(state);
  
  // If the track is fully completed, feed them review missions or latest level
  if (pathData.isFullyCompleted) {
    const lastLevel = pathData.track.levels[pathData.track.levels.length - 1];
    const lastDay = lastLevel.days[lastLevel.days.length - 1];
    return {
      date: today,
      missionIds: lastDay.missionIds,
      completedIds: state.missionHistory
        .filter(r => r.completed && lastDay.missionIds.includes(r.missionId))
        .map(r => r.missionId)
    };
  }

  const activeLevel = pathData.track.levels[pathData.currentLevelIndex];
  const activeDay = activeLevel.days[pathData.currentDayIndex];
  
  // For the active day, what missions has the user completed?
  // We check history against the current Day's missionIds
  const completedInDay = activeDay.missionIds.filter(id => 
    state.missionHistory.some(r => r.missionId === id && r.completed)
  );

  return {
    date: today,
    missionIds: activeDay.missionIds,
    completedIds: completedInDay,
  };
}

// ============================================================
// STRENGTH DECAY & CORE LOGIC
// ============================================================

const MS_PER_DAY = 86_400_000;
const DECAY_PER_DAY = 2;
const MIN_SCORE = 5;

export function applyDecay(state: BrainState): CompetencyProfile {
  const now = Date.now();
  const decayed = { ...state.competencies };

  for (const comp of ALL_COMPETENCIES) {
    const daysSinceActive = Math.floor(
      (now - (state.lastActiveDate[comp] || now)) / MS_PER_DAY
    );
    if (daysSinceActive > 0) {
      const loss = daysSinceActive * DECAY_PER_DAY;
      decayed[comp] = Math.max(MIN_SCORE, decayed[comp] - loss);
    }
  }

  return decayed;
}

export function processMissionResult(
  state: BrainState,
  missionId: string,
  completed: boolean,
  score: number = 100
): BrainState {
  const mission = MISSION_BANK.find(m => m.id === missionId);
  if (!mission) return state;

  const competency = mission.competency;

  const diffMultiplier = 1.0;
  const change = completed
    ? Math.round((score / 100) * 8 * diffMultiplier)
    : -5;

  const newScore = Math.max(0, Math.min(100, state.competencies[competency] + change));

  const record: MissionRecord = {
    missionId,
    competency,
    difficulty: mission.difficulty,
    completed,
    score,
    timestamp: Date.now(),
  };

  const newHistory = [...state.missionHistory, record];
  let newCompletedDayIds = [...state.completedDayIds];

  // Curriculum logic: check if this completion finishes the current CurriculumDay
  if (completed) {
    const pathData = getCurrentPathData(state);
    if (!pathData.isFullyCompleted) {
      const activeLevel = pathData.track.levels[pathData.currentLevelIndex];
      const activeDay = activeLevel.days[pathData.currentDayIndex];
      
      const allDone = activeDay.missionIds.every(mId => 
        mId === missionId || newHistory.some(r => r.missionId === mId && r.completed)
      );

      if (allDone && !newCompletedDayIds.includes(activeDay.dayId)) {
        newCompletedDayIds.push(activeDay.dayId);
      }
    }
  }

  const session = buildCurriculumSession({...state, missionHistory: newHistory, completedDayIds: newCompletedDayIds});

  // Handle Learn Streak
  const today = new Date().toISOString().split('T')[0];
  let newLearnStreak = state.learnStreak;
  let newLastLearnDate = state.lastLearnDate;

  if (completed && state.lastLearnDate !== today) {
    // If they haven't learned today yet, increment or reset streak
    if (state.lastLearnDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (state.lastLearnDate === yesterdayStr) {
        newLearnStreak += 1;
      } else {
        newLearnStreak = 1; // Reset if they skipped a day
      }
    } else {
      newLearnStreak = 1;
    }
    newLastLearnDate = today;
  }

  return {
    ...state,
    competencies: {
      ...state.competencies,
      [competency]: newScore,
    },
    missionHistory: newHistory,
    lastActiveDate: {
      ...state.lastActiveDate,
      [competency]: Date.now(),
    },
    completedDayIds: newCompletedDayIds,
    dailySession: session,
    learnStreak: newLearnStreak,
    lastLearnDate: newLastLearnDate,
  };
}

/**
 * Handle Tactical Streak increment
 */
export function processTacticalResult(state: BrainState): BrainState {
  const today = new Date().toISOString().split('T')[0];
  if (state.lastTacticalDate === today) return state;

  let newStreak = state.tacticalStreak;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (state.lastTacticalDate === yesterdayStr) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }

  return {
    ...state,
    tacticalStreak: newStreak,
    lastTacticalDate: today
  };
}

export interface TopicProgress {
  competency: Competency;
  totalMissions: number;
  completedMissions: number;
  mastery: number;
  currentDifficulty: Difficulty;
}

export function addTacticalTask(
  state: BrainState, 
  label: string, 
  type: 'habit' | 'work' | 'lesson', 
  icon?: string,
  recurrence?: 'daily' | 'weekdays' | 'weekly' | 'custom',
  recurrenceInterval?: number,
  recurrenceDayOfWeek?: number
): BrainState {
  const newTask: TacticalTask = {
    id: Math.random().toString(36).substr(2, 9),
    label,
    type,
    icon,
    createdAt: Date.now(),
    recurrence: recurrence || 'daily',
    recurrenceInterval,
    recurrenceDayOfWeek
  };
  const keyMap = {
    habit: 'customHabits',
    work: 'customWorkTasks',
    lesson: 'customLessonTasks'
  };
  const key = keyMap[type] as keyof BrainState;
  
  return {
    ...state,
    [key]: [...(state[key] as TacticalTask[]), newTask]
  };
}

export function removeTacticalTask(state: BrainState, id: string, type: 'habit' | 'work' | 'lesson'): BrainState {
  const keyMap = {
    habit: 'customHabits',
    work: 'customWorkTasks',
    lesson: 'customLessonTasks'
  };
  const key = keyMap[type] as keyof BrainState;

  return {
    ...state,
    [key]: (state[key] as TacticalTask[]).filter(t => t.id !== id)
  };
}

export function setDayType(state: BrainState, type: DayType): BrainState {
  const today = new Date().toISOString().split('T')[0];
  const currentStatus = state.dailyTacticalStatus[today] || { 
    dayType: 'normal', 
    committedHabitIds: [], 
    committedWorkIds: [], 
    committedLessonIds: [],
    completedIds: [], 
    proofs: {} 
  };
  
  return {
    ...state,
    dailyTacticalStatus: {
      ...state.dailyTacticalStatus,
      [today]: { ...currentStatus, dayType: type }
    }
  };
}

export function commitDailyTactical(state: BrainState, habitIds: string[], workIds: string[], lessonIds: string[]): BrainState {
  const today = new Date().toISOString().split('T')[0];
  const currentStatus = state.dailyTacticalStatus[today] || { 
    dayType: 'normal', 
    committedHabitIds: [], 
    committedWorkIds: [], 
    committedLessonIds: [],
    completedIds: [], 
    proofs: {} 
  };

  return {
    ...state,
    dailyTacticalStatus: {
      ...state.dailyTacticalStatus,
      [today]: { 
        ...currentStatus, 
        committedHabitIds: habitIds, 
        committedWorkIds: workIds,
        committedLessonIds: lessonIds
      }
    }
  };
}

export function completeTacticalTask(state: BrainState, id: string, proofUrl?: string, proofText?: string, verified: boolean = true): BrainState {
  const today = new Date().toISOString().split('T')[0];
  const currentStatus = state.dailyTacticalStatus[today] || { 
    dayType: 'normal', 
    committedHabitIds: [], 
    committedWorkIds: [], 
    committedLessonIds: [],
    completedIds: [], 
    proofs: {} 
  };
  
  if (currentStatus.completedIds.includes(id)) return state;

  const newCompletedIds = [...currentStatus.completedIds, id];
  const newProofs = { ...currentStatus.proofs, [id]: { url: proofUrl, text: proofText, verified } };

  const newState = {
    ...state,
    dailyTacticalStatus: {
      ...state.dailyTacticalStatus,
      [today]: { ...currentStatus, completedIds: newCompletedIds, proofs: newProofs }
    }
  };

  // Check if all COMMITTED tasks are completed to increment streak
  const allRequired = [...currentStatus.committedHabitIds, ...currentStatus.committedWorkIds, ...currentStatus.committedLessonIds];
  
  // If no commitment yet, we can't complete the day protocol
  if (allRequired.length === 0) return newState;

  const allDone = allRequired.every(reqId => newCompletedIds.includes(reqId));
  
  if (allDone) {
    return processTacticalResult(newState);
  }

  return newState;
}

export function getTopicProgress(state: BrainState): TopicProgress[] {
  const scores = applyDecay(state);
  return ALL_COMPETENCIES.map(comp => {
    const totalInBank = MISSION_BANK.filter(m => m.competency === comp).length;
    const completedInComp = new Set(
      state.missionHistory
        .filter(r => r.competency === comp && r.completed)
        .map(r => r.missionId)
    ).size;

    return {
      competency: comp,
      totalMissions: totalInBank,
      completedMissions: completedInComp,
      mastery: Math.round(scores[comp]),
      currentDifficulty: state.currentDifficulty[comp],
    };
  });
}

export interface UserWeaknesses {
  weakCompetencies: { competency: string; score: number }[];
  recentFailedMissions: string[];
}

export function getUserWeaknesses(state: BrainState): UserWeaknesses {
  const decayedScores = applyDecay(state);
  
  const weakCompetencies = Object.entries(decayedScores)
    .map(([competency, score]) => ({ competency, score }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  const recentFailedMissions = Array.from(new Set(
    state.missionHistory
      .filter(record => !record.completed)
      .map(record => {
        const mission = MISSION_BANK.find(m => m.id === record.missionId);
        return mission ? `${mission.title} (${mission.concept || ''})` : '';
      })
      .filter(Boolean)
  )).slice(-3);

  return {
    weakCompetencies,
    recentFailedMissions
  };
}
