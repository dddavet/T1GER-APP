/**
 * T1GER OneSignal SDK Controller (Web + Native Android / Capacitor)
 * Handles SDK initialization, user identification, tagging, runtime permissions, and deep-linking.
 */

type WebOneSignal = typeof import('react-onesignal')['default'];

let webOneSignalPromise: Promise<WebOneSignal> | null = null;

async function getWebOneSignal(): Promise<WebOneSignal> {
  if (!webOneSignalPromise) {
    webOneSignalPromise = import('react-onesignal').then(module => module.default);
  }
  return webOneSignalPromise;
}

export interface NotificationPayloadData {
  screen?: string;
  view?: 'learn' | 'coach' | 'compete' | 'profile' | 'market';
  missionId?: string;
  url?: string;
  action?: string;
}

export class OneSignalService {
  private static isInitialized = false;
  private static runtime: 'native' | 'web' | null = null;
  private static onNotificationClickHandler?: (data: NotificationPayloadData) => void;

  /**
   * Initializes OneSignal reading VITE_ONESIGNAL_APP_ID
   */
  public static async init(onDeepLink?: (data: NotificationPayloadData) => void): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;

    if (onDeepLink) {
      this.onNotificationClickHandler = onDeepLink;
    }

    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
    if (!appId || appId.includes('0000-0000')) {
      console.log('[OneSignal] Skipping initialization: No valid VITE_ONESIGNAL_APP_ID provided.');
      return;
    }

    try {
      // 1. Native Capacitor / Cordova OneSignal Check
      if ((window as any).plugins?.OneSignal) {
        const NativeOneSignal = (window as any).plugins.OneSignal;
        NativeOneSignal.initialize(appId);

        // Native notification click listener
        NativeOneSignal.Notifications.addEventListener('click', (event: any) => {
          console.log('[OneSignal Native] Notification clicked:', event);
          const data: NotificationPayloadData = event?.notification?.additionalData || {};
          this.handleDeepLink(data);
        });

        this.isInitialized = true;
        this.runtime = 'native';
        console.log('[OneSignal] Native Android initialized successfully with App ID:', appId);
        return;
      }

      // 2. Web / PWA OneSignal Initialization
      if (appId && !appId.includes('0000-0000')) {
        const OneSignal = await getWebOneSignal();
        await OneSignal.init({
          appId,
          allowLocalhostAsSecureOrigin: true,
        });

        // Web notification click listener
        OneSignal.Notifications.addEventListener('click', (event: any) => {
          console.log('[OneSignal Web] Notification clicked:', event);
          const data: NotificationPayloadData = event?.notification?.data || {};
          this.handleDeepLink(data);
        });

        this.isInitialized = true;
        this.runtime = 'web';
        console.log('[OneSignal] Web SDK initialized successfully.');
      } else {
        console.info('[OneSignal] Running in dev mode with mock OneSignal bridge.');
        this.isInitialized = true;
      }
    } catch (err) {
      console.warn('[OneSignal] Initialization note (dev/preview mode):', err);
      this.isInitialized = true;
    }
  }

  /**
   * Dispatches deep link navigation to the active application view
   */
  public static handleDeepLink(data: NotificationPayloadData): void {
    if (this.onNotificationClickHandler) {
      this.onNotificationClickHandler(data);
    }

    // Also dispatch global window event for decoupled listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('t1ger_push_deeplink', { detail: data })
      );
    }
  }

  /**
   * Sets the user ID and user properties in OneSignal
   */
  public static async identifyUser(userId: string, tags?: Record<string, string | number>): Promise<void> {
    const stringTags: Record<string, string> = {};
    if (tags) {
      Object.entries(tags).forEach(([k, v]) => {
        stringTags[k] = String(v);
      });
    }

    try {
      // Never touch the native bridge until init() has accepted a real App ID.
      // The Cordova plugin throws on Android when login/addTags runs pre-init.
      if (!this.isInitialized) return;

      if (this.runtime === 'native' && (window as any).plugins?.OneSignal) {
        (window as any).plugins.OneSignal.login(userId);
        if (tags) {
          (window as any).plugins.OneSignal.User.addTags(tags);
        }
        return;
      }

      if (this.isInitialized && this.runtime === 'web') {
        const OneSignal = await getWebOneSignal();
        await OneSignal.login(userId);
        if (tags) {
          await OneSignal.User.addTags(stringTags);
        }
      }
    } catch (e) {
      console.warn('[OneSignal] Identify user error:', e);
    }
  }

  /**
   * Updates streak and league tags for targeted behavioral push notifications
   */
  public static async updateStreakTags(streak: number, verifiedXP: number, league: string): Promise<void> {
    const tags: Record<string, string> = {
      streak_days: String(streak),
      verified_xp: String(verifiedXP),
      league_division: league,
      last_active: new Date().toISOString().split('T')[0],
    };

    try {
      if ((window as any).plugins?.OneSignal) {
        (window as any).plugins.OneSignal.User.addTags(tags);
        return;
      }
      if (this.isInitialized && this.runtime === 'web') {
        const OneSignal = await getWebOneSignal();
        await OneSignal.User.addTags(tags);
      }
    } catch (e) {
      // Ignored
    }
  }

  /**
   * Requests native push notification permission (Android 13+ / Web Push)
   */
  public static async requestPermission(): Promise<boolean> {
    try {
      // Native Android / Capacitor
      if (this.isInitialized && this.runtime === 'native' && (window as any).plugins?.OneSignal) {
        const granted = await (window as any).plugins.OneSignal.Notifications.requestPermission(true);
        return Boolean(granted);
      }

      // Web Push
      if (this.isInitialized && this.runtime === 'web') {
        const OneSignal = await getWebOneSignal();
        await OneSignal.Notifications.requestPermission();
        return OneSignal.Notifications.permission;
      }

      // Browser Fallback
      if (typeof Notification !== 'undefined') {
        const result = await Notification.requestPermission();
        return result === 'granted';
      }
    } catch (e) {
      console.warn('[OneSignal] Request permission error:', e);
    }

    return false;
  }

  /**
   * Checks current permission status
   */
  public static isPermissionGranted(): boolean {
    if (typeof Notification !== 'undefined') {
      return Notification.permission === 'granted';
    }
    return false;
  }
}
