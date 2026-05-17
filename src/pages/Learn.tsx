import React from 'react';
import { motion } from 'motion/react';
import { useBrain } from '../contexts/BrainContext';
import { WindingPath } from '../components/WindingPath';
import { Target, Shield, Rocket } from 'lucide-react';

export const Learn = ({ onStartMission }: { onStartMission?: (mission: any) => void }) => {
  const { pathData } = useBrain();

  return (
    <div className="min-h-screen flex flex-col pt-6">
      {/* Header Section */}
      <header className="px-5 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-[var(--accent-main)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-main)]">Active Operations</span>
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
          The Path of the <span className="text-[var(--accent-main)]">Predator</span>
        </h1>
        <p className="text-zinc-500 text-xs font-medium max-w-xs leading-relaxed">
          Master the core pillars of business through objective-based tactical training. No filler, just execution.
        </p>
      </header>

      {/* Progress Stats Bar */}
      <div className="px-5 mb-10">
        <div className="liquid-glass rounded-[2rem] p-5 flex items-center justify-between border-white/10 shadow-3d">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Current Sector</span>
            <span className="text-sm font-black uppercase text-white tracking-tight">
              {pathData.track.title}
            </span>
          </div>
          <div className="h-10 w-[1px] bg-white/10" />
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Completion</span>
            <span className="text-sm font-black text-accent drop-shadow-[0_0_8px_var(--accent-glow)]">
              {Math.round(((pathData.currentDayIndex) / (pathData.track.levels[0].days.length)) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* The Map */}
      <div className="flex-1 pb-24">
        {onStartMission && <WindingPath onStart={onStartMission} />}
      </div>

      {/* Bottom hint */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full px-10 pointer-events-none">
         <div className="bg-black/80 backdrop-blur-md border border-white/5 rounded-full py-2 px-4 flex items-center justify-center gap-2 shadow-2xl">
            <Shield className="w-3 h-3 text-zinc-500" />
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Training sessions are 100% encrypted & secure</span>
         </div>
      </div>
    </div>
  );
};
