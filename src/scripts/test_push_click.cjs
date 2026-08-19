const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  
  await page.goto('http://127.0.0.1:3000/?previewApp=1');
  await page.waitForTimeout(1000);

  // Click Test Push Alert button
  await page.click('button:has-text("Test Push Alert"), button:has-text("Simular Notificación")');
  await page.waitForTimeout(3000);

  const outputPath = 'C:/Users/david/.gemini/antigravity/brain/151e3ebc-acde-499c-83d3-35ee92dbf449/android_push_popup_preview.png';
  await page.screenshot({ path: outputPath });
  console.log('Push notification popup screenshot saved to:', outputPath);

  await browser.close();
})();
