import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOGGLE_ITEMS = [
  { id: 'daily_reminder', labelEn: 'Daily Lesson Reminder', labelEs: 'Recordatorio Diario de Lección' },
  { id: 'streak_risk', labelEn: 'Streak at Risk Warning', labelEs: 'Alerta de Racha en Peligro' },
  { id: 'streak_lost', labelEn: 'Streak Lost Re-engagement', labelEs: 'Reconexión por Racha Perdida' },
  { id: 'streak_milestones', labelEn: 'Streak Milestones', labelEs: 'Hitos de Racha' },
  { id: 'level_up', labelEn: 'Level Up', labelEs: 'Subida de Nivel' },
  { id: 'apply_reminder', labelEn: 'Apply Phase Reminder', labelEs: 'Recordatorio de Fase de Aplicación' },
  { id: 'action_completed', labelEn: 'Action Step Completion', labelEs: 'Paso de Acción Completado' },
  { id: 'weekly_summary', labelEn: 'Weekly Summary', labelEs: 'Resumen Semanal' },
  { id: 'leaderboard_drop', labelEn: 'Leaderboard Movement', labelEs: 'Movimiento en la Clasificación' },
  { id: 're_engagement', labelEn: 'Re-engagement', labelEs: 'Reconexión' },
  { id: 'onboarding_nudge', labelEn: 'Onboarding Nudge', labelEs: 'Impulso de Incorporación' },
] as const;

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isOpen, onClose }) => {
  const { appUser, updateAppUser } = useAuth();
  const { language } = useBrain();
  const isEs = language === 'es';

  if (!isOpen) return null;

  const prefs = appUser?.notificationPreferences || {};

  const handleToggle = (id: string) => {
    const currentValue = prefs[id as keyof typeof prefs] ?? true; // default to true if undefined
    updateAppUser({
      notificationPreferences: {
        ...prefs,
        [id]: !currentValue
      }
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-[#F7F7F9] sm:rounded-3xl w-full h-full sm:h-auto max-w-lg relative shadow-2xl font-sans text-zinc-900 flex flex-col overflow-hidden select-none"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-zinc-200/80 p-4 bg-white shrink-0">
            <button
              onClick={onClose}
              className="p-2 -ml-2 rounded-xl text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900 text-center flex-1">
              {isEs ? 'Notificaciones' : 'Notifications'}
            </h2>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
            <p className="text-sm font-bold text-zinc-500 mb-6 px-2 text-center">
              {isEs 
                ? 'Elige exactamente de qué quieres que te notifiquemos. Sin spam.' 
                : 'Choose exactly what you want to be notified about. No spam.'}
            </p>
            
            <div className="bg-white border-2 border-zinc-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-zinc-100">
              {TOGGLE_ITEMS.map((item) => {
                const isEnabled = prefs[item.id as keyof typeof prefs] ?? true;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
                  >
                    <span className="text-sm font-extrabold text-zinc-700">
                      {isEs ? item.labelEs : item.labelEn}
                    </span>
                    
                    {/* Toggle Switch UI */}
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative flex items-center ${isEnabled ? 'bg-[#009999]' : 'bg-zinc-200'}`}>
                      <motion.div 
                        layout
                        initial={false}
                        animate={{ 
                          x: isEnabled ? 24 : 0,
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
