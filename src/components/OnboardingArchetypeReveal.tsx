import React from 'react';
import { motion } from 'motion/react';
import { Trophy, ShieldAlert, Sparkles, Brain, ArrowRight } from 'lucide-react';

interface Archetype {
  title: string;
  rank: string;
  description: string;
  badgeColor: string;
}

export const ARCHETYPES: Record<'business' | 'investing' | 'ai', { advanced: Archetype; beginner: Archetype }> = {
  ai: {
    advanced: {
      title: 'Apex AI Architect',
      rank: 'Apex Predator (Lvl 3)',
      description: 'Dominas la lógica de sistemas neuronales y comprendes el comportamiento predictivo de los LLMs. Estás listo para automatizar imperios.',
      badgeColor: 'text-[#CCFF00] bg-[#CCFF00]/10 border-[#CCFF00]/30',
    },
    beginner: {
      title: 'AI Sentinel',
      rank: 'Hunter Cub (Lvl 1)',
      description: 'Posees un fuerte instinto estratégico para identificar herramientas automatizables. Aprenderás a dominar la ingeniería de prompts y flujos inteligentes.',
      badgeColor: 'text-[#60A5FA] bg-[#60A5FA]/10 border-[#60A5FA]/30',
    }
  },
  business: {
    advanced: {
      title: 'Venture Cheetah',
      rank: 'Apex Predator (Lvl 3)',
      description: 'Comprendes cómo disolver objeciones optimizando el tiempo y esfuerzo percibido del cliente. Tus ofertas serán irresistibles (Grand Slam).',
      badgeColor: 'text-[#FF6B00] bg-[#FF6B00]/10 border-[#FF6B00]/30',
    },
    beginner: {
      title: 'Bootstrap Lynx',
      rank: 'Hunter Cub (Lvl 1)',
      description: 'Tienes la agilidad y determinación para encontrar nichos comerciales de alta demanda. Sentarás las bases para tu primer modelo de negocio.',
      badgeColor: 'text-[#60A5FA] bg-[#60A5FA]/10 border-[#60A5FA]/30',
    }
  },
  investing: {
    advanced: {
      title: 'Quantitative Tiger',
      rank: 'Apex Predator (Lvl 3)',
      description: 'Calculas el interés compuesto con frialdad y sabes cómo mitigar riesgos usando Dollar-Cost Averaging. Eres un asignador de capital de élite.',
      badgeColor: 'text-[#CCFF00] bg-[#CCFF00]/10 border-[#CCFF00]/30',
    },
    beginner: {
      title: 'Compound Cub',
      rank: 'Hunter Cub (Lvl 1)',
      description: 'Entiendes cómo la inflación devora el capital estático. Estás listo para estructurar tus primeros cimientos en fondos indexados.',
      badgeColor: 'text-[#60A5FA] bg-[#60A5FA]/10 border-[#60A5FA]/30',
    }
  }
};

interface OnboardingArchetypeRevealProps {
  track: 'business' | 'investing' | 'ai';
  score: number; // 0 to 3 correct answers
  onNext: () => void;
}

