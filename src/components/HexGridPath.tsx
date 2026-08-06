import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Crown, Flame, CheckCircle2, Zap, BookOpen, ChevronRight, Award, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { MISSION_BANK, type BankMission, type CurriculumLevel } from '../services/missionBank';

interface HexGridPathProps {
  onStartMission: (mission: BankMission) => void;
}

export const HexGridPath: React.FC<HexGridPathProps> = ({ onStartMission }) => {
  const { pathData, brainState, language } = useBrain();
  const [selectedLevel, setSelectedLevel] = useState<CurriculumLevel | null>(null);

  const track = pathData.track;
  if (!track || !track.levels) return null;

  // Determine completion states per level
  const getLevelStatus = (level: CurriculumLevel, index: number) => {
    // Mission IDs for learn
    const learnMissionIds = level.days.flatMap(d => d.missionIds);
    const applyMissionId = level.applyNodeId;

    const isLearnDone = learnMissionIds.every(id => brainState.dailySession?.completedIds?.includes(id));
    const isApplyDone = applyMissionId ? brainState.dailySession?.completedIds?.includes(applyMissionId) : false;

    const isUnlocked = index <= pathData.currentLevelIndex;
    const isFullyConquered = isLearnDone && isApplyDone;

    return {
      isUnlocked,
      isLearnDone,
      isApplyDone,
      isFullyConquered,
      learnMissions: MISSION_BANK.filter(m => learnMissionIds.includes(m.id)),
      applyMission: applyMissionId ? MISSION_BANK.find(m => m.id === applyMissionId) : null,
    };
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center py-4 px-2 select-none">
      {/* KINNU-INSPIRED BANNER */}
      <div className="w-full mb-6 p-4 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-black text-white border border-zinc-700/60 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#FF7300]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -top-8 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/50">
                Bipartite Hex Matrix
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800/50 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Kinnu Inspired
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white uppercase italic">
              {language === 'es' ? 'MATRIZ DE CONQUISTA DE HABILIDADES' : 'SKILL CONQUEST MATRIX'}
            </h2>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              {language === 'es' 
                ? 'Cada hexágono une teoría (aprender) con acción real (aplicar).' 
                : 'Every hex fuses theoretical mastery with real-world execution.'}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-around text-[11px] font-mono text-zinc-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <span>{language === 'es' ? 'Aprender (Teoría)' : 'Learn (Theory)'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#ffb800]" />
            <span>{language === 'es' ? 'Aplicar (Acción)' : 'Apply (Action)'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Crown className="w-3 h-3 text-amber-400" />
            <span className="text-amber-300 font-bold">{language === 'es' ? 'Dominado' : 'Conquered'}</span>
          </div>
        </div>
      </div>

      {/* HEXAGON GRID LAYOUT */}
      <div className="w-full flex flex-col items-center gap-8 py-2">
        {track.levels.map((level, index) => {
          const status = getLevelStatus(level, index);
          // Offset alternating rows for honeycomb feel
          const xOffsetClass = index % 2 === 1 ? 'translate-x-6' : '-translate-x-6';

          return (
            <motion.div
              key={level.levelId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative group flex flex-col items-center cursor-pointer transition-transform ${xOffsetClass}`}
              onClick={() => status.isUnlocked && setSelectedLevel(level)}
            >
              {/* Connector line to next node */}
              {index < track.levels.length - 1 && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 w-1 h-12 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 -z-10 rounded-full" />
              )}

              {/* 3D HEXAGON NODE */}
              <motion.div 
                whileHover={status.isUnlocked ? { scale: 1.08, rotate: 2 } : { scale: 0.98 }}
                whileTap={status.isUnlocked ? { scale: 0.95 } : {}}
                className="relative w-36 h-40 flex items-center justify-center filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
              >
                {/* SVG Hexagon Shape with Bipartite Split Glow */}
                <svg viewBox="0 0 100 115" className="w-full h-full">
                  <defs>
                    {/* Left half gradient (Learn) */}
                    <linearGradient id={`grad-left-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={status.isLearnDone ? "#06b6d4" : "#1e293b"} />
                      <stop offset="100%" stopColor={status.isLearnDone ? "#0891b2" : "#0f172a"} />
                    </linearGradient>
                    {/* Right half gradient (Apply) */}
                    <linearGradient id={`grad-right-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={status.isApplyDone ? "#f59e0b" : "#1e293b"} />
                      <stop offset="100%" stopColor={status.isApplyDone ? "#d97706" : "#0f172a"} />
                    </linearGradient>
                    {/* Full Conquered Gold Gradient */}
                    <linearGradient id={`grad-conquered-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                  </defs>

                  {/* Outer Border / Glow Polygon */}
                  <polygon
                    points="50,3 95,28 95,85 50,110 5,85 5,28"
                    fill={status.isFullyConquered ? `url(#grad-conquered-${index})` : "#09090b"}
                    stroke={
                      status.isFullyConquered 
                        ? "#fef08a" 
                        : status.isUnlocked 
                        ? (status.isLearnDone ? "#06b6d4" : "#3f3f46")
                        : "#27272a"
                    }
                    strokeWidth={status.isFullyConquered ? "4" : "3"}
                    className="transition-colors duration-500"
                  />

                  {/* Internal Bipartite Split (if unlocked and not fully conquered) */}
                  {status.isUnlocked && !status.isFullyConquered && (
                    <g>
                      {/* Left Half (Learn) */}
                      <path
                        d="M 50,6 L 8,29 L 8,84 L 50,107 Z"
                        fill={`url(#grad-left-${index})`}
                        opacity={status.isLearnDone ? "0.9" : "0.4"}
                      />
                      {/* Right Half (Apply) */}
                      <path
                        d="M 50,6 L 92,29 L 92,84 L 50,107 Z"
                        fill={`url(#grad-right-${index})`}
                        opacity={status.isApplyDone ? "0.9" : "0.4"}
                      />
                      {/* Center Divider Line */}
                      <line x1="50" y1="6" x2="50" y2="107" stroke="#000000" strokeWidth="2" strokeDasharray="3,3" opacity="0.6" />
                    </g>
                  )}
                </svg>

                {/* NODE ICON & CONTENT */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 z-10">
                  {status.isFullyConquered ? (
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }} 
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="flex flex-col items-center text-zinc-950"
                    >
                      <Crown className="w-8 h-8 fill-zinc-950 text-zinc-950 drop-shadow-md" />
                      <span className="text-[10px] font-black tracking-wider uppercase mt-1">DOMINADO</span>
                    </motion.div>
                  ) : !status.isUnlocked ? (
                    <div className="flex flex-col items-center text-zinc-600">
                      <Lock className="w-7 h-7 mb-1 opacity-60" />
                      <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500">NIVEL {level.levelNumber}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${status.isLearnDone ? 'bg-cyan-400 shadow-[0_0_8px_#00f0ff]' : 'bg-zinc-700'}`} />
                        <span className={`w-2.5 h-2.5 rounded-full ${status.isApplyDone ? 'bg-amber-400 shadow-[0_0_8px_#ffb800]' : 'bg-zinc-700'}`} />
                      </div>
                      <span className="text-xs font-black italic tracking-tighter text-white uppercase drop-shadow">
                        NIVEL {level.levelNumber}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-300 line-clamp-1 max-w-[85px] leading-tight mt-0.5">
                        {level.title}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* NODE TITLE BADGE BELOW */}
              <div className="mt-2 text-center max-w-[140px]">
                <h4 className="text-xs font-black text-zinc-800 uppercase italic tracking-tight">
                  {level.title}
                </h4>
                <p className="text-[10px] font-medium text-zinc-500 line-clamp-1">
                  {level.subtitle}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* INTERACTIVE LEVEL DETAIL MODAL */}
      <AnimatePresence>
        {selectedLevel && (() => {
          const status = getLevelStatus(selectedLevel, track.levels.indexOf(selectedLevel));
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
              onClick={() => setSelectedLevel(null)}
            >
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-zinc-950 rounded-3xl border border-zinc-800 p-6 text-white shadow-2xl overflow-hidden relative"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedLevel(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 font-black text-xl shadow-lg">
                    {selectedLevel.levelNumber}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono">
                      MÓDULO DE NEGOCIO BIFÁSICO
                    </span>
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-white">
                      {selectedLevel.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 mb-6 font-medium border-l-2 border-amber-500 pl-3">
                  {selectedLevel.subtitle}
                </p>

                {/* BIPARTITE NODES CONTAINER */}
                <div className="space-y-4">
                  {/* FASE 1: TEORÍA / APRENDER */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    status.isLearnDone 
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                      : 'bg-zinc-900 border-zinc-800'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase font-bold text-cyan-400">Fase 1: Conocimiento</span>
                          <h4 className="text-sm font-bold text-white">Lecciones de Teoría</h4>
                        </div>
                      </div>
                      {status.isLearnDone ? (
                        <div className="flex items-center gap-1 text-cyan-400 text-xs font-bold bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completado
                        </div>
                      ) : (
                        <span className="text-xs font-mono font-bold text-zinc-400">+100 XP</span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 mb-3">
                      Domina los principios conceptuales antes de entrar al mercado real.
                    </p>

                    {status.learnMissions.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedLevel(null);
                          onStartMission(m);
                        }}
                        className="w-full mt-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-between transition-colors shadow-lg"
                      >
                        <span>{m.title}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ))}
                  </div>

                  {/* FASE 2: ACCIÓN REAL / APLICAR */}
                  {status.applyMission && (
                    <div className={`p-4 rounded-2xl border transition-all ${
                      status.isApplyDone 
                        ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                        : 'bg-zinc-900 border-zinc-800'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                            <Zap className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase font-bold text-amber-400 flex items-center gap-1">
                              Fase 2: Acción Real 
                              {status.applyMission.verificationTier === 1 && (
                                <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.2 text-[8px] rounded border border-emerald-800">Verified Tier 1</span>
                              )}
                            </span>
                            <h4 className="text-sm font-bold text-white">{status.applyMission.title}</h4>
                          </div>
                        </div>
                        {status.isApplyDone ? (
                          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-950 px-2.5 py-1 rounded-full border border-amber-800">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Conquistado
                          </div>
                        ) : (
                          <span className="text-xs font-mono font-bold text-amber-400">+500 XP</span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 mb-3">
                        {status.applyMission.taskBrief}
                      </p>

                      <button
                        onClick={() => {
                          setSelectedLevel(null);
                          onStartMission(status.applyMission!);
                        }}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-between transition-colors shadow-xl"
                      >
                        <span className="flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-zinc-950 fill-zinc-950" />
                          Ejecutar Acción Táctica
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};
