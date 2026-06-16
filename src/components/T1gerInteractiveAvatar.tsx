import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'motion/react';
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

  // Efecto de parpadeo natural aleatorio
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000 + Math.random() * 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Determinar colores y estilos según el personaje
  const accentColor = character?.accentColor || '#CCFF00';
  const glowColor = character?.glowColor || 'rgba(204, 255, 0, 0.4)';

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Halo de Neón de Fondo (Micro-pulsación) */}
      <motion.div
        className="absolute rounded-full opacity-30 blur-2xl"
        style={{
          width: size * 0.9,
          height: size * 0.9,
          backgroundColor: accentColor,
        }}
        animate={{
          scale: emotion === 'PREDATOR' ? [1, 1.15, 1] : [1, 1.05, 1],
          opacity: emotion === 'PREDATOR' ? [0.4, 0.6, 0.4] : [0.25, 0.35, 0.25],
        }}
        transition={{
          duration: emotion === 'PREDATOR' ? 1.5 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* SVG del Personaje Animado */}
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        animate={{
          y: emotion === 'PREDATOR' ? [0, -3, 0] : [0, -1.5, 0],
          scale: emotion === 'DISAPPOINTED' ? 0.95 : 1,
        }}
        transition={{
          duration: emotion === 'PREDATOR' ? 2 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Sombra base del personaje */}
        <ellipse cx="50" cy="90" rx="35" ry="6" fill="black" opacity="0.25" />

        {/* CUERPO / BASE DEL LEÓN/PERSONAJE */}
        <motion.g>
          {/* Melena/Fondo de Cabeza */}
          <path
            d="M 50 15 C 25 15, 15 30, 15 50 C 15 70, 30 85, 50 85 C 70 85, 85 70, 85 50 C 85 30, 75 15, 50 15 Z"
            fill="oklch(0.18 0.02 240)"
            stroke={accentColor}
            strokeWidth="2.5"
            style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
          />

          {/* Orejas */}
          {/* Izquierda */}
          <path
            d="M 22 25 C 10 15, 15 40, 25 38 Z"
            fill="oklch(0.12 0.02 240)"
            stroke={accentColor}
            strokeWidth="1.5"
          />
          {/* Derecha */}
          <path
            d="M 78 25 C 90 15, 85 40, 75 38 Z"
            fill="oklch(0.12 0.02 240)"
            stroke={accentColor}
            strokeWidth="1.5"
          />

          {/* Cara Interior */}
          <path
            d="M 50 28 C 32 28, 26 38, 26 54 C 26 70, 34 76, 50 76 C 66 76, 74 70, 74 54 C 74 38, 68 28, 50 28 Z"
            fill="oklch(0.12 0.01 240)"
          />

          {/* MEJILLAS / DETALLES DE LEÓN (Tigre/Gato) */}
          <path d="M 28 58 L 36 56 L 28 54 Z" fill={accentColor} opacity="0.6" />
          <path d="M 72 58 L 64 56 L 72 54 Z" fill={accentColor} opacity="0.6" />
        </motion.g>

        {/* OJOS (Reactivos al parpadeo y emoción) */}
        <g>
          {/* Ojo Izquierdo */}
          <motion.g
            animate={{
              scaleY: blink || emotion === 'RESTING' ? 0.1 : 1,
            }}
            transition={{ duration: 0.1 }}
            style={{ originX: '38px', originY: '48px' }}
          >
            {emotion === 'DISAPPOINTED' ? (
              // Ojo triste / caído
              <path d="M 32 50 Q 38 43, 44 48" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
            ) : emotion === 'PREDATOR' ? (
              // Ojo enojado / enfocado
              <path d="M 32 45 C 32 45, 38 43, 44 49 C 44 49, 38 51, 32 45" fill={accentColor} />
            ) : (
              // Ojo normal / feliz
              <circle cx="38" cy="48" r="4.5" fill={accentColor} />
            )}
          </motion.g>

          {/* Ojo Derecho */}
          <motion.g
            animate={{
              scaleY: blink || emotion === 'RESTING' ? 0.1 : 1,
            }}
            transition={{ duration: 0.1 }}
            style={{ originX: '62px', originY: '48px' }}
          >
            {emotion === 'DISAPPOINTED' ? (
              // Ojo triste / caído
              <path d="M 56 48 Q 62 43, 68 50" stroke={accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />
            ) : emotion === 'PREDATOR' ? (
              // Ojo enojado / enfocado
              <path d="M 68 45 C 68 45, 62 43, 56 49 C 56 49, 62 51, 68 45" fill={accentColor} />
            ) : (
              // Ojo normal / feliz
              <circle cx="62" cy="48" r="4.5" fill={accentColor} />
            )}
          </motion.g>

          {/* CEJAS (Se ajustan según emoción) */}
          <motion.path
            d="M 30 40 Q 38 38, 44 42"
            stroke={accentColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            animate={{
              y: emotion === 'PREDATOR' ? 2 : emotion === 'PROUD' ? -2 : 0,
              rotate: emotion === 'PREDATOR' ? 12 : emotion === 'DISAPPOINTED' ? -10 : 0,
            }}
            style={{ originX: '37px', originY: '40px' }}
          />
          <motion.path
            d="M 70 40 Q 62 38, 56 42"
            stroke={accentColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            animate={{
              y: emotion === 'PREDATOR' ? 2 : emotion === 'PROUD' ? -2 : 0,
              rotate: emotion === 'PREDATOR' ? -12 : emotion === 'DISAPPOINTED' ? 10 : 0,
            }}
            style={{ originX: '63px', originY: '40px' }}
          />
        </g>

        {/* NARIZ */}
        <polygon points="46,56 54,56 50,61" fill={accentColor} />

        {/* BOCA (Expresiones sutiles) */}
        <motion.path
          stroke={accentColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          animate={{
            d:
              emotion === 'DISAPPOINTED'
                ? 'M 44 68 Q 50 63, 56 68' // Triste
                : emotion === 'PREDATOR' || emotion === 'PROUD'
                ? 'M 42 63 Q 50 72, 58 63' // Sonrisa amplia
                : 'M 45 64 Q 50 67, 55 64', // Neutro / Leve
          }}
          transition={{ duration: 0.2 }}
        />

        {/* DETALLES DE PERSONAJES ESPECÍFICOS */}
        {characterId === 'l1ly' && (
          // Hacker Visor/Goggles sutil
          <path
            d="M 22 46 L 78 46"
            stroke={accentColor}
            strokeWidth="1.5"
            strokeDasharray="4, 2"
            opacity="0.3"
          />
        )}
      </motion.svg>
    </div>
  );
};
