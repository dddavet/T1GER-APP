# T1GER Local-First Gamified Productivity Plan

## Strategic Direction

The next version of T1GER should treat productivity as a transparent personal operating system, not as a closed cloud habit tracker. The product direction from the research is clear:

- The app must work when the network fails.
- The user must be able to export and migrate progress.
- Game mechanics must unlock real utility, not only cosmetic rewards.
- Verification should move from self-reporting to evidence and API-based signals.
- Recovery systems should protect consistency without lying about missed days.

## Phase 1: Data Sovereignty Foundation

Status: started.

Implemented:

- Added JSON export/import controls in Profile > System Preferences.
- Export includes local T1GER storage, profile context, and brain state.
- Import restores local T1GER data and reloads the app.

Next:

- Add Markdown export for human-readable daily logs.
- Add export preview before download.
- Add an encrypted backup option for cloud sync.
- Add a “local-only mode” toggle that disables Firestore writes for privacy-focused users.

## Phase 2: True Local-First State Engine

Current state:

- `BrainContext` already saves progress to `localStorage` first.
- Firestore is used as sync, but the app still treats cloud sync as a normal background path.

Build:

- Introduce a repository layer:
  - `LocalProgressRepository`
  - `FirestoreSyncAdapter`
  - `ConflictResolver`
- Every user action should write locally first and enqueue a sync job.
- Firestore should receive deterministic patches, not full uncontrolled state overwrites.
- Add a sync status surface:
  - `Saved on device`
  - `Sync pending`
  - `Synced`
  - `Sync failed, retrying`

Success criteria:

- Completing a mission works offline.
- Tactical proof text is saved offline.
- The app can be closed and reopened with no data loss.
- Sync resumes when the network returns.

## Phase 3: Real-Utility XP Economy

Problem:

- Cosmetic-only economies decay fast.

Build:

- Keep coins/XP, but attach them to useful unlocks:
  - streak shields
  - focus sessions
  - blocked-site unlock windows
  - AI coach deep-dive credits
  - premium templates and tactical playbooks
- Add a reward ledger so every XP/coin mutation is auditable.

Future utility:

- Browser extension or desktop helper for site blocking.
- Optional financial commitment contracts after the prototype matures.

Success criteria:

- XP has a reason to exist beyond vanity.
- User can see exactly why rewards were earned.
- Rewards can be verified against real task completion events.

## Phase 4: Automated Verification APIs

Problem:

- Manual checkoffs create admin fatigue and make self-sabotage easy.

Build:

- Add a verification event model:
  - `source`
  - `externalId`
  - `taskId`
  - `verifiedAt`
  - `confidence`
  - `reward`
- Start with low-risk integrations:
  - GitHub commit detection for coding missions.
  - Todoist completed task webhooks.
  - Notion status changed to Done.
- Later:
  - Apple Health / Google Fit workout completion.
  - Calendar deep-work block completion.

Success criteria:

- A GitHub commit can automatically complete a coding mission.
- A Todoist completion can grant XP without manual proof.
- Manual proof remains available as fallback.

## Phase 5: Inverse Energy Slots

Problem:

- Strict daily streaks punish legitimate fatigue, illness, travel, or high-output days.

Build:

- Add `energyBank` to `BrainState`.
- Beast days can generate surplus energy credits.
- Rest/low-energy days can spend credits to preserve consistency.
- The UI must show the truth:
  - `Earned surplus`
  - `Used recovery credit`
  - `Skipped without credit`

Rules:

- Cap stored energy to avoid hoarding.
- Credits should preserve streaks but not inflate mastery.
- Credits should be harder to earn than normal completions.

Success criteria:

- Users can recover without feeling the system is fake.
- The streak system rewards rhythm, not perfectionism.

## Phase 6: Built-In Focus Audio

Build:

- Add a Focus view or Pomodoro module with:
  - brown noise
  - rain/noise options
  - optional 40 Hz gamma binaural mode
  - timer presets
  - local session history

Implementation note:

- Use Web Audio API generated tones/noise instead of streaming files.
- Keep volume, mode, and timer state local-first.
- Include a clear disclaimer that binaural/gamma effects are optional focus aids, not medical claims.

Success criteria:

- User can start a focus block without Spotify/YouTube.
- Focus sessions can grant XP when completed.
- Focus blocks work offline.

## Phase 7: iOS Prototype Loop

Current repo state:

- Capacitor is already configured.
- `ios/` exists.
- Scripts exist:
  - `npm run ios:sync`
  - `npm run ios:open`

Limitation:

- The real iOS Simulator requires macOS with Xcode. This Windows workspace can build and sync the web bundle, but cannot boot an iPhone simulator locally.

Mac workflow:

1. Pull the latest branch.
2. Run `npm install`.
3. Run `npm run ios:sync`.
4. Run `npm run ios:open`.
5. In Xcode, select an iPhone simulator.
6. Build and run.
7. Use the Build iOS Apps simulator browser workflow to mirror the simulator into Codex if running from a macOS Codex session.

Success criteria:

- The app launches in an iPhone simulator.
- Auth screen, onboarding, profile export/import, and daily mission flows are usable at iPhone dimensions.
- The app survives offline mode for core progress actions.

## Recommended Build Order

1. Finish local-first repository layer.
2. Add data export/import polish and Markdown export.
3. Add energy bank to tactical state.
4. Add reward ledger.
5. Add focus audio/Pomodoro.
6. Add GitHub/Todoist verification adapters.
7. Harden iOS safe areas, keyboard behavior, auth redirects, and offline storage.

