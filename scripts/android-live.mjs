import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir, networkInterfaces } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const viteCli = join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');
const capacitorCli = join(projectRoot, 'node_modules', '@capacitor', 'cli', 'bin', 'capacitor');
const isWindows = process.platform === 'win32';
const cliArgs = process.argv.slice(2);
const useWifi = cliArgs.includes('--wifi');
const useEmulator = cliArgs.includes('--emulator');
const requestedTarget = cliArgs.find(argument => argument.startsWith('--target='))?.split('=').slice(1).join('=');
const requestedHost = cliArgs.find(argument => argument.startsWith('--host='))?.split('=').slice(1).join('=');
const requestedAvd = cliArgs.find(argument => argument.startsWith('--avd='))?.split('=').slice(1).join('=');

if (cliArgs.includes('--help')) {
  console.log(`
T1GER Android Live Reload

  npm run dev:android
      USB mode. Uses adb reverse so the phone reaches localhost:3000.

  npm run dev:android:wifi
      Wi-Fi mode. Uses the first LAN IPv4 address.

  npm run dev:android:emulator
      Starts an installed Android emulator with live reload.

Options passed after --:
  --target=<adb-id>   Select a device when more than one is connected.
  --host=<lan-ip>     Override the host used in Wi-Fi mode.
  --avd=<name>        Select an Android Virtual Device.
  `);
  process.exit(0);
}

const sdkRoot = process.env.ANDROID_SDK_ROOT
  || process.env.ANDROID_HOME
  || (process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Android', 'Sdk') : '');
const adbCandidate = sdkRoot ? join(sdkRoot, 'platform-tools', isWindows ? 'adb.exe' : 'adb') : '';
const adbCommand = adbCandidate && existsSync(adbCandidate) ? adbCandidate : 'adb';
const emulatorCandidate = sdkRoot ? join(sdkRoot, 'emulator', isWindows ? 'emulator.exe' : 'emulator') : '';
const platformTools = adbCandidate && existsSync(adbCandidate) ? dirname(adbCandidate) : '';
const javaHomeCandidates = [
  join(homedir(), '.jdks', 'jbr-21.0.11'),
  process.env.JAVA_HOME,
  isWindows ? 'C:\\Program Files\\Android\\Android Studio\\jbr' : '',
].filter(Boolean);
const javaHome = javaHomeCandidates.find(candidate => existsSync(join(candidate, 'bin', isWindows ? 'java.exe' : 'java')));
const javaBin = javaHome ? join(javaHome, 'bin') : '';
const childEnv = {
  ...process.env,
  ...(sdkRoot ? { ANDROID_HOME: sdkRoot, ANDROID_SDK_ROOT: sdkRoot } : {}),
  ...(javaHome ? { JAVA_HOME: javaHome } : {}),
  PATH: [platformTools, javaBin, process.env.PATH || ''].filter(Boolean).join(isWindows ? ';' : ':'),
};

const runSync = (command, args, options = {}) => {
  const { capture = false, ...spawnOptions } = options;
  return spawnSync(command, args, {
    cwd: projectRoot,
    env: childEnv,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
    ...spawnOptions,
  });
};

const adbVersion = runSync(adbCommand, ['version'], { capture: true });
if (adbVersion.status !== 0) {
  console.error('[T1GER] No encuentro adb. Instala Android SDK Platform-Tools o define ANDROID_SDK_ROOT.');
  process.exit(1);
}

if (!javaHome) {
  console.error('[T1GER] No encuentro un JDK compatible. Instala JDK 21 o configura JAVA_HOME.');
  process.exit(1);
}
console.log(`[T1GER] Java: ${javaHome}`);

const listDevices = () => {
  const result = runSync(adbCommand, ['devices'], { capture: true });
  return String(result.stdout || '')
    .split(/\r?\n/)
    .slice(1)
    .map(line => line.trim().split(/\s+/))
    .filter(([id, status]) => id && status === 'device')
    .map(([id]) => id);
};

if (useEmulator && !listDevices().some(id => id.startsWith('emulator-'))) {
  if (!emulatorCandidate || !existsSync(emulatorCandidate)) {
    console.error('[T1GER] No encuentro el ejecutable del emulador de Android.');
    process.exit(1);
  }
  const avdResult = runSync(emulatorCandidate, ['-list-avds'], { capture: true });
  const avds = String(avdResult.stdout || '').split(/\r?\n/).map(value => value.trim()).filter(Boolean);
  const avdName = requestedAvd || avds.find(name => name === 'T1GER_API_36') || avds[0];
  if (!avdName || !avds.includes(avdName)) {
    console.error(`[T1GER] AVD no encontrado. Disponibles: ${avds.join(', ') || 'ninguno'}`);
    process.exit(1);
  }

  console.log(`[T1GER] Iniciando emulador ${avdName}...`);
  const emulator = spawn(emulatorCandidate, ['-avd', avdName, '-no-snapshot-load'], {
    cwd: projectRoot,
    env: childEnv,
    detached: true,
    stdio: 'ignore',
    windowsHide: false,
  });
  emulator.unref();

  let emulatorReady = false;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const emulatorId = listDevices().find(id => id.startsWith('emulator-'));
    if (emulatorId) {
      const boot = runSync(adbCommand, ['-s', emulatorId, 'shell', 'getprop', 'sys.boot_completed'], { capture: true });
      if (String(boot.stdout || '').trim() === '1') {
        emulatorReady = true;
        break;
      }
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 1000));
  }
  if (!emulatorReady) {
    console.error('[T1GER] El emulador no terminó de arrancar en dos minutos.');
    process.exit(1);
  }
}

const devices = listDevices();

