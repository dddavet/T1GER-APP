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
  await page.getByText('ACTIVE PATH', { exact: true }).waitFor({ timeout: 60_000 });
  await page.screenshot({ path: `${outputDir}/learn.png`, fullPage: true });
  await visitTab('Apply', 'What you build counts.', 'ACTIVE PATH', 'apply');
  await visitTab('Compete', 'Discipline is visible.', 'What you build counts.', 'compete');
  await visitTab('Profile', 'Investing profile', 'Discipline is visible.', 'profile');
  await visitTab('Learn', 'ACTIVE PATH', 'Investing profile', 'learn-return');
  if (runtimeErrors.length) throw new Error(`Runtime errors: ${runtimeErrors.join(' | ')}`);
  console.log(JSON.stringify({ ok: true, results }, null, 2));
} finally {
  await browser.close();
}
