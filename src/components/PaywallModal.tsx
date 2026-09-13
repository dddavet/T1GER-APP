import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Star, Zap, Crown, Shield, Sparkles, HeartHandshake, RefreshCw, Calendar, Bell, CheckCircle2 } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { fireConfetti } from './ui/confetti';
import { revenueCat } from '../services/revenueCatService';
import { Capacitor } from '@capacitor/core';
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
  const tr = (es: string, en: string) => isEs ? es : en;
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string>('$rc_annual');

  const isAlreadyPro = Boolean(appUser?.isPro || appUser?.isFounder);

  useEffect(() => {
    if (!isOpen) return;

    if (appUser?.uid) {
      void revenueCat.setAppUserId(appUser.uid);
    }

    void (async () => {
      try {
        const pkgs = await revenueCat.getDisplayPackages();
        setPackages(pkgs);
        if (pkgs.length > 0) {
          const annual = pkgs.find(p => p.identifier.includes('annual'));
          if (annual) setSelectedPkgId(annual.identifier);
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
      if (Capacitor.isNativePlatform()) {
        const result = await revenueCat.purchase(pkg);
        if (result.success && result.isPro) {
          fireConfetti();
          setPurchaseMessage(tr('¡Compra confirmada! Estatus Fundador y T1GER Pro activados.', 'Purchase confirmed! Founder and T1GER Pro status activated.'));
          if (updateAppUser) {
            await updateAppUser({ isPro: true, isFounder: pkg.identifier.includes('lifetime'), role: pkg.identifier.includes('lifetime') ? 'founder' : undefined });
          }
        }
      } else {
        // Web preview simulation
        await new Promise(r => setTimeout(r, 600));
        fireConfetti();
        setPurchaseMessage(tr('¡Modo de prueba web! T1GER Pro activado para tu sesión.', 'Web preview active! T1GER Pro unlocked for your session.'));
        if (updateAppUser) {
          await updateAppUser({ isPro: true, isFounder: pkg.identifier.includes('lifetime'), role: pkg.identifier.includes('lifetime') ? 'founder' : undefined });
        }
      }
    } catch (error: any) {
      if (error?.userCancelled) {
        setPurchaseMessage(tr('Compra cancelada.', 'Purchase cancelled.'));
      } else {
        setPurchaseMessage(tr('No se pudo completar la compra.', 'Purchase could not be completed.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    setPurchaseMessage('');
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await revenueCat.restore();
        if (result.isPro) {
          fireConfetti();
          setPurchaseMessage(tr('¡Compras restauradas con éxito!', 'Purchases restored successfully!'));
          if (updateAppUser) {
            await updateAppUser({ isPro: true, isFounder: true, role: 'founder' });
          }
        } else {
          setPurchaseMessage(tr('No encontramos compras anteriores activas.', 'No active past purchases found.'));
        }
      } else {
        fireConfetti();
        setPurchaseMessage(tr('Modo vista previa: compras sincronizadas.', 'Preview mode: purchases synced.'));
        if (updateAppUser) {
          await updateAppUser({ isPro: true, isFounder: true, role: 'founder' });
        }
      }
    } catch {
      setPurchaseMessage(tr('Error al restaurar compras.', 'Error restoring purchases.'));
    } finally {
      setLoading(false);
    }
  };

  const isAnnualTrial = selectedPkgId.includes('annual');

  const features = [
    { icon: Crown, text: tr('Insignia Permanente de Fundador & Acceso Total', 'Permanent Founder Badge & Full Access'), color: 'text-amber-400' },
    { icon: Zap, text: tr('Coach IA Ilimitado & 4 Rutas de Negocio', 'Unlimited AI Coach & 4 Business Tracks'), color: 'text-[#FF7300]' },
    { icon: Shield, text: tr('Protección de Racha Antideserción', 'Anti-Dropout Streak Protection'), color: 'text-emerald-400' },
    { icon: HeartHandshake, text: tr('10% de ingresos donado a conservación de tigres', '10% of revenue donated to tiger conservation'), color: 'text-cyan-400' },
    { icon: Star, text: tr('Garantía y seguridad de Google Play', 'Google Play security guarantee'), color: 'text-purple-400' },
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
            aria-label={tr('Cerrar', 'Close')}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Header Banner */}
          <div className="relative pt-6 pb-4 px-6 text-center border-b border-white/5 bg-gradient-to-b from-[#FF7300]/15 via-transparent to-transparent">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 font-mono text-[9px] font-extrabold uppercase tracking-widest mb-2">
              <Sparkles size={11} /> {tr('OFERTA DE LANZAMIENTO · 50% OFF', 'LAUNCH OFFER · 50% OFF')}
            </div>

            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-0.5">
              {isAlreadyPro ? tr('Eres Miembro Fundador', 'You are a Founder Member') : 'T1GER PRO & FOUNDER'}
            </h2>
            <p className="text-zinc-400 text-xs font-medium max-w-[280px] mx-auto">
              {isAlreadyPro
                ? tr('Tienes acceso prioritario y todos los beneficios activados.', 'You have priority access and all benefits active.')
                : tr('Construye tus competencias con el estándar de los mejores operadores.', 'Build your competencies with the standard of top operators.')}
            </p>
          </div>

          <div className="relative z-10 px-5 pb-6 space-y-4 overflow-y-auto max-h-[calc(94vh-140px)] hide-scrollbar">
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
                    <f.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-white font-bold text-xs leading-tight">{f.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Plan Selector */}
            {!isAlreadyPro && packages.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-1">
                  {tr('Selecciona tu membresía', 'Select your membership')}
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
                        className={`relative w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#FF7300]/15 border-[#FF7300] shadow-[0_0_15px_rgba(255,115,0,0.2)]' 
                            : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                        }`}
                      >
                        {isLifetime && (
                          <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-gradient-to-r from-amber-400 to-[#FF7300] text-black shadow">
                            {tr('Pase Fundador Vitalicio', 'Lifetime Founder Pass')}
                          </span>
                        )}
                        {isAnnual && (
                          <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500 text-black shadow">
                            {tr('7 Días Gratis + 50% OFF', '7 Days Free + 50% OFF')}
                          </span>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
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
                          <div className="text-right">
                            <span className="text-sm font-black text-white font-mono">{pkg.product.priceString}</span>
                            {isAnnual && <p className="text-[9px] font-mono text-emerald-400">~$4.99/mes</p>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Calm/Headspace Timeline if Annual */}
            {!isAlreadyPro && isAnnualTrial && (
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3.5 space-y-2">
                <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#FF9B4A]">
                  {tr('Cómo funciona tu prueba gratis', 'How your free trial works')}
                </p>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-start gap-2">
                    <Calendar size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-white">{tr('Hoy: $0.00 cobrados', 'Today: $0.00 charged')}</p>
                      <p className="text-[10px] text-zinc-400">{tr('Acceso instantáneo e ilimitado.', 'Instant unlimited access.')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Bell size={14} className="text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-white">{tr('Día 5: Recordatorio amigable', 'Day 5: Friendly reminder')}</p>
                      <p className="text-[10px] text-zinc-400">{tr('Te avisamos 2 días antes de que termine.', 'We notify you 2 days before it ends.')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-[#FF7300] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-white">{tr('Día 7: Comienza tu suscripción', 'Day 7: Subscription begins')}</p>
                      <p className="text-[10px] text-zinc-400">{tr('Cancela en cualquier momento con un clic en Google Play.', 'Cancel anytime with 1-click in Google Play.')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isAlreadyPro && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                <Crown className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-black uppercase text-emerald-400">{tr('Estado: Membresía Activa', 'Status: Active Membership')}</h4>
                  <p className="text-[11px] text-zinc-300 mt-0.5">{tr('Tu cuenta tiene acceso completo a T1GER Pro.', 'Your account has full access to T1GER Pro.')}</p>
                </div>
              </div>
            )}

            {/* Action CTA */}
            {!isAlreadyPro ? (
              <button
                type="button"
                onClick={handlePurchase}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF7300] to-[#FF9600] text-black font-black text-sm uppercase tracking-wider border-b-4 border-[#CC5C00] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,115,0,0.35)] cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : isAnnualTrial ? (
                  <>
                    <span>{tr('EMPEZAR MIS 7 DÍAS GRATIS', 'START MY 7-DAY FREE TRIAL')}</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>{tr('DESBLOQUEAR T1GER PRO AHORA', 'UNLOCK T1GER PRO NOW')}</span>
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
                {tr('Continuar entrenando', 'Continue Training')}
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
                  {tr('Restaurar compras anteriores', 'Restore previous purchases')}
                </button>
              </div>
            )}

            {/* Trust Footer */}
            <div className="flex flex-col items-center gap-1 pt-1 text-center">
              <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-mono">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>{tr('Procesado con máxima seguridad vía Google Play', 'Securely processed via Google Play')}</span>
              </div>
              <p className="text-[8px] text-zinc-600 font-mono">
                {tr('Cancela o administra tu suscripción en cualquier momento desde Google Play.', 'Cancel or manage your subscription anytime on Google Play.')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

