import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source = await readFile(new URL('../src/services/revenueCatService.ts', import.meta.url), 'utf8');
function loadService(native, active = {}, apiKey = 'goog_configured') {
  const exports = {};
  const sdk = {
    configure: async () => {}, logIn: async () => {},
    purchasePackage: async () => ({ customerInfo: { entitlements: { active } } }),
    restorePurchases: async () => ({ customerInfo: { entitlements: { active } } }),
    getCustomerInfo: async () => ({ customerInfo: { entitlements: { active } } }),
    getOfferings: async () => ({ current: null }), setMockWebResults: async () => {},
  };
  const compiled = ts.transpileModule(source.replaceAll('import.meta.env', JSON.stringify({ VITE_REVENUECAT_PUBLIC_KEY: apiKey })), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(compiled, {
    exports, console: { log() {}, warn() {}, error() {} },
    require: name => name === '@capacitor/core' ? { Capacitor: { isNativePlatform: () => native } } : { Purchases: sdk },
    fetch: async () => ({ ok: false }),
  });
  return exports.revenueCat;
}

await assert.rejects(() => loadService(false).purchase({}), /billing\/entitlement-sync-unavailable/);
await assert.rejects(() => loadService(false).restore(), /billing\/unsupported/);
await assert.rejects(() => loadService(true).purchase({}), /billing\/entitlement-sync-unavailable/, 'Do not charge before server access synchronization exists');
assert.equal(await loadService(true, { unrelated: {} }).getProStatus(), false);
assert.equal(await loadService(true, { t1ger_pro: {} }).getProStatus(), true);
assert.equal((await loadService(true).restore()).isPro, false);
await assert.rejects(() => loadService(true, {}, 'test_example').restore(), /billing\/not-configured/);
assert.equal((await loadService(false).getDisplayPackages()).length, 0, 'Unavailable checkout must not advertise fabricated prices');
for (const component of ['PaywallModal', 'OnboardingFlow']) {
  const ui = await readFile(new URL(`../src/components/${component}.tsx`, import.meta.url), 'utf8');
  assert.doesNotMatch(ui, /isPro:\s*(true|choice\s*===)|isFounder:\s*(true|pkg\.|choice\s*===)/, 'UI must not grant payment privileges');
}
assert.equal((await loadService(true).getAvailablePackages()).length, 0, 'Missing store offerings never fabricate prices');
console.log('Payment safety: unsupported web, inactive entitlements, test keys and missing offerings covered.');
