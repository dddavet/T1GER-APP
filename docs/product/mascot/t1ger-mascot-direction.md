# T1GER Mascot Direction

## Decision

T1GER uses a head-only tiger mascot in the product UI. The character should feel approachable, confident, and emotionally readable without becoming babyish, Disney-like, or a generic glossy toy.

The approved character reference is stored beside this document as `tiger-head-concept-v1.png`. The app renders a true volumetric GLB (`public/mascot/t1ger-head-v1.glb`) built from that direction. The reference image is not rendered in the product.

## What we are adapting from Duolingo

The official Duolingo illustration guidance provides useful system principles without requiring T1GER to copy Duo or Duolingo's visual identity:

- Build characters from a small set of rounded basic shapes.
- Create rhythm by mixing shape sizes and visual weights.
- Use the fewest shapes that still communicate the character.
- Keep the perspective visually flat so the character reads at small sizes.
- Use only a few colors so the silhouette remains legible.
- Use geometric pill-shaped eyes and avoid mechanically centered pupils.
- Let eyes, pupils, eyelids, brows, and mouth carry emotional state.
- Prefer an asymmetrical mouth because it feels more alive.
- Avoid static, expressionless posing.

Sources:

- https://design.duolingo.com/illustration/shape-language
- https://design.duolingo.com/illustration/characters
- https://design.duolingo.com/illustration/duo

## T1GER shape language

- One broad, soft tiger head silhouette.
- Two circular ears partially concealed behind the head.
- Three forehead stripes with varied length and angle.
- Two side stripes per cheek at small sizes; a third is optional only for large renders.
- Two vertical rounded-pill eyes with deliberately offset pupils.
- Two warm-ivory muzzle forms.
- One compact rounded-triangle terracotta nose.
- One short asymmetrical smile.
- Two whiskers per side for normal product sizes.

Target palette:

- Face: `#FF8931`
- Ear and stripe: `#583D36` / `#4C332E`
- Muzzle: `#FFE2BA`
- Nose: `#AD4E3C`
- Eye: `#181B1D`

The mascot keeps the same identity colors in every state. Emotion changes pose and expression, not the character's body color.

## Product expression states

- `idle`: slow breathing, subtle head turn, occasional ear twitch and blink.
- `happy`: slightly compressed eyes, raised brows, stronger half-smile, small upward bounce.
- `celebrate`: happy expression with a quicker but short bounce.
- `thinking`: head tilt, one raised brow, gaze offset.
- `mistake`: lowered eyelids, brows angled inward, small downward head movement.
- `warning`: the mistake posture with a restrained horizontal shake.
- `beast`: focused brows, reduced eye height, controlled micro-movement rather than aggressive color changes.

## Current product implementation

- `public/mascot/t1ger-head-v1.glb` is the default model on onboarding, lessons, missions, and any other screen using `T1gerMascot3D`.
- The GLB contains separate volumetric nodes for the head, ears, eyes, highlights, brows, muzzle, nose, forehead and cheek stripes, mouth, smile, and whiskers.
- Materials use a restrained soft-clay PBR response. Lighting uses a warm key, cool fill, and neutral tone mapping over the transparent canvas.
- Runtime reactions animate the actual model nodes: blink, brow angle, ear twitch, head turn, tilt, breathing, bounce, and warning shake.
- The model is 870 KB and approximately 19,980 rendered triangles, keeping it suitable for mobile use.
- `npm run generate:mascot` rebuilds the asset deterministically from `scripts/generate-t1ger-mascot.mjs`.
- `modelPath` remains available for testing later model revisions without rewriting product screens.

## Contextual behavior contract

The mascot is a product guide, not a model viewer. Product screens never expose manual emotion controls or technical model labels.

- **Learn:** thinking before a lesson, happy when learning is complete, and celebrating when the Learn + Apply loop is complete.
- **Apply:** thinking while the mission is locked, focused when the action unlocks, and celebrating only after evidence is saved.
- **Compete:** encouraging before the first verified action and proud when verified XP exists.
- **Profile:** calm by default, becoming proud when the user's streak or dual-loop momentum is strong.
- **Inside a lesson or mission:** answers and workflow events temporarily drive `thinking`, `celebrate`, `mistake`, `warning`, and `beast` reactions.
- **Global overrides:** a recent failed attempt can trigger a retry response; an unfinished late-day session can trigger a restrained streak warning.

All copy must describe the user's next meaningful action. It must never claim completion, evidence, or verification unless the corresponding durable product state confirms it.

## Future sculpting upgrade

The current asset already provides real parallax and independent expression nodes. If a dedicated character artist later creates a hand-sculpted Blender version, preserve these requirements:

1. Model the same small set of separate, rounded forms.
2. Use four or fewer matte materials and avoid realistic fur textures.
3. Add morph targets for pupil direction, smile, concern, and focused eyes while preserving the existing blink and brow node contract.
4. Use a minimal rig for head turns and ear motion.
5. Export a compressed GLB under roughly 1.5 MB and keep the head below roughly 20,000 triangles.
6. Test at 64 px, 128 px, and onboarding-hero size before accepting details.
7. Use the existing `modelPath` entry point and node names so the sculpt can replace this GLB without rewriting product screens.

The implementation should remain an isolated Three.js leaf component so character animation does not cause React page re-renders.
