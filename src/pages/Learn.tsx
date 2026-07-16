import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, ChevronRight, Cpu, Gamepad2, LineChart, Play, X, Flame } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { WindingPath } from '../components/WindingPath';
import { CURRICULUM_TRACKS } from '../services/missionBank';

const trackMeta = {
  investing: { icon: LineChart, label: 'Investing', color: '#FF7300' },
  business: { icon: BookOpen, label: 'Business', color: '#FF7300' },
  ai: { icon: Cpu, label: 'Artificial Intelligence', color: '#c084fc' },
};

export const Learn = ({ onStartMission }: { onStartMission?: (mission: any) => void }) => {
  const { pathData, currentTrackId, selectTrack, brainState } = useBrain();
  const { appUser, updateAppUser } = useAuth();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const meta = trackMeta[currentTrackId];
  const TrackIcon = meta.icon;
  const currentLevel = pathData.track.levels[pathData.currentLevelIndex] || pathData.track.levels[0];
  const totalDays = pathData.track.levels.reduce((total, level) => total + level.days.length, 0);
  const completedDays = brainState.completedDayIds.filter(id => id.startsWith(`${currentTrackId.slice(0, 3)}-`)).length;
  const completion = Math.min(100, Math.round((completedDays / Math.max(totalDays, 1)) * 100));
  const plan = appUser?.personalizedPlan;

  return (
    <div className="-mx-5 min-h-full bg-white pb-28 text-zinc-800">
      {/* Duolingo-style Stage/Section Floating Header */}
      <div className="sticky top-4 z-40 px-4 mb-8">
        <motion.button 
          whileTap={{ scale: 0.96 }}
          className="w-full px-5 py-4 shadow-xl rounded-3xl text-left outline-none border-b-4 border-black/20 backdrop-blur-md relative overflow-hidden"
          style={{ backgroundColor: meta.color || '#10B981', color: 'white' }}
          onClick={() => setIsSelectorOpen(true)}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-1 opacity-90">
              <span className="text-[11px] font-black uppercase tracking-widest text-white/90">
                STAGE {currentLevel?.levelNumber || 1}, SECTION {pathData.currentDayIndex + 1}
              </span>
              <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-full shadow-inner">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                <span className="text-[11px] font-black tracking-wider text-orange-100">67</span>
              </div>
            </div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black leading-tight">
              {currentLevel?.title || 'Introduction to Investing'}
            </h1>
            <div className="bg-white/20 p-1 rounded-full">
              <ChevronRight className="h-5 w-5 rotate-90" />
            </div>
          </div>
        </div>
        </motion.button>
      </div>

      <main className="px-5 pt-5 flex justify-center">
        <WindingPath onStart={onStartMission} />
      </main>

      <AnimatePresence>
        {isSelectorOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-white backdrop-blur-sm backdrop-blur-md">
            <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-zinc-200 bg-white p-6 pb-12">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-black">Select Track</h2>
                <button type="button" onClick={() => setIsSelectorOpen(false)} className="rounded-full bg-zinc-100 p-2 text-zinc-500">
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
                      className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-colors ${isCurrent ? 'border-[#FF7300] bg-[#FF7300]/10' : 'border-zinc-200 bg-zinc-100 opacity-50'}`}
                      disabled={track.levels.length === 0}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isCurrent ? 'bg-[#FF7300] text-black' : 'bg-zinc-50'}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold">{track.title}</h3>
                            {track.levels.length === 0 && <span className="rounded bg-zinc-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-zinc-500">Soon</span>}
                          </div>
                          <p className="text-xs text-zinc-500">{track.levels.length} Levels</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
