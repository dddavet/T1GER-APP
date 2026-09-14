import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Cpu,
  Robot,
  ShieldCheck,
  Database,
  Globe,
  Briefcase,
  RocketLaunch,
  Handshake,
  TrendUp,
  Lightning,
  Bank,
  Crown,
  Sword,
  Compass,
  Atom,
  Planet,
  Dna,
  Heartbeat,
  Brain,
  Lightbulb,
  Users,
  Scales,
  ChatCircleDots,
  Target,
  ArrowRight,
  Sparkle,
  TreeStructure,
} from '@phosphor-icons/react';
import type { KinnuDomain, KinnuPathway } from '../../services/curriculumCatalog';
import { isPathwayAvailable } from '../../services/curriculumCatalog';
import { SoundEffects } from '../../services/soundEffects';

// Icon resolver for dynamic pathway & domain icons
export const resolveCurriculumIcon = (name: string, size = 20, weight: 'bold' | 'fill' | 'regular' = 'bold') => {
  const map: Record<string, React.ComponentType<any>> = {
    Cpu,
    Robot,
    ShieldCheck,
    Database,
    Globe,
    Briefcase,
    RocketLaunch,
    Handshake,
    TrendUp,
    Lightning,
    Bank,
    Crown,
    Sword,
    Compass,
    Atom,
    Planet,
    Dna,
    Heartbeat,
    Brain,
    Lightbulb,
    Users,
    Scales,
    ChatCircleDots,
    Target,
  };
  const Component = map[name] || Sparkle;
  return <Component size={size} weight={weight} />;
};

interface KnowledgeTreeProps {
  domain: KinnuDomain;
  activePathwayId?: string;
  locale: 'es' | 'en';
  onSelectPathway: (pathway: KinnuPathway) => void;
}

