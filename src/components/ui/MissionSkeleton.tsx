import React from 'react';
import { Skeleton } from './Skeleton';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface MissionSkeletonProps {
  loadingText?: string;
}

export const MissionSkeleton: React.FC<MissionSkeletonProps> = ({ loadingText = 'Cargando Misión...' }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 h-[100dvh] w-full z-50 bg-[#09090B] flex flex-col p-6 overflow-hidden safe-y pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)]"
    >
      {/* Top Bar Mockup */}
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
        <Skeleton className="w-32 h-4 rounded-full bg-white/10" />
        <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
      </div>

      {/* Title & Badge Mockup */}
      <div className="space-y-4 mb-10 flex flex-col items-center text-center mt-4">
        <Skeleton className="w-24 h-6 rounded-full bg-white/10" />
        <Skeleton className="w-3/4 h-12 rounded-2xl bg-white/10" />
        <Skeleton className="w-5/6 h-6 rounded-lg bg-white/10" />
      </div>

      {/* Content Blocks Mockup */}
      <div className="flex-1 space-y-4">
        <Skeleton className="w-full h-32 rounded-[2rem] bg-white/10" />
        <Skeleton className="w-full h-24 rounded-[2rem] bg-white/10" />
        <div className="grid grid-cols-2 gap-4 mt-6">
           <Skeleton className="w-full h-16 rounded-2xl bg-white/10" />
           <Skeleton className="w-full h-16 rounded-2xl bg-white/10" />
        </div>
      </div>

      {/* Footer Button Mockup */}
      <div className="mt-8 mb-4">
        <Skeleton className="w-full h-14 rounded-2xl bg-white/10" />
      </div>

      {/* Loading Overlay */}
      <div className="absolute inset-0 bg-[#09090B]/60 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none">
        <Loader2 className="w-8 h-8 text-[#FF7300] animate-spin mb-4" />
        <p className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">{loadingText}</p>
      </div>
    </motion.div>
  );
};
