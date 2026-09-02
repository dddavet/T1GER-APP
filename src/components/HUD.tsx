import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Bell, Fire, Robot, ShieldCheck } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { NotificationService } from '../services/notificationService';

const StreakModal = lazy(() => import('./StreakModal').then(module => ({ default: module.StreakModal })));
const NotificationCenterModal = lazy(() => import('./NotificationCenterModal').then(module => ({ default: module.NotificationCenterModal })));

export const HUD = React.memo(() => {
  const { learnStreak, isLearnStreakAtRisk, language } = useBrain();
  const { stats, setActiveView } = useT1ger();
  const { appUser } = useAuth();
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [unreadCount, setUnreadCount] = useState(() => NotificationService.getUnreadCount());
  const isEs = language === 'es';

  useEffect(() => {
    const updateCount = () => setUnreadCount(NotificationService.getUnreadCount());
    updateCount();
    window.addEventListener('t1ger_notifications_updated', updateCount);
    return () => window.removeEventListener('t1ger_notifications_updated', updateCount);
  }, []);

  const haptic = () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(12);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-2 sm:px-3 pt-[calc(.45rem+env(safe-area-inset-top))] pb-2 select-none pointer-events-auto">
        {/* Floating Glass Dynamic Island Bar */}
        <div className="mx-auto flex w-full max-w-lg items-center justify-between rounded-2xl border border-white/[0.08] bg-[#0D0D11] px-3 py-1.5 shadow-[0_10px_26px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,255,255,0.05)]">
          {/* Left: T1GER Logo & Prestige Level */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 shadow-inner">
              <img src="/t1ger-avatar.png" alt="T1GER Mascot" className="h-5 w-5 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-black tracking-tight text-white leading-none">T1GER</span>
                <span className="font-mono text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-[var(--ob-accent)]/20 text-[var(--ob-accent)] border border-[var(--ob-accent)]/30">
                  LVL {appUser?.level || 1}
                </span>
              </div>
            </div>
          </div>

          {/* Right Actions: Mentor, Notifications, Streak, Verified XP */}
          <div className="flex items-center gap-1">
            {/* Dedicated AI Mentor Action */}
            <button
              onClick={() => { haptic(); setActiveView('coach'); }}
              className="flex h-7 items-center gap-1 rounded-lg border border-[var(--ob-accent)]/40 bg-[var(--ob-accent)]/15 px-2 font-mono text-[10px] font-bold text-[var(--ob-accent)] hover:bg-[var(--ob-accent)]/25 transition cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(255,115,0,0.15)]"
              aria-label={isEs ? 'Profesor T1GER AI' : 'Professor T1GER AI'}
            >
              <Robot size={13} weight="bold" />
              <span>{isEs ? 'Mentor' : 'Mentor'}</span>
            </button>

            {/* Streak Flame Badge */}
            <button
              onClick={() => { haptic(); setShowStreakModal(true); }}
              className={`relative flex h-7 items-center gap-1 rounded-lg border px-2 font-mono text-[10.5px] font-bold transition cursor-pointer active:scale-95 ${isLearnStreakAtRisk ? 'border-red-500/45 bg-red-500/12 text-red-300 shadow-[0_0_14px_rgba(239,68,68,.22)]' : 'border-white/8 bg-white/[0.04] text-amber-400 hover:bg-white/8'}`}
              aria-label={isLearnStreakAtRisk ? (isEs ? 'Racha en riesgo antes de medianoche' : 'Streak at risk before midnight') : (isEs ? 'Ver Racha' : 'View Streak')}
            >
              {isLearnStreakAtRisk && <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-red-400" />}
              <Fire size={13} weight="fill" className={isLearnStreakAtRisk ? 'text-red-300' : 'text-amber-400'} />
              <span className="tabular-nums">{learnStreak}</span>
            </button>

            {/* Verified XP Badge */}
            <div
              className="flex h-7 items-center gap-1 rounded-lg bg-[#3FC78E]/10 border border-[#3FC78E]/25 px-2 font-mono text-[10.5px] font-bold text-[#78DDB0]"
              aria-label={`${stats.verifiedXP} ${isEs ? 'XP verificado' : 'verified XP'}`}
            >
              <ShieldCheck size={13} />
              <span className="tabular-nums">{stats.verifiedXP}</span>
            </div>

            {/* Notification Center Bell */}
            <button
              onClick={() => { haptic(); setShowNotificationCenter(true); }}
              className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] border border-white/8 text-zinc-400 hover:text-white transition cursor-pointer active:scale-95"
              aria-label={isEs ? 'Notificaciones' : 'Notifications'}
            >
              <Bell size={13} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-[var(--ob-accent)] text-[7.5px] font-black text-black shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <Suspense fallback={null}>
        {showStreakModal && (
          <StreakModal
            isOpen
            onClose={() => setShowStreakModal(false)}
            streak={learnStreak}
          />
        )}

        {showNotificationCenter && (
          <NotificationCenterModal
            isOpen
            onClose={() => setShowNotificationCenter(false)}
          />
        )}
      </Suspense>
    </>
  );
});
