// ============================================================
// T1GER BRAIN CONTEXT v3
// ============================================================
// Wraps the curriculum-based Brain logic.
// ============================================================

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  type BrainState,
  type CompetencyProfile,
  type TopicProgress,
  type NicheType,
  DEFAULT_BRAIN_STATE,
  processMissionResult,
  applyDecay,
  buildCurriculumSession,
  getTopicProgress,
  getCurrentPathData,
  processTacticalResult,
} from '../services/brainService';
import { type BankMission, type TrackType, MISSION_BANK } from '../services/missionBank';

interface BrainContextType {
  competencies: CompetencyProfile;
  /** Get the current active Session missions based on Curriculum placement */
  getSessionMissions: () => BankMission[];
  /** Report a mission as completed */
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
  pathData: ReturnType<typeof getCurrentPathData>;

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
  addHabit: (label: string, icon?: string) => void;
  addWorkTask: (label: string, icon?: string) => void;
  addLessonTask: (label: string, icon?: string) => void;
  removeTacticalTask: (id: string, type: 'habit' | 'work' | 'lesson') => void;
  submitTacticalProof: (id: string, proofUrl?: string, proofText?: string, verified?: boolean) => void;
  commitTactical: (habitIds: string[], workIds: string[], lessonIds: string[]) => void;
}

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

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

const BrainContext = createContext<BrainContextType | undefined>(undefined);

const STORAGE_KEY = 'tiger_brain_state_v3';

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
  return { ...DEFAULT_BRAIN_STATE };
}

function saveState(userId: string, state: BrainState) {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(state));
  } catch (e) {
    console.warn('[Brain] Failed to save state', e);
  }
}

export const BrainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { appUser } = useAuth();
  const [brainState, setBrainState] = useState<BrainState>(DEFAULT_BRAIN_STATE);

  const LOCAL_STORAGE_ID = 'anonymous_local_user';

  useEffect(() => {
    const uid = appUser?.uid || LOCAL_STORAGE_ID;
    const loaded = loadState(uid);
    setBrainState(loaded);

    if (appUser?.uid && appUser.uid !== 'anonymous') {
      // Sync from Firestore if logged in
      const fetchFromFirestore = async () => {
        try {
          const userRef = doc(db, 'users', appUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const cloudData = snap.data().brainState as BrainState;
            if (cloudData) {
              setBrainState(prev => ({
                ...prev,
                ...cloudData,
                // Preserve critical local-only or newer session data if needed
              }));
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
          await updateDoc(userRef, { brainState });
        } catch (err) {
          console.error("Failed to sync to Firestore", err);
        }
      };
      // Debounce this in a real app, but for now we'll do it on change
      syncToFirestore();
    }
  }, [brainState, appUser?.uid]);

  // Ensure daily curriculum session is built
  useEffect(() => {
    const session = buildCurriculumSession(brainState);
    if (!brainState.dailySession || session.date !== brainState.dailySession.date || session.missionIds.join(',') !== brainState.dailySession.missionIds.join(',')) {
      setBrainState(prev => ({ ...prev, dailySession: session }));
    }
  }, [brainState.currentTrackId, brainState.completedDayIds, brainState.missionHistory]);

  const competencies = useMemo(() => applyDecay(brainState), [brainState]);

  const getSessionMissions = useCallback((): BankMission[] => {
    if (!brainState.dailySession) return [];
    return brainState.dailySession.missionIds
      .map(id => MISSION_BANK.find(m => m.id === id))
      .filter(Boolean) as BankMission[];
  }, [brainState.dailySession]);

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

  const addHabit = useCallback((label: string, icon?: string) => {
    setBrainState(prev => addTacticalTask(prev, label, 'habit', icon));
  }, []);

  const addWorkTask = useCallback((label: string, icon?: string) => {
    setBrainState(prev => addTacticalTask(prev, label, 'work', icon));
  }, []);

  const addLessonTask = useCallback((label: string, icon?: string) => {
    setBrainState(prev => addTacticalTask(prev, label, 'lesson', icon));
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

  const today = new Date().toISOString().split('T')[0];
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

  const value = useMemo(() => ({
    competencies,
    getSessionMissions,
    completeMission,
    failMission,
    brainState,
    totalCompleted,
    dailyProgress,
    topicProgress,
    currentTrackId: brainState.currentTrackId,
    pathData,
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
  }), [competencies, getSessionMissions, completeMission, failMission, brainState, totalCompleted, dailyProgress, topicProgress, pathData, completeHabit, dailyTacticalStatus, setDayType, addHabit, addWorkTask, addLessonTask, removeTacticalTask, submitTacticalProof, commitTactical]);

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
