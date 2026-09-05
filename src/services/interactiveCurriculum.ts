import type { BankMission } from './missionBank';
import type {
  ActionPhase,
  AtomicLesson,
  ChallengePhase,
  ImpactPhase,
  InteractiveTrack,
  InteractiveTrackId,
  LocalizedText,
  RewardPhase,
} from './interactiveCurriculumTypes';
import { getOrbLearningDesign } from './orbLearningDesign';

const l = (es: string, en: string): LocalizedText => ({ es, en });

type LessonSeed = Omit<AtomicLesson, 'estimatedSeconds' | 'sources' | 'ingestion' | 'phases' | 'learningDesign'> & {
  source: AtomicLesson['sources'][number];
  impact: Omit<ImpactPhase, 'type' | 'durationSeconds'>;
  challenge: Omit<ChallengePhase, 'type' | 'durationSeconds'>;
  action: Omit<ActionPhase, 'type' | 'durationSeconds'>;
  reward: Omit<RewardPhase, 'type' | 'durationSeconds'>;
};

const makeLesson = (seed: LessonSeed): AtomicLesson => ({
  id: seed.id,
  trackId: seed.trackId,
  order: seed.order,
  slug: seed.slug,
  competency: seed.competency,
  difficulty: seed.difficulty,
  title: seed.title,
  objective: seed.objective,
  keyConcept: seed.keyConcept,
  learningDesign: getOrbLearningDesign(seed.id),
  estimatedSeconds: 180,
  prerequisiteIds: seed.prerequisiteIds,
  sources: [seed.source],
  ingestion: {
    schemaVersion: '1.0.0',
    generatedBy: 'ai_assisted',
    factualReview: 'approved',
    pedagogicalReview: 'approved',
    sourceIds: [seed.source.id],
  },
  phases: [
    { type: 'impact', durationSeconds: 45, ...seed.impact },
    { type: 'challenge', durationSeconds: 60, ...seed.challenge },
    { type: 'action', durationSeconds: 60, ...seed.action },
    { type: 'reward', durationSeconds: 15, ...seed.reward },
  ],
});

const sources = {
  bogle: { id: 'src-bogle-common-sense', kind: 'book', title: 'The Little Book of Common Sense Investing', author: 'John C. Bogle', rights: 'fair_use_summary' },
  housel: { id: 'src-housel-psychology', kind: 'book', title: 'The Psychology of Money', author: 'Morgan Housel', rights: 'fair_use_summary' },
  sec: { id: 'src-sec-investor', kind: 'article', title: 'Investor.gov education resources', author: 'U.S. Securities and Exchange Commission', url: 'https://www.investor.gov/', rights: 'public_domain' },
  openai: { id: 'src-openai-prompting', kind: 'article', title: 'Prompt engineering guidance', author: 'OpenAI', url: 'https://platform.openai.com/docs/guides/prompt-engineering', rights: 'fair_use_summary' },
  anthropic: { id: 'src-anthropic-agents', kind: 'article', title: 'Building effective agents', author: 'Anthropic', url: 'https://www.anthropic.com/research/building-effective-agents', rights: 'fair_use_summary' },
  lean: { id: 'src-lean-startup', kind: 'book', title: 'The Lean Startup', author: 'Eric Ries', rights: 'fair_use_summary' },
  hormozi: { id: 'src-hormozi-offers', kind: 'book', title: '$100M Offers', author: 'Alex Hormozi', rights: 'fair_use_summary' },
  t1ger: { id: 'src-t1ger-playbook', kind: 'internal', title: 'T1GER Tactical Learning Playbook', author: 'T1GER', rights: 'owned' },
} as const;

