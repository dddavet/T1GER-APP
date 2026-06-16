import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users } from 'lucide-react';

interface ReferralCodeProps {
  onSubmit: (code: string) => void;
  onSkip: () => void;
}

export const ReferralCode: React.FC<ReferralCodeProps> = ({ onSubmit, onSkip }) => {
  const [code, setCode] = useState('');

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-12 mt-12">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-4 space-y-4"
      >
        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-tight text-white drop-shadow-md">
          ¿Tienes código de referido?
        </h2>
        <p className="text-sm font-medium text-zinc-400">
          Únete al escuadrón de un amigo para ganar XP extra. Puedes saltar este paso.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full relative"
      >
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-2 flex items-center shadow-xl focus-within:border-[#FF6B00]/50 focus-within:bg-white/10 transition-all duration-300">
          <div className="pl-4 text-zinc-500">
            <Users size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Referral Code" 
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1 bg-transparent border-none text-white font-bold px-4 py-4 outline-none placeholder:font-normal placeholder:text-zinc-600 uppercase"
            maxLength={8}
          />
          <button 
            onClick={() => code.length > 2 ? onSubmit(code) : null}
            className={`px-6 py-4 rounded-[1.5rem] font-bold text-sm transition-all duration-300 ${
              code.length > 2 
                ? 'bg-[#FF6B00] text-black shadow-[0_0_15px_rgba(255,107,0,0.4)]' 
                : 'bg-white/10 text-zinc-500'
            }`}
          >
            Submit
          </button>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onSkip}
        className="mt-8 text-zinc-500 font-bold text-sm uppercase tracking-widest active:scale-95 transition-transform"
      >
        Skip this step
      </motion.button>

    </div>
  );
};
