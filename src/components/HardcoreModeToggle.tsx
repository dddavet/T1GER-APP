import React from 'react';
import { motion } from 'motion/react';
import { Skull, Flame } from 'lucide-react';

export const HardcoreModeToggle: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center space-y-8 mt-2 relative z-10">
      
      {/* Immersive Image/Graphic Background */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full aspect-[4/5] max-h-[45vh] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Dark aggressive gradient replacing the photo for now */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0b00] via-[#050505] to-[#0a0a0c]" />
        
        {/* Glowing orb */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#FF6B00]/20 rounded-full blur-[60px]" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />

        {/* Feature Cards overlaying the graphic */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] z-20 space-y-3">
          
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center gap-4 shadow-xl"
          >
            <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
              <Flame size={20} className="text-[#050505]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 block mb-0.5">Si mantienes la racha</span>
              <span className="text-sm font-bold text-white">+500 XP Bonos</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-[#050505]/80 backdrop-blur-md border border-red-500/30 p-4 rounded-3xl flex items-center gap-4 shadow-xl"
          >
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 border border-red-500/50">
              <Skull size={18} className="text-red-500" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-0.5">Si fallas un día</span>
              <span className="text-sm font-bold text-red-500">-2X Penalización</span>
            </div>
          </motion.div>

        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="text-center px-2 space-y-4"
      >
        <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-tight text-white drop-shadow-md">
          ¿Activar el Modo Castigo?
        </h2>
        <p className="text-xs font-medium text-zinc-400 leading-relaxed">
          T1GER no es una app amable. Te castigaremos si no cumples, pero te premiaremos en grande si demuestras disciplina.
        </p>
      </motion.div>
    </div>
  );
};
