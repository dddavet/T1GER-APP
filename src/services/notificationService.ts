/**
 * T1GER Multi-Channel Notification & Transactional Email Service
 * Handles In-App Notification Center, Native Web & Android Push, and Transactional HTML Emails.
 */

import {
  renderOpportunityCostEmail,
  renderStreakRiskEmail,
  renderWeeklyDigestEmail,
  renderMissionFeedbackEmail,
} from './emailTemplates';

export type NotificationCategory = 'streak' | 'screentime' | 'coach' | 'league' | 'system';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  actionView?: 'learn' | 'coach' | 'compete' | 'profile';
  metadata?: Record<string, any>;
  emailPreviewHtml?: string;
}

const STORAGE_KEY = 't1ger_app_notifications';

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    category: 'screentime',
    title: '📱 Alerta de Costo de Oportunidad',
    body: 'Hoy estuviste 3h en TikTok e Instagram ($45 USD en juego). Completa tu lección de 4 min para mantener el control.',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 min ago
    read: false,
    actionView: 'learn',
    emailPreviewHtml: renderOpportunityCostEmail({
      userName: 'Emprendedor',
      dailyHours: 3,
      lostUSD: 45,
      streakCount: 5,
      topApp: 'TikTok e Instagram',
      compoundWealth10Years: 245000,
    }),
  },
  {
    id: 'notif-2',
    category: 'streak',
    title: '🔥 ¡Protege tu racha de 5 días!',
    body: 'Quedan pocas horas antes de la medianoche. Entra ahora y resuelve la pregunta de hoy.',
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    read: false,
    actionView: 'learn',
    emailPreviewHtml: renderStreakRiskEmail({
      userName: 'Emprendedor',
      streakCount: 5,
      hoursLeft: 2,
    }),
  },
  {
    id: 'notif-3',
    category: 'coach',
    title: '🐅 Profesor T1GER: Misión Aprobada',
    body: 'Tu cálculo de valor neto fue evaluado con 95/100. Has sumado +50 vXP a tu perfil.',
    timestamp: Date.now() - 1000 * 60 * 360, // 6 hours ago
    read: true,
    actionView: 'coach',
    emailPreviewHtml: renderMissionFeedbackEmail({
      userName: 'Emprendedor',
      missionTitle: 'Cálculo de Patrimonio Neto',
      xpEarned: 50,
      professorScore: 95,
      professorFeedback: 'Excelente diferenciación entre activos productivos y pasivos depreciables. Mantén esa disciplina analítica.',
    }),
  },
  {
    id: 'notif-4',
    category: 'league',
    title: '🏆 División Ámbar: Posición #2',
    body: 'Estás en zona de ascenso directo. La jornada semanal termina pronto.',
    timestamp: Date.now() - 1000 * 60 * 720, // 12 hours ago
    read: true,
    actionView: 'compete',
    emailPreviewHtml: renderWeeklyDigestEmail({
      userName: 'Emprendedor',
      weeklyXP: 350,
      totalHoursSaved: 14,
      leagueRank: 2,
      leagueDivision: 'División Ámbar',
      topSkillLearned: 'Fundamentos de Inversión y Flujo de Caja',
    }),
  },
];

export class NotificationService {
  public static getNotifications(): AppNotification[] {
    if (typeof window === 'undefined') return DEFAULT_NOTIFICATIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
        return DEFAULT_NOTIFICATIONS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  }

  public static getUnreadCount(): number {
    const list = this.getNotifications();
    return list.filter(n => !n.read).length;
  }

  public static markAsRead(id: string): void {
    if (typeof window === 'undefined') return;
    const list = this.getNotifications().map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('t1ger_notifications_updated'));
  }

  public static markAllAsRead(): void {
    if (typeof window === 'undefined') return;
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('t1ger_notifications_updated'));
  }

  public static addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification {
    const full: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      read: false,
    };

    if (typeof window !== 'undefined') {
      const current = this.getNotifications();
      const updated = [full, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('t1ger_notifications_updated'));

      // Dispatch Web Browser Push if granted
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification(full.title, {
            body: full.body,
            icon: '/favicon.ico',
          });
        } catch {
          // Ignored
        }
      }

      // Haptic feedback
      if (window.navigator?.vibrate) {
        window.navigator.vibrate([40, 80, 40]);
      }
    }

    return full;
  }

  public static triggerOpportunityAlert(userName: string, dailyHours: number, lostUSD: number, streakCount: number): AppNotification {
    const emailHtml = renderOpportunityCostEmail({
      userName,
      dailyHours,
      lostUSD,
      streakCount,
      topApp: 'TikTok e Instagram',
      compoundWealth10Years: Math.round(lostUSD * 365 * 0.5 * 10.5),
    });

    return this.addNotification({
      category: 'screentime',
      title: `📱 Alerta T1GER: $${lostUSD} USD en juego hoy`,
      body: `Acumulaste ${dailyHours}h en feeds hoy. 1 lección de 4 min protege tu racha de ${streakCount} días y recupera tu criterio.`,
      actionView: 'learn',
      emailPreviewHtml: emailHtml,
    });
  }

  public static triggerStreakRiskAlert(userName: string, streakCount: number, hoursLeft: number): AppNotification {
    const emailHtml = renderStreakRiskEmail({
      userName,
      streakCount,
      hoursLeft,
    });

    return this.addNotification({
      category: 'streak',
      title: `🔥 ¡Tu racha de ${streakCount} días se congela en ${hoursLeft}h!`,
      body: `Solo toma 4 minutos completar la micro-lección de hoy. No rompas la cadena de disciplina.`,
      actionView: 'learn',
      emailPreviewHtml: emailHtml,
    });
  }

  public static triggerMissionFeedback(userName: string, missionTitle: string, score: number, feedback: string, xpEarned: number): AppNotification {
    const emailHtml = renderMissionFeedbackEmail({
      userName,
      missionTitle,
      xpEarned,
      professorScore: score,
      professorFeedback: feedback,
    });

    return this.addNotification({
      category: 'coach',
      title: `🐅 Profesor T1GER: ${missionTitle} (${score}/100)`,
      body: `Evidencia validada: +${xpEarned} vXP. "${feedback.slice(0, 70)}..."`,
      actionView: 'coach',
      emailPreviewHtml: emailHtml,
    });
  }
}

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof Notification !== 'undefined') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};
