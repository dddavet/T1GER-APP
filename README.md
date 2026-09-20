# T1GER

T1GER is a React + TypeScript mobile learning app that turns useful knowledge into short interactive lessons, real-world application, and spaced-repetition mastery.

The product loop is:

**DISCOVER → LEARN → APPLY → MASTER → RETURN**

The launch catalog focuses on Investing, AI, and Psychology. Investing is the flagship reference path. Business and marketing content remains in the repository for future expansion but does not define the product.

## Local development

Prerequisites: Node.js 22 LTS. Native Android work also requires JDK 21 and the Android SDK.

```bash
npm install
npm run dev:web
```

The browser opens at `http://127.0.0.1:3000/?previewApp=1&view=learn` with the development state harness available locally. Provider keys are optional and client AI remains disabled unless explicitly enabled for development.

For a physical Android phone connected by USB:

```bash
npm run dev:android
```

For Android wireless debugging:

```bash
npm run dev:android:wifi
```

See [docs/development-live-reload.md](docs/development-live-reload.md) for device setup and troubleshooting.

## Architecture

- Firebase Auth and Firestore synchronize accounts and progress.
- `BrainContext` owns curriculum progress, Learn → Apply gating, streaks, and FSRS review state.
- Capacitor provides Android/iOS bridges for camera, notifications, and supported native services.
- Production AI calls belong behind authenticated server boundaries; browser-exposed `VITE_*` values must never contain provider secrets.

Read [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md), and [AGENTS.md](AGENTS.md) before changing product language, learning progression, or visual hierarchy.

## Verification

```bash
npm run lint
npm run test:all
npm run test:apply
npm run test:shell
npm run build:production
npm run release:check
```

The browser tests expect the local dev server to be running. Firebase rule tests use the emulator suite.

## Mobile builds

```bash
npm run android:sync
npm run android:build
npm run android:bundle
```

Release bundles require `android/key.properties` or the equivalent ignored `T1GER_ANDROID_*` environment variables. Never commit keystores or signing passwords. CI validates and uploads build artifacts but does not publish to a store.

```bash
npm run ios:sync
npm run ios:open
```

Opening, signing, and archiving iOS requires macOS with Xcode.

For the current handoff, external gates, and store checklist, see [docs/production-readiness.md](docs/production-readiness.md).
