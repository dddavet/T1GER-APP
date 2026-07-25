import React from 'react';
import { motion } from 'motion/react';
import { T1gerInteractiveAvatar } from './T1gerInteractiveAvatar';

export type MascotPose = 'welcome' | 'celebrating' | 'coaching' | 'thinking' | 'proud';

interface TigerMascotProps {
  speech: string;
  pose?: MascotPose;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TigerMascot: React.FC<TigerMascotProps> = ({
  speech,
  pose = 'welcome',
  size = 'md',
  className = '',
}) => {
  const avatarSize = {
    sm: 56,
    md: 80,
    lg: 100,
  }[size];

  const speechTextSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  const emotionMap: Record<MascotPose, 'PROUD' | 'PREDATOR' | 'DISAPPOINTED' | 'FERAL' | 'RESTING'> = {
    welcome: 'PREDATOR',
    celebrating: 'PROUD',
    coaching: 'PREDATOR',
    thinking: 'RESTING',
    proud: 'PROUD',
  };

  return (
    <div className={`flex items-center gap-3 max-w-md mx-auto w-full ${className}`}>
      {/* 3D Mascot Character Avatar with Vector SVG & Neon Glow */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        className="shrink-0 flex items-center justify-center"
      >
        <T1gerInteractiveAvatar
          characterId="t1ger"
          emotion={emotionMap[pose] || 'PREDATOR'}
          size={avatarSize}
        />
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

        <p className={`${speechTextSize} font-extrabold text-zinc-800 leading-snug tracking-tight font-sans`}>
          {speech}
        </p>
      </motion.div>
    </div>
  );
};
