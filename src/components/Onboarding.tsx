import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Onboarding_Name } from './Onboarding_Name';
import { Onboarding_Step1_Identity } from './Onboarding_Step1_Identity';
import { Onboarding_Step3_Contract } from './Onboarding_Step3_Contract';

type OnboardingData = {
  name: string | null;
  niche: string | null;
  mode: string | null;
  age: number | null;
  dailyTime: number | null; // minutes
  goal: string | null;
};

const MODES = [
  { name: 'CUB', desc: 'Forgiving. Slow health decay.' },
  { name: 'HUNTER', desc: 'The baseline. Miss a day, take damage.' },
  { name: 'APEX', desc: 'One strike and the streak dies. For the obsessed.' },
];

export const Onboarding = ({ onComplete }: { onComplete: (data: OnboardingData) => void }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({ name: null, niche: null, mode: null, age: null, dailyTime: null, goal: null });
  // ... (inside renderStep, update data and nextStep)
  // ... (add cases for step 4 and 5)

  const nextStep = () => setStep(prev => prev + 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Onboarding_Name 
            onComplete={(name) => { setData({ ...data, name }); nextStep(); }} 
          />
        );
      case 2:
        return (
          <Onboarding_Step1_Identity 
            onComplete={(niche) => { setData({ ...data, niche }); nextStep(); }} 
          />
        );
      case 3:
        return (
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="p-6">
            <h2 className="text-4xl font-black italic text-white mb-8">HOW HARD SHOULD WE BITE?</h2>
            <div className="space-y-4">
              {MODES.map(mode => (
                <motion.button
                  key={mode.name}
                  whileTap={{ scale: 0.95 }}
                  animate={{ 
                    scale: [1, 1.02, 1],
                    transition: { duration: 0.2 }
                  }}
                  onClick={() => { setData({ ...data, mode: mode.name }); nextStep(); }}
                  className="w-full p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-left"
                >
                  <div className="text-2xl font-black italic text-[#FF6B00]">{mode.name}</div>
                  <div className="text-zinc-400 font-mono">{mode.desc}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }} className="p-6">
            <h2 className="text-3xl font-black italic text-white mb-6">DAILY PREDATION TIME</h2>
            <div className="space-y-4">
              {[5, 10, 20].map(time => (
                <button
                  key={time}
                  onClick={() => { setData({ ...data, dailyTime: time }); nextStep(); }}
                  className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-[#FF6B00]/20 transition-all font-mono"
                >
                  {time} MINUTES / DAY
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }} className="p-6">
            <h2 className="text-3xl font-black italic text-white mb-6">PRIMARY OBJECTIVE</h2>
            <input 
              type="text" 
              placeholder="e.g. Raise $1M, Scale to 10k users..."
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 font-mono mb-6"
              onChange={(e) => setData({ ...data, goal: e.target.value })}
            />
            <button
              onClick={() => { if(data.goal) nextStep(); }}
              className="w-full p-4 rounded-xl bg-[#FF6B00] text-white font-black uppercase"
            >
              Confirm Mission
            </button>
          </motion.div>
        );
      case 6:
        return (
          <Onboarding_Step3_Contract 
            onComplete={async (age) => {
              // Full screen flash
              const flash = document.createElement('div');
              flash.className = 'fixed inset-0 bg-white z-[100]';
              document.body.appendChild(flash);
              await new Promise(r => setTimeout(r, 100));
              document.body.removeChild(flash);
              onComplete({ ...data, age });
            }}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050505] flex items-center justify-center">
      <div className="max-w-xl w-full">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};
