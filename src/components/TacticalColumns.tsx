import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, Check, Trophy, Dumbbell, Droplets, Bed, 
  Code, BarChart3, AlertCircle, Target, Zap, Brain, 
  Rocket, Heart, Book, Coffee, Flame 
} from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { TacticalProofModal } from './TacticalProofModal';
import { STANDARD_HABITS } from '../services/missionBank';

const ICON_MAP: Record<string, any> = {
  Dumbbell, Bed, Droplets, Code, BarChart3, Target, 
  Zap, Brain, Rocket, Heart, Book, Coffee, Flame
};

export const TacticalColumns = ({ onTaskComplete }: { onTaskComplete: () => void }) => {
  const { addXP } = useT1ger();
  const { 
    customHabits, 
    customWorkTasks, 
    customLessonTasks,
    dailyTacticalStatus, 
    submitTacticalProof,
    language
  } = useBrain();
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const getTaskData = (type: 'habit' | 'work' | 'lesson') => {
    let tasks: any[] = [];
    if (type === 'habit') {
      tasks = [
        ...STANDARD_HABITS.filter(h => dailyTacticalStatus.committedHabitIds.includes(h.id)).map(h => ({ ...h, type: 'habit' })),
        ...customHabits.filter(h => dailyTacticalStatus.committedHabitIds.includes(h.id)).map(h => ({ ...h, type: 'habit' }))
      ];
    } else if (type === 'work') {
      tasks = customWorkTasks.filter(w => dailyTacticalStatus.committedWorkIds.includes(w.id)).map(w => ({ ...w, type: 'work' }));
    } else if (type === 'lesson') {
      tasks = customLessonTasks.filter(l => dailyTacticalStatus.committedLessonIds?.includes(l.id)).map(l => ({ ...l, type: 'lesson' }));
    }

    return tasks.map(t => ({ ...t, completed: dailyTacticalStatus.completedIds.includes(t.id) }));
  };

  const handleVerify = (id: string, proofUrl?: string, proofText?: string, verified: boolean = true) => {
    submitTacticalProof(id, proofUrl, proofText, verified);
    
    // Find task
    const allTasks = [...getTaskData('habit'), ...getTaskData('lesson'), ...getTaskData('work')];
    const task = allTasks.find(t => t.id === id);
    const createdTime = (task as any)?.createdAt || Date.now();
    const hoursElapsed = (Date.now() - createdTime) / (1000 * 60 * 60);

    // Reward XP based on Day Type
    let baseXP = 20;
    if (dailyTacticalStatus.dayType === 'beast') baseXP = 40;
    if (dailyTacticalStatus.dayType === 'rest') baseXP = 10;
    
    let multiplier = 1.0;
    if (hoursElapsed <= 24) {
      multiplier = 1.5; // Velocity Speed Bonus
    } else {
      const daysLate = Math.floor(hoursElapsed / 24);
      multiplier = Math.max(0.2, 1.0 - (daysLate * 0.2)); // 20% decay per day
    }

    const xpAmount = Math.round(baseXP * multiplier);
    addXP(xpAmount);
    setSelectedTask(null);
    onTaskComplete();
  };

  const haptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(12);
    }
  };

  const Column = ({ title, type, color, icon: HeaderIcon }: { title: string, type: any, color: string, icon: any }) => {
    const tasks = getTaskData(type);
    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = Math.max(1, tasks.length);
    const progress = completedCount / totalCount;

    return (
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[1.25rem] bg-zinc-50 border border-zinc-200 shadow-inner`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color} bg-current/12 border border-current/20`}>
            <HeaderIcon className="w-4 h-4" />
          </div>
          <h3 className={`text-[10px] font-black uppercase tracking-[0.25em] ${color}`}>{title}</h3>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="text-[9px] font-mono text-zinc-500">{completedCount}/{totalCount}</span>
            <div className="w-14 h-1.5 bg-white rounded-full overflow-hidden border border-zinc-200 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full ${color.replace('text-', 'bg-')}`}
                style={{ boxShadow: `0 0 8px currentColor` }}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-2.5">
          {tasks.length > 0 ? (
            tasks.map((task, index) => {
              const Icon = ICON_MAP[task.icon || 'Target'] || Target;
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={!task.completed ? { scale: 0.98 } : {}}
                  onClick={() => { if (!task.completed) { haptic(); setSelectedTask(task); } }}
                  className={`bg-white shadow-sm rounded-[1.25rem] p-3.5 flex items-center justify-between border-zinc-200 transition-all shadow-sm cursor-pointer ${
                    task.completed ? 'opacity-25 grayscale' : 'hover:bg-zinc-50 hover:border-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                      task.completed
                        ? 'bg-white border-zinc-800 text-zinc-600'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-800 hover:border-accent/30'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-zinc-800 tracking-tight uppercase">{task.label}</span>
                  </div>

                  {task.completed ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-emerald-500/15 text-emerald-600 px-2.5 py-1 rounded-lg border border-emerald-500/25 flex items-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-3 h-3" strokeWidth={3.5} />
                      <span className="text-[7px] font-black uppercase tracking-tighter">{language === 'es' ? 'Completado' : 'Secured'}</span>
                    </motion.div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-600 border border-zinc-200 group-hover:border-[#FF7300]/30 group-hover:text-[#FF7300] transition-all">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-5 text-center border-2 border-dashed border-zinc-200 rounded-[1.25rem] opacity-40"
            >
              <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
                {language === 'es' ? 'Sin protocolo activo' : 'No protocol active'}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="px-5 mb-10 space-y-8">
      <Column title={language === 'es' ? 'Hábitos' : 'Habits'} type="habit" color="text-[#FF7300]" icon={Target} />
      <Column title={language === 'es' ? 'Lecciones' : 'Lessons'} type="lesson" color="text-purple-500" icon={Book} />
      <Column title={language === 'es' ? 'Trabajo' : 'Work'} type="work" color="text-blue-500" icon={Rocket} />

      <AnimatePresence>
        {selectedTask && (
          <TacticalProofModal 
            task={selectedTask} 
            onClose={() => setSelectedTask(null)}
            onVerify={(url, text, verified) => handleVerify(selectedTask.id, url, text, verified)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
