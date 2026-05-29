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
    welcome: string[];
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
        "Ese error te habría costado $50,000 USD en el mercado real. Concéntrate.",
        "Tropiezo descuidado. Afila las garras, ajusta el plan y ataca de nuevo.",
        "El mercado no paga por intenciones, paga por resultados. Enfoca tus garras."
      ],
      welcome: [
        "Predator, el mercado no perdona a los perezosos. ¿Listo para la caza de hoy?",
        "Toma el control de tu racha diaria. El momentum es tu activo más valioso."
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
        "Tu prompt no fue un desastre total. Lógico. Compilación correcta.",
        "Patrón detectado. No está mal para un procesador biológico como tú.",
        "Tokens bien gastados. Has optimizado el algoritmo de tu respuesta."
      ],
      fail: [
        "Alucinación grave detectada. Esa lógica está totalmente rota en producción.",
        "Sintaxis inválida en tu toma de decisiones. Re-evalúa tus inputs.",
        "Ejecución lenta. Tu prompt carece de parámetros o contexto estructurado."
      ],
      welcome: [
        "Cargando módulos de IA... Espero que tu prompt de hoy valga los tokens.",
        "Sincronizando red neuronal. Mantenlo binario: ejecutas o fallas."
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
        "¡Boom! ¡Eso es un retorno del 10x de valor! Rifa absoluta.",
        "¡Sublime! Acabas de disparar el EBITDA de este concepto.",
        "Valoración al cielo. Esta respuesta tiene múltiplos de unicornio."
      ],
      fail: [
        "Cuidado, ese apalancamiento es la vía directa al Capítulo 11 de quiebra.",
        "Métricas infladas. Tu modelo financiero tiene fugas de flujo graves.",
        "Esa jugada tiene un retorno de inversión negativo. Recalcula el CAC."
      ],
      welcome: [
        "Hablemos de CAGR y flujos de efectivo. ¿Listo para escalar hoy?",
        "El interés compuesto no duerme. Pongamos a trabajar tus ideas hoy."
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
        "¡OMG espectacular! ¡Esa oferta tiene tanto gancho que romperá el feed! ✨",
        "K-factor por las nubes. Has desbloqueado tracción viral orgánica.",
        "Psicología de urgencia perfecta. El cliente está listo para comprar ya."
      ],
      fail: [
        "Ay no... ese copy aburriría hasta a un bot de spam. Cero hook.",
        "Objeción obvia no resuelta. Acabas de perder al prospecto en el segundo 1.",
        "Campaña de marketing quemada. Falta una propuesta de valor única."
      ],
      welcome: [
        "¡Hola, hola! Vamos a reventar el algoritmo hoy con una marca personal magnética.",
        "Tu audiencia está esperando. Diseñemos ganchos irresistibles hoy."
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
  type: 'success' | 'fail' | 'welcome'
): string => {
  const char = CHARACTER_CAST[characterId];
  const list = char.speechBubbleText[type];
  const index = Math.floor(Math.random() * list.length);
  return list[index];
};
