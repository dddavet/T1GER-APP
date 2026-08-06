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
  applyNodeId?: string; // The mandatory real-world task to unlock the next level
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
  nodeType?: 'learn' | 'apply'; // NEW: Distinguishes between theory and practice
  competency: Competency;
  difficulty: Difficulty;
  type: MissionType;
  contentType?: 'video' | 'article' | 'book_extract';
  title: string;
  sources?: LearningSource[];
  concept?: string;
  keyTakeaway?: string;          
  quote?: { text: string; author: string; context: string };
  videoUrl?: string;
  reading?: { title?: string; subtitle: string; paragraphs: string[]; takeaway: string };
  bookExtract?: { bookTitle: string; author: string; excerpt: string; keyFramework: string };
  recallQuestion?: string;       
  recallOptions?: QuizOption[];  
  recallExplanation?: string;    
  scenario?: string;
  options?: QuizOption[];
  failureCritique?: string;
  taskBrief?: string;
  frameworkSteps?: { title: string; desc: string }[];
  verificationMethod?: 'photo' | 'link' | 'honor_system';
  verificationTier?: 1 | 2; // NEW: 1 = Verified (Leaderboard XP), 2 = Self-Reported (Personal XP only)
  reflectionPrompt?: string; // NEW: Structured reflection for Tier 2
  minReflectionLength?: number; // NEW: Validation for Tier 2 reflection
  minTimeMinutes?: number; // NEW: Validation for minimum time spent
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
  xpReward: 60
});

