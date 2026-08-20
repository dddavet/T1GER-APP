import type { Language } from './i18n';
import type { BankMission, CurriculumLevel } from './missionBank';

type LocalizedMission = Partial<Pick<BankMission,
  | 'title'
  | 'concept'
  | 'keyTakeaway'
  | 'recallQuestion'
  | 'recallOptions'
  | 'recallExplanation'
  | 'taskBrief'
  | 'reflectionPrompt'
  | 'frameworkSteps'
>>;

const SPANISH_MISSIONS: Record<string, LocalizedMission> = {
  'inv-m1-l1': {
    title: 'Activos y pasivos',
    concept: 'El balance general es una fotografía financiera: los activos son recursos con valor; los pasivos, obligaciones. La diferencia es el patrimonio neto.',
    keyTakeaway: 'Patrimonio neto = activos − pasivos. Clasifica cada elemento antes de evaluar tu salud financiera.',
    recallQuestion: '¿Qué fórmula calcula correctamente el patrimonio neto?',
    recallOptions: [
      { text: 'Activos menos pasivos', correct: true },
      { text: 'Ingresos menos gastos', correct: false },
      { text: 'Efectivo más deuda', correct: false },
    ],
    recallExplanation: 'Al restar los pasivos de los activos obtienes el valor que realmente te pertenece.',
  },
  'inv-m1-l2': {
    title: 'Valor del dinero en el tiempo',
    concept: 'El dinero disponible hoy puede invertirse y crecer con el tiempo. Las proyecciones dependen del plazo, los aportes y una rentabilidad estimada; nunca de una tasa garantizada.',
    keyTakeaway: 'Define primero la meta y el plazo. Después prueba escenarios conservadores.',
  },
  'inv-m1-apply': {
    title: 'Calcula tu patrimonio neto',
    taskBrief: 'Calcula tu patrimonio neto actual y registra los supuestos detrás del resultado.',
    reflectionPrompt: 'Escribe el total de activos, el total de pasivos, tu patrimonio neto y un supuesto que todavía debas comprobar.',
    frameworkSteps: [
      { title: 'Suma tus activos', desc: 'Incluye efectivo, inversiones y estimaciones prudentes de tus propiedades.' },
      { title: 'Suma tus pasivos', desc: 'Incluye tarjetas, préstamos y cualquier otra obligación.' },
      { title: 'Registra el resultado', desc: 'Resta los pasivos y anota una cifra que necesites verificar.' },
    ],
  },
  'inv-m2-l1': {
    title: 'Riesgo y emociones',
    concept: 'Tu tolerancia al riesgo combina cuánto estás dispuesto a perder y cuánto puedes permitirte perder. La meta y el plazo deben limitar el riesgo, incluso cuando te sientas muy seguro.',
    keyTakeaway: 'Define una pérdida aceptable antes de elegir una inversión.',
  },
  'inv-m2-l2': {
    title: 'El poder del crecimiento compuesto',
    concept: 'El crecimiento compuesto genera rendimiento sobre tus aportes y sobre los rendimientos anteriores. Empezar antes suma más periodos de crecimiento, aunque el mercado siempre sea incierto.',
    keyTakeaway: 'Puedes controlar el tiempo y la constancia de tus aportes; no el rendimiento del mercado.',
  },
  'inv-m2-apply': {
    title: 'La emoción detrás de una pérdida',
    taskBrief: 'Recuerda una mala decisión financiera e identifica la emoción que la impulsó.',
    reflectionPrompt: 'Describe la emoción y el detonante de esa decisión. ¿Qué señal te ayudará a reconocerlos la próxima vez?',
    frameworkSteps: [
      { title: 'Recuerda', desc: 'Elige una decisión concreta, no una situación general.' },
      { title: 'Identifica', desc: '¿Actuaste por miedo, pánico, euforia o miedo a quedarte fuera?' },
      { title: 'Crea una señal', desc: 'Anota cómo reconocerás esa emoción antes de volver a actuar.' },
    ],
  },
  'inv-m3-l1': {
    title: 'Acciones y fondos indexados',
    concept: 'Una acción representa una parte de una empresa. Un fondo indexado amplio sigue una canasta de valores y reduce la dependencia de una sola compañía, aunque no elimina el riesgo del mercado.',
    keyTakeaway: 'Diversificar reduce el riesgo de concentración; no garantiza que evitarás pérdidas.',
  },
  'inv-m3-l2': {
    title: 'Bonos, efectivo y activos reales',
    concept: 'Cada clase de activo responde de forma distinta al crecimiento, la inflación y las tasas de interés. La asignación define cuánto riesgo aporta cada clase a tu portafolio.',
    keyTakeaway: 'Elige la asignación según tu plazo y capacidad de riesgo. Después diversifica dentro de ella.',
  },
  'inv-m3-apply': {
    title: 'Haz tu primera operación simulada',
    taskBrief: 'Usa el portafolio simulado de T1GER para registrar una operación y explicar tu decisión.',
    frameworkSteps: [
      { title: 'Elige un activo', desc: 'Selecciona un fondo diversificado o una empresa que entiendas.' },
      { title: 'Define el tamaño', desc: 'Mantén la posición simulada por debajo del 25 % del portafolio.' },
      { title: 'Escribe tu tesis', desc: 'Explica por qué tendrías ese activo antes de registrar la operación.' },
    ],
  },
  'inv-m4-l1': {
    title: 'Cómo leer un balance general',
    concept: 'El balance general muestra activos, pasivos y patrimonio en una fecha concreta. Compara los activos corrientes con las obligaciones próximas y observa cómo cambia la deuda.',
    keyTakeaway: 'El balance es una fotografía. Combínalo con los estados de resultados y de flujo de efectivo.',
  },
  'inv-m4-l2': {
    title: 'Ventajas, márgenes y valoración',
    concept: 'Una ventaja competitiva duradera puede proteger los flujos de efectivo futuros, pero la valoración determina cuánto pagas por esas expectativas. El P/E siempre necesita contexto.',
    keyTakeaway: 'La calidad del negocio y el precio que pagas son preguntas diferentes.',
  },
  'inv-m4-apply': {
    title: 'Analiza una empresa real',
    taskBrief: 'Elige una empresa pública y encuentra su margen neto más reciente.',
    reflectionPrompt: 'Pega el enlace de relaciones con inversionistas, indica el periodo y el margen, y explica en una frase qué significa.',
    frameworkSteps: [
      { title: 'Elige', desc: 'Selecciona una empresa cotizada cuyo negocio entiendas.' },
      { title: 'Usa una fuente primaria', desc: 'Abre el informe anual o el reporte de resultados más reciente.' },
      { title: 'Interpreta', desc: 'Registra el periodo, el margen, la fuente y qué cambió.' },
    ],
  },
  'inv-m5-l1': {
    title: 'Diversificación y rebalanceo',
    concept: 'El mercado cambia los pesos de un portafolio. Rebalancear significa volver a la asignación prevista siguiendo un calendario o límites definidos.',
    keyTakeaway: 'Escribe tu regla de rebalanceo antes de que el mercado ponga a prueba tus emociones.',
  },
  'inv-m5-l2': {
    title: 'Cuentas con ventajas fiscales',
    concept: 'El tipo de cuenta determina cuándo podrían tributar los aportes, el crecimiento y los retiros. Los requisitos y límites cambian; verifica siempre la guía oficial vigente.',
    keyTakeaway: 'Elige primero la cuenta y después la inversión. Comprueba siempre las reglas actuales.',
  },
  'inv-m5-apply': {
    title: 'Construye un portafolio de tres fondos',
    taskBrief: 'Crea dentro de T1GER un portafolio diversificado de tres fondos con dinero simulado.',
    frameworkSteps: [
      { title: 'Define la asignación', desc: 'Elige los pesos para acciones de EE. UU., acciones internacionales y bonos.' },
      { title: 'Haz tres operaciones', desc: 'Registra una operación simulada para cada parte del portafolio.' },
      { title: 'Revisa la concentración', desc: 'Confirma que ninguna posición supere el límite definido.' },
    ],
  },
};

