# T1GER Onboarding Redesign

Date: 2026-08-06

## Summary

Replace T1GER's overlapping onboarding implementations with one canonical, mobile-first flow inspired by the pacing and interaction quality of Duolingo's onboarding while remaining visually and verbally original to T1GER.

The redesigned onboarding must explain the Learn-to-Apply product loop, personalize the Investing path, let the user experience a real lesson before account friction, request permissions in context, and hand the user into a useful first dashboard state. It must work in the web preview and in the Capacitor iOS and Android shells.

## Goals

- Make T1GER's value proposition understandable within the first two screens.
- Collect only information that changes the Investing learning path or daily experience.
- Demonstrate value with a real micro-lesson before requiring account creation or payment.
- Explain the Learn, Apply, and Verified Progress loop before the user reaches the dashboard.
- Save onboarding progress safely so an interrupted session can resume.
- Use one cohesive tiger guide, one visual system, and deliberate motion throughout the flow.
- Connect answers to real profile, curriculum, reminder, authentication, and access state.
- Preserve a free path and avoid fake success states when authentication, permissions, or payment fail.

## Non-goals

- Copying Duolingo's artwork, mascot, green palette, text, sounds, or proprietary screen layouts.
- Launching Business, AI, or other curriculum verticals during Investing onboarding.
- Rebuilding the global curriculum, authentication, leaderboard, or subscription systems beyond the integration work required by onboarding.
- Adding acquisition-survey questions that do not personalize the product experience.
- Awarding leaderboard-eligible progress for unverified onboarding interactions.

## Reference Findings

The reviewed Duolingo flow contains 20 captured screens and an 85-second motion recording. Its reusable strengths are:

- A recognizable guide establishes personality before questions begin.
- Each screen asks for one decision and gives immediate visual confirmation.
- A persistent progress bar makes a relatively long flow feel finite.
- Short dialogue screens alternate with denser selection screens to vary pacing.
- The system shows specific future value before asking for permissions or payment.
- Native permission prompts appear only after an explanatory pre-prompt.
- Premium and placement choices are presented as understandable paths, not surprises.
- Motion is restrained: spring entrances, progress interpolation, selection feedback, mascot reactions, and short celebratory moments.

T1GER will adopt these principles without reproducing protected expression.

## Current-State Findings

Two implementations overlap:

- `src/components/OnboardingFlow.tsx` is the active route. It has ten steps, a real first mission, embedded authentication, a web notification request, and data consent. Its presentation is visually disconnected from the redesigned dark-teal application and most selection screens only write shallow profile values.
- `src/components/InvestmentOnboarding.tsx` is unused. It more closely resembles the Duolingo pacing, but includes unlaunched topics, a simulated premium path, a notification button that does not request permission, a `ready` state that is never rendered, and another independent answer model.

The duplicate implementations create inconsistent behavior and make future onboarding changes risky. The redesign will keep a single exported `OnboardingFlow` and remove the obsolete duplicate after its useful ideas are incorporated.

## Approved Fourteen-Stage Journey

### 1. Arrival

A full-screen T1GER brand moment introduces the tiger guide and the promise: learn investing, then use it in the real world. Primary action is `Build my path`; secondary action is `I already have an account`.

Motion: the tiger settles into frame with a short spring, the wordmark fades upward, and the primary action appears last. Motion respects `prefers-reduced-motion`.

### 2. Guide introduction

The tiger explains that a few short decisions will create the user's first investing plan and that the user will try a lesson before signing up.

### 3. Desired outcome

Single-select choices map to real goals:

- Make my first investment
- Build long-term wealth
- Learn to analyze companies
- Prepare for retirement

The selected card confirms immediately, pauses briefly for recognition, and advances.

### 4. Experience baseline

The user reports whether they are new, know the basics, or actively invest. This answer changes the recommended starting point but does not skip the knowledge calibration.

### 5. Application preference

Multi-select choices identify how the user most wants to apply learning: evaluate a stock, build a portfolio, manage risk, or understand market news. This controls mission emphasis and the wording of the plan reveal.

### 6. Knowledge calibration

Two short, deterministic investing questions run inside one stage. They test concept recognition instead of asking the user to rate themselves. Correctness and the experience baseline produce a `beginner`, `foundation`, or `accelerated` starting recommendation.

Answers must come from local curriculum content; no AI or network request is required. Wrong answers receive encouraging, non-punitive feedback from the guide.

