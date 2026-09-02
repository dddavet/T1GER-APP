import type { LocalizedText, OrbLearningDesign, OrbStoryBeat } from './interactiveCurriculumTypes';

const l = (es: string, en: string): LocalizedText => ({ es, en });
const beat = (titleEs: string, titleEn: string, bodyEs: string, bodyEn: string): OrbStoryBeat => ({
  title: l(titleEs, titleEn),
  body: l(bodyEs, bodyEn),
});
const design = (
  curiosity: LocalizedText,
  prediction: LocalizedText,
  storyBeats: OrbLearningDesign['storyBeats'],
  misconception: LocalizedText,
  summaryPoints: OrbLearningDesign['summaryPoints'],
  retrievalPrompt: LocalizedText,
  retrievalAnswer: LocalizedText,
): OrbLearningDesign => ({ curiosityQuestion: curiosity, predictionPrompt: prediction, storyBeats, misconception, summaryPoints, retrievalPrompt, retrievalAnswer });

export const ORB_LEARNING_DESIGNS: Record<string, OrbLearningDesign> = {
  'learn-money-01': design(
    l('¿Qué parte de tu efectivo es seguridad y qué parte es capital dormido?', 'Which part of your cash is safety, and which part is sleeping capital?'),
    l('Predice cuánto poder de compra pierde $1,000 tras cinco años al 3% de inflación.', 'Predict how much buying power $1,000 loses after five years at 3% inflation.'),
    [beat('La ilusión', 'The illusion', 'El saldo no baja, así que parece intacto. Pero el número es nominal: no muestra cuánto puede comprar.', 'The balance does not fall, so it looks intact. But that number is nominal; it does not show what it can buy.'), beat('La separación', 'The separation', 'El efectivo de emergencia compra tiempo y evita ventas forzadas. El excedente tiene otro trabajo: capturar crecimiento.', 'Emergency cash buys time and prevents forced selling. Surplus cash has another job: capture growth.'), beat('La regla', 'The rule', 'Una frontera explícita entre colchón y excedente elimina la decisión emocional de cada mes.', 'An explicit boundary between buffer and surplus removes the monthly emotional negotiation.')],
    l('Error común: creer que invertir todo es valiente o que dejar todo quieto es prudente. Ambos extremos ignoran el trabajo distinto de cada dólar.', 'Common error: believing investing everything is brave or leaving everything idle is prudent. Both extremes ignore the different job of each dollar.'),
    [l('El colchón protege decisiones futuras.', 'The buffer protects future decisions.'), l('La inflación reduce poder de compra aunque el saldo no cambie.', 'Inflation reduces buying power even when the balance stays flat.'), l('El excedente necesita una regla de despliegue, no una corazonada.', 'Surplus needs a deployment rule, not a hunch.')],
    l('¿Por qué el fondo de emergencia puede mejorar el rendimiento de una cartera?', 'Why can an emergency fund improve portfolio outcomes?'),
    l('Porque reduce la probabilidad de vender inversiones bajo presión.', 'Because it reduces the chance of selling investments under pressure.'),
  ),
  'learn-money-02': design(
    l('¿Qué pesa más en diez años: encontrar la tasa perfecta o no interrumpir los aportes?', 'What matters more over ten years: finding the perfect rate or not interrupting contributions?'),
    l('Elige mentalmente qué crecerá más: $100/mes por 20 años o $200/mes por 8.', 'Choose mentally which grows more: $100/month for 20 years or $200/month for 8.'),
    [beat('El inicio lento', 'The slow start', 'Al principio casi todo el saldo proviene de tus aportes. Parece que el sistema no funciona porque la base aún es pequeña.', 'At first, nearly all the balance comes from your deposits. The system looks weak because the base is still small.'), beat('El cruce', 'The crossover', 'Con tiempo suficiente, los rendimientos empiezan a generar rendimientos. La curva deja de depender sólo de tu esfuerzo.', 'With enough time, returns begin producing returns. The curve stops depending only on your effort.'), beat('La defensa', 'The defense', 'Automatizar un monto sostenible protege el proceso de impulsos, noticias y meses imperfectos.', 'Automating a sustainable amount protects the process from impulses, headlines, and imperfect months.')],
    l('Error común: subir el aporte tanto que el plan se rompe al primer gasto inesperado.', 'Common error: raising the contribution so high that the plan breaks at the first surprise expense.'),
    [l('Tiempo, tasa y aportes multiplican juntos.', 'Time, rate, and contributions multiply together.'), l('La constancia importa más cuando la curva parece aburrida.', 'Consistency matters most when the curve looks boring.'), l('Un aporte sostenible supera uno heroico e intermitente.', 'A sustainable contribution beats a heroic intermittent one.')],
    l('¿Qué variable no puedes recuperar después?', 'Which variable can you never recover later?'), l('El tiempo que el capital permaneció fuera del proceso compuesto.', 'The time capital spent outside the compounding process.'),
  ),
  'learn-money-03': design(
    l('¿Por qué dos fondos “parecidos” pueden dejarte resultados muy distintos?', 'Why can two “similar” funds leave you with very different outcomes?'),
    l('Antes de leer, ordena mentalmente estos filtros: rentabilidad mensual, índice, coste, diversificación.', 'Before reading, mentally rank these filters: monthly return, index, cost, diversification.'),
    [beat('La historia seductora', 'The seductive story', 'El fondo ganador del mes ofrece una explicación fácil y reciente. Eso no demuestra una ventaja repetible.', 'The fund that won this month offers an easy, recent story. It does not prove a repeatable edge.'), beat('La exposición real', 'The real exposure', 'El índice revela qué posees; la diversificación revela de qué dependes. El nombre comercial no hace ninguna de las dos.', 'The index reveals what you own; diversification reveals what you depend on. The product name does neither.'), beat('La fuga silenciosa', 'The silent leak', 'El ratio de gastos se descuenta cada año y también pierde el crecimiento futuro que ese dinero habría generado.', 'The expense ratio is deducted every year and also loses the future growth that money would have generated.')],
    l('Error común: comparar precios por participación. Un ETF de $500 no es “más caro” que uno de $50; importa la exposición y el coste porcentual.', 'Common error: comparing share prices. A $500 ETF is not “more expensive” than a $50 ETF; exposure and percentage cost matter.'),
    [l('Primero identifica el índice.', 'Identify the index first.'), l('Luego confirma diversificación y liquidez.', 'Then confirm diversification and liquidity.'), l('Finalmente minimiza costes para una exposición equivalente.', 'Finally minimize costs for equivalent exposure.')],
    l('¿Qué cuatro datos sobreviven al ruido de un mes?', 'Which four facts survive one month of noise?'), l('Índice, diversificación, ratio de gastos y liquidez.', 'Index, diversification, expense ratio, and liquidity.'),
  ),
  'learn-money-04': design(
    l('¿Cuántas veces al año negocias contigo mismo antes de invertir?', 'How many times a year do you negotiate with yourself before investing?'),
    l('Predice qué plan sobrevive mejor una caída: uno grande “cuando haya calma” o uno pequeño automático.', 'Predict which plan survives a downturn: a large one “when things calm down” or a small automatic one.'),
    [beat('La espera', 'The wait', 'La claridad suele llegar después de que el precio ya subió. Esperar seguridad convierte el sentimiento en señal de compra.', 'Clarity often arrives after price has risen. Waiting for safety turns feelings into a buy signal.'), beat('El sistema', 'The system', 'DCA fija monto y frecuencia antes de conocer la próxima noticia. No promete el mejor precio; promete participación consistente.', 'DCA fixes amount and frequency before the next headline. It does not promise the best price; it promises consistent participation.'), beat('La supervivencia', 'The survival test', 'El monto correcto es el que puedes sostener durante un mes malo sin cancelar ni tocar el colchón.', 'The right amount is one you can sustain through a bad month without canceling or touching the buffer.')],
    l('Error común: pensar que DCA elimina riesgo. Reduce decisiones emocionales; no elimina caídas ni garantiza rentabilidad.', 'Common error: thinking DCA removes risk. It reduces emotional decisions; it does not remove drawdowns or guarantee returns.'),
    [l('Define monto y frecuencia antes del ruido.', 'Define amount and frequency before the noise.'), l('Vincula el aporte al flujo de ingresos.', 'Tie the contribution to income flow.'), l('Revisa el sistema por calendario, no por miedo.', 'Review the system by calendar, not fear.')],
    l('¿Qué problema resuelve realmente DCA?', 'What problem does DCA actually solve?'), l('La repetición de decisiones emocionales sobre cuándo invertir.', 'Repeated emotional decisions about when to invest.'),
  ),
  'learn-money-05': design(
    l('¿Por qué perder 50% exige algo mucho más difícil que recuperar 50%?', 'Why does losing 50% require something much harder than recovering 50%?'),
    l('Antes de leer, define la pérdida máxima que aceptarías en una sola idea.', 'Before reading, define the maximum loss you would accept on one idea.'),
    [beat('La asimetría', 'The asymmetry', 'De 100 a 50 pierdes la mitad. Para volver de 50 a 100 necesitas duplicar: una ganancia del 100%.', 'From 100 to 50 you lose half. To return from 50 to 100 you must double: a 100% gain.'), beat('La decisión previa', 'The prior decision', 'El tamaño de posición convierte una tesis incierta en una pérdida tolerable. Se decide antes de sentir miedo.', 'Position size turns an uncertain thesis into a tolerable loss. It is decided before fear appears.'), beat('La salida observable', 'The observable exit', 'Una condición ligada a hechos evita el “saldré cuando se sienta mal”, que casi siempre llega tarde.', 'A fact-based exit condition avoids “I will leave when it feels bad,” which usually arrives late.')],
    l('Error común: usar un stop arbitrario sin relacionarlo con volatilidad, tesis o tamaño. El número solo no crea control.', 'Common error: using an arbitrary stop without relating it to volatility, thesis, or size. A number alone does not create control.'),
    [l('Protege primero la capacidad de seguir jugando.', 'Protect your ability to keep playing first.'), l('Tamaño y pérdida máxima son la misma ecuación.', 'Size and maximum loss are the same equation.'), l('La salida debe ser observable antes de entrar.', 'The exit must be observable before entry.')],
    l('¿Qué tres cosas deben existir antes de una operación?', 'Which three things must exist before a trade?'), l('Tamaño, pérdida máxima y condición de salida.', 'Size, maximum loss, and an exit condition.'),
  ),
  'learn-ai-01': design(
    l('¿Por qué el mismo modelo parece brillante con una instrucción y mediocre con otra?', 'Why can the same model look brilliant with one instruction and mediocre with another?'),
    l('Predice cuál bloque falta cuando una respuesta es correcta pero inútil.', 'Predict which block is missing when an answer is correct but useless.'),
    [beat('La ambigüedad', 'The ambiguity', 'El modelo completa huecos con supuestos probables. Cada hueco que dejas es una decisión que delegas sin control.', 'The model fills gaps with likely assumptions. Every gap is a decision you delegate without control.'), beat('El contrato', 'The contract', 'Objetivo, contexto, restricciones y formato convierten una petición vaga en un resultado que puedes evaluar.', 'Goal, context, constraints, and format turn a vague request into an output you can evaluate.'), beat('La prueba', 'The test', 'Un buen prompt no se juzga por cómo suena, sino por si produce un resultado repetible con criterios visibles.', 'A good prompt is not judged by how it sounds, but whether it produces repeatable output against visible criteria.')],
    l('Error común: asignar una “persona experta” y olvidar datos, restricciones y criterio de calidad.', 'Common error: assigning an “expert persona” while omitting data, constraints, and quality criteria.'),
    [l('Define el resultado antes del rol.', 'Define the outcome before the role.'), l('Entrega sólo el contexto que cambia la respuesta.', 'Provide only context that changes the answer.'), l('Especifica formato y criterio de aceptación.', 'Specify format and acceptance criteria.')],
    l('¿Cuáles son los cuatro bloques de un prompt ejecutable?', 'What are the four blocks of an executable prompt?'), l('Objetivo, contexto, restricciones y formato.', 'Goal, context, constraints, and format.'),
  ),
  'learn-ai-02': design(
    l('¿Qué información cambia una respuesta y cuál sólo ocupa tokens?', 'Which information changes an answer, and which only consumes tokens?'),
    l('Piensa en tres hechos que un modelo necesitaría para escribir como tu negocio.', 'Think of three facts a model would need to write like your business.'),
    [beat('El truco frágil', 'The fragile trick', 'Una frase ingeniosa puede mejorar una salida aislada, pero no enseña al modelo cómo funciona tu mundo.', 'A clever phrase can improve one output, but it does not teach the model how your world works.'), beat('Las tres capas', 'The three layers', 'Contexto estable explica identidad y reglas; contexto de tarea explica el objetivo; ejemplos muestran el estándar.', 'Stable context explains identity and rules; task context explains the goal; examples demonstrate the standard.'), beat('La compresión', 'The compression', 'El contexto debe ser suficiente para cambiar decisiones, pero corto para que la instrucción central no desaparezca.', 'Context must be sufficient to change decisions, but short enough that the core instruction remains visible.')],
    l('Error común: pegar documentos completos cuando bastaban cinco hechos y dos ejemplos.', 'Common error: pasting entire documents when five facts and two examples would suffice.'),
    [l('Separa contexto estable de contexto de tarea.', 'Separate stable context from task context.'), l('Usa ejemplos para mostrar calidad.', 'Use examples to demonstrate quality.'), l('Elimina datos que no cambian ninguna decisión.', 'Remove facts that change no decision.')],
    l('¿Qué prueba decide si un dato pertenece al contexto?', 'What test determines whether a fact belongs in context?'), l('Si eliminarlo no cambia una decisión del resultado, probablemente sobra.', 'If removing it changes no output decision, it probably does not belong.'),
  ),
  'learn-ai-03': design(
    l('¿Por qué usar el modelo más potente para todo puede empeorar un sistema?', 'Why can using the most powerful model for everything make a system worse?'),
    l('Clasifica mentalmente una tarea por riesgo, complejidad y coste de error.', 'Mentally classify a task by risk, complexity, and cost of error.'),
    [beat('La falsa seguridad', 'False security', 'Más capacidad no elimina instrucciones vagas ni datos malos. Sólo aumenta coste y latencia.', 'More capability does not fix vague instructions or bad data. It only raises cost and latency.'), beat('El ruteo', 'Routing', 'Tareas repetitivas y reversibles pueden usar rutas rápidas. Juicio ambiguo o acciones irreversibles necesitan más capacidad y revisión.', 'Repetitive reversible tasks can use fast routes. Ambiguous judgment or irreversible actions need more capability and review.'), beat('La escalada', 'Escalation', 'El sistema robusto empieza barato y escala por incertidumbre, no por prestigio del modelo.', 'A robust system starts cheap and escalates based on uncertainty, not model prestige.')],
    l('Error común: rutear por longitud del prompt en vez de por riesgo y ambigüedad.', 'Common error: routing by prompt length instead of risk and ambiguity.'),
    [l('Clasifica tarea, riesgo y reversibilidad.', 'Classify task, risk, and reversibility.'), l('Empieza con la ruta suficiente, no la máxima.', 'Start with the sufficient route, not the maximum one.'), l('Escala cuando la incertidumbre supera un umbral.', 'Escalate when uncertainty crosses a threshold.')],
    l('¿Qué dos señales obligan a escalar?', 'Which two signals force escalation?'), l('Alta incertidumbre y alto coste de error.', 'High uncertainty and high cost of error.'),
  ),
  'learn-ai-04': design(
    l('¿Qué parte de tu semana sigue copiando datos entre dos pantallas?', 'Which part of your week still copies data between two screens?'),
    l('Elige una tarea y nombra su evento inicial, transformación y acción final.', 'Choose one task and name its trigger, transformation, and final action.'),
    [beat('La unidad correcta', 'The right unit', 'Automatizar una app entera crea un proyecto. Automatizar un flujo concreto crea una victoria verificable.', 'Automating an entire app creates a project. Automating one concrete flow creates a verifiable win.'), beat('El esqueleto', 'The skeleton', 'Todo flujo necesita un trigger observable, una transformación definida y una acción con destino claro.', 'Every flow needs an observable trigger, a defined transformation, and an action with a clear destination.'), beat('La traza', 'The trace', 'Los logs convierten fallos invisibles en pasos reparables. Sin trazabilidad, la automatización sólo mueve errores más rápido.', 'Logs turn invisible failures into repairable steps. Without traceability, automation only moves errors faster.')],
    l('Error común: construir el camino feliz sin definir qué ocurre cuando falta un dato.', 'Common error: building the happy path without defining what happens when data is missing.'),
    [l('Empieza por un evento observable.', 'Start with an observable event.'), l('Haz una transformación pequeña y comprobable.', 'Make one small, testable transformation.'), l('Guarda salida, error y momento de ejecución.', 'Store output, error, and execution time.')],
    l('¿Cuáles son las tres piezas mínimas de un flujo?', 'What are the three minimum parts of a workflow?'), l('Trigger, transformación y acción.', 'Trigger, transformation, and action.'),
  ),
  'learn-ai-05': design(
    l('¿Qué acción nunca debería ejecutar un agente sin permiso?', 'Which action should an agent never execute without permission?'),
    l('Predice el peor resultado plausible si tu automatización recibe datos incorrectos.', 'Predict the worst plausible outcome if your automation receives bad data.'),
    [beat('Capacidad sin límite', 'Capability without limits', 'Un agente combina razonamiento y herramientas. El mismo poder que ahorra trabajo puede amplificar un supuesto equivocado.', 'An agent combines reasoning and tools. The same power that saves work can amplify a bad assumption.'), beat('La frontera', 'The boundary', 'Presupuesto, allowlists, límites de frecuencia y aprobación humana convierten intención en control ejecutable.', 'Budgets, allowlists, rate limits, and human approval turn intent into executable control.'), beat('La prueba de parada', 'The stop test', 'Un guardrail no existe hasta que demuestras que bloquea una acción fuera de límite.', 'A guardrail does not exist until you demonstrate that it blocks an out-of-bounds action.')],
    l('Error común: escribir “no hagas nada peligroso” en el prompt y llamarlo seguridad.', 'Common error: writing “do nothing dangerous” in the prompt and calling it security.'),
    [l('Limita herramientas y destinos.', 'Limit tools and destinations.'), l('Define presupuesto y frecuencia.', 'Define budget and frequency.'), l('Exige aprobación para acciones irreversibles.', 'Require approval for irreversible actions.')],
    l('¿Qué convierte una preferencia de seguridad en un guardrail?', 'What turns a safety preference into a guardrail?'), l('Una restricción ejecutable que bloquea y registra la acción.', 'An enforceable restriction that blocks and logs the action.'),
  ),
  'learn-growth-01': design(
    l('¿Qué promesa compra el segundo cuatro de tu contenido?', 'What promise earns second four of your content?'),
    l('Predice cuál apertura retiene más: presentarte o mostrar una pérdida específica.', 'Predict which opening retains more: introducing yourself or showing a specific loss.'),
    [beat('La subasta', 'The auction', 'Cada segundo compite con otro contenido. El espectador no debe atención; la apertura tiene que comprarla.', 'Every second competes with other content. The viewer owes no attention; the opening must earn it.'), beat('La tensión', 'The tension', 'Una pérdida, contraste o resultado específico abre una pregunta que el cerebro quiere cerrar.', 'A specific loss, contrast, or result opens a question the brain wants to close.'), beat('El pago', 'The payoff', 'El hook funciona cuando el contenido paga exactamente la curiosidad que abrió. Sin pago, la próxima pieza pierde confianza.', 'A hook works when the content pays off the exact curiosity it opened. Without payoff, the next piece loses trust.')],
    l('Error común: crear intriga sin prometer valor concreto. Eso produce click, no retención.', 'Common error: creating intrigue without promising concrete value. That produces a click, not retention.'),
    [l('Cero saludo antes de la tensión.', 'Zero greeting before tension.'), l('Una pérdida o resultado debe ser visible.', 'A loss or result must be visible.'), l('El cuerpo debe pagar la promesa del hook.', 'The body must pay off the hook promise.')],
    l('¿Cuáles son las tres piezas de un hook defendible?', 'What are the three parts of a defensible hook?'), l('Audiencia específica, tensión visible y payoff concreto.', 'Specific audience, visible tension, and concrete payoff.'),
  ),
  'learn-growth-02': design(
    l('¿Puedes ver a tu “audiencia objetivo” en una escena de diez segundos?', 'Can you see your “target audience” in a ten-second scene?'),
    l('Convierte “emprendedores” en una persona, un momento y una fricción.', 'Turn “entrepreneurs” into a person, a moment, and a friction.'),
    [beat('La etiqueta', 'The label', '“Creadores” describe una categoría, pero no revela qué ocurre justo antes de buscar una solución.', '“Creators” describes a category, but not what happens right before they seek a solution.'), beat('La escena', 'The scene', 'Una escena muestra intento, pantalla, bloqueo y consecuencia. Entonces el mensaje puede usar palabras que la persona reconoce.', 'A scene shows attempt, screen, blockage, and consequence. Then the message can use words the person recognizes.'), beat('La promesa', 'The promise', 'Cuando el dolor es observable, el resultado también puede serlo. Eso vuelve la oferta medible y creíble.', 'When pain is observable, the outcome can be observable too. That makes the offer measurable and credible.')],
    l('Error común: confundir demografía con situación de compra.', 'Common error: confusing demographics with a buying situation.'),
    [l('Nombra una persona concreta.', 'Name a concrete person.'), l('Ubícala en el momento del problema.', 'Place them at the problem moment.'), l('Describe una fricción que alguien pueda observar.', 'Describe a friction someone can observe.')],
    l('¿Qué fórmula convierte una audiencia vaga en un segmento utilizable?', 'What formula turns a vague audience into a usable segment?'), l('Persona + momento + fricción observable.', 'Person + moment + observable friction.'),
  ),
  'learn-growth-03': design(
    l('¿Qué deberías mejorar antes de bajar el precio?', 'What should you improve before lowering price?'),
    l('Identifica la palanca más débil de tu oferta: resultado, certeza, espera o esfuerzo.', 'Identify your offer’s weakest lever: outcome, certainty, delay, or effort.'),
    [beat('El descuento', 'The discount', 'Bajar precio trata la duda como si siempre fuera dinero. Muchas veces el comprador duda del resultado o del camino.', 'Lowering price treats every doubt as a money problem. Often the buyer doubts the outcome or the path.'), beat('La ecuación', 'The equation', 'El valor percibido sube con resultado y certeza; baja cuando espera y esfuerzo crecen.', 'Perceived value rises with outcome and certainty; it falls as delay and effort rise.'), beat('La primera victoria', 'The first win', 'Acercar un resultado pequeño y verificable reduce riesgo mejor que una promesa más grande y lejana.', 'Moving a small verifiable result closer reduces risk better than making a larger distant promise.')],
    l('Error común: añadir bonos que aumentan volumen y esfuerzo sin mejorar el resultado.', 'Common error: adding bonuses that increase volume and effort without improving the outcome.'),
    [l('Haz el resultado específico.', 'Make the outcome specific.'), l('Aumenta certeza con prueba y mecanismo.', 'Raise certainty with proof and mechanism.'), l('Reduce tiempo y esfuerzo hasta la primera victoria.', 'Reduce time and effort to the first win.')],
    l('¿Qué cuatro palancas componen el valor percibido?', 'Which four levers make up perceived value?'), l('Resultado, certeza, espera y esfuerzo.', 'Outcome, certainty, delay, and effort.'),
  ),
  'learn-growth-04': design(
    l('¿Puede tu idea sobrevivir si sólo tiene seis segundos?', 'Can your idea survive if it only has six seconds?'),
    l('Recorta mentalmente tu próximo video a interrupción, prueba y acción.', 'Mentally cut your next video down to interruption, proof, and action.'),
    [beat('La compresión', 'Compression', 'El límite obliga a elegir una sola transformación. Cada idea adicional compite con la principal.', 'The limit forces one transformation. Every extra idea competes with the main one.'), beat('La secuencia', 'The sequence', 'Primero interrumpes el patrón, luego demuestras el cambio y al final diriges una acción.', 'First interrupt the pattern, then demonstrate the change, then direct one action.'), beat('La lectura en voz alta', 'Read it aloud', 'El guion que cabe en una pantalla puede no caber en seis segundos. La voz revela densidad y ritmo.', 'A script that fits on screen may not fit in six seconds. Voice exposes density and rhythm.')],
    l('Error común: usar tres segundos para logo, nombre y contexto antes de entregar tensión.', 'Common error: spending three seconds on logo, name, and context before delivering tension.'),
    [l('0–2 s: interrumpe.', '0–2s: interrupt.'), l('2–5 s: demuestra.', '2–5s: demonstrate.'), l('5–6 s: dirige una acción.', '5–6s: direct one action.')],
    l('¿Cuál es la secuencia de un guion de seis segundos?', 'What is the sequence of a six-second script?'), l('Interrupción, prueba y acción.', 'Interruption, proof, and action.'),
  ),
  'learn-growth-05': design(
    l('¿Cuántas pruebas de mercado extraes de una sola idea?', 'How many market tests do you extract from one idea?'),
    l('Elige una tesis y predice cómo cambiaría en video, email y carrusel.', 'Choose one thesis and predict how it changes across video, email, and carousel.'),
    [beat('El desperdicio', 'The waste', 'Publicar una vez y abandonar la tesis confunde falta de distribución con falta de calidad.', 'Publishing once and abandoning the thesis confuses weak distribution with weak quality.'), beat('La adaptación', 'Adaptation', 'La idea central permanece; cambian la entrada, el formato y la acción natural de cada canal.', 'The central idea stays; the opening, format, and natural action of each channel change.'), beat('La lectura de señales', 'Reading signals', 'Retención, clic, guardado y respuesta diagnostican problemas distintos. Una sola métrica no explica todo.', 'Retention, click, save, and reply diagnose different problems. One metric cannot explain everything.')],
    l('Error común: copiar y pegar el mismo activo en todos los canales y llamarlo distribución.', 'Common error: copying the same asset into every channel and calling it distribution.'),
    [l('Conserva una tesis central.', 'Keep one core thesis.'), l('Adapta entrada y formato por canal.', 'Adapt opening and format by channel.'), l('Asigna una señal diagnóstica a cada versión.', 'Assign a diagnostic signal to each version.')],
    l('¿Qué cambia y qué permanece al distribuir?', 'What changes and what remains when distributing?'), l('Permanece la tesis; cambian entrada, formato, CTA y métrica.', 'The thesis remains; opening, format, CTA, and metric change.'),
  ),
};

export function getOrbLearningDesign(lessonId: string): OrbLearningDesign {
  const learningDesign = ORB_LEARNING_DESIGNS[lessonId];
  if (!learningDesign) throw new Error(`Missing Orb learning design for ${lessonId}`);
  return learningDesign;
}
