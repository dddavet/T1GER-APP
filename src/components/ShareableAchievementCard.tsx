import React, { useRef } from 'react';
import { Flame, Share2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ShareableAchievementCardProps {
  mission: any;
  result: any;
  streak: number;
}

export const ShareableAchievementCard: React.FC<ShareableAchievementCardProps> = ({ mission, result, streak }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `T1GER Achievement: ${mission.title}`,
          text: `I just crushed my daily mission: "${mission.title}"! Why? Because ${mission.description}. Proof: ${result.message}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      alert('Sharing not supported on this browser.');
    }
  };

  return (
    <div className="space-y-4">
      <div ref={cardRef} className="bg-gradient-to-br from-[#FF6B00] to-orange-600 p-6 rounded-3xl text-white shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-black uppercase tracking-tight">T1GER Achievement</h3>
          <Flame className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-black mb-2">{mission.title}</h2>
        <p className="text-white/80 text-sm mb-4 font-mono">{mission.description}</p>
        <div className="bg-black/20 p-3 rounded-xl border border-white/10">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">The "Why":</p>
          <p className="text-sm font-medium italic">"{result.message}"</p>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
          <Flame className="w-4 h-4" />
          <span>{streak} Day Streak</span>
        </div>
      </div>
      <button 
        onClick={handleShare}
        className="w-full bg-zinc-900 text-white py-3 rounded-xl font-black text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
      >
        <Share2 className="w-4 h-4" /> SHARE ACHIEVEMENT
      </button>
    </div>
  );
};
