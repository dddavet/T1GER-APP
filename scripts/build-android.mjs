import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { delimiter, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const windows = process.platform === 'win32';
const release = process.argv.includes('--release');
const skipWeb = process.argv.includes('--skip-web');
const javaHome = [process.env.JAVA_HOME, windows ? 'C:/Program Files/Android/Android Studio/jbr' : '']
  .find(value => value && existsSync(join(value, 'bin', windows ? 'java.exe' : 'java')));
const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT
  || (process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Android', 'Sdk') : '');
const env = {
  ...process.env,
  ...(javaHome ? { JAVA_HOME: javaHome } : {}),
  ...(sdk ? { ANDROID_HOME: sdk, ANDROID_SDK_ROOT: sdk } : {}),
  PATH: [javaHome && join(javaHome, 'bin'), process.env.PATH].filter(Boolean).join(delimiter),
};
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, env, stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

if (release && !existsSync(join(root, 'android', 'key.properties')) && ![
  'T1GER_ANDROID_KEYSTORE', 'T1GER_ANDROID_STORE_PASSWORD', 'T1GER_ANDROID_KEY_ALIAS', 'T1GER_ANDROID_KEY_PASSWORD',
].every(key => process.env[key])) {
  console.error('Release blocked: configure the existing Play upload key in android/key.properties or the four T1GER_ANDROID_* signing variables. No unsigned AAB will be presented as publishable.');
  process.exit(1);
}
if (!skipWeb) run(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), 'build', '--mode', 'production']);
run(process.execPath, [join(root, 'node_modules/@capacitor/cli/bin/capacitor'), 'sync', 'android']);
const config = JSON.parse(readFileSync(join(root, 'android/app/src/main/assets/capacitor.config.json'), 'utf8'));
if (config.server?.url || config.server?.cleartext === true) throw new Error('Release assets contain live-reload/HTTP configuration.');
const gradleArgs = ['--no-daemon', 'testDebugUnitTest', release ? 'bundleRelease' : 'assembleDebug'];
const android = join(root, 'android');
if (windows) {
  run('powershell.exe', ['-NoProfile', '-Command', `& './gradlew.bat' ${gradleArgs.join(' ')}; exit $LASTEXITCODE`], android);
} else {
  run('bash', [join(android, 'gradlew'), ...gradleArgs], android);
}
console.log(release
  ? 'Signed bundle: android/app/build/outputs/bundle/release/app-release.aab'
  : 'Debug APK: android/app/build/outputs/apk/debug/app-debug.apk (not a Play release).');
