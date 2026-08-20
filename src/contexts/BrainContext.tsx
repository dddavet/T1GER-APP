// ============================================================
// T1GER BRAIN CONTEXT v3
// ============================================================
// Wraps the curriculum-based Brain logic.
// ============================================================

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  type BrainState,
  type CompetencyProfile,
  type TopicProgress,
  type NicheType,
  type DailyPipeline,
  DEFAULT_BRAIN_STATE,
  processMissionResult,
  applyDecay,
  buildCurriculumSession,
  getTopicProgress,
  getCurrentPathData,
  processTacticalResult,
  calculateSkillDecay,
  generateDailyPipeline,
} from '../services/brainService';
import { type BankMission, type TrackType, MISSION_BANK, CURRICULUM_TRACKS } from '../services/missionBank';
import { calculateT1gerEmotion, type T1gerEmotion } from '../services/t1gerStateEngine';

interface BrainContextType {
  competencies: CompetencyProfile;
  /** Get the current active Session missions based on Curriculum placement */
  getSessionMissions: () => BankMission[];
  /** Report a mission as completed */
  getDailyPipelineMissions: () => { pipeline: DailyPipeline | null, learnNode: BankMission | null, applyNode: BankMission | null };
  completeMission: (missionId: string, score?: number) => void;
  /** Report a mission as failed */
  failMission: (missionId: string) => void;
  /** Full brain state for debugging */
  brainState: BrainState;
  /** Number of missions completed total */
  totalCompleted: number;
  /** Today's session progress */
  dailyProgress: { completed: number; total: number };
  /** Topic progress for all competencies */
  topicProgress: TopicProgress[];
  
  currentTrackId: TrackType;
  selectTrack: (trackId: TrackType) => void;
  skipDaysForPlacement: (trackId: TrackType, targetLevelNumber: number) => void;
  pathData: ReturnType<typeof getCurrentPathData>;
  t1gerEmotion: T1gerEmotion;

  // Dual Streaks
  learnStreak: number;
  tacticalStreak: number;
  completeHabit: () => void; // Legacy, keep for now

  // New Tactical System
  customHabits: TacticalTask[];
  customWorkTasks: TacticalTask[];
  customLessonTasks: TacticalTask[];
  dailyTacticalStatus: DailyTacticalRecord;
  setDayType: (type: DayType) => void;
  addHabit: (label: string, icon?: string, recurrence?: 'daily' | 'weekdays' | 'weekly' | 'custom', recurrenceInterval?: number, recurrenceDayOfWeek?: number) => void;
  addWorkTask: (label: string, icon?: string, recurrence?: 'daily' | 'weekdays' | 'weekly' | 'custom', recurrenceInterval?: number, recurrenceDayOfWeek?: number) => void;
  addLessonTask: (label: string, icon?: string, recurrence?: 'daily' | 'weekdays' | 'weekly' | 'custom', recurrenceInterval?: number, recurrenceDayOfWeek?: number) => void;
  removeTacticalTask: (id: string, type: 'habit' | 'work' | 'lesson') => void;
  submitTacticalProof: (id: string, proofUrl?: string, proofText?: string, verified?: boolean) => void;
  commitTactical: (habitIds: string[], workIds: string[], lessonIds: string[]) => void;

  // Virtual Pet (Pou + Finch + Opal)
  petState: T1gerPetState;
  feedPet: (nutritionAmount?: number) => void;
  completeFocusSession: (minutes: number) => void;
  petMascot: () => void;
  updatePetSettings: (screenTimeLimitMinutes: number, dailyXPGoal: number) => void;

  // Internationalization (i18n)
  language: Language;
  setLanguage: (lang: Language) => void;

  resetBrain: () => void;
}

import { 
  type TacticalTask, 
  type DayType, 
  type DailyTacticalRecord,
  addTacticalTask,
  removeTacticalTask as removeTacticalTaskHelper,
  setDayType as setDayTypeHelper,
  completeTacticalTask,
  commitDailyTactical
} from '../services/brainService';
import { type T1gerPetState, DEFAULT_PET_STATE, calculatePetVitalsWithDecay } from '../services/petEngine';

