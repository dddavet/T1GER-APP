import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useBrain } from '../contexts/BrainContext';
import { WindingPath } from '../components/WindingPath';
import { CURRICULUM_TRACKS } from '../services/missionBank';
import { Target, Shield, X, TrendingUp, Building2, Cpu, ChevronRight } from 'lucide-react';

export const Learn = ({ onStartMission }: { onStartMission?: (mission: any) => void }) => {
  const { pathData, currentTrackId, selectTrack } = useBrain();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Setup styles for each track inside the selector
  const trackStyles: Record<string, { icon: React.ReactNode, color: string, bg: string, border: string }> = {
    investing: { 
      icon: <TrendingUp className="w-5 h-5" />, 
      color: '#10B981', 
      bg: 'rgba(16, 185, 129, 0.05)', 
      border: 'rgba(16, 185, 129, 0.2)' 
    },
    business: { 
      icon: <Building2 className="w-5 h-5" />, 
      color: '#3B82F6', 
      bg: 'rgba(59, 130, 246, 0.05)', 
      border: 'rgba(59, 130, 246, 0.2)' 
    },
    ai: { 
      icon: <Cpu className="w-5 h-5" />, 
      color: '#8B5CF6', 
      bg: 'rgba(139, 92, 246, 0.05)', 
      border: 'rgba(139, 92, 246, 0.2)' 
    }
  };

  const totalDays = pathData.track?.levels?.[0]?.days?.length || 1;
  const completionPercentage = Math.round(((pathData.currentDayIndex) / totalDays) * 100);

  return (
    <div className="min-h-screen flex flex-col pt-6 relative">
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
        <div 
          onClick={() => setIsSelectorOpen(true)}
          className="liquid-glass rounded-[2rem] p-5 flex items-center justify-between border border-white/10 shadow-3d cursor-pointer hover:scale-[1.02] hover:border-white/20 transition-all duration-300 group"
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Current Sector</span>
              <span className="text-[8px] font-black text-accent px-1.5 py-0.5 bg-accent/10 border border-accent/20 rounded-md uppercase tracking-wider group-hover:bg-accent group-hover:text-black transition-colors duration-300">Change</span>
            </div>
            <span className="text-sm font-black uppercase text-white tracking-tight group-hover:text-accent transition-colors duration-300">
              {pathData.track.title}
            </span>
          </div>
          <div className="h-10 w-[1px] bg-white/10" />
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Completion</span>
            <span className="text-sm font-black text-accent drop-shadow-[0_0_8px_var(--accent-glow)]">
              {completionPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* The Map */}
      <div className="flex-1 pb-24">
        {onStartMission && <WindingPath onStart={onStartMission} />}
      </div>

      {/* Bottom hint */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full px-10 pointer-events-none z-10">
         <div className="bg-black/80 backdrop-blur-md border border-white/5 rounded-full py-2 px-4 flex items-center justify-center gap-2 shadow-2xl">
            <Shield className="w-3 h-3 text-zinc-500" />
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Training sessions are 100% encrypted & secure</span>
         </div>
      </div>

      {/* Course Selection Modal */}
      <AnimatePresence>
        {isSelectorOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-12">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSelectorOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-[#0a0a0d] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden z-10"
            >
              {/* Decorative Glow */}
              <div className="absolute -top-[20%] -left-[20%] w-[60%] h-[60%] rounded-full blur-[80px] bg-[var(--accent-glow)] pointer-events-none opacity-20" />

              <div className="flex items-center justify-between mb-6 relative">
                <div>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Select Sector</span>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white mt-0.5">Choose Your Path</h3>
                </div>
                <button 
                  onClick={() => setIsSelectorOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 relative">
                {Object.values(CURRICULUM_TRACKS).map((track) => {
                  const isActive = track.trackId === currentTrackId;
                  const trackStyle = trackStyles[track.trackId] || trackStyles.investing;

                  return (
                    <button
                      key={track.trackId}
                      onClick={() => {
                        selectTrack(track.trackId);
                        setIsSelectorOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-5 rounded-[1.8rem] border text-left transition-all duration-300 relative group overflow-hidden ${
                        isActive 
                          ? 'bg-white/[0.05] border-[var(--accent-main)] shadow-[0_0_30px_rgba(204,255,0,0.15)]' 
                          : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                          style={{ 
                            backgroundColor: trackStyle.bg, 
                            borderColor: trackStyle.border,
                            borderWidth: '1px',
                            color: trackStyle.color 
                          }}
                        >
                          {trackStyle.icon}
                        </div>
                        <div>
                          <h4 className="font-black text-sm uppercase tracking-tight text-white group-hover:text-accent transition-colors duration-300">
                            {track.title}
                          </h4>
                          <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                            {track.levels.length} {track.levels.length === 1 ? 'Level' : 'Levels'} • Linear Curriculum
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span className="text-[8px] font-black font-mono text-black bg-[var(--accent-main)] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_8px_var(--accent-glow)]">
                            Active
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

