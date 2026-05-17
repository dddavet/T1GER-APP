import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Share2, Copy, Check, Users, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const InviteBanner = () => {
  const { appUser } = useAuth();
  const [copied, setCopied] = useState(false);

  // Generate a deterministic invite code from the user's UID
  const inviteCode = (appUser?.uid || 'DEMO').slice(0, 6).toUpperCase();
  const inviteLink = `https://t1ger.app/join/${inviteCode}`;

  const haptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const handleCopy = async () => {
    haptic();
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    haptic();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on T!GER',
          text: 'Hunt with me — level up your business daily. Join my squad on T!GER 🐅',
          url: inviteLink,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2.5rem] p-6 shadow-3d border border-accent/20"
      style={{
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-main) 12%, transparent) 0%, color-mix(in srgb, var(--accent-main) 4%, transparent) 100%)',
      }}
    >
      {/* Decorative glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full liquid-glass-accent flex items-center justify-center shadow-3d-accent">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <h3 className="font-black text-lg italic uppercase tracking-tighter text-white">Pack <span className="text-accent">Recruitment</span></h3>
        </div>
        <p className="text-xs font-medium text-zinc-500 mb-6 leading-relaxed uppercase tracking-tight">
          Hunt with peers. Shared streaks, weekly co-op missions, and AI-driven accountability.
        </p>

        {/* Invite code display */}
        <div className="flex items-center gap-3 mb-6 liquid-glass rounded-[1.5rem] p-4 border-white/5 shadow-inner">
          <div className="flex-1">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Deployment Code</p>
            <p className="text-xl font-black tracking-[0.4em] text-accent drop-shadow-[0_0_8px_var(--accent-glow)]">{inviteCode}</p>
          </div>
          <button
            onClick={handleCopy}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-3d ${
              copied ? 'bg-accent text-black shadow-3d-accent' : 'bg-white/5 text-zinc-400 border border-white/10'
            }`}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-black py-4 rounded-full font-black text-[10px] uppercase tracking-widest active:scale-[0.97] transition-all shadow-3d"
          >
            <Share2 className="w-4 h-4" strokeWidth={3} /> Signal Operatives
          </button>
        </div>
      </div>

      {/* Sparkle decoration */}
      <Sparkles className="absolute top-3 right-3 w-4 h-4 text-accent/20" />
    </motion.div>
  );
};
