import { type BrainState } from './brainService';

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
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. DISAPPOINTED: Did the user fail any mission today?
  const todayFailedMissions = state.missionHistory.filter(record => {
    const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
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
        glowColor: 'rgba(96, 165, 250, 0.4)', // Hologram Cyan Glow
        accentColor: '#60A5FA', // Cyan Accent
        bgTint: 'rgba(96, 165, 250, 0.05)',
        statusIcon: '⚡',
        statusLabel: 'PREDATOR ACTIVE',
        speechBubbleText: '¡Estado de flujo completo detectado! Tienes tus rachas de aprendizaje y ejecución alineadas. Estás en la cima de la cadena alimenticia hoy, Predator.',
      };
    case 'PROUD':
      return {
        emotion,
        avatarImg: '/tiger_celebrating.png',
        glowColor: 'rgba(255, 107, 0, 0.4)', // Amber Cyber Gold Glow
        accentColor: '#FF6B00', // Gold Accent
        bgTint: 'rgba(255, 107, 0, 0.05)',
        statusIcon: '👑',
        statusLabel: 'APEX PRIDE',
        speechBubbleText: 'Excelente caza. Tu racha de estudio es admirable; estás devorando la competencia. Continúa tallando tu monopolio mental.',
      };
    case 'FERAL':
      return {
        emotion,
        avatarImg: '/tiger_sad.png', // Looking intense/concerned
        glowColor: 'rgba(239, 68, 68, 0.5)', // Carnivore Crimson Glow
        accentColor: '#EF4444', // Red Alert Accent
        bgTint: 'rgba(239, 68, 68, 0.08)',
        statusIcon: '🚨',
        statusLabel: 'STREAK DANGER',
        speechBubbleText: 'Tu racha se está desangrando, Predator. Es de noche y aún no has completado tus lecciones conceptuales de hoy. ¡Aliméntate del conocimiento antes de que acabe el tiempo!',
      };
    case 'DISAPPOINTED':
      return {
        emotion,
        avatarImg: '/tiger_sad.png',
        glowColor: 'rgba(156, 163, 175, 0.2)', // Steel Gray Glow
        accentColor: '#9CA3AF', // Gray Accent
        bgTint: 'rgba(156, 163, 175, 0.03)',
        statusIcon: '💀',
        statusLabel: 'SYSTEM ANOMALY',
        speechBubbleText: 'Has tenido un tropiezo conceptual hoy. En el mercado real, los descuidos cuestan miles de dólares. Estudia la crítica y afila tus garras para el siguiente intento.',
      };
    case 'RESTING':
    default:
      return {
        emotion,
        avatarImg: '/tiger_thinking.png',
        glowColor: 'rgba(204, 255, 0, 0.2)', // Soft lime accent
        accentColor: '#CCFF00', // Lime Cyber
        bgTint: 'rgba(204, 255, 0, 0.02)',
        statusIcon: '💤',
        statusLabel: 'STEADY PACING',
        speechBubbleText: 'Afilando las garras de forma estratégica. Mantener un ritmo constante es mejor que un sprint insostenible. ¿Listo para tu siguiente lección?',
      };
  }
};
