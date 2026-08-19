const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  
  // 1. Capture Profile -> Recordatorios -> Soft Prompt Permission Modal
  await page.goto('http://127.0.0.1:3000/?previewApp=1&view=profile');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Recordatorios"), button:has-text("Reminders")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/david/.gemini/antigravity/brain/151e3ebc-acde-499c-83d3-35ee92dbf449/notification_permission_soft_prompt.png' });
  console.log('Saved notification_permission_soft_prompt.png');

  // 2. Capture Notification Center with categories & email actions
  await page.goto('http://127.0.0.1:3000/?previewApp=1');
  await page.waitForTimeout(1000);
  await page.click('button[aria-label="Notificaciones"], button[aria-label="Notifications"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/david/.gemini/antigravity/brain/151e3ebc-acde-499c-83d3-35ee92dbf449/notification_hub_view.png' });
  console.log('Saved notification_hub_view.png');

  await browser.close();
})();
