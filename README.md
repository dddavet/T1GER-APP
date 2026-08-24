<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# T1GER

React + TypeScript productivity app for entrepreneurs.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local`. Provider keys are optional and are only
   enabled for local development when `VITE_ENABLE_CLIENT_AI=true`.
3. Run the app:
   `npm run dev`

## Firebase

The app uses Firebase Auth and Cloud Firestore for account state and progress sync. Make sure `firebase-applet-config.json` points to the Firebase project you want to use.

## iOS

The app is prepared for Capacitor. Build the web bundle before syncing native projects:

```bash
npm run build
npx cap sync ios
```

Opening and archiving the iOS project requires macOS with Xcode.

## Production AI

Variables prefixed with `VITE_` are shipped to the browser and must never contain
production provider secrets. Production AI should call an authenticated
server-side proxy. Until that proxy is configured, the app uses its deterministic
local fallbacks instead of embedding Gemini or OpenRouter credentials.

## Android release signing

Debug builds do not require signing configuration. For a signed release, copy
`android/key.properties.example` to the ignored `android/key.properties` file and
point it at the private upload keystore, or provide the equivalent
`T1GER_ANDROID_*` environment variables used by CI. Never commit keystores or
their passwords.
