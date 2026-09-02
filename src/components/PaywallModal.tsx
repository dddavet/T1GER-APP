import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Star, Zap, Crown, Shield, RefreshCcw } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, source }) => {
  const { language } = useBrain();
  const isEs = language === 'es';
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState('');

  if (!isOpen) return null;

  // No fabricated prices or free-trial promises before store products are configured.
  if (import.meta.env.PROD) return (
    <div className="fixed inset-0 z-[300] grid place-items-center bg-black/85 p-5" role="dialog" aria-modal="true" aria-labelledby="plus-title">
      <section className="w-full max-w-sm space-y-5 rounded-3xl border border-white/10 bg-[#121216] p-6 text-white">
        <h2 id="plus-title" className="text-2xl font-bold">T1GER Plus</h2>
        <p className="text-sm leading-relaxed text-zinc-300">{isEs ? 'Las suscripciones todavía no están disponibles. Puedes continuar con el acceso gratuito. No se realizará ningún cobro.' : 'Subscriptions are not available yet. You can continue with free access. You will not be charged.'}</p>
        <button onClick={onClose} className="t1ger-primary-button w-full">{isEs ? 'Continuar aprendiendo' : 'Keep learning'}</button>
      </section>
    </div>
  );

  const features = [
    { icon: Zap, text: isEs ? 'Misiones ilimitadas' : 'Unlimited Missions', color: 'text-amber-400' },
    { icon: Shield, text: isEs ? 'Sin anuncios ni interrupciones' : 'No ads or interruptions', color: 'text-emerald-400' },
    { icon: Crown, text: isEs ? 'Planes de IA exclusivos' : 'Exclusive AI Plans', color: 'text-purple-400' },
    { icon: Star, text: isEs ? 'Rachas protegidas' : 'Protected Streaks', color: 'text-blue-400' },
  ];

  const handleSubscribe = () => {
    setPurchaseMessage(isEs
      ? 'Las compras están desactivadas en el preview local. No se realizó ningún cobro.'
      : 'Purchases are disabled in the local preview. No charge was made.');
  };

  const handleRestore = () => {
    setPurchaseMessage(isEs
      ? 'No hay compras asociadas a este preview local.'
      : 'No purchases are associated with this local preview.');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] bg-zinc-900/90 backdrop-blur-xl flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="bg-[#111111] rounded-[2.5rem] w-full max-w-sm relative shadow-2xl border border-zinc-800 overflow-hidden flex flex-col"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Holographic Header Background */}
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#FF7300]/30 via-purple-500/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 px-6 pt-10 pb-6 flex flex-col items-center text-center">
            {/* Super Icon */}
            <motion.div 
              animate={{ rotateY: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mb-4 bg-gradient-to-br from-[#FF7300] to-[#FFCA00] rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(255,115,0,0.5)] border border-white/20"
            >
              <span className="text-4xl">💎</span>
            </motion.div>

            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">
              Super <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7300] to-[#FFCA00]">T1GER</span>
            </h2>
            <p className="text-zinc-400 text-sm font-bold max-w-[240px]">
              {isEs ? 'Desata tu máximo potencial y aprende sin límites.' : 'Unleash your full potential and learn without limits.'}
            </p>
          </div>

          <div className="relative z-10 px-6 pb-6 space-y-6">
            {/* Features List */}
            <div className="space-y-4">
              {features.map((f, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="flex items-center gap-4"
                >
                  <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center ${f.color}`}>
                    <f.icon className="w-4 h-4" />
                  </div>
                  <span className="text-white font-extrabold text-[15px]">{f.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Plans */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              {/* Annual Plan */}
              <button
                onClick={() => setSelectedPlan('annual')}
                className={`relative p-4 rounded-2xl border-2 border-b-4 transition-all text-left flex flex-col ${
                  selectedPlan === 'annual' 
                    ? 'bg-[#FF7300]/10 border-[#FF7300]' 
                    : 'bg-white/5 border-zinc-700 border-b-zinc-800'
                }`}
              >
                {selectedPlan === 'annual' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF7300] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full whitespace-nowrap">
                    {isEs ? 'Mejor valor' : 'Best Value'}
                  </div>
                )}
                <span className={`text-xs font-black uppercase tracking-wider mb-1 ${selectedPlan === 'annual' ? 'text-[#FF7300]' : 'text-zinc-400'}`}>
                  {isEs ? '12 Meses' : '12 Months'}
                </span>
                <span className="text-xl font-black text-white">$83.99</span>
                <span className="text-[10px] text-zinc-500 font-bold mt-1">$6.99/mo</span>
              </button>

              {/* Monthly Plan */}
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`relative p-4 rounded-2xl border-2 border-b-4 transition-all text-left flex flex-col justify-end ${
                  selectedPlan === 'monthly' 
                    ? 'bg-[#FF7300]/10 border-[#FF7300]' 
                    : 'bg-white/5 border-zinc-700 border-b-zinc-800'
                }`}
              >
                <span className={`text-xs font-black uppercase tracking-wider mb-1 ${selectedPlan === 'monthly' ? 'text-[#FF7300]' : 'text-zinc-400'}`}>
                  {isEs ? '1 Mes' : '1 Month'}
                </span>
                <span className="text-xl font-black text-white">$12.99</span>
                <span className="text-[10px] text-zinc-500 font-bold mt-1">{isEs ? 'Facturado mensual' : 'Billed monthly'}</span>
              </button>
            </div>

            {/* CTA */}
            <button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF7300] to-[#FF9600] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#CC5C00] active:border-b-0 active:translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,115,0,0.4)] disabled:opacity-70"
            >
              {isProcessing ? (
                <RefreshCcw className="w-5 h-5 animate-spin" />
              ) : (
                isEs ? 'Probar 14 días gratis' : 'Start 14-Day Free Trial'
              )}
            </button>

            {purchaseMessage && (
              <p role="status" className="rounded-xl border border-[#EF7030]/25 bg-[#EF7030]/10 p-3 text-center text-xs leading-5 text-[#F4B08D]">
                {purchaseMessage}
              </p>
            )}

            {/* Restore Purchases */}
            <div className="flex flex-col items-center gap-2 pb-2">
              <p className="text-[9px] text-zinc-500 font-bold max-w-[280px] text-center">
                {isEs 
                  ? 'Plan se renueva automáticamente. Cancela en cualquier momento.'
                  : 'Plan auto-renews. Cancel anytime in your account settings.'
                }
              </p>
              <button onClick={handleRestore} className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider hover:text-white transition-colors">
                {isEs ? 'Restaurar Compras' : 'Restore Purchases'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