const smartMoneyLessons: AtomicLesson[] = [
  makeLesson({
    id: 'learn-money-01', trackId: 'smart-money', order: 1, slug: 'cash-has-a-cost', competency: 'investing', difficulty: 'easy', prerequisiteIds: [], source: sources.housel,
    title: l('El efectivo también pierde', 'Cash loses too'),
    objective: l('Cuantificar el precio de dejar capital inmóvil.', 'Quantify the price of leaving capital idle.'),
    keyConcept: l('La seguridad aparente del efectivo tiene un coste: inflación y crecimiento compuesto no capturado.', 'The apparent safety of cash has a cost: inflation and missed compounding.'),
    impact: {
      eyebrow: l('SMART MONEY 01', 'SMART MONEY 01'), title: l('No invertir también es una decisión', 'Not investing is still a decision'),
      body: l('Cada dólar inmóvil compra menos con el tiempo. Antes de buscar la inversión perfecta, separa tu fondo de emergencia del dinero que puede trabajar.', 'Every idle dollar buys less over time. Before chasing the perfect investment, separate emergency cash from money that can work.'),
      tacticalRule: l('Protege tu colchón; asigna el excedente con una regla automática.', 'Protect your buffer; deploy the surplus with an automatic rule.'),
      metric: { value: '2', label: l('funciones distintas: liquidez y objetivos a largo plazo', 'different roles: liquidity and long-term goals') },
    },
    challenge: { title: l('Decisión de liquidez', 'Liquidity decision'), challenge: {
      kind: 'multiple_choice', prompt: l('Tienes $3,000 y tus gastos esenciales son $1,000 al mes. ¿Qué decisión tiene mejor control de riesgo?', 'You have $3,000 and essential expenses of $1,000 per month. Which decision controls risk best?'),
      options: [
        { id: 'a', label: l('Invertir los $3,000 hoy', 'Invest all $3,000 today') },
        { id: 'b', label: l('Evaluar primero el colchón necesario y los gastos próximos, antes de decidir cuánto invertir', 'Assess the needed buffer and upcoming expenses before deciding how much to invest'), correct: true },
        { id: 'c', label: l('Dejar todo inmóvil sin una fecha de revisión', 'Leave everything idle without a review date') },
      ],
      feedback: { correct: l('Control primero, crecimiento después.', 'Control first, growth second.'), incorrect: l('Una estrategia sin liquidez o sin fecha no es una estrategia.', 'A plan without liquidity or a review date is not a plan.'), explanation: l('El colchón evita vender bajo presión; el excedente empieza a capturar crecimiento.', 'The buffer prevents forced selling; the surplus starts capturing growth.') },
    } },
    action: { title: l('Calcula el coste de esperar', 'Calculate the cost of waiting'), widget: {
      engine: 'cash_cost', title: l('Radar de capital inmóvil', 'Idle capital radar'), instruction: l('Ajusta tu excedente y el tiempo que suele quedarse quieto.', 'Set your surplus and how long it usually stays idle.'),
      fields: [
        { id: 'cash', kind: 'range', label: l('Capital disponible', 'Available capital'), min: 100, max: 10000, step: 100, defaultValue: 1500, unit: l('USD', 'USD') },
        { id: 'years', kind: 'range', label: l('Años inmóvil', 'Years idle'), min: 1, max: 10, step: 1, defaultValue: 5, unit: l('años', 'years') },
      ], resultLabel: l('Crecimiento potencial no capturado', 'Potential growth not captured'), artifactTitle: l('Mi regla de capital disponible', 'My available-capital rule'), commitLabel: l('Guardar mi regla', 'Save my rule'),
    } },
    reward: { title: l('Regla creada', 'Rule created'), body: l('Tu primer artefacto financiero ya existe. T1GER recuperó energía.', 'Your first financial artifact now exists. T1GER recovered energy.'), xp: 120, petRecovery: 18 },
  }),
  makeLesson({
    id: 'learn-money-02', trackId: 'smart-money', order: 2, slug: 'compound-engine', competency: 'investing', difficulty: 'easy', prerequisiteIds: ['learn-money-01'], source: sources.housel,
    title: l('El tiempo es el multiplicador', 'Time is the multiplier'),
    objective: l('Convertir una cantidad mensual en una proyección de diez años.', 'Turn a monthly amount into a ten-year projection.'),
    keyConcept: l('La tasa ayuda; el tiempo y la constancia hacen la mayor parte del trabajo.', 'Rate helps; time and consistency do most of the work.'),
    impact: { eyebrow: l('SMART MONEY 02', 'SMART MONEY 02'), title: l('La riqueza crece en la parte aburrida', 'Wealth grows in the boring part'), body: l('Los resultados parecen lentos al principio porque los rendimientos aún trabajan sobre una base pequeña. Interrumpir el proceso reinicia la parte más poderosa.', 'Results look slow at first because returns still work on a small base. Interrupting the process resets its most powerful part.'), tacticalRule: l('Aporta primero; ajusta después. La automatización vence a la motivación.', 'Contribute first; adjust later. Automation beats motivation.'), metric: { value: '120', label: l('aportes mensuales en diez años', 'monthly deposits in ten years') } },
    challenge: { title: l('Ordena el motor', 'Order the engine'), challenge: { kind: 'ordering', prompt: l('Ordena el proceso para construir un hábito de inversión sostenible.', 'Order the process for building a sustainable investing habit.'), options: [
      { id: 'fund', label: l('Crear un colchón básico', 'Create a basic cash buffer') }, { id: 'auto', label: l('Automatizar el aporte mensual', 'Automate the monthly contribution') }, { id: 'hold', label: l('Mantener el plan durante volatilidad normal', 'Keep the plan through normal volatility') },
    ], orderedIds: ['fund', 'auto', 'hold'], feedback: { correct: l('Sistema antes que emoción.', 'System before emotion.'), incorrect: l('No expongas el fondo de emergencia ni improvises cada mes.', 'Do not expose emergency cash or improvise each month.'), explanation: l('Liquidez, automatización y permanencia forman una secuencia robusta.', 'Liquidity, automation, and staying invested form a robust sequence.') } } },
    action: { title: l('Proyecta tu máquina', 'Project your engine'), widget: { engine: 'compound_growth', title: l('Simulador de aportes', 'Contribution simulator'), instruction: l('Elige un aporte sostenible y un horizonte real.', 'Choose a sustainable contribution and a real horizon.'), fields: [
      { id: 'monthly', kind: 'range', label: l('Aporte mensual', 'Monthly contribution'), min: 25, max: 1500, step: 25, defaultValue: 250, unit: l('USD', 'USD') },
      { id: 'years', kind: 'range', label: l('Horizonte', 'Horizon'), min: 5, max: 30, step: 5, defaultValue: 10, unit: l('años', 'years') },
      { id: 'rate', kind: 'range', label: l('Retorno anual supuesto', 'Assumed annual return'), min: 3, max: 10, step: 1, defaultValue: 8, unit: l('%', '%') },
    ], resultLabel: l('Valor futuro estimado', 'Estimated future value'), artifactTitle: l('Mi plan compuesto', 'My compounding plan'), commitLabel: l('Fijar aporte', 'Lock contribution') } },
    reward: { title: l('Motor activado', 'Engine activated'), body: l('Ya tienes una cifra que puedes ejecutar este mes.', 'You now have a number you can execute this month.'), xp: 130, petRecovery: 20 },
  }),
  makeLesson({
    id: 'learn-money-03', trackId: 'smart-money', order: 3, slug: 'index-before-picking', competency: 'investing', difficulty: 'medium', prerequisiteIds: ['learn-money-02'], source: sources.bogle,
    title: l('Compra el mercado, no el ruido', 'Buy the market, not the noise'),
    objective: l('Comparar fondos indexados por diversificación y coste.', 'Compare index funds by diversification and cost.'),
    keyConcept: l('Un ETF indexado de bajo coste reduce el riesgo de depender de una sola empresa y limita la fuga por comisiones.', 'A low-cost index ETF reduces single-company dependence and limits fee leakage.'),
    impact: { eyebrow: l('SMART MONEY 03', 'SMART MONEY 03'), title: l('La comisión pequeña cobra durante décadas', 'The small fee charges for decades'), body: l('Dos fondos pueden seguir mercados parecidos y producir resultados distintos porque una comisión se descuenta cada año, incluso cuando tú no haces nada.', 'Two funds can track similar markets and still produce different results because a fee is deducted every year, even when you do nothing.'), tacticalRule: l('Compara índice, diversificación, ratio de gastos y liquidez antes del nombre de moda.', 'Compare index, diversification, expense ratio, and liquidity before the trendy name.'), metric: { value: '0.03%', label: l('es una comisión anual típica de ETF de bajo coste', 'is a typical annual fee for a low-cost ETF') } },
    challenge: { title: l('Detecta la fuga', 'Detect the leak'), challenge: { kind: 'error_detection', prompt: l('¿Qué dato invalida primero esta elección: “Elegí el fondo porque subió más este mes”?', 'Which fact first invalidates this choice: “I picked the fund because it rose most this month”?'), options: [
      { id: 'a', label: l('Usar rendimiento de un mes como tesis de largo plazo', 'Using one month of performance as a long-term thesis'), correct: true }, { id: 'b', label: l('Revisar el ratio de gastos', 'Checking the expense ratio') }, { id: 'c', label: l('Confirmar qué índice sigue', 'Confirming which index it tracks') },
    ], feedback: { correct: l('Encontraste el sesgo de recencia.', 'You found recency bias.'), incorrect: l('Busca el salto lógico, no solo un dato faltante.', 'Find the logical leap, not just a missing fact.'), explanation: l('Un mes no demuestra una ventaja persistente; coste y exposición sí son verificables.', 'One month does not prove a persistent edge; cost and exposure are verifiable.') } } },
    action: { title: l('Mide la fuga por comisiones', 'Measure fee leakage'), widget: { engine: 'etf_fee_drag', title: l('Comparador de coste', 'Cost comparator'), instruction: l('Compara dos ratios de gastos sobre tu plan.', 'Compare two expense ratios against your plan.'), fields: [
      { id: 'balance', kind: 'range', label: l('Capital inicial', 'Starting balance'), min: 500, max: 50000, step: 500, defaultValue: 5000, unit: l('USD', 'USD') }, { id: 'lowFee', kind: 'range', label: l('Fondo A', 'Fund A'), min: 0.03, max: 1, step: 0.01, defaultValue: 0.03, unit: l('% anual', '% yearly') }, { id: 'highFee', kind: 'range', label: l('Fondo B', 'Fund B'), min: 0.03, max: 2, step: 0.01, defaultValue: 0.75, unit: l('% anual', '% yearly') },
    ], resultLabel: l('Diferencia estimada en 20 años', 'Estimated difference after 20 years'), artifactTitle: l('Mi filtro de ETF', 'My ETF filter'), commitLabel: l('Guardar filtro', 'Save filter') } },
    reward: { title: l('Filtro blindado', 'Filter secured'), body: l('Ahora puedes descartar productos caros antes de estudiar el resto.', 'You can now reject expensive products before studying the rest.'), xp: 140, petRecovery: 20 },
  }),
  makeLesson({
    id: 'learn-money-04', trackId: 'smart-money', order: 4, slug: 'dca-without-drama', competency: 'investing', difficulty: 'medium', prerequisiteIds: ['learn-money-03'], source: sources.sec,
    title: l('DCA sin adivinar el mercado', 'DCA without timing the market'),
    objective: l('Crear una orden recurrente compatible con el flujo de caja.', 'Create a recurring order that fits cash flow.'),
    keyConcept: l('Dollar-cost averaging convierte una decisión repetida en un sistema y reduce la tentación de esperar el momento perfecto.', 'Dollar-cost averaging turns a repeated decision into a system and reduces the temptation to wait for the perfect moment.'),
    impact: { eyebrow: l('SMART MONEY 04', 'SMART MONEY 04'), title: l('La fecha perfecta no llega', 'The perfect date never arrives'), body: l('Esperar claridad total suele significar comprar después de la subida. Un aporte programado elimina una negociación emocional cada mes.', 'Waiting for total clarity often means buying after the rise. A scheduled contribution removes one emotional negotiation each month.'), tacticalRule: l('Programa el aporte el día posterior al ingreso, no el día en que “te sientas seguro”.', 'Schedule the contribution the day after income, not when you “feel safe”.'), metric: { value: '12', label: l('decisiones menos al año con automatización mensual', 'fewer decisions per year with monthly automation') } },
    challenge: { title: l('Empareja conducta y efecto', 'Match behavior and effect'), challenge: { kind: 'matching', prompt: l('Conecta cada conducta con su consecuencia más probable.', 'Connect each behavior with its most likely consequence.'), pairs: [
      { id: 'auto', left: l('Aporte automático', 'Automatic contribution'), right: l('Menos decisiones emocionales', 'Fewer emotional decisions') }, { id: 'wait', left: l('Esperar noticias perfectas', 'Wait for perfect news'), right: l('Riesgo de comprar tarde', 'Risk of buying late') }, { id: 'oversize', left: l('Aporte demasiado grande', 'Oversized contribution'), right: l('Mayor probabilidad de cancelar el plan', 'Higher chance of canceling the plan') },
    ], feedback: { correct: l('Viste el sistema completo.', 'You saw the whole system.'), incorrect: l('Piensa en la conducta que cada regla provoca durante meses.', 'Think about the behavior each rule creates over months.'), explanation: l('El mejor plan es automático y lo bastante pequeño para sobrevivir meses difíciles.', 'The best plan is automatic and small enough to survive hard months.') } } },
    action: { title: l('Programa tu aporte', 'Schedule your contribution'), widget: { engine: 'dca_plan', title: l('Planificador DCA', 'DCA planner'), instruction: l('Define una cifra sostenible y el momento exacto.', 'Define a sustainable amount and exact timing.'), fields: [
      { id: 'monthly', kind: 'range', label: l('Aporte mensual', 'Monthly contribution'), min: 25, max: 1500, step: 25, defaultValue: 200, unit: l('USD', 'USD') }, { id: 'payday', kind: 'select', label: l('Momento del ingreso', 'Income timing'), defaultValue: '1', options: [{ value: '1', label: l('Inicio de mes', 'Start of month') }, { value: '15', label: l('Mitad de mes', 'Middle of month') }, { value: 'weekly', label: l('Cada semana', 'Weekly') }] },
    ], resultLabel: l('Compromiso anual', 'Annual commitment'), artifactTitle: l('Mi orden DCA', 'My DCA order'), commitLabel: l('Crear orden', 'Create order') } },
    reward: { title: l('Decisión automatizada', 'Decision automated'), body: l('Tu plan ya tiene cantidad y momento. Solo falta ejecutarlo en tu broker.', 'Your plan now has an amount and timing. Execute it in your broker.'), xp: 150, petRecovery: 22 },
  }),
  makeLesson({
    id: 'learn-money-05', trackId: 'smart-money', order: 5, slug: 'risk-before-return', competency: 'investing', difficulty: 'hard', prerequisiteIds: ['learn-money-04'], source: sources.sec,
    title: l('Sobrevive antes de ganar', 'Survive before you win'),
    objective: l('Definir un límite de pérdida antes de elegir activos.', 'Define a loss limit before choosing assets.'),
    keyConcept: l('El riesgo útil se decide antes de la operación: tamaño, pérdida tolerable y condición de salida.', 'Useful risk is decided before the trade: size, tolerable loss, and exit condition.'),
    impact: { eyebrow: l('SMART MONEY 05', 'SMART MONEY 05'), title: l('Una caída del 50% exige subir 100%', 'A 50% loss requires a 100% gain'), body: l('Las pérdidas grandes destruyen más que capital: rompen la confianza y fuerzan decisiones tardías. El tamaño de posición es tu primer cinturón de seguridad.', 'Large losses destroy more than capital: they break confidence and force late decisions. Position size is your first seat belt.'), tacticalRule: l('Define cuánto puedes perder antes de pensar cuánto puedes ganar.', 'Define how much you can lose before thinking about how much you can gain.'), metric: { value: '2:1', label: l('ganancia necesaria tras perder la mitad', 'gain required after losing half') } },
    challenge: { title: l('Encuentra el error de riesgo', 'Find the risk error'), challenge: { kind: 'error_detection', prompt: l('Un usuario coloca 40% de su cartera en una idea y decide “salir si se siente mal”. ¿Cuál es la falla principal?', 'A user puts 40% of the portfolio in one idea and plans to “exit if it feels bad”. What is the main flaw?'), options: [
      { id: 'a', label: l('No definió pérdida máxima ni condición observable', 'No maximum loss or observable exit condition'), correct: true }, { id: 'b', label: l('La inversión no tiene un nombre conocido', 'The investment lacks a famous name') }, { id: 'c', label: l('No revisa el precio cada cinco minutos', 'The price is not checked every five minutes') },
    ], feedback: { correct: l('El riesgo debe poder medirse antes.', 'Risk must be measurable beforehand.'), incorrect: l('La reputación y la vigilancia no sustituyen una regla.', 'Reputation and monitoring do not replace a rule.'), explanation: l('Tamaño y condición de salida convierten una opinión en un proceso.', 'Sizing and an exit condition turn an opinion into a process.') } } },
    action: { title: l('Escribe tu límite', 'Write your limit'), widget: { engine: 'risk_budget', title: l('Presupuesto de riesgo', 'Risk budget'), instruction: l('Calcula cuánto capital está realmente en juego.', 'Calculate how much capital is actually at stake.'), fields: [
      { id: 'portfolio', kind: 'range', label: l('Valor de cartera', 'Portfolio value'), min: 500, max: 100000, step: 500, defaultValue: 10000, unit: l('USD', 'USD') }, { id: 'riskPct', kind: 'range', label: l('Riesgo máximo por idea', 'Maximum risk per idea'), min: 0.5, max: 5, step: 0.5, defaultValue: 1, unit: l('%', '%') }, { id: 'stopPct', kind: 'range', label: l('Distancia de salida', 'Exit distance'), min: 2, max: 25, step: 1, defaultValue: 10, unit: l('%', '%') },
    ], resultLabel: l('Tamaño máximo de posición', 'Maximum position size'), artifactTitle: l('Mi protocolo de riesgo', 'My risk protocol'), commitLabel: l('Blindar protocolo', 'Secure protocol') } },
    reward: { title: l('Supervivencia configurada', 'Survival configured'), body: l('Tu límite ya existe antes de la próxima emoción.', 'Your limit now exists before the next emotional moment.'), xp: 170, petRecovery: 25 },
  }),
];

