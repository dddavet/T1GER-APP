# T1GER release-candidate plan

Updated: 2026-09-20

## Product contract

- Loop: DISCOVER → LEARN → APPLY → MASTER → RETURN.
- Launch domains: Investing, AI, Psychology.
- Investing remains the regression reference; stable curriculum and persistence IDs are preserved.
- Primary navigation: Learn, Apply, Master, Profile. Social and Mentor systems remain available but are not primary V1 distractions.

## Completed in this pass

1. Restricted Discover and onboarding to the three real launch domains.
2. Replaced the mislabeled Stoicism pathway with an evidence-based Psychology & Decisions curriculum while preserving legacy IDs.
3. Reduced onboarding to the value-producing decisions and first lesson.
4. Made Master/FSRS an explicit primary destination.
5. Removed founder/predator positioning from launch Profile and public store metadata.
6. Hardened the global recovery screen and removed committed reviewer credentials.
7. Aligned web, Android, and iOS release version to 1.0.0 (build 1).

## Release sequence

1. Run all automated web, curriculum, journey, Apply, rules, security, and production-build gates.
2. Sync and compile Android; generate a signed AAB only when the private upload key is present.
3. Validate the release candidate on at least one physical Android device, including camera, notifications, screen-time permission, offline recovery, and account deletion.
4. Complete Firebase/OneSignal/RevenueCat production configuration and store declarations.
5. Submit first to a closed/internal track, review telemetry and feedback, then promote deliberately.

## Boundaries

- No fabricated store claims, pricing, rankings, or verification.
- No production secret is stored in source control.
- No publishing or paid transaction is performed automatically.
- iOS signing and App Store submission require macOS/Xcode and account-owner action.
