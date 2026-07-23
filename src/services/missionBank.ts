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
  contentType?: 'video' | 'article' | 'book_extract';
  title: string;
  sources?: LearningSource[];
  concept?: string;
  keyTakeaway?: string;          
  quote?: { text: string; author: string; context: string };
  videoUrl?: string;
  reading?: { title?: string; subtitle: string; paragraphs: string[]; takeaway: string };
  bookExtract?: { bookTitle: string; author: string; excerpt: string; keyFramework: string };
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
  xpReward: 60
});

const investingMissions: BankMission[] = [
  // --- LEVEL 1: FOUNDATIONS (10 Pure Executive Content Lessons: Book Extract, Video, Article) ---
  {
    id: 'inv-1-1',
    competency: 'investing',
    difficulty: 'easy',
    type: 'book_lesson',
    contentType: 'book_extract',
    title: 'ACTIVOS PROD. VS PASIVOS DE LUJO',
    concept: 'Un activo genera flujo de caja de forma constante. Un pasivo destruye dinero mediante depreciación y mantenimiento.',
    keyTakeaway: 'Los inversores profesionales compran activos productivos; la clase media acumula pasivos pensando que son riqueza.',
    quote: {
      text: "Un activo pone dinero en tu bolsillo. Un pasivo saca dinero de tu bolsillo. Si no entiendes la diferencia, trabajarás para siempre.",
      author: "Robert Kiyosaki",
      context: "Extraído de 'Padre Rico, Padre Pobre', la biblia de la educación financiera moderna."
    },
    bookExtract: {
      bookTitle: "Padre Rico, Padre Pobre",
      author: "Robert Kiyosaki",
      excerpt: "Las personas de clase media compran pasivos creyendo que son activos. Un automóvil de lujo, una mansión o un barco son pasivos directos porque generan impuestos, depreciación y mantenimiento constante. Un activo es un negocio, una propiedad en renta o una cartera de acciones que deposita efectivo en tu cuenta cada mes.",
      keyFramework: "REGLA DE ORO DE CAJA: Activo = (+) Entrada de efectivo. Pasivo = (-) Salida de efectivo continua."
    },
    xpReward: 100
  },
  {
    id: 'inv-1-2',
    competency: 'investing',
    difficulty: 'easy',
    type: 'book_lesson',
    contentType: 'video',
    title: 'EL PODER DEL INTERÉS COMPUESTO',
    concept: 'Dividiendo 72 entre tu tasa de retorno anual (72 / r), calculas los años necesarios para duplicar tu dinero sin esfuerzo adicional.',
    keyTakeaway: 'El tiempo en el mercado es la fuerza más destructiva para la deuda y la más exponencial para el capital.',
    quote: {
      text: "El interés compuesto es la octava maravilla del mundo. Quien lo entiende, lo gana; quien no, lo paga.",
      author: "Albert Einstein",
      context: "El principio matemático fundamental que construye grandes fortunas a lo largo del tiempo."
    },
    videoUrl: "https://www.youtube.com/embed/gS_4VzR18hI",
    reading: {
      subtitle: "La Regla del 72 en Acción",
      paragraphs: [
        "El interés compuesto no suma ganancias de forma lineal; las multiplica de forma exponencial. Al reinvertir los rendimientos generados, el capital crece sobre una base cada vez mayor.",
        "Para calcular la velocidad de crecimiento, usa la Regla del 72: divide 72 entre la tasa de rendimiento esperada. Si tu portafolio rinde un 12% anual, tu capital se duplicará exactamente cada 6 años (72 / 12 = 6).",
        "A 24 años de plazo, $10,000 USD iniciales se convierten en $160,000 USD gracias a 4 duplicaciones sucesivas, sin necesidad de agregar un solo dólar extra."
      ],
      takeaway: "Empezar 5 años antes duplica el resultado final de un portafolio a 30 años."
    },
    xpReward: 100
  },
  {
    id: 'inv-1-3',
    competency: 'investing',
    difficulty: 'easy',
    type: 'book_lesson',
    contentType: 'book_extract',
    title: 'EL MARGEN DE SEGURIDAD',
    concept: 'Exigir un descuento sustancial (30%-50%) respecto al Valor Intrínseco calculado de una empresa antes de invertir.',
    keyTakeaway: 'Un margen de seguridad amplio absorbe errores de estimación, crisis macroeconómicas y cisnes negros.',
    quote: {
      text: "Regla N° 1: Nunca pierdas dinero. Regla N° 2: Nunca olvides la regla N° 1.",
      author: "Warren Buffett",
      context: "El pilar maestro del Value Investing desarrollado por Benjamin Graham en Wall Street."
    },
    bookExtract: {
      bookTitle: "El Inversor Inteligente",
      author: "Benjamin Graham",
      excerpt: "Si construyes un puente diseñado para soportar 10,000 libras de peso, no dejes pasar un camión de 9,800 libras. Debes construir el puente para soportar 30,000 libras y dejar pasar camiones de 10,000. En inversiones, si estimas que una empresa vale $100 por acción, solo cómprala si el mercado te la ofrece a $65 o $70.",
      keyFramework: "MARGEN DE SEGURIDAD = Valor Intrínseco Calculado ($100) - Precio de Compra ($65) = 35% de Colchón de Protección."
    },
    xpReward: 100
  },
  {
    id: 'inv-1-4',
    competency: 'investing',
    difficulty: 'easy',
    type: 'book_lesson',
    contentType: 'article',
    title: 'FONDOS INDEXADOS VS GESTIÓN ACTIVA',
    concept: 'El 90% de los fondos de inversión activos pierden contra el índice S&P 500 a 10 años debido a las comisiones de gestión.',
    keyTakeaway: 'No intentes buscar la aguja en el pajar; compra el pajar completo mediante fondos indexados de bajo costo.',
    quote: {
      text: "No busques la aguja en el pajar. Simplemente compra el pajar entero.",
      author: "John C. Bogle",
      context: "Fundador de Vanguard y creador del primer fondo indexado para inversores particulares."
    },
    reading: {
      subtitle: "La Tiranía de los Costos de Gestión",
      paragraphs: [
        "Los fondos de inversión tradicionales (Gestión Activa) cobran comisiones del 2% anual sobre el total administrado más un 20% sobre ganancias. Aunque suena pequeño, un 2% destruye más del 35% del patrimonio acumulado en 25 años.",
        "Un Fondo Indexado pasivo simplemente replica el comportamiento de las 500 empresas más grandes de EE. UU. (S&P 500) a un costo casi nulo del 0.03% al 0.04% anual.",
        "La evidencia empírica muestra que menos del 10% de los gestores profesionales logran superar al mercado de forma consistente en el largo plazo."
      ],
      takeaway: "Minimizar comisiones es la única garantía comprobada de maximizar el rendimiento neto final."
    },
    xpReward: 100
  },
  {
    id: 'inv-1-5',
    competency: 'investing',
    difficulty: 'medium',
    type: 'book_lesson',
    contentType: 'video',
    title: 'LA INFLACIÓN: EL IMPUESTO SILENCIOSO',
    concept: 'El dinero en efectivo pierde poder adquisitivo todos los días debido al aumento de la masa monetaria y la subida de precios.',
    keyTakeaway: 'El efectivo en custodia bancaria no está seguro; su poder de compra se evapora en silencio.',
    quote: {
      text: "La inflación es la manera más segura de destruir la riqueza sin que los ciudadanos se den cuenta.",
      author: "Ray Dalio",
      context: "Fundador de Bridgewater Associates, el fondo de cobertura más grande del mundo."
    },
    videoUrl: "https://www.youtube.com/embed/PHe0bXAIuk0",
    reading: {
      subtitle: "Rentabilidad Real vs. Rentabilidad Nominal",
      paragraphs: [
        "Si tienes $100,000 USD guardados en el banco rindiendo un 3% anual, pero la inflación de la economía es del 6%, numéricamente tendrás $103,000 USD al final del año.",
        "Sin embargo, debido a que los bienes, servicios y propiedades subieron un 6%, tu poder de compra real se redujo un -3% neto.",
        "Para preservar el patrimonio, todo capital debe estar colocado en activos productivos (acciones, bienes raíces, negocios) que aumenten sus precios por encima de la inflación."
      ],
      takeaway: "Rentabilidad Real = Rentabilidad Nominal - Tasa de Inflación. Busca siempre rendimientos reales positivos."
    },
    xpReward: 100
  },
  {
    id: 'inv-1-6',
    competency: 'investing',
    difficulty: 'medium',
    type: 'book_lesson',
    contentType: 'article',
    title: 'GRAVITACIÓN DE LAS TASAS DE INTERÉS',
    concept: 'Las tasas de interés dictadas por los bancos centrales actúan como la gravedad sobre los activos financieros.',
    keyTakeaway: 'Cuando el costo del dinero sube, el valor presente de los flujos de caja futuros se desploma.',
    quote: {
      text: "Las tasas de interés son para las valoraciones de los activos lo que la gravedad es para la manzana.",
      author: "Warren Buffett",
      context: "Explicación magistral sobre cómo la política monetaria afecta los precios de acciones y bienes raíces."
    },
    reading: {
      subtitle: "La Matemática del Valor Presente",
      paragraphs: [
        "El valor de cualquier empresa o inmueble es la suma descontada de todos los flujos de efectivo que generará en el futuro traídos al presente.",
        "Cuando la Reserva Federal o los bancos centrales suben la tasa de interés de referencia (para frenar la inflación), la tasa de descuento de los modelos financieros aumenta automáticamente.",
        "Como resultado directo, una empresa cuyas ganancias mayores se esperan a 10 años vista sufre una caída drástica en su cotización de mercado hoy."
      ],
      takeaway: "Comprender el ciclo de tasas de interés permite prever expansiones y correcciones en los mercados."
    },
    xpReward: 100
  },
  {
    id: 'inv-1-7',
    competency: 'investing',
    difficulty: 'medium',
    type: 'book_lesson',
    contentType: 'book_extract',
    title: 'ACCIONES (EQUITY) VS. BONOS (DEUDA)',
    concept: 'Las acciones otorgan propiedad sobre las utilidades ilimitadas del negocio. Los bonos son préstamos con cobro prioritario y retorno fijo.',
    keyTakeaway: 'La deuda cobra primero y arriesga menos; el equity cobra al final pero captura todo el potencial infinito.',
    quote: {
      text: "Detrás de cada acción hay una empresa real. Averigua qué está haciendo y por qué.",
      author: "Peter Lynch",
      context: "Legendario gestor del fondo Fidelity Magellan que logró retornos del 29% anual durante 13 años."
    },
    bookExtract: {
      bookTitle: "Un Paso por Delante de Wall Street",
      author: "Peter Lynch",
      excerpt: "Cuando compras un bono corporativo, le estás prestando dinero a la empresa. Ellos prometen pagarte un interés fijo (ej. 5% anual) y devolverte el capital. Si a la empresa le va espectacularmente bien y duplica sus ingresos, tu bono sigue pagando el mismo 5%. Pero si compras acciones (equity) y la empresa prospera, tus ganancias no tienen techo.",
      keyFramework: "ESTRUCTURA DE CAPITAL: Deuda (Bonos) = Retorno Fijo + Protección Prioritaria. Equity (Acciones) = Retorno Variable + Crecimiento Ilimitado."
    },
    xpReward: 100
  },
  {
    id: 'inv-1-8',
    competency: 'investing',
    difficulty: 'hard',
    type: 'book_lesson',
    contentType: 'article',
    title: 'FREE CASH FLOW (FCF) VS BENEFICIO NETO',
    concept: 'La utilidad neta es un número contable manipulable; el Flujo de Caja Libre (FCF) es el efectivo líquido real en caja.',
    keyTakeaway: 'Los ingresos son vanidad, el beneficio es sensatez, pero el efectivo libre en caja es el rey.',
    quote: {
      text: "La contabilidad por devengo puede inventar beneficios en papel. Solo el efectivo real paga las facturas.",
      author: "Charlie Munger",
      context: "Socio histórico de Warren Buffett y vicepresidente de Berkshire Hathaway."
    },
    reading: {
      subtitle: "Análisis de Liquidez Real Ejecutiva",
      paragraphs: [
        "Una empresa puede reportar $50 millones en utilidad neta en su estado de resultados porque emitió facturas de venta a crédito a 120 días que aún no ha cobrado.",
        "Si para operar y mantener sus fábricas tuvo que gastar $60 millones en efectivo contante y sonante (CapEx), su Flujo de Caja Libre (FCF) real es negativo (-$10 millones).",
        "Las quiebras corporativas no ocurren por falta de utilidad neta contabilizada; ocurren por quedarse sin efectivo líquido para pagar la nómina y la deuda."
      ],
      takeaway: "Evalúa siempre el Free Cash Flow (FCF Yield) antes de juzgar la rentabilidad de un negocio."
    },
    xpReward: 100
  },
  {
    id: 'inv-1-9',
    competency: 'investing',
    difficulty: 'hard',
    type: 'book_lesson',
    contentType: 'video',
    title: 'DIVIDENDOS Y REINVERSIÓN AUTOMÁTICA',
    concept: 'Reinvertir dividendos automáticamente (DRIP) compra más títulos sin pagar comisiones, acelerando el interés compuesto.',
    keyTakeaway: 'La reinversión continua de dividendos genera más del 70% del retorno histórico total del mercado accionario.',
    quote: {
      text: "¿Sabes cuál es la única cosa que me da placer real? Ver mis dividendos entrar cada trimestre.",
      author: "John D. Rockefeller",
      context: "El primer multimillonario de la historia moderna y fundador de Standard Oil."
    },
    videoUrl: "https://www.youtube.com/embed/f5dQp2B2yV4",
    reading: {
      subtitle: "La Bola de Nieve del Plan DRIP",
      paragraphs: [
        "Cuando una empresa madura y rentable genera excedentes de efectivo, distribuye parte de las ganancias a sus dueños mediante dividendos en dinero.",
        "Un plan DRIP (Dividend Reinvestment Plan) toma automáticamente ese efectivo pagado y lo convierte en acciones adicionales de la misma empresa sin comisiones.",
        "Al año siguiente, posees más acciones, las cuales cobran más dividendos, los cuales compran aún más acciones. Este ciclo crea una bola de nieve imparable a 15 y 20 años."
      ],
      takeaway: "Reinvertir dividendos en etapas de acumulación de riqueza es el acelerador financiero número 1."
    },
    xpReward: 100
  },
  {
    id: 'inv-1-10',
    competency: 'investing',
    difficulty: 'hard',
    type: 'book_lesson',
    contentType: 'book_extract',
    title: 'EL PERSONAJE "MR. MARKET"',
    concept: 'El mercado bursátil es un socio maníaco-depresivo que todos los días te ofrece precios de compra y venta emocionales.',
    keyTakeaway: 'Mr. Market está ahí para servirte con precios de oportunidad, no para dirigir tus emociones ni decisiones.',
    quote: {
      text: "El mercado bursátil es un mecanismo para transferir dinero del impaciente al paciente.",
      author: "Benjamin Graham",
      context: "Cita emblemática del capítulo 8 de 'El Inversor Inteligente'."
    },
    bookExtract: {
      bookTitle: "El Inversor Inteligente",
      author: "Benjamin Graham",
      excerpt: "Imagina que eres socio en un negocio privado con un tipo llamado Mr. Market. Todos los días sin falta, Mr. Market viene y te nombra un precio al que te compraría tu parte o te vendería la suya. Cuando se siente eufórico, exige precios astronómicos. Cuando cae en pánico o depresión, te ofrece vender a precios de liquidación ridículamente bajos. Tú eres libre de ignorarlo por completo o aprovechar sus locuras.",
      keyFramework: "REGLA DE BEN GRAHAM: No compres porque Mr. Market está alegre ni vendas porque está asustado. Compra cuando esté desesperado y vende cuando esté eufórico."
    },
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
  business: {
    trackId: 'business',
    title: 'BUSINESS & SALES',
    levels: [
      {
        levelId: 'biz-level-1', levelNumber: 1, title: 'OFFER & SALES FOUNDATIONS', subtitle: 'Crafting $100M offers and objection handling',
        days: [
          { dayId: 'biz-1-d1', dayNumber: 1, missionIds: ['off-e1'] },
          { dayId: 'biz-1-d2', dayNumber: 2, missionIds: ['off-e2'] },
          { dayId: 'biz-1-d3', dayNumber: 3, missionIds: ['sales-e1'] },
          { dayId: 'biz-1-d4', dayNumber: 4, missionIds: ['sales-e2'] },
          { dayId: 'biz-1-d5', dayNumber: 5, missionIds: ['off-m1'] },
          { dayId: 'biz-1-d6', dayNumber: 6, missionIds: ['sales-m1'] },
          { dayId: 'biz-1-d7', dayNumber: 7, missionIds: ['sales-m2'] },
          { dayId: 'biz-1-d8', dayNumber: 8, missionIds: ['sales-h1'] },
          { dayId: 'biz-1-d9', dayNumber: 9, missionIds: ['sales-h2'] },
          { dayId: 'biz-1-d10', dayNumber: 10, missionIds: ['off-h1'] },
        ]
      },
      {
        levelId: 'biz-level-2', levelNumber: 2, title: 'GROWTH & MARKETING SCALE', subtitle: 'Lead generation and acquisition funnels',
        days: [
          { dayId: 'biz-2-d1', dayNumber: 11, missionIds: ['mktg-e1'] },
          { dayId: 'biz-2-d2', dayNumber: 12, missionIds: ['mktg-e2'] },
          { dayId: 'biz-2-d3', dayNumber: 13, missionIds: ['mktg-e3'] },
          { dayId: 'biz-2-d4', dayNumber: 14, missionIds: ['mktg-m1'] },
          { dayId: 'biz-2-d5', dayNumber: 15, missionIds: ['mktg-m2'] },
          { dayId: 'biz-2-d6', dayNumber: 16, missionIds: ['mktg-m3'] },
          { dayId: 'biz-2-d7', dayNumber: 17, missionIds: ['ops-e1'] },
          { dayId: 'biz-2-d8', dayNumber: 18, missionIds: ['ops-e2'] },
          { dayId: 'biz-2-d9', dayNumber: 19, missionIds: ['ops-m1'] },
          { dayId: 'biz-2-d10', dayNumber: 20, missionIds: ['ops-h1'] },
        ]
      },
      {
        levelId: 'biz-level-3', levelNumber: 3, title: 'ENTERPRISE B2B & HIGH-TICKET', subtitle: 'MEDDPICC, outbound cadences, and $10k+ deals',
        days: [
          { dayId: 'biz-3-d1', dayNumber: 21, missionIds: ['sales-h1'] },
          { dayId: 'biz-3-d2', dayNumber: 22, missionIds: ['sales-h2'] },
          { dayId: 'biz-3-d3', dayNumber: 23, missionIds: ['off-h1'] },
          { dayId: 'biz-3-d4', dayNumber: 24, missionIds: ['mktg-m3'] },
          { dayId: 'biz-3-d5', dayNumber: 25, missionIds: ['ops-h1'] },
        ]
      }
    ]
  },
  ai: {
    trackId: 'ai',
    title: 'ARTIFICIAL INTELLIGENCE',
    levels: [
      {
        levelId: 'ai-level-1', levelNumber: 1, title: 'LLM ARCHITECTURE & PROMPTING', subtitle: 'Weights, tokens, and prompt engineering',
        days: [
          { dayId: 'ai-1-d1', dayNumber: 1, missionIds: ['ai-d1'] },
          { dayId: 'ai-1-d2', dayNumber: 2, missionIds: ['ai-d2'] },
          { dayId: 'ai-1-d3', dayNumber: 3, missionIds: ['ai-d3'] },
          { dayId: 'ai-1-d4', dayNumber: 4, missionIds: ['ai-d4'] },
          { dayId: 'ai-1-d5', dayNumber: 5, missionIds: ['ai-d5'] },
          { dayId: 'ai-1-d6', dayNumber: 6, missionIds: ['ai-d6'] },
        ]
      },
      {
        levelId: 'ai-level-2', levelNumber: 2, title: 'RAG & AGENTIC SYSTEMS', subtitle: 'Vector search, embeddings, and autonomous loops',
        days: [
          { dayId: 'ai-2-d1', dayNumber: 7, missionIds: ['ai-d4'] },
          { dayId: 'ai-2-d2', dayNumber: 8, missionIds: ['ai-d5'] },
          { dayId: 'ai-2-d3', dayNumber: 9, missionIds: ['ai-d6'] },
        ]
      }
    ]
  }
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
  { id: 'sh9', label: '20 Outbound B2B Touchpoints', icon: 'Send', category: 'business' },
  { id: 'sh10', label: 'Update CRM Pipeline', icon: 'BarChart2', category: 'business' },
  { id: 'sh6', label: 'Read 10 pages', icon: 'Book', category: 'wellness' },
  { id: 'sh7', label: 'No Sugar Day', icon: 'Zap', category: 'wellness' },
  { id: 'sh8', label: 'Plan Tomorrow', icon: 'Target', category: 'business' },
];

export const ALL_COMPETENCIES: Competency[] = ['offer', 'sales', 'marketing', 'mindset', 'operations', 'investing', 'accounting', 'ai'];
