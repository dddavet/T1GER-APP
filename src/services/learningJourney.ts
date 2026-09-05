import type { BrainState } from './brainService';
import type { AtomicLesson, InteractiveTrack, LocalizedText } from './interactiveCurriculumTypes';

export interface JourneySection {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  lessonIds: string[];
  landmark: 'seed' | 'compass' | 'summit';
}

export const INVESTING_SECTIONS: JourneySection[] = [
  { id: 'foundations', title: { es: 'Construye tu base', en: 'Build your foundation' }, description: { es: 'Protege el presente. Dale tiempo al futuro.', en: 'Protect the present. Give the future time.' }, lessonIds: ['learn-money-01', 'learn-money-02'], landmark: 'seed' },
  { id: 'strategy', title: { es: 'Encuentra tu rumbo', en: 'Find your direction' }, description: { es: 'Compara con criterio. Diseña tu hábito.', en: 'Compare with purpose. Design your habit.' }, lessonIds: ['learn-money-03', 'learn-money-04'], landmark: 'compass' },
  { id: 'risk', title: { es: 'Riesgo y análisis', en: 'Risk & analysis' }, description: { es: 'Un buen plan también sabe poner límites.', en: 'A good plan knows where to set limits.' }, lessonIds: ['learn-money-05'], landmark: 'summit' },
];

export type JourneyNodeState = 'completed' | 'current' | 'review' | 'locked';
export interface JourneyNode { lesson: AtomicLesson; state: JourneyNodeState; reviewIds: string[] }

/** The same ordered policy drives the trail and its primary CTA. Reviews never revoke completed work. */
export function getJourneyNodes(track: InteractiveTrack, brain: BrainState, completedApplyIds: string[] = [], now = Date.now()): JourneyNode[] {
  const done = new Set(brain.missionHistory.filter(record => record.completed).map(record => record.missionId));
  completedApplyIds.forEach(id => done.add(id));
  return track.lessons.map((lesson, index) => {
    if (done.has(`field-${lesson.id}`)) return { lesson, state: 'completed', reviewIds: [] };
    const preceding = track.lessons.slice(0, index);
    if (preceding.some(item => !done.has(`field-${item.id}`))) return { lesson, state: 'locked', reviewIds: [] };
    const reviewIds = preceding.filter(item => {
      const card = brain.fsrsCards?.[item.id];
      if (!card) return false; // Legacy completion remains valid; review cards are created on the next recall.
      return new Date(card.due).getTime() <= now || card.state === 1 || card.state === 3;
    }).map(item => item.id);
    return { lesson, state: reviewIds.length ? 'review' : 'current', reviewIds };
  });
}
