import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy, Eye, Mail, Send, Smartphone, Sparkles, X } from 'lucide-react';
import {
  renderOpportunityCostEmail,
  renderStreakRiskEmail,
  renderWeeklyDigestEmail,
  renderMissionFeedbackEmail,
} from '../services/emailTemplates';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHtml?: string;
}

type TemplateKey = 'opportunity' | 'streak' | 'weekly' | 'feedback';

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  initialHtml,
}) => {
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>('opportunity');
  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('mobile');
  const [copied, setCopied] = useState(false);
  const [sentStatus, setSentStatus] = useState<string | null>(null);

  const getTemplateHtml = (key: TemplateKey): string => {
    switch (key) {
      case 'opportunity':
        return renderOpportunityCostEmail({
          userName: 'David',
          dailyHours: 3.5,
          lostUSD: 52.5,
          streakCount: 7,
          topApp: 'TikTok e Instagram',
          compoundWealth10Years: 245000,
        });
      case 'streak':
        return renderStreakRiskEmail({
          userName: 'David',
          streakCount: 7,
          hoursLeft: 2,
        });
      case 'weekly':
        return renderWeeklyDigestEmail({
          userName: 'David',
          weeklyXP: 480,
          totalHoursSaved: 16.5,
          leagueRank: 1,
          leagueDivision: 'División Ámbar',
          topSkillLearned: 'Psicología del Dinero y Riesgo Asimétrico',
        });
      case 'feedback':
        return renderMissionFeedbackEmail({
          userName: 'David',
          missionTitle: 'Análisis de Activos vs Pasivos',
          xpEarned: 50,
          professorScore: 98,
          professorFeedback: 'Tu desglose de flujo de caja es quirúrgico. Identificaste correctamente el costo de oportunidad del capital inmovilizado.',
        });
    }
  };

  const htmlContent = initialHtml || getTemplateHtml(activeTemplate);

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTestEmail = () => {
    setSentStatus('¡Email transaccional simulado enviado a tu bandeja!');
    setTimeout(() => setSentStatus(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#09231F] shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--t1ger-orange)] text-[#09231F] font-bold">
                <Mail size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Previsualizador de Emails Transaccionales T1GER
                </h2>
                <p className="text-xs text-[#87A9A2]">
                  Templates HTML responsivos de alta retención para retención y racha
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-[#87A9A2] hover:bg-white/10 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 bg-black/20 px-6 py-3">
            {/* Template Selector Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: 'opportunity', label: '📱 Screen Time Alert' },
                { key: 'streak', label: '🔥 Racha en Riesgo' },
                { key: 'weekly', label: '🏆 Resumen Semanal' },
                { key: 'feedback', label: '🐅 Feedback Profesor' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTemplate(tab.key as TemplateKey)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeTemplate === tab.key
                      ? 'bg-[var(--t1ger-orange)] text-[#09231F] shadow-[0_2px_8px_rgba(255,115,0,0.3)]'
                      : 'bg-white/5 text-[#87A9A2] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* View Mode & Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeviceView(deviceView === 'mobile' ? 'desktop' : 'mobile')}
                className="flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#87A9A2] hover:bg-white/10 hover:text-white transition-colors"
              >
                <Smartphone size={14} />
                <span>{deviceView === 'mobile' ? 'Vista Móvil (400px)' : 'Vista Desktop'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#87A9A2] hover:bg-white/10 hover:text-white transition-colors"
              >
                {copied ? <Check size={14} className="text-[#78DDB0]" /> : <Copy size={14} />}
                <span>{copied ? 'HTML Copiado' : 'Copiar HTML'}</span>
              </button>

              <button
                onClick={handleSendTestEmail}
                className="flex items-center gap-1.5 rounded-xl bg-[#3FC78E] px-3.5 py-1.5 text-xs font-bold text-[#06241F] hover:bg-[#52D8A1] active:scale-95 transition-all shadow-[0_2px_8px_rgba(63,199,142,0.3)]"
              >
                <Send size={13} />
                <span>Enviar Test</span>
              </button>
            </div>
          </div>

          {/* Toast feedback */}
          {sentStatus && (
            <div className="bg-[#3FC78E] px-4 py-2 text-center text-xs font-bold text-[#06241F]">
              ✓ {sentStatus}
            </div>
          )}

          {/* Preview Container */}
          <div className="flex-1 overflow-y-auto bg-[#09090B] p-6 flex justify-center items-start">
            <div
              className={`w-full transition-all duration-300 ${
                deviceView === 'mobile' ? 'max-w-[420px]' : 'max-w-[620px]'
              }`}
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                <iframe
                  title="Email HTML Preview"
                  srcDoc={htmlContent}
                  className="w-full min-h-[600px] border-none bg-[#09090B]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
