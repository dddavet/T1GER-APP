const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  
  // 1. Capture Dashboard with new HUD mascot icon
  await page.goto('http://127.0.0.1:3000/?previewApp=1');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/david/.gemini/antigravity/brain/151e3ebc-acde-499c-83d3-35ee92dbf449/hud_with_new_mascot_icon.png' });
  console.log('Saved hud_with_new_mascot_icon.png');

  // 2. Capture Coach chat with new mascot icon in messages
  await page.goto('http://127.0.0.1:3000/?previewApp=1&view=coach');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/david/.gemini/antigravity/brain/151e3ebc-acde-499c-83d3-35ee92dbf449/coach_with_new_mascot_icon.png' });
  console.log('Saved coach_with_new_mascot_icon.png');

  await browser.close();
})();
