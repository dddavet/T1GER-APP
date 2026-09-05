import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Crown, X } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { revenueCat } from '../services/revenueCatService';

export const PaywallModal: React.FC<{ isOpen: boolean; onClose: () => void; source?: string }> = ({ isOpen, onClose }) => {
  const { language } = useBrain();
  const { appUser } = useAuth();
  const ref = useRef<HTMLDialogElement>(null);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const tr = (es: string, en: string) => language === 'es' ? es : en;
  const active = Boolean(appUser?.isPro || appUser?.isFounder);
  useEffect(() => { if (isOpen) ref.current?.showModal(); }, [isOpen]);
  const restore = async () => {
    setLoading(true);
    try {
      if (appUser?.uid) await revenueCat.setAppUserId(appUser.uid);
      const result = await revenueCat.restore();
      setNotice(result.isPro ? tr('La tienda reconoce una compra. La activación en T1GER requiere sincronización del servidor; contacta con soporte.', 'The store recognizes a purchase. T1GER activation requires server synchronization; contact support.') : tr('No encontramos compras activas.', 'No active purchases found.'));
    } catch { setNotice(tr('La restauración no está disponible en este dispositivo o aún no está configurada.', 'Restore is unavailable on this device or is not configured yet.')); }
    finally { setLoading(false); }
  };
  if (!isOpen) return null;
  return createPortal(<dialog ref={ref} onCancel={event => { event.preventDefault(); onClose(); }} aria-labelledby="membership-title" className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-white/15 bg-[#121216] p-6 text-white backdrop:bg-black/80">
    <button onClick={onClose} aria-label={tr('Cerrar', 'Close')} className="t1ger-icon-button float-right"><X size={20} /></button>
    <Crown className="mt-3 text-orange-400" size={40} /><p className="mt-5 font-mono text-xs uppercase tracking-widest text-orange-300">T1GER PRO</p>
    <h2 id="membership-title" className="mt-2 text-3xl font-bold">{active ? tr('Tu acceso está activo.', 'Your access is active.') : tr('Hoy, empieza gratis.', 'Start for free today.')}</h2>
    <p className="mt-4 text-sm leading-relaxed text-zinc-400">{active ? tr('Tu membresía está guardada en tu perfil.', 'Your membership is saved to your profile.') : tr('Las compras se habilitarán cuando la tienda y la verificación de acceso estén listas. Mientras tanto, explora Inversiones y completa tus acciones sin suscripción.', 'Purchases will open when the store and access verification are ready. Meanwhile, explore Investing and complete your actions without a subscription.')}</p>
    <button onClick={onClose} className="t1ger-primary-button mt-6 w-full">{tr('Continuar aprendiendo', 'Keep learning')}</button>
    <button disabled={loading} onClick={() => void restore()} className="mt-3 min-h-11 w-full text-sm text-zinc-400 underline">{loading ? tr('Consultando…', 'Checking…') : tr('Restaurar una compra anterior', 'Restore a previous purchase')}</button>
    {notice && <p role="status" className="mt-3 text-sm text-orange-200">{notice}</p>}
  </dialog>, document.body);
};
