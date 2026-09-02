import { existsSync } from 'node:fs';
import { delimiter, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const candidates = [process.env.JAVA_HOME, 'C:/Program Files/Android/Android Studio/jbr'].filter(Boolean);
const javaHome = candidates.find(home => existsSync(join(home, 'bin', process.platform === 'win32' ? 'java.exe' : 'java')));
const env = { ...process.env, CI: 'true', FIREBASE_CLI_DISABLE_TELEMETRY: 'true' };
if (javaHome) {
  env.JAVA_HOME = javaHome;
  env.PATH = `${join(javaHome, 'bin')}${delimiter}${process.env.PATH}`;
}
const result = spawnSync(process.execPath, [
  resolve('node_modules/firebase-tools/lib/bin/firebase.js'), 'emulators:exec',
  '--only', 'auth,firestore,storage', '--project', 'demo-t1ger',
  `"${process.execPath}" scripts/verify-firestore-rules.mjs && "${process.execPath}" scripts/verify-functions.mjs`,
], { env, stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
