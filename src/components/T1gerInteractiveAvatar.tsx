import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CharacterId, CHARACTER_CAST } from '../services/characterStateEngine';

interface T1gerInteractiveAvatarProps {
  characterId: CharacterId;
  emotion: 'PROUD' | 'PREDATOR' | 'DISAPPOINTED' | 'FERAL' | 'RESTING';
  className?: string;
  size?: number;
}

export const T1gerInteractiveAvatar: React.FC<T1gerInteractiveAvatarProps> = ({
  characterId,
  emotion,
  className = '',
  size = 120,
}) => {
  const character = CHARACTER_CAST[characterId];
  const [blink, setBlink] = useState(false);

  // Random blink effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000 + Math.random() * 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  const accentColor = character?.accentColor || '#FF7300';
  const glowColor = character?.glowColor || 'rgba(204, 255, 0, 0.4)';

  const mouthPath = emotion === 'DISAPPOINTED'
    ? 'M 44 68 Q 50 63, 56 68'
    : emotion === 'PREDATOR' || emotion === 'PROUD'
      ? 'M 42 63 Q 50 72, 58 63'
      : 'M 45 64 Q 50 67, 55 64';

  // Base breathing duration based on emotion
  const breathDuration = emotion === 'PREDATOR' ? 1.5 : emotion === 'RESTING' ? 4 : 2.5;
  const isPredator = emotion === 'PREDATOR';

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background Neon Pulse */}
      <motion.div
        className="absolute rounded-full opacity-30 blur-2xl"
        style={{ width: size * 0.9, height: size * 0.9, backgroundColor: accentColor }}
        animate={{
          scale: isPredator ? [1, 1.15, 1] : [1, 1.05, 1],
          opacity: isPredator ? [0.4, 0.6, 0.4] : [0.25, 0.35, 0.25],
        }}
        transition={{
          duration: breathDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        // Root bounding box bounce / squash & stretch
        animate={{
          y: isPredator ? [0, -4, 0] : [0, -2, 0],
          scaleY: isPredator ? [1, 0.98, 1] : [1, 0.99, 1],
          scale: emotion === 'DISAPPOINTED' ? 0.95 : 1,
        }}
        transition={{
          duration: breathDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Base shadow */}
        <motion.ellipse 
          cx="50" cy="90" rx="35" ry="6" fill="black" opacity="0.25"
          animate={{ rx: isPredator ? [35, 30, 35] : [35, 33, 35] }}
          transition={{ duration: breathDuration, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* --- BACK LAYER: EARS --- */}
        {/* V2 Parallax effect: Ears move slightly opposite to the body's breath to give 3D depth */}
        <motion.g
          animate={{ y: [0, 1.5, 0] }}
          transition={{ duration: breathDuration, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Left Ear */}
          <path d="M 22 25 C 10 15, 15 40, 25 38 Z" fill="oklch(0.12 0.02 240)" stroke={accentColor} strokeWidth="1.5" />
          {/* Right Ear */}
          <path d="M 78 25 C 90 15, 85 40, 75 38 Z" fill="oklch(0.12 0.02 240)" stroke={accentColor} strokeWidth="1.5" />
        </motion.g>

        {/* --- MID LAYER: BODY / HEAD BASE --- */}
        <motion.g
          animate={{ scaleY: [1, 1.02, 1] }}
          style={{ originX: '50px', originY: '85px' }}
          transition={{ duration: breathDuration, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Mane / Head Background */}
          <path
            d="M 50 15 C 25 15, 15 30, 15 50 C 15 70, 30 85, 50 85 C 70 85, 85 70, 85 50 C 85 30, 75 15, 50 15 Z"
            fill="oklch(0.18 0.02 240)"
            stroke={accentColor}
            strokeWidth="2.5"
            style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
          />

          {/* Inner Face */}
          <path d="M 50 28 C 32 28, 26 38, 26 54 C 26 70, 34 76, 50 76 C 66 76, 74 70, 74 54 C 74 38, 68 28, 50 28 Z" fill="oklch(0.12 0.01 240)" />
          
          {/* Cheeks */}
          <path d="M 28 58 L 36 56 L 28 54 Z" fill={accentColor} opacity="0.6" />
          <path d="M 72 58 L 64 56 L 72 54 Z" fill={accentColor} opacity="0.6" />
        </motion.g>

        {/* --- FRONT LAYER: FACE (EYES + MOUTH + NOSE) --- */}
        {/* Parallax moving more than the head */}
        <motion.g
          animate={{ 
            y: isPredator ? [0, -2, 0] : [0, -1, 0]
          }}
          transition={{ duration: breathDuration, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Left Eye */}
          <motion.g
            animate={{ scaleY: blink || emotion === 'RESTING' ? 0.1 : 1 }}
            transition={{ duration: 0.1 }}
            style={{ originX: '38px', originY: '48px' }}
          >
            {emotion === 'DISAPPOINTED' ? (
              <path d="M 32 50 Q 38 43, 44 48" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
            ) : emotion === 'PREDATOR' ? (
              <path d="M 32 45 C 32 45, 38 43, 44 49 C 44 49, 38 51, 32 45" fill={accentColor} />
            ) : (
              <circle cx="38" cy="48" r="4.5" fill={accentColor} />
            )}
          </motion.g>

          {/* Right Eye */}
          <motion.g
            animate={{ scaleY: blink || emotion === 'RESTING' ? 0.1 : 1 }}
            transition={{ duration: 0.1 }}
            style={{ originX: '62px', originY: '48px' }}
          >
            {emotion === 'DISAPPOINTED' ? (
              <path d="M 68 50 Q 62 43, 56 48" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
            ) : emotion === 'PREDATOR' ? (
              <path d="M 68 45 C 68 45, 62 43, 56 49 C 56 49, 62 51, 68 45" fill={accentColor} />
            ) : (
              <circle cx="62" cy="48" r="4.5" fill={accentColor} />
            )}
          </motion.g>

          {/* Nose */}
          <path d="M 50 56 L 47 53 L 53 53 Z" fill={accentColor} />

          {/* Mouth */}
          <motion.path 
            d={mouthPath} 
            stroke={accentColor} 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round" 
            animate={{
              d: isPredator && !blink 
                ? ['M 42 63 Q 50 72, 58 63', 'M 42 63 Q 50 70, 58 63', 'M 42 63 Q 50 72, 58 63']
                : mouthPath
            }}
            transition={{ duration: breathDuration, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.g>

        {/* Feral extra details (Scars, glowing eye) */}
        {emotion === 'FERAL' && (
          <motion.g 
            animate={{ opacity: [0.5, 1, 0.5] }} 
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <path d="M 28 35 L 40 45" stroke="red" strokeWidth="2" />
            <circle cx="38" cy="48" r="6" fill="red" style={{ filter: 'blur(2px)' }} />
          </motion.g>
        )}
      </motion.svg>
    </div>
  );
};
