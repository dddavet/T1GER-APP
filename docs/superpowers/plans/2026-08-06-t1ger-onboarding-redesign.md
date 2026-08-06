# T1GER Onboarding Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current localhost onboarding with a polished fourteen-stage Investing onboarding that matches the approved T1GER design spec.

**Architecture:** Keep `OnboardingFlow` as the public entry point used by `App.tsx`, but make it the canonical orchestrator for state, draft persistence, profile mapping, lesson completion, reminder permission, and final handoff. Implement focused local subcomponents inside the onboarding module first to avoid widening the dirty worktree, then extract later only if the file becomes difficult to maintain.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS v4 utility classes, `motion/react`, `lucide-react`, existing `AuthContext`, existing `MissionEngine`, existing `missionBank.ts`.

## Global Constraints

- The flow must use one production onboarding implementation through `src/components/OnboardingFlow.tsx`.
- Do not copy Duolingo artwork, mascot, green palette, text, sounds, or proprietary screen layouts.
- The launch vertical is Investing only; do not present Business, AI, or other topics as available.
- Draft state must be versioned under `t1ger_onboarding_draft_v1` and contain no passwords, auth tokens, permission tokens, or payment information.
- `onboardingComplete` remains false until final handoff succeeds.
- The first lesson must use a real mission ID from `src/services/missionBank.ts`; use `inv-m1-l1`.
- Onboarding XP must not be counted as `verifiedXP`.
- Browser reminders use the Web Notifications API when available; unsupported, denied, and dismissed states continue safely.
- Premium choice must not fake purchase success; free access must remain first-class.
- The local review URL is `http://127.0.0.1:3000/?forceOnboarding=1`.
- Preserve unrelated dirty worktree changes.

---

### Task 1: Branch, Baseline, and File Boundary

**Files:**
- Read: `src/components/OnboardingFlow.tsx`
- Read: `src/App.tsx`
- Read: `src/contexts/AuthContext.tsx`
- Read: `src/services/missionBank.ts`
- Modify: none

**Interfaces:**
- Consumes: existing `OnboardingFlow({ onComplete }: { onComplete: () => void })`
- Produces: confirmed branch and baseline command output for later comparison

- [x] **Step 1: Create implementation branch**

Run: `git switch -c codex/t1ger-onboarding-redesign`
Expected: branch is `codex/t1ger-onboarding-redesign`.

- [ ] **Step 2: Run baseline type/build check**

Run: `npm run build`
Expected: PASS, or record pre-existing failures before edits.

- [ ] **Step 3: Confirm active route**

Inspect `src/App.tsx` and verify `?forceOnboarding=1` renders `OnboardingFlow`.
Expected: active route uses `OnboardingFlow`.

### Task 2: Canonical Onboarding State and Mapping

**Files:**
- Modify: `src/components/OnboardingFlow.tsx`

**Interfaces:**
- Consumes: `updateAppUser(data: Partial<AppUser>): Promise<void>` from `useAuth`
- Produces:
  - `type OnboardingStep`
  - `type OnboardingDraft`
  - `const STEP_ORDER: OnboardingStep[]`
  - `function calculateCalibration(experience, answers): 'beginner' | 'foundation' | 'accelerated'`
  - `function buildPersonalizedProfile(draft): Partial<AppUser>`

- [ ] **Step 1: Define the fourteen steps**

Replace the old ten-step union with:

```ts
type OnboardingStep =
  | 'arrival'
  | 'guide'
  | 'outcome'
  | 'experience'
  | 'application'
  | 'calibration'
  | 'daily_goal'
  | 'plan_build'
  | 'plan_reveal'
  | 'micro_lesson'
  | 'success'
  | 'save_progress'
  | 'reminders'
  | 'access';
```

- [ ] **Step 2: Add versioned draft helpers**

Implement `loadDraft`, `saveDraft`, and `clearDraft` using the exact key `t1ger_onboarding_draft_v1`. Invalid JSON or version mismatch must return the default draft.