### 7. Daily goal

The user chooses 5, 10, 15, or 20 minutes per day. Ten minutes is recommended. The screen translates the choice into a concrete weekly result, such as lessons and Apply missions, before the user commits.

### 8. Plan construction

An automatic 2.5- to 3-second sequence builds the path using three meaningful status lines:

1. Calibrating the starting level
2. Matching Learn and Apply missions
3. Setting the daily rhythm

Each line completes visibly. The sequence is skippable for returning/resuming users and collapses to a static completed state with reduced motion.

### 9. Plan reveal

The user sees a personalized first-week path with three connected nodes:

- Learn a core concept
- Apply it in paper trading or structured reflection
- Earn verified XP when evidence qualifies

The reveal explains why the selected starting level and daily goal produced this path. A drawn route line and staggered node entrances provide the primary delight moment.

### 10. First micro-lesson

The onboarding launches a real deterministic lesson from the Investing curriculum. It uses the same lesson content and completion contract as the production learning loop, presented in a compact onboarding shell.

The lesson must not require Gemini, Firebase, or payment. Its completion is idempotent so reloading or resuming cannot award the reward twice.

### 11. Success and Apply preview

The user receives onboarding XP that is visible in their personal profile but not counted as verified leaderboard XP. A short preview shows that the next step will turn the concept into a paper-trading or reflection mission.

Motion: compact confetti, reward count-up, tiger celebration, and a reduced-motion static equivalent.

### 12. Save progress

Account creation appears only after value has been demonstrated. Google, Apple, email/password, and email-link authentication use the existing authentication service. Terms and privacy links remain available in the account surface.

Development-only demo accounts remain available locally but must advance through the same success callback as real authentication. Authentication failure leaves all onboarding answers and lesson state intact and provides a clear retry message.

### 13. Reminder setup

The screen explains that reminders protect the user's chosen daily goal. Only an explicit `Enable reminders` action triggers the operating-system permission request.

- Native iOS and Android use a Capacitor local-notification adapter.
- Browser preview uses the Web Notifications API when available.
- Unsupported, denied, and dismissed states all continue safely without claiming reminders are enabled.

### 14. Access choice and handoff

The user chooses between the real free plan and Super T1GER. Free access remains a clear first-class option. The premium action opens the existing subscription flow and never marks a purchase successful without confirmation from the subscription service.

After either valid choice, onboarding writes its final state once, shows a brief personalized ready state, and transitions to the Today dashboard. The first dashboard must reflect the selected daily goal, starting level, and next Learn or Apply action.

## Information Architecture

`OnboardingFlow` remains the public entry component used by `App.tsx`, but it becomes a small orchestrator rather than a collection of large render functions.

Proposed units:

- `OnboardingFlow`: step state, navigation, persistence, finalization, and external integrations.
- `OnboardingShell`: safe-area layout, progress bar, back navigation, scroll behavior, and bottom action area.
- `TigerGuide`: consistent mascot artwork, emotional state, speech bubble, and reduced-motion behavior.
- `OnboardingChoiceCard`: single- and multi-select interaction with accessible selected state.
- `PlanBuilder`: timed status sequence and resume behavior.
- `PathReveal`: Learn, Apply, and Verified Progress visualization.
- `KnowledgeCalibration`: the two-question deterministic diagnostic and score calculation.
- `OnboardingLesson`: adapter around the first real lesson and idempotent reward behavior.
- `ReminderPermission`: browser/native permission adapter with normalized results.

Step metadata, forward navigation, back navigation, and progress calculation will be defined in one ordered configuration. Unsupported steps will not silently fall through.

## State and Data Flow

The flow maintains a versioned draft under `t1ger_onboarding_draft_v1`. The draft contains only onboarding choices, current step, diagnostic score, and local completion flags. It contains no password, authentication token, permission token, or payment information.

The draft maps to existing user fields:

- Desired outcome → `goal`
- Daily goal → `dailyTime`
- Experience and calibration → `experienceLevel` and the recommended curriculum start
- Application preferences → `investmentProfile` and `personalizedPlan.focusAreas`
- Investing launch vertical → `primaryTrack: 'investing'`
- Current resumable step → `onboardingStep`
- Reminder result → `notificationPreferences`

`onboardingComplete` remains false until the final handoff succeeds. Finalization is idempotent and clears the draft only after the persisted profile update succeeds.

