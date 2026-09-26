import assert from 'node:assert/strict';
import { AndroidScreenTimeService, TRACKED_SOCIAL_APPS, calculateOpportunityCost } from '../src/services/androidScreenTimeService';

const fourHourDay = calculateOpportunityCost(240, 10);

assert.equal(fourHourDay.totalHours, 4);
assert.equal(fourHourDay.awakeLifePercent, 25);
assert.equal(fourHourDay.daysLostPerYear, 60.8);
assert.equal(fourHourDay.annualHoursLost, 1460);
assert.equal(fourHourDay.booksEquivalentYear, 365);
assert.equal(fourHourDay.estimatedLossUSD, 40);
assert.equal(fourHourDay.annualOpportunityUSD, 14600);
assert.ok(fourHourDay.compound10YearsUSD > fourHourDay.annualOpportunityUSD * 10);

const clamped = calculateOpportunityCost(-30, 0);
assert.equal(clamped.totalMinutes, 0);
assert.equal(clamped.hourlyWage, 1);

const storage = new Map<string, string>();
Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => { storage.set(key, value); },
  removeItem: (key: string) => { storage.delete(key); },
} });

storage.set('t1ger_screen_time_hours', '5');
assert.equal(AndroidScreenTimeService.getReport().dataSource, 'unconfigured', 'historic onboarding estimates must not masquerade as last-24h usage');

const savedAt = Date.now();
AndroidScreenTimeService.saveManualUsage([{ ...TRACKED_SOCIAL_APPS[0], minutes: 120 }], 10);
assert.equal(AndroidScreenTimeService.getReport().totalMinutes, 120);
const originalNow = Date.now;
try {
  Date.now = () => savedAt + 25 * 60 * 60 * 1000;
  assert.equal(AndroidScreenTimeService.getReport().dataSource, 'unconfigured', 'manual last-24h usage must expire');
} finally {
  Date.now = originalNow;
}

AndroidScreenTimeService.saveManualUsage([{ ...TRACKED_SOCIAL_APPS[0], minutes: 0 }], 10);
assert.equal(AndroidScreenTimeService.getReport().dataSource, 'manual', 'an intentional zero-minute estimate is still configured');

console.log('Opportunity-cost engine verified.');
