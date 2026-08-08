import { type BrainState, getLocalDateString } from './brainService';

export type T1gerEmotion = 'PREDATOR' | 'PROUD' | 'FERAL' | 'DISAPPOINTED' | 'RESTING';

/**
 * Global character state derived only from durable learning and action data.
 * Screen-specific behavior is resolved by mascotGuide.ts.
 */
export const calculateT1gerEmotion = (
  state: BrainState,
  currentHour: number = new Date().getHours(),
): T1gerEmotion => {
  const today = getLocalDateString();
  const latestRecordToday = state.missionHistory
    .filter(record => getLocalDateString(new Date(record.timestamp)) === today)
    .sort((a, b) => b.timestamp - a.timestamp)[0];

  // A successful retry immediately replaces the disappointed state.
  if (latestRecordToday && !latestRecordToday.completed) return 'DISAPPOINTED';

  const dailySessionComplete = Boolean(
    state.dailySession?.missionIds.length
    && state.dailySession.completedIds.length >= state.dailySession.missionIds.length,
  );
  const dailyLoopComplete = Boolean(
    state.dailyPipeline?.completedLearn && state.dailyPipeline?.completedApply,
  );

  if (currentHour >= 21 && !dailySessionComplete && !dailyLoopComplete) return 'FERAL';
  if (state.learnStreak >= 3 && state.tacticalStreak >= 3) return 'PREDATOR';
  if (dailyLoopComplete || state.learnStreak >= 7) return 'PROUD';
  return 'RESTING';
};
