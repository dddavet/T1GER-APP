import React from 'react';
import { Skeleton } from './Skeleton';
import { Loader2 } from 'lucide-react';

export const AppSkeleton = () => {
  return (
    <div className="flex flex-col h-screen bg-[#F7F7F7] overflow-hidden">
      {/* Top Header Mockup */}
      <div className="flex justify-between items-center p-4 mt-8">
        <Skeleton className="w-32 h-8 rounded-full" />
        <Skeleton className="w-24 h-8 rounded-full" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-4 py-8 space-y-6">
        <Skeleton className="w-3/4 h-10 rounded-xl" />
        <Skeleton className="w-1/2 h-6 rounded-md mb-8" />
        
        {/* Mockup Cards */}
        <div className="space-y-4">
          <Skeleton className="w-full h-32 rounded-3xl" />
          <Skeleton className="w-full h-32 rounded-3xl" />
          <Skeleton className="w-full h-32 rounded-3xl" />
        </div>
      </div>

      {/* NavDock Mockup */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-2">
        <div className="flex justify-around items-center p-2.5 bg-white rounded-[2.5rem] shadow-sm border border-zinc-200">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col items-center gap-1 w-18 p-2.5">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-8 h-2 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Subtle Loading Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 mix-blend-multiply">
         <div className="flex items-center gap-2 text-zinc-400">
           <Loader2 className="w-5 h-5 animate-spin" />
           <span className="text-xs font-mono font-bold uppercase tracking-widest">Iniciando Motor T1GER</span>
         </div>
      </div>
    </div>
  );
};
