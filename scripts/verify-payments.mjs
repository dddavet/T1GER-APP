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

await assert.rejects(() => loadService(false).purchase({}), /billing\/unsupported/);
await assert.rejects(() => loadService(false).restore(), /billing\/unsupported/);
assert.equal((await loadService(true).purchase({})).isPro, false, 'No entitlement means no Pro access');
assert.equal((await loadService(true, { unrelated: {} }).purchase({})).isPro, false);
assert.equal((await loadService(true, { t1ger_pro: {} }).purchase({})).isPro, true);
assert.equal((await loadService(true).restore()).isPro, false);
await assert.rejects(() => loadService(true, {}, 'test_example').purchase({}), /billing\/not-configured/);
assert.equal((await loadService(true).getAvailablePackages()).length, 0, 'Missing store offerings never fabricate prices');
console.log('Payment safety: unsupported web, inactive entitlements, test keys and missing offerings covered.');
