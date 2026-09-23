import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Sparkles, Zap, Crown, CheckCircle2, ArrowRight } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { SoundEffects } from '../services/soundEffects';
import { T1gerMascot3D } from './T1gerMascot3D';
import { Capacitor } from '@capacitor/core';
import { revenueCat, CHECKOUT_ENABLED } from '../services/revenueCatService';
import { TermsOfService } from '../pages/TermsOfService';
import { PrivacyPolicy } from '../pages/PrivacyPolicy';

interface MentorPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MentorPaywallModal: React.FC<MentorPaywallModalProps> = ({ isOpen, onClose }) => {
  const { language } = useBrain();
  const { appUser } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isEs = language === 'es';
  const tr = (es: string, en: string) => (isEs ? es : en);

  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showingLegal, setShowingLegal] = useState<'terms' | 'privacy' | null>(null);

  const platform = Capacitor.getPlatform();
  const storeName = platform === 'ios' ? 'App Store' : 'Google Play';

  useEffect(() => {
    const el = dialogRef.current;
    if (isOpen) {
      SoundEffects.playTap();
      if (el && !el.open) el.showModal();
    } else {
      if (el?.open) el.close();
    }
    return () => {
      if (el?.open) el.close();
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        SoundEffects.playTap();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectPlan = (plan: 'annual' | 'monthly') => {
    SoundEffects.playTap();
    setSelectedPlan(plan);
  };

  const handleAction = async () => {
    SoundEffects.playTap();
    if (!CHECKOUT_ENABLED) {
      setPurchaseStatus(
        tr(
          'Las compras directas en web se habilitarán con la versión oficial de la tienda. Plan seleccionado: ' + (selectedPlan === 'annual' ? '$50/año' : '$4.99/mes'),
          'Direct web purchases will be enabled with the official store release. Selected plan: ' + (selectedPlan === 'annual' ? '$50/yr' : '$4.99/mo')
        )
      );
      return;
    }

    setLoading(true);
    setPurchaseStatus(null);
    try {
      if (Capacitor.isNativePlatform()) {
        const packages = await revenueCat.getAvailablePackages();
        const pkg = packages.find(p => selectedPlan === 'annual' ? p.identifier.includes('annual') : p.identifier.includes('monthly')) || packages[0];
        if (pkg) {
          const result = await revenueCat.purchase(pkg);
          if (result.success && result.isPro) {
            setPurchaseStatus(tr('¡Membresía activada con éxito!', 'Membership successfully activated!'));
            setTimeout(() => onClose(), 1500);
          }
        }
      }
    } catch {
      setPurchaseStatus(tr('Error al conectar con la pasarela de pago.', 'Could not connect to payment gateway.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    SoundEffects.playTap();
    setLoading(true);
    setPurchaseStatus(null);
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await revenueCat.restore();
        if (result.isPro) {
          setPurchaseStatus(tr('¡Compras anteriores restauradas con éxito!', 'Previous purchases successfully restored!'));
          setTimeout(() => onClose(), 1500);
        } else {
          setPurchaseStatus(tr('No encontramos compras anteriores activas.', 'No active past purchases found.'));
        }
      } else {
        setPurchaseStatus(tr('Restaura desde la tienda oficial de tu dispositivo.', 'Restore from your device official store.'));
      }
    } catch {
      setPurchaseStatus(tr('Error al restaurar compras.', 'Error restoring purchases.'));
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      image: '/t1ger-avatar.png',
      title: tr('Mentor T1GER 24/7 Ilimitado', 'Unlimited 24/7 T1GER Mentor'),
      desc: tr('Consultas estratégicas profundas sin esperas ni límites de mensajes.', 'Deep strategic advice without message caps or waiting.'),
      color: 'text-[#FF8A2A]',
    },
    {
      icon: Zap,
      title: tr('Feedback Táctico de Negocios e Inversión', 'Tactical Business & Investment Feedback'),
      desc: tr('Auditoría en tiempo real de tus ofertas, cálculos de capital y decisiones.', 'Real-time teardowns of your offers, capital math, and decisions.'),
      color: 'text-amber-400',
    },
    {
      icon: Crown,
      title: tr('Insignia VIP & Acceso a Todos los Dominios', 'VIP Badge & All-Domain Unlocks'),
      desc: tr('Desbloquea las 35 lecciones y herramientas de todas las disciplinas.', 'Unlock all 35 lessons and interactive labs across all disciplines.'),
      color: 'text-purple-400',
    },
  ];

  return (
    <AnimatePresence>
      <dialog
        ref={dialogRef}
        aria-label={tr('Mentor T1GER Pro', 'T1GER AI Mentor Pro')}
        onCancel={onClose}
        onClick={(e) => {
          if (e.target === dialogRef.current) onClose();
        }}
        className="fixed inset-0 z-[300] m-0 h-dvh max-h-none w-screen max-w-none bg-black/85 backdrop-blur-xl p-4 open:flex items-center justify-center select-none cursor-default"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#111116] shadow-2xl max-h-[94vh]"
        >
          {/* Close Button with min 44px touch target */}
          <button
            type="button"
            onPointerDown={() => SoundEffects.playTap()}
            onClick={onClose}
            aria-label={tr('Cerrar', 'Close')}
            className="absolute top-4 right-4 z-30 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/10 text-zinc-400 hover:bg-white/20 hover:text-white transition-all duration-100 ease-out cursor-pointer active:scale-90"
          >
            <X size={18} />
          </button>

          {showingLegal === 'terms' ? (
            <div className="p-4 overflow-y-auto max-h-[90vh]">
              <TermsOfService onBack={() => setShowingLegal(null)} />
            </div>
          ) : showingLegal === 'privacy' ? (
            <div className="p-4 overflow-y-auto max-h-[90vh]">
              <PrivacyPolicy onBack={() => setShowingLegal(null)} />
            </div>
          ) : (
            <>
          {/* Ambient Glow Background */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-[#FF7300]/20 blur-3xl" />

          {/* Header */}
          <div className="relative z-10 px-6 pt-7 pb-4 text-center border-b border-white/5">
            {/* 3D Mascot Avatar */}
            <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center">
              <T1gerMascot3D mood="beast" closeUp className="h-full w-full" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider text-amber-300">
              <Sparkles size={11} />
              {tr('MENTOR VIP · T1GER PRO', 'VIP MENTOR · T1GER PRO')}
            </div>

            <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
              {tr('Tu Mentor Estratégico 24/7', 'Your 24/7 Strategic Mentor')}
            </h2>
            <p className="mt-1 text-xs text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
              {tr(
                'Entrenamiento personalizado, revisión de ofertas y decisiones de inversión con el estándar de los mejores operadores.',
                'Personalized training, offer feedback, and investment decisions held to top operator standards.'
              )}
            </p>
          </div>

          {/* Content Body */}
          <div className="relative z-10 px-5 py-4 space-y-4 overflow-y-auto max-h-[calc(94vh-180px)]">
            {/* Features List */}
            <div className="space-y-2 rounded-2xl border border-white/6 bg-white/[0.025] p-3">
              {features.map((item, idx) => {
                const Icon = 'icon' in item ? item.icon : null;
                return (
                  <div key={idx} className="flex items-start gap-2.5 py-1">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5 ${item.color}`}>
                      {item.image ? (
                        <img src={item.image} alt="T1GER" className="h-4 w-4 object-contain" />
                      ) : Icon ? (
                        <Icon size={14} />
                      ) : null}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{item.title}</h4>
                      <p className="text-[10.5px] text-zinc-400 leading-snug mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pricing Options Cards */}
            <div className="space-y-2.5">
              <p className="px-1 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                {tr('Elige tu plan de acceso', 'Choose your access plan')}
              </p>

              {/* Annual Plan Card */}
              <button
                type="button"
                onPointerDown={() => SoundEffects.playTap()}
                onClick={() => handleSelectPlan('annual')}
                className={`relative w-full rounded-2xl border p-3.5 text-left transition-all duration-100 ease-out cursor-pointer active:scale-[0.98] active:translate-y-0.5 ${
                  selectedPlan === 'annual'
                    ? 'border-white/20 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_16px_rgba(0,0,0,0.4)]'
                    : 'border-white/10 bg-white/[0.025] hover:border-white/20'
                }`}
              >
                {/* Discount Ribbon */}
                <span className="absolute -top-2.5 right-3 rounded-full bg-[var(--ob-accent)] px-2 py-0.5 text-[9px] font-mono font-black uppercase text-black shadow-md">
                  {tr('AHORRA 17% · 2 MESES GRATIS', 'SAVE 17% · 2 MONTHS FREE')}
                </span>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        selectedPlan === 'annual' ? 'border-[#FF7300] bg-[#FF7300]' : 'border-zinc-500'
                      }`}
                    >
                      {selectedPlan === 'annual' && <Check className="h-2.5 w-2.5 text-black" />}
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">{tr('Plan Anual', 'Annual Plan')}</h3>
                      <p className="text-[10px] text-zinc-400">{tr('Facturación anual de $50.00', 'Billed annually at $50.00')}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-base font-black text-white">$50.00<span className="text-[10px] font-normal text-zinc-400">{tr('/año', '/yr')}</span></div>
                    <div className="font-mono text-[9px] font-bold text-emerald-400">~$4.17{tr('/mes', '/mo')}</div>
                  </div>
                </div>
              </button>

              {/* Monthly Plan Card */}
              <button
                type="button"
                onPointerDown={() => SoundEffects.playTap()}
                onClick={() => handleSelectPlan('monthly')}
                className={`relative w-full rounded-2xl border p-3.5 text-left transition-all duration-100 ease-out cursor-pointer active:scale-[0.98] active:translate-y-0.5 ${
                  selectedPlan === 'monthly'
                    ? 'border-white/20 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_16px_rgba(0,0,0,0.4)]'
                    : 'border-white/10 bg-white/[0.025] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        selectedPlan === 'monthly' ? 'border-[#FF7300] bg-[#FF7300]' : 'border-zinc-500'
                      }`}
                    >
                      {selectedPlan === 'monthly' && <Check className="h-2.5 w-2.5 text-black" />}
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">{tr('Plan Mensual', 'Monthly Plan')}</h3>
                      <p className="text-[10px] text-zinc-400">{tr('Cancela en cualquier momento', 'Cancel anytime with one click')}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-base font-black text-white">$4.99<span className="text-[10px] font-normal text-zinc-400">{tr('/mes', '/mo')}</span></div>
                    <div className="font-mono text-[9px] text-zinc-500">{tr('Facturación mensual', 'Monthly billing')}</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onPointerDown={() => SoundEffects.playTap()}
              onClick={handleAction}
              disabled={loading}
              className="t1ger-primary-button w-full cursor-pointer select-none text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>
                {selectedPlan === 'annual'
                  ? tr('ACTIVAR PLAN ANUAL ($50/AÑO)', 'ACTIVATE ANNUAL PLAN ($50/YR)')
                  : tr('ACTIVAR PLAN MENSUAL ($4.99/MES)', 'ACTIVATE MONTHLY PLAN ($4.99/MO)')}
              </span>
              <ArrowRight size={15} />
            </button>

            {purchaseStatus && (
              <p role="status" className="rounded-xl border border-orange-500/25 bg-orange-500/10 p-2.5 text-center text-xs leading-relaxed text-orange-200">
                {purchaseStatus}
              </p>
            )}

            {/* Restore button */}
            <div className="text-center pt-0.5">
              <button
                type="button"
                onClick={handleRestore}
                disabled={loading}
                className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:text-zinc-200 transition-colors underline cursor-pointer"
              >
                {tr('Restaurar compras anteriores', 'Restore previous purchases')}
              </button>
            </div>

            {/* Footer Assurance & Compliance */}
            <div className="space-y-1.5 pt-1 text-center">
              <p className="font-mono text-[8.5px] text-zinc-500 leading-tight px-1">
                {tr(
                  `La suscripción se renueva automáticamente a menos que se cancele al menos 24 horas antes del final del periodo. Gestiona tu suscripción en cualquier momento en los ajustes de tu cuenta de ${storeName}.`,
                  `Subscription automatically renews unless cancelled at least 24 hours before period ends. Manage anytime in ${storeName} account settings.`
                )}
              </p>
              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 font-mono">
                <button
                  type="button"
                  onClick={() => setShowingLegal('terms')}
                  className="hover:text-white underline cursor-pointer"
                >
                  {tr('Términos & EULA', 'Terms & EULA')}
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setShowingLegal('privacy')}
                  className="hover:text-white underline cursor-pointer"
                >
                  {tr('Privacidad', 'Privacy')}
                </button>
              </div>
            </div>
          </div>
          </>
          )}
        </motion.div>
      </dialog>
    </AnimatePresence>
  );
};
