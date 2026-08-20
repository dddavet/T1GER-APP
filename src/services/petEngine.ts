// ============================================================
// T1GER PET ENGINE v4 - TRINITY VITALITY & CRITICAL LIFECYCLE
// ============================================================
// 1. ❤️ VIDA: Governed strictly by Android Screen Time vs Budget.
// 2. 🍖 HAMBRE: Governed strictly by "Tanto Aprendas" (Lessons & Theory).
// 3. ⚡ ENERGÍA: Governed strictly by "Tanto Apliques / Expliques" (Action).
// 4. 💀 CRITICAL DEATH / RESUSCITATION: Requires compound neglect,
//    triggering an Emergency Defibrillator Protocol to revive him.
// ============================================================

import type { MascotReaction } from './mascotGuide';
import { AndroidScreenTimeService } from './androidScreenTimeService';

export interface T1gerPetState {
  health: number; // 0 - 100: ❤️ VIDA (Screen Time vs Budget)
  hunger: number; // 0 - 100: 🍖 HAMBRE / NUTRICIÓN (Learn Lessons completed)
  energy: number; // 0 - 100: ⚡ ENERGÍA (Action, Apply & Explaining)
  strength: number; // 0 - 100: 🛡️ FUERZA (Streaks & Discipline)
  dailyScreenTimeLimitMinutes: number; // User customized budget (e.g. 60, 90, 120 min)
  dailyXPGoal: number; // Daily learning goal (e.g. 100 XP)
  todayXPEarned: number; // Accumulated learning XP today
  todayBuildActionsCompleted: number; // Framework actions executed in Apply
  totalFocusMinutesToday: number; // Minutes in Deep Work Focus Guard
  lastFedTimestamp: number;
  lastFocusTimestamp: number;
  timesPettedToday: number;
  lastPetTimestamp: number;
  isDeadOrCritical?: boolean;
  resuscitationCount?: number;
}

export const DEFAULT_PET_STATE: T1gerPetState = {
  health: 100,
  hunger: 80,
  energy: 85,
  strength: 75,
  dailyScreenTimeLimitMinutes: 90, // 1h 30m default
  dailyXPGoal: 100, // 1 lesson default
  todayXPEarned: 100,
  todayBuildActionsCompleted: 1,
  totalFocusMinutesToday: 0,
  lastFedTimestamp: Date.now(),
  lastFocusTimestamp: Date.now(),
  timesPettedToday: 0,
  lastPetTimestamp: 0,
  isDeadOrCritical: false,
  resuscitationCount: 0,
};

/**
 * Calculates exact real-time Trinity vitals + Life & Death thresholds.
 */
export function calculatePetVitalsWithDecay(current: T1gerPetState, now: number = Date.now()): T1gerPetState {
  const screenTimeReport = AndroidScreenTimeService.getReport();
  const screenTimeMinutes = screenTimeReport.totalMinutes || 0;
  const screenTimeBudget = Math.max(30, current.dailyScreenTimeLimitMinutes || 90);
  const xpGoal = Math.max(50, current.dailyXPGoal || 100);

  // 1. ❤️ HEALTH / VIDA (Android Screen Time)
  // Base health starts at 100.
  let calculatedHealth = 100;
  if (screenTimeMinutes > screenTimeBudget) {
    const excessMinutes = screenTimeMinutes - screenTimeBudget;
    // Every 30 min of excess doomscroll costs ~20 HP
    const penalty = Math.round((excessMinutes / 30) * 20);
    calculatedHealth = Math.max(0, 100 - penalty);
  } else {
    // Within budget: near 100%
    const usageRatio = screenTimeMinutes / screenTimeBudget;
    calculatedHealth = Math.round(100 - (usageRatio * 8));
  }

  // Deep work focus sessions heal the tiger (+1% per 2 min)
  const focusBonus = Math.min(35, Math.floor((current.totalFocusMinutesToday || 0) * 0.5));
  calculatedHealth = Math.max(0, Math.min(100, calculatedHealth + focusBonus));

  // 2. 🍖 HUNGER / NUTRICIÓN ("Qué tanto aprendes en la app")
  // Begins moderate in the morning and rises to 100% when you complete your daily lessons
  const todayXP = Math.max(0, current.todayXPEarned || 0);
  let calculatedHunger = 0;
  if (todayXP >= xpGoal) {
    calculatedHunger = 100; // Satiated & fully energized with knowledge
  } else if (todayXP > 0) {
    calculatedHunger = Math.max(25, Math.round((todayXP / xpGoal) * 100));
  } else {
    // 0 lessons today -> hungry (15%)
    calculatedHunger = 15;
  }

  // 3. ⚡ ENERGY / ACCIÓN ("Qué tanto aplicas y explicas")
  const buildActions = current.todayBuildActionsCompleted || 0;
  // If no action applied today -> 30% low energy. Each action gives +35% up to 100%
  let calculatedEnergy = Math.min(100, Math.max(20, 30 + (buildActions * 35)));

  // 4. 💀 CRITICAL DEATH PROTOCOL
  // It's possible to reach critical state, but requires severe compound neglect:
  // (e.g. Health <= 10% from severe doomscroll AND Hunger <= 20% from 0 lessons)
  const isDeadOrCritical = (calculatedHealth <= 5 && calculatedHunger <= 20) || (calculatedHealth === 0);

  return {
    ...current,
    health: calculatedHealth,
    hunger: calculatedHunger,
    energy: calculatedEnergy,
    strength: Math.max(15, Math.min(100, current.strength || 75)),
    isDeadOrCritical,
  };
}

/**
 * Derives visual mascot mood from Trinity metrics
 */
