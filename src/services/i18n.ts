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
    track_completed: '¡TRACK COMPLETADO!',
    track_completed_sub: 'Has dominado todas las lecciones de este módulo.',
    select_track: 'Seleccionar Ruta',
    levels_count: 'Niveles',
    soon: 'Próximamente',

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
    hearts: '❤️ 5',
    check_answer: 'Comprobar Respuesta',
    correct: '¡Excelente!',
    incorrect: 'Casi, pero no.',
    understood: 'Entendido',

    // Profile & Settings
    profile_title: 'Perfil Ejecuto',
    language_setting: 'Idioma de la Aplicación',
    spanish: 'Español 🇪🇸',
    english: 'English 🇺🇸',
    switch_account: 'Cambiar de Cuenta (5 Perfiles)',
    privacy_policy: 'Política de Privacidad',
    terms_of_service: 'Términos de Servicio',
    delete_account: 'Eliminar Cuenta y Datos',
    legal_compliance: 'Conformidad Legal Google Play Store & Apple App Store',
    founder: 'Fundador & Admin',
    executive_investor: 'Inversor Ejecutivo',
    ai_engineer: 'Ingeniera de IA',
    growth_exec: 'Ejecutiva de Crecimiento',
    new_user: 'Usuario Nuevo (Onboarding)',

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
    hearts: '❤️ 5',
    check_answer: 'Check Answer',
    correct: 'Excellent!',
    incorrect: 'Not quite.',
    understood: 'Understood',

    // Profile & Settings
    profile_title: 'Executive Profile',
    language_setting: 'App Language',
    spanish: 'Español 🇪🇸',
    english: 'English 🇺🇸',
    switch_account: 'Switch Account (5 Profiles)',
    privacy_policy: 'Privacy Policy',
    terms_of_service: 'Terms of Service',
    delete_account: 'Delete Account & Data',
    legal_compliance: 'Google Play Store & Apple App Store Compliance',
    founder: 'Founder & Admin',
    executive_investor: 'Executive Investor',
    ai_engineer: 'AI Engineer',
    growth_exec: 'Growth Executive',
    new_user: 'New User (Onboarding)',

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
