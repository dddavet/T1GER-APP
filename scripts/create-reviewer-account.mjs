import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Read API Key from .env.local or environment
let apiKey = process.env.VITE_FIREBASE_API_KEY;
const envFile = join(root, '.env.local');
if (!apiKey && existsSync(envFile)) {
  const content = readFileSync(envFile, 'utf8');
  const match = content.match(/VITE_FIREBASE_API_KEY\s*=\s*['"]?([^'"\r\n]+)/);
  if (match) apiKey = match[1];
}

const REVIEWER_EMAIL = process.env.T1GER_REVIEWER_EMAIL?.trim();
const REVIEWER_PASSWORD = process.env.T1GER_REVIEWER_PASSWORD;

async function provisionReviewer() {
  console.log('=== T1GER APP REVIEWER ACCOUNT PROVISIONING ===\n');
  if (!REVIEWER_EMAIL || !REVIEWER_PASSWORD || REVIEWER_PASSWORD.length < 12) {
    console.error('Set T1GER_REVIEWER_EMAIL and a T1GER_REVIEWER_PASSWORD of at least 12 characters before provisioning.');
    process.exitCode = 1;
    return;
  }
  console.log(`Target Email: ${REVIEWER_EMAIL}`);

  if (!apiKey) {
    console.log('\n[INFO] VITE_FIREBASE_API_KEY not detected in environment or .env.local.');
    console.log('Provide VITE_FIREBASE_API_KEY or create the reviewer account manually in Firebase Console using the environment-supplied credentials.');
    process.exitCode = 1;
    return;
  }

  try {
    const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: REVIEWER_EMAIL,
        password: REVIEWER_PASSWORD,
        returnSecureToken: true
      })
    });

    const data = await res.json();
    if (res.ok) {
      console.log('\n✅ Reviewer account successfully created in Firebase Auth!');
      console.log(`UID: ${data.localId}`);
    } else if (data.error?.message === 'EMAIL_EXISTS') {
      console.log('\n✅ Reviewer account already exists and is active in Firebase Auth.');
    } else {
      console.warn('\n⚠️ Firebase response:', data.error?.message || data);
    }
  } catch (err) {
    console.error('Network error contacting Firebase:', err.message);
  }
}

provisionReviewer();