- [ ] **Step 3: Add profile mapping**

Implement `buildPersonalizedProfile(draft)` so it writes `primaryTrack: 'investing'`, `goal`, `dailyTime`, `experienceLevel`, `investmentProfile`, `personalizedPlan`, and `onboardingStep`.

- [ ] **Step 4: Validate with TypeScript**

Run: `npm run build`
Expected: TypeScript accepts the new local types and helpers.

### Task 3: Polished Shell, Guide, and Choice System

**Files:**
- Modify: `src/components/OnboardingFlow.tsx`

**Interfaces:**
- Consumes: `STEP_ORDER`, draft state, `motion`
- Produces:
  - `OnboardingShell`
  - `TigerGuide`
  - `ChoiceCard`
  - `PrimaryAction`

- [ ] **Step 1: Implement the mobile shell**

Add a fixed full-screen dark teal shell with safe-area padding, a progress bar after Arrival, directional transitions, back navigation, and a bottom action area.

- [ ] **Step 2: Implement the tiger guide**

Use one cohesive CSS/HTML clay-style tiger badge in the onboarding itself and avoid inconsistent image assets.

- [ ] **Step 3: Implement choice cards**

Support single-select and multi-select states with `aria-pressed`, visible selected state, a check icon, and a minimum 44px target.

- [ ] **Step 4: Verify responsive layout**

Run: `npm run build`
Expected: PASS. In browser later, verify 320px width does not overlap.

### Task 4: Fourteen Screens and First Lesson

**Files:**
- Modify: `src/components/OnboardingFlow.tsx`

**Interfaces:**
- Consumes: `MISSION_BANK.find((mission) => mission.id === 'inv-m1-l1')`
- Produces: all fourteen reachable stages

- [ ] **Step 1: Implement stages 1 through 7**

Build Arrival, Guide, Desired outcome, Experience baseline, Application preference, Knowledge calibration, and Daily goal using the approved copy and mappings.

- [ ] **Step 2: Implement stages 8 and 9**

Build Plan construction with three visible status lines and Plan reveal with Learn, Apply, Verified Progress nodes.

- [ ] **Step 3: Implement stage 10**

Render `MissionEngine` with mission `inv-m1-l1`; if it is missing, show a recoverable error that returns to Plan reveal.

- [ ] **Step 4: Implement stage 11**

Show personal onboarding XP, Apply preview, and do not touch `verifiedXP`.

- [ ] **Step 5: Implement stages 12 through 14**

Embed `AuthGate`, implement reminder permission handling, show Free and Super T1GER access choices, and finalize through `updateAppUser`.

- [ ] **Step 6: Validate navigation**

Manually traverse forward and backward using `?forceOnboarding=1`.
Expected: no unsupported step, answers persist, back navigation preserves state.

### Task 5: Finalization, Validation, and Localhost

**Files:**
- Modify: `src/components/OnboardingFlow.tsx`

**Interfaces:**
- Consumes: `onComplete`, `updateAppUser`
- Produces: working localhost onboarding

- [ ] **Step 1: Make finalization idempotent**

Guard completion with a `finalizing` state. On success, clear the draft and call `onComplete()`. On failure, keep draft and show retry text.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Start or reuse dev server**

Run: `npm run dev`
Expected: Vite serves at `http://127.0.0.1:3000/` or a reported alternate port.

- [ ] **Step 4: Browser smoke test**

Open `http://127.0.0.1:3000/?forceOnboarding=1`, complete the onboarding path through free access, and confirm the dashboard appears.

- [ ] **Step 5: Report**

Report the changed files, verification result, branch, and URL.

## Self-Review

- Spec coverage: Tasks 2 through 5 cover state, fourteen stages, lesson, rewards, auth, reminders, access, finalization, and localhost verification.
- Placeholder scan: No `TBD`, `TODO`, or undefined later work remains in the plan.
- Type consistency: All named functions and state types are produced in Task 2 before use in later tasks.
