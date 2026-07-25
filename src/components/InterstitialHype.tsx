import React from 'react';
import { motion } from 'motion/react';
import { T1gerInteractiveAvatar } from './T1gerInteractiveAvatar';
import { useBrain } from '../contexts/BrainContext';

interface InterstitialHypeProps {
  timeCommitment?: number;
}

export const InterstitialHype: React.FC<InterstitialHypeProps> = ({ timeCommitment = 15 }) => {
  const { language } = useBrain();
  const isEs = language === 'es';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center px-4 relative font-sans">
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FF7300]/20 rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="space-y-6 relative z-10 max-w-sm mx-auto flex flex-col items-center"
      >
        {/* 3D Glowing T1GER Mascot Avatar */}
        <div className="mb-2">
          <T1gerInteractiveAvatar characterId="t1ger" emotion="PROUD" size={130} />
        </div>

        {/* Speech / Value Proposition */}
        <div className="bg-white border-2 border-zinc-200 border-b-4 border-b-zinc-300 rounded-3xl p-5 shadow-xl">
          <h1 className="text-2xl font-black italic tracking-tight uppercase leading-tight text-zinc-800">
            <span className="text-[#FF7300]">{timeCommitment} {isEs ? 'minutos' : 'minutes'}</span> {isEs ? 'al día es suficiente' : 'a day is enough'}
          </h1>
          <p className="text-xs font-bold text-zinc-500 mt-2 leading-relaxed">
            {isEs 
              ? 'El 90% de nuestros miembros ven cambios de mentalidad en sus primeras 2 semanas de misiones.'
              : '90% of our pack see mindset breakthroughs within their first 2 weeks of daily missions.'
            }
          </p>
        </div>
      </motion.div>
    </div>
  );
};
