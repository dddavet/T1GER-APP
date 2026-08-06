/**
 * T1GER Notification Engine
 * Manages all behavioral and retention-focused notifications.
 * Uses Firebase Cloud Messaging (FCM) payloads.
 */

// Tipos de Notificación
export type NotificationType = 
  | 'daily_reminder'
  | 'streak_risk'
  | 'streak_lost'
  | 'streak_milestone'
  | 'level_up'
  | 'leaderboard_drop'
  | 'reengagement_3d'
  | 'reengagement_7d'
  | 'onboarding_nudge';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Diccionario central de notificaciones con la "Voz T1GER" (directa, motivacional, sin excusas).
 */
export const T1gerNotificationDictionary: Record<NotificationType, (data?: any) => NotificationPayload> = {
  daily_reminder: (data) => ({
    title: 'Misión Ejecutiva Pendiente',
    body: `El mercado no espera. 5 minutos es todo lo que necesitas para tu misión de hoy.`,
    data: { action: 'open_mission' }
  }),
  
  streak_risk: (data) => ({
    title: '🔥 Tu racha está en peligro',
    body: `Llevas ${data?.streak || 0} días construyendo disciplina. No lo arruines hoy. Entra ahora.`,
    data: { action: 'open_mission' }
  }),

  streak_lost: () => ({
    title: 'Racha perdida.',
    body: 'Caer es parte del proceso. Levantarse al día siguiente es lo que define a un líder. Reinicia tu racha hoy.',
    data: { action: 'open_app' }
  }),

  streak_milestone: (data) => ({
    title: `🏆 ¡${data?.streak || 0} Días Consecutivos!`,
    body: `Estás en el 1% que no se rinde. Celebremos este hito y sigamos construyendo.`,
    data: { action: 'open_profile' }
  }),

  level_up: (data) => ({
    title: `📈 Nivel ${data?.level || 2} Desbloqueado`,
    body: 'Has subido de nivel. Nuevas misiones y conceptos ejecutivos están disponibles.',
    data: { action: 'open_learn' }
  }),

  leaderboard_drop: (data) => ({
    title: '⚠️ Alguien te ha superado',
    body: `${data?.competitorName || 'Un competidor'} te acaba de pasar en la Liga. Completa una misión para recuperar tu puesto.`,
    data: { action: 'open_compete' }
  }),

  reengagement_3d: () => ({
    title: '¿Dónde está tu enfoque?',
    body: '3 días fuera del simulador. El mundo de los negocios se mueve rápido. Vuelve al entrenamiento.',
    data: { action: 'open_app' }
  }),

  reengagement_7d: () => ({
    title: 'T1GER Protocol: Alerta de Inactividad',
    body: 'Una semana entera sin entrenar. Tu competencia no está descansando. Es hora de volver.',
    data: { action: 'open_app' }
  }),

  onboarding_nudge: () => ({
    title: 'Completa tu Perfil Ejecutivo',
    body: 'Iniciaste el proceso pero no lo terminaste. Termina tu Onboarding para desbloquear tu ruta.',
    data: { action: 'open_onboarding' }
  })
};

/**
 * Función para programar/evaluar el envío de notificaciones.
 * Nota: En un entorno de producción real, estos triggers se validan mediante Firebase Cloud Functions o cron jobs en el servidor.
 * Aquí definimos la lógica de evaluación cliente.
 */
export const evaluateNotificationTriggers = (userStats: any) => {
  const triggers: NotificationPayload[] = [];
  
  // Logic to determine if a streak is at risk (e.g. late in the day and hasn't trained)
  const hour = new Date().getHours();
  if (!userStats.trainedToday && hour >= 20) {
    triggers.push(T1gerNotificationDictionary.streak_risk({ streak: userStats.streakCount }));
  }

  // etc.
  
  return triggers;
};
