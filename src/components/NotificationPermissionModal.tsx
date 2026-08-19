import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle2, Flame, ShieldAlert, Smartphone, Sparkles, Trophy, X } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { OneSignalService } from '../services/oneSignalService';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGranted?: () => void;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  isOpen,
  onClose,
  onGranted,
}) => {
  const { language, learnStreak } = useBrain();
  const { appUser, updateAppUser } = useAuth();
  const isEs = language === 'es';
  const [requesting, setRequesting] = useState(false);

  const handleEnable = async () => {
    setRequesting(true);
    const granted = await OneSignalService.requestPermission();
    setRequesting(false);

    if (granted) {
      if (appUser?.uid) {
        await OneSignalService.identifyUser(appUser.uid, {
          streak_days: learnStreak,
          language: language,
        });
      }
      await updateAppUser({
        notificationPreferences: {
          ...appUser?.notificationPreferences,
          daily_reminder: true,
          streak_risk: true,
          apply_reminder: true,
        },
      });
      onGranted?.();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2800] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/12 bg-[#09231F] p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)] font-sans select-none"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[#87A9A2] hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          {/* Center Mascot Avatar with Glow */}
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[var(--t1ger-orange)] opacity-20 blur-xl animate-pulse" />
              <img
                src="/t1ger-avatar.png"
                alt="T1GER Mascot"
                className="relative h-18 w-18 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              />
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#FF4500] text-white shadow-md">
                <Flame size={15} />
              </div>
            </div>

            <h3 className="mt-4 text-lg font-black tracking-tight text-white">
              {isEs ? 'Protege tu Racha Diaria' : 'Protect Your Daily Streak'}
            </h3>
            <p className="mt-1 text-xs text-[#87A9A2] leading-relaxed">
              {isEs
                ? 'Activa las alertas inteligentes de T1GER para no perder tu progreso ni tus gemas.'
                : 'Turn on smart T1GER alerts to protect your progress and gems.'}
            </p>
          </div>

          {/* Value Proposition List */}
          <div className="mt-5 space-y-3 rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FF4500]/15 text-[#FF4500]">
                <Flame size={15} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {isEs ? 'Alerta Crítica a las 10:00 PM' : 'Critical 10:00 PM Alert'}
                </h4>
                <p className="text-[11px] text-[#7E9F97] leading-tight mt-0.5">
                  {isEs
                    ? 'Te avisamos 2h antes de medianoche si tu racha está en riesgo.'
                    : 'We notify you 2h before midnight if your streak is in jeopardy.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--t1ger-orange)]/15 text-[var(--t1ger-orange)]">
                <Smartphone size={15} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {isEs ? 'Costo de Oportunidad' : 'Opportunity Cost Analysis'}
                </h4>
                <p className="text-[11px] text-[#7E9F97] leading-tight mt-0.5">
                  {isEs
                    ? 'Recibe el cálculo de tiempo recuperado frente a las redes sociales.'
                    : 'Get your daily calculation of time saved vs social media feeds.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#3FC78E]/15 text-[#78DDB0]">
                <Trophy size={15} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {isEs ? 'Ascensos de Liga' : 'League Promotions'}
                </h4>
                <p className="text-[11px] text-[#7E9F97] leading-tight mt-0.5">
                  {isEs
                    ? 'Avisos cuando estés en el Top 3 de la División Ámbar.'
                    : 'Get notified when you enter the Top 3 promotion zone.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={handleEnable}
              disabled={requesting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--t1ger-orange)] font-bold text-xs uppercase tracking-wider text-[#09231F] shadow-[0_4px_16px_rgba(255,115,0,0.35)] hover:bg-[#FF8C33] active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              <Bell size={15} />
              <span>{requesting ? (isEs ? 'Activando…' : 'Enabling…') : (isEs ? 'Activar Alertas de Racha' : 'Enable Streak Alerts')}</span>
            </button>

            <button
              onClick={onClose}
              className="py-2 text-center text-xs font-semibold text-[#6F918A] hover:text-white transition-colors cursor-pointer"
            >
              {isEs ? 'Quizás más tarde' : 'Maybe later'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
