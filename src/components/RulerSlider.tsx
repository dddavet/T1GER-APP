import React, { useRef, useEffect } from 'react';

interface RulerSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
}

export const RulerSlider: React.FC<RulerSliderProps> = ({ min, max, step, value, onChange, formatValue }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemWidth = 15; // width per tick
  const stepsCount = Math.floor((max - min) / step);
  const ticks = Array.from({ length: stepsCount + 1 }, (_, i) => min + i * step);

  useEffect(() => {
    // initial scroll
    const index = ticks.indexOf(value);
    if (index >= 0 && containerRef.current) {
      containerRef.current.scrollLeft = index * itemWidth;
    }
  }, [ticks, value]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollLeft = containerRef.current.scrollLeft;
    const centerIndex = Math.round(scrollLeft / itemWidth);
    
    if (ticks[centerIndex] !== undefined && ticks[centerIndex] !== value) {
      onChange(ticks[centerIndex]);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-12 text-center h-20 flex flex-col justify-end">
        <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Compromiso Diario</span>
        <span className="text-5xl font-black text-white italic tracking-tighter">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>

      <div className="relative w-full h-[120px] overflow-hidden">
        {/* Top/Bottom Borders */}
        <div className="absolute top-0 w-full h-[1px] bg-white/10 z-10" />
        <div className="absolute bottom-0 w-full h-[1px] bg-white/10 z-10" />

        {/* Fades */}
        <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />
        
        {/* Center Pointer */}
        <div className="absolute left-1/2 top-0 h-full w-0.5 bg-[#FF6B00] z-20 shadow-[0_0_12px_#FF6B00] -translate-x-1/2" />

        {/* Scroll Container */}
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar flex items-end relative"
          style={{ paddingLeft: 'calc(50% - 7px)', paddingRight: 'calc(50% - 7px)' }}
        >
          {ticks.map((tick, i) => {
            // For time (5 to 60), let's make every 10 mins major. 
            // min is 5. ticks: 5, 10, 15, 20...
            // If tick % 10 === 0, it's major.
            const isMajor = tick % 10 === 0;
            const isMinor = !isMajor;
            return (
              <div 
                key={tick}
                className="snap-center flex flex-col justify-end items-center flex-shrink-0 cursor-pointer"
                style={{ width: `${itemWidth}px`, height: '100%' }}
                onClick={() => {
                  if (containerRef.current) {
                    containerRef.current.scrollTo({ left: i * itemWidth, behavior: 'smooth' });
                  }
                }}
              >
                {/* Tick Line */}
                <div 
                  className={`w-0.5 transition-all duration-200 ${
                    isMajor ? 'bg-zinc-400 h-12' : isMinor ? 'bg-zinc-600 h-8' : 'bg-zinc-800 h-5'
                  } ${value === tick ? 'bg-[#FF6B00]' : ''}`} 
                />
                
                {/* Major Tick Label */}
                {isMajor && (
                  <span className={`text-[10px] font-mono absolute top-2 transition-colors duration-200 ${value === tick ? 'text-[#FF6B00] font-black' : 'text-zinc-600'}`}>
                    {tick}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
