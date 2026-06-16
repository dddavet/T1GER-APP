const EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 't1ger-69d6a';
const API_KEY = process.env.VITE_FIREBASE_API_KEY || 'dev-emulator-key';

const accounts = [
  {
    email: 'founder@t1ger.local',
    password: 'Tiger-Founder-2026!',
  },
];

async function requestAuth(path: string, body: Record<string, unknown>) {
  const response = await fetch(`http://${EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/${path}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = payload?.error?.message || response.statusText;
    throw new Error(message);
  }

  return payload;
}

async function seedAccount(email: string, password: string) {
  try {
    await requestAuth('accounts:signUp', {
      email,
      password,
      returnSecureToken: true,
    });
    console.log(`Created ${email}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('EMAIL_EXISTS')) {
      await requestAuth('accounts:signInWithPassword', {
        email,
        password,
        returnSecureToken: true,
      });
      console.log(`Verified ${email}`);
      return;
    }
    throw error;
  }
}

async function main() {
  console.log(`Seeding Firebase Auth Emulator for ${PROJECT_ID} at ${EMULATOR_HOST}`);
  for (const account of accounts) {
    await seedAccount(account.email, account.password);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
