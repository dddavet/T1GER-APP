import { ALL_ATOMIC_LESSONS, INTERACTIVE_MISSION_BANK, INTERACTIVE_TRACKS } from '../src/services/interactiveCurriculum';
import { validateAtomicLesson } from '../src/services/curriculumIngestion';
import { DEFAULT_BRAIN_STATE, processMissionReview } from '../src/services/brainService';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

assert(INTERACTIVE_TRACKS.length === 3, 'Curriculum must contain exactly three launch tracks.');
assert(ALL_ATOMIC_LESSONS.length === 15, 'Curriculum must contain exactly fifteen launch lessons.');
assert(INTERACTIVE_MISSION_BANK.length === ALL_ATOMIC_LESSONS.length, 'Every atomic lesson must have a Brain mission adapter.');

const ids = new Set<string>();
const engines = new Set<string>();
const challengeKinds = new Set<string>();

for (const track of INTERACTIVE_TRACKS) {
  assert(track.lessons.length === 5, `${track.id} must contain exactly five lessons.`);
  track.lessons.forEach((lesson, index) => {
    const validation = validateAtomicLesson(lesson);
    assert(validation.valid, `${lesson.id} failed validation: ${validation.errors.join(', ')}`);
    assert(!ids.has(lesson.id), `Duplicate lesson id: ${lesson.id}`);
    assert(lesson.order === index + 1, `${lesson.id} has a non-sequential order.`);
    assert(lesson.phases.reduce((total, phase) => total + phase.durationSeconds, 0) === 180, `${lesson.id} must total 180 seconds.`);
    assert(lesson.phases.map((phase) => phase.type).join('|') === 'impact|challenge|action|reward', `${lesson.id} has an invalid phase sequence.`);
    assert(lesson.learningDesign.storyBeats.length === 3, `${lesson.id} must contain three narrative beats.`);
    assert(lesson.learningDesign.summaryPoints.length === 3, `${lesson.id} must contain three schema summary points.`);
    assert(Boolean(lesson.learningDesign.retrievalPrompt.es && lesson.learningDesign.retrievalAnswer.en), `${lesson.id} must contain a bilingual retrieval anchor.`);
    assert(index === 0 ? lesson.prerequisiteIds.length === 0 : lesson.prerequisiteIds.includes(track.lessons[index - 1].id), `${lesson.id} must require the previous node.`);
    ids.add(lesson.id);
    challengeKinds.add(lesson.phases[1].challenge.kind);
    engines.add(lesson.phases[2].widget.engine);
  });
}

assert(challengeKinds.size === 4, 'Launch curriculum must exercise all four challenge types.');
assert(engines.size === 15, 'Every launch lesson must have a purpose-built micro-tool engine.');

const learnedOrbState = {
  ...DEFAULT_BRAIN_STATE,
  missionHistory: [{ missionId: 'learn-money-01', competency: 'investing' as const, difficulty: 'easy' as const, completed: true, score: 100, timestamp: Date.now() - 86_400_000 }],
  fsrsCards: {},
};
const reviewedOrbState = processMissionReview(learnedOrbState, 'learn-money-01', 100);
assert(Boolean(reviewedOrbState.fsrsCards['learn-money-01']), 'Smart Review must schedule a memory card for an interactive Orb.');
assert(reviewedOrbState.missionHistory.length === learnedOrbState.missionHistory.length, 'Smart Review must not replay mission history or completion rewards.');

console.log(`Interactive curriculum verified: ${INTERACTIVE_TRACKS.length} tracks, ${ALL_ATOMIC_LESSONS.length} lessons, ${engines.size} tools.`);
