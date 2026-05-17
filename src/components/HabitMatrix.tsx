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

export const HabitMatrix = ({ onHabitComplete }: { onHabitComplete: () => void }) => {
  const { addXP } = useT1ger();
  const { customHabits, customWorkTasks, dailyTacticalStatus, submitTacticalProof } = useBrain();
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const committedHabits = [
    ...STANDARD_HABITS.filter(h => dailyTacticalStatus.committedHabitIds.includes(h.id)).map(h => ({ ...h, type: 'habit' })),
    ...customHabits.filter(h => dailyTacticalStatus.committedHabitIds.includes(h.id)).map(h => ({ ...h, type: 'habit' }))
  ];

  const committedWork = customWorkTasks.filter(w => dailyTacticalStatus.committedWorkIds.includes(w.id)).map(w => ({ ...w, type: 'work' }));

  const tasks = [
    ...committedHabits.map(h => ({ ...h, completed: dailyTacticalStatus.completedIds.includes(h.id) })),
    ...committedWork.map(w => ({ ...w, completed: dailyTacticalStatus.completedIds.includes(w.id) })),
  ];

  const handleVerify = (id: string, proofUrl?: string, proofText?: string, verified: boolean = true) => {
    submitTacticalProof(id, proofUrl, proofText, verified);
    
    // Reward XP based on Day Type
    let xpAmount = 20;
    if (dailyTacticalStatus.dayType === 'beast') xpAmount = 40;
    if (dailyTacticalStatus.dayType === 'rest') xpAmount = 10;
    
    addXP(xpAmount);
    
    setSelectedTask(null);
    onHabitComplete();
  };

  const haptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  return (
    <div className="px-5 space-y-4 mb-10">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between mb-2">
         <div className="flex flex-col">
            <h2 className="text-lg font-black italic uppercase tracking-tighter text-white">TACTICAL OBJECTIVES</h2>
            <p className="text-[9px] font-mono text-accent/60 uppercase tracking-[0.2em]">
              {dailyTacticalStatus.dayType.toUpperCase()} PROTOCOL ACTIVE
            </p>
         </div>
      </div>

      {/* THE MATRIX GRID */}
      <div className="grid grid-cols-1 gap-2.5">
        {tasks.map((task) => {
          const Icon = ICON_MAP[task.icon || 'Target'] || Target;
          
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { if (!task.completed) { haptic(); setSelectedTask(task); } }}
              className={`liquid-glass rounded-[2rem] p-4 flex items-center justify-between border-white/10 transition-all cursor-pointer shadow-3d ${
                task.completed ? 'opacity-40 grayscale-[0.8] cursor-default' : 'hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${task.completed ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-accent/10 border-accent/20 text-accent'} shadow-inner`}>
                    <Icon className="w-5 h-5" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">{task.type}</span>
                    <span className="text-sm font-bold text-white tracking-tight">{task.label}</span>
                 </div>
              </div>

              {task.completed ? (
                 <div className="flex items-center gap-2">
                    <div className="bg-accent/10 text-accent px-2.5 py-1 rounded-full border border-accent/20 flex items-center gap-1.5">
                      <Check className="w-3 h-3" strokeWidth={3} />
                      <span className="text-[8px] font-black uppercase tracking-tighter">SECURED</span>
                    </div>
                 </div>
              ) : (
                 <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 border border-white/5 group-hover:text-accent group-hover:border-accent/30 transition-all">
                    <Camera className="w-3.5 h-3.5" />
                 </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedTask && (
          <TacticalProofModal 
            task={selectedTask} 
            onClose={() => setSelectedTask(null)}
            onVerify={(url, text, verified) => handleVerify(selectedTask.id, url, text, verified)}
          />
        )}
      </AnimatePresence>

      {/* EDGE CASE GUIDANCE */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 shrink-0">
          <AlertCircle className="w-5 h-5 text-accent" />
        </div>
        <div className="space-y-1">
           <p className="text-[10px] font-black uppercase tracking-widest text-accent">Guidance: Verification Protocol</p>
           <p className="text-xs text-zinc-400 leading-relaxed font-medium">
             The AI Auditor expects metadata. If you can't snap it, log the grind in detail. Remember: {dailyTacticalStatus.dayType === 'beast' ? 'BEAST MODE double rewards active. Failure is not an option.' : 'Integrity is the only metric that matters when you are your own boss.'}
           </p>
        </div>
      </div>
    </div>
  );
};
