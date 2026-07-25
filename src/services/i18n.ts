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
    reset_onboarding: 'Ver Onboarding con Mascota 3D (Reiniciar)',

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
    phase_learn: 'Fase 01: Aprender (Micro-lecciones)',
    phase_apply: 'Fase 02: Aplicar (Evidencia fotográfica)',
    phase_repeat: 'Fase 03: Repetir (Racha de 7 días)',

    // Modals
    gems_shop_title: 'Tienda de Gemas',
    gems_balance: 'Saldo de Gemas',
    power_ups: 'Potenciadores',
    streak_freeze: 'Escudo de Racha',
    streak_freeze_desc: 'Protege tu racha si pierdes un día de misiones',
    hearts_title: 'Vidas',
    full_hearts: 'Vidas Llenas',
    refill_hearts: 'Restaurar Vidas',
    refill_hearts_desc: 'Recarga tus 5 vidas al instante',
    streak_title: 'Racha Diaria',
    personal_tab: 'Personal',
    friends_tab: 'Amigos',
    day_streak_suffix: '¡días de racha!',

    // Coach & Mentor
    coach_title: 'Mentor T1GER',
    coach_status: 'Activado',
    coach_placeholder: 'Enviar mensaje a T1GER...',
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
    track_completed_sub: 'You have mastered all lessons in this module.',
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
    mission_complete: 'LESSON COMPLETED',
    continue: 'CONTINUE ➔',
    view_takeaway: 'VIEW TAKEAWAY ➔',
    complete_lesson: 'COMPLETE LESSON 🟢',
    skip: 'SKIP',
    verified_source: 'Verified Source',
    why_it_matters: 'Why It Matters Today',
    executive_knowledge: 'EXECUTIVE KNOWLEDGE',
    read_carefully: 'Read the condensed lesson carefully:',
    tactical_conclusion: 'TACTICAL CONCLUSION',
    decision_rule: 'Executive Decision Rule',
    reward: 'Reward',
    hearts: '❤️ 5 Hearts',
    check_answer: 'Check Answer',
    correct: 'Excellent!',
    incorrect: 'Close, but not quite.',
    understood: 'Understood',

    // Profile & Settings
    profile_title: 'Executive Profile',
    language_setting: 'App Language',
    spanish: 'Español 🇪🇸',
    english: 'English 🇺🇸',
    switch_account_title: 'Switch Account (5 Presets)',
    switch_account_sub: 'Instantly toggle between 5 test users with different skill levels and onboarding status:',
    switch_account_btn: 'Switch Account / Sign In',
    privacy_policy: 'Privacy Policy',
    terms_of_service: 'Terms of Service',
    delete_account: 'Delete Account & Data',
    legal_compliance: 'Google Play & Apple App Store Legal Compliance',
    streak_days: 'Streak Days',
    tactical_score: 'Tactical Score',
    total_xp: 'Total XP',
    active: 'ACTIVE',
    guest_mode: 'Guest Mode',
    tap_dev: 'Dev Mode (5x)',
    dev_on: 'Dev Mode On',
    reset_onboarding: 'Preview 3D Mascot Onboarding (Reset)',

    // Demo Presets
    preset_founder_label: 'Founder & Admin',
    preset_founder_desc: 'Full admin access, 67-day streak, advanced skill mastery',
    preset_investor_label: 'Executive Investor',
    preset_investor_desc: 'Angel investor profile focused on valuation & capital allocation',
    preset_ai_label: 'AI Engineer',
    preset_ai_desc: 'Focused on prompt engineering, LLMs & workflow automation',
    preset_growth_label: 'Growth Executive',
    preset_growth_desc: 'Focused on acquisition, retention, unit economics & CAC',
    preset_newbie_label: 'New User (Onboarding)',
    preset_newbie_desc: '0-day streak, ready to experience the full onboarding flow',

    // Dashboard
    daily_streak: 'Daily Streak',
    xp_coins: 'XP Points',
    current_level: 'Current Level',
    quick_start: 'Start Lesson',
    phase_learn: 'Phase 01: Learn (Micro-lessons)',
    phase_apply: 'Phase 02: Apply (Photo Proof)',
    phase_repeat: 'Phase 03: Repeat (7-Day Streak)',

    // Modals
    gems_shop_title: 'Gems Shop',
    gems_balance: 'Gems Balance',
    power_ups: 'Power-Ups',
    streak_freeze: 'Streak Freeze',
    streak_freeze_desc: 'Protect your streak if you miss a mission day',
    hearts_title: 'Hearts',
    full_hearts: 'Full Hearts',
    refill_hearts: 'Refill Hearts',
    refill_hearts_desc: 'Instantly refill all 5 hearts',
    streak_title: 'Daily Streak',
    personal_tab: 'Personal',
    friends_tab: 'Friends',
    day_streak_suffix: 'day streak!',

    // Coach & Mentor
    coach_title: 'T1GER Mentor',
    coach_status: 'Activated',
    coach_placeholder: 'Message T1GER...',
  }
};

export const t = (key: keyof typeof TRANSLATIONS['es'], lang: Language): string => {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['es'][key] || key;
};
