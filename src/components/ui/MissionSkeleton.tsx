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
      className="fixed inset-0 z-50 bg-[#F7F7F7] flex flex-col p-6 overflow-hidden safe-y"
    >
      {/* Top Bar Mockup */}
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-32 h-4 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>

      {/* Title & Badge Mockup */}
      <div className="space-y-4 mb-10 flex flex-col items-center text-center mt-4">
        <Skeleton className="w-24 h-6 rounded-full" />
        <Skeleton className="w-3/4 h-12 rounded-2xl" />
        <Skeleton className="w-5/6 h-6 rounded-lg" />
      </div>

      {/* Content Blocks Mockup */}
      <div className="flex-1 space-y-4">
        <Skeleton className="w-full h-32 rounded-[2rem]" />
        <Skeleton className="w-full h-24 rounded-[2rem]" />
        <div className="grid grid-cols-2 gap-4 mt-6">
           <Skeleton className="w-full h-16 rounded-2xl" />
           <Skeleton className="w-full h-16 rounded-2xl" />
        </div>
      </div>

      {/* Footer Button Mockup */}
      <div className="mt-8 mb-4">
        <Skeleton className="w-full h-14 rounded-2xl" />
      </div>

      {/* Loading Overlay */}
      <div className="absolute inset-0 bg-[#F7F7F7]/60 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
        <Loader2 className="w-8 h-8 text-[#FF7300] animate-spin mb-4" />
        <p className="text-xs font-mono font-bold text-zinc-600 uppercase tracking-widest">{loadingText}</p>
      </div>
    </motion.div>
  );
};
