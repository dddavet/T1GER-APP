<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# T1GER

React + TypeScript productivity app for entrepreneurs.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create `.env.local` from `.env.example` and set `VITE_GEMINI_API_KEY`.
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
