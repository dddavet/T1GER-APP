import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquareHeart, Bug, Lightbulb, HelpCircle, Send, CheckCircle2, Mail, Sparkles, Smartphone } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { SoundEffects } from '../services/soundEffects';
import { Capacitor } from '@capacitor/core';

interface CustomerFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = 'bug' | 'feature' | 'support';

export const CustomerFeedbackModal: React.FC<CustomerFeedbackModalProps> = ({ isOpen, onClose }) => {
  const { language } = useBrain();
  const { appUser } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isEs = language === 'es';
  const tr = (es: string, en: string) => (isEs ? es : en);

  const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const el = dialogRef.current;
    if (isOpen) {
      SoundEffects.playTap();
      setSubmitted(false);
      setMessage('');
      if (el && !el.open) el.showModal();
    } else {
      if (el?.open) el.close();
    }
    return () => {
      if (el?.open) el.close();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const platform = Capacitor.getPlatform();
  const appVersion = 'v1.0.0';

  const types: { id: FeedbackType; icon: React.ComponentType<{ size?: number; className?: string }>; label: string }[] = [
    { id: 'bug', icon: Bug, label: tr('Fallo / Bug', 'Bug Report') },
    { id: 'feature', icon: Lightbulb, label: tr('Idea / Mejora', 'Suggestion') },
    { id: 'support', icon: HelpCircle, label: tr('Soporte', 'Support') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    SoundEffects.playTap();

    try {
      // Store locally so feedback is never lost even if offline
      const storedKey = 't1ger_user_feedbacks';
      const existing = JSON.parse(localStorage.getItem(storedKey) || '[]');
      const newEntry = {
        id: `fb_${Date.now()}`,
        userId: appUser?.uid || 'anonymous',
        userEmail: appUser?.email || 'unregistered',
        type: feedbackType,
        message: message.trim(),
        platform,
        appVersion,
        createdAt: new Date().toISOString(),
      };
      existing.push(newEntry);
      localStorage.setItem(storedKey, JSON.stringify(existing.slice(-50)));

      SoundEffects.playCorrect();
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to save feedback:', err);
    } finally {
      setSending(false);
    }
  };

  const emailSubject = encodeURIComponent(`[T1GER ${feedbackType.toUpperCase()}] App ${appVersion} (${platform})`);
  const emailBody = encodeURIComponent(
    `Tipo: ${feedbackType}\nUsuario: ${appUser?.displayName || 'Anónimo'} (${appUser?.email || 'Sin email'})\nPlataforma: ${platform}\nVersión: ${appVersion}\n\nDetalle:\n${message}`
  );
  const mailtoUrl = `mailto:soporte@t1ger.app?subject=${emailSubject}&body=${emailBody}`;

  return (
    <AnimatePresence>
      <dialog
        ref={dialogRef}
        aria-label={tr('Feedback & Soporte', 'Feedback & Support')}
        onCancel={onClose}
        onClick={(e) => {
          if (e.target === dialogRef.current) onClose();
        }}
        className="fixed inset-0 z-[320] m-0 h-dvh max-h-none w-screen max-w-none bg-black/85 backdrop-blur-xl p-4 open:flex items-center justify-center select-none cursor-default"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          className="relative flex w-full max-w-md flex-col overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#111116] shadow-2xl max-h-[92vh]"
        >
          {/* Close button with HIG min 44px touch target */}
          <button
            type="button"
            onClick={onClose}
            aria-label={tr('Cerrar', 'Close')}
            className="absolute top-4 right-4 z-30 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/10 text-zinc-400 hover:bg-white/20 hover:text-white transition-all cursor-pointer active:scale-90"
          >
            <X size={18} />
          </button>

          {/* Ambient header highlight */}
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full bg-[#FF7300]/15 blur-3xl" />

          <div className="relative z-10 px-6 pt-6 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--ob-accent)]/30 bg-[var(--ob-accent)]/15 text-[var(--ob-accent)]">
                <MessageSquareHeart size={20} />
              </div>
              <div>
                <h2 className="text-base font-black uppercase tracking-tight text-white sm:text-lg">
                  {tr('Soporte & Feedback', 'Support & Feedback')}
                </h2>
                <p className="text-[11px] text-zinc-400 font-mono">
                  {tr('Tu voz dirige las actualizaciones del T1GER', 'Your voice shapes T1GER updates')}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 p-6 overflow-y-auto space-y-4">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-4"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {tr('¡Mensaje Recibido!', 'Feedback Received!')}
                  </h3>
                  <p className="mt-1.5 text-xs text-zinc-300 max-w-xs mx-auto leading-relaxed">
                    {tr(
                      'Muchas gracias por ayudarnos a perfeccionar T1GER. El equipo revisa cada reporte a diario.',
                      'Thank you for helping us polish T1GER. Our team inspects every submission daily.'
                    )}
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="t1ger-primary-button w-full uppercase text-xs tracking-wider"
                  >
                    {tr('Volver a la app', 'Back to App')}
                  </button>
                  <a
                    href={mailtoUrl}
                    className="text-[11px] text-zinc-400 hover:text-white underline flex items-center justify-center gap-1.5 py-1"
                  >
                    <Mail size={13} />
                    {tr('¿Necesitas respuesta urgente? Escríbenos por email', 'Need urgent help? Email us directly')}
                  </a>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    {tr('Tipo de reporte', 'Report Type')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {types.map((t) => {
                      const Icon = t.icon;
                      const isSelected = feedbackType === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            SoundEffects.playTap();
                            setFeedbackType(t.id);
                          }}
                          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                            isSelected
                              ? 'border-[#FF7300] bg-[#FF7300]/15 text-white shadow-[0_0_12px_rgba(255,115,0,0.2)]'
                              : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                          }`}
                        >
                          <Icon size={18} className={isSelected ? 'text-[var(--ob-accent)]' : ''} />
                          <span className="text-[10px] font-bold leading-tight">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message Input */}
                <div>
                  <label htmlFor="feedback-message" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    {tr('Describe lo sucedido o tu propuesta', 'Describe what happened or your idea')}
                  </label>
                  <textarea
                    id="feedback-message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      feedbackType === 'bug'
                        ? tr('¿En qué pantalla estabas y qué sucedió al hacer clic?', 'Which screen were you on and what happened when you tapped?')
                        : feedbackType === 'feature'
                        ? tr('¿Qué herramienta o mecánica te gustaría tener en el T1GER?', 'What tool or feature would you like to see in T1GER?')
                        : tr('¿En qué podemos ayudarte?', 'How can we help you?')
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white placeholder:text-zinc-500 focus:border-[#FF7300] focus:outline-none focus:ring-1 focus:ring-[#FF7300] transition-colors resize-none leading-relaxed"
                    required
                  />
                  <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>{message.length}/1000</span>
                    <span>{tr('Respuesta en < 24h', 'Reply within 24h')}</span>
                  </div>
                </div>

                {/* System Diagnostics Info */}
                <div className="flex items-center justify-between rounded-xl border border-white/6 bg-white/[0.02] px-3 py-2 text-[10px] font-mono text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Smartphone size={13} className="text-zinc-500" />
                    <span>{platform.toUpperCase()} · {appVersion}</span>
                  </div>
                  <span className="text-emerald-400/90 font-bold">{tr('Diag OK', 'Diag OK')}</span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="t1ger-primary-button w-full uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{sending ? tr('Enviando...', 'Sending...') : tr('Enviar Reporte', 'Send Report')}</span>
                </button>

                {/* Alternative Direct Email Support */}
                <div className="text-center pt-1 border-t border-white/5">
                  <a
                    href={mailtoUrl}
                    className="inline-flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 hover:text-white underline"
                  >
                    <Mail size={12} />
                    <span>soporte@t1ger.app</span>
                  </a>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </dialog>
    </AnimatePresence>
  );
};
