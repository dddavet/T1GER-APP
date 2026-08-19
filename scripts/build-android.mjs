import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

console.log('🐅 [T1GER Android Pipeline] Starting automated build & sync...');

// 1. Build Vite Web Bundle
console.log('📦 1/4. Compiling Vite production web bundle...');
execSync('npm run build', { stdio: 'inherit' });

// 2. Capacitor Sync Android
console.log('🔄 2/4. Syncing web assets with Capacitor Android wrapper...');
execSync('npx cap sync android', { stdio: 'inherit' });

// 3. Android Resource Asset Generation & Sync
console.log('🎨 3/4. Updating Android launcher & notification mipmap resources...');
const publicAvatar = path.resolve('public/t1ger-app-icon.png');
const androidResDir = path.resolve('android/app/src/main/res');

if (fs.existsSync(publicAvatar) && fs.existsSync(androidResDir)) {
  const densities = ['mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'];
  densities.forEach((density) => {
    const targetDir = path.join(androidResDir, density);
    if (fs.existsSync(targetDir)) {
      fs.copyFileSync(publicAvatar, path.join(targetDir, 'ic_launcher.png'));
      fs.copyFileSync(publicAvatar, path.join(targetDir, 'ic_launcher_round.png'));
    }
  });
  console.log('✅ Android launcher mipmaps updated with official mascot!');
}

console.log('✨ 4/4. Pipeline finished! You can now run:\n👉 npx cap open android\n👉 or push to GitHub to trigger the automated Actions APK builder.');
