# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

T1GER APP is a React + TypeScript mobile learning platform for ambitious, curious learners, built with Firebase and optional AI-assisted experiences. It turns curated knowledge into short interactive lessons, real-world application, and spaced-repetition mastery.

The official product loop is **DISCOVER → LEARN → APPLY → MASTER → RETURN**. Investing is the flagship reference path, followed by AI and Psychology. Business and marketing remain valid domains but are not the product's entire identity. Read `PRODUCT.md` and `DESIGN.md` before changing user-facing product language or visual hierarchy.

User-facing terminology should prefer **Learn**, **Apply**, and **Master**. Internal legacy names such as missions, artifacts, submissions, `BuildTab`, and tactical fields may remain where renaming would risk persistence, progression, or backend compatibility.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # TypeScript type checking
```

## Environment Setup

Create `.env.local` with:
- `VITE_FIREBASE_API_KEY` - Firebase API key (overrides config file)
- `VITE_GEMINI_API_KEY` - Gemini AI API key (required for AI features)

## Architecture

### Core Structure
- **`src/App.tsx`** - Main view router and lazy-loaded mobile shell (`activeView`: learn, build/Apply, compete, profile, coach, mission, debrief)
- **`src/main.tsx`** - Entry point with ErrorBoundary wrapper
- **`src/index.css`** - Tailwind CSS v4 styling

### Context Providers (nested in App.tsx)
1. **AuthProvider** (`src/contexts/AuthContext.tsx`) - Firebase Auth + Firestore user sync with local storage fallback
2. **T1gerProvider** (`src/contexts/T1gerContext.tsx`) - User stats (XP, coins, streak, rank) and state management
3. **BrainProvider** (`src/contexts/BrainContext.tsx`) - Curriculum progress, FSRS review state, Learn → Apply gating, streaks, and persisted learning state

### Key Services
- **`src/services/brainService.ts`** - Core progress logic: mission history, FSRS cards, retrieval review, streak rules, and mastery calculations
- **`src/services/interactiveCurriculum.ts`** - Curated interactive lesson content and sources across authored learning tracks
- **`src/services/curriculumCatalog.ts`** - Discoverable domain/pathway catalog and release availability mapping
- **`src/services/learningJourney.ts`** - Ordered node states for completed, current, review, and locked learning steps
- **`src/services/missionBank.ts`** - Legacy-compatible mission and track definitions retained by progression and Apply infrastructure
- **`src/services/gemini.ts`** - Development-only client AI helpers and legacy generation paths; production-sensitive AI actions belong behind server boundaries
- **`src/services/coachService.ts`** - AI coaching interactions
- **`src/services/economyService.ts`** - XP/coins economy
- **`src/services/interrogationService.ts`** - Evening reflection flows

### Primary Product Surfaces
- **`src/pages/Learn.tsx`** - Discoverable curricula, ordered path, current Learn/Apply/Master stage, and review entry
- **`src/components/learn/AtomicLessonPlayer.tsx`** - Interactive Learn loop: concept, challenge, micro-tool, and Apply handoff
- **`src/components/BuildTab.tsx`** - User-facing Apply surface; internal filename retained for compatibility
- **`src/components/social/SquadTab.tsx`** - Competition, friends, activity, and accountability
- **`src/pages/Profile.tsx`** - Progress, settings, privacy, and account controls
- **`src/pages/Coach.tsx`** - Optional AI mentor interface

### Key Components
- **T1gerMascot3D.tsx** - 3D Reactive Tiger Mascot built with Three.js (`three`, `@react-three/fiber`, `@react-three/drei`). Features procedural multi-joint skeletal physics (breathing, ear twitches, tail wagging, eye blinking) and a 6-state reactive animation state machine (`idle`, `happy`, `celebrate`, `mistake`, `thinking`, `beast`, `warning`). Includes anti-clipping camera framing (`closeUp` mode for face close-ups and `fullBody` mode for pedestals).
- **OnboardingFlow.tsx** - Curiosity-first onboarding that selects a learning domain, calibrates pace, explains the product loop, and preserves drafts.
- **MissionEngine.tsx** - Legacy-compatible mission display and proof flow used by existing curriculum paths.
- **HUD.tsx** - Heads-up display for stats
- **NavDock.tsx** - Bottom navigation
- **BlackMarket.tsx** - XP spending shop
- **EveningInterrogation.tsx** - End-of-day reflection

## 🎨 3D Mascot & Brand Design Architecture

1. **3D Character Stack**: `@react-three/fiber` + `@react-three/drei` rendering `ReactiveTiger3D` procedurally. Supports TRELLIS.2 3D `.glb` model loading via `GLBModel`.
2. **Camera Anti-Clipping Standard**:
   - `closeUp=true`: Camera position `[0, 0.55, 1.65]` (FOV 40), target Y `0.65`.
   - `closeUp=false`: Camera position `[0, 0.2, 3.2]` (FOV 42), target Y `-0.45`.
   - **Rule**: Never wrap the 3D canvas in square boxes or flat clashing orange backgrounds. The 3D canvas must bleed 100% transparently over obsidian dark backgrounds (`#09090B`).
