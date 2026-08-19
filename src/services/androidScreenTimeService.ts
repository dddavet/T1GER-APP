export interface AppUsage {
  packageName: string;
  appName: string;
  minutes: number;
  iconEmoji: string;
  percentage: number;
}

export interface ScreenTimeReport {
  isNativeAndroid: boolean;
  hasPermission: boolean;
  totalMinutes: number;
  totalHours: number;
  hourlyWage: number;
  estimatedLossUSD: number;
  booksEquivalentYear: number;
  compound10YearsUSD: number;
  apps: AppUsage[];
  lastUpdated: number;
}

const DEFAULT_MOCK_APPS: Omit<AppUsage, 'percentage'>[] = [
  { packageName: 'com.zhiliaoapp.musically', appName: 'TikTok', minutes: 85, iconEmoji: '🎵' },
  { packageName: 'com.instagram.android', appName: 'Instagram', minutes: 55, iconEmoji: '📸' },
  { packageName: 'com.google.android.youtube', appName: 'YouTube', minutes: 40, iconEmoji: '▶️' },
  { packageName: 'com.twitter.android', appName: 'X (Twitter)', minutes: 20, iconEmoji: '𝕏' },
];

export class AndroidScreenTimeService {
  private static getHourlyWage(): number {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('t1ger_hourly_wage');
      if (saved) return parseFloat(saved);
    }
    return 15;
  }

  public static isAndroidNative(): boolean {
    return typeof window !== 'undefined' && Boolean((window as any).AndroidScreenTime);
  }

  public static checkPermission(): boolean {
    if (this.isAndroidNative()) {
      try {
        return (window as any).AndroidScreenTime.hasUsagePermission();
      } catch {
        return false;
      }
    }
    // In web simulator, return true if user opted-in
    if (typeof window !== 'undefined') {
      return localStorage.getItem('t1ger_android_usage_granted') === 'true';
    }
    return false;
  }

  public static requestPermission(): void {
    if (this.isAndroidNative()) {
      try {
        (window as any).AndroidScreenTime.requestUsagePermission();
        return;
      } catch {
        // fallback
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('t1ger_android_usage_granted', 'true');
    }
  }

  public static getReport(): ScreenTimeReport {
    const hourlyWage = this.getHourlyWage();
    const isNative = this.isAndroidNative();
    const hasPermission = this.checkPermission();

    if (isNative && hasPermission) {
      try {
        const rawJson = (window as any).AndroidScreenTime.getDailySocialUsage(hourlyWage);
        const parsed = JSON.parse(rawJson);
        const totalMin = parsed.totalMinutes || 0;
        const appsWithPct: AppUsage[] = (parsed.apps || []).map((a: any) => ({
          ...a,
          percentage: totalMin > 0 ? Math.round((a.minutes / totalMin) * 100) : 0,
        }));

        const totalHrs = totalMin / 60;
        const annualHrs = totalHrs * 365;
        const monthlyInv = (annualHrs / 12) * hourlyWage * 0.5;
        const r = 0.08 / 12;
        const compound10 = Math.round(monthlyInv * ((Math.pow(1 + r, 120) - 1) / r));

        return {
          isNativeAndroid: true,
          hasPermission: true,
          totalMinutes: totalMin,
          totalHours: Math.round(totalHrs * 10) / 10,
          hourlyWage,
          estimatedLossUSD: Math.round(totalHrs * hourlyWage),
          booksEquivalentYear: Math.round(annualHrs / 8),
          compound10YearsUSD: compound10,
          apps: appsWithPct,
          lastUpdated: Date.now(),
        };
      } catch (err) {
        console.warn('Error querying native Android usage stats:', err);
      }
    }

    // Web / Simulator Fallback with customizable total hours
    const configuredHours = typeof window !== 'undefined'
      ? parseFloat(localStorage.getItem('t1ger_screen_time_hours') || '3.3')
      : 3.3;

    const totalMinutes = Math.round(configuredHours * 60);
    const totalAppsMinutes = DEFAULT_MOCK_APPS.reduce((acc, a) => acc + a.minutes, 0);

    const appsWithPct: AppUsage[] = DEFAULT_MOCK_APPS.map(a => {
      const scaledMinutes = Math.round((a.minutes / totalAppsMinutes) * totalMinutes);
      return {
        ...a,
        minutes: scaledMinutes,
        percentage: Math.round((scaledMinutes / totalMinutes) * 100),
      };
    });

    const annualHrs = configuredHours * 365;
    const monthlyInv = (annualHrs / 12) * hourlyWage * 0.5;
    const r = 0.08 / 12;
    const compound10 = Math.round(monthlyInv * ((Math.pow(1 + r, 120) - 1) / r));

    return {
      isNativeAndroid: isNative,
      hasPermission: hasPermission,
      totalMinutes,
      totalHours: Math.round(configuredHours * 10) / 10,
      hourlyWage,
      estimatedLossUSD: Math.round(configuredHours * hourlyWage),
      booksEquivalentYear: Math.round(annualHrs / 8),
      compound10YearsUSD: compound10,
      apps: appsWithPct,
      lastUpdated: Date.now(),
    };
  }

  public static async generateAINotificationScript(
    report: ScreenTimeReport,
    language: 'es' | 'en' = 'es'
  ): Promise<{ title: string; body: string; ctaText: string }> {
    const isEs = language === 'es';
    const topApp = report.apps[0]?.appName || (isEs ? 'redes sociales' : 'social feeds');

    // Default high-impact script
    const defaultScript = {
      title: isEs
        ? `🐅 Alerta T1GER: ${report.totalHours}h en ${topApp} hoy`
        : `🐅 T1GER Alert: ${report.totalHours}h on ${topApp} today`,
      body: isEs
        ? `Hoy consumiste $${report.estimatedLossUSD} USD de tu tiempo en ${topApp}. 1 lección de 4 min en T1GER te devuelve el control y suma +10 vXP.`
        : `You consumed $${report.estimatedLossUSD} USD of your time on ${topApp}. 1 4-min lesson in T1GER restores your edge and earns +10 vXP.`,
      ctaText: isEs ? 'Recuperar mi tiempo (+10 vXP)' : 'Reclaim my time (+10 vXP)',
    };

    // If OpenRouter is available, call NVIDIA Nemotron to generate dynamic copy
    const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (openRouterKey && openRouterKey.trim() !== '') {
      try {
        const prompt = isEs
          ? `Genera una notificación push corta (título y cuerpo de 2 líneas) de la app T1GER para un estudiante que hoy pasó ${report.totalHours} horas en ${topApp} perdiendo aprox $${report.estimatedLossUSD} USD. Sé desafiante y motivacional. Responde en JSON con formato: {"title": "...", "body": "...", "ctaText": "..."}`
          : `Generate a short push notification (title and 2-line body) for T1GER app for a user who spent ${report.totalHours} hours on ${topApp} losing ~$${report.estimatedLossUSD} USD. Format JSON: {"title": "...", "body": "...", "ctaText": "..."}`;

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey.trim()}`,
            'HTTP-Referer': 'https://t1ger.app',
            'X-Title': 'T1GER Notification Engine',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 150
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content || '';
          const match = text.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            if (parsed.title && parsed.body) {
              return {
                title: parsed.title,
                body: parsed.body,
                ctaText: parsed.ctaText || defaultScript.ctaText,
              };
            }
          }
        }
      } catch (e) {
        console.warn('AI notification script fallback:', e);
      }
    }

    return defaultScript;
  }
}
