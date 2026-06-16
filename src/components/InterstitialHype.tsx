import React from 'react';
import { motion } from 'motion/react';

interface InterstitialHypeProps {
  timeCommitment?: number;
}

export const InterstitialHype: React.FC<InterstitialHypeProps> = ({ timeCommitment = 15 }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center px-4 relative">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FF6B00]/10 rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="space-y-8 relative z-10"
      >
        <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter uppercase leading-[0.9] text-white">
          <span className="text-[#FF6B00]">{timeCommitment} minutos</span> al día es suficiente.
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/90 leading-tight">
          El éxito no es suerte.<br />Es sistema.
        </h2>
        
        <div className="h-1 w-16 bg-[#FF6B00] mx-auto my-10 rounded-full shadow-[0_0_10px_#FF6B00]" />

        <p className="text-sm font-medium text-zinc-400 leading-relaxed px-6">
          <span className="text-white font-black uppercase tracking-wider block mb-2">El 90% de los usuarios de T1GER</span> 
          dicen que su mentalidad cambia por completo en las primeras 2 semanas de misiones consistentes.
        </p>
      </motion.div>
    </div>
  );
};
