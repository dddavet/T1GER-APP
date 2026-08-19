const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  
  await page.goto('http://127.0.0.1:3000/?previewApp=1&view=profile');
  await page.waitForTimeout(1000);

  // Click Recordatorios row
  await page.click('button:has-text("Recordatorios"), button:has-text("Reminders")');
  await page.waitForTimeout(1000);

  const outputPath = 'C:/Users/david/.gemini/antigravity/brain/151e3ebc-acde-499c-83d3-35ee92dbf449/notification_permission_modal_view.png';
  await page.screenshot({ path: outputPath });
  console.log('Saved notification_permission_modal_view.png');

  await browser.close();
})();
