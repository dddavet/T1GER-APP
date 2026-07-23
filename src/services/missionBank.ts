export type Competency = 'offer' | 'sales' | 'marketing' | 'mindset' | 'operations' | 'investing' | 'accounting' | 'ai';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type MissionType = 'flashcard' | 'scenario_quiz' | 'real_world_task' | 'book_and_build' | 'book_lesson';

export type TrackType = 'investing' | 'business' | 'ai';

export interface CurriculumDay {
  dayId: string;
  dayNumber: number;
  missionIds: string[]; 
  actionItems?: string[]; 
}

export interface CurriculumLevel {
  levelId: string;
  levelNumber: number;
  title: string;
  subtitle: string;
  days: CurriculumDay[];
}

export interface CurriculumTrack {
  trackId: TrackType;
  title: string;
  levels: CurriculumLevel[];
}

export interface QuizOption {
  text: string;
  correct: boolean;
}

export interface LearningSource {
  type: 'book' | 'article' | 'video' | 'research';
  title: string;
  author: string;
  url?: string;
}

export interface BankMission {
  id: string;
  competency: Competency;
  difficulty: Difficulty;
  type: MissionType;
  title: string;
  sources?: LearningSource[];
  concept?: string;
  keyTakeaway?: string;          
  recallQuestion?: string;       
  recallOptions?: QuizOption[];  
  recallExplanation?: string;    
  scenario?: string;
  options?: QuizOption[];
  failureCritique?: string;
  taskBrief?: string;
  frameworkSteps?: { title: string; desc: string }[];
  xpReward: number;
}

const createInformationalLesson = (id: string, title: string, concept: string, keyTakeaway: string): BankMission => ({
  id,
  competency: 'investing',
  difficulty: 'easy',
  type: 'book_lesson',
  title,
  concept,
  keyTakeaway,
  recallQuestion: `What is the core takeaway of ${title}?`,
  recallOptions: [
    { text: keyTakeaway, correct: true },
    { text: "The opposite of the takeaway.", correct: false },
    { text: "It depends on the market.", correct: false },
  ],
  recallExplanation: concept,
  xpReward: 60
});

