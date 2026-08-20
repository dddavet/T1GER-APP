import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'motion/react';
import { PouAudio } from '../../services/pouAudioService';

export interface ProceduralT1gerProps {
  mood?: 'idle' | 'happy' | 'eating' | 'bathing' | 'playing' | 'sleeping' | 'beast';
  evolutionStage?: 1 | 2 | 3 | 4; // 1: Cub, 2: Junior, 3: Master, 4: Titan
  dirtLevel?: number; // 0 (clean) to 100 (dirty spots)
  isSleeping?: boolean;
  onPet?: (e: React.MouseEvent) => void;
  className?: string;
}

export const ProceduralT1gerCharacter: React.FC<ProceduralT1gerProps> = ({
  mood = 'idle',
  evolutionStage = 1,
  dirtLevel = 0,
  isSleeping = false,
  onPet,
  className = 'w-52 h-52',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isSquished, setIsSquished] = useState(false);

  // Eye tracking motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const eyeOffsetX = useSpring(useTransform(mouseX, [-150, 150], [-7, 7]), { stiffness: 300, damping: 25 });
  const eyeOffsetY = useSpring(useTransform(mouseY, [-150, 150], [-6, 6]), { stiffness: 300, damping: 25 });

  // Organic eye blinking loop
  useEffect(() => {
    if (isSleeping) return;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
      const nextTime = Math.random() * 3200 + 2000;
      blinkTimer = setTimeout(triggerBlink, nextTime);
    };
    let blinkTimer = setTimeout(triggerBlink, 2500);
    return () => clearTimeout(blinkTimer);
  }, [isSleeping]);

  // Track cursor / touch for eye gaze
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isSleeping) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current || isSleeping || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(touch.clientX - centerX);
    mouseY.set(touch.clientY - centerY);
  };

  const handleClick = (e: React.MouseEvent) => {
    setIsSquished(true);
    setTimeout(() => setIsSquished(false), 220);
    PouAudio.playPurr();
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([15, 30, 20]);
    }
    onPet?.(e);
  };

  const isHappy = mood === 'happy' || mood === 'playing';
  const isEating = mood === 'eating';
  const isBathing = mood === 'bathing';
  const isBeast = mood === 'beast' || evolutionStage === 4;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
      className={`relative flex items-center justify-center select-none cursor-pointer group ${className}`}
      aria-label="T1GER Pou Character"
    >
      {/* 1. AMBIENT AURA FOR BEAST / TITAN TIER */}
      {isBeast && (
        <motion.div
          animate={{
            scale: [1, 1.18, 1.05, 1.2, 1],
            opacity: [0.45, 0.8, 0.5, 0.85, 0.45],
            rotate: [0, 180, 360],
          }}
          transition={{ repeat: Infinity, duration: 4.0, ease: 'linear' }}
          className="absolute inset-0 -z-20 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,115,0,0.6),rgba(245,158,11,0.3)_50%,transparent_75%)] blur-2xl pointer-events-none"
        />
      )}

      {/* 2. GROUND SHADOW (Dynamic squash) */}
      <motion.div
        animate={{
          scaleX: isSquished ? 1.25 : [1, 1.06, 1],
          scaleY: isSquished ? 0.75 : [1, 0.94, 1],
          opacity: [0.35, 0.5, 0.35],
        }}
        transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
        className="absolute bottom-2 h-7 w-36 rounded-[100%] bg-black/60 blur-md -z-10"
      />

      {/* 3. LIVING PROCEDURAL POU CHARACTER (SVG / Vector Skeletal) */}
      <motion.div
        animate={{
          y: isSleeping ? 8 : isEating ? [0, -8, 0, -5, 0] : isHappy ? [0, -14, 0] : [0, -6, 0],
          scaleX: isSquished ? 1.15 : isEating ? [1, 1.08, 0.96, 1.04, 1] : 1,
          scaleY: isSquished ? 0.85 : isEating ? [1, 0.94, 1.06, 0.96, 1] : 1,
          rotate: isHappy ? [-2, 2, -2] : [0, 1, -1, 0],
        }}
        transition={{
          repeat: isEating || isHappy || !isSleeping ? Infinity : 0,
          duration: isEating ? 0.65 : isHappy ? 0.85 : 3.0,
          ease: 'easeInOut',
        }}
        className="relative w-44 h-44 flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
          <defs>
            {/* Soft Tiger Fur Gradient */}
            <linearGradient id="t1gerFur" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFA040" />
              <stop offset="50%" stopColor="#FF7300" />
              <stop offset="100%" stopColor="#E65100" />
            </linearGradient>

            {/* Belly Soft Cream Gradient */}
            <linearGradient id="t1gerBelly" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF9E6" />
              <stop offset="100%" stopColor="#FFE0B2" />
            </linearGradient>

            {/* Ear Inner Pink */}
            <linearGradient id="t1gerEarInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8A80" />
              <stop offset="100%" stopColor="#FF5252" />
            </linearGradient>

            {/* Golden Crown Gradient for Titan */}
            <linearGradient id="titanGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="50%" stopColor="#FFD54F" />
              <stop offset="100%" stopColor="#FFA000" />
            </linearGradient>
          </defs>

          {/* EARS (Left & Right with organic twitch) */}
          <g className="transition-transform duration-200">
            {/* Left Ear */}
            <path
              d="M 40 65 C 25 30, 60 20, 75 45 Z"
              fill="url(#t1gerFur)"
              stroke="#B23C00"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path d="M 46 58 C 36 38, 56 32, 66 48 Z" fill="url(#t1gerEarInner)" />

            {/* Right Ear */}
            <path
              d="M 160 65 C 175 30, 140 20, 125 45 Z"
              fill="url(#t1gerFur)"
              stroke="#B23C00"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path d="M 154 58 C 164 38, 144 32, 134 48 Z" fill="url(#t1gerEarInner)" />
          </g>

          {/* MAIN SQUISHY POU BODY (Round organic shape) */}
          <path
            d="M 100 35 C 165 35, 185 85, 180 145 C 175 185, 145 192, 100 192 C 55 192, 25 185, 20 145 C 15 85, 35 35, 100 35 Z"
            fill="url(#t1gerFur)"
            stroke="#B23C00"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* TIGER STRIPES (Cheeks & Forehead) */}
          <g fill="#211006" opacity="0.9">
            {/* Center Forehead Stripes */}
            <path d="M 100 42 L 95 62 L 105 62 Z" />
            <path d="M 86 48 L 82 60 L 92 60 Z" />
            <path d="M 114 48 L 108 60 L 118 60 Z" />

            {/* Left Cheek Stripes */}
            <path d="M 24 105 L 44 110 L 26 116 Z" />
            <path d="M 28 122 L 46 126 L 30 132 Z" />

            {/* Right Cheek Stripes */}
            <path d="M 176 105 L 156 110 L 174 116 Z" />
            <path d="M 172 122 L 154 126 L 170 132 Z" />
          </g>

          {/* SOFT BELLY PATCH */}
          <path
            d="M 100 115 C 135 115, 150 145, 145 180 C 130 188, 100 190, 100 190 C 100 190, 70 188, 55 180 C 50 145, 65 115, 100 115 Z"
            fill="url(#t1gerBelly)"
            opacity="0.92"
          />

          {/* TITAN / MASTER COLLAR (Stage 2, 3, 4) */}
          {evolutionStage >= 2 && (
            <g>
              <path
                d="M 50 162 C 100 178, 150 162, 150 162 C 145 174, 55 174, 50 162 Z"
                fill="#18181D"
                stroke="#FFD54F"
                strokeWidth="2.5"
              />
              <circle cx="100" cy="168" r="7" fill={evolutionStage === 4 ? '#A855F7' : '#FF7300'} stroke="#FFF" strokeWidth="1.5" />
            </g>
          )}

          {/* TITAN GOLDEN CROWN (Stage 4) */}
          {evolutionStage >= 4 && (
            <g transform="translate(68, 8)">
              <polygon
                points="0,28 12,6 32,22 52,6 64,28"
                fill="url(#titanGold)"
                stroke="#FF6F00"
                strokeWidth="2"
              />
              <circle cx="12" cy="6" r="3.5" fill="#FFF" />
              <circle cx="32" cy="22" r="3.5" fill="#FFF" />
              <circle cx="52" cy="6" r="3.5" fill="#FFF" />
            </g>
          )}

          {/* EYES CONTAINER (Follows Cursor & Blinks) */}
          <g>
            {isSleeping ? (
              /* Sleeping Eyes (Relaxed Closed Arcs) */
              <g stroke="#211006" strokeWidth="5" strokeLinecap="round" fill="none">
                <path d="M 56 100 Q 72 110 88 100" />
                <path d="M 112 100 Q 128 110 144 100" />
              </g>
            ) : isBlinking ? (
              /* Blinking Line Slits */
              <g stroke="#211006" strokeWidth="4.5" strokeLinecap="round" fill="none">
                <line x1="56" y1="98" x2="88" y2="98" />
                <line x1="112" y1="98" x2="144" y2="98" />
              </g>
            ) : (
              /* Big Cute Pou-Style Eyes */
              <>
                {/* Left Eye White */}
                <ellipse cx="72" cy="95" rx="18" ry="22" fill="#FFFFFF" stroke="#211006" strokeWidth="4" />
                {/* Right Eye White */}
                <ellipse cx="128" cy="95" rx="18" ry="22" fill="#FFFFFF" stroke="#211006" strokeWidth="4" />

                {/* Left Pupil (Trackable) */}
                <motion.g style={{ x: eyeOffsetX, y: eyeOffsetY }}>
                  <ellipse cx="72" cy="95" rx="11" ry="14" fill="#1A0D00" />
                  {/* Catchlights (Cute Shiny Highlights) */}
                  <circle cx="68" cy="89" r="4.5" fill="#FFFFFF" />
                  <circle cx="76" cy="99" r="2" fill="#FFFFFF" />
                </motion.g>

                {/* Right Pupil (Trackable) */}
                <motion.g style={{ x: eyeOffsetX, y: eyeOffsetY }}>
                  <ellipse cx="128" cy="95" rx="11" ry="14" fill="#1A0D00" />
                  {/* Catchlights */}
                  <circle cx="124" cy="89" r="4.5" fill="#FFFFFF" />
                  <circle cx="132" cy="99" r="2" fill="#FFFFFF" />
                </motion.g>
              </>
            )}
          </g>

          {/* SNOUT & NOSE */}
          <path
            d="M 85 120 C 85 110, 115 110, 115 120 C 115 128, 85 128, 85 120 Z"
            fill="url(#t1gerBelly)"
          />
          {/* Cute Pink/Dark Tiger Nose */}
          <polygon points="94,116 106,116 100,123" fill="#D84315" />

          {/* MOUTH (Interactive States: Open when Eating, Smile when Happy) */}
          {isEating ? (
            /* Chomping Open Mouth */
            <ellipse cx="100" cy="138" rx="14" ry="12" fill="#5C0000" stroke="#211006" strokeWidth="3" />
          ) : isHappy ? (
            /* Joyful Big Smile */
            <path
              d="M 84 126 Q 100 144 116 126"
              fill="#880E4F"
              stroke="#211006"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : (
            /* Classic Cute Cat/Tiger Smile */
            <g stroke="#211006" strokeWidth="3.5" strokeLinecap="round" fill="none">
              <path d="M 100 123 L 100 130" />
              <path d="M 90 130 Q 100 136 100 130 Q 100 136 110 130" />
            </g>
          )}

          {/* ROSY BLUSHING CHEEKS */}
          <ellipse cx="48" cy="115" rx="10" ry="6" fill="#FF5252" opacity="0.4" />
          <ellipse cx="152" cy="115" rx="10" ry="6" fill="#FF5252" opacity="0.4" />

          {/* DIRT SPOTS (If Screen Time is high or unwashed) */}
          {dirtLevel > 15 && (
            <g fill="#5D4037" opacity={Math.min(0.75, dirtLevel / 100)}>
              <circle cx="60" cy="70" r="6" />
              <circle cx="68" cy="74" r="4" />
              <circle cx="140" cy="140" r="7" />
              <circle cx="148" cy="136" r="5" />
              <circle cx="95" cy="165" r="8" />
            </g>
          )}
        </svg>

        {/* 4. FLOATING ZZZ BUBBLES WHEN SLEEPING */}
        {isSleeping && (
          <div className="absolute -top-4 right-2 font-mono font-black text-amber-300 text-sm animate-bounce space-y-1">
            <motion.div animate={{ y: [-5, -15], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2.2 }}>
              Zzz...
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
