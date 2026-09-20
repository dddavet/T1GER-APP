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
  await page.screenshot({ path: `${outputDir}/${screenshotName}.png`, fullPage: true });
};

try {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.getByRole('button', { name: 'Start lesson 1', exact: true }).waitFor({ timeout: 60_000 });
  await page.getByTestId('course-domain-label').getByText('Investing', { exact: true }).waitFor();
  await page.getByLabel('Learning loop').getByText('Learn', { exact: true }).waitFor();
  await page.getByLabel('Learning loop').getByText('Apply', { exact: true }).waitFor();
  await page.getByLabel('Learning loop').getByText('Master', { exact: true }).waitFor();
  await page.screenshot({ path: `${outputDir}/learn.png`, fullPage: true });
  await page.getByTestId('course-picker-button').click();
  await page.getByRole('dialog', { name: 'Explore Domains & Paths' }).getByRole('button', { name: 'Investing', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Close domain catalog', exact: true }).click();
  await visitTab('Apply', 'Make it part of your life.', 'Start lesson 1', 'apply');
  await visitTab('Master', 'MASTER · SMART REVIEW', 'Make it part of your life.', 'master');
  if (await page.getByRole('button', { name: 'Compete', exact: true }).count()) throw new Error('Compete should not distract the V1 primary navigation.');
  await visitTab('Profile', 'Investing profile', 'MASTER · SMART REVIEW', 'profile');
  await page.getByRole('button').filter({ hasText: 'T1GER Plus' }).click();
  await page.getByRole('dialog').getByText('Keep learning for free', { exact: true }).waitFor();
  if (await page.getByRole('dialog').getByText('START MY 7-DAY FREE TRIAL', { exact: true }).count()) throw new Error('Unavailable checkout advertised a trial');
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  await visitTab('Learn', 'Start lesson 1', 'Investing profile', 'learn-return');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`Horizontal overflow at ${width}px`);
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

  console.log(JSON.stringify({ ok: true, results }, null, 2));
} finally {
  await browser.close();
}
