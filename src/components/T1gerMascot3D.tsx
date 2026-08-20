import React from 'react';
import type { MascotReaction } from '../services/mascotGuide';
import { LivingT1gerPet } from './pet/LivingT1gerPet';

export type { MascotReaction } from '../services/mascotGuide';

export interface MascotProps {
  modelPath?: string;
  mood?: MascotReaction;
  className?: string;
  closeUp?: boolean;
  health?: number;
  energy?: number;
  hunger?: number;
  strength?: number;
  isEating?: boolean;
  isMeditating?: boolean;
  isPetted?: boolean;
  onPet?: (e: React.MouseEvent) => void;
}

export const T1gerMascot3D: React.FC<MascotProps> = ({
  mood = 'idle',
  className = 'h-44 w-44',
  closeUp = false,
  health = 100,
  energy = 85,
  hunger = 80,
  strength = 75,
  isEating = false,
  isMeditating = false,
  isPetted = false,
  onPet,
}) => {
  let finalMood: any = mood;
  if (isEating) finalMood = 'eating';
  if (isPetted) finalMood = 'happy';
  if (isMeditating) finalMood = 'sleeping';

  return (
    <LivingT1gerPet
      mood={finalMood}
      health={health}
      energy={energy}
      hunger={hunger}
      strength={strength}
      className={className}
      onPet={onPet}
    />
  );
};