const SPANISH_LEVELS: Record<string, Pick<CurriculumLevel, 'title' | 'subtitle'>> = {
  'inv-level-1': { title: 'Padre Rico, Padre Pobre', subtitle: 'Robert Kiyosaki · Activos vs Pasivos y Flujo de Caja' },
  'inv-level-2': { title: 'La Psicología del Dinero', subtitle: 'Morgan Housel · Emociones, Libertad e Interés Compuesto' },
  'inv-level-3': { title: 'El Inversor Inteligente', subtitle: 'Benjamin Graham & Bogle · Mr. Market y Fondos Indexados' },
  'inv-level-4': { title: 'Principios', subtitle: 'Ray Dalio · All Weather Portfolio y Ciclos de Deuda' },
  'inv-level-5': { title: 'Lo Más Importante', subtitle: 'Howard Marks · Pensamiento de Segundo Nivel y Riesgo' },
  'inv-level-6': { title: 'Un Paso por Delante de Wall Street', subtitle: 'Peter Lynch · El Borde Competitivo del Inversor Cotidiano' },
};

export function localizeMission(mission: BankMission, language: Language): BankMission {
  if (language !== 'es') return mission;
  const localized = SPANISH_MISSIONS[mission.id];
  return localized ? { ...mission, ...localized } : mission;
}

export function localizeCurriculumLevel(level: CurriculumLevel, language: Language): CurriculumLevel {
  if (language !== 'es') return level;
  const localized = SPANISH_LEVELS[level.levelId];
  return localized ? { ...level, ...localized } : level;
}
