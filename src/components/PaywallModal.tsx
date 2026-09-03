import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Star, Zap, Crown, Shield, ExternalLink, Sparkles, HeartHandshake } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { fireConfetti } from './ui/confetti';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/fZueVeaebe5T5pvdpQaZi01';

export const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, source }) => {
  const { language } = useBrain();
  const { appUser, updateAppUser } = useAuth();
  const isEs = language === 'es';
  const [purchaseMessage, setPurchaseMessage] = useState('');

  const isAlreadyPro = Boolean(appUser?.isPro || appUser?.isFounder);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('stripe') === 'success' || params.get('payment') === 'success') {
      fireConfetti();
      setPurchaseMessage(isEs 
        ? '¡Pago confirmado! Gracias por apoyar a T1GER y la conservación del tigre salvaje.'
        : 'Payment confirmed! Thank you for supporting T1GER and wild tiger conservation.');
      if (updateAppUser && !appUser?.isFounder) {
        void updateAppUser({ isPro: true, isFounder: true, role: 'founder' });
      }
    }
  }, [appUser?.isFounder, isEs, updateAppUser]);

  if (!isOpen) return null;

  const handleOpenStripe = () => {
    const url = new URL(STRIPE_PAYMENT_LINK);
    if (appUser?.uid) {
      url.searchParams.set('client_reference_id', appUser.uid);
    }
    if (appUser?.email) {
      url.searchParams.set('prefilled_email', appUser.email);
    }

    // Open Stripe Hosted Checkout
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
    
    setPurchaseMessage(isEs
      ? 'Completando pago seguro en Stripe. Al terminar, tu cuenta se activará automáticamente.'
      : 'Completing secure payment on Stripe. Your account will activate upon completion.');
  };

  const features = [
    { icon: Crown, text: isEs ? 'Insignia Permanente de Fundador' : 'Permanent Founder Badge', color: 'text-amber-400' },
    { icon: Zap, text: isEs ? '6 Meses de T1GER Pro Gratis ($60 valor)' : '6 Months T1GER Pro Free ($60 value)', color: 'text-orange-400' },
    { icon: Shield, text: isEs ? 'Prioridad en Acceso Beta Cerrada' : 'Priority Closed Beta Access', color: 'text-emerald-400' },
    { icon: HeartHandshake, text: isEs ? '100% del extra donado a conservación de tigres' : '100% of extra amount donated to wild tigers', color: 'text-cyan-400' },
    { icon: Star, text: isEs ? 'Garantía de reembolso 100%' : '100% Money-back guarantee', color: 'text-purple-400' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", bounce: 0.3 }}
          className="bg-[#111115] rounded-[2.5rem] w-full max-w-sm relative shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label={isEs ? 'Cerrar' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Glowing Header Gradient */}
          <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#FF7300]/25 via-amber-500/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 px-6 pt-10 pb-6 flex flex-col items-center text-center">
            {/* Super Icon */}
            <motion.div 
              animate={{ rotateY: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mb-4 bg-gradient-to-br from-[#FF7300] to-[#FFCA00] rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(255,115,0,0.5)] border border-white/20"
            >
              <span className="text-4xl">💎</span>
            </motion.div>

            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-1">
              {isAlreadyPro ? (isEs ? 'Eres Miembro Fundador' : 'You are a Founder Member') : 'T1GER Founder Access'}
            </h2>
            <p className="text-zinc-400 text-xs font-semibold max-w-[280px]">
              {isAlreadyPro
                ? (isEs ? 'Tienes acceso prioritario y 6 meses de T1GER Pro activados.' : 'You have priority access and 6 months of T1GER Pro active.')
                : (isEs ? 'Invierte en tu disciplina y apoya la conservación real del tigre salvaje.' : 'Invest in your discipline and support wild tiger conservation.')}
            </p>
          </div>

          <div className="relative z-10 px-6 pb-6 space-y-5 overflow-y-auto max-h-[calc(92vh-180px)] hide-scrollbar">
            {/* Features List */}
            <div className="space-y-3 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
              {features.map((f, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={i} 
                  className="flex items-center gap-3"
                >
                  <div className={`w-7 h-7 shrink-0 rounded-xl bg-white/5 flex items-center justify-center ${f.color}`}>
                    <f.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-white font-bold text-xs leading-snug">{f.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Offer Card */}
            {!isAlreadyPro ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FF7300]/10 to-amber-500/5 border border-[#FF7300]/30 flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-black uppercase text-[#FF7300] tracking-wider">
                    {isEs ? 'Aportación Base' : 'Base Support'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">$5.00</span>
                    <span className="text-[11px] text-zinc-400 font-mono">USD</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  {isEs 
                    ? 'Elige pagar el mínimo de $5 o aportar más en Stripe. El 100% de cualquier monto extra va directo a la conservación del tigre salvaje.'
                    : 'Choose $5 base or contribute more on Stripe. 100% of any extra amount goes directly to wild tiger conservation.'}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                <Crown className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-black uppercase text-emerald-400">{isEs ? 'Estado: Activo' : 'Status: Active'}</h4>
                  <p className="text-[11px] text-zinc-300 mt-0.5">{isEs ? 'Tu insignia y beneficios están vinculados a tu cuenta.' : 'Your badge and benefits are active on your account.'}</p>
                </div>
              </div>
            )}

            {/* CTA */}
            {!isAlreadyPro ? (
              <button
                onClick={handleOpenStripe}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF7300] to-[#FF9600] text-black font-black text-sm uppercase tracking-wider border-b-4 border-[#CC5C00] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,115,0,0.35)] cursor-pointer"
              >
                <span>{isEs ? 'Unirme en Stripe ($5+)' : 'Join via Stripe ($5+)'}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="t1ger-primary-button w-full"
              >
                {isEs ? 'Continuar entrenando' : 'Continue Training'}
              </button>
            )}

            {purchaseMessage && (
              <p role="status" className="rounded-xl border border-[#EF7030]/25 bg-[#EF7030]/10 p-3 text-center text-xs leading-5 text-[#F4B08D]">
                {purchaseMessage}
              </p>
            )}

            {/* Trust Footer */}
            <div className="flex flex-col items-center gap-1.5 pt-1 text-center">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>{isEs ? 'Checkout cifrado SSL de 256 bits vía Stripe' : '256-bit SSL encrypted checkout via Stripe'}</span>
              </div>
              <p className="text-[9px] text-zinc-500 font-mono">
                {isEs ? 'Garantía incondicional de devolución durante los primeros 30 días.' : 'Unconditional 30-day money back guarantee.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