const BrainContext = createContext<BrainContextType | undefined>(undefined);

const STORAGE_KEY = 'tiger_brain_state_v3';

function getSeedBrainStateForUser(userId: string): BrainState {
  if (userId === 'demo-founder-id') {
    return {
      ...DEFAULT_BRAIN_STATE,
      currentTrackId: 'investing',
      completedDayIds: ['inv-1-1', 'inv-1-2', 'inv-1-3', 'inv-1-4', 'inv-1-5'],
      learnStreak: 21,
      tacticalStreak: 18,
      competencies: {
        offer: 75, sales: 80, marketing: 70, mindset: 90,
        operations: 85, investing: 95, accounting: 70, ai: 85
      }
    };
  }

  if (userId === 'demo-investor-id') {
    return {
      ...DEFAULT_BRAIN_STATE,
      currentTrackId: 'investing',
      completedDayIds: ['inv-1-1', 'inv-1-2', 'inv-1-3'],
      learnStreak: 14,
      tacticalStreak: 10,
      competencies: {
        offer: 40, sales: 45, marketing: 30, mindset: 70,
        operations: 50, investing: 88, accounting: 82, ai: 40
      }
    };
  }

  if (userId === 'demo-hacker-id') {
    return {
      ...DEFAULT_BRAIN_STATE,
      currentTrackId: 'ai',
      completedDayIds: ['ai-d1', 'ai-d2'],
      learnStreak: 8,
      tacticalStreak: 5,
      competencies: {
        offer: 50, sales: 30, marketing: 40, mindset: 65,
        operations: 60, investing: 35, accounting: 30, ai: 92
      }
    };
  }

  if (userId === 'demo-growth-id') {
    return {
      ...DEFAULT_BRAIN_STATE,
      currentTrackId: 'business',
      completedDayIds: ['biz-d1', 'biz-d2', 'biz-d3', 'biz-d4'],
      learnStreak: 19,
      tacticalStreak: 15,
      competencies: {
        offer: 85, sales: 92, marketing: 88, mindset: 75,
        operations: 70, investing: 50, accounting: 45, ai: 60
      }
    };
  }

  if (userId === 'demo-newbie-id') {
    return {
      ...DEFAULT_BRAIN_STATE,
      currentTrackId: 'investing',
      completedDayIds: [],
      learnStreak: 0,
      tacticalStreak: 0,
      competencies: {
        offer: 0, sales: 0, marketing: 0, mindset: 0,
        operations: 0, investing: 0, accounting: 0, ai: 0
      }
    };
  }

  return { ...DEFAULT_BRAIN_STATE };
}

function loadState(userId: string): BrainState {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_BRAIN_STATE,
        ...parsed,
      };
    }
  } catch (e) {
    console.warn('[Brain] Failed to load state', e);
  }
  return getSeedBrainStateForUser(userId);
}

function saveState(userId: string, state: BrainState) {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(state));
  } catch (e) {
    console.warn('[Brain] Failed to save state', e);
  }
}

import { type Language } from '../services/i18n';

