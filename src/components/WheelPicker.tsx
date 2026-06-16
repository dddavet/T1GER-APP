import React, { useRef, useEffect } from 'react';

interface WheelPickerProps {
  options: { label: string; value: string | number }[];
  value: string | number;
  onChange: (val: string | number) => void;
}

export const WheelPicker: React.FC<WheelPickerProps> = ({ options, value, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 60; // 60px height per item

  useEffect(() => {
    // scroll to initial value
    const index = options.findIndex(o => o.value === value);
    if (index >= 0 && containerRef.current) {
      containerRef.current.scrollTop = index * itemHeight;
    }
  }, [options, value]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const centerIndex = Math.round(scrollTop / itemHeight);
    
    if (options[centerIndex] && options[centerIndex].value !== value) {
      onChange(options[centerIndex].value);
    }
  };

  return (
    <div className="relative w-full h-[300px] flex justify-center items-center overflow-hidden">
      {/* Top and Bottom Fades */}
      <div className="absolute top-0 w-full h-[120px] bg-gradient-to-b from-[#050505] to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 w-full h-[120px] bg-gradient-to-t from-[#050505] to-transparent z-10 pointer-events-none" />
      
      {/* Selection Highlight */}
      <div className="absolute top-1/2 -translate-y-1/2 w-[80%] h-[60px] bg-white/[0.03] rounded-2xl z-0 border border-white/10" />

      {/* Scrollable Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-auto snap-y snap-mandatory hide-scrollbar z-20 relative pt-[120px] pb-[120px]"
      >
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <div 
              key={opt.value}
              className={`h-[60px] flex items-center justify-center snap-center cursor-pointer transition-all duration-200
                ${isSelected ? 'text-white text-3xl font-black' : 'text-zinc-600 text-xl font-bold'}
              `}
              onClick={() => {
                const idx = options.findIndex(o => o.value === opt.value);
                if (containerRef.current) {
                  containerRef.current.scrollTo({ top: idx * itemHeight, behavior: 'smooth' });
                }
              }}
            >
              {opt.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};
