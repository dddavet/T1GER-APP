import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { DEFAULT_BRAIN_STATE, processMissionResult, processMissionReview } from '../src/services/brainService';
import { buildMasterySnapshot } from '../src/services/masteryService';

const now = new Date('2026-09-20T15:00:00.000Z');
let brain = structuredClone(DEFAULT_BRAIN_STATE);

brain = processMissionResult(brain, 'learn-money-01', true, 62);
brain = processMissionResult(brain, 'learn-money-02', true, 96);
brain.missionHistory = brain.missionHistory.map((record, index) => ({
  ...record,
  timestamp: now.getTime() - ((2 - index) * 60_000),
}));
brain.fsrsCards['learn-money-01'].due = new Date(now.getTime() - 60_000);
brain.fsrsCards['learn-money-02'].due = new Date(now.getTime() + 86_400_000);

const snapshot = buildMasterySnapshot(brain, now);
assert.equal(snapshot.learnedCount, 2, 'Only completed learning concepts belong in Master.');
assert.deepEqual(snapshot.due.map((item) => item.lesson.id), ['learn-money-01'], 'The due queue must use real FSRS due dates.');
assert.equal(snapshot.recent[0]?.lesson.id, 'learn-money-02', 'Recently learned concepts must be ordered by real completion time.');
assert.deepEqual(snapshot.weak.map((item) => item.lesson.id), ['learn-money-01'], 'Weak concepts must come from real low scores.');
assert.equal(snapshot.isCaughtUp, false);
assert.equal(snapshot.strength.total, 2, 'Knowledge strength must describe scheduled FSRS cards, not fabricated metrics.');

brain.fsrsCards['learn-money-01'].due = new Date(now.getTime() + 172_800_000);
const caughtUp = buildMasterySnapshot(brain, now);
assert.equal(caughtUp.due.length, 0);
assert.equal(caughtUp.isCaughtUp, true, 'A learner with no due cards must receive the caught-up state.');

const strengthened = processMissionReview(brain, 'learn-money-01', 100);
assert.equal(buildMasterySnapshot(strengthened, now).weak.length, 0, 'A successful recall must not leave a stale weak label from the original quiz score.');

console.log('Master experience: real FSRS queue, recency, weakness and caught-up states passed.');

const runtimeBrain = structuredClone(brain);
runtimeBrain.fsrsCards['learn-money-01'].due = new Date(Date.now() - 120_000);
runtimeBrain.fsrsCards['learn-money-02'].due = new Date(Date.now() - 60_000);
const browser = await chromium.launch({ headless: true });
await mkdir('test-results/app-shell', { recursive: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const runtimeErrors: string[] = [];
page.on('pageerror', (error) => runtimeErrors.push(error.message));
await page.addInitScript((state) => {
  localStorage.setItem('t1ger_onboarding_completed', 'true');
  localStorage.setItem('t1ger_app_language', 'en');
  localStorage.setItem('t1ger_local_app_user', JSON.stringify({
    uid: 'master-e2e', email: '', displayName: 'Master Test', primaryTrack: 'investing',
    niche: 'investing', dailyTime: 10, learningStyle: 'interactive', onboardingComplete: true,
    onboardingStep: 'complete', level: 1, xp: 0, verifiedXP: 0, coins: 0, streak: 0, isPro: false,
    unlockedAchievements: ['first_blood'],
  }));
  localStorage.setItem('tiger_brain_state_v3_master-e2e', JSON.stringify(state));
}, runtimeBrain);

try {
  await page.goto('http://127.0.0.1:3000/?previewApp=1&view=master', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Review 2 now' }).waitFor();
  await page.screenshot({ path: 'test-results/app-shell/master-due.png', fullPage: true });
  await page.getByRole('button', { name: 'Review 2 now' }).click();
  const review = page.getByRole('dialog', { name: 'Active review' });
  await review.getByRole('button', { name: 'Reveal answer' }).click();
  await review.getByRole('button', { name: /Good/ }).click();
  await review.getByText('2/2', { exact: false }).waitFor();
  await review.getByRole('button', { name: 'Reveal answer' }).click();
  await review.getByRole('button', { name: /Easy/ }).click();
  await page.getByRole('dialog', { name: 'Review complete' }).getByRole('heading', { name: 'Review complete' }).waitFor();
  await page.getByRole('button', { name: 'Back to Master' }).click();
  await page.getByText('Memory is current', { exact: true }).waitFor();
  await page.screenshot({ path: 'test-results/app-shell/master-caught-up.png', fullPage: true });
  assert.deepEqual(runtimeErrors, [], 'Master must not throw in a real browser session.');
  console.log('Master browser flow: due → recall → rating → next card → complete → caught up passed.');
} finally {
  await browser.close();
}
