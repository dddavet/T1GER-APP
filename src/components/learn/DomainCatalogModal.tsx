import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkle, ArrowRight, CheckCircle, BookOpen } from '@phosphor-icons/react';
import {
  KINNU_DOMAINS,
  isPathwayAvailable,
  type DomainId,
  type KinnuDomain,
  type KinnuPathway,
} from '../../services/curriculumCatalog';
import { resolveCurriculumIcon } from './KnowledgeTree';
import { SoundEffects } from '../../services/soundEffects';

interface DomainCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDomainId: DomainId;
  selectedPathwayId: string;
  locale: 'es' | 'en';
  onSelectPathway: (pathway: KinnuPathway, domain: KinnuDomain) => void;
}

export const DomainCatalogModal: React.FC<DomainCatalogModalProps> = ({
  isOpen,
  onClose,
  selectedDomainId,
  selectedPathwayId,
  locale,
  onSelectPathway,
}) => {
  const tr = (es: string, en: string) => (locale === 'es' ? es : en);
  const [activeTabDomainId, setActiveTabDomainId] = useState<DomainId>(selectedDomainId);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Sync selected domain if changed while closed
  useEffect(() => {
    setActiveTabDomainId(selectedDomainId);
  }, [selectedDomainId, isOpen]);

  // Handle Escape key dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const activeDomain = KINNU_DOMAINS.find(d => d.id === activeTabDomainId) || KINNU_DOMAINS[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex flex-col justify-end sm:justify-center items-center">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="domain-catalog-title"
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-t-[2.25rem] sm:rounded-[2.25rem] bg-[#0E0E12] border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-10 text-white"
          >
            {/* Sheet Handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono font-black uppercase tracking-widest text-orange-400">
                  {tr('Universo del Conocimiento', 'Knowledge Universe')}
                </p>
                <h2 id="domain-catalog-title" className="text-lg sm:text-xl font-black text-white">
                  {tr('Explora Dominios & Rutas', 'Explore Domains & Paths')}
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                onPointerDown={() => SoundEffects.playTap()}
                onClick={onClose}
                aria-label={tr('Cerrar catálogo de dominios', 'Close domain catalog')}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-100 ease-out cursor-pointer active:scale-90"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Domain Tabs Rail */}
            <div className="px-4 py-2.5 bg-black/30 border-b border-white/5 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
              {KINNU_DOMAINS.map(domain => {
                const isActive = activeTabDomainId === domain.id;
                return (
                  <button
                    key={domain.id}
                    onPointerDown={() => SoundEffects.playToggle()}
                    onClick={() => setActiveTabDomainId(domain.id)}
                    className={`flex shrink-0 items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-100 ease-out cursor-pointer select-none active:scale-[0.93] ${
                      isActive
                        ? 'bg-white/15 text-white shadow-sm border'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                    }`}
                    style={{
                      borderColor: isActive ? domain.accentColor : 'transparent',
                    }}
                  >
                    <span style={{ color: isActive ? domain.accentColor : '#A1A1AA' }}>
                      {resolveCurriculumIcon(domain.iconName, 14, 'bold')}
                    </span>
                    <span>{domain.title[locale]}</span>
                  </button>
                );
              })}
            </div>

            {/* Domain Subtitle & Pathways List */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 t1ger-scroll-area">
              <div
                className="p-3 rounded-2xl border mb-2 flex items-center gap-3"
                style={{
                  backgroundColor: `${activeDomain.accentColor}10`,
                  borderColor: `${activeDomain.accentColor}30`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${activeDomain.accentColor}25`, color: activeDomain.accentColor }}
                >
                  {resolveCurriculumIcon(activeDomain.iconName, 20, 'bold')}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{activeDomain.title[locale]}</h3>
                  <p className="text-xs text-zinc-300 leading-snug">{activeDomain.subtitle[locale]}</p>
                </div>
              </div>

              {activeDomain.pathways.map((pathway) => {
                const isCurrent = selectedPathwayId === pathway.id;
                return (
                  <div
                    key={pathway.id}
                    data-pathway-id={pathway.id}
                    role="button"
                    tabIndex={0}
                    aria-disabled={!isPathwayAvailable(pathway)}
                    onPointerDown={() => {
                      if (isPathwayAvailable(pathway)) SoundEffects.playTap();
                    }}
                    onClick={() => {
                      if (!isPathwayAvailable(pathway)) return;
                      onSelectPathway(pathway, activeDomain);
                      onClose();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!isPathwayAvailable(pathway)) return;
                        SoundEffects.playTap();
                        onSelectPathway(pathway, activeDomain);
                        onClose();
                      }
                    }}
                    className={`group relative rounded-2xl border p-3.5 text-left transition-all duration-100 ease-out cursor-pointer select-none active:scale-[0.98] active:translate-y-0.5 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-white/[0.08] to-white/[0.03] border-white/40 shadow-lg'
                        : 'bg-[#14141A] hover:bg-[#1A1A22] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${activeDomain.accentColor}18`,
                          borderColor: `${activeDomain.accentColor}35`,
                          color: activeDomain.accentColor,
                        }}
                      >
                        {resolveCurriculumIcon(pathway.iconName, 20, 'bold')}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors">
                            {pathway.title[locale]}
                          </h4>
                          {!isPathwayAvailable(pathway) && <span className="text-xs text-zinc-400">{tr('Próximamente', 'Coming soon')}</span>}
                          {pathway.badge && (
                            <span
                              className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full border"
                              style={{
                                backgroundColor: `${activeDomain.accentColor}20`,
                                borderColor: `${activeDomain.accentColor}40`,
                                color: activeDomain.accentColor,
                              }}
                            >
                              {pathway.badge[locale]}
                            </span>
                          )}
                          {isCurrent && (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              <CheckCircle size={10} weight="fill" />
                              {tr('Activo', 'Active')}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {pathway.description[locale]}
                        </p>

                        <div className="mt-2 flex items-center gap-2 flex-wrap text-[10px] text-zinc-400">
                          <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                            <BookOpen size={11} />
                            {pathway.orbsCount} {tr('Orbes', 'Orbs')}
                          </span>
                          <span className="flex items-center gap-1 text-orange-300/90 font-mono truncate max-w-[240px]">
                            <Sparkle size={10} weight="fill" className="text-orange-400 shrink-0" />
                            {pathway.curatedSources[locale]}
                          </span>
                        </div>
                      </div>

                      <ArrowRight
                        size={16}
                        className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 mt-2"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
