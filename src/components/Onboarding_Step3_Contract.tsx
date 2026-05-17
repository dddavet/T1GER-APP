import React, { useState } from 'react';
import { motion } from 'motion/react';

interface ContractProps {
  onComplete: (age: number) => void;
}

export const Onboarding_Step3_Contract: React.FC<ContractProps> = ({ onComplete }) => {
  const [age, setAge] = useState<number | ''>('');
  const totalMonths = 960;
  const livedMonths = (typeof age === 'number' ? age : 0) * 12;

  const handleConfirm = () => {
    if (typeof age === 'number' && age >= 12 && age <= 100) {
      onComplete(age);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 flex flex-col justify-between">
      <div className="pt-12 space-y-2">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">YOUR TIME IS RUNNING OUT.</h1>
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Enter your age. Each dot represents one month of an 80-year lifespan.</p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-8">
        <input
          type="number"
          placeholder="ENTER AGE"
          value={age}
          onChange={(e) => setAge(parseInt(e.target.value) || '')}
          className="w-full bg-transparent border-b-2 border-white/20 text-6xl font-black italic text-center focus:outline-none focus:border-[#FF6B00] transition-colors"
          autoFocus
        />

        <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-1">
          {[...Array(totalMonths)].map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{
                backgroundColor: i < livedMonths ? '#FF6B00' : '#222',
                boxShadow: i < livedMonths ? '0 0 5px #FF6B00' : 'none'
              }}
              className="w-1.5 h-1.5 rounded-full"
            />
          ))}
        </div>
      </div>

      <motion.button
        disabled={typeof age !== 'number' || age < 12 || age > 100}
        onClick={handleConfirm}
        className={`w-full py-6 rounded-3xl font-black text-lg uppercase tracking-widest transition-colors ${
          typeof age === 'number' && age >= 12 && age <= 100 ? 'bg-[#CCFF00] text-black' : 'bg-zinc-800 text-zinc-500'
        }`}
      >
        I COMMIT TO THE HUNT.
      </motion.button>
    </div>
  );
};
