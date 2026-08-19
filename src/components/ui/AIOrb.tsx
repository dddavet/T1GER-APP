import React from 'react';
import { motion } from 'motion/react';

interface AIOrbProps {
  isThinking?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AIOrb: React.FC<AIOrbProps> = ({
  isThinking = false,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  }[size];

  const imageScale = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  }[size];

  return (
    <div className={`relative flex items-center justify-center pointer-events-none select-none ${sizeClasses} ${className}`}>
      {/* Outer ambient pulsing glow */}
      <motion.div
        animate={{
          scale: isThinking ? [1, 1.3, 1] : [1, 1.15, 1],
          opacity: isThinking ? [0.7, 1, 0.7] : [0.4, 0.6, 0.4],
        }}
        transition={{
          repeat: Infinity,
          duration: isThinking ? 1.2 : 3.5,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,115,0,0.5),rgba(6,182,212,0.3)_60%,transparent_80%)] blur-2xl"
      />

      {/* Rotating iridescent core layer 1 */}
      <motion.div
        animate={{
          rotate: 360,
          scale: isThinking ? [0.9, 1.1, 0.9] : [0.95, 1.05, 0.95],
        }}
        transition={{
          rotate: { repeat: Infinity, duration: isThinking ? 3 : 8, ease: 'linear' },
          scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
        }}
        className="absolute inset-2 rounded-full bg-gradient-to-tr from-[#FF7300] via-[#8B5CF6] to-[#06B6D4] opacity-60 blur-xl"
      />

      {/* T1GER Avatar Image with subtle float */}
      <motion.div
        animate={{
          y: isThinking ? ['-4%', '4%', '-4%'] : ['-2%', '2%', '-2%'],
          scale: isThinking ? [0.95, 1.05, 0.95] : [1, 1, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: isThinking ? 1.5 : 4,
          ease: 'easeInOut',
        }}
        className={`relative z-10 ${imageScale} flex items-center justify-center drop-shadow-[0_0_25px_rgba(255,115,0,0.6)]`}
      >
        <img 
          src="/t1ger-avatar.png" 
          alt="T1GER AI" 
          className="w-full h-full object-contain"
        />
      </motion.div>
    </div>
  );
};
