import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const androidDir = join(root, 'android');
const keyPropertiesPath = join(androidDir, 'key.properties');
const keystorePath = join(androidDir, 't1ger-release.jks');

if (existsSync(keyPropertiesPath) && existsSync(keystorePath)) {
  console.log('Release signing is already configured: android/key.properties and android/t1ger-release.jks exist.');
  process.exit(0);
}

// Find keytool executable
const windows = process.platform === 'win32';
const candidates = [
  process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', windows ? 'keytool.exe' : 'keytool') : '',
  windows ? 'C:/Program Files/Android/Android Studio/jbr/bin/keytool.exe' : '',
  windows ? 'C:/Program Files/Java/jdk-21/bin/keytool.exe' : '',
  windows ? 'C:/Program Files/Java/jdk-17/bin/keytool.exe' : '',
].filter(Boolean);

const keytool = candidates.find(path => existsSync(path));
if (!keytool) {
  console.error('Could not locate keytool. Ensure Android Studio or JDK is installed.');
  process.exit(1);
}

// Generate secure random passwords
const storePassword = crypto.randomBytes(16).toString('hex');
const keyPassword = storePassword;
const alias = 't1ger_release_key';

console.log('Generating release upload keystore at:', keystorePath);

if (!existsSync(keystorePath)) {
  execFileSync(keytool, [
    '-genkeypair',
    '-v',
    '-keystore', keystorePath,
    '-alias', alias,
    '-keyalg', 'RSA',
    '-keysize', '2048',
    '-validity', '10000',
    '-storepass', storePassword,
    '-keypass', keyPassword,
    '-dname', 'CN=T1GER Mobile, OU=Engineering, O=T1GER APP, L=Madrid, ST=Madrid, C=ES'
  ], { stdio: 'inherit' });
}

const keyPropertiesContent = [
  `storeFile=t1ger-release.jks`,
  `storePassword=${storePassword}`,
  `keyAlias=${alias}`,
  `keyPassword=${keyPassword}`,
].join('\n') + '\n';

writeFileSync(keyPropertiesPath, keyPropertiesContent, 'utf8');
console.log('Successfully generated android/key.properties');

// Print SHA-256 Fingerprint for Google Play / Firebase
console.log('\n--- EXTRACTING SHA-256 FINGERPRINT ---');
const certInfo = execFileSync(keytool, [
  '-list',
  '-v',
  '-keystore', keystorePath,
  '-alias', alias,
  '-storepass', storePassword
], { encoding: 'utf8' });

const sha256Match = certInfo.match(/SHA256:\s*([A-F0-9:]+)/i);
if (sha256Match) {
  console.log('SHA-256 Fingerprint:', sha256Match[1]);
  console.log('(Copy this SHA-256 into Firebase Console > Project Settings > Android App if required)');
} else {
  console.log(certInfo);
}

console.log('\n✅ Setup complete! You can now run: npm run android:bundle to generate a signed release AAB.');
