import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Terminal, Camera, Handshake } from 'lucide-react';

interface IdentitySelectorProps {
  onComplete: (niche: string) => void;
}

const niches = [
  { id: 'ecommerce', title: 'E-COMMERCE & BRAND', icon: ShoppingBag },
  { id: 'saas', title: 'SAAS & CODE', icon: Terminal },
  { id: 'content', title: 'CONTENT & AUDIENCE', icon: Camera },
  { id: 'service', title: 'SERVICE & AGENCY', icon: Handshake },
];

export const Onboarding_Step1_Identity: React.FC<IdentitySelectorProps> = ({ onComplete }) => {
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedNiche) return;
    setIsExiting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    onComplete(selectedNiche);
  };

  return (
    <motion.div
      initial={{ x: 0, opacity: 1 }}
      animate={{ x: isExiting ? -500 : 0, opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#050505] text-white p-6 flex flex-col justify-between"
    >
      <div className="pt-12 space-y-2">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">IDENTIFY YOUR HUNTING GROUND.</h1>
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">The AI will calibrate your daily missions based on this selection. Choose carefully.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 my-8">
        {niches.map((niche) => {
          const Icon = niche.icon;
          const isSelected = selectedNiche === niche.id;
          return (
            <motion.button
              key={niche.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedNiche(niche.id)}
              className={`glass p-6 rounded-3xl border-2 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
                isSelected ? 'border-[#FF6B00] shadow-[0_0_15px_#FF6B00]' : 'border-white/10'
              }`}
            >
              <Icon className={`w-10 h-10 ${isSelected ? 'text-[#FF6B00]' : 'text-zinc-500'}`} />
              <span className="font-black text-xs uppercase tracking-widest text-center">{niche.title}</span>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        disabled={!selectedNiche}
        onClick={handleConfirm}
        className={`w-full py-6 rounded-3xl font-black text-lg uppercase tracking-widest transition-colors ${
          selectedNiche ? 'bg-[#CCFF00] text-black' : 'bg-zinc-800 text-zinc-500'
        }`}
      >
        CONFIRM SELECTION
      </motion.button>
    </motion.div>
  );
};
