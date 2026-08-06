import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Target, Zap, ChevronRight, Lock } from 'lucide-react';

interface WagerModeProps {
  onCommit: (minutes: number, wager: number) => void;
}

export const WagerMode: React.FC<WagerModeProps> = ({ onCommit }) => {
  const [minutes, setMinutes] = useState(60);
  const [wager, setWager] = useState(100);
  const [isCommitted, setIsCommitted] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [0, 200],
    ['rgba(255, 79, 0, 0.1)', 'rgba(255, 79, 0, 1)']
  );

  const handleDragEnd = (event: any, info: any) => {
    if (sliderRef.current) {
      const containerWidth = sliderRef.current.offsetWidth;
      const threshold = containerWidth - 80; // 80 is the width of the thumb
      
      if (info.point.x >= threshold) {
        setIsCommitted(true);
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([30, 50, 30]); // Haptic success
        }
        setTimeout(() => {
          onCommit(minutes, wager);
        }, 500);
      } else {
        x.set(0); // Snap back
      }
    }
  };

  const adjustMinutes = (delta: number) => {
    setMinutes(Math.max(15, Math.min(240, minutes + delta)));
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10); // Subtle haptic
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 text-zinc-800 shadow-[0_4px_0_0_rgba(229,229,229,1)] border-2 border-[#E5E5E5] relative overflow-hidden">
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-[#FF7300]/10 flex items-center justify-center">
          <Target className="w-6 h-6 text-[#FF7300]" />
        </div>
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Wager Mode</h2>
          <p className="text-sm font-bold text-zinc-700">Invest your time, earn T-Coins.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Duration</div>
          <div className="flex items-center gap-4">
            <button onClick={() => adjustMinutes(-15)} className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 active:scale-95 transition-transform font-black">-</button>
            <div className="text-2xl font-mono font-black text-zinc-800">{minutes}m</div>
            <button onClick={() => adjustMinutes(15)} className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 active:scale-95 transition-transform font-black">+</button>
          </div>
        </div>
        
        <div className="bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Stake</div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#FF7300]" />
            <div className="text-2xl font-mono font-black text-[#FF7300]">{wager}</div>
          </div>
        </div>
      </div>

      {/* Slide to Commit (Apple Pay style but Gamified) */}
      <div 
        ref={sliderRef}
        className="relative w-full h-16 bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-[24px] overflow-hidden shadow-inner"
      >
        <motion.div 
          className="absolute inset-0"
          style={{ background }}
        />
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mix-blend-multiply">
            {isCommitted ? 'COMMITTED' : 'SLIDE TO COMMIT'}
          </span>
        </div>

        <motion.div
          drag="x"
          dragConstraints={sliderRef}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="absolute left-1 top-1 bottom-1 w-[56px] bg-[#FF7300] rounded-[20px] flex items-center justify-center cursor-grab active:cursor-grabbing z-20 shadow-[0_4px_0_0_#E06500] border border-[#E06500]"
        >
          {isCommitted ? (
            <Lock className="w-5 h-5 text-white" />
          ) : (
            <ChevronRight className="w-6 h-6 text-white" />
          )}
        </motion.div>
      </div>
    </div>
  );
};
