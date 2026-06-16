import React from 'react';
import { motion } from 'motion/react';

interface PaceSliderProps {
  value: number;
  onChange: (val: number) => void;
}

export const PaceSlider: React.FC<PaceSliderProps> = ({ value, onChange }) => {
  const paces = [
    { label: "Casual", emoji: "🐢", speed: "10 XP/day" },
    { label: "Standard", emoji: "🐺", speed: "30 XP/day" },
    { label: "Predator", emoji: "🐯", speed: "100 XP/day" }
  ];

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="text-center mb-10">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Training Intensity</span>
        <span className="text-5xl font-black text-white italic tracking-tighter">
          {paces[value].label}
        </span>
      </div>

      <div className="w-full flex justify-between px-2 mb-6 text-4xl">
        <span className={`transition-all duration-300 ${value === 0 ? 'opacity-100 scale-125' : 'opacity-40 filter grayscale'}`}>🐢</span>
        <span className={`transition-all duration-300 ${value === 1 ? 'opacity-100 scale-125' : 'opacity-40 filter grayscale'}`}>🐺</span>
        <span className={`transition-all duration-300 ${value === 2 ? 'opacity-100 scale-125 drop-shadow-[0_0_15px_rgba(255,107,0,0.5)]' : 'opacity-40 filter grayscale'}`}>🐯</span>
      </div>

      <div className="relative w-full h-8 flex items-center px-4">
        {/* Track */}
        <div className="absolute left-0 right-0 h-2 bg-white/10 rounded-full mx-6" />
        
        {/* Active Track */}
        <motion.div 
          className="absolute left-6 h-2 bg-[#FF6B00] rounded-full shadow-[0_0_10px_#FF6B00]"
          animate={{ width: `calc(${value * 50}% - ${value === 2 ? 48 : value === 1 ? 24 : 0}px)` }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />

        <input 
          type="range" 
          min="0" 
          max="2" 
          step="1" 
          value={value} 
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full appearance-none bg-transparent outline-none z-20 h-full relative cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-8
            [&::-webkit-slider-thumb]:h-8
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-[0_4px_12px_rgba(0,0,0,0.5)]
            [&::-webkit-slider-thumb]:border-4
            [&::-webkit-slider-thumb]:border-[#FF6B00]
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:active:scale-110
          "
        />
      </div>

      <div className="w-full flex justify-between px-4 mt-6">
        {paces.map((p, i) => (
          <span key={i} className={`text-[10px] font-mono uppercase tracking-widest transition-colors duration-300 ${value === i ? 'text-[#FF6B00] font-black' : 'text-zinc-600 font-bold'}`}>
            {p.speed}
          </span>
        ))}
      </div>

      <div className="mt-10 text-center bg-white/[0.03] rounded-full px-6 py-2.5 border border-white/5 shadow-inner">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
          {value === 0 ? 'Just getting started' : value === 1 ? 'Recommended for most' : 'For the absolutely obsessed'}
        </span>
      </div>
    </div>
  );
};