The personalized plan uses curriculum IDs that exist in `missionBank.ts`. It will not reference the obsolete `inv-e1` identifier or invent future content.

## Visual Direction

The UI uses T1GER's deep teal and orange system rather than Duolingo green:

- Deep teal provides the immersive background and brand frame.
- Warm ivory surfaces preserve readability for questions and lessons.
- Orange is reserved for primary actions, progress, selected states, and celebration.
- Emerald indicates verified or correct states; red is reserved for recoverable errors.

Typography uses sentence case for conversational prompts, strong weight for hierarchy, and compact labels only where the information is genuinely metadata. Buttons and cards have tactile depth without excessive glass effects or decorative gradients.

The current mascot assets vary noticeably in character design. The implementation will use or create one cohesive clay-style tiger family and exclude visually inconsistent tiger variants from onboarding. Artwork remains T1GER-original.

## Motion and Interaction Rules

- Screen transitions use direction-aware horizontal movement and opacity with a short spring.
- The progress bar interpolates rather than jumping.
- Choice cards compress on press and confirm with border, fill, icon, and optional haptic feedback.
- The tiger uses subtle idle breathing or floating, a blink cadence, and explicit emotional reactions to answers.
- Plan status lines and path nodes enter sequentially to communicate causality.
- Success motion runs once and never blocks navigation.
- No infinite decorative animation runs when reduced motion is requested.
- All timed auto-advance behavior has a visible completion state and remains keyboard accessible.

## Accessibility

- Every interactive control has a descriptive accessible name and a minimum 44-by-44-point target.
- Selected cards expose `aria-pressed` or the appropriate radio/checkbox semantics.
- Focus is moved to the new screen heading after navigation.
- Text and controls meet WCAG AA contrast.
- Dynamic feedback is announced through a polite live region.
- Layout supports 320-pixel-wide screens, large text, safe-area insets, and keyboard appearance.
- Reduced-motion users receive equivalent feedback without spatial animation.

## Error and Edge-Case Handling

- Refreshing resumes the last safe onboarding stage with previous choices restored.
- Going back preserves answers and recalculates progress from the ordered step list.
- A corrupt or version-mismatched draft is discarded without blocking onboarding.
- Missing curriculum content shows a recoverable message and returns to the plan reveal rather than crashing.
- Authentication errors preserve the lesson completion and answers.
- Permission denial does not loop or repeatedly prompt.
- Payment cancellation returns to the access choice with the free option intact.
- Profile-save failure keeps the draft and offers retry; it does not enter the dashboard with incomplete state.
- Returning authenticated users can sign in from Arrival and skip onboarding only when their stored profile is already complete.

## Verification Strategy

### Automated checks

- TypeScript checking and production build.
- Unit tests for step order, progress calculation, draft migration, calibration scoring, personalized-plan mapping, and idempotent finalization.
- Component tests for selection semantics, back navigation, reduced motion, authentication failure, notification outcomes, and free-plan continuation.
- A browser smoke test that completes all fourteen stages at a mobile viewport and confirms the Today dashboard receives the selected state.

### Manual checks

- iPhone and Android-sized viewports, including a 320-pixel width.
- Light/dark operating-system settings while retaining the intentional T1GER theme.
- Keyboard navigation and screen-reader labels.
- Reduced-motion behavior.
- Browser notification granted, denied, dismissed, and unsupported states.
- Native permission prompt on iOS and Android after Capacitor sync.
- Authentication cancellation and retry.
- Premium checkout cancellation and free-plan completion.

## Acceptance Criteria

- Only one production onboarding implementation remains.
- All fourteen stages are reachable, reversible where appropriate, and resumable.
- The first lesson uses real Investing content and cannot double-award rewards.
- User answers change the saved plan and the first dashboard state.
- Authentication, reminder, and premium states reflect real provider results.
- No unlaunched topic is presented as available.
- No onboarding reward is incorrectly counted as verified leaderboard XP.
- The complete flow passes type checking, production build, automated checks, and mobile browser smoke testing.
- The redesigned flow is available locally at `http://127.0.0.1:3000/?forceOnboarding=1` after implementation.

## Implementation Boundary

The implementation may refactor onboarding-specific components, profile mapping, notification adapters, lesson integration, and the onboarding entry condition. Unrelated screens and unrelated user changes in the working tree will remain untouched.
