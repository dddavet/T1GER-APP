import React, { useState } from 'react';
import { Bell, Bot, Check, ChevronRight, Download, Globe2, LogOut, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { downloadT1gerDataExport } from '../services/dataPortability';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsOfService } from './TermsOfService';

type LegalView = 'privacy' | 'terms' | null;

export const Profile = () => {
  const { appUser, updateAppUser, logout, deleteAccountAndData } = useAuth();
  const { language, setLanguage, brainState, learnStreak } = useBrain();
  const { stats, setActiveView } = useT1ger();
  const isEs = language === 'es';
  const [name, setName] = useState(appUser?.displayName || '');
  const [editingName, setEditingName] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [status, setStatus] = useState('');
  const [legalView, setLegalView] = useState<LegalView>(null);
  const notificationsEnabled = appUser?.notificationPreferences?.daily_reminder ?? false;

  const saveName = async () => {
    const cleanName = name.trim();
    if (cleanName.length < 2) return;
    await updateAppUser({ displayName: cleanName });
    setEditingName(false);
    setStatus(isEs ? 'Nombre actualizado.' : 'Name updated.');
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled && typeof Notification !== 'undefined') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(isEs ? 'El sistema no concedió permiso para notificaciones.' : 'Notification permission was not granted.');
        return;
      }
    }
    await updateAppUser({ notificationPreferences: { ...appUser?.notificationPreferences, daily_reminder: !notificationsEnabled, apply_reminder: !notificationsEnabled } });
    setStatus(isEs ? 'Preferencias guardadas.' : 'Preferences saved.');
  };

  const removeAccount = async () => {
    try {
      await deleteAccountAndData();
    } catch {
      setStatus(isEs ? 'No pudimos eliminar la cuenta. Vuelve a iniciar sesión e inténtalo de nuevo.' : 'We could not delete the account. Sign in again and retry.');
      setDeleteConfirm(false);
    }
  };

  if (legalView === 'privacy') return <PrivacyPolicy onBack={() => setLegalView(null)} />;
  if (legalView === 'terms') return <TermsOfService onBack={() => setLegalView(null)} />;

  return (
    <div className="space-y-5 pb-8 pt-5">
      <header className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.35rem] bg-[var(--t1ger-orange)] text-xl font-semibold text-[#102622]">
          {appUser?.photoURL ? <img src={appUser.photoURL} alt={`${appUser.displayName || 'T1GER'} profile`} className="h-full w-full object-cover" /> : (appUser?.displayName || 'T').charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="t1ger-kicker">{isEs ? 'Perfil Investing' : 'Investing profile'}</p>
          {editingName ? <div className="mt-2 flex gap-2"><input autoFocus value={name} onChange={event => setName(event.target.value)} className="t1ger-input min-w-0" /><button onClick={saveName} className="t1ger-icon-button"><Check size={18} /></button></div> : <button onClick={() => setEditingName(true)} className="mt-1 truncate text-left text-xl font-semibold text-white hover:text-[var(--t1ger-orange)]">{appUser?.displayName || (isEs ? 'Añadir nombre' : 'Add your name')}</button>}
          <p className="mt-1 truncate text-xs text-[#6F918A]">{appUser?.email || (isEs ? 'Perfil local de preview' : 'Local preview profile')}</p>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-2">
        {[{ value: appUser?.level || 1, label: isEs ? 'nivel' : 'level' }, { value: learnStreak, label: isEs ? 'racha' : 'streak' }, { value: stats.verifiedXP, label: 'vXP' }].map(item => <div key={item.label} className="rounded-[1.15rem] bg-[#0B2925] p-4 text-center"><span className="block font-mono text-lg font-semibold text-white">{item.value}</span><span className="mt-1 block text-[11px] text-[#6F918A]">{item.label}</span></div>)}
      </section>

      <section className="t1ger-panel overflow-hidden">
        <div className="border-b border-white/7 p-5"><p className="t1ger-kicker">{isEs ? 'Cuenta y experiencia' : 'Account and experience'}</p></div>
        <SettingRow icon={Globe2} title={isEs ? 'Idioma' : 'Language'} detail={language === 'es' ? 'Español' : 'English'} onClick={() => setLanguage(language === 'es' ? 'en' : 'es')} />
        <SettingRow icon={Bell} title={isEs ? 'Recordatorios' : 'Reminders'} detail={notificationsEnabled ? (isEs ? 'Activados' : 'Enabled') : (isEs ? 'Desactivados' : 'Disabled')} onClick={toggleNotifications} />
        <SettingRow icon={Bot} title={isEs ? 'Mentor T1GER' : 'T1GER mentor'} detail={isEs ? 'Guía de inversión' : 'Investing guidance'} onClick={() => setActiveView('coach')} />
        <SettingRow icon={ShieldCheck} title="T1GER Plus" detail={appUser?.isPro ? (isEs ? 'Activo' : 'Active') : (isEs ? 'Plan gratuito' : 'Free plan')} />
      </section>

      <section className="t1ger-panel overflow-hidden">
        <div className="border-b border-white/7 p-5"><p className="t1ger-kicker">{isEs ? 'Datos y privacidad' : 'Data and privacy'}</p></div>
        <SettingRow icon={Download} title={isEs ? 'Exportar mis datos' : 'Export my data'} detail="JSON" onClick={() => { downloadT1gerDataExport(appUser, brainState); setStatus(isEs ? 'Exportación creada.' : 'Export created.'); }} />
        <SettingRow icon={UserRound} title={isEs ? 'Política de privacidad' : 'Privacy policy'} onClick={() => setLegalView('privacy')} />
        <SettingRow icon={ShieldCheck} title={isEs ? 'Términos de servicio' : 'Terms of service'} onClick={() => setLegalView('terms')} />
      </section>

      {status && <p role="status" className="rounded-xl bg-white/[.04] p-3 text-center text-xs text-[#9DBAB4]">{status}</p>}

      <div className="grid grid-cols-2 gap-3">
        <button onClick={logout} className="t1ger-secondary-button"><LogOut size={17} />{isEs ? 'Salir' : 'Sign out'}</button>
        {!deleteConfirm ? <button onClick={() => setDeleteConfirm(true)} className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-[#E56A65]/25 bg-[#E56A65]/7 px-4 text-sm font-semibold text-[#F0AAA6]"><Trash2 size={17} />{isEs ? 'Eliminar' : 'Delete'}</button> : <button onClick={removeAccount} className="inline-flex min-h-13 items-center justify-center rounded-2xl bg-[#E56A65] px-4 text-sm font-semibold text-[#1F1918]">{isEs ? 'Confirmar' : 'Confirm delete'}</button>}
      </div>
      <p className="text-center text-[11px] text-[#496C64]">T1GER local preview · Investing foundation</p>
    </div>
  );
};

const SettingRow = ({ icon: Icon, title, detail, onClick }: { icon: any; title: string; detail?: string; onClick?: () => void }) => {
  const Component = onClick ? 'button' : 'div';
  return <Component onClick={onClick} className="flex w-full items-center gap-3 border-b border-white/6 px-5 py-4 text-left last:border-b-0"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[.045] text-[#7EA39B]"><Icon size={17} /></span><span className="flex-1 text-sm font-medium text-[#E2EFEC]">{title}</span>{detail && <span className="text-xs text-[#6F918A]">{detail}</span>}{onClick && <ChevronRight className="text-[#4F746C]" size={16} />}</Component>;
};
