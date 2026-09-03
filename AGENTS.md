# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

T1GER APP is a React + TypeScript personal development platform for entrepreneurs, built with Firebase backend and Gemini AI integration. The app gamifies business skill development through daily missions, streak tracking, and curriculum-based learning paths.

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
- **`src/App.tsx`** - Main router with view-based navigation (`activeView` state: home, mission, learn, friends, profile, coach, tactical, market, debrief)
- **`src/main.tsx`** - Entry point with ErrorBoundary wrapper
- **`src/index.css`** - Tailwind CSS v4 styling

### Context Providers (nested in App.tsx)
1. **AuthProvider** (`src/contexts/AuthContext.tsx`) - Firebase Auth + Firestore user sync with local storage fallback
2. **T1gerProvider** (`src/contexts/T1gerContext.tsx`) - User stats (XP, coins, streak, rank) and state management
3. **BrainProvider** (`src/contexts/BrainContext.tsx`) - Learning curriculum, mission tracking, tactical system, dual streaks (learn + tactical)

### Key Services
- **`src/services/brainService.ts`** - Core learning logic: competency decay, mission history, curriculum session building, tactical task management
- **`src/services/missionBank.ts`** - Mission content library (50+ missions across 8 competencies: offer, sales, marketing, mindset, operations, investing, accounting, ai) + curriculum track definitions
- **`src/services/gemini.ts`** - Gemini AI integration: lesson generation, mission generation, proof verification with retry logic
- **`src/services/coachService.ts`** - AI coaching interactions
- **`src/services/economyService.ts`** - XP/coins economy
- **`src/services/interrogationService.ts`** - Evening reflection flows

### Pages (src/pages/)
- **Dashboard.tsx** - Home view with daily missions
- **Learn.tsx** - Curriculum/lesson browser
- **Coach.tsx** - AI coaching interface
- **Profile.tsx** - User stats and settings
- **Friends.tsx** - Social features (SquadTab)
- **TacticalSetup.tsx** - Daily task configuration

### Key Components
- **T1gerMascot3D.tsx** - 3D Reactive Tiger Mascot built with Three.js (`three`, `@react-three/fiber`, `@react-three/drei`). Features procedural multi-joint skeletal physics (breathing, ear twitches, tail wagging, eye blinking) and a 6-state reactive animation state machine (`idle`, `happy`, `celebrate`, `mistake`, `thinking`, `beast`, `warning`). Includes anti-clipping camera framing (`closeUp` mode for face close-ups and `fullBody` mode for pedestals).
- **OnboardingFlow.tsx** - Duolingo-exact frame-by-frame onboarding sequence. Begins with a full-screen 3D Mascot Face Splash with `t1ger` bottom branding, followed by a camera zoom-out reveal into personalized path setup and interactive 3D `TigerGuide` speech dialogues.
- **MissionEngine.tsx** - Mission display and proof submission flow with integrated reactive 3D mascot header reacting to correct/incorrect quiz answers in real time.
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
2. **Learning Progress**: BrainContext tracks competency scores (0-100), mission history, and curriculum progress in local storage + Firestore sync
3. **Mission System**: Curriculum tracks (`CURRICULUM_TRACKS` in missionBank.ts) define linear learning paths with daily mission sets
4. **AI Features**: Gemini validates mission proofs (image analysis), generates personalized lessons, and provides coaching

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

