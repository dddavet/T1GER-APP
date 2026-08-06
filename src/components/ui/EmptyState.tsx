import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center h-full">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-24 h-24 bg-zinc-100 rounded-3xl flex items-center justify-center mb-6 border-b-4 border-zinc-200"
      >
        <Icon className="w-10 h-10 text-zinc-400" strokeWidth={1.5} />
      </motion.div>
      <h3 className="text-xl font-black text-zinc-800 uppercase tracking-tight mb-2">{title}</h3>
      <p className="text-sm font-medium text-zinc-500 mb-8 max-w-[260px] leading-relaxed">{description}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="w-full max-w-[240px] py-4 rounded-2xl bg-[#58CC02] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#58A700] active:border-b-0 active:translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
