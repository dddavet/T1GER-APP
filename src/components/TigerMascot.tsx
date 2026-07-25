import React from 'react';
import { motion } from 'motion/react';

export type MascotPose = 'welcome' | 'celebrating' | 'coaching' | 'thinking' | 'proud';

interface TigerMascotProps {
  speech: string;
  pose?: MascotPose;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const POSE_IMAGES: Record<MascotPose, string> = {
  welcome: '/tiger_3d_happy.jpg',
  celebrating: '/tiger_3d_apex.jpg',
  coaching: '/tiger_3d_coach.jpg',
  thinking: '/tiger_3d_thinking.jpg',
  proud: '/tiger_3d_apex.jpg',
};

export const TigerMascot: React.FC<TigerMascotProps> = ({
  speech,
  pose = 'welcome',
  size = 'md',
  className = '',
}) => {
  const avatarDimension = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }[size];

  const speechTextSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  const imageSrc = POSE_IMAGES[pose] || '/tiger_3d_happy.jpg';

  return (
    <div className={`flex items-center gap-3.5 max-w-md mx-auto w-full ${className}`}>
      {/* Pixar-Quality 3D Mascot Render with Floating Animation & Glossy Neon Ring */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        className={`relative ${avatarDimension} rounded-3xl bg-gradient-to-b from-[#FF8800] to-[#FF7300] p-1 shadow-[0_10px_25px_rgba(255,115,0,0.35)] shrink-0 overflow-hidden group cursor-pointer border-2 border-white/80`}
      >
        <div className="w-full h-full rounded-2xl overflow-hidden bg-white flex items-center justify-center">
          <img
            src={imageSrc}
            alt="T1GER 3D Mascot"
            className="w-full h-full object-cover transform scale-105 group-hover:scale-115 transition-transform duration-300"
          />
        </div>
      </motion.div>

      {/* Duolingo 3D Tactile Speech Bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative flex-1 bg-white border-2 border-zinc-200 border-b-4 border-b-zinc-300 rounded-3xl p-4 shadow-lg text-left"
      >
        {/* Pointer Arrow */}
        <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-white z-10" />
        <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-r-[11px] border-r-zinc-200" />

        <p className={`${speechTextSize} font-extrabold text-zinc-800 leading-snug tracking-tight font-sans`}>
          {speech}
        </p>
      </motion.div>
    </div>
  );
};