const aiLessons: AtomicLesson[] = [
  makeLesson({
    id: 'learn-ai-01', trackId: 'ai-automation', order: 1, slug: 'prompt-contract', competency: 'ai', difficulty: 'easy', prerequisiteIds: [], source: sources.openai,
    title: l('Un prompt es un contrato', 'A prompt is a contract'), objective: l('Construir instrucciones con objetivo, contexto, restricciones y formato.', 'Build instructions with goal, context, constraints, and format.'), keyConcept: l('La calidad mejora cuando el modelo sabe qué producir, para quién, con qué límites y en qué estructura.', 'Quality improves when the model knows what to produce, for whom, within which limits, and in what structure.'),
    impact: { eyebrow: l('IA Y AUTOMATIZACIÓN 01', 'AI AND AUTOMATION 01'), title: l('“Hazlo mejor” no contiene una decisión', '“Make it better” contains no decision'), body: l('Un modelo no lee tu intención. Completa patrones a partir del contexto que recibe. Una instrucción ambigua delega las decisiones importantes al azar.', 'A model does not read your intent. It completes patterns from the context it receives. An ambiguous instruction delegates important decisions to chance.'), tacticalRule: l('Objetivo + contexto + restricciones + formato de salida.', 'Goal + context + constraints + output format.'), metric: { value: '4', label: l('bloques para una instrucción utilizable', 'blocks for a usable instruction') } },
    challenge: { title: l('Detecta el bloque ausente', 'Detect the missing block'), challenge: { kind: 'multiple_choice', prompt: l('“Escribe tres asuntos de email para fundadores SaaS. Máximo 45 caracteres.” ¿Qué falta para reducir más la ambigüedad?', '“Write three email subject lines for SaaS founders. Maximum 45 characters.” What is missing to reduce ambiguity further?'), options: [
      { id: 'a', label: l('El objetivo o acción deseada del email', 'The desired goal or action of the email'), correct: true }, { id: 'b', label: l('Una palabra más técnica', 'One more technical word') }, { id: 'c', label: l('Pedir creatividad infinita', 'Ask for infinite creativity') },
    ], feedback: { correct: l('Sin resultado deseado, el texto no puede optimizarse.', 'Without a desired outcome, the copy cannot be optimized.'), incorrect: l('Más adjetivos no reemplazan una intención medible.', 'More adjectives do not replace measurable intent.'), explanation: l('El público y el formato existen; falta qué debe provocar el asunto.', 'Audience and format exist; the subject line still lacks a desired effect.') } } },
    action: { title: l('Construye tu prompt', 'Build your prompt'), widget: { engine: 'prompt_builder', title: l('Constructor de contrato', 'Prompt contract builder'), instruction: l('Completa los cuatro bloques con una tarea real de hoy.', 'Complete all four blocks with a real task from today.'), fields: [
      { id: 'goal', kind: 'text', label: l('Objetivo', 'Goal'), placeholder: l('Crear cinco ideas de contenido que generen demos', 'Create five content ideas that generate demos'), minLength: 8 }, { id: 'context', kind: 'text', label: l('Contexto', 'Context'), placeholder: l('Producto, usuario y situación', 'Product, user, and situation'), minLength: 8 }, { id: 'constraints', kind: 'text', label: l('Restricciones', 'Constraints'), placeholder: l('Límite, tono y datos que no debe inventar', 'Limits, tone, and facts it must not invent'), minLength: 8 }, { id: 'format', kind: 'text', label: l('Formato', 'Format'), placeholder: l('Tabla con gancho, idea y CTA', 'Table with hook, idea, and CTA'), minLength: 5 },
    ], resultLabel: l('Prompt listo para copiar', 'Prompt ready to copy'), artifactTitle: l('Mi prompt de cuatro bloques', 'My four-block prompt'), commitLabel: l('Crear prompt', 'Create prompt') } },
    reward: { title: l('Contrato listo', 'Contract ready'), body: l('Ya no dependes de pedir “algo mejor”.', 'You no longer depend on asking for “something better”.'), xp: 120, petRecovery: 18 },
  }),
  makeLesson({
    id: 'learn-ai-02', trackId: 'ai-automation', order: 2, slug: 'context-beats-cleverness', competency: 'ai', difficulty: 'easy', prerequisiteIds: ['learn-ai-01'], source: sources.openai,
    title: l('El contexto vence al truco', 'Context beats cleverness'), objective: l('Distinguir contexto útil de ruido.', 'Separate useful context from noise.'), keyConcept: l('El mejor contexto cambia la decisión del modelo; el resto solo consume atención.', 'The best context changes the model’s decision; the rest only consumes attention.'),
    impact: { eyebrow: l('IA Y AUTOMATIZACIÓN 02', 'AI AND AUTOMATION 02'), title: l('Más texto no siempre significa más precisión', 'More text does not always mean more precision'), body: l('Pegar documentos enteros puede ocultar la señal. Resume los hechos que cambian el resultado, incluye ejemplos y define qué fuente manda cuando hay conflicto.', 'Pasting entire documents can hide the signal. Summarize facts that change the result, include examples, and define which source wins on conflict.'), tacticalRule: l('Incluye contexto que altere una decisión o elimine una suposición.', 'Include context that changes a decision or removes an assumption.'), metric: { value: '3', label: l('capas: usuario, evidencia y criterio', 'layers: user, evidence, and criteria') } },
    challenge: { title: l('Ordena el contexto', 'Order the context'), challenge: { kind: 'ordering', prompt: l('Ordena estas capas antes de pedir una recomendación.', 'Order these layers before asking for a recommendation.'), options: [
      { id: 'user', label: l('Definir usuario y objetivo', 'Define user and goal') }, { id: 'evidence', label: l('Añadir hechos y ejemplos relevantes', 'Add relevant facts and examples') }, { id: 'criteria', label: l('Explicar el criterio de decisión', 'Explain the decision criteria') },
    ], orderedIds: ['user', 'evidence', 'criteria'], feedback: { correct: l('El modelo ya sabe para quién, con qué datos y cómo decidir.', 'The model now knows who, with what evidence, and how to decide.'), incorrect: l('Primero fija el problema; después la evidencia y el criterio.', 'Set the problem first, then evidence and criteria.'), explanation: l('Esa secuencia reduce respuestas correctas para el problema equivocado.', 'That sequence reduces answers that are correct for the wrong problem.') } } },
    action: { title: l('Construye tu paquete de contexto', 'Build your context pack'), widget: { engine: 'context_stack', title: l('Compresor de contexto', 'Context compressor'), instruction: l('Escribe solo datos que cambiarían la respuesta.', 'Write only facts that would change the answer.'), fields: [
      { id: 'user', kind: 'text', label: l('Usuario y objetivo', 'User and goal'), placeholder: l('Fundador sin equipo que necesita 10 entrevistas', 'Solo founder who needs 10 interviews'), minLength: 8 }, { id: 'evidence', kind: 'text', label: l('Evidencia disponible', 'Available evidence'), placeholder: l('Tres objeciones repetidas por clientes', 'Three objections repeated by customers'), minLength: 8 }, { id: 'criteria', kind: 'text', label: l('Criterio de decisión', 'Decision criteria'), placeholder: l('Priorizar impacto en siete días', 'Prioritize impact within seven days'), minLength: 8 },
    ], resultLabel: l('Contexto comprimido', 'Compressed context'), artifactTitle: l('Mi paquete de contexto', 'My context pack'), commitLabel: l('Guardar contexto', 'Save context') } },
    reward: { title: l('Señal aislada', 'Signal isolated'), body: l('Tu contexto ahora dirige la respuesta en vez de ahogarla.', 'Your context now directs the answer instead of drowning it.'), xp: 130, petRecovery: 20 },
  }),
  makeLesson({
    id: 'learn-ai-03', trackId: 'ai-automation', order: 3, slug: 'route-the-work', competency: 'ai', difficulty: 'medium', prerequisiteIds: ['learn-ai-02'], source: sources.t1ger,
    title: l('Usa el modelo correcto', 'Use the right model'), objective: l('Asignar tareas por riesgo, coste y necesidad de razonamiento.', 'Route tasks by risk, cost, and reasoning needs.'), keyConcept: l('No toda tarea necesita el modelo más potente; algunas necesitan velocidad, estructura o aprobación humana.', 'Not every task needs the strongest model; some need speed, structure, or human approval.'),
    impact: { eyebrow: l('IA Y AUTOMATIZACIÓN 03', 'AI AND AUTOMATION 03'), title: l('Potencia sin ruteo quema presupuesto', 'Power without routing burns budget'), body: l('Clasificar un ticket y diseñar una estrategia no tienen el mismo riesgo. El ruteo correcto reserva razonamiento costoso para decisiones donde cambia el resultado.', 'Classifying a ticket and designing a strategy do not carry the same risk. Good routing reserves expensive reasoning for decisions where it changes the outcome.'), tacticalRule: l('Bajo riesgo: rápido. Alta ambigüedad: razonamiento. Alto impacto: humano aprueba.', 'Low risk: fast. High ambiguity: reasoning. High impact: human approves.'), metric: { value: '3×', label: l('criterios: riesgo, ambigüedad y volumen', 'criteria: risk, ambiguity, and volume') } },
    challenge: { title: l('Empareja tarea y ruta', 'Match task and route'), challenge: { kind: 'matching', prompt: l('Asigna cada trabajo a la ruta más sensata.', 'Assign each job to the most sensible route.'), pairs: [
      { id: 'classify', left: l('Clasificar 2,000 tickets', 'Classify 2,000 tickets'), right: l('Modelo rápido con salida estructurada', 'Fast model with structured output') }, { id: 'strategy', left: l('Diseñar una estrategia de expansión', 'Design an expansion strategy'), right: l('Modelo de razonamiento con contexto profundo', 'Reasoning model with deep context') }, { id: 'payment', left: l('Autorizar un reembolso grande', 'Approve a large refund'), right: l('Modelo propone; humano confirma', 'Model proposes; human confirms') },
    ], feedback: { correct: l('Ruteaste por riesgo, no por moda.', 'You routed by risk, not hype.'), incorrect: l('Separa volumen, ambigüedad e impacto irreversible.', 'Separate volume, ambiguity, and irreversible impact.'), explanation: l('La ruta óptima equilibra coste, latencia y control.', 'The optimal route balances cost, latency, and control.') } } },
    action: { title: l('Rutea un flujo real', 'Route a real workflow'), widget: { engine: 'model_router', title: l('Matriz de ruteo', 'Routing matrix'), instruction: l('Clasifica una tarea que repites esta semana.', 'Classify a task you repeat this week.'), fields: [
      { id: 'task', kind: 'text', label: l('Tarea', 'Task'), placeholder: l('Responder solicitudes de soporte', 'Respond to support requests'), minLength: 6 }, { id: 'risk', kind: 'select', label: l('Impacto si falla', 'Impact if it fails'), defaultValue: 'medium', options: [{ value: 'low', label: l('Bajo', 'Low') }, { value: 'medium', label: l('Medio', 'Medium') }, { value: 'high', label: l('Alto', 'High') }] }, { id: 'ambiguity', kind: 'select', label: l('Ambigüedad', 'Ambiguity'), defaultValue: 'medium', options: [{ value: 'low', label: l('Baja', 'Low') }, { value: 'medium', label: l('Media', 'Medium') }, { value: 'high', label: l('Alta', 'High') }] },
    ], resultLabel: l('Ruta recomendada', 'Recommended route'), artifactTitle: l('Mi matriz de modelos', 'My model routing matrix'), commitLabel: l('Guardar ruta', 'Save route') } },
    reward: { title: l('Ruta definida', 'Route defined'), body: l('Tu próximo flujo ya sabe dónde automatizar y dónde frenar.', 'Your next workflow knows where to automate and where to stop.'), xp: 140, petRecovery: 20 },
  }),
  makeLesson({
    id: 'learn-ai-04', trackId: 'ai-automation', order: 4, slug: 'trigger-transform-action', competency: 'operations', difficulty: 'medium', prerequisiteIds: ['learn-ai-03'], source: sources.t1ger,
    title: l('Automatiza un flujo, no una app', 'Automate a workflow, not an app'), objective: l('Dibujar un sistema trigger-transform-action.', 'Map a trigger-transform-action system.'), keyConcept: l('Una automatización útil empieza con un evento observable, transforma datos y termina en una acción verificable.', 'A useful automation starts with an observable event, transforms data, and ends with a verifiable action.'),
    impact: { eyebrow: l('IA Y AUTOMATIZACIÓN 04', 'AI AND AUTOMATION 04'), title: l('“Quiero usar IA” no es un flujo', '“I want to use AI” is not a workflow'), body: l('La herramienta viene después. Primero define qué dispara el trabajo, qué información cambia y qué resultado debe aparecer en otro sistema.', 'The tool comes later. First define what triggers the work, what information changes, and what result must appear in another system.'), tacticalRule: l('Trigger observable, transformación limitada, acción comprobable.', 'Observable trigger, bounded transformation, verifiable action.'), metric: { value: 'T→T→A', label: l('la cadena mínima automatizable', 'the minimum automatable chain') } },
    challenge: { title: l('Ordena el flujo', 'Order the workflow'), challenge: { kind: 'ordering', prompt: l('Ordena una automatización de leads entrantes.', 'Order an inbound-lead automation.'), options: [
      { id: 'trigger', label: l('Llega un formulario nuevo', 'A new form arrives') }, { id: 'transform', label: l('La IA clasifica intención y extrae datos', 'AI classifies intent and extracts data') }, { id: 'action', label: l('CRM crea tarea y borrador de respuesta', 'CRM creates a task and response draft') },
    ], orderedIds: ['trigger', 'transform', 'action'], feedback: { correct: l('Cada paso tiene una entrada y una salida.', 'Each step has an input and output.'), incorrect: l('No empieces por la herramienta ni por una acción sin evento.', 'Do not start with the tool or an action without an event.'), explanation: l('La cadena puede probarse paso por paso y fallar de forma visible.', 'The chain can be tested step by step and fail visibly.') } } },
    action: { title: l('Dibuja tu automatización', 'Map your automation'), widget: { engine: 'workflow_map', title: l('Mapa TTA', 'TTA map'), instruction: l('Usa un proceso repetitivo de tu semana.', 'Use one repetitive process from your week.'), fields: [
      { id: 'trigger', kind: 'text', label: l('Trigger observable', 'Observable trigger'), placeholder: l('Llega una nueva respuesta de formulario', 'A new form response arrives'), minLength: 6 }, { id: 'transform', kind: 'text', label: l('Transformación', 'Transformation'), placeholder: l('Clasificar problema y urgencia', 'Classify problem and urgency'), minLength: 6 }, { id: 'action', kind: 'text', label: l('Acción final', 'Final action'), placeholder: l('Crear tarea y borrador en el CRM', 'Create task and draft in CRM'), minLength: 6 },
    ], resultLabel: l('Flujo ejecutable', 'Executable workflow'), artifactTitle: l('Mi primer flujo TTA', 'My first TTA workflow'), commitLabel: l('Guardar flujo', 'Save workflow') } },
    reward: { title: l('Flujo ensamblado', 'Workflow assembled'), body: l('Ya tienes un sistema que puede probarse antes de comprar herramientas.', 'You now have a system that can be tested before buying tools.'), xp: 150, petRecovery: 22 },
  }),
  makeLesson({
    id: 'learn-ai-05', trackId: 'ai-automation', order: 5, slug: 'agent-with-brakes', competency: 'ai', difficulty: 'hard', prerequisiteIds: ['learn-ai-04'], source: sources.anthropic,
    title: l('Un agente necesita frenos', 'An agent needs brakes'), objective: l('Definir herramientas, permisos, aprobación y condición de salida.', 'Define tools, permissions, approval, and stop conditions.'), keyConcept: l('La autonomía segura es una escalera: observar, proponer, ejecutar con aprobación y ejecutar dentro de límites.', 'Safe autonomy is a ladder: observe, propose, execute with approval, and execute within limits.'),
    impact: { eyebrow: l('IA Y AUTOMATIZACIÓN 05', 'AI AND AUTOMATION 05'), title: l('Más autonomía amplifica también el error', 'More autonomy also amplifies error'), body: l('Un agente que puede enviar, gastar o borrar necesita límites explícitos. El control no reduce valor: evita que una excepción destruya el sistema.', 'An agent that can send, spend, or delete needs explicit limits. Control does not reduce value; it prevents one exception from destroying the system.'), tacticalRule: l('Permiso mínimo, aprobación antes de lo irreversible y condición de parada.', 'Minimum permission, approval before irreversible action, and a stop condition.'), metric: { value: '4', label: l('niveles de autonomía progresiva', 'levels of progressive autonomy') } },
    challenge: { title: l('Detecta el agente peligroso', 'Detect the dangerous agent'), challenge: { kind: 'error_detection', prompt: l('¿Cuál configuración debe bloquearse antes de producción?', 'Which configuration must be blocked before production?'), options: [
      { id: 'a', label: l('Puede redactar respuestas, pero un humano envía', 'It can draft responses, but a human sends') }, { id: 'b', label: l('Puede borrar registros y gastar sin límite ni aprobación', 'It can delete records and spend without limit or approval'), correct: true }, { id: 'c', label: l('Registra cada llamada de herramienta', 'It logs every tool call') },
    ], feedback: { correct: l('Identificaste una acción irreversible sin control.', 'You identified an irreversible action without control.'), incorrect: l('Busca permisos amplios y consecuencias difíciles de revertir.', 'Look for broad permissions and hard-to-reverse consequences.'), explanation: l('El agente debe pedir aprobación o trabajar bajo límites verificables.', 'The agent must request approval or work within verifiable limits.') } } },
    action: { title: l('Diseña los frenos', 'Design the brakes'), widget: { engine: 'agent_guardrails', title: l('Canvas de agente seguro', 'Safe-agent canvas'), instruction: l('Define un agente real y el punto donde debe pedir permiso.', 'Define a real agent and the point where it must ask permission.'), fields: [
      { id: 'job', kind: 'text', label: l('Trabajo del agente', 'Agent job'), placeholder: l('Preparar seguimiento de leads', 'Prepare lead follow-ups'), minLength: 6 }, { id: 'tools', kind: 'text', label: l('Herramientas permitidas', 'Allowed tools'), placeholder: l('CRM en lectura y borradores de email', 'Read-only CRM and email drafts'), minLength: 6 }, { id: 'approval', kind: 'text', label: l('Requiere aprobación para', 'Approval required for'), placeholder: l('Enviar, borrar o gastar', 'Send, delete, or spend'), minLength: 6 }, { id: 'stop', kind: 'text', label: l('Condición de parada', 'Stop condition'), placeholder: l('Dato faltante, conflicto o tres fallos', 'Missing data, conflict, or three failures'), minLength: 6 },
    ], resultLabel: l('Contrato de autonomía', 'Autonomy contract'), artifactTitle: l('Mi agente con frenos', 'My agent with brakes'), commitLabel: l('Guardar guardrails', 'Save guardrails') } },
    reward: { title: l('Autonomía controlada', 'Autonomy controlled'), body: l('Tu agente ya sabe qué puede hacer y cuándo debe detenerse.', 'Your agent now knows what it can do and when it must stop.'), xp: 170, petRecovery: 25 },
  }),
];

