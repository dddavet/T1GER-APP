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

  // Recurrence states
  const [recurrence, setRecurrence] = useState<'daily' | 'weekdays' | 'weekly' | 'custom'>('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(3);
  const [recurrenceDayOfWeek, setRecurrenceDayOfWeek] = useState<number>(1);

  const haptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const handleAdd = () => {
    if (!label.trim()) return;
    haptic();
    if (type === 'habit') {
      addHabit(label, selectedIcon, recurrence, recurrenceInterval, recurrenceDayOfWeek);
    } else if (type === 'work') {
      addWorkTask(label, selectedIcon, recurrence, recurrenceInterval, recurrenceDayOfWeek);
    } else {
      addLessonTask(label, selectedIcon, recurrence, recurrenceInterval, recurrenceDayOfWeek);
    }
    setLabel('');
    setRecurrence('daily');
  };

  const getRecurrenceLabel = (task: any) => {
    if (!task.recurrence || task.recurrence === 'daily') return '🔄 Diario';
    if (task.recurrence === 'weekdays') return '💼 Lun a Vie';
    if (task.recurrence === 'weekly') {
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return `📅 Sem (${days[task.recurrenceDayOfWeek ?? 1]})`;
    }
    if (task.recurrence === 'custom') {
      return `⚡ Cada ${task.recurrenceInterval ?? 3}d`;
    }
    return '🔄 Diario';
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
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">{type === 'lesson' ? 'Learning' : 'Operational'}</span>
              <span className="text-zinc-700 text-[6px]">•</span>
              <span className="text-[8px] font-black text-cyan-400 tracking-wider uppercase font-mono">{getRecurrenceLabel(task)}</span>
            </div>
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

                {/* Recurrence Strategy Picker */}
                <div className="space-y-3 pt-2">
                  <label className="block text-[8px] font-black uppercase text-zinc-500 tracking-widest text-left">
                    Recurrence Strategy
                  </label>
                  <div className="grid grid-cols-4 gap-2 bg-black/40 border border-white/5 rounded-2xl p-1">
                    {[
                      { id: 'daily', label: 'Diario' },
                      { id: 'weekdays', label: 'Lun-Vie' },
                      { id: 'weekly', label: 'Semanal' },
                      { id: 'custom', label: 'Personalizado' }
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => { haptic(); setRecurrence(r.id as any); }}
                        className={`py-2.5 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          recurrence === r.id 
                            ? 'bg-white/5 border border-white/10 text-white shadow-sm' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>

                  {/* Recurrence Specific Detail Selectors */}
                  <AnimatePresence mode="wait">
                    {recurrence === 'weekly' && (
                      <motion.div
                        key="weekly-select"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 mt-2"
                      >
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Día de ejecución:</span>
                        <select
                          value={recurrenceDayOfWeek}
                          onChange={(e) => setRecurrenceDayOfWeek(parseInt(e.target.value))}
                          className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                        >
                          {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((day, idx) => (
                            <option key={idx} value={idx} className="bg-zinc-950 text-white">{day}</option>
                          ))}
                        </select>
                      </motion.div>
                    )}

                    {recurrence === 'custom' && (
                      <motion.div
                        key="custom-select"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-white/5 mt-2 text-left"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Intervalo de Repetición:</span>
                          <span className="text-xs font-black text-cyan-400 font-mono">Cada {recurrenceInterval} días</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="14"
                          value={recurrenceInterval}
                          onChange={(e) => setRecurrenceInterval(parseInt(e.target.value))}
                          className="w-full accent-cyan-400"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={handleAdd}
                  disabled={!label.trim()}
                  className="w-full bg-white text-black py-5 rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-3d hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 disabled:grayscale"
                >
                  <Plus className="w-4 h-4" strokeWidth={4} />
                  Deploy To Protocol
                </button>
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
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { haptic(); setActiveView('home'); }}
          className="fixed bottom-10 left-6 right-6 z-50 liquid-glass-heavy border-accent/20 py-6 rounded-full font-black uppercase tracking-widest text-sm text-accent shadow-3d-accent flex items-center justify-center gap-3 transition-all"
        >
          <Check className="w-5 h-5" strokeWidth={4} />
          Lock Tactical Baseline
        </motion.button>
      </div>
    </div>
  );
};
