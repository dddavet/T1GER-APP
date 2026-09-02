import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BellRing,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Image as ImageIcon,
  LoaderCircle,
  MessageCircle,
  Search,
  Send,
  Share2,
  ShieldAlert,
  Sparkles,
  Swords,
  Target,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBrain } from '../../contexts/BrainContext';
import { useT1ger } from '../../contexts/T1gerContext';
import { LeagueService, LEAGUE_TIERS, type LeagueMember, type LeagueTier } from '../../services/leagueService';
import {
  SocialService,
  type DirectChallenge,
  type Friendship,
  type SocialProfile,
  type SocialReaction,
  type SocialViewer,
  type SquadActivity,
} from '../../services/socialService';

type CompeteView = 'feed' | 'league' | 'squad';

const REACTIONS: Array<{ id: SocialReaction; icon: string; es: string; en: string }> = [
  { id: 'fire', icon: '🔥', es: 'Fuego', en: 'Fire' },
  { id: 'tiger', icon: '🐅', es: 'T1GER', en: 'T1GER' },
  { id: 'respect', icon: '✊', es: 'Respeto', en: 'Respect' },
];

const DEMO_ACTIVITY_COPY: Record<string, { title: string; proof: string }> = {
  'activity-1': { title: 'Built her first investment thesis', proof: 'NVIDIA thesis · 3 pages' },
  'activity-2': { title: 'Completed: The power of compound growth', proof: 'Verified quiz · 5/5' },
  'activity-3': { title: 'Logged a paper-trading purchase', proof: 'Simulated order · VOO' },
};

function activityCopy(activity: SquadActivity, isEs: boolean) {
  const demoCopy = !isEs ? DEMO_ACTIVITY_COPY[activity.id] : undefined;
  return {
    title: demoCopy?.title || activity.missionTitle,
    proof: demoCopy?.proof || activity.proofLabel || (isEs ? 'Artefacto verificado' : 'Verified artifact'),
  };
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'T1';
}

function relativeTime(timestamp: number, isEs: boolean): string {
  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 60) return isEs ? `hace ${minutes} min` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return isEs ? `hace ${hours} h` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return isEs ? `hace ${days} d` : `${days}d ago`;
}

