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

export interface MicroLessonCard {
  id: string;
  type: 'concept' | 'diagram' | 'dilemma' | 'recall';
  title: string;
  subtitle?: string;
  content: string;
  highlight?: string;
  tags?: string[];
  visual?: {
    type: 'metric' | 'comparison' | 'formula' | 'checklist';
    items?: { label: string; value: string; desc?: string; positive?: boolean }[];
    equation?: { left: string; operator: string; right: string; result: string };
  };
  options?: QuizOption[];
  feedback?: { correct: string; incorrect: string };
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
  verificationMethod?: 'photo' | 'link' | 'honor_system' | 'paper_trade';
  verificationTier?: 1 | 2; // NEW: 1 = Verified (Leaderboard XP), 2 = Self-Reported (Personal XP only)
  reflectionPrompt?: string; // NEW: Structured reflection for Tier 2
  minReflectionLength?: number; // NEW: Validation for Tier 2 reflection
  minTimeMinutes?: number; // NEW: Validation for minimum time spent
  requiredTrades?: number;
  xpReward: number;
  microCards?: MicroLessonCard[];
}

/**
 * Builds a structured Kinnu-style 4-card sequence from any BankMission.
 */
export function getMissionMicroCards(mission: BankMission): MicroLessonCard[] {
  if (mission.microCards?.length) return mission.microCards;

  const concept = mission.concept || 'Master the core foundational principle.';
  const takeaway = mission.keyTakeaway || 'Apply this model in your next business decision.';
  const question = mission.recallQuestion || mission.scenario || 'What is the core strategic takeaway?';
  const options = mission.recallOptions || mission.options || [
    { text: takeaway, correct: true },
    { text: 'Short-term outcomes always justify improper risk.', correct: false },
    { text: 'More complexity is always better than execution.', correct: false }
  ];

  return [
    {
      id: `${mission.id}-card-1`,
      type: 'concept',
      title: mission.title,
      subtitle: 'MODELO MENTAL',
      content: concept,
      highlight: takeaway,
      tags: [mission.competency.toUpperCase(), `${mission.xpReward} XP`]
    },
    {
      id: `${mission.id}-card-2`,
      type: 'diagram',
      title: 'Desglose Táctico',
      subtitle: 'FRAMEWORK VISUAL',
      content: takeaway,
      visual: {
        type: 'metric',
        items: [
          { label: 'Impacto', value: '+35%', desc: 'Claridad en toma de decisiones', positive: true },
          { label: 'Riesgo', value: '-60%', desc: 'Reducción de errores impulsivos', positive: true }
        ]
      }
    },
    {
      id: `${mission.id}-card-3`,
      type: 'dilemma',
      title: 'Simulación de Caso Real',
      subtitle: 'DECISIÓN EN ALTO RIESGO',
      content: mission.scenario || `Estás evaluando una oportunidad en ${mission.competency}. Un socio te propone una táctica rápida pero con fundamentos dudosos.`,
      highlight: '¿Cuál es la decisión táctica correcta?'
    },
    {
      id: `${mission.id}-card-4`,
      type: 'recall',
      title: 'Active Recall Check',
      subtitle: 'COMPROBACIÓN DE RETENCIÓN',
      content: question,
      options,
      feedback: {
        correct: mission.recallExplanation || '¡Exacto! Tienes el criterio blindado.',
        incorrect: mission.failureCritique || 'Recuerda: la base siempre es la consistencia y la evidencia.'
      }
    }
  ];
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
  { id: 'inv-m1-l1', nodeType: 'learn', competency: 'investing', difficulty: 'easy', type: 'book_lesson', contentType: 'article', title: 'Assets vs Liabilities', concept: 'A balance sheet is a snapshot: assets are resources with value, liabilities are obligations, and the difference is equity or net worth.', keyTakeaway: 'Net worth is assets minus liabilities; classify each item before judging financial health.', recallQuestion: 'Which equation correctly describes net worth?', recallOptions: [{ text: 'Assets minus liabilities', correct: true }, { text: 'Income minus spending', correct: false }, { text: 'Cash plus debt', correct: false }], recallExplanation: 'Assets minus liabilities gives the residual value attributable to the owner.', sources: [{ type: 'article', title: "Beginners’ Guide to Financial Statements", author: 'U.S. Securities and Exchange Commission', url: 'https://www.sec.gov/about/reports-publications/beginners-guide-financial-statements' }], xpReward: 100 },
  { id: 'inv-m1-l2', nodeType: 'learn', competency: 'investing', difficulty: 'medium', type: 'book_lesson', contentType: 'article', title: 'Time Value of Money & Cash Flow', concept: 'Money available today can be invested and may compound. Future-value estimates depend on time, recurring contributions, and an assumed return—not a guaranteed rate.', keyTakeaway: 'Start with a goal and time horizon, then test conservative assumptions.', sources: [{ type: 'article', title: 'Introduction to Investing', author: 'Investor.gov', url: 'https://www.investor.gov/introduction-investing' }], xpReward: 100 },
  { id: 'inv-m1-apply', nodeType: 'apply', competency: 'investing', difficulty: 'medium', type: 'real_world_task', title: 'Calculate your net worth', taskBrief: 'Calculate your current net worth and document the assumptions behind the number.', verificationMethod: 'honor_system', verificationTier: 2, reflectionPrompt: 'List your asset total, liability total, resulting net worth, and one assumption you need to verify.', minReflectionLength: 80, xpReward: 220, frameworkSteps: [ { title: 'Total assets', desc: 'Add cash, investments, and conservative estimates for property.' }, { title: 'Total liabilities', desc: 'Add credit cards, loans, and other obligations.' }, { title: 'Document the result', desc: 'Subtract liabilities and note one uncertainty in your calculation.' } ] },
  
  // MODULE 2: THE PSYCHOLOGY OF WEALTH
  { id: 'inv-m2-l1', nodeType: 'learn', competency: 'mindset', difficulty: 'medium', type: 'book_lesson', contentType: 'article', title: 'Risk Tolerance & Emotions', concept: 'Risk tolerance combines your willingness and financial ability to accept loss. Your goal and time horizon should constrain the risk you take, even when confidence is high.', keyTakeaway: 'Define an acceptable loss before selecting an investment.', sources: [{ type: 'article', title: 'Know Your Risk Tolerance', author: 'FINRA', url: 'https://www.finra.org/investors/insights/know-your-risk-tolerance' }], xpReward: 100 },
  { id: 'inv-m2-l2', nodeType: 'learn', competency: 'mindset', difficulty: 'medium', type: 'book_lesson', contentType: 'article', title: 'The Power of Compound Growth', concept: 'Compound growth means earning a return on both contributions and earlier returns. Starting sooner increases the number of compounding periods, but actual investment returns remain uncertain.', keyTakeaway: 'Time and recurring contributions are controllable; market returns are not.', sources: [{ type: 'article', title: 'Introduction to Investing · Compound Growth', author: 'Investor.gov', url: 'https://www.investor.gov/introduction-investing' }], xpReward: 100 },
  { id: 'inv-m2-apply', nodeType: 'apply', competency: 'mindset', difficulty: 'hard', type: 'real_world_task', title: 'THE EMOTION OF LOSS', taskBrief: 'Write down the worst financial decision you ever made and identify the emotion that drove it.', verificationMethod: 'honor_system', verificationTier: 2, reflectionPrompt: 'Describe the emotion that drove your worst financial decision, and what specific trigger caused it. How will you recognize it next time?', minReflectionLength: 60, minTimeMinutes: 2, xpReward: 500, frameworkSteps: [ { title: 'Identify', desc: 'Think of the specific decision.' }, { title: 'Analyze', desc: 'Was it fear of missing out (FOMO)? Panic? Greed?' }, { title: 'Document', desc: 'Write it down so you recognize it next time.' } ] },
  
  // MODULE 3: ASSET CLASSES & VEHICLES
  { id: 'inv-m3-l1', nodeType: 'learn', competency: 'investing', difficulty: 'medium', type: 'book_lesson', contentType: 'article', title: 'Equities & Index Funds', concept: 'A stock represents ownership in one company. A broad index fund seeks to track a basket of securities, reducing dependence on any one company without eliminating market risk.', keyTakeaway: 'Diversification reduces concentration risk; it does not guarantee against loss.', sources: [{ type: 'article', title: 'Introduction to Investing · Diversification', author: 'Investor.gov', url: 'https://www.investor.gov/introduction-investing' }], xpReward: 100 },
  { id: 'inv-m3-l2', nodeType: 'learn', competency: 'investing', difficulty: 'medium', type: 'book_lesson', contentType: 'article', title: 'Bonds, Cash & Real Assets', concept: 'Different asset classes respond differently to growth, inflation, and interest rates. Allocation is the choice of how much portfolio risk each class carries.', keyTakeaway: 'Choose an allocation from your horizon and risk capacity, then diversify within it.', sources: [{ type: 'article', title: 'Asset Allocation and Diversification', author: 'FINRA', url: 'https://www.finra.org/investors/investing/investing-basics/asset-allocation-diversification' }], xpReward: 100 },
  { id: 'inv-m3-apply', nodeType: 'apply', competency: 'investing', difficulty: 'hard', type: 'real_world_task', title: 'Place your first paper trade', taskBrief: 'Use the T1GER paper portfolio to place a simulated trade and record your reason.', verificationMethod: 'paper_trade', verificationTier: 1, requiredTrades: 1, xpReward: 300, frameworkSteps: [ { title: 'Choose an asset', desc: 'Select a diversified fund or company you understand.' }, { title: 'Set a position size', desc: 'Keep the simulated position below 25% of the portfolio.' }, { title: 'Record your thesis', desc: 'Write the reason you would own it before submitting the trade.' } ] },
  
  // MODULE 4: ANALYSIS & SELECTION
  { id: 'inv-m4-l1', nodeType: 'learn', competency: 'investing', difficulty: 'hard', type: 'book_lesson', contentType: 'article', title: 'Reading a Balance Sheet', concept: 'The balance sheet shows assets, liabilities, and shareholders’ equity at a point in time. Compare current assets with near-term obligations and examine how debt changes across periods.', keyTakeaway: 'A balance sheet is a snapshot; combine it with income and cash-flow statements.', sources: [{ type: 'article', title: "Beginners’ Guide to Financial Statements", author: 'U.S. Securities and Exchange Commission', url: 'https://www.sec.gov/about/reports-publications/beginners-guide-financial-statements' }], xpReward: 100 },
  { id: 'inv-m4-l2', nodeType: 'learn', competency: 'investing', difficulty: 'hard', type: 'book_lesson', contentType: 'article', title: 'Moats, Margins & Valuation', concept: 'A durable advantage can support future cash flows, but valuation determines what you pay for those expectations. P/E compares price per share with earnings per share and must be interpreted in context.', keyTakeaway: 'Business quality and purchase price are separate questions.', sources: [{ type: 'article', title: 'How to Read a 10-K', author: 'Investor.gov', url: 'https://www.investor.gov/introduction-investing/getting-started/researching-investments/how-read-10-k' }], xpReward: 100 },
  { id: 'inv-m4-apply', nodeType: 'apply', competency: 'investing', difficulty: 'hard', type: 'real_world_task', title: 'Analyze a real company', taskBrief: 'Choose a public company and find its latest reported net profit margin.', verificationMethod: 'link', verificationTier: 2, reflectionPrompt: 'Paste the investor-relations source URL, state the reporting period and margin, then explain in one sentence what the number means.', minReflectionLength: 100, xpReward: 260, frameworkSteps: [ { title: 'Choose', desc: 'Pick a listed company whose business you understand.' }, { title: 'Use a primary source', desc: 'Open the latest earnings release or annual report.' }, { title: 'Interpret', desc: 'Record the period, margin, source, and what changed.' } ] },
  
  // MODULE 5: PORTFOLIO CONSTRUCTION
  { id: 'inv-m5-l1', nodeType: 'learn', competency: 'investing', difficulty: 'hard', type: 'book_lesson', contentType: 'article', title: 'Diversification & Rebalancing', concept: 'Market movement changes portfolio weights over time. Rebalancing returns the portfolio to its intended allocation, usually on a schedule or when weights cross defined bands.', keyTakeaway: 'Write the rebalancing rule before market emotion tests it.', sources: [{ type: 'article', title: 'Asset Allocation and Diversification', author: 'FINRA', url: 'https://www.finra.org/investors/investing/investing-basics/asset-allocation-diversification' }], xpReward: 100 },
  { id: 'inv-m5-l2', nodeType: 'learn', competency: 'investing', difficulty: 'hard', type: 'book_lesson', contentType: 'article', title: 'Tax-Advantaged Accounts', concept: 'Account type affects when contributions, growth, and withdrawals may be taxed. Eligibility and contribution limits change, so decisions should use current official guidance.', keyTakeaway: 'Choose the account before the investment, and verify current rules.', sources: [{ type: 'article', title: 'Types of Retirement Plans', author: 'Internal Revenue Service', url: 'https://www.irs.gov/retirement-plans/plan-sponsor/types-of-retirement-plans' }], xpReward: 100 },
  { id: 'inv-m5-apply', nodeType: 'apply', competency: 'investing', difficulty: 'hard', type: 'real_world_task', title: 'Build a three-fund portfolio', taskBrief: 'Create a diversified three-fund portfolio with simulated money inside T1GER.', verificationMethod: 'paper_trade', verificationTier: 1, requiredTrades: 3, xpReward: 400, frameworkSteps: [ { title: 'Set the allocation', desc: 'Choose US equity, international equity, and bond weights.' }, { title: 'Execute three trades', desc: 'Place one simulated trade for each portfolio sleeve.' }, { title: 'Review concentration', desc: 'Confirm no single position exceeds the position-size limit.' } ] }
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
