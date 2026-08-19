/**
 * T1GER High-Conversion Transactional HTML Email Templates
 * Fully responsive, dark-mode optimized, styled with T1GER brand tokens (#09090B, #FF7300, #3FC78E)
 */

export interface EmailParams {
  userName: string;
  appUrl?: string;
  unsubscribeUrl?: string;
}

export interface OpportunityEmailParams extends EmailParams {
  dailyHours: number;
  lostUSD: number;
  streakCount: number;
  topApp?: string;
  compoundWealth10Years: number;
}

export interface StreakRiskEmailParams extends EmailParams {
  streakCount: number;
  hoursLeft: number;
  todayDayLabel?: string;
}

export interface WeeklyDigestEmailParams extends EmailParams {
  weeklyXP: number;
  totalHoursSaved: number;
  leagueRank: number;
  leagueDivision: string;
  topSkillLearned: string;
}

export interface MissionFeedbackEmailParams extends EmailParams {
  missionTitle: string;
  xpEarned: number;
  professorScore: number;
  professorFeedback: string;
}

const EMAIL_BASE_STYLES = `
  body { margin: 0; padding: 0; background-color: #09090B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #EAF4F1; -webkit-font-smoothing: antialiased; }
  .email-container { max-width: 560px; margin: 0 auto; background-color: #09231F; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; overflow: hidden; }
  .header { padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .logo { font-size: 24px; font-weight: 900; letter-spacing: -0.04em; color: #FFFFFF; text-decoration: none; display: inline-block; }
  .logo span { color: #FF7300; }
  .badge { display: inline-block; background-color: rgba(255,115,0,0.15); color: #FF7300; border: 1px solid rgba(255,115,0,0.3); border-radius: 999px; padding: 4px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 12px; }
  .content { padding: 32px; }
  .title { font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.03em; margin: 0 0 16px; line-height: 1.3; }
  .text { font-size: 14px; line-height: 1.6; color: #8FAEA7; margin: 0 0 20px; }
  .stat-card { background-color: #0B2B26; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; margin: 24px 0; }
  .stat-grid { display: table; width: 100%; }
  .stat-col { display: table-cell; width: 50%; vertical-align: middle; text-align: center; }
  .stat-val { font-size: 26px; font-weight: 900; color: #FF7300; font-family: monospace; }
  .stat-val-green { font-size: 26px; font-weight: 900; color: #3FC78E; font-family: monospace; }
  .stat-label { font-size: 11px; text-transform: uppercase; color: #6E9189; font-weight: 700; letter-spacing: 0.05em; margin-top: 4px; }
  .cta-btn { display: block; background-color: #FF7300; color: #09090B !important; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em; text-align: center; padding: 16px 24px; border-radius: 16px; text-decoration: none; box-shadow: 0 4px 20px rgba(255,115,0,0.35); margin: 28px 0 12px; }
  .footer { padding: 24px 32px 32px; text-align: center; font-size: 11px; color: #4B6D66; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.06); }
  .footer a { color: #6E9189; text-decoration: underline; }
`;

/**
 * 1. Alerta de Costo de Oportunidad y Screen Time
 */
export const renderOpportunityCostEmail = (params: OpportunityEmailParams): string => {
  const url = params.appUrl || 'https://t1ger.app/?view=learn';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🐅 Alerta de Tiempo T1GER: $${params.lostUSD} USD en juego hoy</title>
  <style>${EMAIL_BASE_STYLES}</style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="email-container">
      <div class="header">
        <a href="${url}" class="logo">T<span>1</span>GER</a><br>
        <span class="badge">📱 Alerta de Costo de Oportunidad</span>
      </div>
      <div class="content">
        <h1 class="title">Hola ${params.userName}, hoy dejaste dinero y disciplina sobre la mesa.</h1>
        <p class="text">
          Nuestros análisis en segundo plano detectaron que hoy acumulaste <strong>${params.dailyHours} horas</strong> en aplicaciones de redes sociales como <em>${params.topApp || 'TikTok e Instagram'}</em>.
        </p>
        
        <div class="stat-card">
          <div class="stat-grid">
            <div class="stat-col" style="border-right: 1px solid rgba(255,255,255,0.08);">
              <div class="stat-val">-$${params.lostUSD}</div>
              <div class="stat-label">Valor de Tiempo Hoy</div>
            </div>
            <div class="stat-col">
              <div class="stat-val-green">+$${params.compoundWealth10Years.toLocaleString()}</div>
              <div class="stat-label">Proyección S&P 500 (10a)</div>
            </div>
          </div>
        </div>

        <p class="text">
          Cada lección de 4 minutos en <strong>T1GER</strong> recupera tu ventaja competitiva, protege tu racha de <strong>${params.streakCount} días</strong> y te enseña a invertir con criterio real.
        </p>

        <a href="${url}" class="cta-btn">Recuperar Mi Tiempo (+10 vXP)</a>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} T1GER APP Inc. · Formación financiera de alto rendimiento.<br>
        Recibes este correo porque activaste los recordatorios inteligentes de uso de pantalla.<br>
        <a href="${params.unsubscribeUrl || '#'}">Gestionar preferencias de notificación</a>
      </div>
    </div>
  </div>
