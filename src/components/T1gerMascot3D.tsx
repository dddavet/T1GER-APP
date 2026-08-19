import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { MascotReaction } from '../services/mascotGuide';

export type { MascotReaction } from '../services/mascotGuide';

interface MascotProps {
  modelPath?: string;
  mood?: MascotReaction;
  className?: string;
  closeUp?: boolean;
}

export const T1gerMascot3D: React.FC<MascotProps> = ({
  mood = 'idle',
  className = 'h-44 w-44',
  closeUp = false,
}) => {
  const prefersReducedMotion = Boolean(useReducedMotion());

  // Mood-driven motion configuration
  const motionConfig = (() => {
    if (prefersReducedMotion) {
      return { y: 0, rotate: 0, scale: 1 };
    }

    switch (mood) {
      case 'happy':
        return {
          y: [0, -10, 0],
          rotate: [0, -2, 2, 0],
          scale: [1, 1.05, 1],
          transition: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
        };
      case 'celebrate':
        return {
          y: [0, -16, 0],
          rotate: [-3, 3, -3, 0],
          scale: [1, 1.08, 1],
          transition: { repeat: Infinity, duration: 0.9, ease: 'easeInOut' }
        };
      case 'thinking':
        return {
          y: [0, -4, 0],
          rotate: [0, 4, 0],
          scale: 1,
          transition: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
        };
      case 'beast':
        return {
          y: [0, -6, 0],
          scale: [1, 1.06, 1],
          rotate: [-1, 1, -1],
          transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' }
        };
      case 'mistake':
        return {
          y: [0, 4, 0],
          rotate: [-4, 4, -4, 0],
          scale: [1, 0.96, 1],
          transition: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' }
        };
      case 'idle':
      default:
        return {
          y: [0, -6, 0],
          rotate: [0, 1, -1, 0],
          scale: [1, 1.02, 1],
          transition: { repeat: Infinity, duration: 3.2, ease: 'easeInOut' }
        };
    }
  })();

  return (
    <div
      className={`relative flex select-none items-center justify-center pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Background ambient aura */}
      <div className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,115,0,0.22),transparent_70%)] blur-md" />

      {/* Reactive Animated 3D Tiger Avatar */}
      <motion.div
        animate={motionConfig}
        className="relative flex items-center justify-center h-full w-full"
      >
        <img
          src="/t1ger-avatar.png"
          alt="T1GER Mascot"
          className={`h-full w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] ${
            closeUp ? 'scale-110' : 'scale-100'
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/favicon.png';
          }}
        />
      </motion.div>
    </div>
  );
};
