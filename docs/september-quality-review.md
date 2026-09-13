# September quality review

Reviewed update: `e035f7d` (30 files; 3,998 additions). Working branch: `codex/september-quality-pass`. Date: 2026-09-13.

## Verdict

The new visual direction and expanded authoring catalog are useful foundations. This is a priority integrity/usability pass, not a certification of every screen or a claim that the product is 10/10. Public production remains blocked by service deployment, payment entitlement integration and real-device acceptance.

## Findings and changes

| Priority | Finding | Resolution |
| --- | --- | --- |
| Critical | Web paywall simulated payment success; UI attempted Pro/Founder grants. Native checkout could charge before backend access synchronization. | Checkout closed centrally, client privilege grants removed, honest free onboarding and membership dialog. Existing account access preserved. Store restoration reports pending server synchronization without inventing Founder status. |
| High | 24 named pathways alias seven lesson tracks; only 15 of 35 lessons have canonical backend Apply definitions. | Three distinct supported pathways remain selectable: AI, Investing and Marketing. Others explicitly show Coming soon. Authored content is retained. Available-path tests check uniqueness and matching server XP. Complete missing curriculum/backend work before expanding availability. |
| High | Investing opened the first Business pathway; selection was mapped through handwritten aliases. | Initial/resumed selection resolves the actual available track. Selection reuses the track's canonical legacy ID. |
| High | Production Apply authentication guard had been removed. | Guard restored. Local prototype behavior remains available; production cannot silently claim locally saved success after auth loss. |
| Medium | Fake +20/+15 lesson/review awards and +50 chapter chests; daily goal used lifetime completions; empty progress appeared 8% full. | Removed unsupported rewards; real completion timestamps determine today's action; progress has accurate accessible values. Completed nodes reopen as review. |
| Medium | All main tabs eagerly imported; blank Suspense fallback. | Split tab/policy bundles, lazy simulator/mascot and visible loading feedback; removed render-time debug logging. |
| Medium | Cloud mentor errors masqueraded as local AI answers. | Honest unavailable/empty-response messaging in production, retaining learning navigation. |
| Medium | Curriculum tests asserted the previous 3-track/15-lesson snapshot. | Tests now validate seven authored tracks, 35 lessons, 23 tool engines, and release readiness separately. Browser tests updated to the new flow and membership dialog. |

Design details: preserved orange/obsidian cards and winding trail, added a page heading and accessible progress, corrected milestone labels, respected reduced motion for the repeating start animation, and used a native membership dialog for focus/Escape behavior. Unimplemented topics are excluded from new onboarding choices.

## Verification

- `npm run test:all`: TypeScript, progression, journey/payment safeguards, curriculum, social, opportunity cost, Firestore/Storage and functions emulators passed. AI is mocked in emulator tests; these are not live-service acceptance.
- `npm run test:apply`: five Investing lessons through Apply, optional empty reflection, personal rewards, reload and five saved wins passed; zero page errors.
- `npm run test:shell`: Learn/Apply/Compete/Profile, membership unavailable state and Escape, and horizontal-overflow checks at 320/390/768/1440 px passed.
- Production build and release preflight passed. No app dependencies added.
- Main JavaScript chunk before/after restoring tab splitting within this pass: 766.10 → 427.55 KB (gzip 243.37 → 144.38 KB). This redistributes code into on-demand chunks; it is not a reduction in all downloaded app code or a device-speed guarantee.
- Local browser navigation after changes: 102–413 ms in the latest shell run. No physical-device/Android rebuild or field Core Web Vitals measurement in this pass.
- Screenshots inspected under `test-results/app-shell/` (ignored generated evidence).

## Remaining requirements, in order

1. Deploy and accept the compatible backend, rules and account flows against a real test account; confirm second-device recovery and interruption handling. No production services were changed here.
2. Add audited canonical Apply missions for the additional authored tracks. Give every advertised course its own matching curriculum instead of reusing unrelated lessons. Validate sources and lesson quality with representative users before claiming institutional curation or mastery.
3. Implement authenticated, idempotent server entitlement synchronization before enabling checkout. Remove unsupported discount/trial, donation and success-rate claims from retained gated marketing templates. `CHECKOUT_ENABLED` is deliberately false, not a user-configurable unlock.
4. Finish catalog-dialog focus management, broad Spanish localization, complete onboarding scenario tests (including old saved drafts), field-goal midnight refresh/account-timezone consistency, and narrow-screen content density. Current daily calculation updates on render and uses the device calendar; an app kept open across midnight needs dedicated coverage.
5. Verify notification scheduling, native sign-in, Screen Time permissions, keyboard/back navigation and 3D performance on real Android hardware. Existing emulator/build evidence from earlier work does not certify this version.
6. Complete weekly league cohort/promotion logic and moderation acceptance. A leaderboard UI is not evidence of a complete league engine.
7. Measure onboarding completion, first meaningful Apply completion, day-1/day-7 retention, error rate and perceived clarity with users. Define success thresholds from a baseline; no conversion or enjoyment claim has been proven by these code tests.

Large retained authoring/marketing files still require deeper editorial and structural review. This pass prioritized their integration boundaries and obvious user-facing failures; it does not claim an exhaustive line-by-line review of all 30 changed files.

## Astra and efficiency

Consulted [OpenAI's Astra model guide](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra). Applied focused context, clear scope and risk-proportionate checks. Used RTK for compact shell output, reused existing tests/dependencies and worked solo. The local Sol-only routing requirement conflicts with the user's explicit Astra request, which took precedence. No model settings, billing or API integration were changed; no exact token-savings claim is made.

## Handoff

Changes are isolated on `codex/september-quality-pass` for review. Do not treat this branch as authorization to deploy or enable payments. Review the diff and reconcile concurrent work before merging with `main`.