const investingMissions: BankMission[] = [
  // --- LEVEL 1: FOUNDATIONS (10 Interactive Executive Lessons) ---
  {
    id: 'inv-1-1',
    competency: 'investing',
    difficulty: 'easy',
    type: 'scenario_quiz',
    title: 'ACTIVOS PROD. VS PASIVOS DE LUJO',
    concept: 'Un activo pone dinero en tu bolsillo de forma recurrente. Un pasivo destruye caja mediante depreciación y costos de mantenimiento fijos.',
    keyTakeaway: 'Los inversores profesionales adquieren activos productivos; la clase media acumula pasivos disfrazados de estatus.',
    scenario: 'Una empresa invierte $500,000 en adquirir una flotilla de vehículos de lujo para sus ejecutivos. Los vehículos se deprecian un 20% anual y generan $40,000 en costos anuales de mantenimiento e impuestos. ¿Cómo se clasifica financieramente esta decisión?',
    options: [
      { text: 'Un pasivo destructivo de caja, ya que drena $40,000 anuales y pierde valor de capital.', correct: true },
      { text: 'Un activo de capital, porque aumenta el valor total de los activos en el balance.', correct: false },
      { text: 'Una inversión productiva, porque eleva el prestigio operativo de la empresa.', correct: false },
    ],
    failureCritique: 'Recuerda: Un activo DEBE generar entradas netas de flujo de efectivo o apreciarse en valor intrínseco. Un vehículo depreciable con costos fijos es un pasivo directo.',
    xpReward: 100
  },
  {
    id: 'inv-1-2',
    competency: 'investing',
    difficulty: 'easy',
    type: 'scenario_quiz',
    title: 'EL PODER DEL INTERÉS COMPUESTO & LA REGLA DEL 72',
    concept: 'Dividiendo 72 entre tu tasa de retorno anual (72 / r), obtienes el número exacto de años necesarios para duplicar tu capital.',
    keyTakeaway: 'El tiempo es la fuerza más destructiva para la deuda y la más exponencial para el capital invertido.',
    scenario: 'Inviertes $10,000 USD en un portafolio diversificado que rinde un 12% anual compuesto. Utilizando la Regla del 72, ¿cuántos años tardará tu capital inicial en cuadruplicarse (llegar a $40,000 USD) sin añadir capital adicional?',
    options: [
      { text: '12 años (Se duplica a $20k en 6 años [72/12], y vuelve a duplicarse a $40k en otros 6 años).', correct: true },
      { text: '6 años (Duplicar toma 6 años, por lo que cuadruplicar toma el mismo tiempo).', correct: false },
      { text: '18 años (Se requieren 6 años por cada $10k agregados).', correct: false },
    ],
    failureCritique: '72 / 12 = 6 años para el primer duplicado ($10k -> $20k). Para duplicarse nuevamente ($20k -> $40k) se requieren otros 6 años, sumando 12 años en total.',
    xpReward: 100
  },
  {
    id: 'inv-1-3',
    competency: 'investing',
    difficulty: 'easy',
    type: 'scenario_quiz',
    title: 'EL MARGEN DE SEGURIDAD (BUFFETT & GRAHAM)',
    concept: 'Comprar un activo con un descuento sustancial (30% al 50%) respecto a su Valor Intrínseco estimado para absorber errores de estimación.',
    keyTakeaway: 'Si construyes un puente que soporta 10,000 libras, no dejes pasar un camión de 9,800 libras. Exige un margen de seguridad.',
    scenario: 'Tras analizar los flujos de caja descontados de una empresa de software, calculas su valor intrínseco real en $100 por acción. Actualmente cotiza en bolsa a $95 por acción. ¿Tiene un Margen de Seguridad adecuado para comprar según el modelo de Ben Graham?',
    options: [
      { text: 'No. Un descuento de solo 5% ($95 vs $100) no deja margen para errores de cálculo o recesiones.', correct: true },
      { text: 'Sí. Cualquier precio por debajo del valor intrínseco representa una compra segura.', correct: false },
      { text: 'Sí. El margen del 5% garantiza ganancias cuando la acción cotice en su valor objetivo.', correct: false },
    ],
    failureCritique: 'Un verdadero Margen de Seguridad requiere un descuento sustancial (idealmente 30% o más, ej. comprar a $65-$70 lo que vale $100) para protegerte contra imprevistos del mercado.',
    xpReward: 100
  },
  {
    id: 'inv-1-4',
    competency: 'investing',
    difficulty: 'easy',
    type: 'scenario_quiz',
    title: 'FONDOS INDEXADOS VS. GESTIÓN ACTIVA',
    concept: 'El 90% de los gestores activos de fondos no logran superar al índice S&P 500 a 10 años debido al impacto destructivo de las comisiones de gestión.',
    keyTakeaway: 'No busques la aguja en el pajar. Compra el pajar completo mediante un fondo indexado de bajo costo.',
    scenario: 'El Fondo Activo A cobra una comisión de gestión del 2% anual y promete retornos brutos del 10%. El Fondo Indexado B cobra 0.04% anual y replica el S&P 500 al 9.5% anual. ¿Cuál generará mayor riqueza neta acumulada al cabo de 20 años?',
    options: [
      { text: 'El Fondo Indexado B. El retorno neto del Fondo A es 8% (10% - 2%), mientras el Fondo B rinde 9.46% neto.', correct: true },
      { text: 'El Fondo Activo A, porque su retorno bruto del 10% supera el 9.5% del índice.', correct: false },
      { text: 'Ambos generarán exactamente el mismo resultado al cabo de dos décadas.', correct: false },
    ],
    failureCritique: 'Las comisiones de gestión son un dreno directo sobre el interés compuesto. Un 2% de comisión anual reduce el retorno final en más de un 30% a lo largo de 20 años.',
    xpReward: 100
  },
  {
    id: 'inv-1-5',
    competency: 'investing',
    difficulty: 'medium',
    type: 'scenario_quiz',
    title: 'LA INFLACIÓN: EL IMPUESTO SILENCIOSO',
    concept: 'Guardar efectivo erosiona el poder adquisitivo cada año. La rentabilidad real es igual a la rentabilidad nominal menos la tasa de inflación.',
    keyTakeaway: 'El efectivo en custodia bancaria no es seguro; pierde poder de compra todos los días.',
    scenario: 'Tienes $100,000 USD invertidos en un depósito bancario a plazo fijo que rinde un 4% anual. La tasa de inflación anual de la economía es del 6.5%. ¿Cuál es el resultado financiero real de tu capital al cabo de 1 año?',
    options: [
      { text: 'Perdiste un -2.5% de poder adquisitivo real, ya que el dinero rinde menos que la subida de precios.', correct: true },
      { text: 'Ganaste $4,000 USD de beneficio neto sin ningún riesgo.', correct: false },
      { text: 'Mantuviste exactamente el mismo poder de compra inicial.', correct: false },
    ],
    failureCritique: 'Rentabilidad Real = Rentabilidad Nominal - Inflación. 4% - 6.5% = -2.5%. Aunque el saldo numérico suba, compras menos bienes y servicios que hace un año.',
    xpReward: 100
  },
  {
    id: 'inv-1-6',
    competency: 'investing',
    difficulty: 'medium',
    type: 'scenario_quiz',
    title: 'LA GRAVITACIÓN DE LAS TASAS DE INTERÉS',
    concept: 'Las tasas de interés de los bancos centrales actúan como la gravedad sobre los activos: a tasas más altas, las valoraciones de mercado caen.',
    keyTakeaway: 'Cuando el costo del dinero sube, el valor presente de las ganancias futuras disminuye.',
    scenario: 'La Reserva Federal anuncia un incremento agresivo de tasas de interés de 200 puntos básicos (2%) para combatir la inflación. ¿Qué impacto directo tiene esto en la valoración de empresas tecnológicas no rentables de alto crecimiento?',
    options: [
      { text: 'Sus valoraciones caen drásticamente porque sus flujos de caja futuros descontados valen menos hoy.', correct: true },
      { text: 'Sus valoraciones aumentan porque las tasas altas impulsan el consumo tecnológico.', correct: false },
      { text: 'Las tasas de interés no afectan a las empresas de capital de riesgo.', correct: false },
    ],
    failureCritique: 'Las tasas de interés actúan como la gravedad sobre los activos. Al subir la tasa de descuento, el valor presente de ganancias futuras lejanas disminuye fuertemente.',
    xpReward: 100
  },
  {
    id: 'inv-1-7',
    competency: 'investing',
    difficulty: 'medium',
    type: 'scenario_quiz',
    title: 'ACCIONES (EQUITY) VS. BONOS (DEUDA)',
    concept: 'Las acciones otorgan propiedad sobre el negocio y sus flujos libres. Los bonos son contratos de préstamo con cobro prioritario y retorno fijo.',
    keyTakeaway: 'La deuda cobra primero; el equity se queda con todo el crecimiento ilimitado.',
    scenario: 'Una empresa emite Bonos Corporativos al 7% de interés anual y al mismo tiempo cotiza Acciones Ordinarias. Si la empresa quiebra y entra en liquidación, ¿quién cobra primero los activos restantes?',
    options: [
      { text: 'Los tenedores de Bonos (Acreedores), ya que la deuda tiene prioridad absoluta sobre el equity.', correct: true },
      { text: 'Los accionistas de capital ordinario, por ser los dueños de la empresa.', correct: false },
      { text: 'Ambos cobran simultáneamente en partes iguales.', correct: false },
    ],
    failureCritique: 'En la estructura de capital, la deuda (bonos) siempre tiene prioridad de pago sobre los accionistas (equity). Los accionistas asumen mayor riesgo a cambio de participación ilimitada en el crecimiento.',
    xpReward: 100
  },
  {
    id: 'inv-1-8',
    competency: 'investing',
    difficulty: 'hard',
    type: 'scenario_quiz',
    title: 'FREE CASH FLOW (FCF) VS. BENEFICIO NETO',
    concept: 'El beneficio neto es una convención contable ajustable; el Flujo de Caja Libre (FCF) es el dinero en efectivo real que entra a la caja bancaria.',
    keyTakeaway: 'Revenue is vanity, profit is sanity, but cash is king.',
    scenario: 'La Empresa X reporta una Utilidad Neta de $50 millones, pero su Flujo de Caja Operativo menos CapEx (FCF) es de -$10 millones debido a clientes que no han pagado e inventario acumulado. ¿Cuál es el diagnóstico financiero?',
    options: [
      { text: 'Alerta roja de liquidez. La empresa no está generando efectivo real y podría necesitar endeudarse.', correct: true },
      { text: 'Excelente salud financiera, ya que la utilidad neta es alta y positiva.', correct: false },
      { text: 'Significa que la empresa está reinvirtiendo eficientemente en crecimiento sin deuda.', correct: false },
    ],
    failureCritique: 'La contabilidad por devengo puede mostrar beneficios ficticios en papel. El dinero en efectivo real (FCF) es lo que paga dividendos, recompras de acciones y deudas.',
    xpReward: 100
  },
  {
    id: 'inv-1-9',
    competency: 'investing',
    difficulty: 'hard',
    type: 'scenario_quiz',
    title: 'DIVIDENDOS Y REINVERSIÓN AUTOMÁTICA (DRIP)',
    concept: 'Reinvertir dividendos automáticamente compra más acciones del negocio, acelerando de forma multiplicativa el crecimiento del portafolio.',
    keyTakeaway: 'Los dividendos reinvertidos generan el 70% del retorno histórico total del mercado accionario.',
    scenario: 'Posees 1,000 acciones de una empresa que paga $2 USD de dividendo anual por acción. Si utilizas un plan DRIP (Reinversión Automática) mientras la acción cotiza a $40 USD, ¿qué sucede en tu portafolio al recibir el dividendo anual?',
    options: [
      { text: 'Recibes $2,000 USD que compran automáticamente 50 acciones adicionales sin pagar comisiones.', correct: true },
      { text: 'Recibes $2,000 USD en efectivo en tu cuenta bancaria y tus acciones se reducen en 50.', correct: false },
      { text: 'El precio de tus acciones sube inmediatamente un 5%.', correct: false },
    ],
    failureCritique: 'El plan DRIP convierte los dividendos recibidos ($2,000) en nuevas acciones ($2,000 / $40 = 50 acciones), aumentando tu base accionaria para cobrar aún más dividendos el año siguiente.',
    xpReward: 100
  },
  {
    id: 'inv-1-10',
    competency: 'investing',
    difficulty: 'hard',
    type: 'scenario_quiz',
    title: 'EL PERSONAJE "MR. MARKET" (BENJAMIN GRAHAM)',
    concept: 'El mercado es un socio maníaco-depresivo que te ofrece precios todos los días. Debes aprovechar sus crisis de pánico para comprar con descuento.',
    keyTakeaway: 'Mr. Market existe para servirte con precios de remate, no para guiar tus emociones.',
    scenario: 'Durante una crisis bancaria temporal, Mr. Market ofrece venderte acciones de un banco ultra sólido con balance impecable a un 40% de descuento sobre su valor en libros. ¿Cómo debe actuar un inversor ejecutivo formado por Graham y Buffett?',
    options: [
      { text: 'Aprovechar el pánico irracional de Mr. Market y comprar activos sólidos a precio de remate.', correct: true },
      { text: 'Vender todas tus acciones inmediatamente para evitar caer en el pánico general.', correct: false },
      { text: 'Esperar a que el mercado vuelva a máximos históricos para comprar con confianza.', correct: false },
    ],
    failureCritique: 'Mr. Market no te dice cuánto vale una empresa; solo te dice a qué precio está dispuesto a negociar hoy. El inversor inteligente aprovecha sus accesos de locura para comprar barato y vender caro.',
    xpReward: 100
  },

  // --- LEVEL 2: MARKET PSYCHOLOGY (10 Lessons) ---
  createInformationalLesson('inv-2-1', 'MEET MR. MARKET', 'The market is manic-depressive. Exploit his moods rather than being influenced by them.', 'Buy when Mr. Market is panicked, sell when he is euphoric.'),
  createInformationalLesson('inv-2-2', 'TIME VS TIMING', 'Predicting the market is statistically impossible over the long term.', 'Time in the market beats timing the market.'),
  createInformationalLesson('inv-2-3', 'THE VALUE OF CASH', 'Cash provides optionality during crises when others are forced to sell.', 'Cash isn\'t just low-yield; it\'s ammunition for bear markets.'),
  createInformationalLesson('inv-2-4', 'DOLLAR-COST AVERAGING', 'Investing a fixed amount regularly regardless of the price.', 'DCA removes emotion and prevents catastrophic market-timing errors.'),
  createInformationalLesson('inv-2-5', 'MARKET CRASH PSYCHOLOGY', 'Crashes are an inevitable feature of markets, not a bug.', 'A crash is a sale on assets. Do not lock in losses by panicking.'),
  createInformationalLesson('inv-2-6', 'CONFIRMATION BIAS', 'We naturally seek out information that agrees with our existing beliefs.', 'Actively seek out the bear case for every investment you make.'),
  createInformationalLesson('inv-2-7', 'LOSS AVERSION', 'The pain of losing $100 is twice as strong as the joy of making $100.', 'Don\'t hold onto losing investments just to avoid admitting defeat.'),
  createInformationalLesson('inv-2-8', 'FOMO AND BUBBLES', 'Fear Of Missing Out drives people to buy overvalued assets at the peak.', 'If everyone is talking about getting rich on an asset, the bubble is near the top.'),
  createInformationalLesson('inv-2-9', 'THE ILLUSION OF CONTROL', 'Believing you can influence outcomes that are purely random.', 'Accept that short-term market movements are random noise.'),
  createInformationalLesson('inv-2-10', 'STAYING RATIONAL', 'True wealth is built by surviving the market\'s extremes over decades.', 'Temperament is far more important than raw intellect in investing.'),

  // --- LEVEL 3: ADVANCED CONCEPTS (10 Lessons) ---
  createInformationalLesson('inv-3-1', 'MODERN PORTFOLIO THEORY', 'Diversification across non-correlated assets optimizes risk-adjusted returns.', 'Don\'t put all your eggs in one basket; mix assets that behave differently.'),
  createInformationalLesson('inv-3-2', 'THE ECONOMIC MACHINE', 'The economy moves in cycles of productivity, short-term debt, and long-term debt.', 'Recessions are natural deleveraging events in the debt cycle.'),
  createInformationalLesson('inv-3-3', 'BLACK SWAN EVENTS', 'Highly improbable events with massive impact that are unpredictable.', 'Build an antifragile portfolio that can survive the unimaginable.'),
  createInformationalLesson('inv-3-4', 'ECONOMIC MOATS', 'A durable competitive advantage that protects long-term profits.', 'Without a moat, high margins attract competitors who drive profits to zero.'),
  createInformationalLesson('inv-3-5', 'THE DHANDHO FRAMEWORK', 'Heads I win, tails I don\'t lose much.', 'Look for asymmetric bets with massive upside and protected downside.'),
  createInformationalLesson('inv-3-6', 'ROIC VS WACC', 'A company only creates value if its Return on Invested Capital exceeds its Cost of Capital.', 'Growth destroys value if the underlying business economics are poor.'),
  createInformationalLesson('inv-3-7', 'OPPORTUNITY COST', 'Every dollar invested in X is a dollar that cannot be invested in Y.', 'Always compare an investment against the risk-free rate or an index fund.'),
  createInformationalLesson('inv-3-8', 'UNDERSTANDING RISK', 'Risk is not volatility; risk is the permanent loss of capital.', 'Volatility is the price of admission for long-term compounding.'),
  createInformationalLesson('inv-3-9', 'EFFICIENT MARKET HYPOTHESIS', 'Asset prices reflect all available information.', 'While the market is mostly efficient, human emotion creates occasional inefficiencies.'),
  createInformationalLesson('inv-3-10', 'OPTIONS AND LEVERAGE', 'Leverage amplifies returns but introduces the risk of total wipeout.', 'To finish first, you must first finish. Avoid leverage that can zero you out.')
];

