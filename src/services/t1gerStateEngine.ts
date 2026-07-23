import { type BrainState, getLocalDateString } from './brainService';

export type T1gerEmotion = 'PREDATOR' | 'PROUD' | 'FERAL' | 'DISAPPOINTED' | 'RESTING';

export interface T1gerVisualConfig {
  emotion: T1gerEmotion;
  avatarImg: string;
  glowColor: string; // CSS rgb/rgba glow
  accentColor: string; // CSS color-mix or hex accent
  bgTint: string; // Inner dark tint
  statusIcon: string; // FLoting status badge
  statusLabel: string; // Short metadata text
  speechBubbleText: string; // Dynamic advice based on their psychological state
}

/**
 * Calculates the current T1GER mascot emotion dynamically from the current BrainState.
 */
export const calculateT1gerEmotion = (
  state: BrainState,
  currentHour: number = new Date().getHours()
): T1gerEmotion => {
  const todayStr = getLocalDateString();

  // 1. DISAPPOINTED: Did the user fail any mission today?
  const todayFailedMissions = state.missionHistory.filter(record => {
    const recordDate = getLocalDateString(new Date(record.timestamp));
    return recordDate === todayStr && !record.completed;
  });
  
  if (todayFailedMissions.length > 0) {
    return 'DISAPPOINTED';
  }

  // 2. FERAL: Is the user in danger of losing their streaks late in the day? (after 9:00 PM / 21:00 hs)
  // Check if they haven't completed their daily curriculum session today
  const sessionCompleted = state.dailySession ? state.dailySession.completedIds.length === state.dailySession.missionIds.length : false;
  const isLate = currentHour >= 21;
  
  if (isLate && !sessionCompleted) {
    return 'FERAL';
  }

  // 3. PREDATOR: Synchronized double streaks (Learn + Tactical both active >= 3)
  if (state.learnStreak >= 3 && state.tacticalStreak >= 3) {
    return 'PREDATOR';
  }

  // 4. PROUD: Excellent learning momentum (Learn Streak >= 7)
  if (state.learnStreak >= 7) {
    return 'PROUD';
  }

  // 5. RESTING: Default relaxed / steady learning pacing state
  return 'RESTING';
};

/**
 * Gets the premium visual configuration for the given emotion.
 */
export const getT1gerVisualConfig = (emotion: T1gerEmotion): T1gerVisualConfig => {
  switch (emotion) {
    case 'PREDATOR':
      return {
        emotion,
        avatarImg: '/tiger_celebrating.png',
        glowColor: 'rgba(255, 115, 0, 0.4)', // Gamified Orange Glow
        accentColor: '#FF7300', // Gamified Orange
        bgTint: 'rgba(255, 115, 0, 0.05)',
        statusIcon: '🔥',
        statusLabel: 'PERFECT FLOW',
        speechBubbleText: 'You are on fire! Your learning and execution streaks are aligned. Keep up this amazing momentum!',
      };
    case 'PROUD':
      return {
        emotion,
        avatarImg: '/tiger_resting.png',
        glowColor: 'rgba(255, 115, 0, 0.2)', // Soft Orange
        accentColor: '#FF7300',
        bgTint: 'rgba(255, 115, 0, 0.02)',
        statusIcon: '📖',
        statusLabel: 'READY TO LEARN',
        speechBubbleText: 'Let us build some healthy habits today! A small step every day creates massive results over time.',
      };
    case 'FERAL':
      return {
        emotion,
        avatarImg: '/tiger_sad.png', 
        glowColor: 'rgba(255, 75, 75, 0.5)', // Duolingo Red Glow
        accentColor: '#FF4B4B', // Red Alert Accent
        bgTint: 'rgba(255, 75, 75, 0.08)',
        statusIcon: '⏰',
        statusLabel: 'STREAK AT RISK',
        speechBubbleText: 'Oh no! Your streak is at risk today. It is getting late, let us complete a quick lesson to keep the flame alive!',
      };
    case 'DISAPPOINTED':
      return {
        emotion,
        avatarImg: '/tiger_sad.png',
        glowColor: 'rgba(156, 163, 175, 0.2)', // Steel Gray Glow
        accentColor: '#9CA3AF', // Gray Accent
        bgTint: 'rgba(156, 163, 175, 0.05)',
        statusIcon: '💔',
        statusLabel: 'STUMBLE',
        speechBubbleText: 'Mistakes happen! Do not worry about failing a mission today. Tomorrow is a brand new day to learn and grow.',
      };
    case 'RESTING':
    default:
      return {
        emotion: 'RESTING',
        avatarImg: '/tiger_idle.png',
        glowColor: 'rgba(255, 255, 255, 0.1)', // Subtle White/Silver Glow
        accentColor: '#FFFFFF',
        bgTint: 'transparent',
        statusIcon: '👀',
        statusLabel: 'WATCHFUL',
        speechBubbleText: 'Patience is a weapon. You are maintaining a steady pace. Keep consuming data and wait for the perfect moment to strike.',
      };
  }
};
