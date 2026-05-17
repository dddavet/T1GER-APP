# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- **MissionEngine.tsx** - Mission display and proof submission flow
- **HUD.tsx** - Heads-up display for stats
- **NavDock.tsx** - Bottom navigation
- **BlackMarket.tsx** - XP spending shop
- **EveningInterrogation.tsx** - End-of-day reflection

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
