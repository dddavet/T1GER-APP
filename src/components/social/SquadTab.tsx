import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowUp, Award, Clock, Crown, Shield, ShieldCheck, Sparkles, TrendingUp, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBrain } from '../../contexts/BrainContext';
import { useT1ger } from '../../contexts/T1gerContext';
import { MascotGuide } from '../MascotGuide';

interface Competitor {
  id: string;
  name: string;
  avatar: string;
  vXP: number;
  streak: number;
  isCurrentUser?: boolean;
}

const BASE_COMPETITORS: Omit<Competitor, 'isCurrentUser'>[] = [
  { id: 'c1', name: 'Valeria M.', avatar: '⚡', vXP: 480, streak: 12 },
  { id: 'c2', name: 'Carlos R.', avatar: '🎯', vXP: 360, streak: 9 },
  { id: 'c3', name: 'Sofia T.', avatar: '💎', vXP: 290, streak: 7 },
  { id: 'c4', name: 'Mateo G.', avatar: '🚀', vXP: 210, streak: 5 },
  { id: 'c5', name: 'Daniela V.', avatar: '🔥', vXP: 150, streak: 4 },
  { id: 'c6', name: 'Lucas B.', avatar: '🧠', vXP: 80, streak: 3 },
  { id: 'c7', name: 'Ana P.', avatar: '🌟', vXP: 40, streak: 2 },
];

export const SquadTab: React.FC = () => {
  const { language } = useBrain();
  const { stats, setActiveView } = useT1ger();
  const { appUser } = useAuth();
  const isEs = language === 'es';

  const userVXP = stats.verifiedXP;
  const userName = appUser?.displayName || (isEs ? 'Tú' : 'You');

  const leaderboard = useMemo<Competitor[]>(() => {
    const list: Competitor[] = [
      ...BASE_COMPETITORS,
      {
        id: 'currentUser',
        name: userName,
        avatar: '🐅',
        vXP: userVXP,
        streak: stats.streak,
        isCurrentUser: true,
      },
    ];

    return list.sort((a, b) => b.vXP - a.vXP);
  }, [stats.streak, userName, userVXP]);

  const userRankIndex = leaderboard.findIndex(item => item.isCurrentUser);
  const userRank = userRankIndex + 1;
  const inPromotionZone = userRank <= 3;

  return (
    <div className="space-y-5 pb-8 pt-5 font-sans">
      <header>
        <div className="flex items-center justify-between">
          <p className="t1ger-kicker">{isEs ? 'Liga Semanal' : 'Weekly League'}</p>
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-[#A4BDB7]">
            <Clock size={12} className="text-[var(--t1ger-orange)]" />
            <span>{isEs ? 'Termina en 2d 14h' : 'Ends in 2d 14h'}</span>
          </div>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white">
          {isEs ? 'Liga Ámbar' : 'Amber League'}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#87A9A2]">
          {isEs
            ? 'Los 3 primeros ascienden a la Liga Obsidiana al terminar la semana.'
            : 'Top 3 advance to Obsidian League at week end.'}
        </p>
      </header>

      <MascotGuide surface="compete" />

      {/* Division Status Card */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="t1ger-panel transform-gpu overflow-hidden"
      >
        {/* League Tier Header */}
        <div className="flex items-center justify-between border-b border-white/8 bg-[#0B2925] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--t1ger-orange)] text-[#102622] shadow-[0_4px_12px_rgba(255,115,0,0.25)]">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white">
                {isEs ? 'División II · Ámbar' : 'Division II · Amber'}
              </p>
              <p className="text-[11px] text-[#78DDB0]">
                {inPromotionZone
                  ? (isEs ? '↑ En zona de ascenso' : '↑ In promotion zone')
                  : (isEs ? 'Zona de permanencia' : 'Safe zone')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="block font-mono text-lg font-bold text-white">#{userRank}</span>
            <span className="text-[10px] text-[#6F918A] uppercase">{isEs ? 'Puesto' : 'Rank'}</span>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="divide-y divide-white/5 p-2">
          {leaderboard.map((item, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            const isSelf = item.isCurrentUser;

            return (
              <div
                key={item.id}
                className={`flex items-center gap-3.5 rounded-xl px-3.5 py-3 transition-colors ${
                  isSelf
                    ? 'border border-[var(--t1ger-orange)]/40 bg-[var(--t1ger-orange)]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    : 'hover:bg-white/[.025]'
                }`}
              >
                {/* Rank Number / Crown */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center font-mono text-sm font-bold">
                  {rank === 1 ? (
                    <Crown size={18} className="text-amber-400 fill-amber-400" />
                  ) : rank === 2 ? (
                    <span className="text-zinc-300">02</span>
                  ) : rank === 3 ? (
                    <span className="text-amber-600">03</span>
                  ) : (
                    <span className="text-[#6F918A] text-xs">0{rank}</span>
                  )}
                </div>

                {/* Avatar Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[.06] text-base">
                  {item.avatar}
                </div>

                {/* Competitor Name & Streak */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`truncate text-sm font-semibold ${isSelf ? 'text-white font-bold' : 'text-[#EAF4F1]'}`}>
                      {item.name}
                    </span>
                    {isSelf && (
                      <span className="rounded bg-[var(--t1ger-orange)]/20 px-1.5 py-0.5 text-[9px] font-bold text-[var(--t1ger-orange)] uppercase">
                        {isEs ? 'Tú' : 'You'}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#6F918A]">
                    {item.streak > 0 ? `🔥 ${item.streak} ${isEs ? 'días' : 'days'}` : (isEs ? 'Iniciando' : 'Starting')}
                  </span>
                </div>

                {/* Verified XP Score */}
                <div className="text-right">
                  <span className={`block font-mono text-sm font-bold ${isSelf ? 'text-[var(--t1ger-orange)]' : 'text-[#78DDB0]'}`}>
                    {item.vXP}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#6F918A]">vXP</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Promotion Cutoff Indicator */}
        <div className="flex items-center justify-between border-t border-white/8 bg-white/[.02] px-5 py-3 text-xs text-[#87A9A2]">
          <span className="flex items-center gap-1.5 text-[#78DDB0]">
            <ArrowUp size={14} /> {isEs ? 'Puestos 1-3 ascienden' : 'Ranks 1-3 promote'}
          </span>
          <button
            onClick={() => setActiveView('build')}
            className="font-semibold text-[var(--t1ger-orange)] hover:underline cursor-pointer"
          >
            {isEs ? 'Ganar más vXP →' : 'Earn more vXP →'}
          </button>
        </div>
      </motion.section>
    </div>
  );
};
