import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock } from 'lucide-react';

export const PrivacyTrust: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center mt-8 space-y-10">
      
      {/* Icon Graphic */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-[#FF6B00]/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="w-48 h-48 rounded-full border border-white/10 bg-[#0a0a0c] flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(255,107,0,0.15)] overflow-hidden">
          {/* Subtle dots pattern background inside circle */}
          <div className="absolute inset-0 rounded-full opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          
          <motion.div 
            initial={{ y: 10, rotate: -10 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="relative"
          >
             <ShieldCheck size={80} className="text-[#FF6B00] drop-shadow-[0_0_15px_rgba(255,107,0,0.5)]" strokeWidth={1.5} />
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center space-y-4 px-2"
      >
        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-tight text-white drop-shadow-md">
          Gracias por confiar en nosotros
        </h2>
        <p className="text-sm font-medium text-zinc-400">
          Ahora vamos a personalizar T1GER para ti...
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 w-full text-center relative mt-6 shadow-2xl"
      >
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#1c1c1e] border border-white/10 flex items-center justify-center shadow-lg">
          <Lock size={14} className="text-[#FF6B00]" />
        </div>
        <h3 className="text-sm font-bold text-white mb-2 mt-2">Tu privacidad y seguridad nos importan.</h3>
        <p className="text-xs text-zinc-500 font-medium leading-relaxed px-2">
          Prometemos mantener siempre tu información personal, metas financieras y progreso en estricta confidencialidad.
        </p>
      </motion.div>
    </div>
  );
};
