# T1GER production readiness

Last updated: 2026-09-20

## Current status

The repository is an engineering release candidate once the final automated matrix below is green. Store submission is still gated by production credentials, a signed mobile artifact, physical-device acceptance, and store-console declarations.

Passing compilation is not permission to publish. Publication, billing activation, infrastructure deployment, and account-owner declarations remain deliberate external actions.

## Product surface

- Canonical loop: Discover → Learn → Apply → Master → Return.
- Launch domains: Investing, AI, Psychology.
- Investing is the end-to-end reference path.
- Psychology uses stable legacy persistence IDs but presents five evidence-based Psychology & Decisions lessons.
- Primary V1 navigation: Learn, Apply, Master, Profile.
- Compete and Mentor code is preserved; Mentor remains accessible from Profile and both can be opened by supported internal/development routes.

## Automated release matrix

Run from the repository root with the local dev server available for browser suites:

```bash
npm run lint
npm run test:core
npm run test:journey
npm run test:curriculum
npm run test:social
npm run test:opportunity
npm run test:rules
npm run test:apply
npm run test:shell
npm run build:production
npm run release:check
```

Native Android verification:

```bash
npm run android:sync
npm run android:build
cd android
./gradlew testDebugUnitTest
```

`npm run android:bundle` intentionally fails without release-signing configuration.

## Security and privacy controls

- Firestore rules are covered by emulator tests.
- Production AI secrets belong in server configuration, never `VITE_*` variables.
- Reviewer credentials are supplied through environment variables and store consoles, never committed or printed.
- Account export and deletion controls are available in Profile.
- Technical exception details are visible only in development.
- Camera, notifications, usage access, collected data, and account handling must be declared accurately in each store.

## Production configuration gates

1. **Firebase:** confirm billing/project ownership, deploy functions and rules, configure server AI/OneSignal secrets, and run authenticated smoke tests against production.
2. **Android signing and Play Console:** provide the private upload key outside Git, build the AAB, upload to internal testing, and complete data safety, content rating, privacy/support URLs, screenshots, reviewer access, and closed-test requirements.
3. **RevenueCat:** create matching store products and entitlements, validate purchase/restore with sandbox accounts, then explicitly enable checkout. The app must not advertise a trial while checkout is unavailable.
4. **Push and device acceptance:** validate OneSignal delivery, Android usage-access permission/fallback, camera/file evidence, offline recovery, deep links, and deletion on a physical release-mode device.
5. **iOS (if included):** use macOS/Xcode for signing, archive validation, capabilities, privacy manifests, TestFlight, and App Store Connect submission.

## Analytics and incident visibility

No production analytics or crash provider is silently initialized in the current client. This protects consent and avoids false confidence, but it means launch monitoring is incomplete until the owner selects/configures a provider, updates privacy disclosures, and validates consent behavior. Console errors are not a production incident-management system.

## Store assets

Canonical copy and technical facts are in `STORE_LISTING_METADATA.md`. Screenshots must be recaptured from the final signed candidate. Do not reuse images that show disabled, development-only, or unreleased features.
