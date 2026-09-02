import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const failures = [];
const sensitive = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:ghp|github_pat)_[A-Za-z0-9_]{30,}\b/,
  /\bsk-(?:proj-|or-v1-)?[A-Za-z0-9_-]{35,}\b/,
  /["']type["']\s*:\s*["']service_account["']/,
];
const paths = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
for (const path of new Set(paths)) {
  if (!existsSync(path) || !statSync(path).isFile()) continue;
  if (/(?:^|\/)(?:\.env(?:\.local|\.production)?|key\.properties)$|\.(?:jks|keystore|p12)$/i.test(path)) {
    failures.push(`Private configuration is not ignored: ${path}`);
  }
  if (!/\.(?:[cm]?[jt]sx?|json|ya?ml|md|properties|txt|xml|rules|gradle|toml|sh|ps1)$/.test(path)) continue;
  const content = readFileSync(path, 'utf8');
  if (sensitive.some(pattern => pattern.test(content))) failures.push(`Possible secret in ${path} (value withheld)`);
}

if (!existsSync('dist/index.html')) failures.push('Build production assets before running release:check.');
const privateValues = [];
for (const name of ['.env', '.env.local', '.env.production', '.env.production.local']) {
  if (!existsSync(name)) continue;
  for (const line of readFileSync(name, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:VITE_)?(?:GEMINI_API_KEY|OPENROUTER_API_KEY|ONESIGNAL_REST_API_KEY)\s*=\s*(.*?)\s*$/);
    const value = match?.[1]?.replace(/^['"]|['"]$/g, '');
    if (value && value.length > 15) privateValues.push(value);
  }
}
function checkAssets(directory) {
  if (!existsSync(directory)) return;
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) checkAssets(path);
    else if (/\.(?:js|html|json|map)$/.test(item.name)) {
      const content = readFileSync(path, 'utf8');
      if (sensitive.some(pattern => pattern.test(content)) || privateValues.some(value => content.includes(value))) failures.push(`Possible embedded secret: ${path} (value withheld)`);
      if (content.includes('T1GER / DEV HARNESS')) failures.push(`Development harness shipped in ${path}`);
    }
  }
}
checkAssets('dist');
const config = readFileSync('capacitor.config.ts', 'utf8');
if (/cleartext:\s*true|url:\s*['"]http/.test(config)) failures.push('Capacitor contains development network configuration.');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('PASS: secret-pattern scan, known local AI key exclusion, production harness isolation and Capacitor configuration. This is not a legal/Play/backend readiness certification.');
