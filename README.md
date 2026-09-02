<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# T1GER

React + TypeScript productivity app for entrepreneurs.

## Run Locally

**Prerequisites:** Node.js 22 LTS; JDK 21 and Android SDK for native builds.


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local`. Provider keys are optional and are only
   enabled for local development when `VITE_ENABLE_CLIENT_AI=true`.
3. Run the app:
   `npm run dev`

## Fast mobile development

Open the mobile Web experience with Hot Module Replacement and the development
state harness:

```bash
npm run dev:web
```

Run the same Vite session inside a physical Android phone connected by USB:

```bash
npm run dev:android
```

For an Android phone already paired through wireless debugging:

```bash
npm run dev:android:wifi
```

See [Fast Development Loop](docs/development-live-reload.md) for device setup,
state simulation, multiple-device targeting, and troubleshooting.

## Firebase

The app uses Firebase Auth and Cloud Firestore for account state and progress sync. Make sure `firebase-applet-config.json` points to the Firebase project you want to use.

The COMPETE backend includes Firestore rules/indexes and Cloud Functions for
OneSignal nudges and 1v1 coin escrow. See [Social and competition system](docs/social-competition-system.md)
for the data model, verification commands, required secrets, and deployment.

## iOS

The app is prepared for Capacitor. Build the web bundle before syncing native projects:

```bash
npm run build
npx cap sync ios
```

Opening and archiving the iOS project requires macOS with Xcode.

## Production AI

Variables prefixed with `VITE_` are shipped to the browser and must never contain
production provider secrets. Production proof verification and the mentor use
authenticated Cloud Functions with a server-side Gemini secret. If the backend
is unavailable, production reports the failure and does not invent verification.
Deterministic demos are development-only.

## Android release signing

Debug builds do not require signing configuration. For a signed release, copy
`android/key.properties.example` to the ignored `android/key.properties` file and
point it at the private upload keystore, or provide the equivalent
`T1GER_ANDROID_*` environment variables used by CI. Never commit keystores or
their passwords.

```bash
npm run test:all
npm run build:production
npm run release:check
npm run android:build
npm run android:bundle
```

The last command requires a valid upload key; an unsigned bundle is deliberately
rejected. CI runs the regressions, security-rule tests, browser smoke test and
native unit tests before uploading APK/AAB artifacts. It does not publish to Play.

**Release status and Antigravity handoff:** read
[Production readiness](docs/production-readiness.md). Passing compilation is not
production approval; backend billing, credentials, store setup and final live
acceptance are still separate gates.
