import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Bell, Fire, ShieldCheck } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { NotificationService } from '../services/notificationService';
import { SoundEffects } from '../services/soundEffects';

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
    SoundEffects.playTap();
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(12);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-2 sm:px-3 pt-[calc(.45rem+env(safe-area-inset-top))] pb-2 select-none pointer-events-auto">
        {/* Floating Glass Dynamic Island Bar */}
        <div className="mx-auto flex w-full max-w-lg items-center justify-between rounded-2xl border border-white/10 bg-[#0D0D11]/85 backdrop-blur-xl px-3 py-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">
          {/* Left: T1GER Logo & Prestige Level */}
          <div className="flex items-center gap-2">
            <button
              onPointerDown={haptic}
              onClick={() => setActiveView('profile')}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#18181D] border border-white/15 shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] overflow-hidden cursor-pointer active:scale-92 transition-transform duration-120 ease-out group"
              aria-label="T1GER Mascot"
            >
              <img
                src="/t1ger-avatar.png"
                alt="T1GER Mascot"
                className="relative z-10 h-full w-full object-contain scale-[1.45] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-black tracking-tight text-white leading-none">T1GER</span>
                <span className="font-mono text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/10">
                  LVL {appUser?.level || 1}
                </span>
              </div>
            </div>
          </div>

          {/* Right Actions: Notifications, Streak, Verified XP */}
          <div className="flex items-center gap-1.5">
            {/* Streak Flame Badge */}
            <button
              onPointerDown={haptic}
              onClick={() => setShowStreakModal(true)}
              className={`relative flex h-7 items-center gap-1.5 rounded-xl border px-2.5 font-mono text-[11px] font-bold transition-all duration-120 ease-out cursor-pointer active:scale-95 before:absolute before:-inset-2 before:content-[''] ${
                isLearnStreakAtRisk
                  ? 'border-red-500/40 bg-red-500/10 text-red-300 shadow-[0_2px_8px_rgba(239,68,68,0.2)]'
                  : 'border-white/10 bg-white/[0.05] text-amber-400 hover:bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
              }`}
              aria-label={isLearnStreakAtRisk ? (isEs ? `Racha de ${learnStreak} días: haz tu acción hoy` : `${learnStreak}-day streak: take today's action`) : (isEs ? `Ver racha de ${learnStreak} días` : `View Streak: ${learnStreak} days`)}
            >
              {isLearnStreakAtRisk && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-400" />}
              <span className="inline-flex items-center">
                <Fire size={13} weight="fill" className={isLearnStreakAtRisk ? 'text-red-300' : 'text-amber-400'} />
              </span>
              <span className="tabular-nums text-white font-black">{learnStreak}</span>
            </button>

            {/* Verified XP Badge */}
            <div
              className="flex h-7 items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-2.5 font-mono text-[11px] font-bold text-emerald-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              aria-label={`${stats.verifiedXP} ${isEs ? 'XP verificado' : 'verified XP'}`}
            >
              <ShieldCheck size={13} weight="bold" />
              <span className="tabular-nums text-emerald-300 font-black">{stats.verifiedXP}</span>
            </div>

            {/* Notification Center Bell */}
            <button
              onPointerDown={haptic}
              onClick={() => setShowNotificationCenter(true)}
              className="relative flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.05] border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all duration-120 ease-out cursor-pointer active:scale-92 before:absolute before:-inset-2 before:content-[''] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              aria-label={isEs ? 'Notificaciones' : 'Notifications'}
            >
              <span className="inline-flex items-center justify-center">
                <Bell size={14} weight="bold" />
              </span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--ob-accent)] text-[8px] font-black text-black shadow-md ring-2 ring-[#0D0D11]">
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
