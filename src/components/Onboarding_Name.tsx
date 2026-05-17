import React, { useState } from 'react';
import { motion } from 'motion/react';

interface OnboardingNameProps {
  onComplete: (name: string) => void;
}

export const Onboarding_Name: React.FC<OnboardingNameProps> = ({ onComplete }) => {
  const [callsign, setCallsign] = useState('');
  const [isExiting, setIsExiting] = useState(false);

  const handleConfirm = async () => {
    if (callsign.length < 2) return;
    setIsExiting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    onComplete(callsign);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isExiting ? 0 : 1, scale: isExiting ? 1.05 : 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#050505] text-white p-6 flex flex-col justify-between"
    >
      <div className="pt-12 space-y-2">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-[#CCFF00]">IDENTIFY YOURSELF.</h1>
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Enter your primary callsign. This is what the AI and your Squad will call you.</p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <input
          type="text"
          placeholder="[ TYPE NAME ]"
          value={callsign}
          onChange={(e) => setCallsign(e.target.value)}
          className="w-full bg-transparent text-center text-6xl font-mono text-white placeholder:text-[#333] focus:outline-none caret-[#CCFF00]"
          autoFocus
        />
      </div>

      <motion.button
        disabled={callsign.length < 2}
        onClick={handleConfirm}
        className={`w-full py-6 rounded-3xl font-black text-lg uppercase tracking-widest transition-all duration-300 ${
          callsign.length >= 2 ? 'bg-[#FF6B00] text-white shadow-[0_0_20px_#FF6B00]' : 'bg-zinc-800 text-zinc-500 opacity-50'
        }`}
      >
        CONFIRM IDENTITY
      </motion.button>
    </motion.div>
  );
};