const growthLessons: AtomicLesson[] = [
  makeLesson({
    id: 'learn-growth-01', trackId: 'viral-growth', order: 1, slug: 'three-second-hook', competency: 'marketing', difficulty: 'easy', prerequisiteIds: [], source: sources.t1ger,
    title: l('Gana los primeros tres segundos', 'Win the first three seconds'), objective: l('Escribir un gancho específico con tensión y recompensa.', 'Write a specific hook with tension and payoff.'), keyConcept: l('Un gancho detiene el scroll cuando promete una recompensa concreta y abre una brecha que el espectador quiere cerrar.', 'A hook stops the scroll when it promises a concrete payoff and opens a gap the viewer wants to close.'),
    impact: { eyebrow: l('VIRAL GROWTH 01', 'VIRAL GROWTH 01'), title: l('Si el inicio no retiene, el resto no existe', 'If the opening does not hold, the rest does not exist'), body: l('La introducción educada pierde contra una tensión visible. Empieza por el error, el contraste o el resultado; presenta tu nombre después.', 'A polite introduction loses to visible tension. Start with the mistake, contrast, or result; introduce yourself later.'), tacticalRule: l('Resultado específico + tensión inmediata + cero saludo.', 'Specific payoff + immediate tension + zero greeting.'), metric: { value: '3 s', label: l('para justificar el siguiente segundo', 'to justify the next second') } },
    challenge: { title: l('Elige el gancho que retiene', 'Choose the hook that holds'), challenge: { kind: 'multiple_choice', prompt: l('¿Qué apertura crea más curiosidad para un video sobre ventas?', 'Which opening creates more curiosity for a sales video?'), options: [
      { id: 'a', label: l('Hola, hoy hablaremos de ventas', 'Hi, today we will talk about sales') }, { id: 'b', label: l('Esta frase está matando tus cierres antes de la llamada', 'This sentence is killing your closes before the call'), correct: true }, { id: 'c', label: l('Las ventas son muy importantes', 'Sales are very important') },
    ], feedback: { correct: l('Es específico y abre una amenaza comprobable.', 'It is specific and opens a testable threat.'), incorrect: l('Una introducción no da una razón para quedarse.', 'An introduction gives no reason to stay.'), explanation: l('La opción correcta señala una pérdida y promete revelar la causa.', 'The correct option points to a loss and promises to reveal the cause.') } } },
    action: { title: l('Escribe tu gancho', 'Write your hook'), widget: { engine: 'hook_lab', title: l('Laboratorio de hooks', 'Hook lab'), instruction: l('Convierte una idea real en una apertura de tres segundos.', 'Turn a real idea into a three-second opening.'), fields: [
      { id: 'audience', kind: 'text', label: l('Audiencia', 'Audience'), placeholder: l('Freelancers que no consiguen respuestas', 'Freelancers who get no replies'), minLength: 5 }, { id: 'pain', kind: 'text', label: l('Pérdida o deseo específico', 'Specific loss or desire'), placeholder: l('Sus propuestas mueren en la primera línea', 'Their proposals die in the first line'), minLength: 5 }, { id: 'mechanism', kind: 'text', label: l('Mecanismo o contraste', 'Mechanism or contrast'), placeholder: l('Un cambio de siete palabras', 'A seven-word change'), minLength: 4 },
    ], resultLabel: l('Gancho listo', 'Hook ready'), artifactTitle: l('Mi gancho de tres segundos', 'My three-second hook'), commitLabel: l('Guardar gancho', 'Save hook') } },
    reward: { title: l('Gancho armado', 'Hook armed'), body: l('Publica esta apertura hoy y mide retención, no opiniones.', 'Publish this opening today and measure retention, not opinions.'), xp: 120, petRecovery: 18 },
  }),
  makeLesson({
    id: 'learn-growth-02', trackId: 'viral-growth', order: 2, slug: 'pain-with-a-face', competency: 'marketing', difficulty: 'easy', prerequisiteIds: ['learn-growth-01'], source: sources.lean,
    title: l('Un dolor necesita rostro', 'A pain needs a face'), objective: l('Convertir una audiencia amplia en un momento concreto.', 'Turn a broad audience into a concrete moment.'), keyConcept: l('La especificidad permite que el usuario se reconozca; “para todos” no describe a nadie.', 'Specificity lets users recognize themselves; “for everyone” describes no one.'),
    impact: { eyebrow: l('VIRAL GROWTH 02', 'VIRAL GROWTH 02'), title: l('“Emprendedores” no es una escena', '“Entrepreneurs” is not a scene'), body: l('Describe a la persona cuando el problema ocurre: qué intentó, qué ve en la pantalla y qué teme que pase después.', 'Describe the person when the problem happens: what they tried, what they see on screen, and what they fear happens next.'), tacticalRule: l('Persona + momento + fricción observable.', 'Person + moment + observable friction.'), metric: { value: '1', label: l('momento concreto supera diez adjetivos', 'concrete moment beats ten adjectives') } },
    challenge: { title: l('Empareja amplitud y precisión', 'Match breadth and precision'), challenge: { kind: 'matching', prompt: l('Conecta cada frase vaga con una escena utilizable.', 'Connect each vague phrase to a usable scene.'), pairs: [
      { id: 'busy', left: l('Profesionales ocupados', 'Busy professionals'), right: l('Consultor que abre Slack durante su bloque de ventas', 'Consultant who opens Slack during a sales block') }, { id: 'creator', left: l('Creadores', 'Creators'), right: l('Editor con diez borradores y cero publicaciones', 'Editor with ten drafts and zero posts') }, { id: 'founder', left: l('Fundadores', 'Founders'), right: l('Fundador que termina demos sin siguiente paso', 'Founder who ends demos without a next step') },
    ], feedback: { correct: l('Cada segmento ahora puede verse en una escena.', 'Each segment can now be seen in a scene.'), incorrect: l('Elige el momento que vuelve observable la etiqueta.', 'Choose the moment that makes the label observable.'), explanation: l('Las escenas producen mensajes y ofertas más precisas.', 'Scenes produce sharper messages and offers.') } } },
    action: { title: l('Aísla un momento de dolor', 'Isolate a pain moment'), widget: { engine: 'pain_to_promise', title: l('Mapa dolor-promesa', 'Pain-to-promise map'), instruction: l('Usa una conversación real, no una categoría de mercado.', 'Use a real conversation, not a market category.'), fields: [
      { id: 'person', kind: 'text', label: l('Persona concreta', 'Concrete person'), placeholder: l('Coach que vende por llamada', 'Coach who sells by call'), minLength: 5 }, { id: 'moment', kind: 'text', label: l('Momento del problema', 'Problem moment'), placeholder: l('El prospecto pide pensarlo al final', 'The prospect asks to think at the end'), minLength: 8 }, { id: 'result', kind: 'text', label: l('Resultado observable', 'Observable result'), placeholder: l('Salir con un sí, no o siguiente paso fechado', 'Leave with a yes, no, or dated next step'), minLength: 8 },
    ], resultLabel: l('Promesa específica', 'Specific promise'), artifactTitle: l('Mi mapa de dolor', 'My pain map'), commitLabel: l('Guardar promesa', 'Save promise') } },
    reward: { title: l('Segmento enfocado', 'Segment focused'), body: l('Tu mensaje ahora habla con una persona en un momento real.', 'Your message now speaks to one person in a real moment.'), xp: 130, petRecovery: 20 },
  }),
  makeLesson({
    id: 'learn-growth-03', trackId: 'viral-growth', order: 3, slug: 'value-equation', competency: 'offer', difficulty: 'medium', prerequisiteIds: ['learn-growth-02'], source: sources.hormozi,
    title: l('Haz irresistible el valor', 'Make value irresistible'), objective: l('Aumentar resultado y certeza mientras se reduce espera y esfuerzo.', 'Increase outcome and certainty while reducing delay and effort.'), keyConcept: l('Una oferta se vuelve más valiosa cuando mejora el resultado percibido, aumenta la confianza y acorta el camino.', 'An offer becomes more valuable when it improves perceived outcome, raises confidence, and shortens the path.'),
    impact: { eyebrow: l('VIRAL GROWTH 03', 'VIRAL GROWTH 03'), title: l('Bajar el precio no arregla una oferta débil', 'Lowering price does not fix a weak offer'), body: l('Antes de descontar, aumenta evidencia, reduce pasos y acerca el primer resultado. El usuario compra una transformación con riesgo controlado.', 'Before discounting, increase proof, reduce steps, and move the first result closer. The user buys a transformation with controlled risk.'), tacticalRule: l('Sube resultado y certeza; baja espera y esfuerzo.', 'Raise outcome and certainty; lower delay and effort.'), metric: { value: '4', label: l('palancas de valor antes del descuento', 'value levers before discounting') } },
    challenge: { title: l('Ordena las mejoras', 'Order the improvements'), challenge: { kind: 'ordering', prompt: l('Ordena estas mejoras desde la base hasta el acelerador.', 'Order these improvements from foundation to accelerator.'), options: [
      { id: 'outcome', label: l('Definir un resultado específico', 'Define a specific outcome') }, { id: 'proof', label: l('Añadir evidencia de que funcionará', 'Add evidence it will work') }, { id: 'speed', label: l('Reducir el tiempo al primer resultado', 'Reduce time to first result') },
    ], orderedIds: ['outcome', 'proof', 'speed'], feedback: { correct: l('Primero sabes qué prometes; luego lo haces creíble y rápido.', 'First know the promise; then make it credible and fast.'), incorrect: l('La velocidad de una promesa confusa solo entrega confusión antes.', 'Speeding up a vague promise only delivers confusion sooner.'), explanation: l('Resultado, certeza y velocidad se acumulan.', 'Outcome, certainty, and speed compound.') } } },
    action: { title: l('Reingeniería tu oferta', 'Re-engineer your offer'), widget: { engine: 'offer_value', title: l('Mesa de valor', 'Value desk'), instruction: l('Evalúa una oferta real y elige la palanca más débil.', 'Evaluate a real offer and identify the weakest lever.'), fields: [
      { id: 'offer', kind: 'text', label: l('Oferta', 'Offer'), placeholder: l('Auditoría de embudo en 48 horas', 'Funnel audit in 48 hours'), minLength: 6 }, { id: 'outcome', kind: 'range', label: l('Resultado deseado', 'Desired outcome'), min: 1, max: 10, step: 1, defaultValue: 7 }, { id: 'certainty', kind: 'range', label: l('Certeza percibida', 'Perceived certainty'), min: 1, max: 10, step: 1, defaultValue: 5 }, { id: 'delay', kind: 'range', label: l('Espera', 'Delay'), min: 1, max: 10, step: 1, defaultValue: 5 }, { id: 'effort', kind: 'range', label: l('Esfuerzo del cliente', 'Customer effort'), min: 1, max: 10, step: 1, defaultValue: 5 },
    ], resultLabel: l('Puntuación de valor', 'Value score'), artifactTitle: l('Mi oferta reingenierizada', 'My re-engineered offer'), commitLabel: l('Guardar mejora', 'Save improvement') } },
    reward: { title: l('Palanca encontrada', 'Lever found'), body: l('Ya sabes qué mejorar antes de tocar el precio.', 'You now know what to improve before touching price.'), xp: 140, petRecovery: 20 },
  }),
  makeLesson({
    id: 'learn-growth-04', trackId: 'viral-growth', order: 4, slug: 'six-second-script', competency: 'marketing', difficulty: 'medium', prerequisiteIds: ['learn-growth-03'], source: sources.t1ger,
    title: l('Guion de seis segundos', 'Six-second script'), objective: l('Construir un guion corto con hook, prueba y acción.', 'Build a short script with hook, proof, and action.'), keyConcept: l('Una pieza corta necesita una sola idea: interrumpir, demostrar y dirigir.', 'A short piece needs one idea: interrupt, prove, and direct.'),
    impact: { eyebrow: l('VIRAL GROWTH 04', 'VIRAL GROWTH 04'), title: l('Una idea por pieza', 'One idea per piece'), body: l('Intentar enseñar cinco cosas destruye ritmo y memoria. Un guion breve mueve al espectador desde una tensión hasta una acción sin desvíos.', 'Trying to teach five things destroys pace and memory. A short script moves the viewer from tension to action without detours.'), tacticalRule: l('Hook en 0–2, prueba en 2–5, acción en 5–6.', 'Hook at 0–2, proof at 2–5, action at 5–6.'), metric: { value: '6 s', label: l('para una idea completa y medible', 'for one complete, measurable idea') } },
    challenge: { title: l('Detecta el guion roto', 'Detect the broken script'), challenge: { kind: 'error_detection', prompt: l('¿Qué error reduce más la retención?', 'Which error hurts retention most?'), options: [
      { id: 'a', label: l('Abrir con logo y presentación durante tres segundos', 'Open with logo and introduction for three seconds'), correct: true }, { id: 'b', label: l('Mostrar una prueba visual en el segundo tres', 'Show visual proof at second three') }, { id: 'c', label: l('Cerrar con una acción específica', 'Close with a specific action') },
    ], feedback: { correct: l('Consumió la mitad del tiempo sin entregar tensión.', 'It spent half the runtime without delivering tension.'), incorrect: l('Busca el bloque que no compra el siguiente segundo.', 'Find the block that fails to buy the next second.'), explanation: l('La marca puede aparecer; no debe retrasar la promesa.', 'Brand can appear; it must not delay the promise.') } } },
    action: { title: l('Monta tu guion', 'Assemble your script'), widget: { engine: 'six_second_script', title: l('Timeline 0–6', 'Timeline 0–6'), instruction: l('Escribe una línea por bloque. Léelo en voz alta.', 'Write one line per block. Read it aloud.'), fields: [
      { id: 'hook', kind: 'text', label: l('0–2 s: interrupción', '0–2 s: interruption'), placeholder: l('Tu CTA está escondiendo la venta', 'Your CTA is hiding the sale'), minLength: 5 }, { id: 'proof', kind: 'text', label: l('2–5 s: prueba', '2–5 s: proof'), placeholder: l('Mira la diferencia entre estos dos botones', 'See the difference between these two buttons'), minLength: 5 }, { id: 'cta', kind: 'text', label: l('5–6 s: acción', '5–6 s: action'), placeholder: l('Copia esta versión', 'Copy this version'), minLength: 3 },
    ], resultLabel: l('Guion completo', 'Complete script'), artifactTitle: l('Mi guion de seis segundos', 'My six-second script'), commitLabel: l('Guardar guion', 'Save script') } },
    reward: { title: l('Guion listo', 'Script ready'), body: l('Grábalo una vez antes de editarlo diez.', 'Record it once before editing it ten times.'), xp: 150, petRecovery: 22 },
  }),
  makeLesson({
    id: 'learn-growth-05', trackId: 'viral-growth', order: 5, slug: 'distribution-machine', competency: 'marketing', difficulty: 'hard', prerequisiteIds: ['learn-growth-04'], source: sources.lean,
    title: l('Distribuye antes de producir más', 'Distribute before producing more'), objective: l('Convertir una idea en un sistema de canales con métricas.', 'Turn one idea into a channel system with metrics.'), keyConcept: l('Una idea gana alcance cuando se adapta al comportamiento de cada canal y conserva una tesis central medible.', 'An idea gains reach when adapted to each channel’s behavior while preserving one measurable thesis.'),
    impact: { eyebrow: l('VIRAL GROWTH 05', 'VIRAL GROWTH 05'), title: l('Crear más no corrige distribuir mal', 'Creating more does not fix weak distribution'), body: l('Una pieza fuerte puede convertirse en video, carrusel, email y conversación. Copiar y pegar no basta: cada formato necesita una entrada y una métrica propia.', 'One strong idea can become video, carousel, email, and conversation. Copy-paste is not enough: each format needs its own entry and metric.'), tacticalRule: l('Una tesis, tres adaptaciones, una métrica por canal.', 'One thesis, three adaptations, one metric per channel.'), metric: { value: '1→4', label: l('una idea convertida en cuatro pruebas', 'one idea turned into four tests') } },
    challenge: { title: l('Empareja canal y señal', 'Match channel and signal'), challenge: { kind: 'matching', prompt: l('Conecta el formato con la señal que importa primero.', 'Connect each format with the signal that matters first.'), pairs: [
      { id: 'short', left: l('Video corto', 'Short video'), right: l('Retención inicial', 'Opening retention') }, { id: 'email', left: l('Email', 'Email'), right: l('Respuesta o clic', 'Reply or click') }, { id: 'carousel', left: l('Carrusel', 'Carousel'), right: l('Avance y guardado', 'Swipe-through and saves') },
    ], feedback: { correct: l('Cada canal ya tiene una prueba concreta.', 'Each channel now has a concrete test.'), incorrect: l('No uses una sola métrica para conductas distintas.', 'Do not use one metric for different behaviors.'), explanation: l('La señal correcta te dice dónde falla la adaptación.', 'The right signal tells you where the adaptation fails.') } } },
    action: { title: l('Diseña tu máquina de distribución', 'Design your distribution machine'), widget: { engine: 'distribution_plan', title: l('Mapa 1→4', '1→4 map'), instruction: l('Parte de una idea que ya puedas defender.', 'Start from one idea you can already defend.'), fields: [
      { id: 'thesis', kind: 'text', label: l('Tesis central', 'Core thesis'), placeholder: l('Las propuestas pierden por falta de siguiente paso', 'Proposals lose because they lack a next step'), minLength: 8 }, { id: 'short', kind: 'text', label: l('Adaptación: video corto', 'Adaptation: short video'), placeholder: l('Antes y después en pantalla', 'Before and after on screen'), minLength: 5 }, { id: 'email', kind: 'text', label: l('Adaptación: email', 'Adaptation: email'), placeholder: l('Caso breve con plantilla', 'Short case with template'), minLength: 5 }, { id: 'conversation', kind: 'text', label: l('Adaptación: conversación', 'Adaptation: conversation'), placeholder: l('Pregunta de diagnóstico', 'Diagnostic question'), minLength: 5 },
    ], resultLabel: l('Sistema de distribución', 'Distribution system'), artifactTitle: l('Mi máquina 1→4', 'My 1→4 machine'), commitLabel: l('Guardar sistema', 'Save system') } },
    reward: { title: l('Máquina activada', 'Machine activated'), body: l('Tu próxima idea ya tiene cuatro oportunidades de aprender.', 'Your next idea now has four opportunities to teach you.'), xp: 170, petRecovery: 25 },
  }),
];

