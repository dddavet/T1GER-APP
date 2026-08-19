import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  BookOpen, 
  Bot, 
  CheckCheck, 
  ChevronRight, 
  Flame, 
  Mail, 
  Smartphone, 
  Sparkles, 
  Trophy, 
  X 
} from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { 
  NotificationService, 
  type AppNotification, 
  type NotificationCategory 
} from '../services/notificationService';
import { EmailPreviewModal } from './EmailPreviewModal';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useBrain();
  const { setActiveView } = useT1ger();
  const isEs = language === 'es';

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState<NotificationCategory | 'all'>('all');
  const [emailPreviewHtml, setEmailPreviewHtml] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const refreshList = () => {
    setNotifications(NotificationService.getNotifications());
  };

  useEffect(() => {
    refreshList();
    window.addEventListener('t1ger_notifications_updated', refreshList);
    return () => window.removeEventListener('t1ger_notifications_updated', refreshList);
  }, []);

  const handleNotificationClick = (notif: AppNotification) => {
    NotificationService.markAsRead(notif.id);
    refreshList();
    if (notif.actionView) {
      setActiveView(notif.actionView);
      onClose();
    }
  };

  const handleOpenEmailPreview = (html?: string) => {
    setEmailPreviewHtml(html || null);
    setShowEmailModal(true);
  };

  const handleMarkAllRead = () => {
    NotificationService.markAllAsRead();
    refreshList();
  };

  const filtered = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.category === activeFilter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'streak':
        return <Flame size={16} className="text-[#FF4500]" />;
      case 'screentime':
        return <Smartphone size={16} className="text-[var(--t1ger-orange)]" />;
      case 'coach':
        return <Bot size={16} className="text-[#3FC78E]" />;
      case 'league':
        return <Trophy size={16} className="text-[#FFB700]" />;
      case 'system':
        return <Sparkles size={16} className="text-[#87A9A2]" />;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diffMin = Math.floor((Date.now() - timestamp) / (1000 * 60));
    if (diffMin < 1) return isEs ? 'ahora mismo' : 'just now';
    if (diffMin < 60) return isEs ? `hace ${diffMin}m` : `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return isEs ? `hace ${diffHrs}h` : `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return isEs ? `hace ${diffDays}d` : `${diffDays}d ago`;
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[2500] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="relative flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#09231F] text-white shadow-2xl font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--t1ger-orange)] text-[#09231F]">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4500] text-[10px] font-black text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {isEs ? 'Centro de Notificaciones' : 'Notification Center'}
                  </h2>
                  <p className="text-xs text-[#87A9A2]">
                    {unreadCount > 0
                      ? (isEs ? `${unreadCount} nuevas sin leer` : `${unreadCount} unread alerts`)
                      : (isEs ? 'Todo al día' : 'All caught up')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    title={isEs ? 'Marcar todas como leídas' : 'Mark all read'}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-[#87A9A2] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  >
                    <CheckCheck size={17} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-[#87A9A2] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Email Templates Action Banner */}
            <div className="border-b border-white/8 bg-black/20 px-6 py-3">
              <button
                onClick={() => handleOpenEmailPreview()}
                className="flex w-full items-center justify-between rounded-xl border border-[var(--t1ger-orange)]/30 bg-[var(--t1ger-orange)]/10 px-3.5 py-2.5 text-xs font-bold text-[var(--t1ger-orange)] hover:bg-[var(--t1ger-orange)]/20 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Mail size={15} />
                  <span>{isEs ? 'Previsualizar Emails Transaccionales' : 'Preview Transactional Emails'}</span>
                </div>
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-1.5 overflow-x-auto border-b border-white/8 px-6 py-3 scrollbar-none">
              {[
                { key: 'all', label: isEs ? 'Todas' : 'All' },
                { key: 'screentime', label: isEs ? '📱 Screen Time' : '📱 Screen Time' },
                { key: 'streak', label: isEs ? '🔥 Racha' : '🔥 Streak' },
                { key: 'coach', label: isEs ? '🐅 Profesor' : '🐅 Coach' },
                { key: 'league', label: isEs ? '🏆 Liga' : '🏆 League' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key as any)}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    activeFilter === tab.key
                      ? 'bg-[var(--t1ger-orange)] text-[#09231F] font-bold shadow-[0_2px_8px_rgba(255,115,0,0.3)]'
                      : 'bg-white/5 text-[#87A9A2] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
              {filtered.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center text-[#87A9A2]">
                  <Bell size={28} className="text-white/20 mb-2" />
                  <p className="text-sm font-semibold text-white">
                    {isEs ? 'No hay notificaciones en esta categoría' : 'No notifications in this category'}
                  </p>
                </div>
              ) : (
                filtered.map(notif => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleNotificationClick(notif)}
                    className={`group relative flex items-start gap-3 rounded-2xl border p-4 transition-all cursor-pointer ${
                      notif.read
                        ? 'border-white/6 bg-white/[.02] hover:bg-white/[.04]'
                        : 'border-[var(--t1ger-orange)]/30 bg-[#0C312C] shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:border-[var(--t1ger-orange)]/50'
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {!notif.read && (
                      <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-[var(--t1ger-orange)]" />
                    )}

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 mt-0.5">
                      {getCategoryIcon(notif.category)}
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white leading-tight">
                          {notif.title}
                        </h4>
                      </div>
                      <p className="mt-1 text-xs text-[#87A9A2] leading-relaxed">
                        {notif.body}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#5B8077]">
                        <span>{formatTimeAgo(notif.timestamp)}</span>
                        {notif.emailPreviewHtml && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEmailPreview(notif.emailPreviewHtml);
                            }}
                            className="flex items-center gap-1 text-[var(--t1ger-orange)] hover:underline"
                          >
                            <Mail size={11} />
                            <span>{isEs ? 'Ver Email' : 'View Email'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Embedded Email HTML Previewer Modal */}
      <EmailPreviewModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        initialHtml={emailPreviewHtml || undefined}
      />
    </>
  );
};
