import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { getInteractiveTrack } from '../src/services/interactiveCurriculum';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const errors: string[] = [];
page.on('pageerror', error => errors.push(error.message));
await page.addInitScript(() => {
  if (localStorage.getItem('apply-e2e-initialized')) return;
  localStorage.setItem('apply-e2e-initialized', 'true');
  localStorage.setItem('t1ger_onboarding_completed', 'true');
  localStorage.setItem('t1ger_app_language', 'en');
  localStorage.setItem('t1ger_local_app_user', JSON.stringify({ uid: 'apply-e2e', email: '', displayName: 'Apply Test', primaryTrack: 'investing', niche: 'investing', dailyTime: 10, learningStyle: 'interactive', onboardingComplete: true, onboardingStep: 'complete', level: 1, xp: 100, verifiedXP: 0, coins: 50, streak: 0, isPro: false }));
});
try {
  await page.goto('http://127.0.0.1:3000/?previewApp=1&view=learn');
  await page.getByRole('heading', { name: 'Invest in your judgment.' }).waitFor({ timeout: 90000 });
  let count = 0;
  for (const lesson of getInteractiveTrack('smart-money').lessons) {
    await page.getByRole('button', { name: 'Start lesson', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Open Orb', exact: true }).click();
    await dialog.getByRole('heading', { name: lesson.phases[0].title.en, exact: true }).waitFor();
    await dialog.getByRole('button', { name: 'Build the model', exact: true }).click();
    await dialog.getByText('MENTAL MODEL', { exact: true }).waitFor();
    await dialog.getByRole('button', { name: 'Test my judgment', exact: true }).click();
    await dialog.getByRole('heading', { name: lesson.phases[1].title.en, exact: true }).waitFor();
    const challenge = lesson.phases[1].challenge;
    if (challenge.kind === 'matching') {
      for (const pair of challenge.pairs || []) await dialog.getByLabel(pair.left.en).selectOption(pair.id);
    } else if (challenge.kind === 'ordering') {
      const order = [...challenge.options!].reverse().map(item => item.id);
      for (const [position, id] of challenge.orderedIds!.entries()) {
        let current = order.indexOf(id);
        while (current > position) {
          await dialog.getByRole('button', { name: 'Move up', exact: true }).nth(current).click();
          [order[current], order[current - 1]] = [order[current - 1], order[current]];
          current--;
        }
      }
    } else await dialog.getByRole('button').filter({ hasText: challenge.options!.find(option => option.correct)!.label.en }).click();
    await dialog.getByRole('button', { name: 'Check decision', exact: true }).click();
    await dialog.getByRole('button', { name: 'Continue', exact: true }).click();
    await dialog.getByRole('button', { name: lesson.phases[2].widget.commitLabel.en, exact: true }).click();
    await dialog.getByRole('button', { name: 'Create Field Mission', exact: true }).click();
    await dialog.getByRole('button', { name: 'Go to my action', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'I completed the action', exact: true }).click();
    await page.getByRole('heading', { name: 'You put it into practice.' }).waitFor();
    await page.getByRole('button', { name: 'Back to my journey', exact: true }).click();
    count++;
    assert.equal(await page.getByRole('progressbar', { name: 'Investing progress' }).getAttribute('value'), String(count));
  }
  await page.reload();
  await page.getByRole('heading', { name: 'Your foundation is built.' }).waitFor();
  await page.getByText('1060 XP personal', { exact: true }).waitFor();
  assert.equal(await page.locator('[aria-label="0 verified XP"]').count(), 1, 'Self-reported progress never reaches the verified XP counter.');
  assert.equal(await page.getByRole('progressbar', { name: 'Investing progress' }).getAttribute('value'), '5');
  await page.screenshot({ path: 'test-results/app-shell/journey-completed.png', fullPage: true });
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await page.getByRole('button', { name: 'Wins', exact: true }).click();
  await page.getByRole('heading', { name: '5 completed actions' }).waitFor();
  assert.equal(await page.getByText('Completed · self-reported', { exact: true }).count(), 5);
  await page.screenshot({ path: 'test-results/app-shell/apply-wins.png', fullPage: true });
  assert.deepEqual(errors, [], 'No runtime errors in the complete learning/apply flow.');
  console.log('PASS: five Investing lessons → optional empty reflection → personal reward → next node → reload → five preserved wins.');
} finally { await browser.close(); }
