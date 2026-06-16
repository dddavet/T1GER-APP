import React from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, CheckCircle2 } from 'lucide-react';

export const GeneratePlanIntro: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center space-y-12 mt-12">
      
      {/* Central Animation */}
      <div className="relative flex items-center justify-center">
        {/* Glowing aura */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3] 
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[#FF6B00]/30 rounded-full blur-[60px]"
        />
        
        {/* Main Circle */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-48 h-48 rounded-full border-2 border-[#FF6B00]/30 bg-[#050505] flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(255,107,0,0.2)]"
        >
          {/* Inner ring spinning */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border border-dashed border-white/20"
          />
          
          <BrainCircuit size={64} className="text-[#FF6B00]" strokeWidth={1.5} />
        </motion.div>
        
        {/* Checkmark Badge */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="absolute -bottom-4 bg-[#1a1a1c] border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 shadow-xl z-20"
        >
          <CheckCircle2 size={16} className="text-[#FF6B00]" />
          <span className="text-xs font-bold text-white uppercase tracking-widest">Calibrado</span>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center px-4 space-y-4"
      >
        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-tight text-white drop-shadow-md">
          ¡Todo listo!
        </h2>
        <p className="text-lg font-medium text-zinc-400">
          Es hora de generar tu Currículum de Guerra.
        </p>
      </motion.div>
    </div>
  );
};
