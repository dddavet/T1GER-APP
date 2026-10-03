# Final release blocker validation — 2026-10-03

## Release decision

**NOT READY for store submission.** Local regression checks are distinct from deployed-service and physical-device readiness. No production deployment, bulk notification, real purchase, or redesign was performed.

## Physical Android

**BLOCKED — REQUIRES DAVID / PHYSICAL DEVICE.** Android SDK ADB returned no connected devices. Installation, lifecycle, hardware back, keyboard, camera, real push delivery, native usage-access permission, offline recovery, and account deletion on a phone were not validated. Responsive Chromium and emulator service tests are not substitutes.

## Production Firebase — observed, not assumed

Authenticated, read-only control-plane API checks against `t1ger-69d6a` established:

- Project ACTIVE; `(default)` Firestore database present in `nam5`.
- Email/password and Google providers enabled. Authorized domains: `localhost`, `t1ger-69d6a.firebaseapp.com`, `t1ger-69d6a.web.app`, `t1ger.app`. Disposable email/password signup succeeded during the mentor test. Mobile Google Sign-In was not tested.
- All five repository composite indexes are READY.
- Seven deployed functions: `completeWebApplyMission`, `countVerifiedChallengeMission`, `askT1gerMentor`, `interactWithSquadActivity`, `settleExpiredChallenges`, `acceptDirectChallenge`, `updateWebCosmetic`.
- Required mobile callables **not deployed**: `completeApplyMission`, `claimOnboardingReward`, `verifyFieldMissionProof`, `deleteMyAccount`, `queueSquadNudge`, `dispatchSquadNudge`. A differently named web Apply function does not satisfy the mobile contract.
- Deployed Firestore rules differ from this repository; deployed release updated on 2026-10-02. Do not overwrite these rules without coordinating the web/mobile deployment contract.
- Configured bucket `t1ger-69d6a.firebasestorage.app` returned HTTP 404. No Storage rules release was listed. Artifact uploads cannot be certified against this configuration.
- The in-app export contains available device/profile progress, not every cloud record. Its label and confirmation now disclose that scope. Cloud account deletion passes the repository emulator tests, but its production callable is absent.

Required before distribution: reconcile the deployed web/mobile backend, provision or correctly configure Storage, deploy compatible validated rules/functions, then test an authenticated Learn → Apply → persistence → deletion flow against production using a disposable account. No cloud configuration was changed in this audit.

## OneSignal

No effective web App ID; Android application retains a placeholder ID. `ONESIGNAL_APP_ID` and `ONESIGNAL_REST_API_KEY` server secrets were not found. Subscription registration, receipt, and notification deep links are **BLOCKED**, not passing.

Fixed a demonstrated false-positive: generic browser permission could previously enable reminder preferences despite no initialized push provider. Missing/placeholder configuration now shows unavailable UI, never requests unrelated browser permission, and does not enable reminders. Failed SDK initialization remains failed; native tag updates cannot run before initialization. Regression tests cover missing configuration, initialization failure, and configured native permission with a mocked SDK. No pushes were sent.

## AI

Production mentor endpoint rejects unauthenticated calls with HTTP 401 `UNAUTHENTICATED`. Two bounded calls with separate disposable accounts returned HTTP 400 `FAILED_PRECONDITION`: “The mentor is awaiting a compatible service configuration.” Both disposable Auth accounts and their scoped Firestore documents were removed (cleanup HTTP 200). No real user records were read or modified.

The deployed endpoint has a Gemini secret binding and the secret has an enabled version, but **no successful live Gemini response was demonstrated**. This is not evidence that the provider works. Repository server implementation uses Gemini `gemini-2.5-flash`, server-side credentials, authentication, daily quotas, capped input/history/output, a 40-second provider timeout, and a 60-second function timeout. Production client failures return an explicit unavailable state, not fabricated AI advice. Client AI keys are development-only; production output is scanned for known private values.

Enable a compatible service and validate its response, or explicitly retain unavailable mentor behavior for V1. Proof auditing also requires the missing production callable.

## RevenueCat

Checkout remains intentionally disabled (`CHECKOUT_ENABLED = false`) pending trusted entitlement synchronization. Package lists are empty, unavailable purchase attempts fail, and the UI offers continued free learning rather than a fabricated trial. No real charge or store purchase was attempted. Payment safety tests do not certify store sandbox purchases.

## XP semantics and abuse protection

See `PRODUCT.md`: XP recognizes meaningful activity, **not verified mastery**. Personal lesson + Apply rewards remain canonical and one-time. Self-reported Apply/reflection is personal participation, not competitive evidence. Current competitive `vXP` is a legacy label for AI-reviewed image evidence; text-only reflections do not earn it, and image review is not independent verification of understanding or execution. Correct challenge/retrieval answers are evidence for those questions only. FSRS self-ratings adjust scheduling and do not grant a second completion reward.

Existing reward architecture was preserved. Emulator tests cover concurrent/repeated completion, repeated API proof submissions, self-report → reviewed evidence without double payment, text reflections excluded from competitive XP, and timestamp preservation. Browser Apply tests cover persisted progression/reload; Master reviews do not award completion XP.

## Security and CI corrections

- CI previously ran browser tests before installing Chromium or starting localhost. Browser installation and a bounded Vite readiness check now precede `test:all`.
- Scoped transitive patches pin `@grpc/grpc-js` to 1.14.5 and backend `brace-expansion` to 2.1.7. No Firebase downgrade or broad dependency upgrade was applied. [Maintainer certificate advisory](https://github.com/grpc/grpc-node/security/advisories/GHSA-m9gg-hp2v-232j), [maintainer error disclosure advisory](https://github.com/grpc/grpc-node/security/advisories/GHSA-f596-whhp-79r4).
- Production dependency audit at high severity passes: root retains three moderate findings (`fast-uri`, `hono`, `ip-address`); backend audit reports zero vulnerabilities. These remaining advisories are not claimed resolved.
- Pending application commits were scanned for secret patterns and forbidden committed paths. `company/`, `company-os/`, and `public/t1ger-latest.apk` remain untouched and untracked. Live audit scripts and disposable credentials are not committed.
- Vite copies the untracked local `public/t1ger-latest.apk` into local `dist`. Do not distribute this local build without moving that artifact outside public and rebuilding. A clean CI checkout does not contain this APK. The source artifact was not moved or deleted because it is explicitly out of scope.

## Final verification record

Final commands: `npm run test:all` (lint, core, journey, payment/notification safety, Master browser flow, curriculum, social, opportunity, rules/functions emulators), `npm run test:shell`, `npm run test:apply`, `npm run build:production`, `npm run release:check`, and production dependency audits at high severity. Their exact outcomes and pushed-SHA CI status must be taken from the final task report; a local pass is not certification of production services or physical Android.
