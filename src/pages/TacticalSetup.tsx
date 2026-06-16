import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, Bed, Droplets, Code, BarChart3, 
  Plus, Trash2, ArrowLeft, Check, Target, 
  Zap, Brain, Rocket, Heart, Book, Coffee
} from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { requestNotificationPermission } from '../services/notificationService';
import { GlassButton } from '../components/ui/apple-tahoe-liquid-glass-button';

const ICON_OPTIONS = [
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Bed', icon: Bed },
  { name: 'Droplets', icon: Droplets },
  { name: 'Code', icon: Code },
  { name: 'BarChart3', icon: BarChart3 },
  { name: 'Target', icon: Target },
  { name: 'Zap', icon: Zap },
  { name: 'Brain', icon: Brain },
  { name: 'Rocket', icon: Rocket },
  { name: 'Heart', icon: Heart },
  { name: 'Book', icon: Book },
  { name: 'Coffee', icon: Coffee },
];

export const TacticalSetup = () => {
  const { setActiveView } = useT1ger();
  const { 
    customHabits, 
    customWorkTasks, 
    customLessonTasks,
    addHabit, 
    addWorkTask, 
    addLessonTask,
    removeTacticalTask 
  } = useBrain();
  const [label, setLabel] = useState('');
  const [type, setType] = useState<'habit' | 'work' | 'lesson'>('habit');
  const [selectedIcon, setSelectedIcon] = useState('Target');

  const haptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const handleAdd = () => {
    if (!label.trim()) return;
    haptic();
    if (type === 'habit') {
      addHabit(label, selectedIcon);
    } else if (type === 'work') {
      addWorkTask(label, selectedIcon);
    } else {
      addLessonTask(label, selectedIcon);
    }
    setLabel('');
  };

  const TaskCard = ({ task, type }: { task: any, type: 'habit' | 'work' | 'lesson' }) => {
    const IconComponent = ICON_OPTIONS.find(i => i.name === task.icon)?.icon || Target;
    const accentColor = type === 'habit' ? 'text-accent' : type === 'work' ? 'text-blue-400' : 'text-purple-400';
    const bgColor = type === 'habit' ? 'bg-accent/5' : type === 'work' ? 'bg-blue-500/5' : 'bg-purple-500/5';
    const borderColor = type === 'habit' ? 'border-accent/10' : type === 'work' ? 'border-blue-500/10' : 'border-purple-500/10';

    return (
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="liquid-glass p-5 rounded-[2rem] flex items-center justify-between border-white/10 group shadow-3d"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl ${bgColor} flex items-center justify-center border ${borderColor} shadow-inner`}>
            <IconComponent className={`w-6 h-6 ${accentColor}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-0.5">{type === 'lesson' ? 'Learning' : 'Operational'}</span>
            <span className="font-black text-sm uppercase tracking-tight text-white">{task.label}</span>
          </div>
        </div>
        <button 
          onClick={() => { haptic(); removeTacticalTask(task.id, type); }}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-800 hover:text-red-500 hover:bg-red-500/10 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-32">
      <div className="max-w-md mx-auto space-y-10">
        
        {/* HEADER */}
        <header className="flex items-center justify-between pt-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
              TACTICAL <span className="text-accent">COMMAND</span>
            </h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Configure your 3-pillar daily protocol</p>
          </div>
          <button 
            onClick={() => { haptic(); setActiveView('home'); }}
            className="w-12 h-12 rounded-2xl liquid-glass flex items-center justify-center border-white/10 hover:border-accent/30 transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </button>
        </header>

        {/* QUICK ADD / BUILDER */}
        <div className="space-y-6">
          <div className="liquid-glass-heavy rounded-[2.5rem] p-8 border-accent/10 shadow-accent relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/5 rounded-full blur-[60px]" />
             
             <div className="relative z-10 space-y-6">
                <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'habit', label: 'Habit', icon: Target },
                    { id: 'lesson', label: 'Lesson', icon: Book },
                    { id: 'work', label: 'Work', icon: Rocket }
                  ].map((btn) => (
                    <button 
                      key={btn.id}
                      onClick={() => { haptic(); setType(btn.id as any); }}
                      className={`flex-1 min-w-[80px] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                        type === btn.id ? 'bg-accent text-black shadow-accent scale-[0.98]' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <btn.icon className="w-3.5 h-3.5" />
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder={`New ${type}...`}
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full bg-white/5 border-b-2 border-white/10 p-4 text-lg font-black uppercase tracking-tighter placeholder:text-zinc-800 focus:outline-none focus:border-accent transition-all"
                  />

                  <div className="grid grid-cols-6 gap-3 pt-2">
                    {ICON_OPTIONS.map((item) => (
                      <button 
                        key={item.name}
                        onClick={() => { haptic(); setSelectedIcon(item.name); }}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all ${
                          selectedIcon === item.name 
                            ? 'bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(204,255,0,0.2)]' 
                            : 'bg-white/5 border-white/5 text-zinc-600 hover:text-zinc-400'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>

                <GlassButton 
                  onClick={handleAdd}
                  disabled={!label.trim()}
                  className="w-full"
                  tone="dark"
                  intensity="strong"
                  glassColor="rgba(245,245,240,0.82)"
                >
                  <Plus className="w-4 h-4" strokeWidth={4} />
                  Deploy To Protocol
                </GlassButton>
             </div>
          </div>
        </div>

        {/* ACTIVE PROTOCOLS */}
        <div className="space-y-12 pb-20">
          {/* HABITS */}
          <section className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-accent px-2">Column 1: Habits</h2>
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode="popLayout">
                {customHabits.map((habit) => (
                  <TaskCard key={habit.id} task={habit} type="habit" />
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* LESSONS */}
          <section className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-purple-400 px-2">Column 2: Lessons</h2>
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode="popLayout">
                {customLessonTasks.map((lesson) => (
                  <TaskCard key={lesson.id} task={lesson} type="lesson" />
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* WORK */}
          <section className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400 px-2">Column 3: Work</h2>
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode="popLayout">
                {customWorkTasks.map((task) => (
                  <TaskCard key={task.id} task={task} type="work" />
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* LOCK IN BUTTON */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="fixed bottom-10 left-6 right-6 z-50"
        >
          <GlassButton
          onClick={() => { haptic(); setActiveView('home'); }}
          className="w-full"
          tone="accent"
          intensity="strong"
        >
          <Check className="w-5 h-5" strokeWidth={4} />
          Lock Tactical Baseline
          </GlassButton>
        </motion.div>
      </div>
    </div>
  );
};
