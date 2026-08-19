import React, { useState, useEffect } from 'react';
import { Bell, Bot, Flame, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { StreakModal } from './StreakModal';
import { NotificationCenterModal } from './NotificationCenterModal';
import { NotificationService } from '../services/notificationService';

export const HUD = React.memo(() => {
  const { learnStreak, language } = useBrain();
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

  return (
    <>
      <header className="z-40 flex w-full flex-none items-center justify-between border-b border-white/8 bg-[#09090B]/95 px-3.5 pb-3 pt-[calc(.8rem+env(safe-area-inset-top))] backdrop-blur-xl select-none">
        {/* Left: T1GER Logo & Level */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-transparent">
            <img src="/t1ger-avatar.png" alt="T1GER Mascot" className="h-full w-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]" />
          </div>
          <div>
            <span className="block text-sm font-semibold tracking-[-.02em] text-white">T1GER</span>
            <span className="block text-[10px] text-[#64877F]">
              {isEs ? 'Inversión' : 'Investing'} · {isEs ? 'Nivel' : 'Level'} {appUser?.level || 1}
            </span>
          </div>
        </div>

        {/* Right Actions: Bell Notification Hub, Profesor Button, Streak Flame, Verified XP */}
        <div className="flex items-center gap-2">
          {/* Notification Center Bell */}
          <button
            onClick={() => setShowNotificationCenter(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/[.045] text-[#87A9A2] hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            aria-label={isEs ? 'Notificaciones' : 'Notifications'}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4500] text-[9px] font-black text-white shadow-[0_2px_6px_rgba(255,69,0,0.5)]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dedicated Physical Profesor T1GER Button */}
          <button
            onClick={() => setActiveView('coach')}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-[var(--t1ger-orange)]/40 bg-[var(--t1ger-orange)]/15 px-2.5 text-xs font-bold text-[var(--t1ger-orange)] shadow-[0_2px_10px_rgba(255,115,0,0.15)] hover:bg-[var(--t1ger-orange)]/25 transition-all cursor-pointer active:scale-95"
            aria-label={isEs ? 'Profesor T1GER AI' : 'Professor T1GER AI'}
          >
            <Bot size={16} />
            <span>{isEs ? 'Profesor' : 'Mentor'}</span>
          </button>

          {/* Streak Flame Badge */}
          <button
            onClick={() => setShowStreakModal(true)}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-white/[.045] px-2.5 font-mono text-xs text-[#E8B271] hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={isEs ? 'Ver Racha' : 'View Streak'}
          >
            <Flame size={16} />
            {learnStreak}
          </button>

          {/* Verified XP Badge */}
          <div
            className="flex h-9 items-center gap-1.5 rounded-xl bg-[#3FC78E]/9 px-2.5 font-mono text-xs text-[#78DDB0]"
            aria-label={`${stats.verifiedXP} ${isEs ? 'XP verificado' : 'verified XP'}`}
          >
            <ShieldCheck size={16} />
            {stats.verifiedXP}
          </div>
        </div>
      </header>

      <StreakModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streak={learnStreak}
      />

      <NotificationCenterModal
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />
    </>
  );
});
