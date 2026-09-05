import type { LearningLocale } from './interactiveCurriculumTypes';

type Copy = [string, string];
interface ApplyDesign { title: Copy; why: Copy; steps: Copy[]; done: Copy; minutes: number }
const designs: Record<string, ApplyDesign> = {
  'learn-money-01': {
    title: ['Dale un propósito a tu dinero', 'Give your money a purpose'], minutes: 5,
    why: ['Antes de estudiar inversiones, distingue el dinero que podrías necesitar pronto. Un colchón y un objetivo de largo plazo cumplen funciones diferentes.', 'Before exploring investments, distinguish money you may need soon. A buffer and a long-term goal serve different purposes.'],
    steps: [['Abre tus notas o tu presupuesto. Puedes trabajar con cantidades ficticias.', 'Open your notes or budget. You can use fictional amounts.'], ['Crea dos categorías: necesidades próximas y objetivos de largo plazo.', 'Create two categories: near-term needs and long-term goals.'], ['Asigna una cantidad a cada una y guarda una regla para no confundirlas. No hace falta mover dinero.', 'Assign an amount to each and save a rule to keep them separate. No money transfer is needed.']],
    done: ['He guardado mis dos categorías y una regla para mantenerlas separadas.', 'I saved my two categories and a rule to keep them separate.'],
  },
  'learn-money-02': {
    title: ['Ponle una fecha a tu futuro', 'Give your future a date'], minutes: 4,
    why: ['Una proyección solo es útil si entiendes sus supuestos. Convertirla en un recordatorio te permite revisar el plan sin prometer un rendimiento.', 'A projection is only useful when you understand its assumptions. A reminder helps you revisit the plan without promising a return.'],
    steps: [['Recupera la simulación de interés compuesto que acabas de guardar.', 'Revisit the compound-growth simulation you just saved.'], ['Anota el aporte, el horizonte y que el retorno es un supuesto, no una garantía.', 'Note the contribution, horizon and that returns are assumptions, not guarantees.'], ['Crea un recordatorio para revisar si ese aporte encaja con tu presupuesto. No actives una compra real.', 'Create a reminder to check whether that contribution fits your budget. Do not activate a real purchase.']],
    done: ['Mi simulación está guardada con sus supuestos y una fecha de revisión.', 'My simulation is saved with its assumptions and a review date.'],
  },
  'learn-money-03': {
    title: ['Compara antes de elegir', 'Compare before choosing'], minutes: 7,
    why: ['Dos fondos con nombres parecidos pueden exponerte a riesgos y costes distintos. Una comparación por escrito ayuda a separar datos de popularidad.', 'Two similarly named funds can expose you to different risks and costs. A written comparison separates facts from popularity.'],
    steps: [['Abre las fichas oficiales de dos ETF que sigan un mercado comparable.', 'Open the official fact sheets of two ETFs tracking a comparable market.'], ['En tus notas, compara índice, diversificación, ratio de gastos y fecha de la información.', 'In your notes, compare index, diversification, expense ratio and the information date.'], ['Escribe una diferencia y una pregunta pendiente. El objetivo es comparar, no comprar.', 'Write one difference and one open question. The goal is to compare, not buy.']],
    done: ['Tengo una comparación de dos fondos y sé qué dato debo investigar después.', 'I have a two-fund comparison and know which fact to investigate next.'],
  },
  'learn-money-04': {
    title: ['Ensaya tu hábito de aportes', 'Rehearse your contribution habit'], minutes: 4,
    why: ['Una regla de calendario reduce decisiones repetitivas. Ensayarla sin dinero real permite detectar un importe o una frecuencia que no encaja contigo.', 'A calendar rule reduces repeated decisions. Rehearsing without real money reveals an amount or frequency that does not fit.'],
    steps: [['Revisa el importe y la frecuencia de tu plan DCA.', 'Review the amount and frequency of your DCA plan.'], ['Crea un recordatorio recurrente marcado como simulación.', 'Create a recurring reminder labelled as a simulation.'], ['Añade una regla de pausa si necesitas ese dinero para gastos esenciales. Comprueba la próxima fecha.', 'Add a pause rule if you need that money for essential expenses. Check the next date.']],
    done: ['Mi recordatorio recurrente tiene importe simulado, fecha y regla de pausa.', 'My recurring reminder has a simulated amount, date and pause rule.'],
  },
  'learn-money-05': {
    title: ['Escribe tus límites', 'Write down your limits'], minutes: 6,
    why: ['Pensar en escenarios adversos antes de actuar ayuda a reconocer cuándo un plan no es adecuado. Un límite calculado no garantiza que una pérdida se detenga ahí.', 'Considering adverse scenarios before acting helps reveal when a plan is unsuitable. A calculated limit does not guarantee a loss will stop there.'],
    steps: [['Abre una nota titulada «Mi protocolo de riesgo» y usa tu simulación como ejemplo.', 'Open a note titled “My risk protocol” and use your simulation as an example.'], ['Escribe horizonte, cantidad que no puedes arriesgar y un escenario de caída. No uses dinero real para probarlo.', 'Write your horizon, the amount you cannot risk and a downside scenario. Do not test it with real money.'], ['Añade cuándo revisarías el plan y qué no entiendes todavía. Guarda la nota antes de cerrar.', 'Add when you would review the plan and what you do not yet understand. Save the note before closing.']],
    done: ['He guardado mis límites, un escenario adverso y una condición de revisión.', 'I saved my limits, a downside scenario and a review condition.'],
  },
};

export function getApplyDesign(lessonId: string, locale: LearningLocale) {
  const design = designs[lessonId];
  if (!design) return null;
  const i = locale === 'es' ? 0 : 1;
  return { title: design.title[i], why: design.why[i], steps: design.steps.map(step => step[i]), done: design.done[i], minutes: design.minutes };
}