export const INTERACTIVE_TRACKS: InteractiveTrack[] = [
  {
    id: 'smart-money', legacyTrackId: 'investing', title: l('Smart Money & Inversiones', 'Smart Money & Investing'), shortTitle: l('Dinero', 'Money'),
    promise: l('Construye un sistema de capital que no dependa de adivinar.', 'Build a capital system that does not depend on guessing.'),
    outcome: l('Terminas con reglas de liquidez, aportes, selección de ETF, DCA y riesgo.', 'Finish with rules for liquidity, contributions, ETF selection, DCA, and risk.'), lessons: smartMoneyLessons,
  },
  {
    id: 'ai-automation', legacyTrackId: 'ai', title: l('IA & Automatizaciones', 'AI & Automation'), shortTitle: l('IA', 'AI'),
    promise: l('Pasa de prompts sueltos a sistemas con contexto, ruteo y control.', 'Move from isolated prompts to systems with context, routing, and control.'),
    outcome: l('Terminas con un prompt, un paquete de contexto, un flujo y un agente seguro.', 'Finish with a prompt, context pack, workflow, and safe agent.'), lessons: aiLessons,
  },
  {
    id: 'viral-growth', legacyTrackId: 'business', title: l('Viral Growth & Marketing', 'Viral Growth & Marketing'), shortTitle: l('Growth', 'Growth'),
    promise: l('Convierte atención en pruebas de mercado que puedas ejecutar hoy.', 'Turn attention into market tests you can execute today.'),
    outcome: l('Terminas con hook, segmento, oferta, guion y sistema de distribución.', 'Finish with a hook, segment, offer, script, and distribution system.'), lessons: growthLessons,
  },
];

