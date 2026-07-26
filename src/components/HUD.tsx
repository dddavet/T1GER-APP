import React from 'react';
import { useT1ger } from '../contexts/T1gerContext';
import { motion } from 'motion/react';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, BookOpen, Cpu } from 'lucide-react';
import { StreakModal } from './StreakModal';
import { GemsModal } from './GemsModal';
import { HeartsModal } from './HeartsModal';
import { NumberFlow } from './ui/number-flow';

const trackMeta = {
  investing: { icon: LineChart, label: 'Investing', color: '#1CB0F6', flagColor: '#1CB0F6' }, // Duolingo blue
  business: { icon: BookOpen, label: 'Business', color: '#1CB0F6', flagColor: '#1CB0F6' },
  ai: { icon: Cpu, label: 'AI', color: '#1CB0F6', flagColor: '#1CB0F6' },
};

export const HUD = React.memo(() => {
  const { learnStreak, currentTrackId } = useBrain();
  const { appUser } = useAuth();
  const isMinimalist = appUser?.minimalistMode || false;
  
  const [isStreakModalOpen, setIsStreakModalOpen] = React.useState(false);
  const [isGemsModalOpen, setIsGemsModalOpen] = React.useState(false);
  const [isHeartsModalOpen, setIsHeartsModalOpen] = React.useState(false);

  const meta = trackMeta[currentTrackId as keyof typeof trackMeta] || trackMeta.business;
  const TrackIcon = meta.icon;

  const level = appUser?.level || 1;
  const coins = appUser?.coins || 0;
  const energy = appUser?.energy ?? 5; // Default 5 hearts

  if (isMinimalist) {
    return (
      <div className="flex-none z-40 pt-[calc(0.75rem+var(--safe-top-inset,env(safe-area-inset-top)))] pb-3 px-5 flex items-center justify-between bg-transparent text-zinc-500 font-mono text-[9px] font-bold uppercase tracking-widest opacity-60">
        <span>Zen Workspace</span>
        <span>Streak: <NumberFlow value={learnStreak} /></span>
      </div>
    );
  }

  return (
    <div className="flex-none z-[100] bg-white pt-[calc(0.75rem+var(--safe-top-inset,env(safe-area-inset-top)))] pb-2.5 px-4 flex items-center justify-between w-full shadow-[0_2px_10px_rgba(0,0,0,0.03)] border-b border-zinc-100 relative max-w-md mx-auto">
      
      {/* 1. Track/Level (Flag Equivalent) */}
      <div 
        aria-label={`Level ${level}`}
        className="flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 transition-transform"
      >
        <div 
          className="w-8 h-8 rounded-xl border-2 border-b-4 border-zinc-200 border-b-zinc-300 flex items-center justify-center bg-white shadow-sm"
        >
          <TrackIcon className="w-5 h-5" style={{ color: meta.color }} strokeWidth={2.5} />
        </div>
        <span className="font-black text-[15px] text-zinc-700 font-mono">
          <NumberFlow value={level} />
        </span>
      </div>

      {/* 2. Streak (Fire) */}
      <div 
        role="button"
        aria-label={`Streak: ${learnStreak} days`}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-b-2 border-orange-200/60 bg-orange-50/50 cursor-pointer active:translate-y-0.5 transition-transform"
        onClick={() => setIsStreakModalOpen(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-[20px] h-[20px]">
          {learnStreak > 0 ? (
            <path d="M12 22C16 22 19 18.5 19 14.5C19 10 16 7 14 3C13.5 2 12.5 2 12 3C12.5 6 13.5 8 13.5 10.5C13.5 12 12.5 13 11 13C9.5 13 8 11.5 8 9.5C6 11 5 13.5 5 15.5C5 19.5 8 22 12 22Z" fill="#FF9600" />
          ) : (
            <path d="M12 22C16 22 19 18.5 19 14.5C19 10 16 7 14 3C13.5 2 12.5 2 12 3C12.5 6 13.5 8 13.5 10.5C13.5 12 12.5 13 11 13C9.5 13 8 11.5 8 9.5C6 11 5 13.5 5 15.5C5 19.5 8 22 12 22Z" fill="#E5E5E5" />
          )}
        </svg>
        <NumberFlow 
          value={learnStreak} 
          className="font-black text-[14px] font-mono"
          style={{ color: learnStreak > 0 ? '#FF9600' : '#AFAFAF' }}
        />
      </div>

      {/* 3. Gems / Coins */}
      <div 
        role="button"
        aria-label={`Coins: ${coins}`}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-b-2 border-sky-200/60 bg-sky-50/50 cursor-pointer active:translate-y-0.5 transition-transform"
        onClick={() => setIsGemsModalOpen(true)}
      >
        {/* Diamond SVG */}
        <svg viewBox="0 0 24 24" fill="none" className="w-[20px] h-[20px]">
          <path d="M12 2L2 9L12 22L22 9L12 2Z" fill="#1CB0F6" />
          <path d="M12 2L2 9L12 11L12 2Z" fill="#78C8F5" />
          <path d="M12 2L22 9L12 11L12 2Z" fill="#1CB0F6" />
          <path d="M2 9L12 22L12 11L2 9Z" fill="#1899D6" />
          <path d="M22 9L12 22L12 11L22 9Z" fill="#1473A6" />
        </svg>
        <NumberFlow 
          value={coins} 
          className="font-black text-[14px] font-mono text-[#1CB0F6]" 
        />
      </div>

      {/* 4. Hearts / Energy */}
      <div 
        role="button"
        aria-label={`Energy: ${energy}`}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-b-2 border-red-200/60 bg-red-50/50 cursor-pointer active:translate-y-0.5 transition-transform"
        onClick={() => setIsHeartsModalOpen(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-[20px] h-[20px]">
          <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="#FF4B4B" />
        </svg>
        <NumberFlow 
          value={energy} 
          className="font-black text-[14px] font-mono text-[#FF4B4B]" 
        />
      </div>

      <StreakModal 
        isOpen={isStreakModalOpen} 
        onClose={() => setIsStreakModalOpen(false)} 
        streak={learnStreak} 
      />
      <GemsModal
        isOpen={isGemsModalOpen}
        onClose={() => setIsGemsModalOpen(false)}
        coins={coins}
      />
      <HeartsModal
        isOpen={isHeartsModalOpen}
        onClose={() => setIsHeartsModalOpen(false)}
        energy={energy}
      />
    </div>
  );
});
