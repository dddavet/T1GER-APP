import assert from 'node:assert/strict';
import { calculateOpportunityCost } from '../src/services/androidScreenTimeService';

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

console.log('Opportunity-cost engine verified.');
