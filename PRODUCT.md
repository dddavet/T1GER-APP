# T1GER Product Direction

## Product Promise

T1GER helps ambitious, curious learners discover, learn, apply, and retain useful knowledge. It turns short mobile sessions into durable understanding and real-world progress instead of passive course completion.

The official product loop is:

> **DISCOVER → LEARN → APPLY → MASTER → RETURN**

- **Discover:** Find a curated path that matches a genuine interest or goal.
- **Learn:** Build one useful mental model through an interactive, focused lesson.
- **Apply:** Use that model in a real decision, tool, simulation, or action.
- **Master:** Retrieve and review the idea over time through FSRS-guided practice.
- **Return:** Come back for the clearest next step, not an overwhelming dashboard.

## Audience

T1GER is for ambitious learners, primarily ages 18–30, who are curious across multiple domains and want practical capability. They often arrive after collecting unfinished videos, books, or courses. They use T1GER in short mobile sessions and need to know what they are learning, why it matters, what to do next, and whether the knowledge is sticking.

T1GER is not exclusively an entrepreneurship, founder, business, productivity, or self-improvement product. Those subjects can exist as curated domains, but they do not define the identity of the platform.

## Domain Priorities

1. **Investing & Smart Money** — the flagship reference path and first complete Learn → Apply → Master experience.
2. **AI** — practical understanding, responsible use, prompting, automation, and agentic workflows.
3. **Psychology** — decision-making, cognitive bias, learning, attention, and behavior.

Business, marketing, history, productivity, and other useful subjects remain valid current or future domains. A domain must not be presented as fully available until its Learn, Apply, and Master loop is genuinely connected.

## Content Standard

T1GER curates knowledge from identifiable, trustworthy sources: respected books and authors, primary research, institutions, official documentation, and expert practitioners. AI may synthesize, structure, personalize, and generate interactions, but it must not be presented as the source of truth.

Every learning path should make its sources legible and convert them into original interactive instruction rather than reproducing source material.

## Progress Standard

Progress is meaningful only when its cause is clear:

- Completing a lesson creates readiness; it does not finish the loop.
- Apply records a real decision or action and secures personal progress.
- Master practices retrieval later and tracks review evidence separately from completion.
- Verified artifacts may contribute to competitive status; self-reported actions remain personal progress.
- XP, streaks, memory, and T1GER vitals must reflect canonical completion rules and remain idempotent.

Internal concepts such as missions, artifacts, submissions, and `BuildTab` remain valid implementation details where changing them would risk data or progression regressions. The user-facing language is Learn, Apply, and Master.

### XP is activity, not mastery

- Personal XP and levels recognize participation in the learning loop. The current canonical reward bundles the lesson reward and 50 Apply XP when its matching Apply step is recorded; the onboarding reward is separate and one-time. Passing the lesson alone does not unlock the next node.
- Self-reported Apply completion and an optional written reflection record personal practice. They do not prove understanding, earn competitive XP, or become verified simply because the user opens a tool.
- `vXP` / `verifiedXP` is a legacy name for competitive XP from reviewed Apply evidence. Currently an AI-approved image artifact with the required confidence may earn it. Text-only reflections do not. An AI review checks the submitted evidence; it is not independent verification of the real-world action or a claim of mastery.
- Objectively correct challenge, transfer, and retrieval answers are evidence for the specific question answered, not general mastery. The current economy does not introduce a separate competitive XP award for these answers. Written reflections, arbitrary free text, tool opening, lesson completion alone, and self-ratings are participation evidence only.
- Master describes delayed retrieval and FSRS scheduling separately from XP. Good/Easy self-ratings adjust the review schedule; they are not objective comprehension evidence. Review does not issue a second completion reward.
- Canonical reward events identify the user and mission. Retries, reloads, duplicate submissions, and changing a previous submission's verification tier must not pay the same completion reward twice.

## Brand Personality

Ambitious, curious, modern, educational, and premium. T1GER should feel like a knowledgeable training partner: direct enough to create momentum, calm enough to trust, and warm enough to return to. The mascot provides guidance and consequence without making the product childish.

Avoid hustle-bro language, fabricated performance claims, shame, fake urgency, corporate jargon, and generic motivational copy.

## Product Principles

1. **One next action:** Every major screen answers “What should I do next?”
2. **Active learning:** Interaction, retrieval, and decisions replace passive consumption.
3. **Application closes the loop:** Useful knowledge becomes a real tool, choice, simulation, or action.
4. **Mastery is retention:** Review practices retrieval and builds retention evidence over time.
5. **Curated trust:** Sources are visible and claims are supportable.
6. **Progress is legible:** State, prerequisites, rewards, and consequences are understandable.
7. **Energy with restraint:** Motion, sound, and the mascot support state changes without competing with the lesson.
8. **Evolve, do not rebuild:** Preserve Firebase, BrainContext, progression, XP, streaks, FSRS, Apply missions, artifacts, subscriptions, notifications, and the mascot unless a separately approved migration requires change.

## Anti-References

- Passive course marketplaces, long video libraries, and PDF-heavy curricula.
- Founder-only positioning or business language applied to unrelated subjects.
- Completion theater where tapping through content equals mastery.
- Generic dark fintech dashboards filled with decorative neon or unexplained KPIs.
- Literal copies of Duolingo, Kinnu, Brilliant, or other reference products.
- Punitive habit products that rely on shame or inaccessible motion.
- Interfaces where Learn, Apply, Master, Compete, and Profile feel like separate products.

## Accessibility & Inclusion

Target WCAG 2.2 AA for contrast, focus visibility, semantic navigation, touch targets, and status messaging. Respect reduced-motion preferences, never encode state through color alone, keep core actions usable with keyboard and assistive technology on web, and maintain readable Spanish and English copy without truncating critical meaning.
