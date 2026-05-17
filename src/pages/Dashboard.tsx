import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useT1ger } from '../contexts/T1gerContext';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { Flame, Zap, CheckCircle2, ChevronDown, BookOpen, Coffee, Target, Settings2 } from 'lucide-react';
import { type CurriculumTrack, CURRICULUM_TRACKS } from '../services/missionBank';

import { TacticalColumns } from '../components/TacticalColumns';
import { DailyCommitment } from '../components/DailyCommitment';

const DAILY_QUOTES = [
  "The pride doesn't sleep. Prove your grind.",
  "Excuses don't have metadata. T1GER doesn't care about your intentions.",
  "Document the grind or it didn't happen. Results are the only language we speak.",
  "Your competitors are sleeping. Use this hour to bury them.",
  "Discipline is the bridge between goals and accomplishment.",
  "The only bad workout is the one that didn't happen.",
  "Innovation distinguishes between a leader and a follower."
];

const ModeSelectorTop = ({ current, onSelect }: { current: string, onSelect: (id: any) => void }) => {
  const haptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(12);
    }
  };

  return (
    <div className="flex items-center justify-center gap-1.5 p-1.5 liquid-glass rounded-[2rem] mx-auto w-fit mb-6 shadow-3d">
      {[
        { id: 'rest', icon: Coffee, color: 'text-blue-400', label: 'Relaxed' },
        { id: 'normal', icon: Target, color: 'text-accent', label: 'Focus' },
        { id: 'beast', icon: Flame, color: 'text-orange-500', label: 'Beast' },
      ].map((m) => {
        const isActive = current === m.id;
        return (
          <button
            key={m.id}
            onClick={() => { haptic(); onSelect(m.id); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[1.25rem] transition-all duration-300 active:scale-95 ${
              isActive
                ? 'liquid-glass-accent shadow-3d-accent scale-[0.98]'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
            }`}
          >
            <m.icon className={`w-4 h-4 ${isActive ? m.color : ''}`} />
            <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? 'text-white' : ''}`}>
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const StoryBanner = ({ track, levelIndex, appUser }: { track: CurriculumTrack, levelIndex: number, appUser: any }) => {
  const level = track?.levels?.[levelIndex] || track?.levels?.[0] || { title: 'Unknown Phase' };
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const dailyQuote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning Briefing" : hour < 18 ? "Afternoon Ops" : "Evening Debrief";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="liquid-glass-heavy rounded-[2.5rem] p-7 mx-5 my-4 relative overflow-hidden border-white/5 shadow-3d"
    >
      {/* Scanline effect */}
      <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.03] bg-scanline" />

      {/* Animated background glow */}
      <motion.div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--bg-glow-1) 0%, transparent 70%)' }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20">
          <span className="text-[8px] font-black uppercase tracking-[0.25em] text-accent">
            {level.title}
          </span>
        </div>
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{greeting}</span>
      </div>

      <div className="relative z-10 space-y-3">
        <h1 className="text-3xl font-black italic tracking-tighter leading-none text-white uppercase">
          THE PRIDE <span className="text-accent drop-shadow-[0_0_20px_var(--accent-glow)]">STAYS HUNGRY.</span>
        </h1>
        <p className="text-[11px] font-medium text-zinc-400 leading-relaxed italic border-l-2 border-accent/30 pl-4">
          "{dailyQuote}"
        </p>
      </div>
    </motion.div>
  );
};

export const Dashboard = ({ onStartMission }: { onStartMission: (mission: any) => void }) => {
  const { setActiveView } = useT1ger();
  const { stats } = useT1ger();
  const { 
    totalCompleted, 
    dailyProgress, 
    currentTrackId, 
    learnStreak, 
    tacticalStreak, 
    completeHabit,
    dailyTacticalStatus,
    setDayType 
  } = useBrain();
  const { appUser } = useAuth();

  const currentLevelIndex = 0; // Fixed for MVP prototype
  const currentTrack = CURRICULUM_TRACKS[currentTrackId] as CurriculumTrack;

  const isCommitted = dailyTacticalStatus.committedHabitIds.length > 0 || 
                      dailyTacticalStatus.committedWorkIds.length > 0 ||
                      dailyTacticalStatus.committedLessonIds?.length > 0;

  return (
    <div className="relative w-full pt-4 pb-20 space-y-2">
      <AnimatePresence>
        {!isCommitted && <DailyCommitment />}
      </AnimatePresence>

      {/* Mode Selector Top - The user's preferred way to change modes */}
      <ModeSelectorTop 
        current={dailyTacticalStatus.dayType} 
        onSelect={setDayType} 
      />

      {/* Storytelling Narrative Block */}
      <StoryBanner track={currentTrack} levelIndex={currentLevelIndex} appUser={appUser} />

      {/* 3-PILLAR TACTICAL GRID */}
      <TacticalColumns onTaskComplete={completeHabit} />

      {/* Daily progress indicator */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="text-center px-5 mb-4"
      >
        <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.25em] mb-3">Today's Objective</p>

        <div className="flex items-center justify-center gap-2 mb-5">
          {Array.from({ length: Math.max(1, dailyProgress.total) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 400 }}
              className={`w-10 h-2 rounded-full transition-all duration-500 ${
                i < dailyProgress.completed
                  ? 'bg-accent shadow-[0_0_12px_var(--accent-glow)]'
                  : 'bg-white/8 border border-white/10'
              }`}
            />
          ))}
        </div>

        {/* Stats lozenge */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
          className="inline-flex items-center justify-center gap-5 text-xs liquid-glass rounded-full py-3 px-7 shadow-3d"
        >
          <div className="flex items-center gap-2" title="Learning Streak">
            <BookOpen className={`w-4 h-4 ${learnStreak > 0 ? 'text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]' : 'text-zinc-700'}`} />
            <span className={`font-mono font-black text-sm ${learnStreak > 0 ? 'text-cyan-400' : 'text-zinc-700'}`}>{learnStreak}</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2" title="Tactical Streak">
            <Flame className={`w-4 h-4 ${tacticalStreak > 0 ? 'text-accent fill-accent drop-shadow-[0_0_6px_var(--accent-glow)]' : 'text-zinc-700'}`} />
            <span className={`font-mono font-black text-sm ${tacticalStreak > 0 ? 'text-accent' : 'text-zinc-700'}`}>{tacticalStreak}</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent drop-shadow-[0_0_6px_var(--accent-glow)]" />
            <span className="font-mono font-black text-sm text-accent">{stats.xp}</span>
          </div>
        </motion.div>

        {/* Mission count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-1.5 mt-4"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{totalCompleted} Missions Logged</span>
        </motion.div>
      </motion.div>


    </div>
  );
};