export const BrainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { appUser } = useAuth();
  const [brainState, setBrainState] = useState<BrainState>(DEFAULT_BRAIN_STATE);

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = typeof window !== 'undefined' ? (localStorage.getItem('t1ger_app_language') as Language) : null;
    if (saved === 'es' || saved === 'en') return saved;

    // Automatic Device / Browser Language Detection (Duolingo Style)
    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('es')) return 'es';
      if (browserLang.startsWith('en')) return 'en';
    }
    return 'es';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('t1ger_app_language', lang);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = language;
  }, [language]);

  const LOCAL_STORAGE_ID = 'anonymous_local_user';

  useEffect(() => {
    const uid = appUser?.uid || LOCAL_STORAGE_ID;
    const loaded = loadState(uid);
    // Keep persisted competency scores immutable on load. Decay is presented as
    // a derived value by applyDecay, avoiding a second permanent deduction on
    // every app launch.
    setBrainState(loaded);

    if (appUser?.uid && appUser.uid !== 'anonymous') {
      const fetchFromFirestore = async () => {
        try {
          const userRef = doc(db, 'users', appUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const cloudData = snap.data().brainState as BrainState;
            if (cloudData) {
              setBrainState(prev => {
                const merged = {
                  ...DEFAULT_BRAIN_STATE,
                  ...prev,
                  ...cloudData,
                  competencies: {
                    ...DEFAULT_BRAIN_STATE.competencies,
                    ...prev.competencies,
                    ...cloudData?.competencies,
                  },
                  dailyTacticalStatus: {
                    ...DEFAULT_BRAIN_STATE.dailyTacticalStatus,
                    ...prev.dailyTacticalStatus,
                    ...cloudData?.dailyTacticalStatus,
                  }
                };
                return merged;
              });
            }
          }
        } catch (err) {
          console.error("Failed to sync from Firestore", err);
        }
      };
      fetchFromFirestore();
    }
  }, [appUser?.uid]);

  useEffect(() => {
    const uid = appUser?.uid || LOCAL_STORAGE_ID;
    saveState(uid, brainState);

    if (appUser?.uid && appUser.uid !== 'anonymous') {
      const syncToFirestore = async () => {
        try {
          const userRef = doc(db, 'users', appUser.uid);
          const cleanBrainState = Object.fromEntries(
            Object.entries(brainState).filter(([_, v]) => v !== undefined)
          );
          await setDoc(userRef, { brainState: cleanBrainState }, { merge: true });
        } catch (err) {
          console.error("Failed to sync to Firestore", err);
        }
      };
      syncToFirestore();
    }
  }, [brainState, appUser?.uid]);

  // Ensure daily curriculum pipeline is built
  useEffect(() => {
    const pipeline = generateDailyPipeline(brainState);
    if (!brainState.dailyPipeline || 
        pipeline.date !== brainState.dailyPipeline.date || 
        pipeline.learnNodeId !== brainState.dailyPipeline.learnNodeId ||
        pipeline.applyNodeId !== brainState.dailyPipeline.applyNodeId ||
        pipeline.completedLearn !== brainState.dailyPipeline.completedLearn ||
        pipeline.completedApply !== brainState.dailyPipeline.completedApply) {
      setBrainState(prev => ({ ...prev, dailyPipeline: pipeline }));
    }
  }, [brainState.currentTrackId, brainState.completedDayIds, brainState.missionHistory, brainState.fsrsCards]);

  // Keep the legacy session consumers on the same durable curriculum position.
  useEffect(() => {
    const session = buildCurriculumSession(brainState);
    const current = brainState.dailySession;
    if (!current || current.date !== session.date ||
        current.missionIds.join('|') !== session.missionIds.join('|') ||
        current.completedIds.join('|') !== session.completedIds.join('|')) {
      setBrainState(prev => ({ ...prev, dailySession: session }));
    }
  }, [brainState.currentTrackId, brainState.completedDayIds, brainState.missionHistory, brainState.fsrsCards]);

  const competencies = useMemo(() => applyDecay(brainState), [brainState]);

  const getSessionMissions = useCallback((): BankMission[] => {
    // Legacy support for things still using this
    if (!brainState.dailySession) return [];
    return brainState.dailySession.missionIds
      .map(id => MISSION_BANK.find(m => m.id === id))
      .filter(Boolean) as BankMission[];
  }, [brainState.dailySession]);

  const getDailyPipelineMissions = useCallback(() => {
    if (!brainState.dailyPipeline) return { learnNode: null, applyNode: null, pipeline: null };
    
    const learnNode = brainState.dailyPipeline.learnNodeId ? MISSION_BANK.find(m => m.id === brainState.dailyPipeline?.learnNodeId) || null : null;
    const applyNode = brainState.dailyPipeline.applyNodeId ? MISSION_BANK.find(m => m.id === brainState.dailyPipeline?.applyNodeId) || null : null;
    
    return {
      pipeline: brainState.dailyPipeline,
      learnNode,
      applyNode
    };
  }, [brainState.dailyPipeline]);

  const completeMission = useCallback((missionId: string, score: number = 100) => {
    setBrainState(prev => processMissionResult(prev, missionId, true, score));
  }, []);

  const failMission = useCallback((missionId: string) => {
    setBrainState(prev => processMissionResult(prev, missionId, false, 0));
  }, []);

  const totalCompleted = useMemo(() => {
    return brainState.missionHistory.filter(r => r.completed).length;
  }, [brainState.missionHistory]);

  const dailyProgress = useMemo(() => {
    const session = brainState.dailySession;
    if (!session) return { completed: 0, total: 1 };
    return {
      completed: session.completedIds.length,
      total: session.missionIds.length,
    };
  }, [brainState.dailySession]);

  const topicProgress = useMemo(() => {
    return getTopicProgress(brainState);
  }, [brainState]);

  const completeHabit = useCallback(() => {
    setBrainState(prev => processTacticalResult(prev));
  }, []);

  const setDayType = useCallback((type: DayType) => {
    setBrainState(prev => setDayTypeHelper(prev, type));
  }, []);

  const addHabit = useCallback((label: string, icon?: string, recurrence?: 'daily' | 'weekdays' | 'weekly' | 'custom', recurrenceInterval?: number, recurrenceDayOfWeek?: number) => {
    setBrainState(prev => addTacticalTask(prev, label, 'habit', icon, recurrence, recurrenceInterval, recurrenceDayOfWeek));
  }, []);

  const addWorkTask = useCallback((label: string, icon?: string, recurrence?: 'daily' | 'weekdays' | 'weekly' | 'custom', recurrenceInterval?: number, recurrenceDayOfWeek?: number) => {
    setBrainState(prev => addTacticalTask(prev, label, 'work', icon, recurrence, recurrenceInterval, recurrenceDayOfWeek));
  }, []);

  const addLessonTask = useCallback((label: string, icon?: string, recurrence?: 'daily' | 'weekdays' | 'weekly' | 'custom', recurrenceInterval?: number, recurrenceDayOfWeek?: number) => {
    setBrainState(prev => addTacticalTask(prev, label, 'lesson', icon, recurrence, recurrenceInterval, recurrenceDayOfWeek));
  }, []);

  const removeTacticalTask = useCallback((id: string, type: 'habit' | 'work' | 'lesson') => {
    setBrainState(prev => removeTacticalTaskHelper(prev, id, type));
  }, []);

  const submitTacticalProof = useCallback((id: string, proofUrl?: string, proofText?: string, verified: boolean = true) => {
    setBrainState(prev => completeTacticalTask(prev, id, proofUrl, proofText, verified));
  }, []);

  const commitTactical = useCallback((habitIds: string[], workIds: string[], lessonIds: string[]) => {
    setBrainState(prev => commitDailyTactical(prev, habitIds, workIds, lessonIds));
  }, []);

  const selectTrack = useCallback((trackId: TrackType) => {
    setBrainState(prev => ({
      ...prev,
      currentTrackId: trackId
    }));
  }, []);

  const skipDaysForPlacement = useCallback((trackId: TrackType, targetLevelNumber: number) => {
    if (targetLevelNumber <= 1) return;

    setBrainState(prev => {
      const track = CURRICULUM_TRACKS[trackId] || CURRICULUM_TRACKS['investing'];
      const daysToSkip: string[] = [];

      for (const level of track.levels) {
        if (level.levelNumber < targetLevelNumber) {
          for (const day of level.days) {
            daysToSkip.push(day.dayId);
          }
        }
      }

      const uniqueCompleted = Array.from(new Set([...prev.completedDayIds, ...daysToSkip]));

      return {
        ...prev,
        currentTrackId: trackId,
        completedDayIds: uniqueCompleted
      };
    });
  }, []);

  const resetBrain = useCallback(() => {
    setBrainState(DEFAULT_BRAIN_STATE);
  }, []);

  const today = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());
  const dailyTacticalStatus = useMemo(() => {
    return brainState.dailyTacticalStatus[today] || ({ 
      dayType: 'normal' as DayType, 
      committedHabitIds: [] as string[], 
      committedWorkIds: [] as string[], 
      committedLessonIds: [] as string[],
      completedIds: [] as string[], 
      proofs: {} as Record<string, { url?: string; text?: string; verified?: boolean }>
    });
  }, [brainState.dailyTacticalStatus, today]);

  const pathData = useMemo(() => {
    return getCurrentPathData(brainState);
  }, [brainState]);

  const t1gerEmotion = useMemo(() => {
    return calculateT1gerEmotion(brainState);
  }, [brainState]);

  const petState = useMemo(() => {
    return calculatePetVitalsWithDecay(brainState.petState || DEFAULT_PET_STATE);
  }, [brainState.petState]);

  const feedPet = useCallback((nutritionAmount: number = 30) => {
    setBrainState(prev => {
      const current = calculatePetVitalsWithDecay(prev.petState || DEFAULT_PET_STATE);
      return {
        ...prev,
        petState: {
          ...current,
          hunger: Math.min(100, current.hunger + nutritionAmount),
          lastFedTimestamp: Date.now(),
        }
      };
    });
  }, []);

  const completeFocusSession = useCallback((minutes: number) => {
    setBrainState(prev => {
      const current = calculatePetVitalsWithDecay(prev.petState || DEFAULT_PET_STATE);
      const energyGain = Math.min(45, Math.floor(minutes * 0.8));
      return {
        ...prev,
        petState: {
          ...current,
          energy: Math.min(100, current.energy + energyGain),
          totalFocusMinutesToday: current.totalFocusMinutesToday + minutes,
          lastFocusTimestamp: Date.now(),
        }
      };
    });
  }, []);

  const petMascot = useCallback(() => {
    setBrainState(prev => {
      const current = calculatePetVitalsWithDecay(prev.petState || DEFAULT_PET_STATE);
      return {
        ...prev,
        petState: {
          ...current,
          timesPettedToday: current.timesPettedToday + 1,
          lastPetTimestamp: Date.now(),
        }
      };
    });
  }, []);

  const updatePetSettings = useCallback((screenTimeLimitMinutes: number, dailyXPGoal: number) => {
    setBrainState(prev => {
      const current = calculatePetVitalsWithDecay(prev.petState || DEFAULT_PET_STATE);
      return {
        ...prev,
        petState: {
          ...current,
          dailyScreenTimeLimitMinutes: screenTimeLimitMinutes,
          dailyXPGoal,
        }
      };
    });
  }, []);

  const value = useMemo(() => ({
    competencies,
    getSessionMissions,
    getDailyPipelineMissions,
    completeMission,
    failMission,
    brainState,
    totalCompleted,
    dailyProgress,
    topicProgress,
    currentTrackId: brainState.currentTrackId,
    selectTrack,
    skipDaysForPlacement,
    pathData,
    t1gerEmotion,
    learnStreak: brainState.learnStreak,
    tacticalStreak: brainState.tacticalStreak,
    completeHabit,
    customHabits: brainState.customHabits,
    customWorkTasks: brainState.customWorkTasks,
    customLessonTasks: brainState.customLessonTasks,
    dailyTacticalStatus,
    setDayType,
    addHabit,
    addWorkTask,
    addLessonTask,
    removeTacticalTask,
    submitTacticalProof,
    commitTactical,
    petState,
    feedPet,
    completeFocusSession,
    petMascot,
    updatePetSettings,
    language,
    setLanguage,
    resetBrain,
  }), [competencies, getSessionMissions, completeMission, failMission, brainState, totalCompleted, dailyProgress, topicProgress, pathData, completeHabit, dailyTacticalStatus, setDayType, addHabit, addWorkTask, addLessonTask, removeTacticalTask, submitTacticalProof, commitTactical, petState, feedPet, completeFocusSession, petMascot, updatePetSettings, selectTrack, skipDaysForPlacement, t1gerEmotion, resetBrain, language, setLanguage]);

  return (
    <BrainContext.Provider value={value}>
      {children}
    </BrainContext.Provider>
  );
};

export const useBrain = () => {
  const context = useContext(BrainContext);
  if (!context) throw new Error('useBrain must be used within BrainProvider');
  return context;
};