const investingMissions: BankMission[] = [
  // MODULE 1: FOUNDATIONS OF VALUE
  { id: 'inv-m1-l1', nodeType: 'learn', competency: 'investing', difficulty: 'easy', type: 'book_lesson', contentType: 'book_extract', title: 'Assets vs Liabilities', concept: 'An asset puts money in your pocket. A liability takes money out.', keyTakeaway: 'Buy assets, not liabilities.', xpReward: 100 },
  { id: 'inv-m1-l2', nodeType: 'learn', competency: 'investing', difficulty: 'medium', type: 'book_lesson', contentType: 'article', title: 'Time Value of Money & Cash Flow', concept: 'A dollar today is worth more than a dollar tomorrow.', keyTakeaway: 'Cash flow is the lifeblood of wealth.', xpReward: 100 },
  { id: 'inv-m1-apply', nodeType: 'apply', competency: 'investing', difficulty: 'medium', type: 'real_world_task', title: 'CALCULATE YOUR NET WORTH', taskBrief: 'Calculate your exact net worth today and write it down.', verificationMethod: 'honor_system', verificationTier: 1, xpReward: 500, frameworkSteps: [ { title: 'Assets', desc: 'Sum up everything you own (cash, investments, property).' }, { title: 'Liabilities', desc: 'Sum up everything you owe (debt, loans, mortgages).' }, { title: 'Net Worth', desc: 'Subtract liabilities from assets. Write the number down.' } ] },
  
  // MODULE 2: THE PSYCHOLOGY OF WEALTH
  { id: 'inv-m2-l1', nodeType: 'learn', competency: 'mindset', difficulty: 'medium', type: 'book_lesson', contentType: 'book_extract', title: 'Risk Tolerance & Emotions', concept: 'Investing is 10% math and 90% psychology.', keyTakeaway: 'Do not let market volatility control your actions.', xpReward: 100 },
  { id: 'inv-m2-l2', nodeType: 'learn', competency: 'mindset', difficulty: 'medium', type: 'book_lesson', contentType: 'video', title: 'The Power of Compound Interest', concept: 'Compound interest is the 8th wonder of the world.', keyTakeaway: 'Start early, let time do the heavy lifting.', xpReward: 100 },
  { id: 'inv-m2-apply', nodeType: 'apply', competency: 'mindset', difficulty: 'hard', type: 'real_world_task', title: 'THE EMOTION OF LOSS', taskBrief: 'Write down the worst financial decision you ever made and identify the emotion that drove it.', verificationMethod: 'honor_system', verificationTier: 2, reflectionPrompt: 'Describe the emotion that drove your worst financial decision, and what specific trigger caused it. How will you recognize it next time?', minReflectionLength: 60, minTimeMinutes: 2, xpReward: 500, frameworkSteps: [ { title: 'Identify', desc: 'Think of the specific decision.' }, { title: 'Analyze', desc: 'Was it fear of missing out (FOMO)? Panic? Greed?' }, { title: 'Document', desc: 'Write it down so you recognize it next time.' } ] },
  
  // MODULE 3: ASSET CLASSES & VEHICLES
  { id: 'inv-m3-l1', nodeType: 'learn', competency: 'investing', difficulty: 'medium', type: 'book_lesson', contentType: 'article', title: 'Equities & Index Funds', concept: 'Owning a piece of businesses vs owning all the businesses.', keyTakeaway: 'Index funds offer low-cost, high-probability growth.', xpReward: 100 },
  { id: 'inv-m3-l2', nodeType: 'learn', competency: 'investing', difficulty: 'medium', type: 'book_lesson', contentType: 'article', title: 'Bonds & Real Estate', concept: 'Preserving capital and generating rental yield.', keyTakeaway: 'Diversify across non-correlated asset classes.', xpReward: 100 },
  { id: 'inv-m3-apply', nodeType: 'apply', competency: 'investing', difficulty: 'hard', type: 'real_world_task', title: 'ENTER THE ARENA', taskBrief: 'Open a paper trading account on ThinkOrSwim, Webull, or similar.', verificationMethod: 'honor_system', verificationTier: 1, xpReward: 500, frameworkSteps: [ { title: 'Choose Broker', desc: 'Find a broker that offers paper/demo trading.' }, { title: 'Open Account', desc: 'Register and set up your demo environment.' }, { title: 'Fund Demo', desc: 'Ensure you have simulated funds ready to deploy.' } ] },
  
  // MODULE 4: ANALYSIS & SELECTION
  { id: 'inv-m4-l1', nodeType: 'learn', competency: 'investing', difficulty: 'hard', type: 'book_lesson', contentType: 'book_extract', title: 'Reading a Balance Sheet', concept: 'Understanding the financial health of a company.', keyTakeaway: 'Never invest in a business whose numbers you don\'t understand.', xpReward: 100 },
  { id: 'inv-m4-l2', nodeType: 'learn', competency: 'investing', difficulty: 'hard', type: 'book_lesson', contentType: 'article', title: 'Moats & P/E Ratios', concept: 'Competitive advantages and valuation metrics.', keyTakeaway: 'A great company at a terrible price is a bad investment.', xpReward: 100 },
  { id: 'inv-m4-apply', nodeType: 'apply', competency: 'investing', difficulty: 'hard', type: 'real_world_task', title: 'REAL WORLD ANALYSIS', taskBrief: 'Pick one company you use every day and find their profit margin.', verificationMethod: 'honor_system', verificationTier: 1, xpReward: 500, frameworkSteps: [ { title: 'Select', desc: 'Pick a publicly traded company (e.g. Apple, Netflix).' }, { title: 'Research', desc: 'Go to Yahoo Finance or their investor relations page.' }, { title: 'Extract', desc: 'Find their net profit margin for the latest quarter.' } ] },
  
  // MODULE 5: PORTFOLIO CONSTRUCTION
  { id: 'inv-m5-l1', nodeType: 'learn', competency: 'investing', difficulty: 'hard', type: 'book_lesson', contentType: 'article', title: 'Diversification & Rebalancing', concept: 'Managing risk through asset allocation.', keyTakeaway: 'Rebalance to maintain your target risk profile.', xpReward: 100 },
  { id: 'inv-m5-l2', nodeType: 'learn', competency: 'investing', difficulty: 'hard', type: 'book_lesson', contentType: 'article', title: 'Tax-Advantaged Accounts', concept: '401ks, IRAs, and tax-free growth.', keyTakeaway: 'Optimize for net returns after taxes.', xpReward: 100 },
  { id: 'inv-m5-apply', nodeType: 'apply', competency: 'investing', difficulty: 'hard', type: 'real_world_task', title: 'THE BOGLEHEAD BUILD', taskBrief: 'Create a 3-fund Boglehead portfolio using fake money.', verificationMethod: 'honor_system', verificationTier: 1, xpReward: 500, frameworkSteps: [ { title: 'Allocate', desc: 'Decide on your US, International, and Bond allocation.' }, { title: 'Execute', desc: 'Place the simulated trades in your paper account.' }, { title: 'Hold', desc: 'Commit to holding this allocation without touching it.' } ] }
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
        levelId: 'inv-level-1', levelNumber: 1, title: 'FOUNDATIONS OF VALUE', subtitle: 'Assets, Liabilities & Cash Flow',
        applyNodeId: 'inv-m1-apply',
        days: [
          { dayId: 'inv-1-d1', dayNumber: 1, missionIds: ['inv-m1-l1'] },
          { dayId: 'inv-1-d2', dayNumber: 2, missionIds: ['inv-m1-l2'] },
        ]
      },
      {
        levelId: 'inv-level-2', levelNumber: 2, title: 'THE PSYCHOLOGY OF WEALTH', subtitle: 'Risk, emotion & compound interest',
        applyNodeId: 'inv-m2-apply',
        days: [
          { dayId: 'inv-2-d1', dayNumber: 3, missionIds: ['inv-m2-l1'] },
          { dayId: 'inv-2-d2', dayNumber: 4, missionIds: ['inv-m2-l2'] },
        ]
      },
      {
        levelId: 'inv-level-3', levelNumber: 3, title: 'ASSET CLASSES & VEHICLES', subtitle: 'Equities, bonds, real estate',
        applyNodeId: 'inv-m3-apply',
        days: [
          { dayId: 'inv-3-d1', dayNumber: 5, missionIds: ['inv-m3-l1'] },
          { dayId: 'inv-3-d2', dayNumber: 6, missionIds: ['inv-m3-l2'] },
        ]
      },
      {
        levelId: 'inv-level-4', levelNumber: 4, title: 'ANALYSIS & SELECTION', subtitle: 'Balance sheets, moats, valuation',
        applyNodeId: 'inv-m4-apply',
        days: [
          { dayId: 'inv-4-d1', dayNumber: 7, missionIds: ['inv-m4-l1'] },
          { dayId: 'inv-4-d2', dayNumber: 8, missionIds: ['inv-m4-l2'] },
        ]
      },
      {
        levelId: 'inv-level-5', levelNumber: 5, title: 'PORTFOLIO CONSTRUCTION', subtitle: 'Diversification & taxes',
        applyNodeId: 'inv-m5-apply',
        days: [
          { dayId: 'inv-5-d1', dayNumber: 9, missionIds: ['inv-m5-l1'] },
          { dayId: 'inv-5-d2', dayNumber: 10, missionIds: ['inv-m5-l2'] },
        ]
      }
    ]
  },
  business: {
    trackId: 'business',
    title: 'BUSINESS & ENTREPRENEURSHIP',
    levels: []
  },
  ai: {
    trackId: 'ai',
    title: 'ARTIFICIAL INTELLIGENCE',
    levels: []
  }
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
  { id: 'sh9', label: '20 Outbound B2B Touchpoints', icon: 'Send', category: 'business' },
  { id: 'sh10', label: 'Update CRM Pipeline', icon: 'BarChart2', category: 'business' },
  { id: 'sh6', label: 'Read 10 pages', icon: 'Book', category: 'wellness' },
  { id: 'sh7', label: 'No Sugar Day', icon: 'Zap', category: 'wellness' },
  { id: 'sh8', label: 'Plan Tomorrow', icon: 'Target', category: 'business' },
];

export const ALL_COMPETENCIES: Competency[] = ['offer', 'sales', 'marketing', 'mindset', 'operations', 'investing', 'accounting', 'ai'];
