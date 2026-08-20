import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUp,
  ArrowDown,
  Award,
  Clock,
  Crown,
  Flame,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  ChevronRight,
  Send,
  Zap,
  CheckCircle2,
  Info,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBrain } from '../../contexts/BrainContext';
import { useT1ger } from '../../contexts/T1gerContext';
import { LeagueService, LEAGUE_TIERS, type LeagueMember, type LeagueTier } from '../../services/leagueService';
import { MascotGuide } from '../MascotGuide';

export const SquadTab: React.FC = () => {
  const { language } = useBrain();
  const { stats, setActiveView } = useT1ger();
  const { appUser } = useAuth();
  const isEs = language === 'es';

  const [leaderboard, setLeaderboard] = useState<LeagueMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<LeagueMember | null>(null);
  const [cheerSent, setCheerSent] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(() => LeagueService.getTimeRemaining().formatted);

  const currentTier: LeagueTier = useMemo(
    () => LeagueService.getUserTier(stats.verifiedXP),
    [stats.verifiedXP]
  );
  const tierConfig = LEAGUE_TIERS[currentTier];

  // Refresh timer every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(LeagueService.getTimeRemaining().formatted);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch / assemble live cohort bracket
  useEffect(() => {
    let isMounted = true;
    const loadCohort = async () => {
      setLoading(true);
      const data = await LeagueService.getCohortLeaderboard({
        uid: appUser?.uid || 'guest-user',
        displayName: appUser?.displayName || (isEs ? 'Tú' : 'You'),
        photoURL: appUser?.photoURL || undefined,
        verifiedXP: stats.verifiedXP,
        weeklyXP: appUser?.weeklyXP,
        currentWeekId: appUser?.currentWeekId,
        leagueTier: appUser?.leagueTier,
        streak: stats.streak,
        niche: appUser?.niche || (isEs ? 'Emprendedor' : 'Founder'),
      });
      if (isMounted) {
        setLeaderboard(data);
        setLoading(false);
      }
    };
    loadCohort();
    return () => { isMounted = false; };
  }, [appUser, stats.verifiedXP, stats.streak, isEs, appUser?.weeklyXP]);

  const userRankIndex = leaderboard.findIndex((item) => item.isCurrentUser);
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : 1;
  const inPromotionZone = userRank <= 5;
  const inDemotionZone = userRank >= 18;

  const handleSendCheer = (member: LeagueMember) => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(14);
    setCheerSent(true);
    setTimeout(() => {
      setCheerSent(false);
      setSelectedMember(null);
    }, 1400);
  };

  return (
    <div className="space-y-4 pb-28 pt-2 font-sans select-none max-w-lg mx-auto px-2">
      {/* 1. TOP HEADER & COUNTDOWN CLOCK */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">{tierConfig.badge}</span>
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.16em] text-[var(--ob-accent)]">
              {isEs ? tierConfig.nameEs : tierConfig.nameEn}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
            {isEs ? 'Liga Táctica Semanal' : 'Weekly Tactical League'}
          </h1>
        </div>

        {/* Live Closing Bell Timer */}
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10.5px] text-zinc-300 shadow-inner">
          <Clock size={12} className="text-amber-400" />
          <span className="tabular-nums">{timeRemaining}</span>
        </div>
      </div>

      <MascotGuide surface="compete" />

      {/* 2. REWARD POOL PREVIEW CARD */}
      <div className="rounded-[1.4rem] border border-white/10 bg-[#121216]/95 p-1 shadow-md">
        <div className="rounded-2xl border border-white/[0.06] bg-[#09090B] p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy size={16} />
            </div>
            <div>
              <span className="font-mono text-[9px] uppercase font-bold text-zinc-400 block">
                {isEs ? 'PREMIO 1ER PUESTO' : '1ST PLACE PRIZE'}
              </span>
              <span className="text-white font-bold font-mono">
                +{tierConfig.rewards.first.gems} Gemas · +{tierConfig.rewards.first.xp} vXP
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[9px] text-zinc-400 font-bold uppercase">
            Top 5 {isEs ? 'Ascienden' : 'Promote'}
          </span>
        </div>
      </div>

      {/* 3. DUOLINGO-EXACT LEADERBOARD CONTAINER */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className="rounded-[1.75rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-[0_20px_45px_rgba(0,0,0,0.6)]"
      >
        <div className="rounded-[1.4rem] border border-white/[0.08] bg-[#09090B] overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          {/* User Rank Fast Summary */}
          <div className="flex items-center justify-between border-b border-white/6 bg-white/[0.02] p-3.5 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-[var(--ob-accent)] text-black shadow-[0_0_15px_rgba(255,115,0,0.35)] font-mono font-black text-sm">
                #{userRank}
              </div>
              <div>
                <p className="font-mono text-xs font-black uppercase tracking-wider text-white">
                  {appUser?.displayName || (isEs ? 'Tu Posición' : 'Your Rank')}
                </p>
                <p className="text-[11px] font-mono flex items-center gap-1">
                  {inPromotionZone ? (
                    <span className="text-[#3FC78E] flex items-center gap-0.5">
                      <ArrowUp size={13} /> {isEs ? 'En zona de ascenso a la siguiente liga' : 'In promotion zone'}
                    </span>
                  ) : inDemotionZone ? (
                    <span className="text-rose-400 flex items-center gap-0.5">
                      <ArrowDown size={13} /> {isEs ? 'Zona de descenso en riesgo' : 'In demotion risk zone'}
                    </span>
                  ) : (
                    <span className="text-zinc-400">
                      {isEs ? 'Zona segura de permanencia' : 'Safe retention zone'}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-base font-black text-[var(--ob-accent)] tabular-nums">
                {appUser?.weeklyXP || 0}
              </span>
              <span className="block text-[8.5px] text-zinc-500 font-mono uppercase tracking-wider">vXP</span>
            </div>
          </div>

          {/* Bracket List with Promotion & Demotion Dividers */}
          <div className="p-1.5 sm:p-2 space-y-1">
            {leaderboard.map((item, index) => {
              const rank = index + 1;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;
              const isSelf = item.isCurrentUser;
              const isPromotionBoundary = rank === 5;
              const isDemotionBoundary = rank === 17;

              return (
                <React.Fragment key={item.id}>
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 600, damping: 35 }}
                    onClick={() => !isSelf && setSelectedMember(item)}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all cursor-pointer ${
                      isSelf
                        ? 'border border-[var(--ob-accent)]/50 bg-[var(--ob-accent)]/10 shadow-[0_0_15px_rgba(255,115,0,0.15),inset_0_1px_0_rgba(255,255,255,0.08)]'
                        : 'hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    {/* Rank Badge / Crown */}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center font-mono text-xs font-black tabular-nums">
                      {isFirst ? (
                        <Crown size={19} className="text-amber-400 fill-amber-400" />
                      ) : isSecond ? (
                        <span className="text-zinc-200 font-extrabold">02</span>
                      ) : isThird ? (
                        <span className="text-amber-600 font-extrabold">03</span>
                      ) : (
                        <span className="text-zinc-500">{rank < 10 ? `0${rank}` : rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] border border-white/8 text-base shadow-inner">
                      {item.avatar}
                    </div>

                    {/* Member Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`truncate text-xs sm:text-sm font-bold ${isSelf ? 'text-white' : 'text-zinc-200'}`}>
                          {item.name}
                        </span>
                        {isSelf ? (
                          <span className="rounded bg-[var(--ob-accent)]/20 border border-[var(--ob-accent)]/40 px-1.5 py-0.2 font-mono text-[8px] font-black text-[var(--ob-accent)] uppercase">
                            {isEs ? 'TÚ' : 'YOU'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-500 font-mono truncate">
                            · {item.niche}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {item.streak > 0 ? `🔥 ${item.streak} ${isEs ? 'días' : 'days'}` : (isEs ? 'Iniciando' : 'Starting')}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0">
                      <span className={`font-mono text-xs sm:text-sm font-black tabular-nums ${isSelf ? 'text-[var(--ob-accent)]' : 'text-[#78DDB0]'}`}>
                        {item.vXP}
                      </span>
                      <span className="block text-[8.5px] uppercase tracking-wider font-mono text-zinc-500">vXP</span>
                    </div>
                  </motion.div>

                  {/* DUOLINGO PROMOTION LINE (Under Rank #5) */}
                  {isPromotionBoundary && (
                    <div className="my-2 py-1.5 px-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/25 flex items-center justify-between text-[10px] font-mono text-[#78DDB0]">
                      <span className="flex items-center gap-1 font-bold">
                        <ArrowUp size={12} /> {isEs ? 'ZONA DE ASCENSO' : 'PROMOTION ZONE'}
                      </span>
                      <span className="text-[9px] text-emerald-400/80">
                        {isEs ? 'Puestos 1 al 5 suben de liga' : 'Ranks 1 to 5 advance'}
                      </span>
                    </div>
                  )}

                  {/* DUOLINGO DEMOTION LINE (Under Rank #17) */}
                  {isDemotionBoundary && (
                    <div className="my-2 py-1.5 px-3 rounded-xl bg-rose-500/[0.08] border border-rose-500/25 flex items-center justify-between text-[10px] font-mono text-rose-300">
                      <span className="flex items-center gap-1 font-bold">
                        <ArrowDown size={12} /> {isEs ? 'ZONA DE DESCENSO' : 'DEMOTION ZONE'}
                      </span>
                      <span className="text-[9px] text-rose-400/80">
                        {isEs ? 'Puestos 18 al 25 bajan de liga' : 'Ranks 18 to 25 drop'}
                      </span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-between border-t border-white/6 bg-white/[0.02] px-4 py-3 text-xs">
            <span className="text-zinc-400 font-mono text-[10.5px]">
              {isEs ? 'Se actualiza en tiempo real' : 'Live real-time sync'}
            </span>
            <button
              onClick={() => setActiveView('build')}
              className="font-mono text-[11px] font-bold text-[var(--ob-accent)] hover:underline cursor-pointer flex items-center gap-0.5 active:scale-95 transition"
            >
              <span>{isEs ? 'Subir puestos en Aplicar' : 'Climb ranks in Apply'}</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </motion.section>

      {/* 4. SOCIAL CHEER MODAL (Tactical Peer Salute) */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm rounded-[1.6rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-2xl text-left"
            >
              <div className="rounded-[1.3rem] border border-white/[0.08] bg-[#09090B] p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-white/6 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                      {selectedMember.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{selectedMember.name}</h3>
                      <p className="text-[10.5px] font-mono text-zinc-400">{selectedMember.niche}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white bg-white/5 border border-white/10 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="font-mono text-xs font-black text-amber-400 block tabular-nums">
                      🔥 {selectedMember.streak}
                    </span>
                    <span className="text-[9px] font-mono uppercase text-zinc-500">{isEs ? 'Racha Activa' : 'Streak'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="font-mono text-xs font-black text-[#3FC78E] block tabular-nums">
                      {selectedMember.vXP} vXP
                    </span>
                    <span className="text-[9px] font-mono uppercase text-zinc-500">{isEs ? 'XP Verificado' : 'Verified XP'}</span>
                  </div>
                </div>

                {cheerSent ? (
                  <div className="py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={16} />
                    <span>{isEs ? '¡Saludo táctico enviado!' : 'Tactical cheer sent!'}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSendCheer(selectedMember)}
                    className="w-full py-2.5 rounded-xl bg-[var(--ob-accent)] text-black font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,115,0,0.3)] active:scale-95 transition cursor-pointer"
                  >
                    <Zap size={14} className="fill-current" />
                    <span>{isEs ? 'ENVIAR SALUDO TÁCTICO ⚡' : 'SEND TACTICAL SALUTE ⚡'}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
