import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, ChevronRight, Cpu, Gamepad2, LineChart, Play, X } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { WindingPath } from '../components/WindingPath';
import { CURRICULUM_TRACKS } from '../services/missionBank';

const trackMeta = {
  investing: { icon: LineChart, label: 'Investing', color: '#FF7300' },
  business: { icon: BookOpen, label: 'Business', color: '#FF7300' },
  ai: { icon: Cpu, label: 'Artificial Intelligence', color: '#c084fc' },
};

const learningModes = [
  { id: 'text', label: 'Read', icon: BookOpen },
  { id: 'visual', label: 'Watch', icon: Play },
  { id: 'interactive', label: 'Practice', icon: Gamepad2 },
] as const;

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
      <header className="border-b border-zinc-200 px-5 pb-6 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FF7300]/25 bg-[#FF7300]/10 text-[#FF7300]">
              <TrackIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-zinc-500">Active Track</p>
              <h1 className="text-lg font-black leading-5">{meta.label}</h1>
            </div>
          </div>
          <button type="button" onClick={() => setIsSelectorOpen(true)} className="flex min-h-10 items-center gap-1 rounded-xl border border-zinc-200 px-3 text-xs font-bold text-zinc-600">
            Change <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase text-[#FF7300]">Today's Session</p>
            <h2 className="max-w-[260px] text-[1.7rem] font-black leading-[1.08]">Learn an idea. Use it in a decision.</h2>
          </div>
          <div className="shrink-0 text-right">
            <strong className="block text-xl text-[#FF7300]">{appUser?.dailyTime || 10}</strong>
            <span className="text-xs text-zinc-500">minutes</span>
          </div>
        </div>
      </header>

      <main className="px-5 pt-5">
        {plan && (
          <section className="mb-5 rounded-2xl border border-zinc-200 bg-white shadow-sm p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">Personal Plan</p>
                <h3 className="text-sm font-bold">{plan.title}</h3>
              </div>
              <span className="rounded-lg bg-[#FF7300]/10 px-2.5 py-1 text-xs font-bold text-[#FF7300]">{completion}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-50">
              <div className="h-full rounded-full bg-[#FF7300]" style={{ width: `${Math.max(completion, 3)}%` }} />
            </div>
            <p className="mt-3 text-xs leading-5 text-zinc-500">Now: {currentLevel?.title || 'Foundations'} · {plan.focusAreas[0]}</p>
          </section>
        )}

        <div className="mb-8 grid grid-cols-3 gap-1 rounded-2xl border border-zinc-200 bg-white shadow-sm p-1">
          {learningModes.map(mode => {
            const Icon = mode.icon;
            const selected = appUser?.learningStyle === mode.id || (!appUser?.learningStyle && mode.id === 'text');
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => updateAppUser({ learningStyle: mode.id })}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-xs font-bold transition-colors ${selected ? 'bg-[#FF7300] text-black' : 'text-zinc-500'}`}
              >
                <Icon className="h-4 w-4" /> {mode.label}
              </button>
            );
          })}
        </div>

        <div className="mb-5">
          <p className="mb-1 text-xs font-bold uppercase text-[#FF7300]">Your Progress</p>
          <h2 className="text-xl font-black">Learning Path</h2>
          <p className="mt-1 text-sm text-zinc-500">Complete each node to unlock the next.</p>
        </div>

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
