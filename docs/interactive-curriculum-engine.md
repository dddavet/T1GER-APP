# T1GER Interactive Curriculum Engine

## Product contract

LEARN is an execution game, not a content library. Every node is an **Orb**: a compact, coherent mental model that lasts approximately three minutes and has four mandatory phases in this exact order:

1. `impact` — 45 seconds: one high-density idea and one tactical rule.
2. `challenge` — 60 seconds: a decision with immediate corrective feedback.
3. `action` — 60 seconds: a live micro-tool that produces a saved artifact.
4. `reward` — 15 seconds: verified XP, streak protection, path progression, and T1GER rescue.

A node cannot be completed until the challenge is mastered and the action artifact is committed. The resulting mission is recorded by `BrainContext`, counted as verified XP by `T1gerContext`, published to the Squad feed when a signed-in user is available, and passed through the existing daily rescue logic in `petEngine.ts`.

### Orb learning design

The 45-second impact phase is not a static reading card. It is split into three fast beats:

1. **Prime** — a curiosity question and a prediction force the learner to commit before being taught.
2. **Story** — exactly three connected beats build one causal model instead of listing disconnected facts.
3. **Schema** — one misconception is confronted, three summary points compress the model, and one tactical rule becomes the decision shortcut.

Every Orb also carries a retrieval prompt and answer. These power the **Knowledge Bank** and **Memory Shield**, which use FSRS-based retention estimates to schedule active recall. A review updates the memory card only: it never replays mission XP, streak rescue, artifacts, or social events.

The key distinction from a general knowledge product is execution: finishing the instructional Orb unlocks a Field Mission, but the main reward remains locked until proof is submitted to Build Vault.

## Launch curriculum

| Track | Node 1 | Node 2 | Node 3 | Node 4 | Node 5 |
|---|---|---|---|---|---|
| Smart Money & Investing | Cash opportunity cost | Compound growth | ETF fee drag | DCA plan | Risk budget |
| AI & Automation | Prompt contract | Context stack | Model routing | Trigger-transform-action | Agent guardrails |
| Viral Growth & Marketing | Three-second hook | Pain moment | Value equation | Six-second script | Distribution machine |

Each node creates a different practical artifact. The launch set therefore ships with fifteen micro-tool engines instead of generic content cards.

## TypeScript ingestion schema

The canonical schema is in `src/services/interactiveCurriculumTypes.ts`. The production gate is `validateAtomicLesson` in `src/services/curriculumIngestion.ts`.

An ingestion job must produce the following expanded shape:

```json
{
  "id": "learn-money-06",
  "trackId": "smart-money",
  "order": 6,
  "slug": "rebalance-with-rules",
  "competency": "investing",
  "difficulty": "medium",
  "title": { "es": "Rebalancea con reglas", "en": "Rebalance with rules" },
  "objective": { "es": "Definir una regla de rebalanceo.", "en": "Define a rebalancing rule." },
  "keyConcept": { "es": "Texto revisado.", "en": "Reviewed copy." },
  "estimatedSeconds": 180,
  "learningDesign": {
    "curiosityQuestion": { "es": "Pregunta que abre una brecha de curiosidad.", "en": "A question that opens a curiosity gap." },
    "predictionPrompt": { "es": "Predice antes de revelar.", "en": "Predict before the reveal." },
    "storyBeats": [
      { "title": { "es": "Causa", "en": "Cause" }, "body": { "es": "Modelo causal.", "en": "Causal model." } },
      { "title": { "es": "Tensión", "en": "Tension" }, "body": { "es": "Consecuencia.", "en": "Consequence." } },
      { "title": { "es": "Decisión", "en": "Decision" }, "body": { "es": "Regla aplicable.", "en": "Applicable rule." } }
    ],
    "misconception": { "es": "Error intuitivo que se confronta.", "en": "An intuitive mistake to confront." },
    "summaryPoints": [
      { "es": "Punto uno.", "en": "Point one." },
      { "es": "Punto dos.", "en": "Point two." },
      { "es": "Punto tres.", "en": "Point three." }
    ],
    "retrievalPrompt": { "es": "Pregunta de recuperación.", "en": "Retrieval question." },
    "retrievalAnswer": { "es": "Respuesta modelo.", "en": "Model answer." }
  },
  "prerequisiteIds": ["learn-money-05"],
  "sources": [
    {
      "id": "source-id",
      "kind": "book",
      "title": "Source title",
      "author": "Source author",
      "rights": "fair_use_summary"
    }
  ],
  "ingestion": {
    "schemaVersion": "1.0.0",
    "generatedBy": "ai_assisted",
    "factualReview": "pending",
    "pedagogicalReview": "pending",
    "sourceIds": ["source-id"]
  },
  "phases": [
    { "type": "impact", "durationSeconds": 45 },
    { "type": "challenge", "durationSeconds": 60 },
    { "type": "action", "durationSeconds": 60 },
    { "type": "reward", "durationSeconds": 15 }
  ]
}
```

The abbreviated phase objects above illustrate sequence only. In production, `impact` requires localized copy and a tactical rule; `challenge` requires one of the four supported interaction types and feedback for both outcomes; `action` requires a declarative widget, fields, and artifact title; `reward` requires XP and pet recovery metadata.

## AI ingestion pipeline

1. Store the source with author, URL when applicable, rights status, and retrieval date.
2. Extract claims and attach each claim to a source segment. Reject unsupported numbers and direct financial promises.
3. Reduce the lesson to one decision-changing concept.
4. Generate the bilingual Orb design: curiosity prime, prediction, three story beats, misconception, three-point schema, retrieval anchor, and a single tactical rule.
5. Select the challenge type that best tests the decision: multiple choice, ordering, matching, or error detection.
6. Generate direct feedback that explains the governing rule, not merely the correct option.
7. Select or configure a micro-tool engine that produces a real artifact. A passive reading card is invalid.
8. Run `validateAtomicLesson`; reject any lesson that does not contain exactly four phases totaling 180 seconds.
9. Require factual and pedagogical review before publishing.
10. Release behind a curriculum version so active users do not lose prerequisite state when content changes.

## Verification

Run:

```bash
npm run test:curriculum
npm run lint
npm run build
```

The curriculum test verifies the track count, lesson count, unique IDs, prerequisite chain, Orb learning design, phase order, duration, source metadata, all four challenge types, and all fifteen micro-tool engines.