</body>
</html>`;
};

/**
 * 2. Alerta Urgente de Congelación de Racha
 */
export const renderStreakRiskEmail = (params: StreakRiskEmailParams): string => {
  const url = params.appUrl || 'https://t1ger.app/?view=learn';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔥 ¡Tu racha de ${params.streakCount} días está en riesgo!</title>
  <style>${EMAIL_BASE_STYLES}</style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="email-container">
      <div class="header">
        <a href="${url}" class="logo">T<span>1</span>GER</a><br>
        <span class="badge" style="background-color: rgba(255,69,0,0.15); color: #FF4500; border-color: rgba(255,69,0,0.3);">🔥 Alerta de Racha Crítica</span>
      </div>
      <div class="content">
        <h1 class="title">Tu racha de ${params.streakCount} días se congela en ${params.hoursLeft} horas.</h1>
        <p class="text">
          ${params.userName}, has construido ${params.streakCount} días seguidos de criterio e inversión. Solo te toma <strong>4 minutos</strong> completar la micro-lección de hoy antes de la medianoche.
        </p>

        <div class="stat-card" style="text-align: center;">
          <div style="font-size: 48px; line-height: 1;">🔥</div>
          <div class="stat-val" style="font-size: 36px; margin-top: 8px;">${params.streakCount} DÍAS</div>
          <div class="stat-label">Racha Activa en Riesgo</div>
        </div>

        <a href="${url}" class="cta-btn" style="background-color: #FF4500; color: #FFFFFF !important;">Salvar Mi Racha Ahora (4 Min)</a>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} T1GER APP Inc. · Disciplina y resultados diarios.<br>
        <a href="${params.unsubscribeUrl || '#'}">Desactivar alertas de racha</a>
      </div>
    </div>
  </div>
</body>
</html>`;
};

/**
 * 3. Reporte Semanal de División y Libertad Financiera
 */
export const renderWeeklyDigestEmail = (params: WeeklyDigestEmailParams): string => {
  const url = params.appUrl || 'https://t1ger.app/?view=compete';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🏆 Tu Resumen Semanal T1GER: Top ${params.leagueRank} en ${params.leagueDivision}</title>
  <style>${EMAIL_BASE_STYLES}</style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="email-container">
      <div class="header">
        <a href="${url}" class="logo">T<span>1</span>GER</a><br>
        <span class="badge" style="background-color: rgba(63,199,142,0.15); color: #78DDB0; border-color: rgba(63,199,142,0.3);">🏆 Resumen Semanal de Rendimiento</span>
      </div>
      <div class="content">
        <h1 class="title">Excelente semana, ${params.userName}. Aquí están tus números.</h1>
        <p class="text">
          Has completado una semana más dominando <em>${params.topSkillLearned}</em> y reclamando horas valiosas frente al ruido de las redes sociales.
        </p>

        <div class="stat-card">
          <div class="stat-grid">
            <div class="stat-col" style="border-right: 1px solid rgba(255,255,255,0.08);">
              <div class="stat-val-green">+${params.weeklyXP}</div>
              <div class="stat-label">vXP Ganados</div>
            </div>
            <div class="stat-col">
              <div class="stat-val">#${params.leagueRank}</div>
              <div class="stat-label">${params.leagueDivision}</div>
            </div>
          </div>
        </div>

        <p class="text">
          Le ahorraste a tu mente <strong>${params.totalHoursSaved} horas</strong> de scroll infinito. La nueva jornada de división comienza hoy.
        </p>

        <a href="${url}" class="cta-btn">Ver Tabla de la Liga y Ascensos</a>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} T1GER APP Inc. · Competencia y Maestría.<br>
        <a href="${params.unsubscribeUrl || '#'}">Preferencias de correo semanal</a>
      </div>
    </div>
  </div>
</body>
</html>`;
};

/**
 * 4. Feedback y Validación del Profesor T1GER
 */
export const renderMissionFeedbackEmail = (params: MissionFeedbackEmailParams): string => {
  const url = params.appUrl || 'https://t1ger.app/?view=coach';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🐅 El Profesor T1GER evaluó tu evidencia: +${params.xpEarned} vXP</title>
  <style>${EMAIL_BASE_STYLES}</style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="email-container">
      <div class="header">
        <a href="${url}" class="logo">T<span>1</span>GER</a><br>
        <span class="badge">🐅 Feedback del Mentor</span>
      </div>
      <div class="content">
        <h1 class="title">Tu misión "${params.missionTitle}" fue aprobada.</h1>
        
        <div class="stat-card" style="border-left: 4px solid #FF7300;">
          <p style="margin: 0; font-size: 13px; font-style: italic; color: #EAF4F1; line-height: 1.6;">
            "${params.professorFeedback}"
          </p>
          <div style="margin-top: 12px; font-size: 11px; font-weight: 700; color: #FF7300; text-transform: uppercase;">
            — Profesor T1GER (Puntuación: ${params.professorScore}/100 · +${params.xpEarned} vXP)
          </div>
        </div>

        <a href="${url}" class="cta-btn">Hablar con el Profesor</a>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} T1GER APP Inc.<br>
        <a href="${params.unsubscribeUrl || '#'}">Ajustes</a>
      </div>
    </div>
  </div>
</body>
</html>`;
};
