import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, useSpring, useMotionValue } from 'motion/react';
import type { MascotReaction } from '../../services/mascotGuide';

export interface LivingT1gerPetProps {
  mood?: MascotReaction | 'bathing' | 'playing' | 'eating' | 'sleeping' | 'beast';
  health?: number;
  hunger?: number;
  energy?: number;
  strength?: number;
  evolutionStage?: 1 | 2 | 3 | 4;
  dirtLevel?: number;
  isSleeping?: boolean;
  equippedAccessories?: string[];
  onPet?: (e: React.MouseEvent) => void;
  className?: string;
}

export const LivingT1gerPet: React.FC<LivingT1gerPetProps> = ({
  mood = 'idle',
  health = 100,
  hunger = 80,
  energy = 85,
  strength = 75,
  evolutionStage = 1,
  dirtLevel = 0,
  isSleeping = false,
  equippedAccessories = [],
  onPet,
  className = 'h-52 w-52',
}) => {
  const isSleepy = isSleeping || (health < 35 && mood !== 'eating');
  const isEating = mood === 'eating';
  const isBathing = mood === 'bathing';
  const isPlaying = mood === 'playing';
  const isBeast = evolutionStage === 4 || mood === 'beast' || (health >= 80 && hunger >= 80 && energy >= 70);
  const isHappy = mood === 'happy' || mood === 'celebrate' || isPlaying;

  // Resolve the iconic 3D high-res character pose
  const imageSrc = (() => {
    if (isEating) return '/mascot/t1ger-eating.png';
    if (isSleeping) return '/mascot/t1ger-sleeping.png';
    if (isBeast) return '/mascot/t1ger-beast.png';
    if (isHappy) return '/mascot/t1ger-petted.png';
    if (hunger < 35) return '/mascot/t1ger-hungry.png';
    return '/t1ger-avatar.png';
  })();

  // Advanced Spring Hover interactions
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    rotateX.set((y / rect.height) * -15);
    rotateY.set((x / rect.width) * 15);
  };

  const handlePointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      onClick={onPet}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={`relative flex items-center justify-center select-none cursor-pointer group ${className}`}
      aria-label="T1GER 3D Pet"
    >
      {/* 1. BEAST & TITAN CORONA AURA */}
      <AnimatePresence>
        {isBeast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              scale: [1, 1.15, 0.95, 1.15, 1],
              opacity: [0.3, 0.6, 0.35, 0.6, 0.3],
              rotate: [0, 180, 360],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ repeat: Infinity, duration: 6.0, ease: 'linear' }}
            className="absolute inset-0 -z-20 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,115,0,0.5),rgba(245,158,11,0.15)_60%,transparent_80%)] blur-2xl pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* 2. EVOLUTION STAGE 3 (ALPHA) AMBER LIGHT RING */}
      <AnimatePresence>
        {evolutionStage === 3 && !isBeast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.25, 0.45, 0.25],
            }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 4.0, ease: 'easeInOut' }}
            className="absolute inset-2 -z-20 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,140,0,0.35),transparent_70%)] blur-xl pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* 3. DYNAMIC GROUND SHADOW WITH HARDWARE ACCELERATION */}
      <motion.div
        animate={{
          scaleX: isSleeping ? 1.15 : isEating ? [1, 1.1, 0.9, 1.1, 1] : [1, 1.05, 1],
          scaleY: isSleeping ? 0.7 : [1, 0.95, 1],
          opacity: isSleeping ? 0.4 : [0.5, 0.65, 0.5],
        }}
        transition={{ repeat: Infinity, duration: isEating ? 0.65 : 3.5, ease: 'easeInOut' }}
        className="absolute bottom-2 h-6 w-32 rounded-[100%] bg-black/80 blur-md -z-10"
        style={{ translateZ: -20 }}
      />

      {/* 4. THE ICONIC 3D T1GER CHARACTER WITH LIVING PHYSICS */}
      <motion.div
        animate={{
          y: isSleeping
            ? 12
            : isEating
            ? [0, -10, 0, -5, 0]
            : isHappy
            ? [0, -14, 0]
            : [0, -6, 0],
          scale: isEating
            ? [1, 1.05, 0.95, 1.05, 1]
            : isHappy
            ? [1, 1.04, 1]
            : [1, 1.01, 1],
          rotate: isHappy ? [-2, 2, -2] : [0, 0.5, -0.5, 0],
        }}
        whileTap={{ scale: 0.94 }}
        transition={{
          y: { repeat: Infinity, duration: isEating ? 0.65 : isHappy ? 0.8 : 3.5, ease: 'easeInOut' },
          scale: { repeat: isEating || isHappy ? Infinity : 0, duration: isEating ? 0.65 : 0.8, ease: 'easeInOut' },
          rotate: { repeat: Infinity, duration: isHappy ? 1.0 : 4.0, ease: 'easeInOut' }
        }}
        className="relative flex items-center justify-center filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)]"
        style={{ transformStyle: 'preserve-3d', translateZ: 20 }}
      >
        <AnimatePresence mode="popLayout">
          <motion.img
            key={imageSrc}
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            src={imageSrc}
            alt="T1GER Mascot 3D"
            className="h-44 w-44 sm:h-48 sm:w-48 object-contain pointer-events-none"
          />
        </AnimatePresence>

        {/* ACCESSORY OVERLAYS */}
        <AnimatePresence>
          {equippedAccessories.includes('crown') && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-[5%] left-[50%] -translate-x-1/2 text-[2.5rem] drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]"
              style={{ translateZ: 25, zIndex: 10 }}
            >
              👑
            </motion.div>
          )}
          {equippedAccessories.includes('cyber_glasses') && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-[32%] left-[50%] -translate-x-[48%] text-[3.2rem]"
              style={{ translateZ: 35, zIndex: 10 }}
            >
              🕶️
            </motion.div>
          )}
          {equippedAccessories.includes('founder_tie') && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute bottom-[8%] left-[50%] -translate-x-1/2 text-[2.2rem]"
              style={{ translateZ: 25, zIndex: 10 }}
            >
              👔
            </motion.div>
          )}
          {equippedAccessories.includes('gold_chain') && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute bottom-[10%] left-[50%] -translate-x-[50%] text-[2.8rem]"
              style={{ translateZ: 25, zIndex: 10 }}
            >
              ⛓️
            </motion.div>
          )}
          {equippedAccessories.includes('cap') && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-[6%] left-[45%] -translate-x-1/2 text-[2.8rem] rotate-[-15deg]"
              style={{ translateZ: 25, zIndex: 10 }}
            >
              🧢
            </motion.div>
          )}
        </AnimatePresence>

        {/* DIRT SPOTS OVERLAY IF UNWASHED */}
        <AnimatePresence>
          {dirtLevel > 15 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: Math.min(1, dirtLevel / 100) }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 pointer-events-none rounded-full mix-blend-multiply"
              style={{
                background: 'radial-gradient(circle at 32% 42%, rgba(55,40,30,0.6) 8%, transparent 22%), radial-gradient(circle at 68% 62%, rgba(55,40,30,0.55) 10%, transparent 25%)',
                translateZ: 30
              }}
            />
          )}
        </AnimatePresence>

        {/* FLOATING ZZZ BUBBLES IN SLEEP MODE */}
        <AnimatePresence>
          {isSleeping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-4 right-2 font-mono font-black text-amber-300 text-sm pointer-events-none"
              style={{ translateZ: 40 }}
            >
              <motion.div
                animate={{ 
                  y: [-5, -25], 
                  opacity: [0, 1, 0],
                  scale: [0.8, 1.2, 1] 
                }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeOut' }}
              >
                Zzz...
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

