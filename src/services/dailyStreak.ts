/** The display uses the same saved account timezone as server proof rewards. */
export function getDailyStreak(streak: number, lastDay?: string | null, now = Date.now(), timeZone?: string) {
  let formatter: Intl.DateTimeFormat;
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' };
  try { formatter = new Intl.DateTimeFormat('en-CA', { ...options, timeZone }); }
  catch { formatter = new Intl.DateTimeFormat('en-CA', { ...options, timeZone: 'UTC' }); }
  const parts = formatter.formatToParts(now);
  const part = (type: string) => parts.find(value => value.type === type)?.value || '';
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  const yesterday = new Date(Date.parse(`${today}T12:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
  const completedToday = lastDay === today;
  const count = completedToday || lastDay === yesterday ? Math.max(0, Math.floor(streak || 0)) : 0;
  return { today, completedToday, count, isAtRisk: count > 0 && !completedToday && Number(part('hour')) >= 20 };
}