export const MISSION_BANK: BankMission[] = [
  ...investingMissions
];

export const CURRICULUM_TRACKS: Record<TrackType, CurriculumTrack> = {
  investing: {
    trackId: 'investing',
    title: 'INVESTING & WEALTH',
    levels: [
      {
        levelId: 'inv-level-1', levelNumber: 1, title: 'FOUNDATIONS', subtitle: 'Mental models of wealth and capital',
        days: [
          { dayId: 'inv-1-d1', dayNumber: 1, missionIds: ['inv-1-1'] },
          { dayId: 'inv-1-d2', dayNumber: 2, missionIds: ['inv-1-2'] },
          { dayId: 'inv-1-d3', dayNumber: 3, missionIds: ['inv-1-3'] },
          { dayId: 'inv-1-d4', dayNumber: 4, missionIds: ['inv-1-4'] },
          { dayId: 'inv-1-d5', dayNumber: 5, missionIds: ['inv-1-5'] },
          { dayId: 'inv-1-d6', dayNumber: 6, missionIds: ['inv-1-6'] },
          { dayId: 'inv-1-d7', dayNumber: 7, missionIds: ['inv-1-7'] },
          { dayId: 'inv-1-d8', dayNumber: 8, missionIds: ['inv-1-8'] },
          { dayId: 'inv-1-d9', dayNumber: 9, missionIds: ['inv-1-9'] },
          { dayId: 'inv-1-d10', dayNumber: 10, missionIds: ['inv-1-10'] },
        ]
      },
      {
        levelId: 'inv-level-2', levelNumber: 2, title: 'MARKET PSYCHOLOGY', subtitle: 'Navigating volatility and human bias',
        days: [
          { dayId: 'inv-2-d1', dayNumber: 11, missionIds: ['inv-2-1'] },
          { dayId: 'inv-2-d2', dayNumber: 12, missionIds: ['inv-2-2'] },
          { dayId: 'inv-2-d3', dayNumber: 13, missionIds: ['inv-2-3'] },
          { dayId: 'inv-2-d4', dayNumber: 14, missionIds: ['inv-2-4'] },
          { dayId: 'inv-2-d5', dayNumber: 15, missionIds: ['inv-2-5'] },
          { dayId: 'inv-2-d6', dayNumber: 16, missionIds: ['inv-2-6'] },
          { dayId: 'inv-2-d7', dayNumber: 17, missionIds: ['inv-2-7'] },
          { dayId: 'inv-2-d8', dayNumber: 18, missionIds: ['inv-2-8'] },
          { dayId: 'inv-2-d9', dayNumber: 19, missionIds: ['inv-2-9'] },
          { dayId: 'inv-2-d10', dayNumber: 20, missionIds: ['inv-2-10'] },
        ]
      },
      {
        levelId: 'inv-level-3', levelNumber: 3, title: 'ADVANCED CONCEPTS', subtitle: 'Moats, Risk, and the Macro Machine',
        days: [
          { dayId: 'inv-3-d1', dayNumber: 21, missionIds: ['inv-3-1'] },
          { dayId: 'inv-3-d2', dayNumber: 22, missionIds: ['inv-3-2'] },
          { dayId: 'inv-3-d3', dayNumber: 23, missionIds: ['inv-3-3'] },
          { dayId: 'inv-3-d4', dayNumber: 24, missionIds: ['inv-3-4'] },
          { dayId: 'inv-3-d5', dayNumber: 25, missionIds: ['inv-3-5'] },
          { dayId: 'inv-3-d6', dayNumber: 26, missionIds: ['inv-3-6'] },
          { dayId: 'inv-3-d7', dayNumber: 27, missionIds: ['inv-3-7'] },
          { dayId: 'inv-3-d8', dayNumber: 28, missionIds: ['inv-3-8'] },
          { dayId: 'inv-3-d9', dayNumber: 29, missionIds: ['inv-3-9'] },
          { dayId: 'inv-3-d10', dayNumber: 30, missionIds: ['inv-3-10'] },
        ]
      }
    ]
  },
  business: { trackId: 'business', title: 'BUSINESS', levels: [] },
  ai: { trackId: 'ai', title: 'ARTIFICIAL INTELLIGENCE', levels: [] }
};

