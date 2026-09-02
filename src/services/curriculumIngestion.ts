import type { AtomicLesson, InteractiveTrackId } from './interactiveCurriculumTypes';

export interface CurriculumValidationResult {
  valid: boolean;
  errors: string[];
  lesson?: AtomicLesson;
}

const TRACK_IDS = new Set<InteractiveTrackId>(['smart-money', 'ai-automation', 'viral-growth']);
const PHASE_TYPES = ['impact', 'challenge', 'action', 'reward'];
const PHASE_DURATIONS = [45, 60, 60, 15];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasLocalizedText = (value: unknown): boolean =>
  isRecord(value) && typeof value.es === 'string' && value.es.trim().length > 0 && typeof value.en === 'string' && value.en.trim().length > 0;

/**
 * Production gate for AI-generated lessons. Invalid content never reaches the
 * player: it must pass structure, source provenance, interaction, and action checks.
 */
export function validateAtomicLesson(input: unknown): CurriculumValidationResult {
  const errors: string[] = [];
  if (!isRecord(input)) return { valid: false, errors: ['Lesson must be an object.'] };

  if (typeof input.id !== 'string' || !/^learn-[a-z]+-\d{2}$/.test(input.id)) errors.push('id must match learn-{track}-{nn}.');
  if (typeof input.trackId !== 'string' || !TRACK_IDS.has(input.trackId as InteractiveTrackId)) errors.push('trackId is invalid.');
  if (!Number.isInteger(input.order) || Number(input.order) < 1) errors.push('order must be a positive integer.');
  if (!hasLocalizedText(input.title) || !hasLocalizedText(input.objective) || !hasLocalizedText(input.keyConcept)) errors.push('title, objective, and keyConcept require es/en copy.');
  if (input.estimatedSeconds !== 180) errors.push('estimatedSeconds must equal 180.');

  if (!isRecord(input.learningDesign)) {
    errors.push('learningDesign is required for every Orb.');
  } else {
    const design = input.learningDesign;
    if (!hasLocalizedText(design.curiosityQuestion) || !hasLocalizedText(design.predictionPrompt)) errors.push('learningDesign requires curiosity and prediction prompts.');
    if (!Array.isArray(design.storyBeats) || design.storyBeats.length !== 3 || design.storyBeats.some((beat) => !isRecord(beat) || !hasLocalizedText(beat.title) || !hasLocalizedText(beat.body))) errors.push('learningDesign must contain exactly three localized story beats.');
    if (!hasLocalizedText(design.misconception)) errors.push('learningDesign requires a misconception to confront.');
    if (!Array.isArray(design.summaryPoints) || design.summaryPoints.length !== 3 || design.summaryPoints.some((point) => !hasLocalizedText(point))) errors.push('learningDesign must contain exactly three localized summary points.');
    if (!hasLocalizedText(design.retrievalPrompt) || !hasLocalizedText(design.retrievalAnswer)) errors.push('learningDesign requires a retrieval prompt and answer.');
  }

  if (!Array.isArray(input.sources) || input.sources.length === 0) {
    errors.push('At least one source is required.');
  } else {
    input.sources.forEach((source, index) => {
      if (!isRecord(source) || typeof source.id !== 'string' || typeof source.title !== 'string' || typeof source.author !== 'string' || typeof source.rights !== 'string') {
        errors.push(`sources[${index}] is missing provenance fields.`);
      }
    });
  }

  if (!Array.isArray(input.phases) || input.phases.length !== 4) {
    errors.push('phases must contain exactly four items.');
  } else {
    input.phases.forEach((phase, index) => {
      if (!isRecord(phase)) {
        errors.push(`phases[${index}] must be an object.`);
        return;
      }
      if (phase.type !== PHASE_TYPES[index]) errors.push(`phases[${index}] must be ${PHASE_TYPES[index]}.`);
      if (phase.durationSeconds !== PHASE_DURATIONS[index]) errors.push(`phases[${index}] must last ${PHASE_DURATIONS[index]} seconds.`);
    });

    const challengePhase = input.phases[1];
    const actionPhase = input.phases[2];
    const rewardPhase = input.phases[3];
    if (!isRecord(challengePhase) || !isRecord(challengePhase.challenge)) errors.push('Challenge phase requires challenge configuration.');
    if (!isRecord(actionPhase) || !isRecord(actionPhase.widget) || !Array.isArray((actionPhase.widget as Record<string, unknown>).fields)) errors.push('Action phase requires a declarative widget with fields.');
    if (!isRecord(rewardPhase) || typeof rewardPhase.xp !== 'number' || typeof rewardPhase.petRecovery !== 'number') errors.push('Reward phase requires XP and petRecovery.');
  }

  if (!isRecord(input.ingestion) || input.ingestion.schemaVersion !== '1.0.0' || !Array.isArray(input.ingestion.sourceIds)) {
    errors.push('ingestion audit metadata is incomplete.');
  }

  return { valid: errors.length === 0, errors, lesson: errors.length === 0 ? input as unknown as AtomicLesson : undefined };
}

export function validateCurriculumBatch(input: unknown): CurriculumValidationResult[] {
  if (!Array.isArray(input)) return [{ valid: false, errors: ['Curriculum batch must be an array.'] }];
  return input.map(validateAtomicLesson);
}
