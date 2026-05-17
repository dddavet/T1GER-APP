import React from 'react';
import { motion } from 'motion/react';

type TigerState = 'IDLE' | 'HUNGRY' | 'APEX' | 'INJURED';

interface TigerAvatarProps {
  state: TigerState;
}

export const TigerAvatar = ({ state }: TigerAvatarProps) => {
  const getStyle = () => {
    switch (state) {
      case 'IDLE': return { color: '#FF6B00', scale: 1 };
      case 'HUNGRY': return { color: '#FF6B00', scale: 0.9, filter: 'grayscale(50%)' };
      case 'APEX': return { color: '#CCFF00', scale: 1.2, filter: 'drop-shadow(0 0 10px #CCFF00)' };
      case 'INJURED': return { color: '#888888', scale: 0.8, filter: 'grayscale(100%)' };
    }
  };

  const style = getStyle();

  return (
    <motion.div
      className="text-8xl"
      animate={{ 
        scale: style.scale,
        filter: style.filter,
        color: style.color
      }}
      transition={{ type: "spring", stiffness: 200, damping: 10 }}
    >
      {state === 'INJURED' ? '🤕' : '🐅'}
    </motion.div>
  );
};
