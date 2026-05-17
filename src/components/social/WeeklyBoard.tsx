import React from 'react';
import { motion } from 'motion/react';
import { Crown, Flame, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useT1ger } from '../../contexts/T1gerContext';

// ============================================================
// MOCK DATA — Replace with Firestore queries when going live
// ============================================================
interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  weeklyXP: number;
  streak: number;
  isYou?: boolean;
}

const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { id: 'l1', name: 'ALEX_CEO', avatar: '🦁', weeklyXP: 840, streak: 23 },
  { id: 'l2', name: 'MAYA_OPS', avatar: '🐺', weeklyXP: 620, streak: 15 },
  { id: 'you', name: 'YOU', avatar: '🐅', weeklyXP: 0, streak: 0, isYou: true }, // will be overridden
  { id: 'l3', name: 'JACK_MKT', avatar: '🦊', weeklyXP: 380, streak: 7 },
  { id: 'l4', name: 'SARA_BIZ', avatar: '🐆', weeklyXP: 210, streak: 4 },
];

const RANK_STYLES = [
  { bg: 'bg-amber-500/10', border: 'border-amber-500/30', crown: 'text-amber-400', label: '1st' },
  { bg: 'bg-zinc-300/10', border: 'border-zinc-400/20', crown: 'text-zinc-300', label: '2nd' },
  { bg: 'bg-orange-700/10', border: 'border-orange-600/20', crown: 'text-orange-500', label: '3rd' },
];

export const WeeklyBoard = () => {
  const { appUser } = useAuth();
  const { stats } = useT1ger();

  // Build the leaderboard with real user data injected
  const board = MOCK_LEADERBOARD.map(user => {
    if (user.isYou) {
      return {
        ...user,
        name: appUser?.displayName?.toUpperCase() || 'YOU',
        avatar: '🐅',
        weeklyXP: stats.xp,
        streak: stats.streak,
      };
    }
    return user;
  }).sort((a, b) => b.weeklyXP - a.weeklyXP);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-accent" /> Weekly Race
        </h3>
        <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">
          Resets Monday
        </span>
      </div>

      <div className="liquid-glass border-white/10 rounded-[2.5rem] overflow-hidden shadow-3d">
        {board.map((user, i) => {
          const rankStyle = i < 3 ? RANK_STYLES[i] : null;
          const isYou = user.isYou;
          const isPromotionZone = i < 3;

          return (
            <React.Fragment key={user.id}>
              {/* Promotion Zone Divider */}
              {i === 3 && (
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center px-6">
                    <div className="w-full border-t border-accent/20 border-dashed" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#020203] px-3 text-[8px] font-black uppercase text-accent/60 tracking-[0.3em]">Promotion Zone</span>
                  </div>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`flex items-center gap-4 px-6 py-4 relative group ${
                  i < board.length - 1 ? 'border-b border-white/[0.03]' : ''
                } ${isYou ? 'bg-accent/5' : ''}`}
              >
                {/* Rank Indicator */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-3d border transition-all ${
                  rankStyle ? `${rankStyle.bg} ${rankStyle.border} scale-110` : 'bg-black/40 border-white/5'
                }`}>
                  {i < 3 ? (
                    <Crown className={`w-4 h-4 ${rankStyle?.crown}`} />
                  ) : (
                    <span className="text-[10px] font-black text-zinc-600">{i + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 shadow-inner relative ${
                  isYou ? 'bg-accent/20 border-accent/30 border shadow-3d-accent' : 'bg-zinc-900 border border-white/5'
                }`}>
                  {user.avatar}
                  {isPromotionZone && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-[#020203] flex items-center justify-center">
                       <TrendingUp className="w-2.5 h-2.5 text-black" />
                    </div>
                  )}
                </div>

                {/* Name + streak */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-black text-xs tracking-tight uppercase truncate block ${
                      isYou ? 'text-accent' : 'text-zinc-300'
                    }`}>
                      {user.name}
                    </span>
                    {isYou && (
                      <span className="text-[8px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-sm font-black uppercase tracking-tighter">YOU</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Flame className="w-2.5 h-2.5 text-orange-500" />
                    <span className="text-[9px] text-zinc-600 font-black uppercase tracking-tight">{user.streak}D STREAK</span>
                  </div>
                </div>

                {/* Weekly XP */}
                <div className="text-right flex-shrink-0">
                  <span className={`text-sm font-black ${
                    i === 0 ? 'text-amber-400' : isYou ? 'text-accent' : 'text-white'
                  }`}>
                    {user.weeklyXP.toLocaleString()}
                  </span>
                  <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest block">XP</span>
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
