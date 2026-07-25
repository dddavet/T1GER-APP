import React from 'react';
import { motion } from 'motion/react';
import { useBrain } from '../contexts/BrainContext';

export type MascotPose = 'welcome' | 'celebrating' | 'coaching' | 'thinking' | 'proud';

interface TigerMascotProps {
  speech: string;
  pose?: MascotPose;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const POSE_IMAGES: Record<MascotPose, string> = {
  welcome: '/tiger_avatar_3d.png',
  celebrating: '/tiger_celebrating.png',
  coaching: '/tiger_avatar_3d.png',
  thinking: '/tiger_sad.png',
  proud: '/tiger_celebrating.png',
};

export const TigerMascot: React.FC<TigerMascotProps> = ({
  speech,
  pose = 'welcome',
  size = 'md',
  className = '',
}) => {
  const { language } = useBrain();

  const avatarSizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  }[size];

  const speechTextSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  const avatarSrc = POSE_IMAGES[pose] || '/tiger_avatar_3d.png';

  return (
    <div className={`flex items-start gap-3.5 max-w-md mx-auto w-full ${className}`}>
      {/* 3D Mascot Character Avatar with Bounce */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        className={`relative ${avatarSizeClasses} rounded-full bg-gradient-to-b from-orange-400 to-[#FF7300] border-4 border-white shadow-xl flex items-center justify-center shrink-0 overflow-hidden group cursor-pointer`}
      >
        <img
          src={avatarSrc}
          alt="T1GER Mascot"
          className="w-full h-full object-cover transform scale-110 group-hover:scale-125 transition-transform"
          onError={(e) => {
            // Fallback to emoji avatar if image asset fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-3xl font-black select-none pointer-events-none">
          🐅
        </div>
      </motion.div>

      {/* Duolingo 3D Speech Bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative flex-1 bg-white border-2 border-zinc-200 border-b-4 border-b-zinc-300 rounded-3xl p-4 shadow-lg text-left"
      >
        {/* Left Arrow Pointer pointing at Mascot */}
        <div className="absolute top-5 -left-2.5 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-white z-10" />
        <div className="absolute top-5 -left-3.5 w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-r-[11px] border-r-zinc-200" />

        <p className={`${speechTextSize} font-bold text-zinc-800 leading-snug tracking-tight`}>
          {speech}
        </p>
      </motion.div>
    </div>
  );
};
