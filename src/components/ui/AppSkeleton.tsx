import React from 'react';
import { Loader2 } from 'lucide-react';

export const AppSkeleton = () => {
  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#09090B] text-zinc-50 items-center justify-center relative overflow-hidden">
      {/* Deep Obsidian Background with subtle dark warm glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,115,0,0.12),transparent_60%)]" />
      <div className="relative flex flex-col items-center gap-6 z-10">
        <div className="relative h-24 w-24 rounded-[2rem] bg-gradient-to-br from-[#1c1c1f] to-[#0d0d0f] border border-white/5 flex items-center justify-center p-4 shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]">
          {/* Subtle spinning glow ring */}
          <div className="absolute inset-0 rounded-[2rem] border border-[#FF7300]/20 animate-[spin_4s_linear_infinite] opacity-50" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }} />
          <img src="/t1ger-avatar.png" alt="T1GER" className="h-full w-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" />
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-[#FF7300] animate-spin" />
          <span className="font-mono text-[11px] font-semibold tracking-[0.15em] text-zinc-400 uppercase">
            Loading System
          </span>
        </div>
      </div>
    </div>
  );
};

