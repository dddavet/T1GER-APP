export type Competency = 'offer' | 'sales' | 'marketing' | 'mindset' | 'operations' | 'investing' | 'accounting' | 'ai';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type MissionType = 'flashcard' | 'scenario_quiz' | 'real_world_task';

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
  xpReward: number;
}

const investingMissions: BankMission[] = [
  // --- LEVEL 1: FOUNDATIONS ---
  {
    id: 'inv-e1', competency: 'investing', difficulty: 'easy', type: 'flashcard',
    title: 'THE POWER OF COMPOUND INTEREST',
    concept: 'Compound interest is the 8th wonder of the world. It is the result of reinvesting interest, rather than paying it out, so that interest in the next period is then earned on the principal sum plus previously accumulated interest.',
    keyTakeaway: 'Start early. Time in the market beats timing the market.',
    recallQuestion: 'What is the primary engine of long-term wealth in the stock market?',
    recallOptions: [
      { text: 'Picking the right individual stocks', correct: false },
      { text: 'Compound interest over a long period of time', correct: true },
      { text: 'Timing market crashes perfectly', correct: false },
    ],
    recallExplanation: 'Consistent compounding over decades is mathematically the most reliable way to build wealth. Picking stocks and timing the market are notoriously difficult and unreliable.',
    sources: [
      { type: 'video', title: 'How To Invest For Beginners (2024)', author: 'Humphrey Yang', url: 'https://www.youtube.com/embed/ZWGdE-ZqO-c' },
      { type: 'book', title: 'The Psychology of Money', author: 'Morgan Housel' }
    ],
    xpReward: 50,
  },
  {
    id: 'inv-e2', competency: 'investing', difficulty: 'easy', type: 'flashcard',
    title: 'ASSETS VS LIABILITIES',
    concept: 'An asset puts money in your pocket. A liability takes money out of your pocket. Wealth is built by acquiring income-producing assets, not by buying expensive liabilities on credit.',
    keyTakeaway: 'Rich people acquire assets. The poor and middle class acquire liabilities they think are assets.',
    recallQuestion: 'According to foundational investing principles, what defines a true asset?',
    recallOptions: [
      { text: 'Anything that has a high price tag', correct: false },
      { text: 'Something that consistently puts money in your pocket', correct: true },
      { text: 'Your primary residence (always)', correct: false },
    ],
    recallExplanation: 'A true asset generates cash flow or appreciates over time. A car, for example, is generally a liability because it depreciates and costs money to maintain.',
    sources: [
      { type: 'book', title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki' },
      { type: 'video', title: 'Assets vs Liabilities Explained', author: 'Nischa', url: 'https://www.youtube.com/embed/3eB9u-L_ZkQ' }
    ],
    xpReward: 50,
  },
  {
    id: 'inv-e3', competency: 'investing', difficulty: 'easy', type: 'scenario_quiz',
    title: 'THE INDEX FUND ADVANTAGE',
    scenario: 'You have $5,000 to invest. Your friend suggests buying shares in a hot new tech startup. Your other friend suggests buying an S&P 500 Index Fund (like VOO or SPY). What is the smartest move for a beginner?',
    options: [
      { text: 'Buy the tech startup for massive potential gains', correct: false },
      { text: 'Buy the Index Fund for instant diversification and lower risk', correct: true },
      { text: 'Keep the money in a checking account', correct: false },
    ],
    failureCritique: 'Chasing hot stocks is gambling, not investing. Index funds provide broad market exposure, significantly reducing your risk while capturing the market\'s average return.',
    sources: [
      { type: 'book', title: 'The Little Book of Common Sense Investing', author: 'John Bogle' },
      { type: 'video', title: 'Index Funds vs Mutual Funds', author: 'Ben Felix', url: 'https://www.youtube.com/embed/fvOO8_WjR6w' }
    ],
    xpReward: 50,
  },
  {
    id: 'inv-e4', competency: 'investing', difficulty: 'easy', type: 'flashcard',
    title: 'INFLATION THE SILENT KILLER',
    concept: 'Inflation is the rate at which the general level of prices for goods and services is rising. If your money is sitting in a 0% interest checking account, it is losing purchasing power every single day.',
    keyTakeaway: 'Investing is not just to get rich; it is to prevent inflation from making you poor.',
    recallQuestion: 'If inflation is 3% and your bank pays 0.5% interest, what is happening to your money?',
    recallOptions: [
      { text: 'It is growing safely', correct: false },
      { text: 'It is losing 2.5% of its purchasing power annually', correct: true },
      { text: 'It is matching the market', correct: false },
    ],
    recallExplanation: 'Real return is your interest rate minus inflation. You must invest in assets that outpace inflation just to break even in purchasing power.',
    xpReward: 50,
  },
  
  // --- LEVEL 2: STRATEGY ---
  {
    id: 'inv-m1', competency: 'investing', difficulty: 'medium', type: 'flashcard',
    title: 'DOLLAR-COST AVERAGING (DCA)',
    concept: 'DCA is an investment strategy where you divide the total amount to be invested across periodic purchases in an effort to reduce the impact of volatility on the overall purchase. You buy regardless of the asset\'s price.',
    keyTakeaway: 'Automate your investing and ignore the daily news.',
    recallQuestion: 'What is the main psychological benefit of Dollar-Cost Averaging?',
    recallOptions: [
      { text: 'It guarantees the highest possible return', correct: false },
      { text: 'It removes the emotion of trying to time the market', correct: true },
      { text: 'It allows you to buy only when prices are lowest', correct: false },
    ],
    recallExplanation: 'By investing a set amount regularly (e.g., $100 every week), you buy more shares when prices are low and fewer when they are high, completely removing emotional guesswork.',
    sources: [
      { type: 'video', title: 'Dollar Cost Averaging Explained', author: 'Humphrey Yang', url: 'https://www.youtube.com/embed/V9OvtNlDiyc' }
    ],
    xpReward: 150,
  },
  {
    id: 'inv-m2', competency: 'investing', difficulty: 'medium', type: 'scenario_quiz',
    title: 'MARKET CRASH PSYCHOLOGY',
    scenario: 'The stock market just dropped 20% in two weeks due to global news. Your portfolio is bleeding red. What is your immediate action?',
    options: [
      { text: 'Sell everything to stop the bleeding and wait for recovery', correct: false },
      { text: 'Do nothing, stick to your DCA strategy, and perhaps buy more', correct: true },
      { text: 'Check your portfolio 10 times a day', correct: false },
    ],
    failureCritique: 'Selling during a crash means locking in your losses. Historically, the market always recovers. A crash is a sale on assets.',
    sources: [
      { type: 'book', title: 'The Psychology of Money', author: 'Morgan Housel' }
    ],
    xpReward: 150,
  },
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
        levelId: 'inv-level-1', levelNumber: 1, title: 'FOUNDATIONS', subtitle: 'Understand compounding, index funds, and assets',
        days: [
          { dayId: 'inv-d1', dayNumber: 1, missionIds: ['inv-e1', 'inv-e4'], actionItems: ['Open a Brokerage Account (e.g. Robinhood, Vanguard)'] },
          { dayId: 'inv-d2', dayNumber: 2, missionIds: ['inv-e2'], actionItems: ['Calculate your monthly income vs fixed expenses'] },
          { dayId: 'inv-d3', dayNumber: 3, missionIds: ['inv-e3'], actionItems: ['Set up an automatic monthly transfer to your broker'] },
        ]
      },
      {
        levelId: 'inv-level-2', levelNumber: 2, title: 'AUTOMATION', subtitle: 'Dollar-cost averaging and market psychology',
        days: [
          { dayId: 'inv-d4', dayNumber: 4, missionIds: ['inv-m1'], actionItems: ['Buy your first share of an S&P 500 Index Fund'] },
          { dayId: 'inv-d5', dayNumber: 5, missionIds: ['inv-m2'] },
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
