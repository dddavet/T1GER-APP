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
  recallQuestion: `What is the core takeaway of ${title}?`,
  recallOptions: [
    { text: keyTakeaway, correct: true },
    { text: "The opposite of the takeaway.", correct: false },
    { text: "It depends on the market.", correct: false },
  ],
  recallExplanation: concept,
  xpReward: 60
});

const investingMissions: BankMission[] = [
  // --- LEVEL 1: FOUNDATIONS (10 Lessons) ---
  createInformationalLesson('inv-1-1', 'ASSETS VS LIABILITIES', 'An asset puts money in your pocket. A liability takes money out.', 'Rich people acquire assets. The poor and middle class acquire liabilities.'),
  createInformationalLesson('inv-1-2', 'MAGIC OF COMPOUNDING', 'Compound interest is the addition of interest to the principal sum.', 'Time is the most powerful force in finance. Start early.'),
  createInformationalLesson('inv-1-3', 'MARGIN OF SAFETY', 'Buying an asset significantly below its intrinsic value.', 'Always leave room for error in your valuation estimates.'),
  createInformationalLesson('inv-1-4', 'INDEX FUNDS VS ACTIVE', 'Index funds beat most active managers due to lower fees.', 'Don\'t look for the needle in the haystack. Buy the haystack.'),
  createInformationalLesson('inv-1-5', 'THE VALUE OF MONEY', 'Fiat currency loses value over time; wealth must be stored in productive assets.', 'Cash is a poor long-term store of value.'),
  createInformationalLesson('inv-1-6', 'INFLATION THE SILENT KILLER', 'Inflation eroded purchasing power quietly every year.', 'Your investments must yield more than the inflation rate just to break even.'),
  createInformationalLesson('inv-1-7', 'UNDERSTANDING INTEREST RATES', 'Interest is the cost of borrowing money. It acts as gravity on asset prices.', 'When interest rates rise, asset valuations typically fall.'),
  createInformationalLesson('inv-1-8', 'STOCKS VS BONDS', 'Stocks are ownership equity; bonds are debt loans.', 'Bonds offer fixed returns with lower risk; stocks offer variable returns with higher upside.'),
  createInformationalLesson('inv-1-9', 'WHAT IS A DIVIDEND?', 'A dividend is a portion of a company\'s profit paid out to shareholders.', 'Reinvesting dividends is the key engine of compounding growth.'),
  createInformationalLesson('inv-1-10', 'THE RULE OF 72', 'Divide 72 by your annual return to see how many years it takes to double your money.', 'At a 10% return, your money doubles every 7.2 years.'),

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
