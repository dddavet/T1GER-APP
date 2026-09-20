# T1GER Design System

## Experience Direction

T1GER is a premium mobile learning product with a dark technical identity. It combines clear progression, active learning, restrained game energy, and tactile interaction. The design should help a learner answer three questions immediately:

1. What am I learning?
2. Where am I in the path?
3. What should I do next?

The visual system supports **Discover → Learn → Apply → Master → Return**. It must not frame the product as founder training, a hustle dashboard, or a generic self-improvement app.

## Brand Character

- **Tone:** ambitious, curious, modern, educational, premium.
- **Voice:** concise, specific, evidence-aware, encouraging without hype.
- **Mascot:** a capable learning guide, not a toy, threat, or status symbol.
- **Motion:** reserved for orientation, feedback, state changes, and rewards.
- **Avoid:** “Predator Pride,” hustle-bro copy, fabricated statistics, fake urgency, excessive neon, plastic extrusion, and decorative dashboards.

## Core Tokens

```css
:root {
  --bg-app: #09090B;
  --bg-surface: #121216;
  --bg-raised: #18181D;
  --text-primary: #FFFFFF;
  --text-secondary: #A1A1AA;
  --text-muted: #71717A;
  --border-subtle: rgba(255, 255, 255, 0.10);
  --accent-main: #FF7300;
  --accent-dark: #CC5C00;
  --success: #10B981;
  --danger: #FF4B4B;
  --info: #06B6D4;
}
```

Use Outfit for interface and display text. Use JetBrains Mono only for compact labels, timers, XP, ratios, and other tabular values. Do not use monospaced uppercase text for paragraphs.

## Surface and Control Language

T1GER uses obsidian surfaces with subtle titanium/specular separation:

- One dominant surface per hierarchy level.
- Borders normally use `rgba(255,255,255,.08–.15)`.
- Raised controls may use `inset 0 1px 0 rgba(255,255,255,.20–.35)`.
- Shadows communicate elevation, not glow.
- Orange identifies the primary next action; it is not ambient decoration.
- Primary controls compress to approximately `scale(.97)` on press and remain at least 44×44 px.
- Nested circular icons may reinforce direction inside a primary button.
- The bottom dock uses concentric bezels and one quiet active indicator.

Avoid flat neon glows, thick toy-like lower borders, white/light app backgrounds, and unnecessary glass layers. Blur should be used sparingly because it can reduce legibility and increase mobile rendering cost.

## Information Hierarchy

Every major screen has one page-level purpose, one unmistakable next action, current progress in plain language, and secondary exploration that does not compete with the main action.

### Learn

- Show the selected domain and path.
- Show the learner’s current position and next available node.
- Distinguish Learn, Apply, and Master/review states with text as well as color.
- Make source attribution visible but secondary.
- Keep the winding path and prerequisite gating.

### Apply

- Explain why the action matters, what to do, and what “done” means.
- Reuse the tool created during Learn when available.
- Distinguish self-reported personal progress from verified competitive progress.
- Show completed actions as useful history, not an unexplained trophy wall.

### Master

- Present review as memory maintenance, not remediation or failure.
- Explain that review does not duplicate completion rewards.
- Keep the next retrieval task short and specific.

### Onboarding

- Begin with curiosity and the learning promise.
- Let the user choose a subject; Investing is the flagship default, not a forced choice.
- Explain Learn → Apply → Master before access or membership decisions.
- Never claim unsupported income, success, retention, or speed improvements.
- Do not assume the user is a founder, entrepreneur, or AI learner.

## Motion and Feedback

- Respect `prefers-reduced-motion` through `MotionConfig reducedMotion="user"` and local component behavior.
- Use haptics and sound for deliberate taps, feedback, and meaningful completion.
- Avoid infinite pulse/glow animations on ordinary controls.
- Loading states explain what is happening and preserve the user’s place.
- Success animation follows canonical completion; it must not imply a server reward before confirmation.

## Accessibility

- Target WCAG 2.2 AA contrast.
- Maintain visible focus and logical keyboard order.
- Use semantic buttons, headings, progress bars, lists, and dialogs.
- Provide accessible names for icon-only controls.
- Keep touch targets at least 44×44 px.
- Never communicate locked/current/completed/review state through color alone.
- Spanish and English strings must preserve meaning and fit at 320 px without hiding the primary action.

## Architecture Boundaries

The design layer may change labels and presentation without casually renaming data contracts. Internal names such as `BuildTab`, missions, artifacts, submissions, and tactical fields may remain until a dedicated migration is justified and tested. Firebase collections, progression rules, FSRS state, RevenueCat, notifications, and the 3D mascot are product infrastructure, not styling targets.