export const OnboardingArchetypeReveal: React.FC<OnboardingArchetypeRevealProps> = ({ track, score, onNext }) => {
  const isAdvanced = score >= 2;
  const archetype = isAdvanced ? ARCHETYPES[track].advanced : ARCHETYPES[track].beginner;
  
  // Calculate dynamic radar chart points based on answers
  const radarPoints = React.useMemo(() => {
    const base = { OFF: 35, SAL: 35, OPS: 35, INV: 35, TEC: 35 };
    
    if (track === 'business') {
      base.OFF = 45 + 15 * score;
      base.SAL = 40 + 12 * score;
      base.OPS = 35 + 10 * score;
      base.TEC = 35 + 5 * score;
      base.INV = 30 + 5 * score;
    } else if (track === 'investing') {
      base.INV = 45 + 15 * score;
      base.OPS = 35 + 10 * score;
      base.TEC = 35 + 10 * score;
      base.OFF = 30 + 5 * score;
      base.SAL = 30 + 5 * score;
    } else { // ai
      base.TEC = 45 + 15 * score;
      base.OFF = 35 + 12 * score;
      base.OPS = 35 + 10 * score;
      base.SAL = 35 + 5 * score;
      base.INV = 30 + 5 * score;
    }
    
    // Normalize maximum score to 95 for aesthetics
    return {
      OFF: Math.min(95, base.OFF),
      SAL: Math.min(95, base.SAL),
      OPS: Math.min(95, base.OPS),
      INV: Math.min(95, base.INV),
      TEC: Math.min(95, base.TEC)
    };
  }, [track, score]);

  // Center & Radius for Radar Chart SVG
  const cx = 110;
  const cy = 110;
  const r = 85;

  const axes = [
    { label: 'OFERTA (OFF)', key: 'OFF' as const },
    { label: 'VENTAS (SAL)', key: 'SAL' as const },
    { label: 'OPERACIONES (OPS)', key: 'OPS' as const },
    { label: 'INVERSIÓN (INV)', key: 'INV' as const },
    { label: 'TECNOLOGÍA (TEC)', key: 'TEC' as const }
  ];

  // Map axes to 2D coordinates
  const getCoordinates = (index: number, val: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const factor = val / 100;
    return {
      x: cx + r * factor * Math.cos(angle),
      y: cy + r * factor * Math.sin(angle)
    };
  };

  // Generate grid lines coordinates (pentagons at 25%, 50%, 75%, 100%)
  const gridLevels = [25, 50, 75, 100];
  const gridPaths = gridLevels.map(level => {
    return axes.map((_, i) => {
      const coord = getCoordinates(i, level);
      return `${coord.x},${coord.y}`;
    }).join(' ') + ' z';
  });

  // User's polygon path
  const userPath = axes.map((axis, i) => {
    const val = radarPoints[axis.key];
    const coord = getCoordinates(i, val);
    return `${coord.x},${coord.y}`;
  }).join(' ') + ' z';

  return (
    <div className="w-full h-full bg-[#020204] text-white flex flex-col justify-between pt-[calc(1rem+var(--safe-top-inset,env(safe-area-inset-top)))] pb-[calc(1.5rem+var(--safe-bottom-inset,env(safe-area-inset-bottom)))] px-6 relative z-50 overflow-hidden">
      {/* Neon Atmosphere Glows */}
      <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full blur-[120px] bg-[var(--accent-glow)] opacity-10 pointer-events-none" />
      
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        {/* Title */}
        <div className="text-center space-y-1 mb-5">
          <span className="text-[9px] font-black font-mono text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5">
            <Sparkles size={10} className="text-accent" /> ADN Predator Analizado
          </span>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none mt-2">
            Tu Perfil Táctico
          </h1>
        </div>

        {/* Dynamic SVG Radar Chart */}
        <div className="relative w-[220px] h-[220px] mb-6 flex items-center justify-center bg-black/20 rounded-full border border-white/[0.03] p-4 shadow-inner">
          <svg width="220" height="220" className="overflow-visible">
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Draw Pentagonal Grid Lines */}
            {gridPaths.map((path, idx) => (
              <polygon
                key={idx}
                points={path}
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
              />
            ))}

            {/* Draw Radial Axes Lines */}
            {axes.map((_, i) => {
              const outerCoord = getCoordinates(i, 100);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={outerCoord.x}
                  y2={outerCoord.y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              );
            })}

            {/* User Competency Polygon */}
            <motion.polygon
              points={userPath}
              fill="rgba(204, 255, 0, 0.15)"
              stroke="var(--accent-main)"
              strokeWidth="2.5"
              filter="url(#glow)"
              style={{
                stroke: 'var(--accent-main)',
                fill: 'var(--accent-glow)'
              }}
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            />

            {/* Value dots */}
            {axes.map((axis, i) => {
              const val = radarPoints[axis.key];
              const coord = getCoordinates(i, val);
              return (
                <motion.circle
                  key={i}
                  cx={coord.x}
                  cy={coord.y}
                  r="3.5"
                  fill="var(--accent-main)"
                  stroke="#020204"
                  strokeWidth="1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                />
              );
            })}

            {/* Axis text labels */}
            {axes.map((axis, i) => {
              const coord = getCoordinates(i, 114);
              const isTop = i === 0;
              const isRight = i === 1 || i === 2;
              const isLeft = i === 3 || i === 4;
              
              let textAnchor: "start" | "end" | "inherit" | "middle" = 'middle';
              let dy = '0.35em';
              
              if (isRight) textAnchor = 'start';
              if (isLeft) textAnchor = 'end';
              if (isTop) dy = '-0.4em';
              if (i === 2) dy = '0.8em';
              if (i === 3) dy = '0.8em';

              return (
                <text
                  key={i}
                  x={coord.x}
                  y={coord.y}
                  fill="rgba(255, 255, 255, 0.4)"
                  fontSize="7"
                  fontWeight="900"
                  fontFamily="monospace"
                  textAnchor={textAnchor}
                  dy={dy}
                  className="tracking-widest uppercase"
                >
                  {axis.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Archetype Details Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="w-full bg-white/[0.02] border border-white/10 rounded-[2rem] p-5 text-left relative overflow-hidden shadow-2xl"
        >
          {/* Neon side border indicator */}
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[var(--accent-main)]" />

          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-[7px] font-black font-mono text-zinc-500 uppercase tracking-wider block mb-0.5">Arquetipo Asignado</span>
              <h3 className="text-lg font-black uppercase text-white tracking-tight leading-none">{archetype.title}</h3>
            </div>
            <span className={`text-[8px] font-mono font-black border px-2 py-0.5 rounded-full uppercase tracking-widest ${archetype.badgeColor}`}>
              {archetype.rank}
            </span>
          </div>

          <p className="text-xs text-zinc-400 font-medium leading-relaxed font-sans mt-3">
            {archetype.description}
          </p>
        </motion.div>
      </div>

      {/* Continue Action Button */}
      <div className="w-full max-w-md mx-auto mt-6">
        <button
          onClick={onNext}
          className="w-full py-5 rounded-2xl btn-gamified-3d flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97]"
        >
          Desbloquear Primera Misión <ArrowRight size={18} className="stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
