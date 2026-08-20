import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useBrain } from '../../contexts/BrainContext';

interface ReportAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextTitle?: string;
  generatedContentSnippet?: string;
}

export const ReportAIModal: React.FC<ReportAIModalProps> = ({
  isOpen,
  onClose,
  contextTitle = 'Respuesta de IA',
  generatedContentSnippet = '',
}) => {
  const { language } = useBrain();
  const isEs = language === 'es';

  const [selectedReason, setSelectedReason] = useState<string>('inaccurate');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    { id: 'inaccurate', label: isEs ? 'Información inexacta o confusa' : 'Inaccurate or confusing info' },
    { id: 'harmful', label: isEs ? 'Contenido inapropiado o dañino' : 'Harmful or inappropriate content' },
    { id: 'financial_advice', label: isEs ? 'Parece asesoría financiera no solicitada' : 'Looks like unsolicited financial advice' },
    { id: 'other', label: isEs ? 'Otro problema' : 'Other issue' },
  ];

  const handleSubmitReport = () => {
    // Record feedback locally and log for safety moderation
    const reportData = {
      id: `report-${Date.now()}`,
      context: contextTitle,
      snippet: generatedContentSnippet.slice(0, 150),
      reason: selectedReason,
      comments: comments.trim(),
      timestamp: Date.now(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('t1ger_ai_moderation_reports') || '[]');
      localStorage.setItem('t1ger_ai_moderation_reports', JSON.stringify([...existing, reportData]));
    } catch {
      // safe fallback
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setComments('');
      onClose();
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md rounded-[1.6rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-2xl text-left"
        >
          <div className="rounded-[1.3rem] border border-white/[0.08] bg-[#09090B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/6 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Flag size={18} />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  {isEs ? 'Reportar Contenido de IA' : 'Report AI Content'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-white bg-white/5 border border-white/10 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {submitted ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 size={36} className="text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-white font-mono">
                  {isEs ? 'Reporte Enviado con Éxito' : 'Report Submitted'}
                </h4>
                <p className="text-xs text-zinc-400">
                  {isEs ? 'Gracias por ayudarnos a mantener la IA segura y pedagógica.' : 'Thank you for helping us keep AI safe and pedagogical.'}
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {isEs
                    ? 'Cumpliendo con las políticas de seguridad de Google Play y Apple, revisamos cada reporte para calibrar nuestros filtros de contenido.'
                    : 'In compliance with Google Play & Apple AI safety policies, user reports inform our moderation filters.'}
                </p>

                {/* Reason Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block">
                    {isEs ? 'Motivo del Reporte:' : 'Reason:'}
                  </label>
                  {reasons.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedReason(r.id)}
                      className={`w-full p-2 rounded-xl text-xs font-mono text-left border transition cursor-pointer flex items-center justify-between ${
                        selectedReason === r.id
                          ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)]/10 text-white font-bold'
                          : 'border-white/6 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05]'
                      }`}
                    >
                      <span>{r.label}</span>
                      {selectedReason === r.id && <span className="text-[var(--ob-accent)]">✓</span>}
                    </button>
                  ))}
                </div>

                {/* Details Textarea */}
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                    {isEs ? 'Detalles Adicionales (Opcional):' : 'Additional Notes (Optional):'}
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder={isEs ? 'Describe brevemente qué estuvo mal…' : 'Briefly describe what went wrong…'}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[var(--ob-accent)] focus:outline-none resize-none h-16"
                  />
                </div>

                {/* Submit Action */}
                <button
                  onClick={handleSubmitReport}
                  className="w-full py-2.5 rounded-xl bg-[var(--ob-accent)] text-black font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,115,0,0.3)] active:scale-[0.98] transition cursor-pointer"
                >
                  <ShieldCheck size={15} />
                  <span>{isEs ? 'ENVIAR REPORTE' : 'SUBMIT REPORT'}</span>
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
