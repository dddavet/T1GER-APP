import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.T1GER_TEST_URL || 'http://127.0.0.1:3000/?previewApp=1&view=learn';
const outputDir = 'test-results/app-shell';
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const runtimeErrors = [];
page.on('pageerror', error => runtimeErrors.push(error.message));

await page.addInitScript(() => {
  localStorage.setItem('t1ger_onboarding_completed', 'true');
  localStorage.setItem('t1ger_app_language', 'en');
  localStorage.setItem('t1ger_local_app_user', JSON.stringify({
    uid: 'shell-smoke-user', email: '', displayName: 'Smoke Tester', niche: 'investing',
    primaryTrack: 'investing', dailyTime: 10, learningStyle: 'interactive',
    onboardingComplete: true, onboardingStep: 'complete', level: 1, xp: 100,
    verifiedXP: 0, coins: 50, streak: 0, isPro: false,
  }));
});

const results = [];
const visitTab = async (buttonName, expectedText, forbiddenText, screenshotName) => {
  const started = performance.now();
  await page.getByRole('button', { name: buttonName, exact: true }).click();
  await page.getByText(expectedText, { exact: false }).first().waitFor({ state: 'visible', timeout: 10_000 });
  const bodyText = await page.locator('body').innerText();
  if (forbiddenText && bodyText.includes(forbiddenText)) {
    throw new Error(`${buttonName} retained stale content: ${forbiddenText}`);
  }
  const durationMs = Math.round(performance.now() - started);
  results.push({ tab: buttonName, durationMs });
  if (buttonName === 'Profile') {
    await page.getByText('Account and experience', { exact: false }).first().waitFor({ state: 'visible' });
  }
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${outputDir}/${screenshotName}.png`, fullPage: true });
};

try {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.getByRole('button', { name: 'Start lesson 1', exact: true }).waitFor({ timeout: 60_000 });
  await page.waitForFunction(() => [...document.images].some(image =>
    image.getAttribute('src') === '/mascot/t1ger-avatar.png' && image.complete && image.naturalWidth > 0
  ));
  await page.getByTestId('course-domain-label').getByText('Investing', { exact: true }).waitFor();
  await page.getByLabel('Learning loop').getByText('Learn', { exact: true }).waitFor();
  await page.getByLabel('Learning loop').getByText('Apply', { exact: true }).waitFor();
  await page.getByLabel('Learning loop').getByText('Master', { exact: true }).waitFor();
  await page.screenshot({ path: `${outputDir}/learn.png`, fullPage: true });
  await page.getByRole('button', { name: 'View Streak' }).click();
  await page.getByRole('dialog', { name: 'Your streak' }).getByRole('heading', { name: 'Start with one real action.' }).waitFor();
  await page.getByRole('dialog', { name: 'Your streak' }).getByRole('button', { name: 'Go to Learn' }).waitFor();
  if (await page.getByRole('dialog', { name: 'Your streak' }).getByText('Community Streak').count()) throw new Error('Streak page still exposes placeholder community content.');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outputDir}/streak-after.png`, fullPage: true });
  await page.getByRole('button', { name: 'Close streak' }).click();
  await page.getByTestId('course-picker-button').click();
  await page.getByRole('dialog', { name: 'Explore Domains & Paths' }).getByRole('button', { name: 'Investing', exact: true }).waitFor();
  await page.screenshot({ path: `${outputDir}/discover.png`, fullPage: true });
  await page.getByRole('button', { name: 'Close domain catalog', exact: true }).click();
  await visitTab('Apply', 'Make it part of your life.', 'Start lesson 1', 'apply');
  await visitTab('Master', 'Make it stick.', 'Start lesson 1', 'master');
  await page.getByText('Memory is current', { exact: true }).waitFor();
  if (await page.getByRole('button', { name: 'Compete', exact: true }).count()) throw new Error('Compete should not distract the V1 primary navigation.');
  await visitTab('Profile', 'Investing profile', 'Make it stick.', 'profile');
  await page.getByRole('button').filter({ hasText: 'T1GER Plus' }).click();
  await page.getByRole('dialog').getByText('Keep learning for free', { exact: true }).waitFor();
  if (await page.getByRole('dialog').getByText('START MY 7-DAY FREE TRIAL', { exact: true }).count()) throw new Error('Unavailable checkout advertised a trial');
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  await visitTab('Learn', 'Start lesson 1', 'Investing profile', 'learn-return');
  for (const { width, height } of [
    { width: 320, height: 720 },
    { width: 360, height: 800 },
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 393, height: 852 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
  ]) {
    await page.setViewportSize({ width, height });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`Horizontal overflow at ${width}x${height}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  if (runtimeErrors.length) throw new Error(`Runtime errors: ${runtimeErrors.join(' | ')}`);

  const onboarding = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await onboarding.addInitScript(() => {
    localStorage.removeItem('t1ger_onboarding_draft_v2');
    localStorage.removeItem('t1ger_onboarding_completed');
    localStorage.setItem('t1ger_app_language', 'en');
  });
  await onboarding.goto('http://127.0.0.1:3000/?forceOnboarding=1', { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await onboarding.getByRole('button', { name: 'GET STARTED', exact: true }).waitFor({ timeout: 60_000 });
  await onboarding.screenshot({ path: `${outputDir}/onboarding.png`, fullPage: true });
  await onboarding.getByRole('button', { name: 'GET STARTED', exact: true }).click();
  const investingChoice = onboarding.getByRole('button', { name: /Investing & Markets/ });
  await investingChoice.waitFor({ state: 'visible', timeout: 60_000 });
  if (await investingChoice.getAttribute('aria-pressed') !== 'true') {
    throw new Error('New onboarding did not select the flagship Investing path by default.');
  }
  await onboarding.getByText('Build sound financial judgment with practical, evidence-based lessons.', { exact: true }).waitFor();
  await onboarding.getByRole('button', { name: 'CONTINUE', exact: true }).click();
  await onboarding.getByRole('button', { name: "I'm new to this topic", exact: true }).click();
  await onboarding.getByRole('button', { name: 'CONTINUE', exact: true }).click();
  await onboarding.getByRole('heading', { name: 'How much time can you protect each day?', exact: true }).waitFor();
  await onboarding.getByRole('button', { name: 'CONTINUE', exact: true }).click();
  await onboarding.getByRole('button', { name: /Contribute regularly and reinvest returns/ }).click();
  await onboarding.getByRole('button', { name: 'CHECK', exact: true }).click();
  await onboarding.getByRole('button', { name: 'CONTINUE', exact: true }).click();
  await onboarding.getByRole('heading', { name: '+100 XP', exact: true }).waitFor();
  await onboarding.getByRole('button', { name: 'SAVE PROGRESS', exact: true }).waitFor();
  await onboarding.close();

  for (const [preset, heading] of [
    ['active', 'Your streak is safe today.'],
    ['at_risk', 'One action before midnight.'],
  ]) {
    const streakPage = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await streakPage.addInitScript((state) => {
      localStorage.setItem('t1ger_onboarding_completed', 'true');
      localStorage.setItem('t1ger_app_language', 'en');
      localStorage.setItem('t1ger_dev_harness_v1', JSON.stringify({ screenTime: 'auto', streak: state, entitlement: 'real' }));
      localStorage.setItem('t1ger_local_app_user', JSON.stringify({ uid: `streak-${state}`, email: '', displayName: 'Streak Tester', primaryTrack: 'investing', niche: 'investing', dailyTime: 10, learningStyle: 'interactive', onboardingComplete: true, onboardingStep: 'complete', level: 1, xp: 0, verifiedXP: 0, coins: 0, streak: 0, isPro: false }));
    }, preset);
    await streakPage.goto('http://127.0.0.1:3000/?previewApp=1&view=learn&devHarness=1');
    await streakPage.getByRole('button', { name: /streak/i }).first().click();
    await streakPage.getByRole('dialog', { name: 'Your streak' }).getByRole('heading', { name: heading }).waitFor();
    await streakPage.waitForTimeout(400);
    await streakPage.screenshot({ path: `${outputDir}/streak-${preset}.png`, fullPage: true });
    await streakPage.close();
  }

  const spanishStreak = await browser.newPage({ viewport: { width: 320, height: 720 }, reducedMotion: 'reduce' });
  await spanishStreak.addInitScript(() => {
    localStorage.setItem('t1ger_onboarding_completed', 'true');
    localStorage.setItem('t1ger_app_language', 'es');
    localStorage.setItem('t1ger_local_app_user', JSON.stringify({ uid: 'streak-es', email: '', displayName: 'Prueba', primaryTrack: 'investing', niche: 'investing', dailyTime: 10, learningStyle: 'interactive', onboardingComplete: true, onboardingStep: 'complete', level: 1, xp: 0, verifiedXP: 0, coins: 0, streak: 0, isPro: false }));
  });
  await spanishStreak.goto('http://127.0.0.1:3000/?previewApp=1&view=learn');
  await spanishStreak.getByRole('button', { name: /Ver racha/ }).click();
  await spanishStreak.getByRole('dialog', { name: 'Tu racha' }).getByRole('heading', { name: 'Empieza con una acción real.' }).waitFor();
  if (await spanishStreak.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Streak page overflows at 320px in Spanish.');
  await spanishStreak.waitForTimeout(500);
  await spanishStreak.screenshot({ path: `${outputDir}/streak-es-320.png`, fullPage: true });
  await spanishStreak.close();

  console.log(JSON.stringify({ ok: true, results }, null, 2));
} finally {
  await browser.close();
}