export const KnowledgeTree: React.FC<KnowledgeTreeProps> = ({
  domain,
  activePathwayId,
  locale,
  onSelectPathway,
}) => {
  const tr = (es: string, en: string) => (locale === 'es' ? es : en);
  const reducedMotion = useReducedMotion();

  return (
    <div className="w-full relative px-2 py-3">
      {/* Duolingo-style Quality Promise Banner */}
      <div className="mb-4 mx-auto max-w-md rounded-2xl bg-gradient-to-r from-white/[0.04] via-orange-500/[0.08] to-white/[0.04] border border-orange-500/25 px-3.5 py-2.5 text-left flex items-center gap-2.5 shadow-sm">
        <span className="text-xl">🏆</span>
        <div>
          <div className="text-[10px] font-mono font-black uppercase tracking-wider text-orange-400">
            {tr('ESTÁNDAR T1GER // FORMATO DUOLINGO', 'T1GER STANDARD // DUOLINGO FORMAT')}
          </div>
          <div className="text-[11px] text-zinc-300 font-medium leading-tight">
            {tr(
              'Tomamos la mejor educación de internet y la organizamos en micro-orbes de 3 minutos con retención activa.',
              'The internet’s highest-impact insights organized into 3-minute active-recall micro-orbs.'
            )}
          </div>
        </div>
      </div>

      {/* Central Domain Node (The Tree Root) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          boxShadow: reducedMotion
            ? `0 0 25px ${domain.glowColor}`
            : [
                `0 0 20px ${domain.glowColor}`,
                `0 0 35px ${domain.glowColor}`,
                `0 0 20px ${domain.glowColor}`,
              ],
        }}
        transition={{
          y: { duration: 0.25 },
          boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="relative mx-auto max-w-sm rounded-2xl border p-4 text-center backdrop-blur-md overflow-hidden mb-6"
        style={{
          borderColor: `${domain.accentColor}50`,
          backgroundColor: '#121216',
        }}
      >
        {/* Subtle top glow bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: domain.accentColor }}
        />

        <div className="flex items-center justify-center gap-2 mb-1.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: `${domain.accentColor}25`, color: domain.accentColor }}
          >
            {resolveCurriculumIcon(domain.iconName, 18, 'bold')}
          </div>
          <span
            className="text-[11px] font-mono font-black uppercase tracking-widest"
            style={{ color: domain.accentColor }}
          >
            {tr('Árbol del Saber', 'Knowledge Tree')} · {domain.title[locale]}
          </span>
        </div>

        <p className="text-xs text-zinc-300 font-medium">
          {domain.subtitle[locale]}
        </p>

        {/* Vertical stem connecting root to branch cards */}
        <div
          className="w-0.5 h-6 mx-auto mt-3"
          style={{
            background: `linear-gradient(to bottom, ${domain.accentColor}, rgba(255,255,255,0.1))`,
          }}
        />
      </motion.div>

      {/* Pathways Branching Grid / Tree Nodes */}
      <div className="relative space-y-3 max-w-md mx-auto">
        {domain.pathways.map((pathway, index) => {
          const isActive = activePathwayId === pathway.id;
          return (
            <motion.div
              key={pathway.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 28,
                delay: reducedMotion ? 0 : index * 0.05,
              }}
              whileHover={
                reducedMotion
                  ? undefined
                  : { y: -2, transition: { duration: 0.15, ease: 'easeOut' } }
              }
              whileTap={
                reducedMotion
                  ? undefined
                  : { scale: 0.98, transition: { duration: 0.1 } }
              }
              role="button"
              aria-disabled={!isPathwayAvailable(pathway)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (!isPathwayAvailable(pathway)) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  SoundEffects.playTap();
                  onSelectPathway(pathway);
                }
              }}
              onPointerDown={() => {
                if (isPathwayAvailable(pathway)) SoundEffects.playTap();
              }}
              onClick={() => { if (isPathwayAvailable(pathway)) onSelectPathway(pathway); }}
              className={`group relative rounded-2xl border p-4 text-left transition-all duration-200 ease-out cursor-pointer select-none active:scale-[0.98] ${
                isActive
                  ? 'bg-gradient-to-r from-white/[0.08] to-white/[0.03] border-white/40 shadow-[0_0_24px_rgba(255,255,255,0.09)]'
                  : 'bg-[#121216]/80 hover:bg-[#181820] border-white/10 hover:border-white/30 hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.5)]'
              }`}
            >
              {/* Active / Featured indicator left accent */}
              <div
                className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                }`}
                style={{ backgroundColor: domain.accentColor }}
              />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Pathway Icon */}
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105"
                    style={{
                      backgroundColor: `${domain.accentColor}18`,
                      borderColor: `${domain.accentColor}35`,
                      color: domain.accentColor,
                    }}
                  >
                    {resolveCurriculumIcon(pathway.iconName, 22, 'bold')}
                  </div>

                  {/* Title & Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-white group-hover:text-orange-300 transition-colors">
                        {pathway.title[locale]}
                      </h3>
                      {pathway.badge && (
                        <span
                          className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full border"
                          style={{
                            backgroundColor: `${domain.accentColor}20`,
                            borderColor: `${domain.accentColor}40`,
                            color: domain.accentColor,
                          }}
                        >
                          {pathway.badge[locale]}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {pathway.description[locale]}
                    </p>

                    {/* Curated Sources Pedigree Pill */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/5 max-w-full overflow-hidden">
                      <span className="text-orange-400 font-bold shrink-0">✦ {tr('Curado de', 'From')}:</span>
                      <span className="text-zinc-300 truncate">{pathway.curatedSources[locale]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Orbs Count, Difficulty & 3D Tactile CTA */}
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1 font-bold text-zinc-300">
                    <TreeStructure size={13} className="text-zinc-400" />
                    {pathway.orbsCount} {tr('Orbes', 'Orbs')}
                  </span>
                  <span>·</span>
                  <span className="capitalize text-zinc-400">
                    {pathway.difficulty === 'beginner'
                      ? tr('Inicial', 'Beginner')
                      : pathway.difficulty === 'intermediate'
                      ? tr('Intermedio', 'Intermediate')
                      : tr('Avanzado', 'Advanced')}
                  </span>
                </div>

                {/* Duolingo-style 3D Tactile Mini-Button */}
                <motion.div
                  whileTap={{ scale: 0.94 }}
                  className={`flex items-center gap-1.5 font-black text-xs py-1.5 px-3.5 rounded-xl transition-all shadow-sm ${
                    isActive
                      ? 'border'
                      : 'active:translate-y-0.5'
                  }`}
                  style={{
                    backgroundColor: isActive ? `${domain.accentColor}20` : domain.accentColor,
                    borderColor: isActive ? domain.accentColor : 'transparent',
                    color: isActive ? domain.accentColor : '#09090B',
                    boxShadow: isActive ? 'none' : `0 3px 0 ${domain.accentColor}88`,
                  }}
                >
                  <span>{!isPathwayAvailable(pathway) ? tr('Próximamente', 'Coming soon') : isActive ? tr('Ruta activa', 'Active path') : tr('Aprender', 'Start')}</span>
                  <ArrowRight size={13} weight="bold" />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