export const ALL_ATOMIC_LESSONS = INTERACTIVE_TRACKS.flatMap((track) => track.lessons);

export const getInteractiveTrack = (trackId: InteractiveTrackId): InteractiveTrack =>
  INTERACTIVE_TRACKS.find((track) => track.id === trackId) || INTERACTIVE_TRACKS[0];

export const getInteractiveLesson = (lessonId: string): AtomicLesson | undefined =>
  ALL_ATOMIC_LESSONS.find((lesson) => lesson.id === lessonId);

export const getInteractiveTrackIdFromLegacy = (trackId: 'investing' | 'ai' | 'business'): InteractiveTrackId => {
  if (trackId === 'ai') return 'ai-automation';
  if (trackId === 'business') return 'viral-growth';
  return 'smart-money';
};

export const INTERACTIVE_MISSION_BANK: BankMission[] = ALL_ATOMIC_LESSONS.map((lesson) => ({
  id: lesson.id,
  nodeType: 'learn',
  competency: lesson.competency,
  difficulty: lesson.difficulty,
  type: 'book_lesson',
  title: lesson.title.es,
  concept: lesson.keyConcept.es,
  keyTakeaway: lesson.phases[0].tacticalRule.es,
  recallQuestion: lesson.learningDesign.retrievalPrompt.es,
  recallOptions: [
    { text: lesson.learningDesign.retrievalAnswer.es, correct: true },
    { text: lesson.learningDesign.misconception.es, correct: false },
    { text: 'Memorizar la idea sin probarla ni convertirla en una decisión real.', correct: false },
  ],
  recallExplanation: lesson.learningDesign.retrievalAnswer.es,
  sources: lesson.sources.map((source) => ({
    type: source.kind === 'paper' ? 'research' : source.kind === 'transcript' ? 'video' : source.kind === 'internal' ? 'article' : source.kind,
    title: source.title,
    author: source.author,
    url: source.url,
  })),
  xpReward: lesson.phases[3].xp,
}));

export const INTERACTIVE_FIELD_MISSION_BANK: BankMission[] = ALL_ATOMIC_LESSONS.map((lesson) => ({
  id: `field-${lesson.id}`,
  nodeType: 'apply',
  competency: lesson.competency,
  difficulty: lesson.difficulty,
  type: 'real_world_task',
  title: `Ejecuta: ${lesson.title.es}`,
  taskBrief: lesson.objective.es,
  reflectionPrompt: lesson.phases[2].widget.instruction.es,
  minReflectionLength: 20,
  verificationMethod: 'photo',
  verificationTier: 1,
  xpReward: 50,
}));

export const isInteractiveLessonId = (missionId: string): boolean =>
  ALL_ATOMIC_LESSONS.some((lesson) => lesson.id === missionId);