export const COMPETENCY_LABELS: Record<Competency, string> = {
  offer: 'Offer Design',
  sales: 'Sales & Closing',
  marketing: 'Marketing & Leads',
  mindset: 'Founder Mindset',
  operations: 'Systems & Ops',
  investing: 'Investing Basics',
  accounting: 'Accounting',
  ai: 'Artificial Intelligence'
};

export interface StandardHabit {
  id: string;
  label: string;
  icon: string;
  category: 'morning' | 'business' | 'wellness';
}

export const STANDARD_HABITS: StandardHabit[] = [
  { id: 'sh1', label: 'Make your bed', icon: 'Bed', category: 'morning' },
  { id: 'sh2', label: 'Morning Cardio (20 min)', icon: 'Flame', category: 'morning' },
  { id: 'sh3', label: 'Cold Shower', icon: 'Droplets', category: 'morning' },
  { id: 'sh4', label: 'Deep Work Block (90 min)', icon: 'Brain', category: 'business' },
  { id: 'sh5', label: 'Daily Outreach (10 leads)', icon: 'Rocket', category: 'business' },
  { id: 'sh6', label: 'Read 10 pages', icon: 'Book', category: 'wellness' },
  { id: 'sh7', label: 'No Sugar Day', icon: 'Zap', category: 'wellness' },
  { id: 'sh8', label: 'Plan Tomorrow', icon: 'Target', category: 'business' },
];

export const ALL_COMPETENCIES: Competency[] = ['offer', 'sales', 'marketing', 'mindset', 'operations', 'investing', 'accounting', 'ai'];
