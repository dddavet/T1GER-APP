import {
  buildRescueProtocolSelection,
  type TacticalTask,
} from './brainService';

function expectEqual<T>(actual: T, expected: T, label: string) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label}\nExpected: ${expectedJson}\nActual:   ${actualJson}`);
  }
}

const workTasks: TacticalTask[] = [
  { id: 'w-alpha', label: 'Ship one thing', type: 'work', icon: 'Code' },
  { id: 'w-beta', label: 'Review metrics', type: 'work', icon: 'BarChart3' },
];

const lessonTasks: TacticalTask[] = [
  { id: 'l-alpha', label: 'Study one concept', type: 'lesson', icon: 'Book' },
  { id: 'l-beta', label: 'Market research', type: 'lesson', icon: 'Brain' },
];

expectEqual(
  buildRescueProtocolSelection({
    availableHabitIds: ['sh2', 'sh4'],
    workTasks,
    lessonTasks,
  }),
  {
    dayType: 'rest',
    habitIds: ['sh2'],
    workIds: ['w-alpha'],
    lessonIds: ['l-alpha'],
  },
  'Rescue Protocol should select one task per available pillar'
);

expectEqual(
  buildRescueProtocolSelection({
    availableHabitIds: [],
    workTasks: [],
    lessonTasks: [],
  }),
  {
    dayType: 'rest',
    habitIds: [],
    workIds: [],
    lessonIds: [],
  },
  'Rescue Protocol should not invent missing task ids'
);

console.log('Rescue Protocol selection tests passed');
