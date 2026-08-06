import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, ChevronRight, Cpu, LineChart, X, Flame, Sparkles } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { WindingPath } from '../components/WindingPath';
import { HexGridPath } from '../components/HexGridPath';
import { CURRICULUM_TRACKS } from '../services/missionBank';

const trackMeta = {
  investing: { icon: LineChart, label: 'Investing', color: '#FF7300' },
  business: { icon: BookOpen, label: 'Business', color: '#FF7300' },
  ai: { icon: Cpu, label: 'Artificial Intelligence', color: '#c084fc' },
};

export const Learn = ({ onStartMission }: { onStartMission?: (mission: any) => void }) => {
  const { pathData, currentTrackId, selectTrack, brainState, language } = useBrain();
  const { appUser } = useAuth();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [pathMode, setPathMode] = useState<'hex' | 'snake'>('hex');

  const meta = trackMeta[currentTrackId];
  const currentLevel = pathData.track.levels[pathData.currentLevelIndex] || pathData.track.levels[0];

  return (
    <div className="-mx-5 min-h-full bg-white pb-28 text-zinc-800">
      {/* Stage/Section Floating Header */}
      <div className="sticky top-4 z-40 px-4 mb-4">
        <motion.button 
          whileTap={{ scale: 0.96 }}
          className="w-full px-5 py-4 shadow-xl rounded-3xl text-left outline-none border-b-4 border-black/20 backdrop-blur-md relative overflow-hidden cursor-pointer"
          style={{ backgroundColor: meta.color || '#FF7300', color: 'white' }}
          onClick={() => setIsSelectorOpen(true)}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-1 opacity-90">
              <span className="text-[11px] font-black uppercase tracking-widest text-white/90 font-mono">
                {language === 'es' ? 'ETAPA' : 'STAGE'} {currentLevel?.levelNumber || 1}, {language === 'es' ? 'SECCIÓN' : 'SECTION'} {pathData.currentDayIndex + 1}
              </span>
              <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-full shadow-inner">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                <span className="text-[11px] font-black tracking-wider text-orange-100">67</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black leading-tight uppercase italic tracking-tight">
                {currentLevel?.title || (language === 'es' ? 'Fundamentos de Inversión' : 'Investment Foundations')}
              </h1>
              <div className="bg-white/20 p-1 rounded-full">
                <ChevronRight className="h-5 w-5 rotate-90" />
              </div>
            </div>
          </div>
        </motion.button>
      </div>

      {/* VIEW SWITCHER: KINNU HEX MATRIX VS DUOLINGO SNAKE */}
      <div className="flex items-center justify-center px-4 mb-6">
        <div className="bg-zinc-100 p-1.5 rounded-2xl flex items-center gap-1 border border-zinc-200 shadow-inner w-full max-w-xs">
          <button
            onClick={() => setPathMode('hex')}
            className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              pathMode === 'hex' 
                ? 'bg-zinc-950 text-white shadow-md' 
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <span>⬢ Kinnu Matrix</span>
            <span className="bg-amber-500 text-zinc-950 text-[8px] font-black px-1.5 py-0.2 rounded font-mono">NEW</span>
          </button>
          <button
            onClick={() => setPathMode('snake')}
            className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              pathMode === 'snake' 
                ? 'bg-zinc-950 text-white shadow-md' 
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <span>🐍 Duolingo</span>
          </button>
        </div>
      </div>

      <main className="px-5 flex justify-center">
        {pathMode === 'hex' ? (
          <HexGridPath onStartMission={onStartMission || (() => {})} />
        ) : (
          <WindingPath onStart={onStartMission || (() => {})} />
        )}
      </main>

      {/* Track Selector Modal */}
      <AnimatePresence>
        {isSelectorOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-md flex items-end justify-center"
            onClick={() => setIsSelectorOpen(false)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl border-t border-zinc-200 bg-white p-6 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.2)]"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-black italic uppercase tracking-tight text-zinc-800">
                  {language === 'es' ? 'Seleccionar Ruta' : 'Select Track'}
                </h2>
                <button type="button" onClick={() => setIsSelectorOpen(false)} className="rounded-full bg-zinc-100 p-2 text-zinc-500 hover:bg-zinc-200 transition-colors cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid gap-3">
                {Object.values(CURRICULUM_TRACKS).map(track => {
                  const Icon = trackMeta[track.trackId].icon;
                  const isCurrent = currentTrackId === track.trackId;
                  return (
                    <button
                      key={track.trackId}
                      type="button"
                      onClick={() => { selectTrack(track.trackId); setIsSelectorOpen(false); }}
                      className={`flex items-center justify-between rounded-2xl border-2 p-4 text-left transition-all cursor-pointer ${
                        isCurrent ? 'border-[#FF7300] bg-[#FF7300]/10 border-b-4 shadow-md' : 'border-zinc-200 bg-zinc-50 hover:bg-white border-b-4 border-b-zinc-300'
                      }`}
                      disabled={track.levels.length === 0}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold ${isCurrent ? 'bg-[#FF7300] text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-sm uppercase tracking-tight text-zinc-800">{track.title}</h3>
                            {track.levels.length === 0 && (
                              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                                {language === 'es' ? 'Próximamente' : 'Soon'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-zinc-500 mt-0.5">
                            {track.levels.length} {language === 'es' ? 'Niveles' : 'Levels'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
