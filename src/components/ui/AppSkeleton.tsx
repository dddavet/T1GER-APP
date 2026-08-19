import React from 'react';
import { Loader2 } from 'lucide-react';

export const AppSkeleton = () => {
  return (
    <div className="flex flex-col h-screen w-full bg-[#09090B] text-white items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,115,0,0.18),transparent_55%)]" />
      <div className="relative flex flex-col items-center gap-5 z-10">
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center p-3 shadow-[0_0_40px_rgba(255,115,0,0.25)]">
          <img src="/t1ger-avatar.png" alt="T1GER" className="h-full w-full object-contain animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs uppercase tracking-widest">
          <Loader2 className="w-4 h-4 text-[#FF7300] animate-spin" />
          <span>Iniciando T1GER...</span>
        </div>
      </div>
    </div>
  );
};

