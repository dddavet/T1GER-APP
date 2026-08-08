import type { T1gerEmotion } from './t1gerStateEngine';

export type MascotReaction = 'idle' | 'happy' | 'celebrate' | 'mistake' | 'thinking' | 'beast' | 'warning';
export type MascotSurface = 'learn' | 'apply' | 'compete' | 'profile';

interface MascotGuideInput {
  surface: MascotSurface;
  emotion: T1gerEmotion;
  completedLearn: boolean;
  completedApply: boolean;
  applyAvailable: boolean;
  verifiedXP: number;
  learnStreak: number;
  isEs: boolean;
}

export interface MascotGuideState {
  mood: MascotReaction;
  eyebrow: string;
  message: string;
}

const localized = (isEs: boolean, es: string, en: string) => isEs ? es : en;

export function resolveMascotGuide({
  surface,
  emotion,
  completedLearn,
  completedApply,
  applyAvailable,
  verifiedXP,
  learnStreak,
  isEs,
}: MascotGuideInput): MascotGuideState {
  if (emotion === 'FERAL' && !completedLearn) {
    return {
      mood: 'warning',
      eyebrow: localized(isEs, 'Protege tu racha', 'Protect your streak'),
      message: localized(isEs, 'Una lección corta mantiene vivo el progreso de hoy.', 'One short lesson keeps today’s progress alive.'),
    };
  }

  if (emotion === 'DISAPPOINTED') {
    return {
      mood: 'mistake',
      eyebrow: localized(isEs, 'Ajusta y repite', 'Adjust and retry'),
      message: localized(isEs, 'Ese error mostró exactamente qué debes practicar ahora.', 'That miss showed exactly what to practice next.'),
    };
  }

  if (surface === 'learn') {
    if (completedLearn && completedApply) {
      return {
        mood: 'celebrate',
        eyebrow: localized(isEs, 'Ciclo completo', 'Loop complete'),
        message: localized(isEs, 'Aprendiste, actuaste y guardaste evidencia. Mañana avanzamos.', 'You learned, acted, and saved evidence. Tomorrow we move forward.'),
      };
    }
    if (completedLearn) {
      return {
        mood: 'happy',
        eyebrow: localized(isEs, 'Lección lista', 'Lesson complete'),
        message: localized(isEs, 'Ya entendiste la idea. Ahora úsala en una decisión.', 'You understand the idea. Now use it in a decision.'),
      };
    }
    return {
      mood: 'thinking',
      eyebrow: localized(isEs, 'Tu siguiente paso', 'Your next step'),
      message: localized(isEs, 'Aprende una idea. Después la pondremos en práctica.', 'Learn one idea. Then we’ll put it into practice.'),
    };
  }

  if (surface === 'apply') {
    if (completedApply) {
      return {
        mood: 'celebrate',
        eyebrow: localized(isEs, 'Evidencia guardada', 'Evidence saved'),
        message: localized(isEs, 'La acción cuenta porque quedó registrada.', 'The action counts because it was recorded.'),
      };
    }
    if (!applyAvailable) {
      return {
        mood: 'thinking',
        eyebrow: localized(isEs, 'Misión bloqueada', 'Mission locked'),
        message: localized(isEs, 'Completa las lecciones del módulo para abrir la práctica.', 'Finish the module lessons to unlock the practice mission.'),
      };
    }
    return {
      mood: 'beast',
      eyebrow: localized(isEs, 'Hora de actuar', 'Time to act'),
      message: localized(isEs, 'El conocimiento sólo se vuelve habilidad cuando lo ejecutas.', 'Knowledge becomes skill only when you act on it.'),
    };
  }

  if (surface === 'compete') {
    if (verifiedXP > 0) {
      return {
        mood: 'happy',
        eyebrow: localized(isEs, 'Progreso verificado', 'Verified progress'),
        message: localized(isEs, `${verifiedXP} vXP provienen de acciones que T1GER pudo comprobar.`, `${verifiedXP} vXP came from actions T1GER could verify.`),
      };
    }
    return {
      mood: 'thinking',
      eyebrow: localized(isEs, 'Tu puesto empieza con evidencia', 'Your rank starts with evidence'),
      message: localized(isEs, 'Completa tu primera acción verificable para entrar en la liga.', 'Complete your first verifiable action to enter the league.'),
    };
  }

  if (emotion === 'PREDATOR' || emotion === 'PROUD' || learnStreak >= 7) {
    return {
      mood: emotion === 'PREDATOR' ? 'celebrate' : 'happy',
      eyebrow: localized(isEs, 'Buen ritmo', 'Strong rhythm'),
      message: localized(isEs, `${learnStreak} días de constancia ya forman parte de tu perfil.`, `${learnStreak} consistent days are now part of your profile.`),
    };
  }

  return {
    mood: 'idle',
    eyebrow: localized(isEs, 'Tu progreso', 'Your progress'),
    message: localized(isEs, 'Aquí puedes revisar tu nivel, racha y preferencias.', 'Review your level, streak, and preferences here.'),
  };
}
