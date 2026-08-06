---
name: T1GER Brand Design System
version: 1.0.0
app: t1ger.app
repo: dddavet/T1GER-APP
colors:
  primary: "#FF7300"
  primary_dark: "#CC5C00"
  primary_glow: "rgba(255, 115, 0, 0.4)"
  success: "#58CC02"
  success_dark: "#58A700"
  danger: "#FF4B4B"
  danger_dark: "#EA1515"
  sky: "#1CB0F6"
  sky_dark: "#1899D6"
  background_app: "#F7F7F7"
  background_card: "#FFFFFF"
  text_primary: "#27272A"
  text_secondary: "#52525B"
  text_muted: "#71717A"
typography:
  display:
    fontFamily: "Kanit, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 900
    fontStyle: italic
    letterSpacing: "-0.05em"
    textTransform: uppercase
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontWeight: 600
  mono:
    fontFamily: "'JetBrains Mono', monospace"
    letterSpacing: "0.15em"
    textTransform: uppercase
---

# T1GER APP - Brand & Design System Guide

## Overview
T1GER (`t1ger.app`) is an ultra-gamified business skill development platform for entrepreneurs, founders, and creators. Inspired by Duolingo's high-retention mechanics, T1GER transforms complex business learning (Offer design, Sales, Marketing, Mindset, Operations, AI) into daily bite-sized missions, photo-proof actions, streak tracking, and 3D tactile micro-interactions.

## Brand Voice & Positioning
- **Tone:** High-performance, direct, empowering, tactical, gamified ("Predator Pride" mindset).
- **Target Audience:** Entrepreneurs, SaaS founders, creators, and ambitious business builders.
- **Core Hook:** "Learn is free. Execution is premium." Business micro-lessons combined with real-world photo proof execution and daily habit streaks.

## Design Principles
1. **3D Tactile Keys & Buttons:**
   - All primary CTAs mimic physical keypresses with a 4px dark border bottom (`border-b-4`).
   - Active state applies `translateY(4px)` and removes bottom border for instant haptic response.
   - Rounded corners (`rounded-2xl` or `rounded-3xl`).
2. **Bento Grid Architecture:**
   - Asymmetrical card grids for dashboard phases, stats, and skill vector analysis.
3. **Dynamic Micro-Animations:**
   - `canvas-confetti` reward bursts upon mission completion.
   - `BorderBeam` animated laser glows around active phase cards.
   - `NumberFlow` rolling digit transitions for Streak, XP, Gems, and Hearts.
   - `Magic UI Dock` bottom navigation bar with fluid scaling physics.
4. **Duolingo-Level Visual Sparsity:**
   - Minimize long text paragraphs. Rely on visual chips, progress meters, badge stars, and avatar emotion feedback.
5. **Interactive 3D Mascot:**
   - T1GER Avatar provides guidance with state emotions (`RESTING`, `PREDATOR`, `PROUD`, `DISAPPOINTED`).

## Color Palette Tokens

```css
:root {
  /* Brand Primary */
  --accent-main: #FF7300;       /* T1GER Orange */
  --accent-dark: #CC5C00;       /* 3D Button Border Dark */
  --accent-glow: rgba(255, 115, 0, 0.4);

  /* Gamified Action Colors */
  --color-success: #58CC02;     /* Duolingo Green */
  --color-success-dark: #58A700;
  --color-danger: #FF4B4B;      /* Red Fail / Energy */
  --color-danger-dark: #EA1515;
  --color-sky: #1CB0F6;         /* Gems / Level Blue */
  --color-sky-dark: #1899D6;

  /* Backgrounds & Cards */
  --bg-app: #F7F7F7;            /* Off-white App Background */
  --bg-card: #FFFFFF;           /* Card White */
  --bg-[#0C0C0E]: #0C0C0E;      /* Dark Glass Accent */
}
```

## UI Component Guidelines

### 1. 3D Primary Button (Duolingo Style)
```tsx
<button className="w-full py-4 rounded-2xl bg-[#FF7300] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#CC5C00] active:border-b-0 active:translate-y-1 transition-all">
  START MISSION →
</button>
```

### 2. Success Action Button
```tsx
<button className="w-full py-4 rounded-2xl bg-[#58CC02] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#58A700] active:border-b-0 active:translate-y-1 transition-all">
  CONTINUE →
</button>
```

### 3. Bento Card with BorderBeam
```tsx
<div className="relative rounded-[1.25rem] border-2 border-zinc-200 border-b-4 border-b-zinc-300 bg-white p-4 overflow-hidden">
  <BorderBeam size={150} duration={8} colorFrom="#FF7300" colorTo="#FFB03A" />
  {/* Card Content */}
</div>
```

### 4. Rolling Number Display
```tsx
<NumberFlow value={streak} className="font-black font-mono text-[#FF9600]" />
```

---
*Created for T1GER APP (`t1ger.app`) Open Design System integration.*
