import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, Bot, Check, ChevronRight, Download, Globe2, LogOut, ShieldCheck, Smartphone, Trash2, UserRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { downloadT1gerDataExport } from '../services/dataPortability';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsOfService } from './TermsOfService';
import { MascotGuide } from '../components/MascotGuide';
import { ScreenTimeFreedomModal } from '../components/ScreenTimeFreedomModal';
import { NotificationPermissionModal } from '../components/NotificationPermissionModal';
import { AndroidScreenTimeService } from '../services/androidScreenTimeService';

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
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [showScreenTimeModal, setShowScreenTimeModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const notificationsEnabled = appUser?.notificationPreferences?.daily_reminder ?? false;

  const saveName = async () => {
    const cleanName = name.trim();
    if (cleanName.length < 2) return;
    await updateAppUser({ displayName: cleanName });
    setEditingName(false);
    setStatus(isEs ? 'Nombre actualizado.' : 'Name updated.');
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      setShowPermissionModal(true);
    } else {
      await updateAppUser({
        notificationPreferences: {
          ...appUser?.notificationPreferences,
          daily_reminder: false,
          streak_risk: false,
          apply_reminder: false,
        },
      });
      setStatus(isEs ? 'Alertas desactivadas.' : 'Alerts disabled.');
    }
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
          <p className="t1ger-kicker">{isEs ? 'Perfil de inversión' : 'Investing profile'}</p>
          {editingName ? <div className="mt-2 flex gap-2"><input autoFocus value={name} onChange={event => setName(event.target.value)} className="t1ger-input min-w-0" /><button onClick={saveName} className="t1ger-icon-button"><Check size={18} /></button></div> : <button onClick={() => setEditingName(true)} className="mt-1 truncate text-left text-xl font-semibold text-white hover:text-[var(--t1ger-orange)]">{appUser?.displayName || (isEs ? 'Añadir nombre' : 'Add your name')}</button>}
          <p className="mt-1 truncate text-xs text-[#6F918A]">{appUser?.email || (isEs ? 'Perfil local de vista previa' : 'Local preview profile')}</p>
        </div>
      </header>

      <MascotGuide surface="profile" />

      <motion.section initial="hidden" animate="shown" variants={{ hidden: {}, shown: { transition: { staggerChildren: .045 } } }} className="grid grid-cols-3 gap-2">
        {[{ value: appUser?.level || 1, label: isEs ? 'nivel' : 'level' }, { value: learnStreak, label: isEs ? 'racha' : 'streak' }, { value: stats.verifiedXP, label: 'vXP' }].map(item => <motion.div key={item.label} variants={{ hidden: { opacity: 0, y: 10 }, shown: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 30 } } }} className="transform-gpu rounded-[1.15rem] bg-[#121216] border border-white/8 p-4 text-center"><span className="block font-mono text-lg font-semibold text-white">{item.value}</span><span className="mt-1 block text-[11px] text-zinc-400">{item.label}</span></motion.div>)}
      </motion.section>

      {/* Direct Wireless APK Download Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[var(--ob-accent)]/30 bg-[var(--ob-accent)]/[0.06] p-4 flex items-center justify-between gap-3 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ob-accent)] text-black">
            <Smartphone size={20} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wide">
              {isEs ? 'App Nativa para tu Celular' : 'Native Android App'}
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {isEs ? 'Descarga directa sin conectar cables' : 'Direct wireless APK download'}
            </p>
          </div>
        </div>
        <a
          href="https://github.com/dddavet/T1GER-APP/raw/codex/t1ger-onboarding-redesign/releases/t1ger.apk"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 rounded-xl bg-[var(--ob-accent)] text-black font-mono text-xs font-black tracking-wide flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer shrink-0"
        >
          <Download size={14} />
          <span>{isEs ? 'DESCARGAR' : 'DOWNLOAD'}</span>
        </a>
      </motion.div>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 31, delay: .08 }} className="t1ger-panel transform-gpu overflow-hidden">
        <div className="border-b border-white/7 p-5"><p className="t1ger-kicker">{isEs ? 'Cuenta y experiencia' : 'Account and experience'}</p></div>
        <SettingRow icon={Globe2} title={isEs ? 'Idioma de la app' : 'App language'} detail={language === 'es' ? 'Español' : 'English'} onClick={() => setLanguageMenuOpen(current => !current)} />
        <AnimatePresence initial={false}>
          {languageMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-white/6">
              <div className="grid grid-cols-2 gap-2 px-5 pb-4">
                {([['es', 'Español'], ['en', 'English']] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setLanguage(value); setLanguageMenuOpen(false); }}
                    aria-pressed={language === value}
                    className={`t1ger-tap-row flex min-h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold ${language === value ? 'border-[var(--t1ger-orange)]/45 bg-[var(--t1ger-orange)]/10 text-white' : 'border-white/7 bg-white/[.025] text-[#87A9A2]'}`}
                  >
                    {language === value && <Check size={15} />}{label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <SettingRow icon={Bell} title={isEs ? 'Recordatorios' : 'Reminders'} detail={notificationsEnabled ? (isEs ? 'Activados' : 'Enabled') : (isEs ? 'Desactivados' : 'Disabled')} onClick={toggleNotifications} />
        <SettingRow icon={Smartphone} title={isEs ? 'Redes vs Libertad' : 'Screen Time vs Wealth'} detail={isEs ? 'Calculadora' : 'Calculator'} onClick={() => setShowScreenTimeModal(true)} />
        <SettingRow icon={Bot} title={isEs ? 'Mentor T1GER' : 'T1GER mentor'} detail={isEs ? 'Guía de aprendizaje' : 'Learning guidance'} onClick={() => setActiveView('coach')} />
        <SettingRow icon={ShieldCheck} title="T1GER Plus" detail={appUser?.isPro ? (isEs ? 'Activo' : 'Active') : (isEs ? 'Plan gratuito' : 'Free plan')} />
        <SettingRow
          icon={UserRound}
          title={isEs ? 'Reiniciar Onboarding (Pruebas)' : 'Replay Onboarding (Testing)'}
          detail={isEs ? 'Probar 18 pasos' : 'Test 18 steps'}
          onClick={() => {
            localStorage.removeItem('t1ger_onboarding_draft_v2');
            updateAppUser({ onboardingComplete: false });
          }}
        />
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 31, delay: .12 }} className="t1ger-panel transform-gpu overflow-hidden">
        <div className="border-b border-white/7 p-5"><p className="t1ger-kicker">{isEs ? 'Datos y privacidad' : 'Data and privacy'}</p></div>
        <SettingRow icon={Download} title={isEs ? 'Exportar mis datos' : 'Export my data'} detail="JSON" onClick={() => { downloadT1gerDataExport(appUser, brainState); setStatus(isEs ? 'Exportación creada.' : 'Export created.'); }} />
        <SettingRow icon={UserRound} title={isEs ? 'Política de privacidad' : 'Privacy policy'} onClick={() => setLegalView('privacy')} />
        <SettingRow icon={ShieldCheck} title={isEs ? 'Términos de servicio' : 'Terms of service'} onClick={() => setLegalView('terms')} />
      </motion.section>

      <AnimatePresence initial={false}>
        {status && <motion.p role="status" initial={{ opacity: 0, y: -6, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4 }} className="rounded-xl bg-white/[.04] p-3 text-center text-xs text-[#9DBAB4]">{status}</motion.p>}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={logout} className="t1ger-secondary-button"><LogOut size={17} />{isEs ? 'Salir' : 'Sign out'}</button>
        {!deleteConfirm ? <button onClick={() => setDeleteConfirm(true)} className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-[#E56A65]/25 bg-[#E56A65]/7 px-4 text-sm font-semibold text-[#F0AAA6]"><Trash2 size={17} />{isEs ? 'Eliminar' : 'Delete'}</button> : <button onClick={removeAccount} className="inline-flex min-h-13 items-center justify-center rounded-2xl bg-[#E56A65] px-4 text-sm font-semibold text-[#1F1918]">{isEs ? 'Confirmar' : 'Confirm delete'}</button>}
      </div>
      <p className="text-center text-[11px] text-[#496C64]">{isEs ? 'Vista previa local de T1GER · Fundamentos de inversión' : 'T1GER local preview · Investing foundations'}</p>

      <ScreenTimeFreedomModal
        isOpen={showScreenTimeModal}
        onClose={() => setShowScreenTimeModal(false)}
      />

      <NotificationPermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onGranted={() => setStatus(isEs ? '¡Alertas de racha activadas!' : 'Streak alerts enabled!')}
      />
    </div>
  );
};

const SettingRow = ({ icon: Icon, title, detail, onClick }: { icon: any; title: string; detail?: string; onClick?: () => void }) => {
  const Component = onClick ? 'button' : 'div';
  return <Component onClick={onClick} className={`group flex w-full items-center gap-3 border-b border-white/6 px-5 py-4 text-left last:border-b-0 ${onClick ? 't1ger-tap-row hover:bg-white/[.025]' : ''}`}><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[.045] text-[#7EA39B] transition-colors duration-200 group-hover:bg-white/[.07] group-hover:text-[#A9C6C0]"><Icon size={17} /></span><span className="flex-1 text-sm font-medium text-[#E2EFEC]">{title}</span>{detail && <span className="text-xs text-[#6F918A]">{detail}</span>}{onClick && <ChevronRight className="text-[#4F746C] transition-transform duration-200 group-hover:translate-x-0.5" size={16} />}</Component>;
};
