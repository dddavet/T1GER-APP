import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Star, Zap, Crown, Shield, Sparkles, HeartHandshake, RefreshCw } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { fireConfetti } from './ui/confetti';
import { revenueCat } from '../services/revenueCatService';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, source }) => {
  const { language } = useBrain();
  const { appUser, updateAppUser } = useAuth();
  const isEs = language === 'es';
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string>('$rc_lifetime');

  const isAlreadyPro = Boolean(appUser?.isPro || appUser?.isFounder);

  useEffect(() => {
    if (!isOpen) return;

    if (appUser?.uid) {
      void revenueCat.setAppUserId(appUser.uid);
    }

    void (async () => {
      try {
        const pkgs = await revenueCat.getAvailablePackages();
        setPackages(pkgs);
        if (pkgs.length > 0) {
          const lifetime = pkgs.find(p => p.identifier.includes('lifetime'));
          if (lifetime) setSelectedPkgId(lifetime.identifier);
          else setSelectedPkgId(pkgs[0].identifier);
        }
      } catch (err) {
        console.warn('Failed loading packages:', err);
      }
    })();
  }, [isOpen, appUser?.uid]);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    const pkg = packages.find(p => p.identifier === selectedPkgId) || packages[0];
    if (!pkg) return;

    setLoading(true);
    setPurchaseMessage('');
    try {
      const result = await revenueCat.purchase(pkg);
      if (result.success && result.isPro) {
        fireConfetti();
        setPurchaseMessage(isEs 
          ? '¡Compra confirmada! Estatus Fundador y T1GER Pro activados.' 
          : 'Purchase confirmed! Founder and T1GER Pro status activated.');
        if (updateAppUser) {
          await updateAppUser({ isPro: true, isFounder: true, role: 'founder' });
        }
      }
    } catch (error: any) {
      if (error?.userCancelled) {
        setPurchaseMessage(isEs ? 'Compra cancelada.' : 'Purchase cancelled.');
      } else {
        setPurchaseMessage(isEs ? 'No se pudo completar la compra.' : 'Purchase could not be completed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    setPurchaseMessage('');
    try {
      const result = await revenueCat.restore();
      if (result.isPro) {
        fireConfetti();
        setPurchaseMessage(isEs ? '¡Compras restauradas con éxito!' : 'Purchases restored successfully!');
        if (updateAppUser) {
          await updateAppUser({ isPro: true, isFounder: true, role: 'founder' });
        }
      } else {
        setPurchaseMessage(isEs ? 'No encontramos compras anteriores activas.' : 'No active past purchases found.');
      }
    } catch {
      setPurchaseMessage(isEs ? 'Error al restaurar compras.' : 'Error restoring purchases.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Crown, text: isEs ? 'Insignia Permanente de Fundador' : 'Permanent Founder Badge', color: 'text-amber-400' },
    { icon: Zap, text: isEs ? 'Acceso Ilimitado a T1GER Pro e IA' : 'Unlimited T1GER Pro & AI Access', color: 'text-orange-400' },
    { icon: Shield, text: isEs ? 'Prioridad en la Beta de Google Play' : 'Priority Google Play Beta Access', color: 'text-emerald-400' },
    { icon: HeartHandshake, text: isEs ? '10% de ingresos donado a tigres salvajes' : '10% of revenue donated to wild tigers', color: 'text-cyan-400' },
    { icon: Star, text: isEs ? 'Garantía oficial de Google Play' : 'Google Play official guarantee', color: 'text-purple-400' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", bounce: 0.3 }}
          className="bg-[#111115] rounded-[2.5rem] w-full max-w-sm relative shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[94vh]"
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
          <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-[#FF7300]/25 via-amber-500/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 px-6 pt-9 pb-4 flex flex-col items-center text-center">
            <motion.div 
              animate={{ rotateY: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mb-3 bg-gradient-to-br from-[#FF7300] to-[#FFCA00] rounded-3xl flex items-center justify-center shadow-[0_0_35px_rgba(255,115,0,0.5)] border border-white/20"
            >
              <span className="text-3xl">💎</span>
            </motion.div>

            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase mb-0.5">
              {isAlreadyPro ? (isEs ? 'Eres Miembro Fundador' : 'You are a Founder Member') : 'T1GER Founder Access'}
            </h2>
            <p className="text-zinc-400 text-[11px] font-semibold max-w-[280px]">
              {isAlreadyPro
                ? (isEs ? 'Tienes acceso prioritario y todos los beneficios activados.' : 'You have priority access and all benefits active.')
                : (isEs ? 'Elige tu plan y entrena con disciplina de nivel élite.' : 'Choose your plan and train with elite discipline.')}
            </p>
          </div>

          <div className="relative z-10 px-6 pb-6 space-y-4 overflow-y-auto max-h-[calc(94vh-160px)] hide-scrollbar">
            {/* Features List */}
            <div className="space-y-2 bg-white/[0.03] p-3.5 rounded-2xl border border-white/5">
              {features.map((f, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  key={i} 
                  className="flex items-center gap-2.5"
                >
                  <div className={`w-6 h-6 shrink-0 rounded-lg bg-white/5 flex items-center justify-center ${f.color}`}>
                    <f.icon className="w-3 h-3" />
                  </div>
                  <span className="text-white font-bold text-[11px] leading-tight">{f.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Plan Selector */}
            {!isAlreadyPro && packages.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-1">
                  {isEs ? 'Selecciona tu acceso' : 'Select your access'}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {packages.map(pkg => {
                    const isSelected = selectedPkgId === pkg.identifier;
                    const isLifetime = pkg.identifier.includes('lifetime');
                    const isAnnual = pkg.identifier.includes('annual');

                    return (
                      <button
                        key={pkg.identifier}
                        type="button"
                        onClick={() => setSelectedPkgId(pkg.identifier)}
                        className={`relative w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#FF7300]/15 border-[#FF7300] shadow-[0_0_15px_rgba(255,115,0,0.2)]' 
                            : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                        }`}
                      >
                        {isLifetime && (
                          <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-gradient-to-r from-amber-400 to-[#FF7300] text-black shadow">
                            {isEs ? 'Pase Vitalicio Único' : 'Lifetime Access'}
                          </span>
                        )}
                        {isAnnual && (
                          <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500 text-black shadow">
                            {isEs ? 'Mejor Valor (-50%)' : 'Best Value (-50%)'}
                          </span>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#FF7300] bg-[#FF7300]' : 'border-zinc-500'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 text-black" />}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-white">{pkg.product.title}</h4>
                              <p className="text-[10px] text-zinc-400">{pkg.product.description}</p>
                            </div>
                          </div>
                          <span className="text-sm font-black text-white font-mono">{pkg.product.priceString}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {isAlreadyPro && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                <Crown className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-black uppercase text-emerald-400">{isEs ? 'Estado: Activo' : 'Status: Active'}</h4>
                  <p className="text-[11px] text-zinc-300 mt-0.5">{isEs ? 'Tu membresía Fundador está activa en esta cuenta.' : 'Your Founder membership is active on this account.'}</p>
                </div>
              </div>
            )}

            {/* Action CTA */}
            {!isAlreadyPro ? (
              <button
                type="button"
                onClick={handlePurchase}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF7300] to-[#FF9600] text-black font-black text-sm uppercase tracking-wider border-b-4 border-[#CC5C00] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,115,0,0.35)] cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isEs ? 'Continuar con Google Play' : 'Continue with Google Play'}</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="t1ger-primary-button w-full"
              >
                {isEs ? 'Continuar entrenando' : 'Continue Training'}
              </button>
            )}

            {purchaseMessage && (
              <p role="status" className="rounded-xl border border-[#EF7030]/25 bg-[#EF7030]/10 p-2.5 text-center text-xs leading-5 text-[#F4B08D]">
                {purchaseMessage}
              </p>
            )}

            {/* Restore button */}
            {!isAlreadyPro && (
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={loading}
                  className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:text-zinc-200 transition-colors underline cursor-pointer"
                >
                  {isEs ? 'Restaurar compras anteriores' : 'Restore previous purchases'}
                </button>
              </div>
            )}

            {/* Trust Footer */}
            <div className="flex flex-col items-center gap-1 pt-1 text-center">
              <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-mono">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>{isEs ? 'Procesado de forma segura vía Google Play Store' : 'Securely processed via Google Play Store'}</span>
              </div>
              <p className="text-[8px] text-zinc-600 font-mono">
                {isEs ? 'Cancela o administra tu suscripción en cualquier momento desde Google Play.' : 'Cancel or manage your subscription anytime on Google Play.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
