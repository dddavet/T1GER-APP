import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, Target, Zap, Flame, Coffee, 
  Dumbbell, Bed, Droplets, Brain, Rocket, 
  Book, ArrowRight, ShieldCheck, Info
} from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { buildRescueProtocolSelection } from '../services/brainService';
import { STANDARD_HABITS } from '../services/missionBank';
import { GlassButton } from './ui/apple-tahoe-liquid-glass-button';

const ICON_MAP: Record<string, any> = {
  Dumbbell, Bed, Droplets, Brain, Rocket, Book, Flame, Zap, Target, Coffee
};

export const DailyCommitment = () => {
  const { 
    customHabits, 
    customWorkTasks, 
    customLessonTasks,
    commitTactical, 
    dailyTacticalStatus, 
    setDayType 
  } = useBrain();
  
  const [selectedHabits, setSelectedHabits] = useState<string[]>(
    dailyTacticalStatus.committedHabitIds.length > 0 
      ? dailyTacticalStatus.committedHabitIds 
      : ['sh1', 'sh2', 'sh5'] // Defaults
  );
  
  const [selectedWork, setSelectedWork] = useState<string[]>(
    dailyTacticalStatus.committedWorkIds.length > 0 
      ? dailyTacticalStatus.committedWorkIds 
      : customWorkTasks.map(w => w.id)
  );

  const [selectedLessons, setSelectedLessons] = useState<string[]>(
    dailyTacticalStatus.committedLessonIds?.length > 0 
      ? dailyTacticalStatus.committedLessonIds 
      : customLessonTasks.map(l => l.id)
  );

  const haptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const toggleHabit = (id: string) => {
    haptic();
    setSelectedHabits(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleWork = (id: string) => {
    haptic();
    setSelectedWork(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleLesson = (id: string) => {
    haptic();
    setSelectedLessons(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCommit = () => {
    haptic();
    commitTactical(selectedHabits, selectedWork, selectedLessons);
  };

  const handleRescueProtocol = () => {
    haptic();
    const rescue = buildRescueProtocolSelection({
      availableHabitIds: STANDARD_HABITS.map(habit => habit.id),
      workTasks: customWorkTasks,
      lessonTasks: customLessonTasks,
    });

    setDayType(rescue.dayType);
    setSelectedHabits(rescue.habitIds);
    setSelectedWork(rescue.workIds);
    setSelectedLessons(rescue.lessonIds);
    commitTactical(rescue.habitIds, rescue.workIds, rescue.lessonIds);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-[#050505] overflow-y-auto">
      <div className="max-w-md mx-auto p-6 pb-40 space-y-10">
        
        {/* HEADER */}
        <div className="space-y-4 pt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-accent">
            <ShieldCheck className="w-5 h-5 shadow-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Readiness</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
            MORNING <br/>
            <span className="text-accent">BRIEFING</span>
          </h1>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-tight leading-relaxed max-w-[280px] mx-auto">
            Select your tactical priorities. Every choice defines your performance metrics for the next 24 hours.
          </p>
        </div>

        {/* DAY TYPE SELECTION */}
        <div className="space-y-4">
           <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 px-1">Protocol Intensity</h2>
           <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'rest', label: 'Relaxed', icon: Coffee, color: 'text-blue-400' },
              { id: 'normal', label: 'Focused', icon: Target, color: 'text-accent' },
              { id: 'beast', label: 'Beast', icon: Flame, color: 'text-accent' },
            ].map((d) => (
              <button 
                key={d.id}
                onClick={() => { haptic(); setDayType(d.id as any); }}
                className={`flex flex-col items-center gap-3 p-5 rounded-[2rem] border transition-all shadow-3d active:scale-95 ${
                  dailyTacticalStatus.dayType === d.id 
                    ? `liquid-glass-accent border-accent/20 shadow-3d-accent` 
                    : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100'
                }`}
              >
                <d.icon className={`w-6 h-6 ${d.color} ${dailyTacticalStatus.dayType === d.id ? 'drop-shadow-[0_0_8px_var(--accent-glow)]' : ''}`} />
                <span className="text-[9px] font-black uppercase tracking-widest">{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* RESCUE PROTOCOL */}
        <div className="liquid-glass-heavy rounded-[2rem] p-5 border border-blue-400/15 shadow-3d space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[1.25rem] bg-blue-400/10 border border-blue-400/20 text-blue-400 flex items-center justify-center shadow-inner">
              <Coffee className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-black uppercase tracking-tight text-white">Rescue Protocol</h2>
                <span className="text-[8px] font-black text-blue-300 uppercase tracking-widest bg-blue-400/10 px-2 py-1 rounded-full border border-blue-400/10">Low load</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-wider font-black mt-2">
                One clean rep in each pillar. No dashboard guilt.
              </p>
            </div>
          </div>

          <button
            onClick={handleRescueProtocol}
            className="w-full rounded-full border border-blue-400/20 bg-blue-400/10 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 transition-all hover:bg-blue-400/15 active:scale-95"
          >
            Deploy Rescue Day
          </button>
        </div>

        {/* HABITS COLUMN */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-1">
             <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Habits</h2>
             <span className="text-[8px] font-black text-accent uppercase tracking-widest bg-accent/5 px-2 py-1 rounded-full border border-accent/10">Column 1</span>
           </div>
           <div className="grid grid-cols-1 gap-3">
              {STANDARD_HABITS.map((habit) => {
                const Icon = ICON_MAP[habit.icon] || Target;
                const isSelected = selectedHabits.includes(habit.id);
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all shadow-3d active:scale-[0.98] ${
                      isSelected ? 'liquid-glass border-white/20' : 'bg-white/5 border-transparent opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center shadow-inner border ${isSelected ? 'bg-accent/10 text-accent border-accent/20' : 'bg-zinc-900 text-zinc-600 border-white/5'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-sm font-black uppercase tracking-tight ${isSelected ? 'text-white' : 'text-zinc-600'}`}>{habit.label}</span>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shadow-3d ${isSelected ? 'bg-accent border-accent text-black shadow-3d-accent' : 'border-zinc-800'}`}>
                      {isSelected && <Check className="w-4 h-4" strokeWidth={4} />}
                    </div>
                  </button>
                );
              })}
              {customHabits.map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all shadow-3d active:scale-[0.98] ${
                    selectedHabits.includes(habit.id) ? 'liquid-glass border-white/20' : 'bg-white/5 border-transparent opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center shadow-inner border ${selectedHabits.includes(habit.id) ? 'bg-accent/10 text-accent border-accent/20' : 'bg-zinc-900 text-zinc-600 border-white/5'}`}>
                      <Target className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-black uppercase tracking-tight ${selectedHabits.includes(habit.id) ? 'text-white' : 'text-zinc-600'}`}>{habit.label}</span>
                  </div>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shadow-3d ${selectedHabits.includes(habit.id) ? 'bg-accent border-accent text-black shadow-3d-accent' : 'border-zinc-800'}`}>
                    {selectedHabits.includes(habit.id) && <Check className="w-4 h-4" strokeWidth={4} />}
                  </div>
                </button>
              ))}
           </div>
        </div>

        {/* LESSONS COLUMN */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-1">
             <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Lessons</h2>
             <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest bg-purple-400/5 px-2 py-1 rounded-full border border-purple-400/10">Column 2</span>
           </div>
           <div className="grid grid-cols-1 gap-3">
              {customLessonTasks.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => toggleLesson(lesson.id)}
                  className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all shadow-3d active:scale-[0.98] ${
                    selectedLessons.includes(lesson.id) ? 'liquid-glass border-purple-400/20' : 'bg-white/5 border-transparent opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center shadow-inner border ${selectedLessons.includes(lesson.id) ? 'bg-purple-400/10 text-purple-400 border-purple-400/20' : 'bg-zinc-900 text-zinc-600 border-white/5'}`}>
                      <Book className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-black uppercase tracking-tight ${selectedLessons.includes(lesson.id) ? 'text-white' : 'text-zinc-600'}`}>{lesson.label}</span>
                  </div>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shadow-3d ${selectedLessons.includes(lesson.id) ? 'bg-purple-400 border-purple-400 text-black shadow-3d-accent' : 'border-zinc-800'}`}>
                    {selectedLessons.includes(lesson.id) && <Check className="w-4 h-4" strokeWidth={4} />}
                  </div>
                </button>
              ))}
           </div>
        </div>

        {/* WORK COLUMN */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-1">
             <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Work</h2>
             <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/5 px-2 py-1 rounded-full border border-blue-400/10">Column 3</span>
           </div>
           <div className="grid grid-cols-1 gap-3">
              {customWorkTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleWork(task.id)}
                  className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all shadow-3d active:scale-[0.98] ${
                    selectedWork.includes(task.id) ? 'liquid-glass border-blue-400/20' : 'bg-white/5 border-transparent opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center shadow-inner border ${selectedWork.includes(task.id) ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' : 'bg-zinc-900 text-zinc-600 border-white/5'}`}>
                      <Rocket className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-black uppercase tracking-tight ${selectedWork.includes(task.id) ? 'text-white' : 'text-zinc-600'}`}>{task.label}</span>
                  </div>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shadow-3d ${selectedWork.includes(task.id) ? 'bg-blue-400 border-blue-400 text-black shadow-3d-accent' : 'border-zinc-800'}`}>
                    {selectedWork.includes(task.id) && <Check className="w-4 h-4" strokeWidth={4} />}
                  </div>
                </button>
              ))}
           </div>
        </div>

        {/* FOOTER INFO */}
        <div className="p-6 liquid-glass-heavy rounded-[2.5rem] border border-white/5 flex items-start gap-4 shadow-3d">
          <Info className="w-5 h-5 text-zinc-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-wider font-black">
            The three-pillar protocol is absolute. You are defining your daily output. T1GER rewards consistency, not intentions.
          </p>
        </div>

      </div>

      {/* COMMIT BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent z-10">
        <div className="max-w-md mx-auto">
          <GlassButton
            onClick={handleCommit}
            disabled={selectedHabits.length === 0 && selectedWork.length === 0 && selectedLessons.length === 0}
            className="w-full"
            tone="dark"
            intensity="strong"
            glassColor="color-mix(in srgb, var(--accent-main) 72%, rgba(255,255,255,0.16))"
          >
            Deploy 3-Pillar Protocol
            <ArrowRight className="w-5 h-5" strokeWidth={3} />
          </GlassButton>
        </div>
      </div>
    </div>
  );
};
