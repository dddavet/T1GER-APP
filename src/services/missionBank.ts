// ============================================================
// T1GER MISSION BANK
// ============================================================
// A curated library of ~50 missions across 5 competencies and
// 3 difficulty tiers. This is the "content database" the Brain
// draws from to build personalized learning sessions.
// ============================================================

export type Competency = 'offer' | 'sales' | 'marketing' | 'mindset' | 'operations' | 'investing' | 'accounting' | 'ai';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type MissionType = 'flashcard' | 'scenario_quiz' | 'real_world_task';

// --- NEW LINEAR TRACK DATA STRUCTURES ---
export type TrackType = 'apex';

export interface CurriculumDay {
  dayId: string;
  dayNumber: number;
  missionIds: string[]; // typically 1-3 missions per "day"
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

export interface BankMission {
  id: string;
  competency: Competency;
  difficulty: Difficulty;
  type: MissionType;
  title: string;
  // Flashcard
  concept?: string;
  keyTakeaway?: string;          // One-liner the user must remember
  recallQuestion?: string;       // Quiz question after learning
  recallOptions?: QuizOption[];  // Multiple choice for recall
  recallExplanation?: string;    // Why the right answer is right
  // Scenario quiz
  scenario?: string;
  options?: QuizOption[];
  failureCritique?: string;
  // Real-world task
  taskBrief?: string;
  // Universal
  xpReward: number;
}

// ============================================================
// OFFER DESIGN — How you package & price your transformation
// ============================================================
const offerMissions: BankMission[] = [
  // --- EASY ---
  {
    id: 'offer-e1', competency: 'offer', difficulty: 'easy', type: 'flashcard',
    title: 'THE GRAND SLAM OFFER',
    concept: 'A Grand Slam Offer is so good that people feel stupid saying no. It combines a dream outcome, high perceived likelihood of achievement, minimal time delay, and minimal effort/sacrifice.',
    keyTakeaway: 'Make them feel stupid saying no.',
    recallQuestion: 'What are the 4 components of a Grand Slam Offer?',
    recallOptions: [
      { text: 'Price, Features, Branding, Marketing', correct: false },
      { text: 'Dream Outcome, Perceived Likelihood, Time Delay, Effort/Sacrifice', correct: true },
      { text: 'Product, Place, Price, Promotion', correct: false },
    ],
    recallExplanation: 'The Grand Slam Offer formula: maximize Dream Outcome and Perceived Likelihood while minimizing Time Delay and Effort/Sacrifice. This is NOT the 4 Ps of marketing.',
    xpReward: 50,
  },
  {
    id: 'offer-e2', competency: 'offer', difficulty: 'easy', type: 'scenario_quiz',
    title: 'PRICE VS VALUE',
    scenario: 'Your coaching program costs $2,000 but a competitor offers "the same thing" for $500. A prospect asks why yours is 4x more expensive. What do you do?',
    options: [
      { text: 'Lower your price to match', correct: false },
      { text: 'Explain the transformation and unique bonuses they get', correct: true },
      { text: 'Ignore the question and move on', correct: false },
    ],
    failureCritique: 'You just told the market your offer isn\'t worth the price. Never compete on price — compete on value.',
    xpReward: 60,
  },
  {
    id: 'offer-e3', competency: 'offer', difficulty: 'easy', type: 'flashcard',
    title: 'VALUE EQUATION',
    concept: 'Value = (Dream Outcome × Perceived Likelihood) ÷ (Time Delay × Effort & Sacrifice). To increase value, increase the numerator or decrease the denominator. Most people only try to decrease price.',
    keyTakeaway: 'Increase value by changing four levers — not price.',
    recallQuestion: 'To increase perceived value WITHOUT lowering price, what should you do?',
    recallOptions: [
      { text: 'Add more features to the product', correct: false },
      { text: 'Reduce time delay or effort required for the customer', correct: true },
      { text: 'Spend more on advertising', correct: false },
    ],
    recallExplanation: 'Reducing the denominator (time delay + effort) directly increases value. Adding features only helps if they change perceived likelihood of success.',
    xpReward: 50,
  },
  // --- MEDIUM ---
  {
    id: 'offer-m1', competency: 'offer', difficulty: 'medium', type: 'scenario_quiz',
    title: 'BONUS STACKING',
    scenario: 'You\'re building bonuses for your $997 course. Which bonus strategy creates the most perceived value?',
    options: [
      { text: 'Add 10 random PDFs to inflate the bonus count', correct: false },
      { text: 'Add 3 bonuses that each solve a specific objection the buyer has', correct: true },
      { text: 'Don\'t offer bonuses — let the core product speak for itself', correct: false },
    ],
    failureCritique: 'Bonuses that don\'t address real objections are noise, not value. Every bonus must dissolve a specific reason someone would say no.',
    xpReward: 120,
  },
  {
    id: 'offer-m2', competency: 'offer', difficulty: 'medium', type: 'real_world_task',
    title: 'MAP YOUR VALUE EQUATION',
    taskBrief: 'Write down the 4 components of the Value Equation for YOUR current offer. Dream Outcome, Perceived Likelihood, Time Delay, Effort/Sacrifice. Rate each 1-10. Take a photo.',
    xpReward: 150,
  },
  {
    id: 'offer-m3', competency: 'offer', difficulty: 'medium', type: 'flashcard',
    title: 'SCARCITY & URGENCY',
    concept: 'Real scarcity creates genuine urgency. Limit your cohort size, your bonuses, or your pricing window — but only if the limit is REAL. Fake scarcity destroys trust permanently.',
    keyTakeaway: 'Scarcity must be real or it destroys trust.',
    recallQuestion: 'What happens when you use fake scarcity (e.g., "only 3 spots left" when there are unlimited)?',
    recallOptions: [
      { text: 'It works great for increasing urgency short-term', correct: false },
      { text: 'It destroys trust permanently when people find out', correct: true },
      { text: 'Most customers never notice', correct: false },
    ],
    recallExplanation: 'Fake scarcity is a ticking time bomb. Once ONE person exposes it, your entire brand takes damage. Only use real constraints.',
    xpReward: 100,
  },
  // --- HARD ---
  {
    id: 'offer-h1', competency: 'offer', difficulty: 'hard', type: 'real_world_task',
    title: 'BUILD YOUR GRAND SLAM',
    taskBrief: 'Create a full Grand Slam Offer for your business: 1) Name the dream outcome. 2) List 5 bonuses that each solve a specific objection. 3) Add a guarantee. 4) Add real scarcity. Write it out and take a photo.',
    xpReward: 300,
  },
  {
    id: 'offer-h2', competency: 'offer', difficulty: 'hard', type: 'scenario_quiz',
    title: 'GUARANTEE ENGINEERING',
    scenario: 'A client wants a "money-back guarantee" but you know refund abuse is common in your industry. What\'s the best strategy?',
    options: [
      { text: 'Offer a conditional guarantee tied to completion of the program steps', correct: true },
      { text: 'Offer no guarantee to filter out uncommitted buyers', correct: false },
      { text: 'Offer an unconditional 60-day money-back guarantee', correct: false },
    ],
    failureCritique: 'The best guarantees protect both parties. Conditional guarantees incentivize action AND reduce refund abuse.',
    xpReward: 250,
  },
];

// ============================================================
// SALES — Closing deals and handling objections
// ============================================================
const salesMissions: BankMission[] = [
  {
    id: 'sales-e1', competency: 'sales', difficulty: 'easy', type: 'flashcard',
    title: 'THE CLOSER\'S MINDSET',
    concept: 'Selling is not convincing someone to buy something they don\'t want. Selling is helping someone make a decision they already want to make but are afraid to commit to.',
    keyTakeaway: 'Selling = helping people decide, not manipulating.',
    recallQuestion: 'What is the core reframe of what "selling" actually means?',
    recallOptions: [
      { text: 'Persuading people to buy things they don\'t need', correct: false },
      { text: 'Helping someone commit to a decision they already want to make', correct: true },
      { text: 'Presenting features until the prospect is convinced', correct: false },
    ],
    recallExplanation: 'The best closers don\'t convince — they remove the fear that\'s blocking a decision the prospect already wants to make.',
    xpReward: 50,
  },
  {
    id: 'sales-e2', competency: 'sales', difficulty: 'easy', type: 'scenario_quiz',
    title: 'OBJECTION: "I NEED TO THINK ABOUT IT"',
    scenario: 'A prospect says "I need to think about it" at the end of your sales call. What do you do?',
    options: [
      { text: 'Say "sure, take your time" and follow up next week', correct: false },
      { text: 'Ask "What specifically do you need to think about?" to surface the real objection', correct: true },
      { text: 'Offer a discount to close them right now', correct: false },
    ],
    failureCritique: '"I need to think about it" is never the real objection. It means you failed to surface the actual concern. Always dig deeper.',
    xpReward: 60,
  },
  {
    id: 'sales-e3', competency: 'sales', difficulty: 'easy', type: 'flashcard',
    title: 'TONALITY MATTERS',
    concept: 'Research shows 38% of communication is tonality, 55% body language, only 7% words. On sales calls, your tone of certainty matters more than your pitch. Practice speaking with conviction.',
    keyTakeaway: 'Your tone sells more than your words.',
    recallQuestion: 'According to communication research, what percentage of communication impact comes from the actual words you say?',
    recallOptions: [
      { text: '55%', correct: false },
      { text: '38%', correct: false },
      { text: '7%', correct: true },
    ],
    recallExplanation: 'Only 7% of impact comes from words. 38% is tonality and 55% is body language. That\'s why HOW you say it matters infinitely more than WHAT you say.',
    xpReward: 50,
  },
  {
    id: 'sales-m1', competency: 'sales', difficulty: 'medium', type: 'scenario_quiz',
    title: 'THE PRICE OBJECTION',
    scenario: 'A highly qualified lead says "I can\'t afford it." You know their business does $30k/month. What\'s your response?',
    options: [
      { text: '"I understand. Let me know if anything changes."', correct: false },
      { text: '"It\'s not about afford — it\'s about priority. If this got you 10 more clients, would it pay for itself?"', correct: true },
      { text: 'Offer a payment plan immediately', correct: false },
    ],
    failureCritique: '"Can\'t afford it" from a qualifying lead means they don\'t see the ROI yet. Reframe from cost to investment before offering payment options.',
    xpReward: 120,
  },
  {
    id: 'sales-m2', competency: 'sales', difficulty: 'medium', type: 'real_world_task',
    title: 'OBJECTION BATTLE CARD',
    taskBrief: 'List the top 5 objections you hear most on sales calls. For each one, write the exact response you\'ll use next time. Take a photo of your battle card.',
    xpReward: 150,
  },
  {
    id: 'sales-m3', competency: 'sales', difficulty: 'medium', type: 'flashcard',
    title: 'THE CONVICTION CLOSE',
    concept: 'The most powerful close is genuine conviction. When you truly believe your product transforms lives, closing feels like service not selling. If you can\'t close with conviction, fix your offer first.',
    keyTakeaway: 'If you can\'t close with conviction, your offer is the problem.',
    recallQuestion: 'If you struggle to close sales with genuine conviction, what should you fix?',
    recallOptions: [
      { text: 'Your sales script and closing techniques', correct: false },
      { text: 'Your offer — make it so good YOU believe in it', correct: true },
      { text: 'Your target market — find easier buyers', correct: false },
    ],
    recallExplanation: 'The conviction close works backwards: fix the OFFER until you genuinely believe it transforms lives, then closing becomes natural.',
    xpReward: 100,
  },
  {
    id: 'sales-h1', competency: 'sales', difficulty: 'hard', type: 'real_world_task',
    title: 'LIVE CLOSE PRACTICE',
    taskBrief: 'Record yourself doing a mock sales close with a friend or partner. Handle at least 2 objections. Upload a screenshot of the completed call.',
    xpReward: 300,
  },
  {
    id: 'sales-h2', competency: 'sales', difficulty: 'hard', type: 'scenario_quiz',
    title: 'THE SPOUSE OBJECTION',
    scenario: '"I need to talk to my spouse/partner about this." This is often a smokescreen. What\'s the best approach?',
    options: [
      { text: '"Would it help if I got on a call with both of you?"', correct: true },
      { text: '"No problem, discuss and get back to me."', correct: false },
      { text: '"Your partner will thank you for making this investment."', correct: false },
    ],
    failureCritique: 'Never dismiss the partner objection. Offering a joint call shows respect and dramatically increases close rates.',
    xpReward: 250,
  },
];

// ============================================================
// MARKETING — Getting attention and generating leads
// ============================================================
const marketingMissions: BankMission[] = [
  {
    id: 'mktg-e1', competency: 'marketing', difficulty: 'easy', type: 'flashcard',
    title: 'THE 100 LEADS RULE',
    concept: 'Before you can optimize anything, you need volume. Contact 100 potential leads before you judge whether your offer works. Most entrepreneurs quit at 10.',
    keyTakeaway: 'Contact 100 before you judge.',
    recallQuestion: 'How many leads should you contact before deciding if your offer works?',
    recallOptions: [
      { text: '10 — enough to spot a pattern', correct: false },
      { text: '100 — volume before optimization', correct: true },
      { text: '1,000 — statistically significant', correct: false },
    ],
    recallExplanation: '100 is the minimum for real signal. Most founders quit at 10 and think "the market doesn\'t want it" when they just didn\'t try hard enough.',
    xpReward: 50,
  },
  {
    id: 'mktg-e2', competency: 'marketing', difficulty: 'easy', type: 'scenario_quiz',
    title: 'CONTENT VS ADS',
    scenario: 'You have $500/month marketing budget and zero audience. What\'s the fastest path to your first 10 clients?',
    options: [
      { text: 'Spend it all on Facebook ads immediately', correct: false },
      { text: 'Direct outreach to 100 people + $500 on retargeting warm leads', correct: true },
      { text: 'Save the money and just post on social media daily', correct: false },
    ],
    failureCritique: 'At $500 budget with zero data, cold ads will burn cash. Direct outreach gives you conversations AND data to optimize your ads later.',
    xpReward: 60,
  },
  {
    id: 'mktg-e3', competency: 'marketing', difficulty: 'easy', type: 'flashcard',
    title: 'HOOK, STORY, OFFER',
    concept: 'Every piece of marketing has 3 parts: 1) The Hook grabs attention. 2) The Story builds connection. 3) The Offer gives them a reason to act. Most people only have #3.',
    keyTakeaway: 'Hook → Story → Offer. Most people skip to #3.',
    recallQuestion: 'In the Hook-Story-Offer framework, which part do most entrepreneurs skip?',
    recallOptions: [
      { text: 'The Offer — they forget to ask for the sale', correct: false },
      { text: 'The Hook and Story — they jump straight to selling', correct: true },
      { text: 'The Story — they think it\'s not important', correct: false },
    ],
    recallExplanation: 'Most entrepreneurs jump straight to the offer without hooking attention or building connection first. No hook = no one reads. No story = no trust.',
    xpReward: 50,
  },
  {
    id: 'mktg-m1', competency: 'marketing', difficulty: 'medium', type: 'real_world_task',
    title: 'WRITE 10 HOOKS',
    taskBrief: 'Write 10 different hooks for your offer. Use formats like: questions, bold claims, "How I did X", contradictions. Take a photo of your hook list.',
    xpReward: 150,
  },
  {
    id: 'mktg-m2', competency: 'marketing', difficulty: 'medium', type: 'scenario_quiz',
    title: 'LEAD MAGNET STRATEGY',
    scenario: 'You want to build an email list. Which lead magnet will convert best?',
    options: [
      { text: 'A 200-page eBook covering everything about your niche', correct: false },
      { text: 'A 1-page checklist that solves one specific painful problem', correct: true },
      { text: 'A free 30-minute consultation call', correct: false },
    ],
    failureCritique: 'Length ≠ value. The best lead magnets solve ONE specific problem fast. Specificity wins over comprehensiveness every time.',
    xpReward: 120,
  },
  {
    id: 'mktg-m3', competency: 'marketing', difficulty: 'medium', type: 'flashcard',
    title: 'THE DREAM 100',
    concept: 'Identify the 100 people, podcasts, and communities where your ideal customers already gather. Then provide massive value to those audiences. This is the fastest way to grow ethically.',
    keyTakeaway: 'Go where your customers already are.',
    recallQuestion: 'What is the Dream 100 strategy?',
    recallOptions: [
      { text: 'Getting your first 100 customers through cold outreach', correct: false },
      { text: 'Identifying 100 audiences where your ideal customers already gather, then serving them', correct: true },
      { text: 'Creating 100 pieces of content to go viral', correct: false },
    ],
    recallExplanation: 'Dream 100 = fish where the fish already swim. Find people, podcasts, and communities with your exact audience, then add value to earn their attention.',
    xpReward: 100,
  },
  {
    id: 'mktg-h1', competency: 'marketing', difficulty: 'hard', type: 'real_world_task',
    title: 'BUILD YOUR DREAM 100',
    taskBrief: 'Create a spreadsheet with your Dream 100: 33 influencers, 33 podcasts/channels, 34 communities where your ideal clients hang out. Photo proof.',
    xpReward: 300,
  },
  {
    id: 'mktg-h2', competency: 'marketing', difficulty: 'hard', type: 'scenario_quiz',
    title: 'VIRAL CONTENT FORMULA',
    scenario: 'Your last 20 posts averaged 50 views. One got 5,000. What should you do?',
    options: [
      { text: 'Keep posting variety to see what sticks next', correct: false },
      { text: 'Analyze the viral post, identify the pattern, and create 10 variations of it', correct: true },
      { text: 'Boost the viral post with ads to capitalize', correct: false },
    ],
    failureCritique: 'The market told you what it wants. Double down on proven formats before experimenting.',
    xpReward: 250,
  },
];

// ============================================================
// MINDSET — Discipline, psychology, and founder resilience
// ============================================================
const mindsetMissions: BankMission[] = [
  {
    id: 'mind-e1', competency: 'mindset', difficulty: 'easy', type: 'flashcard',
    title: 'THE IDENTITY SHIFT',
    concept: 'You don\'t rise to the level of your goals — you fall to the level of your systems. The person who builds a $1M business has different daily habits than the person who wants one.',
    keyTakeaway: 'You fall to the level of your systems.',
    recallQuestion: 'According to the Identity Shift principle, what determines your results?',
    recallOptions: [
      { text: 'The size of your goals and ambition', correct: false },
      { text: 'The quality of your daily systems and habits', correct: true },
      { text: 'Your natural talent and IQ', correct: false },
    ],
    recallExplanation: 'Goals are fantasies without systems. You don\'t rise to your goals — you fall to your systems. Change your daily habits first.',
    xpReward: 50,
  },
  {
    id: 'mind-e2', competency: 'mindset', difficulty: 'easy', type: 'scenario_quiz',
    title: 'PARALYSIS BY ANALYSIS',
    scenario: 'You\'ve been "researching" and "planning" your business for 6 months but haven\'t made a single sale. What\'s the real problem?',
    options: [
      { text: 'You need more information before you start', correct: false },
      { text: 'You\'re using planning as a comfortable substitute for the scary action of selling', correct: true },
      { text: 'Your business idea isn\'t ready yet', correct: false },
    ],
    failureCritique: 'Planning feels productive but produces nothing. The market doesn\'t reward plans — it rewards offers, conversations, and shipped products.',
    xpReward: 60,
  },
  {
    id: 'mind-e3', competency: 'mindset', difficulty: 'easy', type: 'flashcard',
    title: 'VOLUME NEGATES LUCK',
    concept: '"Volume negates luck." — Alex Hormozi. The more attempts you make, the less luck matters. Send 100 DMs, not 5. Make 50 calls, not 3. Create 365 pieces of content, not 10.',
    keyTakeaway: 'More reps = less luck needed.',
    recallQuestion: 'What does "volume negates luck" mean for your business?',
    recallOptions: [
      { text: 'Work harder on each individual attempt to get lucky', correct: false },
      { text: 'Make so many attempts that luck becomes irrelevant', correct: true },
      { text: 'Focus on quality over quantity — one perfect attempt wins', correct: false },
    ],
    recallExplanation: 'At 5 attempts, you need luck. At 500 attempts, the math works in your favor regardless. Volume is the antidote to uncertainty.',
    xpReward: 50,
  },
  {
    id: 'mind-m1', competency: 'mindset', difficulty: 'medium', type: 'real_world_task',
    title: 'MORNING PROTOCOL',
    taskBrief: 'Write down your ideal morning routine that optimizes for business output (not comfort). Include exact times, activities, and the ONE business action you\'ll do before 9AM. Photo proof.',
    xpReward: 150,
  },
  {
    id: 'mind-m2', competency: 'mindset', difficulty: 'medium', type: 'scenario_quiz',
    title: 'COMPARING TO COMPETITORS',
    scenario: 'A competitor just launched something almost identical to your product, and they have a bigger audience. Your morale tanks. What\'s the correct mindset?',
    options: [
      { text: 'Pivot to something completely different', correct: false },
      { text: 'Competition validates the market. Execute harder, differentiate on speed of delivery and customer experience.', correct: true },
      { text: 'Undercut their price to steal market share', correct: false },
    ],
    failureCritique: 'Competition means there\'s money in the market. The market isn\'t one-winner-takes-all. Execute with more intensity, not less.',
    xpReward: 120,
  },
  {
    id: 'mind-m3', competency: 'mindset', difficulty: 'medium', type: 'flashcard',
    title: 'DELAYED GRATIFICATION',
    concept: 'The entire game of entrepreneurship is enduring short-term discomfort for long-term freedom. Every "successful overnight" story has 3-7 years of invisible grinding behind it.',
    keyTakeaway: 'Every overnight success took 3-7 years.',
    recallQuestion: 'What does the "overnight success" myth actually look like in reality?',
    recallOptions: [
      { text: 'Some people genuinely succeed fast with the right idea', correct: false },
      { text: '3-7 years of invisible grinding that no one sees', correct: true },
      { text: 'It depends entirely on your network and connections', correct: false },
    ],
    recallExplanation: 'Behind every "overnight" success is years of unglamorous work. Knowing this prevents you from quitting too early.',
    xpReward: 100,
  },
  {
    id: 'mind-h1', competency: 'mindset', difficulty: 'hard', type: 'real_world_task',
    title: 'FEAR INVENTORY',
    taskBrief: 'List every fear that\'s holding you back right now: fear of rejection, failure, judgment, etc. For each one, write the WORST case scenario AND the most LIKELY scenario. Photo proof.',
    xpReward: 300,
  },
  {
    id: 'mind-h2', competency: 'mindset', difficulty: 'hard', type: 'scenario_quiz',
    title: 'THE QUITTING THRESHOLD',
    scenario: 'You\'re 8 months into your business. Revenue is $2k/month. Expenses are $1.5k/month. Growth is slow. A job offer comes for $120k/year. What do you do?',
    options: [
      { text: 'Take the job — the numbers don\'t lie', correct: false },
      { text: 'Give yourself a 90-day sprint with specific revenue targets. If you hit them, stay. If not, take the job.', correct: true },
      { text: 'Ignore the job and keep grinding no matter what', correct: false },
    ],
    failureCritique: 'Rational commitment beats both blind persistence and premature quitting. Set a clear deadline with clear metrics.',
    xpReward: 250,
  },
];

// ============================================================
// OPERATIONS — Systems, delegation, and scaling
// ============================================================
const operationsMissions: BankMission[] = [
  {
    id: 'ops-e1', competency: 'operations', difficulty: 'easy', type: 'flashcard',
    title: 'THE $10/$100/$1000 FRAMEWORK',
    concept: 'Categorize every task by its dollar-per-hour value. $10/hr tasks: admin, email. $100/hr tasks: sales calls, content. $1000/hr tasks: strategy, partnerships. Stop doing $10 work.',
    keyTakeaway: 'Stop doing $10/hr work.',
    recallQuestion: 'Which of these is a $1000/hr task?',
    recallOptions: [
      { text: 'Responding to customer emails', correct: false },
      { text: 'Building a strategic partnership with a complementary business', correct: true },
      { text: 'Creating social media content', correct: false },
    ],
    recallExplanation: 'Email = $10/hr. Content = $100/hr. Strategic partnerships = $1000/hr. Your job as founder is to spend more time on $1000 work and delegate the rest.',
    xpReward: 50,
  },
  {
    id: 'ops-e2', competency: 'operations', difficulty: 'easy', type: 'scenario_quiz',
    title: 'DELEGATION 101',
    scenario: 'You\'re doing 12 hours of work daily. 4 hours are admin tasks (email, scheduling, bookkeeping). What\'s your first move to reclaim time?',
    options: [
      { text: 'Work harder and sleep less', correct: false },
      { text: 'Hire a virtual assistant for $5-10/hr to handle the 4 hours of admin', correct: true },
      { text: 'Automate everything with AI tools', correct: false },
    ],
    failureCritique: 'Your time as a founder is worth more than $10/hr. Delegation is not a luxury — it\'s basic business math.',
    xpReward: 60,
  },
  {
    id: 'ops-e3', competency: 'operations', difficulty: 'easy', type: 'flashcard',
    title: 'DOCUMENT EVERYTHING',
    concept: 'If you can\'t document it, you can\'t delegate it. If you can\'t delegate it, you can\'t scale it. Every repeatable process in your business needs a simple SOP (Standard Operating Procedure).',
    keyTakeaway: 'No SOP = no delegation = no scale.',
    recallQuestion: 'Why is documentation the first step to scaling a business?',
    recallOptions: [
      { text: 'It helps you remember what to do each day', correct: false },
      { text: 'You can\'t delegate work that isn\'t documented, and you can\'t scale without delegation', correct: true },
      { text: 'Investors require documentation before funding', correct: false },
    ],
    recallExplanation: 'The chain is: Document \u2192 Delegate \u2192 Scale. Break any link and growth stalls. Every repeatable process needs an SOP.',
    xpReward: 50,
  },
  {
    id: 'ops-m1', competency: 'operations', difficulty: 'medium', type: 'real_world_task',
    title: 'TIME AUDIT',
    taskBrief: 'Track every activity you do tomorrow in 30-minute blocks. At the end of the day, label each block as $10, $100, or $1000 work. Photo proof of your audit.',
    xpReward: 150,
  },
  {
    id: 'ops-m2', competency: 'operations', difficulty: 'medium', type: 'scenario_quiz',
    title: 'TOOL STACK BLOAT',
    scenario: 'You\'re paying for 12 different SaaS tools totaling $800/month. Revenue is $5k/month. What should you do?',
    options: [
      { text: 'Keep them all — you need every tool to run the business', correct: false },
      { text: 'Audit each tool: if it doesn\'t directly generate revenue or save 5+ hours/month, cancel it', correct: true },
      { text: 'Cancel everything and use only free tools', correct: false },
    ],
    failureCritique: 'Tool hoarding is a comfort trap. Every dollar spent on tools that don\'t move revenue is a dollar stolen from growth.',
    xpReward: 120,
  },
  {
    id: 'ops-m3', competency: 'operations', difficulty: 'medium', type: 'flashcard',
    title: 'THE BOTTLENECK PRINCIPLE',
    concept: 'Your business can only grow as fast as its tightest bottleneck. Identify the ONE constraint limiting growth right now. All energy goes there until it\'s resolved.',
    keyTakeaway: 'Find the ONE bottleneck. Fix only that.',
    recallQuestion: 'If your business has 5 problems, how many should you focus on?',
    recallOptions: [
      { text: 'All 5 \u2014 multitask to fix everything', correct: false },
      { text: '1 \u2014 the tightest bottleneck that limits all other growth', correct: true },
      { text: '3 \u2014 tackle the top priorities in parallel', correct: false },
    ],
    recallExplanation: 'A chain is only as strong as its weakest link. Fix the #1 bottleneck first \u2014 everything else is wasted energy until that constraint is removed.',
    xpReward: 100,
  },
  {
    id: 'ops-h1', competency: 'operations', difficulty: 'hard', type: 'real_world_task',
    title: 'WRITE YOUR FIRST SOP',
    taskBrief: 'Pick the most repeatable task in your business. Write a step-by-step SOP so detailed that a stranger could execute it perfectly. Include screenshots/diagrams. Photo proof.',
    xpReward: 300,
  },
  {
    id: 'ops-h2', competency: 'operations', difficulty: 'hard', type: 'scenario_quiz',
    title: 'HIRING YOUR FIRST PERSON',
    scenario: 'You need to hire your first team member. Revenue is $10k/month. What role should you hire first?',
    options: [
      { text: 'A marketing person to grow faster', correct: false },
      { text: 'The role that frees YOU to do more revenue-generating work (usually admin/ops)', correct: true },
      { text: 'A co-founder to split the workload', correct: false },
    ],
    failureCritique: 'Your first hire should buy back YOUR time for high-leverage activities, not add complexity. Hire to subtract from your plate, not add to your org chart.',
    xpReward: 250,
  },
];

// ============================================================
// COMBINED MISSION BANK
// ============================================================
export const MISSION_BANK: BankMission[] = [
  ...offerMissions,
  ...salesMissions,
  ...marketingMissions,
  ...mindsetMissions,
  ...operationsMissions,
  // NEW MISSIONS FOR NEW TRACKS
  {
    id: 'inv-e1', competency: 'investing', difficulty: 'easy', type: 'flashcard',
    title: 'HOW THE STOCK MARKET WORKS',
    concept: 'The stock market is a place where buyers and sellers trade shares of public companies. When you buy a stock, you own a tiny slice of that business.',
    keyTakeaway: 'You are buying a piece of a real business, not just a ticker symbol.',
    recallQuestion: 'When you buy a stock, what are you actually buying?',
    recallOptions: [
      { text: 'A guaranteed loan to the government', correct: false },
      { text: 'A small piece of ownership in a real business', correct: true },
      { text: 'A lottery ticket based on market trends', correct: false },
    ],
    recallExplanation: 'A stock (or equity) represents partial ownership in a real business. As the business grows and profits, the value of your ownership piece grows.',
    xpReward: 50,
  },
  {
    id: 'inv-e2', competency: 'investing', difficulty: 'easy', type: 'scenario_quiz',
    title: 'HOW STOCKS ARE DIFFERENT',
    scenario: 'You are deciding between buying a Growth stock (like a new tech company) and a Dividend stock (like a large utility). What is the main difference?',
    options: [
      { text: 'Growth stocks pay you cash every quarter; Dividend stocks don\'t.', correct: false },
      { text: 'Growth stocks reinvest profits to grow the company; Dividend stocks distribute profits to shareholders as cash.', correct: true },
      { text: 'Dividend stocks are always riskier than Growth stocks.', correct: false },
    ],
    failureCritique: 'Growth companies need cash to expand. Dividend companies are mature and distribute overflow cash to shareholders. Know what you are buying.',
    xpReward: 60,
  },
  {
    id: 'acc-e1', competency: 'accounting', difficulty: 'easy', type: 'flashcard',
    title: 'THE ACCOUNTING EQUATION',
    concept: 'Assets = Liabilities + Equity. Everything a business owns (Assets) was either paid for with borrowed money (Liabilities) or the owner\'s money (Equity).',
    keyTakeaway: 'Assets = Liabilities + Equity.',
    recallQuestion: 'If a company has $100,000 in Assets and $60,000 in Liabilities, what is its Equity?',
    recallOptions: [
      { text: '$160,000', correct: false },
      { text: '$40,000', correct: true },
      { text: '$60,000', correct: false },
    ],
    recallExplanation: 'Assets (100k) - Liabilities (60k) = Equity (40k). This equation must always balance.',
    xpReward: 50,
  },
  {
    id: 'ai-e1', competency: 'ai', difficulty: 'easy', type: 'flashcard',
    title: 'LLM BASICS',
    concept: 'Large Language Models (LLMs) like ChatGPT don\'t "think" — they predict the next most likely word in a sequence based on massive amounts of training data.',
    keyTakeaway: 'LLMs are advanced auto-complete engines.',
    recallQuestion: 'How does an LLM generate its responses?',
    recallOptions: [
      { text: 'By querying a live database of facts to find answers', correct: false },
      { text: 'By predicting the statistically most likely next word based on its training', correct: true },
      { text: 'By understanding the true meaning of the text like a human', correct: false },
    ],
    recallExplanation: 'They are incredibly powerful pattern matchers that predict text strings. They don\'t have true understanding or live search by default.',
    xpReward: 50,
  }
];

// ============================================================
// CURRICULUM DEFINITIONS
// ============================================================

export const CURRICULUM_TRACKS: Record<TrackType, CurriculumTrack> = {
  apex: {
    trackId: 'apex',
    title: 'THE T1GER APEX PATH',
    levels: [
      {
        levelId: 'apex-level-1', levelNumber: 1, title: 'PHASE 1: THE OFFER', subtitle: 'Building the foundation of value',
        days: [
          { dayId: 'apex-d1', dayNumber: 1, missionIds: ['offer-e1'] },
          { dayId: 'apex-d2', dayNumber: 2, missionIds: ['offer-e3'] },
          { dayId: 'apex-d3', dayNumber: 3, missionIds: ['offer-e2'] },
          { dayId: 'apex-d4', dayNumber: 4, missionIds: ['offer-m1'] },
          { dayId: 'apex-d5', dayNumber: 5, missionIds: ['offer-m3'] },
        ]
      },
      {
        levelId: 'apex-level-2', levelNumber: 2, title: 'PHASE 2: THE CLOSE', subtitle: 'Turning attention into revenue',
        days: [
          { dayId: 'apex-d6', dayNumber: 6, missionIds: ['sales-e1'] },
          { dayId: 'apex-d7', dayNumber: 7, missionIds: ['sales-e2'] },
          { dayId: 'apex-d8', dayNumber: 8, missionIds: ['sales-e3'] },
          { dayId: 'apex-d9', dayNumber: 9, missionIds: ['sales-m1'] },
        ]
      },
      {
        levelId: 'apex-level-3', levelNumber: 3, title: 'PHASE 3: THE GRIND', subtitle: 'Scale through consistency',
        days: [
          { dayId: 'apex-d10', dayNumber: 10, missionIds: ['mktg-e1'] },
          { dayId: 'apex-d11', dayNumber: 11, missionIds: ['mktg-e3'] },
          { dayId: 'apex-d12', dayNumber: 12, missionIds: ['mind-e1'] },
          { dayId: 'apex-d13', dayNumber: 13, missionIds: ['ops-e1'] },
        ]
      }
    ]
  }
};

// Helper: get missions filtered by competency and/or difficulty
export const getMissionsByCompetency = (competency: Competency): BankMission[] =>
  MISSION_BANK.filter(m => m.competency === competency);

export const getMissionsByDifficulty = (difficulty: Difficulty): BankMission[] =>
  MISSION_BANK.filter(m => m.difficulty === difficulty);

export const getMissionById = (id: string): BankMission | undefined =>
  MISSION_BANK.find(m => m.id === id);

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

