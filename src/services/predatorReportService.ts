import type { MissionRecord } from './brainService';
import { MISSION_BANK } from './missionBank';

export interface PredatorReport {
  userId: string;
  startDate: Date;
  endDate: Date;
  totalCompletedMissions: number;
  xpEarned: number;
  streakStatus: {
    currentStreak: number;
    activeDaysThisWeek: number;
  };
  byCategory: Record<string, number>;
  recentMissions: Array<{
    id: string;
    title: string;
    completedAt: Date;
    xpReward: number;
    category: string;
  }>;
}

/**
 * Builds the seven-day execution report from the same durable mission history
 * used by the learning engine. Keeping this local-first avoids a second cloud
 * query, works offline and guarantees the profile reflects the current device.
 */
export function generateWeeklyReport(
  userId: string,
  currentStreak: number,
  missionHistory: MissionRecord[],
): PredatorReport {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);

  const completed = missionHistory
    .filter(record => record.completed && record.timestamp >= startDate.getTime() && record.timestamp <= endDate.getTime())
    .sort((a, b) => b.timestamp - a.timestamp);

  const activeDays = new Set(completed.map(record => new Date(record.timestamp).toLocaleDateString('en-CA')));
  const byCategory: Record<string, number> = {};
  let xpEarned = 0;

  const recentMissions = completed.map(record => {
    const mission = MISSION_BANK.find(item => item.id === record.missionId);
    const category = mission?.competency || record.competency;
    const xpReward = mission?.xpReward || 0;
    byCategory[category] = (byCategory[category] || 0) + 1;
    xpEarned += xpReward;

    return {
      id: record.missionId,
      title: mission?.title || 'Misión completada',
      completedAt: new Date(record.timestamp),
      xpReward,
      category,
    };
  });

  return {
    userId,
    startDate,
    endDate,
    totalCompletedMissions: completed.length,
    xpEarned,
    streakStatus: {
      currentStreak,
      activeDaysThisWeek: activeDays.size,
    },
    byCategory,
    recentMissions,
  };
}
