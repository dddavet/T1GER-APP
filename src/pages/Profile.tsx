import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useT1ger } from '../contexts/T1gerContext';
import { useBrain } from '../contexts/BrainContext';
import { 
  User, Mail, Lock, Shield, Bell, Crown, RefreshCcw, 
  BookOpen, Target, HelpCircle, FileText, Scale, LogOut, 
  AlertTriangle, ChevronRight, Flame
} from 'lucide-react';
import { motion } from 'motion/react';
import { NotificationSettings } from '../components/NotificationSettings';

export const Profile = () => {
  const { appUser, updateAppUser, logout, deleteAccountAndData } = useAuth();
  const { language, brainState, resetBrain, selectTrack } = useBrain();
  const isEs = language === 'es';

  const [notificationModalOpen, setNotificationModalOpen] = useState(false);

  // Deriving variables
  const username = appUser?.displayName || 'T1GER Hunter';
  const handleName = username.toLowerCase().replace(/\s+/g, '_');
  const level = appUser?.level || 1;
  const streak = appUser?.streak || 0;
  const currentTopic = brainState.currentTrackId || 'investing';
  const isPro = appUser?.isPro || false;

  // Actions
  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAccount = async () => {
    const confirm1 = window.confirm(
      isEs 
        ? "⚠️ ALERTA: ¿Estás seguro de que deseas eliminar permanentemente tu cuenta?" 
        : "⚠️ ALERT: Are you sure you want to permanently delete your account?"
    );
    if (!confirm1) return;
    
    const confirm2 = window.confirm(
      isEs
        ? "⚠️ Confirmación final: Esta acción borrará todas tus misiones, nivel, XP y racha de forma irreversible."
        : "⚠️ Final Confirmation: This will irreversibly delete all missions, levels, XP, and streaks."
    );
    if (!confirm2) return;

    try {
      await deleteAccountAndData();
      alert(isEs ? "Tu cuenta ha sido eliminada." : "Your account has been deleted.");
    } catch (e) {
      console.error(e);
      alert("Error.");
    }
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 mt-6 px-4">
      {title}
    </h3>
  );

  const SettingsRow = ({ 
    icon: Icon, 
    label, 
    value, 
    onClick, 
    danger = false 
  }: { 
    icon: any, 
    label: string, 
    value?: string | React.ReactNode, 
    onClick?: () => void,
    danger?: boolean
  }) => (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-4 bg-white border-b border-zinc-100 last:border-b-0 ${onClick ? 'cursor-pointer active:bg-zinc-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${danger ? 'text-red-500' : 'text-[#009999]'}`} />
        <span className={`text-[15px] font-extrabold ${danger ? 'text-red-600' : 'text-zinc-800'}`}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm font-bold text-zinc-500">{value}</span>}
        {onClick && <ChevronRight className="w-5 h-5 text-zinc-300" />}
      </div>
    </div>
  );

  return (
    <div className="pb-28 bg-[#F7F7F9] min-h-screen font-sans text-zinc-900 select-none">
      
      {/* 1. PROFILE HEADER */}
      <div className="bg-white border-b-4 border-b-zinc-200 p-6 flex flex-col items-center justify-center space-y-3 sticky top-0 z-10 shadow-xs">
        <div className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-[#009999] shadow-sm overflow-hidden bg-teal-50 relative p-0.5">
          <img 
            src={appUser?.photoURL || '/tiger_3d_clay.jpg'} 
            alt={username} 
            className="w-full h-full object-cover rounded-full" 
          />
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900">
            {username}
          </h1>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-zinc-500 mt-1">
            <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5 text-[#FF7300]" /> Lvl {level}</span>
            <span>•</span>
            <span className="flex items-center gap-1 uppercase">{currentTopic}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#FF7300]"><Flame className="w-3.5 h-3.5" /> {streak}</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto pb-8">
        {/* 2. ACCOUNT */}
        <SectionHeader title={isEs ? 'Cuenta' : 'Account'} />
        <div className="bg-white border-2 border-zinc-200 rounded-3xl overflow-hidden shadow-xs">
          <SettingsRow 
            icon={User} 
            label={isEs ? 'Editar Perfil' : 'Edit Profile'} 
            value={`@${handleName}`}
            onClick={() => alert('WIP: Edit Profile')} 
          />
          <SettingsRow 
            icon={Mail} 
            label={isEs ? 'Correo Electrónico' : 'Email Address'} 
            value={appUser?.email}
            onClick={() => alert('WIP: Change Email')} 
          />
          <SettingsRow 
            icon={Lock} 
            label={isEs ? 'Contraseña' : 'Password'} 
            onClick={() => alert('WIP: Change Password')} 
          />
          <SettingsRow 
            icon={Shield} 
            label={isEs ? 'Seguridad' : 'Security'} 
            onClick={() => alert('WIP: Security')} 
          />
        </div>

        {/* 3. NOTIFICATIONS */}
        <SectionHeader title={isEs ? 'Notificaciones' : 'Notifications'} />
        <div className="bg-white border-2 border-zinc-200 rounded-3xl overflow-hidden shadow-xs">
          <SettingsRow 
            icon={Bell} 
            label={isEs ? 'Preferencias de Notificación' : 'Notification Preferences'} 
            onClick={() => setNotificationModalOpen(true)} 
          />
        </div>

        {/* 4. SUBSCRIPTION */}
        <SectionHeader title={isEs ? 'Suscripción' : 'Subscription'} />
        <div className="bg-white border-2 border-zinc-200 rounded-3xl overflow-hidden shadow-xs">
          <SettingsRow 
            icon={Crown} 
            label={isEs ? 'Plan Actual' : 'Current Plan'} 
            value={isPro 
              ? <span className="text-[#FF7300] flex items-center gap-1"><Crown className="w-4 h-4" /> PREMIUM</span> 
              : 'FREE'}
            onClick={() => alert('WIP: Manage Subscription')}
          />
          <SettingsRow 
            icon={RefreshCcw} 
            label={isEs ? 'Restaurar Compras' : 'Restore Purchases'} 
            onClick={() => alert('WIP: Restore')} 
          />
        </div>

        {/* 5. LEARNING */}
        <SectionHeader title={isEs ? 'Aprendizaje' : 'Learning'} />
        <div className="bg-white border-2 border-zinc-200 rounded-3xl overflow-hidden shadow-xs">
          <SettingsRow 
            icon={Target} 
            label={isEs ? 'Cambiar Tema Activo' : 'Change Active Topic'} 
            value={currentTopic.toUpperCase()}
            onClick={() => selectTrack(currentTopic === 'investing' ? 'business' : 'investing')} 
          />
          <SettingsRow 
            icon={BookOpen} 
            label={isEs ? 'Revisar Misiones de Acción' : 'Review Apply Missions'} 
            onClick={() => alert('WIP: Review')} 
          />
          <SettingsRow 
            icon={RefreshCcw} 
            label={isEs ? 'Reiniciar Progreso' : 'Reset Progress'} 
            onClick={() => {
              if (window.confirm(isEs ? '¿Reiniciar el cerebro a cero?' : 'Reset brain to zero?')) resetBrain();
            }} 
          />
        </div>

        {/* 6. SUPPORT & LEGAL */}
        <SectionHeader title={isEs ? 'Soporte y Legal' : 'Support & Legal'} />
        <div className="bg-white border-2 border-zinc-200 rounded-3xl overflow-hidden shadow-xs">
          <SettingsRow 
            icon={HelpCircle} 
            label={isEs ? 'Centro de Ayuda' : 'Help Center'} 
            onClick={() => alert('WIP: Help Center')} 
          />
          <SettingsRow 
            icon={FileText} 
            label={isEs ? 'Política de Privacidad' : 'Privacy Policy'} 
            onClick={() => alert('WIP: Privacy')} 
          />
          <SettingsRow 
            icon={Scale} 
            label={isEs ? 'Términos de Servicio' : 'Terms of Service'} 
            onClick={() => alert('WIP: TOS')} 
          />
        </div>

        {/* 7. ACCOUNT ACTIONS */}
        <SectionHeader title={isEs ? 'Acciones de Cuenta' : 'Account Actions'} />
        <div className="bg-white border-2 border-zinc-200 rounded-3xl overflow-hidden shadow-xs">
          <SettingsRow 
            icon={LogOut} 
            label={isEs ? 'Cerrar Sesión' : 'Log Out'} 
            onClick={handleLogout} 
          />
          <SettingsRow 
            icon={AlertTriangle} 
            label={isEs ? 'Eliminar Cuenta' : 'Delete Account'} 
            danger={true}
            onClick={handleDeleteAccount} 
          />
        </div>

        {/* 8. APP VERSION */}
        <div className="mt-8 text-center text-xs font-bold text-zinc-400">
          T1GER APP v2.0.4 (Build 492)
        </div>
      </div>

      <NotificationSettings 
        isOpen={notificationModalOpen} 
        onClose={() => setNotificationModalOpen(false)} 
      />
    </div>
  );
};
