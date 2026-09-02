import assert from 'node:assert/strict';
import { LeagueService } from '../src/services/leagueService';

assert.equal(LeagueService.getCurrentWeekId(new Date('2026-01-01T12:00:00Z')), '2026-W01');
assert.equal(LeagueService.getCurrentWeekId(new Date('2026-12-31T12:00:00Z')), '2026-W53');
assert.equal(LeagueService.getUserTier(0), 'bronze');
assert.equal(LeagueService.getUserTier(250), 'silver');
assert.equal(LeagueService.getUserTier(600), 'gold');
assert.equal(LeagueService.getUserTier(1200), 'platinum');
assert.equal(LeagueService.getUserTier(2500), 'diamond');
assert.equal(LeagueService.getUserTier(5000), 'obsidian');
assert.equal(LeagueService.normalizeTier('amber'), 'platinum');
assert.deepEqual(LeagueService.getZones(30), { promotionEnd: 5, demotionStart: 26 });
assert.deepEqual(LeagueService.getZones(8), { promotionEnd: 3, demotionStart: 7 });

const cohort = LeagueService.getCohortId('stable-user', 'gold', '2026-W34');
assert.equal(cohort, LeagueService.getCohortId('stable-user', 'gold', '2026-W34'));
assert.notEqual(cohort, LeagueService.getCohortId('stable-user', 'silver', '2026-W34'));

const remaining = LeagueService.getTimeRemaining(new Date('2026-08-24T12:00:00Z'));
assert.equal(remaining.days, 6);
assert.equal(remaining.hours, 12);
assert.equal(remaining.formatted, '6d 12h');

console.log('Social engine verification passed.');