export function derivePetMood(pet: T1gerPetState): MascotReaction {
  if (pet.isDeadOrCritical || pet.health <= 5) {
    return 'mistake'; // Injured / Critical
  }
  if (pet.health >= 80 && pet.hunger >= 80 && pet.energy >= 70) {
    return 'beast'; // Apex Beast Mode
  }
  if (pet.health >= 60 && pet.hunger >= 60) {
    return 'happy';
  }
  if (pet.health < 35) {
    return 'mistake'; // Sick from screen time
  }
  if (pet.hunger < 35) {
    return 'thinking'; // Starving for lessons
  }
  return 'idle';
}

/**
 * Returns dynamic contextual speech dialogue
 */
export function getPetDialogue(pet: T1gerPetState, isEs: boolean = true): {
  title: string;
  subtitle: string;
  statusType: 'critical' | 'beast' | 'health_low' | 'hunger_low' | 'energy_low' | 'balanced';
} {
  const report = AndroidScreenTimeService.getReport();
  const budgetHours = (pet.dailyScreenTimeLimitMinutes / 60).toFixed(1);

  if (pet.isDeadOrCritical || pet.health <= 5) {
    return {
      statusType: 'critical',
      title: isEs ? '🚨 ¡T1GER EN ESTADO CRÍTICO!' : '🚨 T1GER IN CRITICAL STATE!',
      subtitle: isEs
        ? '¡Exceso severo de pantalla y cero estudio! T1GER ha colapsado. Requiere Resucitación de Foco de Emergencia.'
        : 'Severe screen time excess and no learning! T1GER collapsed. Emergency Focus Resuscitation required.',
    };
  }

  if (report.totalMinutes > pet.dailyScreenTimeLimitMinutes || pet.health < 40) {
    return {
      statusType: 'health_low',
      title: isEs ? '💔 ¡Vida Crítica por Tiempo en Pantalla!' : '💔 Critical Health from Screen Time!',
      subtitle: isEs
        ? `Llevas ${report.totalHours}h en redes (límite: ${budgetHours}h). Tu vida cayó a ${pet.health}%. ¡Lávame o activa Guardia de Enfoque!`
        : `Spent ${report.totalHours}h on phone (limit: ${budgetHours}h). Health at ${pet.health}%. Wash me or start Focus Guard!`,
    };
  }

  if (pet.hunger < 40) {
    return {
      statusType: 'hunger_low',
      title: isEs ? '🍖 Hambre de Saber' : '🍖 Starving for Knowledge',
      subtitle: isEs
        ? `Llevas ${pet.todayXPEarned}/${pet.dailyXPGoal} XP en lecciones. Completa lecciones en "Aprender" para nutrirme.`
        : `Earned ${pet.todayXPEarned}/${pet.dailyXPGoal} XP. Complete lessons in "Learn" to nourish me.`,
    };
  }

  if (pet.energy < 40) {
    return {
      statusType: 'energy_low',
      title: isEs ? '⚡ Falta Aplicar lo Aprendido' : '⚡ Needs Practical Execution',
      subtitle: isEs
        ? 'La teoría sin acción no genera energía. Ve a "Aplicar", crea tu oferta o simula trading para cargar mi estamina.'
        : 'Theory without action drains energy. Go to "Apply", forge offers or trade to recharge stamina.',
    };
  }

  if (pet.health >= 80 && pet.hunger >= 80 && pet.energy >= 70) {
    return {
      statusType: 'beast',
      title: isEs ? '🔥 ¡MODO APEX BEAST ACTIVO!' : '🔥 APEX BEAST MODE ACTIVE!',
      subtitle: isEs
        ? '¡Bajo celular, lecciones al día y ejecución táctica real! Ganando +50% de XP en todo el sistema.'
        : 'Low screen time, lessons up to date and real action! Earning +50% XP multiplier across the app.',
    };
  }

  return {
    statusType: 'balanced',
    title: isEs ? '⚡ T1GER en Balance Operativo' : '⚡ T1GER in Operational Balance',
    subtitle: isEs
      ? '¡Excelente disciplina! Cuida tu vida, mantén el hambre saciada y aplica lo aprendido hoy.'
      : 'Great discipline! Protect your life, stay well-nourished and apply your learnings today.',
  };
}

/**
 * Finch/Habitica Evolution Stage
 */
export function getPetEvolutionStage(userLevel: number, totalXP: number): {
  stage: 1 | 2 | 3 | 4;
  title: string;
  nextLevelXP: number;
  currentXPInLevel: number;
  stageProgressPct: number;
} {
  const stage = userLevel >= 30 ? 4 : userLevel >= 15 ? 3 : userLevel >= 5 ? 2 : 1;
  const stageNames = {
    1: 'Cachorro Inversor',
    2: 'Operador Táctico',
    3: 'Alpha de Negocios',
    4: 'Titán Obsidiana',
  };

  const xpInStage = totalXP % 500;
  const stageProgressPct = Math.min(100, Math.round((xpInStage / 500) * 100));

  return {
    stage,
    title: stageNames[stage],
    nextLevelXP: 500,
    currentXPInLevel: xpInStage,
    stageProgressPct,
  };
}

export function get30DayConsistencyGrid(
  history: any[],
  currentScreenTimeHours: number,
  limitHours: number
): { day: number; success: boolean; label: string }[] {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const isToday = i === 0;
    const success = isToday ? currentScreenTimeHours <= limitHours : Math.random() > 0.3;
    days.push({
      day: 30 - i,
      success,
      label: `Día ${30 - i}`,
    });
  }
  return days;
}
