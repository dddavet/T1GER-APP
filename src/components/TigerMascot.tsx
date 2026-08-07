import React, { Suspense } from 'react';
import { motion } from 'motion/react';
import Spline from '@splinetool/react-spline';
import { T1gerMascot3D } from './T1gerMascot3D';

export type MascotPose = 'welcome' | 'celebrating' | 'coaching' | 'thinking' | 'proud';

interface TigerMascotProps {
  speech: string;
  pose?: MascotPose;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  splineUrl?: string;
  use3DCanvas?: boolean;
}

// Fallback images in case Spline isn't ready or fails
const POSE_IMAGES: Record<MascotPose, string> = {
  welcome: '/tiger_3d_clay.jpg',
  celebrating: '/tiger_3d_clay.jpg',
  coaching: '/tiger_3d_clay.jpg',
  thinking: '/tiger_3d_clay.jpg',
  proud: '/tiger_3d_clay.jpg',
};

export const TigerMascot: React.FC<TigerMascotProps> = ({
  speech,
  pose = 'welcome',
  size = 'md',
  className = '',
  splineUrl,
  use3DCanvas = true,
}) => {
  const avatarDimension = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  }[size];

  const speechTextSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  const moodMap: Record<MascotPose, 'idle' | 'happy' | 'warning' | 'beast'> = {
    welcome: 'idle',
    celebrating: 'happy',
    coaching: 'beast',
    thinking: 'idle',
    proud: 'happy',
  };

  return (
    <div className={`flex items-center gap-3.5 max-w-md mx-auto w-full ${className}`}>
      {/* 3D Character Container */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        className={`relative ${avatarDimension} shrink-0 flex items-center justify-center pointer-events-none`}
      >
        <div className="w-full h-full relative flex items-center justify-center">
          {use3DCanvas ? (
            <T1gerMascot3D mood={moodMap[pose]} className="w-full h-full" />
          ) : splineUrl ? (
            <Suspense fallback={
              <img
                src={POSE_IMAGES[pose]}
                alt="T1GER 3D Mascot"
                className="w-full h-full object-cover transform scale-105"
              />
            }>
              <div className="absolute inset-0 w-[120%] h-[120%] -left-[10%] -top-[10%] pointer-events-none flex items-center justify-center">
                <Spline scene={splineUrl} />
              </div>
            </Suspense>
          ) : (
            <img
              src={POSE_IMAGES[pose]}
              alt="T1GER 3D Mascot"
              className="w-full h-full object-cover transform scale-105"
            />
          )}
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
