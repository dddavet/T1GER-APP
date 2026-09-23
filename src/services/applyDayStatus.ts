interface DatedApplyMission {
  status: string;
  updatedAt?: number;
  submission?: { createdAt: number };
}

const localDay = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

/** Historical wins must never be presented as today's completed Apply step. */
export function isApplyCompletedOnDate(mission: DatedApplyMission, date: Date = new Date()): boolean {
  if (mission.status !== 'verified' && mission.status !== 'completed') return false;
  const timestamp = mission.submission?.createdAt ?? mission.updatedAt;
  return typeof timestamp === 'number' && Number.isFinite(timestamp) && localDay(new Date(timestamp)) === localDay(date);
}
