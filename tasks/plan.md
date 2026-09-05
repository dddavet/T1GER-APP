# Investing journey and self-reported Apply

## Scope and decisions
- Back up clean `c2bc582` to `codex/backup-before-investing-journey-20260904`; origin/main is current.
- Launch one Investing path; preserve other curricula and existing account records for compatibility.
- Completion requires the lesson then an explicitly self-reported real-world action, not uploaded proof. Optional reflection never gates completion.
- Keep personal rewards separate from competitive verification. Same server reward key for both completion methods prevents double claims.
- Use existing FSRS reviews to restore prerequisite readiness; do not invent a new adaptive engine.
- Preserve recent payment design, but fix fabricated success or onboarding traps found during audit.

## Ordered slices
1. Canonical self-report backend transaction and emulator tests (no new paid services).
2. Ordered journey selector: prior Apply + FSRS readiness, localized section landmarks and node states; focused tests.
3. Rich Apply cards, optional reflection, single completion, history and return-to-path; local preview and authenticated receipts.
4. Fix blocking payment/onboarding regressions, then types, full tests, production build and mobile browser journey.

## Verification / boundaries
Test duplicate/concurrent completion, no league reward, missing prerequisites, empty reflection, review unlock and mobile overflow. Preserve legacy proofs. No actual trades, purchases, billing upgrades or production deployment are part of this pass. Document external deployment/configuration gates honestly.