3. **Brand Manual Guidelines**: See [`t1ger_brand_manual.md`](file:///C:/Users/david/.gemini/antigravity/brain/151e3ebc-acde-499c-83d3-35ee92dbf449/t1ger_brand_manual.md) and [`t1ger_brand_manual.html`](file:///C:/Users/david/.gemini/antigravity/brain/151e3ebc-acde-499c-83d3-35ee92dbf449/t1ger_brand_manual.html) for calibrated color tokens (`#09090B`, `#FF7300`, `#F59E0B`, `#06B6D4`, `#10B981`) and typography rules.

## Data Flow

1. **Authentication**: Firebase Auth → AuthContext → Firestore user doc (`users/{uid}`) + public profile (`users_public/{uid}`)
2. **Learning Progress**: BrainContext tracks lesson history, FSRS memory state, streaks, and curriculum progress in local storage with Firestore synchronization
3. **Learning Journey**: curated tracks define ordered Learn nodes; Apply completion gates progression; Master uses retrieval review without duplicate completion rewards
4. **AI Features**: server-isolated AI may assist proof review and mentoring; curated sources and canonical rules remain authoritative

## Firestore Collections

- `users/{userId}` - Main user profile with brainState embedded
- `users_public/{userId}` - Public-facing profile data
- `missions/{missionId}` - User-specific mission instances
- `circles/{circleId}` - Social groups with activities/comments
- `books/{bookId}/insights/{insightId}` - Book learning content
- `users/{userId}/coachingSessions/{sessionId}` - AI coaching history

See `firestore.rules` for security rules and data schemas.

## Styling

Tailwind CSS v4 with custom theme variables (`--accent-main`, `--accent-glow`) for dynamic color themes based on day type (focus, beast, relaxed, rest).

The production design language is Obsidian Dark with restrained orange action emphasis, machined/specular controls, Outfit typography, and JetBrains Mono for compact numeric or status data. Do not reintroduce flat neon glows, toy-like extruded buttons, fabricated metrics, founder-only copy, or generic hustle language.

## Product Evolution Boundaries

- Preserve Firebase architecture, BrainContext, progression, XP, streaks, FSRS, Apply/field missions, artifacts, RevenueCat, notifications, and the 3D mascot unless a task explicitly authorizes migration.
- Investing is the regression reference: Learn → challenge → micro-tool → Apply → reward → persistence → Master/review must remain intact.
- Do not advertise a domain as available unless its curriculum and canonical Apply behavior are connected.
- Every major product surface must make the next action clear.

---

## 🛠️ Production-Grade Agent Skills Framework (addyosmani/agent-skills)

All development, review, and refactoring in this repository strictly adheres to the **Agent Skills** lifecycle (`.agents/skills/` and global plugin `agent-skills`).

### Core Operating Behaviors (Mandatory Across All Changes)

1. **Surface Assumptions**: Before implementing anything non-trivial, explicitly state assumptions about requirements, architecture, and scope.
2. **Manage Confusion Actively**: When noticing inconsistencies between specs and code, STOP, name the specific contradiction, and resolve before continuing.
3. **Push Back When Warranted**: Never be a yes-machine. Point out architectural flaws, quantify tradeoffs (e.g. latency, bundle size, complexity), and propose cleaner alternatives.
4. **Enforce Simplicity**: Resist overcomplicating. Favor boring, proven, concise patterns. If 100 lines suffice, never write 1,000.
5. **Maintain Scope Discipline**: Surgical precision only. Never remove comments or refactor orthogonal files unsolicited.
6. **Verify, Don't Assume**: Never assume a change works because "it looks right". Run type-checks, automated test suites, and inspect bundle outputs.

### Development Lifecycle & Skill Matrix

| Phase | Skill | Activated By |
|---|---|---|
| **Meta** | `using-agent-skills` | Start of any task to map the right engineering process |
| **Define** | `interview-me` / `spec-driven-development` | Clarifying ambiguity, requirements, and acceptance criteria |
| **Plan** | `planning-and-task-breakdown` | Decomposing work into small, verifiable slices |
| **Build** | `incremental-implementation` / `frontend-ui-engineering` / `api-and-interface-design` | Writing clean, accessible, performant code |
| **Verify** | `test-driven-development` / `browser-testing-with-devtools` / `debugging-and-error-recovery` | Red-green-refactor, runtime console checks, reproduction tests |
| **Review** | `code-review-and-quality` / `code-simplification` / `security-and-hardening` / `performance-optimization` | 5-axis code audits, bundle profiling, OWASP hardening |
| **Ship** | `git-workflow-and-versioning` / `ci-cd-and-automation` / `shipping-and-launch` | Atomic commits, pre-flight checklists, release verification |