const eligibleDevices = requestedTarget
  ? devices.filter(id => id === requestedTarget)
  : useEmulator
    ? devices.filter(id => id.startsWith('emulator-'))
    : devices.filter(id => !id.startsWith('emulator-'));

if (eligibleDevices.length === 0) {
  console.error('[T1GER] No hay un teléfono Android autorizado. Activa USB debugging y acepta la huella RSA.');
  console.error(`[T1GER] Dispositivos visibles: ${devices.join(', ') || 'ninguno'}`);
  process.exit(1);
}

if (!requestedTarget && eligibleDevices.length > 1) {
  console.error(`[T1GER] Hay varios teléfonos conectados: ${eligibleDevices.join(', ')}`);
  console.error('[T1GER] Repite con: npm run dev:android -- --target=<adb-id>');
  process.exit(1);
}

const deviceId = eligibleDevices[0];

const getLanAddress = () => {
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses || []) {
      if (address.family === 'IPv4' && !address.internal && !address.address.startsWith('169.254.')) {
        return address.address;
      }
    }
  }
  return null;
};

const liveHost = useWifi ? (requestedHost || getLanAddress()) : '127.0.0.1';
if (!liveHost) {
  console.error('[T1GER] No pude detectar la IP LAN. Usa --host=192.168.x.x.');
  process.exit(1);
}

if (!existsSync(join(projectRoot, 'dist', 'index.html'))) {
  console.log('[T1GER] Preparando el contenedor Android por primera vez…');
  const build = runSync(process.execPath, [viteCli, 'build']);
  if (build.status !== 0) process.exit(build.status || 1);
}

if (!useWifi) {
  const reverse = runSync(adbCommand, ['-s', deviceId, 'reverse', 'tcp:3000', 'tcp:3000']);
  if (reverse.status !== 0) process.exit(reverse.status || 1);
}

console.log(`[T1GER] Teléfono: ${deviceId}`);
console.log(`[T1GER] Live reload: http://${liveHost}:3000`);

const vite = spawn(process.execPath, [viteCli, '--port', '3000', '--host', '0.0.0.0', '--strictPort'], {
  cwd: projectRoot,
  env: childEnv,
  stdio: 'inherit',
});

const waitForVite = async () => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:3000', { signal: AbortSignal.timeout(500) });
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 250));
  }
  throw new Error('Vite no respondió en el puerto 3000.');
};

let cleaningUp = false;
let nativeConfigBackup = null;
let nativeConfigPath = null;
const restoreNativeConfig = () => {
  if (nativeConfigBackup !== null && nativeConfigPath) {
    writeFileSync(nativeConfigPath, nativeConfigBackup, 'utf8');
    nativeConfigBackup = null;
  }
};
const cleanup = (exitCode = 0) => {
  if (cleaningUp) return;
  cleaningUp = true;
  restoreNativeConfig();
  if (!useWifi) runSync(adbCommand, ['-s', deviceId, 'reverse', '--remove', 'tcp:3000'], { capture: true });
  vite.kill('SIGTERM');
  console.log('\n[T1GER] Live reload detenido.');
  process.exit(exitCode);
};

process.once('SIGINT', () => cleanup(0));
process.once('SIGTERM', () => cleanup(0));
vite.once('exit', code => {
  if (!cleaningUp) cleanup(code || 1);
});

try {
  await waitForVite();
  const capacitor = runSync(process.execPath, [capacitorCli, 'sync', 'android']);
  if (capacitor.status !== 0) cleanup(capacitor.status || 1);

  nativeConfigPath = join(projectRoot, 'android', 'app', 'src', 'main', 'assets', 'capacitor.config.json');
  nativeConfigBackup = readFileSync(nativeConfigPath, 'utf8');
  const nativeConfig = JSON.parse(nativeConfigBackup);
  nativeConfig.server = {
    ...(nativeConfig.server || {}),
    url: `http://${liveHost}:3000`,
    cleartext: true,
  };
  writeFileSync(nativeConfigPath, `${JSON.stringify(nativeConfig, null, '\t')}\n`, 'utf8');

  const androidDir = join(projectRoot, 'android');
  const gradleWrapper = join(androidDir, isWindows ? 'gradlew.bat' : 'gradlew');
  const gradle = isWindows
    ? runSync('powershell.exe', [
        '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command',
        `& '${gradleWrapper.replaceAll("'", "''")}' -p '${androidDir.replaceAll("'", "''")}' assembleDebug`,
      ])
    : runSync(gradleWrapper, ['-p', androidDir, 'assembleDebug']);
  restoreNativeConfig();
  if (gradle.status !== 0) cleanup(gradle.status || 1);

  const apkPath = join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  const install = runSync(adbCommand, ['-s', deviceId, 'install', '-r', apkPath]);
  if (install.status !== 0) cleanup(install.status || 1);

  if (!useWifi) {
    const reverse = runSync(adbCommand, ['-s', deviceId, 'reverse', 'tcp:3000', 'tcp:3000']);
    if (reverse.status !== 0) cleanup(reverse.status || 1);
  }

  const appId = nativeConfig.appId;
  runSync(adbCommand, ['-s', deviceId, 'shell', 'am', 'force-stop', appId]);
  const launch = runSync(adbCommand, [
    '-s', deviceId, 'shell', 'am', 'start', '-W',
    '-n', `${appId}/${appId}.MainActivity`,
  ]);
  if (launch.status !== 0) cleanup(launch.status || 1);

  console.log('\n[T1GER] ✓ App instalada. Guarda cualquier archivo: Vite actualizará el teléfono al instante.');
  console.log('[T1GER] Presiona Ctrl+C para cerrar el servidor y retirar el port forwarding.');
} catch (error) {
  console.error(`[T1GER] ${error instanceof Error ? error.message : String(error)}`);
  cleanup(1);
}

await new Promise(() => undefined);
