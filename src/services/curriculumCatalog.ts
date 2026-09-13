import type { InteractiveTrackId } from './interactiveCurriculumTypes';

export type DomainId =
  | 'technology'
  | 'business'
  | 'history'
  | 'science'
  | 'psychology'
  | 'philosophy';

export interface KinnuPathway {
  id: string;
  domainId: DomainId;
  title: { es: string; en: string };
  description: { es: string; en: string };
  curatedSources: { es: string; en: string };
  iconName: string;
  orbsCount: number;
  interactiveTrackId: InteractiveTrackId;
  badge?: { es: string; en: string };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface KinnuDomain {
  id: DomainId;
  title: { es: string; en: string };
  shortName: { es: string; en: string };
  subtitle: { es: string; en: string };
  mascotSpeech: { es: string; en: string };
  iconName: string;
  accentColor: string; // HEX
  glowColor: string;
  pathways: KinnuPathway[];
}

export const KINNU_DOMAINS: KinnuDomain[] = [
  {
    id: 'technology',
    title: { es: 'Technology', en: 'Technology' },
    shortName: { es: 'Tech', en: 'Tech' },
    subtitle: {
      es: 'De la inteligencia artificial a la computación moderna.',
      en: 'From artificial intelligence to modern computing.'
    },
    mascotSpeech: {
      es: 'Dominio Technology: domina los algoritmos y la IA que mueven el mundo.',
      en: 'Technology Domain: master the algorithms and AI moving the world.'
    },
    iconName: 'Cpu',
    accentColor: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.25)',
    pathways: [
      {
        id: 'tech-ai',
        domainId: 'technology',
        title: { es: 'Artificial Intelligence', en: 'Artificial Intelligence' },
        description: {
          es: 'Arquitectura de LLMs, prompting estructurado, agentes autónomos y redes neuronales.',
          en: 'LLM architecture, structured prompting, autonomous agents, and neural networks.'
        },
        curatedSources: {
          es: 'OpenAI · Stanford AI Lab · Andrej Karpathy',
          en: 'OpenAI · Stanford AI Lab · Andrej Karpathy'
        },
        iconName: 'Robot',
        orbsCount: 5,
        interactiveTrackId: 'ai-automation',
        badge: { es: 'POPULAR', en: 'TRENDING' },
        difficulty: 'intermediate',
      },
      {
        id: 'tech-cybersecurity',
        domainId: 'technology',
        title: { es: 'Cybersecurity', en: 'Cybersecurity' },
        description: {
          es: 'Vectores de ataque, criptografía aplicada, defensa de datos y soberanía digital.',
          en: 'Attack vectors, applied cryptography, data defense, and digital sovereignty.'
        },
        curatedSources: {
          es: 'MIT · Bruce Schneier · Kevin Mitnick',
          en: 'MIT · Bruce Schneier · Kevin Mitnick'
        },
        iconName: 'ShieldCheck',
        orbsCount: 5,
        interactiveTrackId: 'ai-automation',
        difficulty: 'beginner',
      },
      {
        id: 'tech-datascience',
        domainId: 'technology',
        title: { es: 'Data Science', en: 'Data Science' },
        description: {
          es: 'Inferencia estadística, modelos predictivos y toma de decisiones guiada por datos.',
          en: 'Statistical inference, predictive models, and data-driven decision making.'
        },
        curatedSources: {
          es: 'Nate Silver · Cassie Kozyrkov (Google) · Ronny Kohavi',
          en: 'Nate Silver · Cassie Kozyrkov (Google) · Ronny Kohavi'
        },
        iconName: 'Database',
        orbsCount: 5,
        interactiveTrackId: 'data-science',
        difficulty: 'intermediate',
      },
      {
        id: 'tech-computing',
        domainId: 'technology',
        title: { es: 'The Internet & Computing', en: 'The Internet & Computing' },
        description: {
          es: 'Cómo funciona la red global, protocolos distribuidos, nube y computación moderna.',
          en: 'How the global network works, distributed protocols, cloud, and computing.'
        },
        curatedSources: {
          es: 'Tim Berners-Lee · Vint Cerf · AWS Architecture',
          en: 'Tim Berners-Lee · Vint Cerf · AWS Architecture'
        },
        iconName: 'Globe',
        orbsCount: 5,
        interactiveTrackId: 'ai-automation',
        difficulty: 'beginner',
      },
    ],
  },
  {
    id: 'business',
    title: { es: 'Business', en: 'Business' },
    shortName: { es: 'Business', en: 'Business' },
    subtitle: {
      es: 'Creación de valor, validación ágil, ventas y capital.',
      en: 'Value creation, rapid validation, sales, and capital.'
    },
    mascotSpeech: {
      es: 'Dominio Business: transforma ideas en sistemas rentables y domina el mercado.',
      en: 'Business Domain: transform ideas into profitable systems and dominate the market.'
    },
    iconName: 'Briefcase',
    accentColor: '#FF7300',
    glowColor: 'rgba(255, 115, 0, 0.25)',
    pathways: [
      {
        id: 'biz-entrepreneurship',
        domainId: 'business',
        title: { es: 'Entrepreneurship', en: 'Entrepreneurship' },
        description: {
          es: 'El método YC: validar demanda real con The Mom Test, diseñar ofertas irresistibles y tracción de cero a uno.',
          en: 'The YC method: validating demand with The Mom Test, irresistible offer design, and zero-to-one traction.'
        },
        curatedSources: {
          es: 'Y Combinator · Rob Fitzpatrick (The Mom Test) · Peter Thiel (Zero to One)',
          en: 'Y Combinator · Rob Fitzpatrick (The Mom Test) · Peter Thiel (Zero to One)'
        },
        iconName: 'RocketLaunch',
        orbsCount: 5,
        interactiveTrackId: 'viral-growth',
        badge: { es: 'TOP VENTAS', en: 'TOP CHOICE' },
        difficulty: 'beginner',
      },
      {
        id: 'biz-sales',
        domainId: 'business',
        title: { es: 'Sales & Negotiation', en: 'Sales & Negotiation' },
        description: {
          es: 'Psicología de cierre, manejo de objeciones duras, fijación de precios y prospección.',
          en: 'Closing psychology, tough objection handling, pricing models, and prospecting.'
        },
        curatedSources: {
          es: 'Chris Voss (Never Split the Difference) · Robert Cialdini',
          en: 'Chris Voss (Never Split the Difference) · Robert Cialdini'
        },
        iconName: 'Handshake',
        orbsCount: 5,
        interactiveTrackId: 'viral-growth',
        difficulty: 'intermediate',
      },
      {
        id: 'biz-capital',
        domainId: 'business',
        title: { es: 'Investing & Capital', en: 'Investing & Capital' },
        description: {
          es: 'Construcción de liquidez, inversión indexada pasiva, DCA y control de riesgos.',
          en: 'Liquidity engineering, passive index investing, DCA, and systemic risk control.'
        },
        curatedSources: {
          es: 'Morgan Housel (Psychology of Money) · Ray Dalio · John Bogle',
          en: 'Morgan Housel (Psychology of Money) · Ray Dalio · John Bogle'
        },
        iconName: 'TrendUp',
        orbsCount: 5,
        interactiveTrackId: 'smart-money',
        badge: { es: 'ESENCIAL', en: 'CORE' },
        difficulty: 'beginner',
      },
      {
        id: 'biz-marketing',
        domainId: 'business',
        title: { es: 'Marketing & Growth', en: 'Marketing & Growth' },
        description: {
          es: 'Ganchos de atención en 3 segundos, embudos de conversión y bucles virales.',
          en: '3-second hooks, conversion funnels, distribution engines, and viral loops.'
        },
        curatedSources: {
          es: 'Alex Hormozi ($100M Offers) · Seth Godin · Sean Ellis',
          en: 'Alex Hormozi ($100M Offers) · Seth Godin · Sean Ellis'
        },
        iconName: 'Lightning',
        orbsCount: 5,
        interactiveTrackId: 'viral-growth',
        difficulty: 'intermediate',
      },
    ],
  },
  {
    id: 'history',
    title: { es: 'History', en: 'History' },
    shortName: { es: 'History', en: 'History' },
    subtitle: {
      es: 'Las lecciones de imperios, guerras y momentos cumbre de la humanidad.',
      en: 'Lessons from empires, warfare, and pivotal moments of humankind.'
    },
    mascotSpeech: {
      es: 'Dominio History: quien no conoce el pasado repite sus derrotas. Aprende de los grandes.',
      en: 'History Domain: those who ignore the past repeat its defeats. Learn from the greats.'
    },
    iconName: 'Bank',
    accentColor: '#EAB308',
    glowColor: 'rgba(234, 179, 8, 0.25)',
    pathways: [
      {
        id: 'hist-rome',
        domainId: 'history',
        title: { es: 'Ancient Rome', en: 'Ancient Rome' },
        description: {
          es: 'De república a imperio: disciplina militar, maniobra geopolítica y la caída final.',
          en: 'From republic to empire: military discipline, geopolitical maneuver, and the fall.'
        },
        curatedSources: {
          es: 'Mary Beard (SPQR) · Plutarco · Cicerón',
          en: 'Mary Beard (SPQR) · Plutarch · Cicero'
        },
        iconName: 'Crown',
        orbsCount: 5,
        interactiveTrackId: 'history-strategy',
        badge: { es: 'CLÁSICO', en: 'CLASSIC' },
        difficulty: 'beginner',
      },
      {
        id: 'hist-ww2',
        domainId: 'history',
        title: { es: 'World War II', en: 'World War II' },
        description: {
          es: 'Puntos de inflexión estratégica, logística de frentes masivos y decisiones críticas.',
          en: 'Strategic turning points, massive theater logistics, and high-stakes decisions.'
        },
        curatedSources: {
          es: 'Antony Beevor · Winston Churchill · Max Hastings',
          en: 'Antony Beevor · Winston Churchill · Max Hastings'
        },
        iconName: 'Sword',
        orbsCount: 5,
        interactiveTrackId: 'history-strategy',
        difficulty: 'intermediate',
      },
      {
        id: 'hist-civilizations',
        domainId: 'history',
        title: { es: 'Ancient Civilizations', en: 'Ancient Civilizations' },
        description: {
          es: 'Mesopotamia, Egipto, Grecia y las primeras leyes e innovaciones humanas.',
          en: 'Mesopotamia, Egypt, Greece, and early laws and human engineering marvels.'
        },
        curatedSources: {
          es: 'Yuval Noah Harari (Sapiens) · Jared Diamond',
          en: 'Yuval Noah Harari (Sapiens) · Jared Diamond'
        },
        iconName: 'Bank',
        orbsCount: 5,
        interactiveTrackId: 'history-strategy',
        difficulty: 'beginner',
      },
      {
        id: 'hist-world',
        domainId: 'history',
        title: { es: 'World History', en: 'World History' },
        description: {
          es: 'La Ruta de la Seda, el Renacimiento y la Revolución Industrial que configuró la era actual.',
          en: 'The Silk Road, Renaissance, and the Industrial Revolution shaping our world.'
        },
        curatedSources: {
          es: 'Peter Frankopan (The Silk Roads) · Will Durant',
          en: 'Peter Frankopan (The Silk Roads) · Will Durant'
        },
        iconName: 'Compass',
        orbsCount: 5,
        interactiveTrackId: 'history-strategy',
        difficulty: 'intermediate',
      },
    ],
  },
  {
    id: 'science',
    title: { es: 'Science', en: 'Science' },
    shortName: { es: 'Science', en: 'Science' },
    subtitle: {
      es: 'Leyes físicas, el cosmos, genética y fisiología humana.',
      en: 'Physical laws, the cosmos, genetics, and human physiology.'
    },
    mascotSpeech: {
      es: 'Dominio Science: desmenuza las reglas fundamentales de la materia y la vida.',
      en: 'Science Domain: break down fundamental laws governing matter and life.'
    },
    iconName: 'Atom',
    accentColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    pathways: [
      {
        id: 'sci-astronomy',
        domainId: 'science',
        title: { es: 'Astronomy & Cosmos', en: 'Astronomy & Cosmos' },
        description: {
          es: 'Orígenes del universo, agujeros negros, relatividad gravitatoria y exploración espacial.',
          en: 'Cosmic origins, black holes, gravitational relativity, and space exploration.'
        },
        curatedSources: {
          es: 'Carl Sagan (Cosmos) · Stephen Hawking · Neil deGrasse Tyson',
          en: 'Carl Sagan (Cosmos) · Stephen Hawking · Neil deGrasse Tyson'
        },
        iconName: 'Planet',
        orbsCount: 5,
        interactiveTrackId: 'peak-performance',
        difficulty: 'intermediate',
      },
      {
        id: 'sci-physics',
        domainId: 'science',
        title: { es: 'Laws of Physics', en: 'Laws of Physics' },
        description: {
          es: 'Mecánica clásica, termodinámica, entropía y principios cuánticos explicados con claridad.',
          en: 'Classical mechanics, thermodynamics, entropy, and quantum principles made clear.'
        },
        curatedSources: {
          es: 'Richard Feynman · Albert Einstein · Carlo Rovelli',
          en: 'Richard Feynman · Albert Einstein · Carlo Rovelli'
        },
        iconName: 'Atom',
        orbsCount: 5,
        interactiveTrackId: 'peak-performance',
        badge: { es: 'FUNDAMENTAL', en: 'CORE' },
        difficulty: 'intermediate',
      },
      {
        id: 'sci-genetics',
        domainId: 'science',
        title: { es: 'Biology & Genetics', en: 'Biology & Genetics' },
        description: {
          es: 'El código del ADN, evolución por selección natural y maquinaria celular.',
          en: 'DNA code, natural selection evolution, and microscopic cellular machinery.'
        },
        curatedSources: {
          es: 'Charles Darwin · Richard Dawkins · Siddhartha Mukherjee',
          en: 'Charles Darwin · Richard Dawkins · Siddhartha Mukherjee'
        },
        iconName: 'Dna',
        orbsCount: 5,
        interactiveTrackId: 'peak-performance',
        difficulty: 'beginner',
      },
      {
        id: 'sci-physiology',
        domainId: 'science',
        title: { es: 'Human Physiology', en: 'Human Physiology' },
        description: {
          es: 'Neurotransmisores, ciclo circadiano, metabolismo celular y rendimiento biológico.',
          en: 'Neurotransmitters, circadian rhythm, cellular metabolism, and peak bio-performance.'
        },
        curatedSources: {
          es: 'Dr. Andrew Huberman · Dr. Peter Attia · Matthew Walker',
          en: 'Dr. Andrew Huberman · Dr. Peter Attia · Matthew Walker'
        },
        iconName: 'Heartbeat',
        orbsCount: 5,
        interactiveTrackId: 'peak-performance',
        difficulty: 'beginner',
      },
    ],
  },
  {
    id: 'psychology',
    title: { es: 'Psychology', en: 'Psychology' },
    shortName: { es: 'Psych', en: 'Psych' },
    subtitle: {
      es: 'Sesgos cognitivos, neurociencia del aprendizaje y bienestar mental.',
      en: 'Cognitive biases, learning neuroscience, and mental wellbeing.'
    },
    mascotSpeech: {
      es: 'Dominio Psychology: comprende los sesgos invisibles que dictan tus elecciones.',
      en: 'Psychology Domain: understand invisible biases dictating human choices.'
    },
    iconName: 'Brain',
    accentColor: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.25)',
    pathways: [
      {
        id: 'psych-biases',
        domainId: 'psychology',
        title: { es: 'Cognitive Biases', en: 'Cognitive Biases' },
        description: {
          es: 'Sistema 1 y Sistema 2 de Kahneman, aversión a la pérdida y trampas mentales.',
          en: 'Kahneman System 1 & 2, loss aversion, anchoring, and cognitive blindspots.'
        },
        curatedSources: {
          es: 'Daniel Kahneman (Pensar rápido, pensar despacio) · Amos Tversky',
          en: 'Daniel Kahneman (Thinking, Fast and Slow) · Amos Tversky'
        },
        iconName: 'Brain',
        orbsCount: 5,
        interactiveTrackId: 'mindset-stoic',
        badge: { es: 'CLAVE', en: 'ESSENTIAL' },
        difficulty: 'beginner',
      },
      {
        id: 'psych-learning',
        domainId: 'psychology',
        title: { es: 'Superpower Learning', en: 'Superpower Learning' },
        description: {
          es: 'Práctica de recuperación activa, repetición espaciada y neuroplasticidad acelerada.',
          en: 'Active retrieval practice, spaced repetition, and accelerated neuroplasticity.'
        },
        curatedSources: {
          es: 'Dra. Barbara Oakley (A Mind for Numbers) · Cal Newport',
          en: 'Dr. Barbara Oakley (A Mind for Numbers) · Cal Newport'
        },
        iconName: 'Lightbulb',
        orbsCount: 5,
        interactiveTrackId: 'mindset-stoic',
        difficulty: 'beginner',
      },
      {
        id: 'psych-wellbeing',
        domainId: 'psychology',
        title: { es: 'Mental Wellbeing', en: 'Mental Wellbeing' },
        description: {
          es: 'Regulación dopaminérgica, respuesta al estrés agudo y arquitectura de hábitos.',
          en: 'Dopamine baseline regulation, acute stress resilience, and habit loops.'
        },
        curatedSources: {
          es: 'Dr. Viktor Frankl · James Clear · Dr. Andrew Huberman',
          en: 'Dr. Viktor Frankl · James Clear · Dr. Andrew Huberman'
        },
        iconName: 'Heartbeat',
        orbsCount: 5,
        interactiveTrackId: 'mindset-stoic',
        difficulty: 'beginner',
      },
      {
        id: 'psych-social',
        domainId: 'psychology',
        title: { es: 'Social Psychology', en: 'Social Psychology' },
        description: {
          es: 'Dinámicas de grupo, conformidad social, sesgo de autoridad e influencia interpersonal.',
          en: 'Group dynamics, social conformity, authority bias, and interpersonal influence.'
        },
        curatedSources: {
          es: 'Stanley Milgram · Robert Cialdini · Jonathan Haidt',
          en: 'Stanley Milgram · Robert Cialdini · Jonathan Haidt'
        },
        iconName: 'Users',
        orbsCount: 5,
        interactiveTrackId: 'mindset-stoic',
        difficulty: 'intermediate',
      },
    ],
  },
  {
    id: 'philosophy',
    title: { es: 'Philosophy', en: 'Philosophy' },
    shortName: { es: 'Philos', en: 'Philos' },
    subtitle: {
      es: 'Estoicismo, modelos mentales y criterio para tomar decisiones difíciles.',
      en: 'Stoicism, mental models, and judgment for tough decisions.'
    },
    mascotSpeech: {
      es: 'Dominio Philosophy: forja un código mental sereno frente a la incertidumbre.',
      en: 'Philosophy Domain: forge a calm mental operating code amidst uncertainty.'
    },
    iconName: 'Scales',
    accentColor: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.25)',
    pathways: [
      {
        id: 'phil-stoicism',
        domainId: 'philosophy',
        title: { es: 'Stoicism', en: 'Stoicism' },
        description: {
          es: 'Marco estoico de Marco Aurelio y Epicteto: dicotomía del control y ataraxia.',
          en: 'Marcus Aurelius & Epictetus operating framework: dichotomy of control & ataraxia.'
        },
        curatedSources: {
          es: 'Marco Aurelio (Meditaciones) · Séneca · Epicteto',
          en: 'Marcus Aurelius (Meditations) · Seneca · Epictetus'
        },
        iconName: 'Scales',
        orbsCount: 5,
        interactiveTrackId: 'mindset-stoic',
        badge: { es: 'RECOMENDADO', en: 'TOP RATED' },
        difficulty: 'beginner',
      },
      {
        id: 'phil-mental-models',
        domainId: 'philosophy',
        title: { es: 'Mental Models', en: 'Mental Models' },
        description: {
          es: 'Pensamiento desde primeros principios, inversión, efectos de segundo orden y navaja de Ockham.',
          en: 'First-principles reasoning, inversion, second-order effects, and Occam’s razor.'
        },
        curatedSources: {
          es: 'Charlie Munger (Almanaque) · Shane Parrish (Farnam Street)',
          en: 'Charlie Munger (Poor Charlie’s Almanack) · Shane Parrish'
        },
        iconName: 'Compass',
        orbsCount: 5,
        interactiveTrackId: 'history-strategy',
        difficulty: 'intermediate',
      },
      {
        id: 'phil-persuasion',
        domainId: 'philosophy',
        title: { es: 'Persuasion & Rhetoric', en: 'Persuasion & Rhetoric' },
        description: {
          es: 'Ethos, Pathos y Logos aristotélicos, escucha activa y argumentación limpia.',
          en: 'Aristotelian Ethos, Pathos and Logos, active listening, and clean argumentation.'
        },
        curatedSources: {
          es: 'Aristóteles (Retórica) · Dale Carnegie · Chris Voss',
          en: 'Aristotle (Rhetoric) · Dale Carnegie · Chris Voss'
        },
        iconName: 'ChatCircleDots',
        orbsCount: 5,
        interactiveTrackId: 'viral-growth',
        difficulty: 'beginner',
      },
      {
        id: 'phil-decision-making',
        domainId: 'philosophy',
        title: { es: 'Decision Making', en: 'Decision Making' },
        description: {
          es: 'Pensamiento probabilístico, asimetría de riesgo y toma de decisiones bajo incertidumbre.',
          en: 'Probabilistic thinking, risk asymmetry, and decision making under deep uncertainty.'
        },
        curatedSources: {
          es: 'Annie Duke (Thinking in Bets) · Nassim Nicholas Taleb',
          en: 'Annie Duke (Thinking in Bets) · Nassim Nicholas Taleb'
        },
        iconName: 'Target',
        orbsCount: 5,
        interactiveTrackId: 'smart-money',
        difficulty: 'advanced',
      },
    ],
  },
];

export function getDomainById(domainId: DomainId): KinnuDomain {
  return KINNU_DOMAINS.find(d => d.id === domainId) || KINNU_DOMAINS[0];
}

export function getPathwayById(pathwayId: string): KinnuPathway | undefined {
  for (const domain of KINNU_DOMAINS) {
    const found = domain.pathways.find(p => p.id === pathwayId);
    if (found) return found;
  }
  return undefined;
}

export function getDomainForTrackId(trackId: InteractiveTrackId): KinnuDomain {
  if (trackId === 'data-science') return getDomainById('technology');
  if (trackId === 'ai-automation') return getDomainById('technology');
  if (trackId === 'viral-growth') return getDomainById('business');
  if (trackId === 'history-strategy') return getDomainById('history');
  if (trackId === 'mindset-stoic') return getDomainById('psychology');
  if (trackId === 'peak-performance') return getDomainById('science');
  if (trackId === 'smart-money') return getDomainById('business');
  return getDomainById('technology');
}
