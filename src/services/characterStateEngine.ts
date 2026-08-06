// ============================================================
// T1GER APP CHARACTER STATE ENGINE v1
// ============================================================
// Manages the cast of business & tech characters (Personajes).
// ============================================================

export type CharacterId = 't1ger' | 'l1ly' | 'eddy' | 'zar1';

export interface CharacterConfig {
  id: CharacterId;
  name: string;
  title: string;
  avatarImg: string;
  accentColor: string; // CSS Color Variable or Hex
  glowColor: string; // RGBA shadow string
  focusedCompetencies: string[];
  speechBubbleText: {
    success: string[];
    fail: string[];
    welcome_consistent: string[];
    welcome_sporadic: string[];
  };
}

export const CHARACTER_CAST: Record<CharacterId, CharacterConfig> = {
  t1ger: {
    id: 't1ger',
    name: 'T1GER',
    title: 'El Mentor Alfa',
    avatarImg: '/tiger_celebrating.png',
    accentColor: '#CCFF00', // Neon Cyber Gold / Lime
    glowColor: 'rgba(204, 255, 0, 0.4)',
    focusedCompetencies: ['offer', 'sales', 'mindset', 'general'],
    speechBubbleText: {
      success: [
        "Precisión de cirujano táctico. Estás construyendo un monopolio en tu mente.",
        "Caza excelente. Mantienes a la competencia bajo control y sin oxígeno.",
        "Esa es la ejecución de un verdadero Apex Predator. Impecable."
      ],
      fail: [
        "Un pequeño obstáculo. El aprendizaje real requiere fricción, ajusta y vuelve a intentar.",
        "Esto es solo información nueva procesándose. Afina la precisión y vamos de nuevo.",
        "Nadie acierta todo a la primera. El progreso está en la repetición y corrección."
      ],
      welcome_consistent: [
        "¡Estás en racha! El momentum es nuestro mayor activo, sigamos construyendo.",
        "La disciplina rinde frutos. Me encanta ver esta consistencia implacable."
      ],
      welcome_sporadic: [
        "El mercado no espera, pero tu base sigue intacta. Retomemos el control.",
        "Siempre es buen momento para volver a construir. Analicemos el siguiente paso."
      ]
    }
  },
  l1ly: {
    id: 'l1ly',
    name: 'L1LY',
    title: 'AI Dev & Hacker',
    avatarImg: '/tiger_thinking.png', // Transparent thinking tiger (placeholder for tech visual)
    accentColor: '#60A5FA', // Hologram Cyan
    glowColor: 'rgba(96, 165, 250, 0.4)',
    focusedCompetencies: ['ai', 'operations'],
    speechBubbleText: {
      success: [
        "Compilación correcta. Has optimizado el algoritmo de tu respuesta.",
        "Patrón detectado. Tu red neuronal se está adaptando a la perfección."
      ],
      fail: [
        "Sintaxis inválida. Re-evalúa tus inputs y vuelve a ejecutar el modelo.",
        "Error de procesamiento. Calibremos los pesos e intentémoslo de nuevo."
      ],
      welcome_consistent: [
        "Sincronización perfecta. Tu uptime está en 99.9%, sigamos escalando.",
        "Tokens maximizados. El momentum de tu caché es brillante hoy."
      ],
      welcome_sporadic: [
        "Reconexión exitosa. El servidor guardó tu estado, vamos a compilar.",
        "Sistemas online. No te preocupes por el downtime, lo importante es iterar."
      ]
    }
  },
  eddy: {
    id: 'eddy',
    name: 'EDDY',
    title: 'Venture Capitalist',
    avatarImg: '/tiger_celebrating.png', // Transparent celebrating tiger (placeholder for scale visual)
    accentColor: '#FF6B00', // Orange Burn
    glowColor: 'rgba(255, 107, 0, 0.4)',
    focusedCompetencies: ['investing', 'accounting'],
    speechBubbleText: {
      success: [
        "¡Boom! Acabas de disparar el valor de este concepto. Retorno sólido.",
        "Valoración al cielo. Esta respuesta tiene fundamentos inquebrantables."
      ],
      fail: [
        "Esa jugada tiene riesgo oculto. Analicemos los fundamentales de nuevo.",
        "Métricas desajustadas. El aprendizaje es invertir tiempo en entender dónde perdimos."
      ],
      welcome_consistent: [
        "El interés compuesto no duerme, y tú tampoco. Tu portafolio mental crece.",
        "Aportes consistentes generan rendimientos masivos. Sigamos invirtiendo."
      ],
      welcome_sporadic: [
        "El mercado es paciente. El capital te espera, volvamos a operar.",
        "Los retiros de capital pasan. Lo clave es volver a fondear la mente hoy."
      ]
    }
  },
  zar1: {
    id: 'zar1',
    name: 'ZAR1',
    title: 'Growth Marketer',
    avatarImg: '/tiger_thinking.png', // Transparent thinking tiger (placeholder for growth visual)
    accentColor: '#FF007F', // Hot Neon Pink
    glowColor: 'rgba(255, 0, 127, 0.4)',
    focusedCompetencies: ['marketing'],
    speechBubbleText: {
      success: [
        "¡K-factor por las nubes! Has desbloqueado la tracción correcta.",
        "Psicología perfecta. Esa respuesta tiene un embudo de conversión del 100%."
      ],
      fail: [
        "Ese copy no convirtió. Ajustemos el ángulo y hagamos A/B testing de nuevo.",
        "Objeción no resuelta. Identifiquemos la fricción y optimicemos el mensaje."
      ],
      welcome_consistent: [
        "¡Tracción diaria asegurada! Tu marca personal está acumulando autoridad.",
        "Frecuencia de campaña óptima. El algoritmo premia a los que no paran."
      ],
      welcome_sporadic: [
        "¡Hola! Tu audiencia te extrañaba. Lancemos la siguiente campaña hoy.",
        "El reach orgánico se recupera rápido. Diseñemos el próximo gancho."
      ]
    }
  }
};

/**
 * Returns the character assigned to the given track.
 */
export const getCharacterForTrack = (trackId: string): CharacterConfig => {
  const lowercase = trackId.toLowerCase();
  if (lowercase === 'ai' || lowercase === 'operations') return CHARACTER_CAST.l1ly;
  if (lowercase === 'investing' || lowercase === 'accounting') return CHARACTER_CAST.eddy;
  if (lowercase === 'marketing') return CHARACTER_CAST.zar1;
  return CHARACTER_CAST.t1ger; // Default fallback
};

/**
 * Helper to get a random tone-of-voice phrase for the mascot.
 */
export const getRandomPhrase = (
  characterId: CharacterId,
  type: 'success' | 'fail' | 'welcome_consistent' | 'welcome_sporadic'
): string => {
  const char = CHARACTER_CAST[characterId];
  const list = char.speechBubbleText[type];
  const index = Math.floor(Math.random() * list.length);
  return list[index];
};
