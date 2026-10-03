import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source = await readFile(new URL('../src/services/oneSignalService.ts', import.meta.url), 'utf8');
function load(appId, initializationFails = false) {
  const calls = { permission: 0, login: 0, tags: 0, browserPermission: 0 };
  const exports = {};
  const compiled = ts.transpileModule(source.replaceAll('import.meta.env', JSON.stringify({ VITE_ONESIGNAL_APP_ID: appId })), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(compiled, {
    exports, console: { log() {}, warn() {}, info() {} },
    window: { plugins: { OneSignal: {
      initialize() { if (initializationFails) throw new Error('SDK unavailable'); },
      login() { calls.login++; },
      User: { addTags() { calls.tags++; } },
      Notifications: { addEventListener() {}, async requestPermission() { calls.permission++; return true; } },
    } } },
    Notification: { async requestPermission() { calls.browserPermission++; return 'granted'; } },
  });
  return { service: exports.OneSignalService, calls };
}

for (const appId of [undefined, '', 'YOUR_ONESIGNAL_APP_ID', '00000000-0000-0000-0000-000000000000']) {
  const { service, calls } = load(appId);
  assert.equal(service.isConfigured(), false);
  await service.init();
  assert.equal(await service.requestPermission(), false, 'Browser permission alone must not enable reminders');
  await service.identifyUser('synthetic-test');
  await service.updateStreakTags(2, 0, 'Bronze');
  assert.deepEqual(calls, { permission: 0, login: 0, tags: 0, browserPermission: 0 });
}
const failed = load('11111111-2222-4333-8444-555555555555', true);
await failed.service.init();
assert.equal(await failed.service.requestPermission(), false);
await failed.service.identifyUser('synthetic-test');
assert.equal(failed.calls.login, 0, 'Failed initialization must not register users');
const active = load('11111111-2222-4333-8444-555555555555');
await active.service.init();
assert.equal(await active.service.requestPermission(), true);
await active.service.identifyUser('synthetic-test', { language: 'en' });
assert.equal(active.calls.login, 1);
assert.equal(active.calls.tags, 1);
assert.equal(active.calls.browserPermission, 0);
console.log('Notification safety passed: missing/placeholder config, initialization failure, no fake browser activation, configured native permission.');
