import React from 'react';

export const Simulator = () => {
  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center p-8 overflow-auto font-sans">
      <div className="mb-8 text-center shrink-0">
        <h1 className="text-3xl font-black uppercase tracking-widest text-accent mb-2">T1GER Double Simulator</h1>
        <p className="text-sm text-neutral-400 max-w-lg mx-auto">
          Testing native platforms side by side. Apple on the left, Android on the right.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center pb-20 w-full max-w-[1400px]">
        {/* iOS iPhone Mockup */}
        <div className="flex flex-col items-center gap-4 shrink-0">
          <div className="text-xs font-bold uppercase tracking-widest text-neutral-500">iPhone 15 Pro (iOS)</div>
          <div className="relative w-[393px] h-[852px] bg-black rounded-[55px] shadow-2xl border-[14px] border-neutral-800 overflow-hidden ring-1 ring-white/10 shrink-0" style={{ transform: 'scale(0.75)', transformOrigin: 'top center', marginBottom: '-213px' }}>
            {/* Dynamic Island Mock */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-full z-50"></div>
            <iframe 
              src="/?sim_platform=ios" 
              className="w-full h-full bg-white"
              title="iOS Simulator"
            />
          </div>
        </div>

        {/* Android Pixel Mockup */}
        <div className="flex flex-col items-center gap-4 shrink-0">
          <div className="text-xs font-bold uppercase tracking-widest text-neutral-500">Google Pixel (Android)</div>
          <div className="relative w-[412px] h-[915px] bg-black rounded-[40px] shadow-2xl border-[10px] border-neutral-800 overflow-hidden ring-1 ring-white/10 shrink-0" style={{ transform: 'scale(0.75)', transformOrigin: 'top center', marginBottom: '-228px' }}>
            {/* Punch Hole Camera */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[24px] h-[24px] bg-black rounded-full z-50"></div>
            <iframe 
              src="/?sim_platform=android" 
              className="w-full h-full bg-white"
              title="Android Simulator"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