function Avatar({ profile, name, size = 'md' }: { profile?: Pick<SocialProfile, 'photoURL'>; name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-12 w-12 rounded-2xl text-sm' : size === 'sm' ? 'h-8 w-8 rounded-xl text-[10px]' : 'h-10 w-10 rounded-[.9rem] text-xs';
  return (
    <div className={`${sizeClass} shrink-0 overflow-hidden border border-white/10 bg-gradient-to-br from-[#2B211B] to-[#111114] flex items-center justify-center font-mono font-black text-[#FF9A3D] shadow-[inset_0_1px_0_rgba(255,255,255,.1)]`}>
      {profile?.photoURL ? <img src={profile.photoURL} alt="" className="h-full w-full object-cover" /> : initials(name)}
    </div>
  );
}

function Surface({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[1.5rem] border border-white/[0.09] bg-[#121216] shadow-[inset_0_1px_0_rgba(255,255,255,.045),0_20px_40px_rgba(0,0,0,.22)] ${className}`}>{children}</div>;
}

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

function EmptyState({ icon: Icon, title, body, action }: { icon: IconComponent; title: string; body: string; action?: React.ReactNode }) {
  return (
    <Surface className="px-5 py-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#FF7300]/25 bg-[#FF7300]/10 text-[#FF8A1F]"><Icon size={21} /></div>
      <h3 className="text-sm font-black text-white">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-[17rem] text-[11px] leading-relaxed text-zinc-400">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </Surface>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="status" className="flex items-start gap-2.5 rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] px-3.5 py-3 text-[11px] leading-relaxed text-amber-100">
      <ShieldAlert size={15} className="mt-0.5 shrink-0 text-amber-400" />
      <span>{message}</span>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  if (!message || typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence><motion.div role="status" initial={{ opacity: 0, y: 24, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }} className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-[220] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-2xl border border-white/10 bg-[#1A1A1F] px-4 py-3 text-[10px] font-bold text-white shadow-2xl"><Sparkles size={14} className="text-[#FF8A1F]" /> {message}</motion.div></AnimatePresence>,
    document.body,
  );
}

function FeedCard({ activity, isEs, onReact, onComment }: {
  activity: SquadActivity;
  isEs: boolean;
  onReact: (activity: SquadActivity, reaction: SocialReaction) => void;
  onComment: (activity: SquadActivity) => void;
}) {
  const copy = activityCopy(activity, isEs);
  return (
    <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden rounded-[1.55rem] border border-white/[0.09] bg-[#121216] [content-visibility:auto] [contain-intrinsic-size:0_320px]">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar profile={{ photoURL: activity.userAvatar }} name={activity.userName} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[13px] font-extrabold text-white">{activity.userName}</p>
                {activity.verified && <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-emerald-300">{isEs ? 'Verificado' : 'Verified'}</span>}
              </div>
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-500">{relativeTime(activity.createdAt, isEs)}</p>
            </div>
          </div>
          <div className={`rounded-xl border px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-wider ${activity.missionType === 'apply' ? 'border-[#FF7300]/30 bg-[#FF7300]/10 text-[#FF9A3D]' : 'border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300'}`}>
            {activity.missionType === 'apply' ? (isEs ? 'Aplicar' : 'Apply') : (isEs ? 'Aprender' : 'Learn')}
          </div>
        </div>

        <h3 className="mt-4 text-[15px] font-black leading-snug tracking-[-.01em] text-white">{copy.title}</h3>
        <div className="mt-3 flex items-center gap-3 font-mono text-[10px] text-zinc-400">
          <span className="flex items-center gap-1.5"><Clock3 size={12} className="text-zinc-500" /> {activity.durationMinutes} min</span>
          <span className="h-1 w-1 rounded-full bg-zinc-700" />
          <span className="flex items-center gap-1.5"><Zap size={12} className="text-[#FF7300]" /> {isEs ? 'Cuenta para la liga' : 'Counts for league'}</span>
        </div>
      </div>

      <div className="mx-3 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09090B]">
        {activity.proofURL ? (
          <img src={activity.proofURL} alt={isEs ? 'Prueba de misión' : 'Mission proof'} className="aspect-[16/9] w-full object-cover" />
        ) : (
          <div className="relative flex min-h-24 items-center gap-3 overflow-hidden p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_15%,rgba(255,115,0,.13),transparent_34%)]" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#FF7300]"><ImageIcon size={18} /></div>
            <div className="relative min-w-0">
              <p className="font-mono text-[8px] font-bold uppercase tracking-[.16em] text-zinc-500">{isEs ? 'Prueba de trabajo' : 'Proof of work'}</p>
              <p className="mt-1 truncate text-[11px] font-bold text-zinc-200">{copy.proof}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-1.5 border-t border-white/[0.06] p-3">
        {REACTIONS.map(reaction => {
          const active = activity.myReactions.includes(reaction.id);
          return (
            <motion.button
              key={reaction.id}
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => onReact(activity, reaction.id)}
              aria-pressed={active}
              aria-label={`${isEs ? reaction.es : reaction.en}: ${activity.reactionCounts[reaction.id]}`}
              className={`flex min-h-9 items-center gap-1.5 rounded-xl border px-2.5 font-mono text-[10px] font-bold transition-colors ${active ? 'border-[#FF7300]/45 bg-[#FF7300]/13 text-white' : 'border-white/[0.07] bg-white/[0.025] text-zinc-400 hover:bg-white/[0.05]'}`}
            >
              <motion.span animate={active ? { scale: [1, 1.35, 1], rotate: [0, -8, 8, 0] } : {}}>{reaction.icon}</motion.span>
              <span className="tabular-nums">{activity.reactionCounts[reaction.id]}</span>
            </motion.button>
          );
        })}
        <button type="button" onClick={() => onComment(activity)} className="ml-auto flex min-h-9 items-center gap-1.5 rounded-xl px-2 text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white" aria-label={isEs ? 'Comentar' : 'Comment'}>
          <MessageCircle size={15} /> <span className="font-mono text-[10px] tabular-nums">{activity.commentCount}</span>
        </button>
      </div>
    </motion.article>
  );
}

function FeedView({ activities, loading, isEs, onReact, onComment, onInvite }: {
  activities: SquadActivity[];
  loading: boolean;
  isEs: boolean;
  onReact: (activity: SquadActivity, reaction: SocialReaction) => void;
  onComment: (activity: SquadActivity) => void;
  onInvite: () => void;
}) {
  if (loading) return <div className="space-y-3">{[0, 1].map(item => <div key={item} className="h-64 animate-pulse rounded-[1.5rem] border border-white/[0.07] bg-white/[0.035]" />)}</div>;
  if (!activities.length) return <EmptyState icon={Activity} title={isEs ? 'Tu manada aún está en silencio' : 'Your squad is quiet'} body={isEs ? 'Invita a dos personas de confianza. Sus misiones verificadas aparecerán aquí en tiempo real.' : 'Invite two trusted people. Their verified missions will appear here in real time.'} action={<button onClick={onInvite} className="t1ger-primary-button mx-auto px-5 py-3 text-[11px]">{isEs ? 'INVITAR A MI MANADA' : 'INVITE MY SQUAD'}</button>} />;
  return <div className="space-y-3">{activities.map(activity => <FeedCard key={`${activity.circleId}:${activity.id}`} activity={activity} isEs={isEs} onReact={onReact} onComment={onComment} />)}</div>;
}

function LeagueView({ members, loading, tier, isEs, onApply }: { members: LeagueMember[]; loading: boolean; tier: LeagueTier; isEs: boolean; onApply: () => void }) {
  const config = LEAGUE_TIERS[tier];
  const currentRank = Math.max(1, members.findIndex(member => member.isCurrentUser) + 1);
  const zones = LeagueService.getZones(members.length);
  const nextTier = LeagueService.getNextTier(tier);
  const [remaining, setRemaining] = useState(() => LeagueService.getTimeRemaining());

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(LeagueService.getTimeRemaining()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="space-y-3">
      <Surface className="relative overflow-hidden p-4">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl" style={{ background: config.glow }} />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border font-mono text-sm font-black" style={{ color: config.color, borderColor: `${config.color}55`, background: `${config.color}16` }}>{config.shortName}</div>
            <div>
              <p className="font-mono text-[8px] font-bold uppercase tracking-[.2em] text-zinc-500">{isEs ? 'División actual' : 'Current division'}</p>
              <h2 className="mt-1 text-lg font-black text-white">{isEs ? config.nameEs : config.nameEn}</h2>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-[#09090B]/80 px-2.5 py-2 text-right">
            <p className="font-mono text-[8px] uppercase tracking-wider text-zinc-500">{isEs ? 'Cierra en' : 'Closes in'}</p>
            <p className="mt-0.5 font-mono text-xs font-black tabular-nums text-white">{remaining.formatted}</p>
          </div>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-white/[0.07] bg-black/20 p-2.5"><p className="font-mono text-[8px] uppercase text-zinc-500">{isEs ? 'Posición' : 'Rank'}</p><p className="mt-1 font-mono text-lg font-black tabular-nums text-white">#{currentRank}</p></div>
          <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] p-2.5"><p className="font-mono text-[8px] uppercase text-emerald-400/70">Top 5</p><p className="mt-1 font-mono text-lg font-black text-emerald-300">↑</p></div>
          <div className="rounded-xl border border-[#FF4B4B]/15 bg-[#FF4B4B]/[0.05] p-2.5"><p className="font-mono text-[8px] uppercase text-[#FF7474]">Bottom 5</p><p className="mt-1 font-mono text-lg font-black text-[#FF7474]">↓</p></div>
        </div>
        <p className="relative mt-3 text-[10px] leading-relaxed text-zinc-400">{nextTier ? (isEs ? `Termina en el Top 5 para ascender a ${LEAGUE_TIERS[nextTier].nameEs}. Solo cuenta el XP verificado.` : `Finish Top 5 to reach ${LEAGUE_TIERS[nextTier].nameEn}. Only verified XP counts.`) : (isEs ? 'Estás en la élite. Defiende Obsidiana con XP verificado.' : 'You are in the elite. Defend Obsidian with verified XP.')}</p>
      </Surface>

      <Surface className="overflow-hidden">
        {loading ? <div className="space-y-2 p-3">{[0, 1, 2, 3, 4].map(item => <div key={item} className="h-14 animate-pulse rounded-xl bg-white/[0.035]" />)}</div> : members.map((member, index) => {
          const rank = index + 1;
          const promotion = rank <= zones.promotionEnd;
          const danger = rank >= zones.demotionStart;
          return (
            <React.Fragment key={member.id}>
              {rank === zones.promotionEnd + 1 && <div className="flex items-center gap-2 border-y border-emerald-400/15 bg-emerald-400/[0.045] px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[.15em] text-emerald-300"><ArrowUp size={11} /> {isEs ? 'Límite de ascenso' : 'Promotion cutoff'}</div>}
              {rank === zones.demotionStart && <div className="flex items-center gap-2 border-y border-[#FF4B4B]/20 bg-[#FF4B4B]/[0.045] px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[.15em] text-[#FF7474]"><ArrowDown size={11} /> {isEs ? 'Zona de descenso' : 'Demotion zone'}</div>}
              <motion.div layout className={`flex min-h-[62px] items-center gap-3 border-b border-white/[0.05] px-3 py-2.5 last:border-0 ${member.isCurrentUser ? 'bg-[#FF7300]/[0.09]' : ''}`}>
                <div className={`w-6 text-center font-mono text-[11px] font-black tabular-nums ${promotion ? 'text-emerald-300' : danger ? 'text-[#FF7474]' : 'text-zinc-500'}`}>{String(rank).padStart(2, '0')}</div>
                <Avatar name={member.name} profile={{ photoURL: member.avatar.startsWith('http') ? member.avatar : undefined }} />
                <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-[12px] font-extrabold text-zinc-100">{member.name}</p>{member.isCurrentUser && <span className="rounded bg-[#FF7300]/15 px-1.5 py-0.5 font-mono text-[7px] font-black uppercase text-[#FF9A3D]">{isEs ? 'Tú' : 'You'}</span>}</div><p className="mt-0.5 truncate font-mono text-[8px] uppercase tracking-wider text-zinc-500">{member.niche} · {member.streak}d 🔥</p></div>
                <div className="text-right"><p className="font-mono text-[13px] font-black tabular-nums text-white">{member.vXP.toLocaleString()}</p><p className="font-mono text-[7px] uppercase tracking-wider text-zinc-500">vXP</p></div>
              </motion.div>
            </React.Fragment>
          );
        })}
        {!loading && !members.length && <div className="p-8 text-center text-xs text-zinc-400">{isEs ? 'Creando tu sala semanal…' : 'Creating your weekly room…'}</div>}
      </Surface>

      <button type="button" onClick={onApply} className="t1ger-primary-button flex w-full items-center justify-center gap-2 py-3.5 text-[11px]"><Target size={15} /> {isEs ? 'GANAR XP EN APLICAR' : 'EARN XP IN APPLY'} <ChevronRight size={14} /></button>
    </div>
  );
}

function SquadView({ friends, requests, challenges, viewerUid, isEs, nudgedIds, onInvite, onNudge, onChallenge, onAccept, onChallengeDecision }: {
  friends: Friendship[];
  requests: Friendship[];
  challenges: DirectChallenge[];
  viewerUid: string;
  isEs: boolean;
  nudgedIds: Set<string>;
  onInvite: () => void;
  onNudge: (friend: SocialProfile) => void;
  onChallenge: (friend: SocialProfile) => void;
  onAccept: (request: Friendship) => void;
  onChallengeDecision: (challenge: DirectChallenge, decision: 'accept' | 'decline') => void;
}) {
  const critical = friends.filter(friend => !friend.profile.missionCompletedToday || friend.profile.tigerStatus === 'critical');
  return (
    <div className="space-y-3">
      {!!requests.length && <Surface className="p-4"><div className="mb-3 flex items-center gap-2"><UserCheck size={15} className="text-[#FF8A1F]" /><h2 className="text-xs font-black text-white">{isEs ? 'Solicitudes pendientes' : 'Pending requests'}</h2><span className="ml-auto rounded-full bg-[#FF7300] px-2 py-0.5 font-mono text-[8px] font-black text-black">{requests.length}</span></div><div className="space-y-2">{requests.map(request => <div key={request.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/20 p-2.5"><Avatar name={request.profile.displayName} profile={request.profile} /><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-bold text-white">{request.profile.displayName}</p><p className="font-mono text-[8px] text-zinc-500">@{request.profile.username}</p></div><button onClick={() => onAccept(request)} className="rounded-xl bg-emerald-400 px-3 py-2 font-mono text-[9px] font-black uppercase text-black">{isEs ? 'Aceptar' : 'Accept'}</button></div>)}</div></Surface>}

      <Surface className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] p-4"><div><p className="font-mono text-[8px] font-bold uppercase tracking-[.18em] text-[#FF8A1F]">Squad</p><h2 className="mt-1 text-base font-black text-white">{isEs ? 'Tu círculo de rendición' : 'Your accountability circle'}</h2></div><button type="button" onClick={onInvite} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FF7300]/30 bg-[#FF7300]/10 text-[#FF8A1F]" aria-label={isEs ? 'Agregar amigo' : 'Add friend'}><UserPlus size={18} /></button></div>
        {!friends.length ? <div className="p-7"><EmptyState icon={Users} title={isEs ? 'Construye tu círculo cercano' : 'Build your inner circle'} body={isEs ? 'Añade personas que no te permitan desaparecer en silencio.' : 'Add people who will not let you disappear quietly.'} action={<button onClick={onInvite} className="t1ger-primary-button px-5 py-3 text-[10px]">{isEs ? 'ENCONTRAR AMIGOS' : 'FIND FRIENDS'}</button>} /></div> : <div className="divide-y divide-white/[0.055]">{friends.map(friend => {
          const profile = friend.profile;
          const atRisk = !profile.missionCompletedToday || profile.tigerStatus === 'critical';
          const nudged = nudgedIds.has(profile.uid);
          return <div key={friend.id} className="p-3.5"><div className="flex items-center gap-3"><div className="relative"><Avatar name={profile.displayName} profile={profile} size="lg" /><span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#121216] ${atRisk ? 'bg-[#FF4B4B]' : 'bg-emerald-400'}`} /></div><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-extrabold text-white">{profile.displayName}</p><p className="mt-0.5 truncate font-mono text-[8px] uppercase tracking-wider text-zinc-500">@{profile.username} · {profile.streak}d 🔥</p><p className={`mt-1 text-[9px] font-semibold ${atRisk ? 'text-[#FF7474]' : 'text-emerald-300'}`}>{atRisk ? (isEs ? 'Misión pendiente · T1GER en riesgo' : 'Mission pending · T1GER at risk') : (isEs ? 'Disciplina protegida hoy' : 'Discipline protected today')}</p></div></div><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => onNudge(profile)} disabled={!atRisk || nudged} className={`flex min-h-9 items-center justify-center gap-1.5 rounded-xl border font-mono text-[9px] font-black uppercase transition-all ${atRisk && !nudged ? 'border-[#FF4B4B]/30 bg-[#FF4B4B]/10 text-[#FF7474]' : 'border-white/[0.06] bg-white/[0.025] text-zinc-600'}`}><BellRing size={13} /> {nudged ? (isEs ? 'Enviado' : 'Sent') : 'Nudge'}</button><button type="button" onClick={() => onChallenge(profile)} className="flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-[#FF7300]/25 bg-[#FF7300]/[0.08] font-mono text-[9px] font-black uppercase text-[#FF9A3D]"><Swords size={13} /> 1v1</button></div></div>;
        })}</div>}
      </Surface>

      {critical.length > 0 && <div className="rounded-[1.4rem] border border-[#FF4B4B]/20 bg-[#FF4B4B]/[0.06] p-4"><div className="flex items-start gap-3"><ShieldAlert size={19} className="mt-0.5 shrink-0 text-[#FF5D5D]" /><div><p className="text-[12px] font-black text-white">{isEs ? `${critical.length} compañero${critical.length > 1 ? 's' : ''} puede perder su racha` : `${critical.length} teammate${critical.length > 1 ? 's' : ''} may lose their streak`}</p><p className="mt-1 text-[10px] leading-relaxed text-zinc-400">{isEs ? 'Un nudge es visible: recuérdales que alguien está contando con ellos.' : 'A nudge is visible: remind them someone is counting on them.'}</p></div></div></div>}

      <Surface className="p-4">
        <div className="mb-3 flex items-center gap-2"><Swords size={15} className="text-[#FF8A1F]" /><h2 className="text-xs font-black text-white">{isEs ? 'Retos directos' : 'Direct challenges'}</h2><span className="ml-auto font-mono text-[8px] uppercase text-zinc-500">7D ARENA</span></div>
        {challenges.length ? <div className="space-y-2">{challenges.map(challenge => {
          const incoming = challenge.receiverId === viewerUid && challenge.status === 'pending';
          return <div key={challenge.id} className="rounded-2xl border border-white/[0.07] bg-[#09090B] p-3">
            <div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-bold text-white">{challenge.senderName} <span className="text-zinc-600">vs.</span> {challenge.receiverName}</p><p className="mt-1 font-mono text-[8px] uppercase tracking-wider text-zinc-500">{challenge.durationDays}d · {challenge.metric === 'missions' ? (isEs ? 'Misiones' : 'Missions') : (isEs ? 'Racha' : 'Streak')}</p></div><div className="text-right"><p className="font-mono text-xs font-black text-[#FF9A3D]">{challenge.potCoins} 🪙</p><p className="font-mono text-[7px] uppercase text-zinc-600">{challenge.status}</p></div></div>
            {incoming && <div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => onChallengeDecision(challenge, 'decline')} className="rounded-xl border border-white/[0.08] py-2 font-mono text-[8px] font-black uppercase text-zinc-400">{isEs ? 'Rechazar' : 'Decline'}</button><button onClick={() => onChallengeDecision(challenge, 'accept')} className="rounded-xl bg-[#FF7300] py-2 font-mono text-[8px] font-black uppercase text-black">{isEs ? 'Aceptar y apostar' : 'Accept & stake'}</button></div>}
          </div>;
        })}</div> : <p className="rounded-2xl border border-dashed border-white/[0.09] px-4 py-5 text-center text-[10px] leading-relaxed text-zinc-500">{isEs ? 'Aún no hay retos. Elige a un amigo y abre una arena 1v1.' : 'No challenges yet. Pick a friend and open a 1v1 arena.'}</p>}
      </Surface>
    </div>
  );
}

function FriendFinderModal({ open, viewer, isEs, initialProfile, sentIds, onClose, onSent }: { open: boolean; viewer: SocialViewer; isEs: boolean; initialProfile: SocialProfile | null; sentIds: Set<string>; onClose: () => void; onSent: (profile: SocialProfile) => void }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<SocialProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [copied, setCopied] = useState(false);
  const inviteLink = SocialService.getInviteLink(viewer.uid);

  useEffect(() => { if (open) setResults(initialProfile ? [initialProfile] : []); }, [open, initialProfile]);

  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!term.trim()) return;
    setSearching(true);
    try { setResults(await SocialService.searchProfiles(term, viewer.uid)); } finally { setSearching(false); }
  };

  const copy = async () => {
    SocialService.haptic();
    await SocialService.copyInviteLink(viewer.uid);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const share = async () => {
    SocialService.haptic();
    if (navigator.share) {
      try { await navigator.share({ title: 'T1GER Squad', text: isEs ? 'Únete a mi Squad en T1GER. Progreso real, juntos.' : 'Join my T1GER Squad. Real progress, together.', url: inviteLink }); return; } catch { /* User cancelled or share unavailable. */ }
    }
    await copy();
  };

  if (typeof document === 'undefined') return null;
  return createPortal(<AnimatePresence>{open && <div className="fixed inset-0 z-[180] flex items-end justify-center bg-black/80 p-3 backdrop-blur-md sm:items-center"><motion.div role="dialog" aria-modal="true" aria-label={isEs ? 'Agregar amigos' : 'Add friends'} initial={{ opacity: 0, y: 32, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: .98 }} transition={{ type: 'spring', stiffness: 520, damping: 38 }} className="max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-[1.75rem] border border-white/10 bg-[#121216] p-4 shadow-2xl"><div className="flex items-start justify-between"><div><p className="font-mono text-[8px] font-bold uppercase tracking-[.2em] text-[#FF8A1F]">Squad access</p><h2 className="mt-1 text-lg font-black text-white">{isEs ? 'Recluta a tu círculo' : 'Recruit your circle'}</h2><p className="mt-1 text-[10px] text-zinc-400">{isEs ? 'Busca por @username o código único.' : 'Search by @username or unique code.'}</p></div><button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-zinc-400"><X size={16} /></button></div><div className="mt-4 rounded-2xl border border-[#FF7300]/20 bg-[#FF7300]/[0.06] p-3"><p className="font-mono text-[8px] font-bold uppercase tracking-[.15em] text-[#FF9A3D]">{isEs ? 'Tu enlace privado' : 'Your private link'}</p><div className="mt-2 flex items-center gap-2"><div className="min-w-0 flex-1 truncate rounded-xl border border-white/[0.08] bg-[#09090B] px-3 py-2.5 font-mono text-[9px] text-zinc-300">{inviteLink}</div><button onClick={copy} className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF7300] text-black">{copied ? <Check size={16} /> : <Copy size={16} />}</button><button onClick={share} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white"><Share2 size={16} /></button></div></div><form onSubmit={search} className="relative mt-4"><label htmlFor="friend-search" className="sr-only">{isEs ? 'Buscar amigos' : 'Search friends'}</label><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" /><input id="friend-search" value={term} onChange={event => setTerm(event.target.value)} placeholder={isEs ? '@usuario o código T1GER' : '@username or T1GER code'} className="h-12 w-full rounded-2xl border border-white/[0.09] bg-[#09090B] pl-10 pr-12 text-[12px] text-white outline-none placeholder:text-zinc-600 focus:border-[#FF7300]/55" /><button type="submit" className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF7300] text-black">{searching ? <LoaderCircle size={14} className="animate-spin" /> : <ChevronRight size={15} />}</button></form><div className="mt-3 space-y-2">{results.map(profile => { const sent = sentIds.has(profile.uid); return <div key={profile.uid} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#09090B] p-3"><Avatar name={profile.displayName} profile={profile} /><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-bold text-white">{profile.displayName}</p><p className="mt-0.5 truncate font-mono text-[8px] text-zinc-500">@{profile.username} · {profile.streak}d 🔥</p></div><button disabled={sent} onClick={() => onSent(profile)} className={`rounded-xl px-3 py-2 font-mono text-[8px] font-black uppercase ${sent ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'bg-[#FF7300] text-black'}`}>{sent ? (isEs ? 'Enviada' : 'Sent') : (isEs ? 'Agregar' : 'Add')}</button></div>; })}{!searching && term && !results.length && <p className="py-5 text-center text-[10px] text-zinc-500">{isEs ? 'No encontramos ese usuario. Prueba con su código.' : 'We could not find that user. Try their code.'}</p>}</div></motion.div></div>}</AnimatePresence>, document.body);
}

function ChallengeModal({ opponent, viewer, coins, isEs, onClose, onCreate }: { opponent: SocialProfile | null; viewer: SocialViewer; coins: number; isEs: boolean; onClose: () => void; onCreate: (challenge: DirectChallenge) => void }) {
  const [duration, setDuration] = useState<3 | 7 | 14>(7);
  const [stake, setStake] = useState(50);
  const [metric, setMetric] = useState<'missions' | 'streak'>('missions');
  const [saving, setSaving] = useState(false);
  if (!opponent) return null;
  const valid = stake <= coins;
  const create = async () => { if (!valid) return; setSaving(true); try { const result = await SocialService.createChallenge(viewer, opponent, duration, stake, metric); SocialService.haptic([15, 30, 15]); onCreate(result); } finally { setSaving(false); } };
  return createPortal(<div className="fixed inset-0 z-[190] flex items-end justify-center bg-black/85 p-3 backdrop-blur-md sm:items-center"><motion.div role="dialog" aria-modal="true" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} className="max-h-[calc(100dvh-1.5rem)] w-full max-w-sm overflow-y-auto rounded-[1.75rem] border border-white/10 bg-[#121216] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#FF7300]/25 bg-[#FF7300]/10 text-[#FF8A1F]"><Swords size={20} /></div><div><p className="font-mono text-[8px] uppercase tracking-[.18em] text-[#FF8A1F]">1v1 Arena</p><h2 className="mt-1 text-base font-black text-white">{isEs ? `Reta a ${opponent.displayName}` : `Challenge ${opponent.displayName}`}</h2></div></div><button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-400"><X size={16} /></button></div><div className="mt-5 space-y-4"><div><p className="mb-2 font-mono text-[8px] font-bold uppercase tracking-wider text-zinc-500">{isEs ? 'Objetivo' : 'Goal'}</p><div className="grid grid-cols-2 gap-2">{(['missions', 'streak'] as const).map(value => <button key={value} onClick={() => setMetric(value)} className={`rounded-xl border py-2.5 text-[10px] font-bold ${metric === value ? 'border-[#FF7300]/45 bg-[#FF7300]/10 text-white' : 'border-white/[0.07] text-zinc-500'}`}>{value === 'missions' ? (isEs ? 'Más misiones' : 'Most missions') : (isEs ? 'Mayor racha' : 'Best streak')}</button>)}</div></div><div><p className="mb-2 font-mono text-[8px] font-bold uppercase tracking-wider text-zinc-500">{isEs ? 'Duración' : 'Duration'}</p><div className="grid grid-cols-3 gap-2">{([3, 7, 14] as const).map(value => <button key={value} onClick={() => setDuration(value)} className={`rounded-xl border py-2.5 font-mono text-[10px] font-black ${duration === value ? 'border-[#FF7300]/45 bg-[#FF7300]/10 text-[#FF9A3D]' : 'border-white/[0.07] text-zinc-500'}`}>{value}D</button>)}</div></div><div><div className="mb-2 flex items-center justify-between"><p className="font-mono text-[8px] font-bold uppercase tracking-wider text-zinc-500">{isEs ? 'Apuesta por jugador' : 'Stake per player'}</p><span className="font-mono text-[9px] text-zinc-400">{coins} 🪙</span></div><div className="grid grid-cols-3 gap-2">{[25, 50, 100].map(value => <button key={value} onClick={() => setStake(value)} disabled={value > coins} className={`rounded-xl border py-2.5 font-mono text-[10px] font-black ${stake === value ? 'border-amber-400/40 bg-amber-400/10 text-amber-300' : 'border-white/[0.07] text-zinc-500 disabled:opacity-30'}`}>{value}</button>)}</div></div><div className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-[#09090B] p-3"><div><p className="font-mono text-[8px] uppercase text-zinc-500">{isEs ? 'Pozo total' : 'Total pot'}</p><p className="mt-1 font-mono text-xl font-black text-amber-300">{stake * 2} 🪙</p></div><p className="max-w-[10rem] text-right text-[9px] leading-relaxed text-zinc-500">{isEs ? 'Las monedas se reservan cuando ambos aceptan.' : 'Coins lock when both players accept.'}</p></div>{!valid && <p className="text-[10px] text-[#FF7474]">{isEs ? 'No tienes monedas suficientes para esta apuesta.' : 'You do not have enough coins for this stake.'}</p>}<button onClick={create} disabled={!valid || saving} className="t1ger-primary-button flex w-full items-center justify-center gap-2 py-3.5 text-[10px] disabled:opacity-40">{saving ? <LoaderCircle size={15} className="animate-spin" /> : <Swords size={15} />} {isEs ? 'ENVIAR RETO' : 'SEND CHALLENGE'}</button></div></motion.div></div>, document.body);
}

function CommentComposer({ activity, isEs, onClose, onSubmit }: { activity: SquadActivity | null; isEs: boolean; onClose: () => void; onSubmit: (body: string) => void }) {
  const [body, setBody] = useState('');
  if (!activity) return null;
  const copy = activityCopy(activity, isEs);
  return createPortal(<div className="fixed inset-0 z-[190] flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm"><motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md rounded-[1.6rem] border border-white/10 bg-[#121216] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"><div className="flex items-center justify-between"><div><p className="font-mono text-[8px] uppercase tracking-[.18em] text-[#FF8A1F]">{isEs ? 'Respuesta de squad' : 'Squad reply'}</p><h2 className="mt-1 max-w-[17rem] truncate text-sm font-black text-white">{copy.title}</h2></div><button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-400"><X size={16} /></button></div><form onSubmit={event => { event.preventDefault(); if (body.trim()) { onSubmit(body); setBody(''); } }} className="mt-4 flex gap-2"><input autoFocus maxLength={280} value={body} onChange={event => setBody(event.target.value)} placeholder={isEs ? 'Escribe algo útil…' : 'Say something useful…'} className="h-12 min-w-0 flex-1 rounded-2xl border border-white/[0.09] bg-[#09090B] px-4 text-[12px] text-white outline-none placeholder:text-zinc-600 focus:border-[#FF7300]/50" /><button type="submit" disabled={!body.trim()} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF7300] text-black disabled:opacity-40"><Send size={17} /></button></form></motion.div></div>, document.body);
}

export const SquadTab: React.FC = () => {
  const { language } = useBrain();
  const { stats, setActiveView } = useT1ger();
  const { appUser } = useAuth();
  const isEs = language === 'es';
  const [view, setView] = useState<CompeteView>('feed');
  const [league, setLeague] = useState<LeagueMember[]>([]);
  const [activities, setActivities] = useState<SquadActivity[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [requests, setRequests] = useState<Friendship[]>([]);
  const [challenges, setChallenges] = useState<DirectChallenge[]>([]);
  const [loading, setLoading] = useState({ feed: true, league: true, squad: true });
  const [error, setError] = useState('');
  const [finderOpen, setFinderOpen] = useState(false);
  const [inviteProfile, setInviteProfile] = useState<SocialProfile | null>(null);
  const [challengeOpponent, setChallengeOpponent] = useState<SocialProfile | null>(null);
  const [commentActivity, setCommentActivity] = useState<SquadActivity | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [nudgedIds, setNudgedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');

  const viewer = useMemo<SocialViewer>(() => ({
    uid: appUser?.uid || 'guest-local',
    displayName: appUser?.displayName || (isEs ? 'Tú' : 'You'),
    photoURL: appUser?.photoURL,
    niche: appUser?.niche,
    weeklyXP: appUser?.weeklyXP || 0,
    verifiedXP: stats.verifiedXP,
    currentWeekId: appUser?.currentWeekId,
    leagueTier: appUser?.leagueTier,
    streak: stats.streak,
  }), [appUser, isEs, stats.streak, stats.verifiedXP]);
  const tier = LeagueService.normalizeTier(viewer.leagueTier) || LeagueService.getUserTier(viewer.verifiedXP || 0);

  const notify = useCallback((message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2400); }, []);

  useEffect(() => {
    SocialService.ensurePublicSocialProfile(viewer).catch(() => setError(isEs ? 'Tu perfil social se mostrará en modo local hasta recuperar conexión.' : 'Your social profile will stay local until connection returns.'));
    const onError = () => setError(isEs ? 'Mostrando datos locales mientras recuperamos la sincronización.' : 'Showing local data while sync recovers.');
    const unsubscribeLeague = SocialService.subscribeLeague(viewer, data => { setLeague(data); setLoading(current => ({ ...current, league: false })); }, onError);
    const unsubscribeFriends = SocialService.subscribeFriends(viewer.uid, (nextFriends, nextRequests) => { setFriends(nextFriends); setRequests(nextRequests); setLoading(current => ({ ...current, squad: false })); }, onError);
    const unsubscribeFeed = SocialService.subscribeActivityFeed(viewer.uid, data => { setActivities(data); setLoading(current => ({ ...current, feed: false })); }, onError);
    const unsubscribeChallenges = SocialService.subscribeChallenges(viewer.uid, setChallenges, onError);
    return () => { unsubscribeLeague(); unsubscribeFriends(); unsubscribeFeed(); unsubscribeChallenges(); };
  }, [viewer.uid, viewer.displayName, viewer.weeklyXP, viewer.verifiedXP, viewer.currentWeekId, viewer.leagueTier, viewer.streak, isEs]);

  useEffect(() => {
    const inviteUid = SocialService.getInviteUid() || sessionStorage.getItem('t1ger_pending_invite_uid');
    if (!inviteUid || inviteUid === viewer.uid) return;
    setView('squad');
    setFinderOpen(true);
    SocialService.getProfile(inviteUid).then(profile => {
      setInviteProfile(profile);
      if (profile) sessionStorage.removeItem('t1ger_pending_invite_uid');
    }).catch(() => setInviteProfile(null));
  }, [viewer.uid]);

  const react = async (activity: SquadActivity, reaction: SocialReaction) => {
    SocialService.haptic(10);
    const active = activity.myReactions.includes(reaction);
    setActivities(current => current.map(item => item.id === activity.id ? { ...item, myReactions: active ? item.myReactions.filter(value => value !== reaction) : [...item.myReactions, reaction], reactionCounts: { ...item.reactionCounts, [reaction]: Math.max(0, item.reactionCounts[reaction] + (active ? -1 : 1)) } } : item));
    try { await SocialService.reactToActivity(activity, viewer.uid, reaction, !active); } catch { setActivities(current => current.map(item => item.id === activity.id ? activity : item)); notify(isEs ? 'No pudimos guardar la reacción.' : 'We could not save that reaction.'); }
  };

  const sendFriendRequest = async (profile: SocialProfile) => {
    setSentIds(current => new Set(current).add(profile.uid));
    SocialService.haptic();
    try { await SocialService.sendFriendRequest(viewer.uid, profile.uid); notify(isEs ? `Solicitud enviada a ${profile.displayName}` : `Request sent to ${profile.displayName}`); } catch (requestError) { setSentIds(current => { const next = new Set(current); next.delete(profile.uid); return next; }); notify(requestError instanceof Error ? requestError.message : (isEs ? 'No pudimos enviar la solicitud.' : 'Request failed.')); }
  };

  const accept = async (request: Friendship) => {
    setRequests(current => current.filter(item => item.id !== request.id));
    setFriends(current => [...current, { ...request, status: 'accepted' }]);
    SocialService.haptic([12, 22, 12]);
    try { await SocialService.acceptFriendRequest(request.id, viewer.uid); notify(isEs ? `${request.profile.displayName} ya está en tu Squad` : `${request.profile.displayName} joined your Squad`); } catch { setFriends(current => current.filter(item => item.id !== request.id)); setRequests(current => [...current, request]); }
  };

  const nudge = async (friend: SocialProfile) => {
    setNudgedIds(current => new Set(current).add(friend.uid));
    SocialService.haptic([18, 35, 18]);
    try { await SocialService.sendNudge(viewer, friend); notify(isEs ? `Nudge enviado a ${friend.displayName}` : `Nudge sent to ${friend.displayName}`); } catch { setNudgedIds(current => { const next = new Set(current); next.delete(friend.uid); return next; }); notify(isEs ? 'No pudimos enviar el nudge.' : 'Nudge failed.'); }
  };

  const addComment = async (body: string) => {
    if (!commentActivity) return;
    const original = commentActivity;
    setActivities(current => current.map(item => item.id === original.id ? { ...item, commentCount: item.commentCount + 1 } : item));
    setCommentActivity(null);
    SocialService.haptic();
    try { await SocialService.addComment(original, viewer.uid, viewer.displayName, body); notify(isEs ? 'Comentario publicado' : 'Comment posted'); } catch { setActivities(current => current.map(item => item.id === original.id ? original : item)); notify(isEs ? 'No pudimos publicar el comentario.' : 'Comment failed.'); }
  };

  const decideChallenge = async (challenge: DirectChallenge, decision: 'accept' | 'decline') => {
    const previous = challenges;
    setChallenges(current => current.map(item => item.id === challenge.id ? { ...item, status: decision === 'accept' ? 'active' : 'declined' } : item));
    SocialService.haptic(decision === 'accept' ? [18, 28, 18] : 10);
    try {
      if (decision === 'accept') await SocialService.acceptChallenge(challenge.id, viewer.uid);
      else await SocialService.declineChallenge(challenge.id, viewer.uid);
      notify(decision === 'accept' ? (isEs ? 'Arena activada. El pozo está bloqueado.' : 'Arena live. The pot is locked.') : (isEs ? 'Reto rechazado' : 'Challenge declined'));
    } catch (challengeError) {
      setChallenges(previous);
      notify(challengeError instanceof Error ? challengeError.message : (isEs ? 'No pudimos actualizar el reto.' : 'Challenge update failed.'));
    }
  };

  const tabs: Array<{ id: CompeteView; label: string; icon: IconComponent }> = [
    { id: 'feed', label: isEs ? 'Actividad' : 'Activity', icon: Activity },
    { id: 'league', label: isEs ? 'Liga' : 'League', icon: Trophy },
    { id: 'squad', label: 'Squad', icon: Users },
  ];

  return (
    <div className="mx-auto max-w-lg space-y-4 px-0.5 pb-28 pt-1 font-sans text-white selection:bg-[#FF7300]/35">
      <header className="flex items-end justify-between gap-4 px-1">
        <div><p className="font-mono text-[8px] font-black uppercase tracking-[.24em] text-[#FF8A1F]">T1GER // COMPETE</p><h1 className="mt-1 text-[25px] font-black leading-none tracking-[-.035em]">{isEs ? 'La disciplina es visible.' : 'Discipline is visible.'}</h1><p className="mt-2 text-[10px] text-zinc-500">{isEs ? 'Prueba real. Estatus ganado. Nadie desaparece.' : 'Real proof. Earned status. Nobody disappears.'}</p></div>
        <button type="button" onClick={() => setFinderOpen(true)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#FF7300]/30 bg-[#FF7300]/10 text-[#FF8A1F] shadow-[0_0_20px_rgba(255,115,0,.12)]" aria-label={isEs ? 'Agregar amigos' : 'Add friends'}><UserPlus size={19} /></button>
      </header>

      {error && <ErrorBanner message={error} />}

      <nav aria-label={isEs ? 'Secciones de competencia' : 'Competition sections'} className="grid grid-cols-3 gap-1 rounded-[1.25rem] border border-white/[0.08] bg-[#121216] p-1">
        {tabs.map(tab => { const Icon = tab.icon; const active = view === tab.id; return <button key={tab.id} type="button" onClick={() => { SocialService.haptic(8); setView(tab.id); }} aria-current={active ? 'page' : undefined} className={`relative flex min-h-11 items-center justify-center gap-1.5 rounded-[.95rem] font-mono text-[9px] font-black uppercase tracking-wider transition-colors ${active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{active && <motion.span layoutId="compete-tab" className="absolute inset-0 rounded-[.95rem] border border-[#FF7300]/25 bg-[#FF7300]/10" transition={{ type: 'spring', stiffness: 600, damping: 38 }} />}<Icon size={14} className={`relative ${active ? 'text-[#FF8A1F]' : ''}`} /><span className="relative">{tab.label}</span>{tab.id === 'squad' && requests.length > 0 && <span className="relative flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF4B4B] px-1 text-[7px] text-white">{requests.length}</span>}</button>; })}
      </nav>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={view} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: .16 }}>
          {view === 'feed' && <FeedView activities={activities} loading={loading.feed} isEs={isEs} onReact={react} onComment={setCommentActivity} onInvite={() => setFinderOpen(true)} />}
          {view === 'league' && <LeagueView members={league} loading={loading.league} tier={tier} isEs={isEs} onApply={() => setActiveView('build')} />}
          {view === 'squad' && <SquadView friends={friends} requests={requests} challenges={challenges} viewerUid={viewer.uid} isEs={isEs} nudgedIds={nudgedIds} onInvite={() => setFinderOpen(true)} onNudge={nudge} onChallenge={setChallengeOpponent} onAccept={accept} onChallengeDecision={decideChallenge} />}
        </motion.div>
      </AnimatePresence>

      <FriendFinderModal open={finderOpen} viewer={viewer} isEs={isEs} initialProfile={inviteProfile} sentIds={sentIds} onClose={() => { setFinderOpen(false); setInviteProfile(null); }} onSent={sendFriendRequest} />
      <AnimatePresence>{challengeOpponent && <ChallengeModal opponent={challengeOpponent} viewer={viewer} coins={stats.coins} isEs={isEs} onClose={() => setChallengeOpponent(null)} onCreate={challenge => { setChallenges(current => [challenge, ...current]); setChallengeOpponent(null); notify(isEs ? `Reto enviado a ${challenge.receiverName}` : `Challenge sent to ${challenge.receiverName}`); }} />}</AnimatePresence>
      <AnimatePresence>{commentActivity && <CommentComposer activity={commentActivity} isEs={isEs} onClose={() => setCommentActivity(null)} onSubmit={addComment} />}</AnimatePresence>
      <Toast message={toast} />
    </div>
  );
};
