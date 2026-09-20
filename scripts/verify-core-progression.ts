import assert from 'node:assert/strict';
import { getDailyStreak } from '../src/services/dailyStreak';
import {
  DEFAULT_BRAIN_STATE,
  getProgressMissionById,
  isApplyMissionId,
  processMissionResult,
} from '../src/services/brainService';
import { ALL_ATOMIC_LESSONS } from '../src/services/interactiveCurriculum';
import { getPathwayById } from '../src/services/curriculumCatalog';
import { readLearningArtifacts, saveLearningArtifact } from '../src/services/learningArtifactService';
import {
  DEFAULT_ONBOARDING_TOPIC,
  getOnboardingExperienceLevel,
  getOnboardingInitialPathwayId,
  getOnboardingTrack,
} from '../src/services/onboardingProfile';

const lesson = ALL_ATOMIC_LESSONS[0];
assert.ok(lesson, 'The interactive curriculum needs at least one lesson.');

const fieldMissionId = `field-${lesson.id}`;
assert.equal(getProgressMissionById(lesson.id)?.nodeType, 'learn');
assert.equal(getProgressMissionById(fieldMissionId)?.nodeType, 'apply');
assert.equal(isApplyMissionId(lesson.id), false);
assert.equal(isApplyMissionId(fieldMissionId), true);

const values = new Map<string, string>();
const storage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => { values.set(key, value); },
};
values.set('t1ger_learning_artifacts_artifact-test', JSON.stringify([{ lessonId: 'legacy', trackId: 'smart-money', title: 'Legacy', summary: 'Saved before v1', values: {}, createdAt: 1 }]));
assert.equal(readLearningArtifacts('artifact-test', storage).some(item => item.lessonId === 'legacy'), true, 'Legacy learning artifacts must remain readable.');
saveLearningArtifact('artifact-test', { lessonId: 'current', trackId: 'smart-money', title: 'Current', summary: 'Canonical', values: {}, createdAt: 2 }, storage);
assert.deepEqual(readLearningArtifacts('artifact-test', storage).map(item => item.lessonId).sort(), ['current', 'legacy'], 'Canonical and legacy artifacts must merge without data loss.');

const initialState = structuredClone(DEFAULT_BRAIN_STATE);
const afterLesson = processMissionResult(initialState, lesson.id, true, 100);
const afterProof = processMissionResult(afterLesson, fieldMissionId, true, 100);
const afterDuplicateProof = processMissionResult(afterProof, fieldMissionId, true, 100);

assert.equal(afterLesson.missionHistory.some((record) => record.missionId === lesson.id && record.completed), true);
assert.equal(afterLesson.learnStreak, 0, 'A quiz without execution must not secure the daily streak.');
assert.equal(afterLesson.lastLearnDate, null);
assert.equal(afterLesson.petState.todayXPEarned || 0, 0, 'A quiz must not feed or rescue the pet.');
assert.equal(afterProof.missionHistory.some((record) => record.missionId === fieldMissionId && record.completed), true);
assert.equal(afterDuplicateProof.missionHistory.length, afterProof.missionHistory.length, 'Proof rewards must be idempotent.');
assert.equal(afterProof.learnStreak, 1, 'Learn + proof on the same day should secure one daily streak.');

assert.equal(getOnboardingTrack('finance'), 'investing');
assert.equal(getOnboardingTrack('tech'), 'ai');
assert.equal(getOnboardingTrack('skills'), 'business');
assert.equal(DEFAULT_ONBOARDING_TOPIC, 'investing', 'New learners should begin on the flagship Investing path.');
assert.equal(getOnboardingTrack(DEFAULT_ONBOARDING_TOPIC), 'investing');
assert.equal(getOnboardingInitialPathwayId(DEFAULT_ONBOARDING_TOPIC), 'biz-capital');
assert.equal(getOnboardingInitialPathwayId('technology'), 'tech-ai');
assert.equal(getOnboardingInitialPathwayId('mindset'), 'psych-biases');
assert.equal(getPathwayById('biz-capital')?.domainId, 'investing', 'The flagship path must be presented as Investing, not Business.');
assert.deepEqual(
  ['zero', 'basic', 'intermediate', 'competent', 'advanced'].map((level) =>
    getOnboardingExperienceLevel(level as Parameters<typeof getOnboardingExperienceLevel>[0]),
  ),
  [1, 2, 3, 4, 5],
);

assert.equal(getDailyStreak(5, '2026-03-07', Date.parse('2026-03-09T03:30:00Z'), 'America/New_York').isAtRisk, true);
assert.equal(getDailyStreak(5, '2026-03-07', Date.parse('2026-03-09T04:01:00Z'), 'America/New_York').count, 0);
assert.equal(getDailyStreak(5, '2026-03-08', Date.parse('2026-03-09T03:30:00Z'), 'America/New_York').completedToday, true);
assert.equal(getDailyStreak(5, null).count, 0);
console.log('Core progression verified: onboarding mapping, Learn → proof gating, streak expiry/timezones, and idempotency.');
