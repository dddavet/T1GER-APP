import { ALL_ATOMIC_LESSONS, INTERACTIVE_MISSION_BANK, INTERACTIVE_TRACKS } from '../src/services/interactiveCurriculum';
import { validateAtomicLesson } from '../src/services/curriculumIngestion';
import { DEFAULT_BRAIN_STATE, processMissionReview } from '../src/services/brainService';
import {
  KINNU_DOMAINS,
  LAUNCH_DOMAIN_IDS,
  isPathwayAvailable,
  getDomainForTrackId,
  getReadyPathwayForTrack,
} from '../src/services/curriculumCatalog';
import { FIELD_MISSION_CATALOG } from '../functions/src/fieldMissionCatalog';
import { calculateCompoundProjection } from '../src/components/learn/MicroToolLab';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

assert(INTERACTIVE_TRACKS.length === 7, 'Curriculum contains seven authored tracks, including unreleased content.');
assert(ALL_ATOMIC_LESSONS.length === 35, 'Curriculum contains thirty-five authored lessons.');
const ready = KINNU_DOMAINS.flatMap(domain => domain.pathways).filter(isPathwayAvailable);
assert(new Set(ready.map(path => path.interactiveTrackId)).size === ready.length, 'Available courses cannot alias the same lessons under different titles.');
assert(getReadyPathwayForTrack('smart-money').id === 'biz-capital', 'Investing must open Investing, not the first Business course.');
assert(getDomainForTrackId('smart-money').id === 'investing', 'Smart Money must resolve to the Investing domain.');
assert(LAUNCH_DOMAIN_IDS.join('|') === 'investing|technology|psychology', 'Discover must focus the launch on Investing, AI, and Psychology.');
assert(isPathwayAvailable(KINNU_DOMAINS.find(domain => domain.id === 'psychology')!.pathways.find(path => path.id === 'psych-biases')!), 'Psychology must have a real launch pathway.');
assert(!isPathwayAvailable(KINNU_DOMAINS.find(domain => domain.id === 'philosophy')!.pathways.find(path => path.id === 'phil-stoicism')!), 'Stoicism cannot masquerade as the launch Psychology path.');
assert(getDomainForTrackId('mindset-stoic').id === 'psychology', 'The legacy mindset track must resolve to Psychology for compatibility.');
const psychologyTrack = INTERACTIVE_TRACKS.find(track => track.id === 'mindset-stoic')!;
assert(psychologyTrack.title.en === 'Psychology & Decisions', 'The Psychology pathway needs honest user-facing positioning.');
assert(psychologyTrack.lessons.every(lesson => !/stoic|stoicism|predator|founder|hustle|amor fati|citadel/i.test(JSON.stringify({
  title: lesson.title,
  objective: lesson.objective,
  keyConcept: lesson.keyConcept,
  phases: lesson.phases,
  learningDesign: lesson.learningDesign,
}))), 'Psychology lesson copy cannot retain legacy positioning.');
for (const path of ready) {
  const track = INTERACTIVE_TRACKS.find(track => track.id === path.interactiveTrackId)!;
  assert(track.lessons.every(lesson => FIELD_MISSION_CATALOG[lesson.id]?.lessonXP === lesson.phases[3].xp), `${path.id} needs matching backend rewards for every Apply mission.`);
}
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
assert(engines.size >= 15, 'Keep the original purpose-built micro-tools when extending the curriculum.');

const goldLesson = ALL_ATOMIC_LESSONS.find(lesson => lesson.id === 'learn-money-02');
assert(goldLesson, 'Investing Lesson 2 must remain available under its stable id.');
assert(goldLesson.learningDesign.goldStandard?.prediction.options.length === 2, 'Lesson 2 must capture a prediction before revealing the answer.');
assert(goldLesson.learningDesign.goldStandard.prediction.options.some(option => option.correct), 'Lesson 2 prediction needs a defined answer.');
assert(goldLesson.phases[1].challenge.kind === 'multiple_choice', 'Lesson 2 must test an investing decision, not ordering recall.');
assert(goldLesson.phases[2].widget.fields.some(field => field.id === 'reviewCadence'), 'Lesson 2 tool must save a deliberate review rule.');
assert(goldLesson.learningDesign.goldStandard.master.options.length >= 3, 'Lesson 2 Master must be a real retrieval decision.');
assert(goldLesson.learningDesign.goldStandard.outcome.en.includes('time and consistency'), 'Lesson 2 final reward must lead with the learned outcome.');
const earlyPlan = calculateCompoundProjection(100, 20, 8);
const latePlan = calculateCompoundProjection(200, 8, 8);
assert(earlyPlan.finalValue > latePlan.finalValue, 'The committed prediction must match the simulator math.');
assert(Math.round(earlyPlan.contributed + earlyPlan.growth) === Math.round(earlyPlan.finalValue), 'The tool must distinguish contributions from estimated growth.');

const learnedOrbState = {
  ...DEFAULT_BRAIN_STATE,
  missionHistory: [{ missionId: 'learn-money-01', competency: 'investing' as const, difficulty: 'easy' as const, completed: true, score: 100, timestamp: Date.now() - 86_400_000 }],
  fsrsCards: {},
};
const reviewedOrbState = processMissionReview(learnedOrbState, 'learn-money-01', 100);
assert(Boolean(reviewedOrbState.fsrsCards['learn-money-01']), 'Smart Review must schedule a memory card for an interactive Orb.');
assert(reviewedOrbState.missionHistory.length === learnedOrbState.missionHistory.length, 'Smart Review must not replay mission history or completion rewards.');

console.log(`Interactive curriculum verified: ${INTERACTIVE_TRACKS.length} tracks, ${ALL_ATOMIC_LESSONS.length} lessons, ${engines.size} tools.`);
