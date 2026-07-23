// ============================================================
// T1GER APP INTERNATIONALIZATION (i18n) SERVICE
// Full Support for 100% Pure Spanish (es) & English (en)
// ============================================================

export type Language = 'es' | 'en';

export const TRANSLATIONS = {
  es: {
    // NavDock
    nav_home: 'Inicio',
    nav_learn: 'Aprender',
    nav_coach: 'Coach',
    nav_tactical: 'Táctico',
    nav_profile: 'Perfil',

    // WindingPath / Learn
    stage: 'ETAPA',
    section: 'SECCIÓN',
    day: 'DÍA',
    start_lesson: '¡EMPEZAR (+100 XP)!',
    track_completed: '¡RUTA COMPLETADA!',
    track_completed_sub: 'Has dominado todas las lecciones de este módulo.',
    select_track: 'Seleccionar Ruta',
    levels_count: 'Niveles',
    soon: 'Próximamente',
    foundations: 'Fundamentos Ejecutivos',
    foundations_desc: 'Dominando principios clave de negocios e inversión diariamente.',

    // Tracks
    track_investing: 'Inversiones',
    track_business: 'Negocios',
    track_ai: 'Inteligencia Artificial',

    // MissionEngine / Lessons
    mission_complete: 'LECCIÓN COMPLETADA',
    continue: 'CONTINUAR ➔',
    view_takeaway: 'VER CONCLUSIÓN ➔',
    complete_lesson: 'COMPLETAR LECCIÓN 🟢',
    skip: 'SALTAR',
    verified_source: 'Fuente Verificada',
    why_it_matters: 'Por qué importa hoy',
    executive_knowledge: 'CONOCIMIENTO EJECUTIVO',
    read_carefully: 'Lee atentamente la lección condensada:',
    tactical_conclusion: 'CONCLUSIÓN TÁCTICA',
    decision_rule: 'Regla de Decisión Ejecutiva',
    reward: 'Recompensa',
    hearts: '❤️ 5 Vidas',
    check_answer: 'Comprobar Respuesta',
    correct: '¡Excelente!',
    incorrect: 'Casi, pero no.',
    understood: 'Entendido',

    // Profile & Settings
    profile_title: 'Perfil Ejecutivo',
    language_setting: 'Idioma de la Aplicación',
    spanish: 'Español 🇪🇸',
    english: 'English 🇺🇸',
    switch_account_title: 'Cambiar de Cuenta (5 Perfiles)',
    switch_account_sub: 'Alterna al instante entre 5 usuarios de prueba con diferentes niveles, competencias y estados de onboarding:',
    switch_account_btn: 'Cambiar de Cuenta / Iniciar Sesión',
    privacy_policy: 'Política de Privacidad',
    terms_of_service: 'Términos de Servicio',
    delete_account: 'Eliminar Cuenta y Datos',
    legal_compliance: 'Conformidad Legal Google Play Store & Apple App Store',
    streak_days: 'Días de Racha',
    tactical_score: 'Puntuación Táctica',
    total_xp: 'XP Total',
    active: 'ACTIVO',
    guest_mode: 'Modo Invitado',
    tap_dev: 'Modo Dev (5x)',
    dev_on: 'Dev Activado',

    // Demo Presets
    preset_founder_label: 'Fundador & Admin',
    preset_founder_desc: 'Acceso completo de administrador, racha de 67 días, maestrías avanzadas',
    preset_investor_label: 'Inversor Ejecutivo',
    preset_investor_desc: 'Perfil de inversor ángel, enfocado en valoración y finanzas',
    preset_ai_label: 'Ingeniera de IA',
    preset_ai_desc: 'Enfocada en ingeniería de prompts, LLMs y automatización',
    preset_growth_label: 'Ejecutiva de Crecimiento',
    preset_growth_desc: 'Enfocada en adquisición, retención, unit economics y CAC',
    preset_newbie_label: 'Usuario Nuevo (Onboarding)',
    preset_newbie_desc: 'Racha de 0 días, listo para experimentar el flujo completo de onboarding',

    // Dashboard
    daily_streak: 'Racha Diaria',
    xp_coins: 'Puntos XP',
    current_level: 'Nivel Actual',
    quick_start: 'Comenzar Lección',
    phase_learn: 'Aprender',
    phase_apply: 'Aplicar',
    phase_repeat: 'Repetir',
  },
  en: {
    // NavDock
    nav_home: 'Home',
    nav_learn: 'Learn',
    nav_coach: 'Coach',
    nav_tactical: 'Tactical',
    nav_profile: 'Profile',

    // WindingPath / Learn
    stage: 'STAGE',
    section: 'SECTION',
    day: 'DAY',
    start_lesson: 'START (+100 XP)!',
    track_completed: 'TRACK COMPLETED!',
    track_completed_sub: 'You mastered all lessons in this module.',
    select_track: 'Select Track',
    levels_count: 'Levels',
    soon: 'Coming Soon',
    foundations: 'Executive Foundations',
    foundations_desc: 'Mastering key business & investment principles daily.',

    // Tracks
    track_investing: 'Investing',
    track_business: 'Business',
    track_ai: 'Artificial Intelligence',

    // MissionEngine / Lessons
    mission_complete: 'LESSON COMPLETE',
    continue: 'CONTINUE ➔',
    view_takeaway: 'VIEW TAKEAWAY ➔',
    complete_lesson: 'COMPLETE LESSON 🟢',
    skip: 'SKIP',
    verified_source: 'Verified Source',
    why_it_matters: 'Why it matters today',
    executive_knowledge: 'EXECUTIVE KNOWLEDGE',
    read_carefully: 'Read condensed lesson carefully:',
    tactical_conclusion: 'TACTICAL TAKEAWAY',
    decision_rule: 'Executive Decision Rule',
    reward: 'Reward',
    hearts: '❤️ 5 Hearts',
    check_answer: 'Check Answer',
    correct: 'Excellent!',
    incorrect: 'Not quite.',
    understood: 'Understood',

    // Profile & Settings
    profile_title: 'Executive Profile',
    language_setting: 'App Language',
    spanish: 'Español 🇪🇸',
    english: 'English 🇺🇸',
    switch_account_title: 'Switch Account (5 Profiles)',
    switch_account_sub: 'Instantly switch between 5 test users with different levels, competencies, and onboarding states:',
    switch_account_btn: 'Switch Account / Log In',
    privacy_policy: 'Privacy Policy',
    terms_of_service: 'Terms of Service',
    delete_account: 'Delete Account & Data',
    legal_compliance: 'Google Play Store & Apple App Store Compliance',
    streak_days: 'Streak Days',
    tactical_score: 'Tactical Score',
    total_xp: 'Total XP',
    active: 'ACTIVE',
    guest_mode: 'Guest Mode',
    tap_dev: 'Dev Mode (5x)',
    dev_on: 'Dev Enabled',

    // Demo Presets
    preset_founder_label: 'Founder & Admin',
    preset_founder_desc: 'Full admin access, 67-day streak, advanced masteries',
    preset_investor_label: 'Executive Investor',
    preset_investor_desc: 'Angel investor profile, focused on valuation & finance',
    preset_ai_label: 'AI Engineer',
    preset_ai_desc: 'Focused on prompt engineering, LLMs & automation',
    preset_growth_label: 'Growth Executive',
    preset_growth_desc: 'Focused on acquisition, retention, unit economics & CAC',
    preset_newbie_label: 'New User (Onboarding)',
    preset_newbie_desc: '0-day streak, ready to experience full onboarding flow',

    // Dashboard
    daily_streak: 'Daily Streak',
    xp_coins: 'XP Points',
    current_level: 'Current Level',
    quick_start: 'Start Lesson',
    phase_learn: 'Learn',
    phase_apply: 'Apply',
    phase_repeat: 'Repeat',
  }
} as const;

export const t = (key: keyof typeof TRANSLATIONS['es'], lang: Language = 'es'): string => {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['es'][key] || key;
};
