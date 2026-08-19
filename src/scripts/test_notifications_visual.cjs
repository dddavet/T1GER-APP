const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  
  // 1. Capture HUD with Bell icon and badge
  await page.goto('http://127.0.0.1:3000/?previewApp=1');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:/Users/david/.gemini/antigravity/brain/151e3ebc-acde-499c-83d3-35ee92dbf449/hud_with_bell_notification.png' });
  console.log('Saved hud_with_bell_notification.png');

  // 2. Open Notification Center
  await page.click('button[aria-label="Notificaciones"], button[aria-label="Notifications"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/david/.gemini/antigravity/brain/151e3ebc-acde-499c-83d3-35ee92dbf449/notification_center_drawer.png' });
  console.log('Saved notification_center_drawer.png');

  // 3. Open Email Preview Modal
  await page.click('button:has-text("Previsualizar Emails Transaccionales"), button:has-text("Preview Transactional Emails")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/david/.gemini/antigravity/brain/151e3ebc-acde-499c-83d3-35ee92dbf449/email_preview_modal_view.png' });
  console.log('Saved email_preview_modal_view.png');

  await browser.close();
})();
