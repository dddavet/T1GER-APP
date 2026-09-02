import React from 'react';
import { ShieldCheck, Lock, ArrowLeft, FileText, CheckCircle2, Trash2, Smartphone } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  const { language } = useBrain();
  const isEs = language === 'es';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-20 pt-2 font-sans select-none text-left">
      {/* 1. Header Bar with Double-Bezel */}
      <div className="rounded-[1.6rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-[0_20px_45px_rgba(0,0,0,0.6)]">
        <div className="rounded-[1.3rem] border border-white/[0.08] bg-[#09090B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition cursor-pointer border border-white/10 active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="w-10 h-10 rounded-xl bg-[var(--ob-accent)]/15 border border-[var(--ob-accent)]/30 flex items-center justify-center text-[var(--ob-accent)]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {isEs ? 'Política de Privacidad' : 'Privacy Policy'}
                </h1>
                <p className="text-[10px] font-mono text-zinc-400">
                  T1GER APP · {isEs ? 'Vigente: 2026' : 'Effective: 2026'}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-wider border border-emerald-500/30">
              {isEs ? 'BETA' : 'BETA'}
            </span>
          </div>

          <div className="mt-3.5 p-3 rounded-xl bg-white/[0.03] border border-white/6 text-xs text-zinc-300 leading-relaxed">
            {isEs
              ? 'Esta versión de prueba describe cómo T1GER trata los datos. Antes del lanzamiento público deben confirmarse el responsable legal, su contacto, los plazos de conservación y las condiciones de los proveedores.'
              : 'This beta describes how T1GER handles data. Before public launch, the legal operator, contact details, retention periods and provider terms must be confirmed.'}
          </div>
        </div>
      </div>

      {/* 2. Data Categories & Usage */}
      <div className="rounded-[1.6rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-xl">
        <div className="rounded-[1.3rem] border border-white/[0.08] bg-[#09090B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-4">
          <div className="flex items-center gap-2 border-b border-white/6 pb-2">
            <FileText size={15} className="text-[var(--ob-accent)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              {isEs ? '1. Información Recopilada y Tratamiento' : '1. Information Collected & Processing'}
            </h2>
          </div>

          <div className="space-y-2.5 text-xs text-zinc-300">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <strong className="text-white block font-mono text-xs">{isEs ? 'A. Identidad y cuenta' : 'A. Identity and account'}</strong>
              <p className="text-zinc-400 mt-1 text-[11px]">
                {isEs 
                  ? 'Nombre de usuario, correo electrónico y credenciales encriptadas mediante Firebase Authentication (Google Cloud Identity).'
                  : 'Display name, email address, and encrypted credentials managed securely via Firebase Authentication.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <strong className="text-white block font-mono text-xs">{isEs ? 'B. Tiempo de pantalla' : 'B. Screen time'}</strong>
              <p className="text-zinc-400 mt-1 text-[11px]">
                {isEs 
                  ? 'El acceso a estadísticas de uso (UsageStatsManager) se ejecuta 100% de manera local en su dispositivo para alimentar las mecánicas de bienestar del T1GER 3D. Jamás compartimos ni vendemos sus registros de uso a terceros ni a redes de publicidad.'
                  : 'Screen time metrics (UsageStatsManager) are processed 100% locally on your device to calculate your 3D pet vitals. We never sell or transmit your app usage data to third-party ad networks.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <strong className="text-white block font-mono text-xs">{isEs ? 'C. Pruebas y mentor con IA' : 'C. Proofs and AI mentor'}</strong>
              <p className="text-zinc-400 mt-1 text-[11px]">
                {isEs 
                  ? 'Las pruebas escritas, imágenes y mensajes al mentor se envían a Google Gemini para obtener feedback. Las pruebas aprobadas se guardan en Firebase. No incluyas contraseñas, documentos de identidad ni datos financieros sensibles. El tratamiento del proveedor depende de sus condiciones y de la configuración del servicio.'
                  : 'Written evidence, images and mentor messages are sent to Google Gemini for feedback. Approved proofs are stored in Firebase. Do not include passwords, identity documents or sensitive financial data. Provider processing depends on its terms and service configuration.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. User Rights: Export & Deletion */}
      <div className="rounded-[1.6rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-xl">
        <div className="rounded-[1.3rem] border border-white/[0.08] bg-[#09090B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-3">
          <div className="flex items-center gap-2 border-b border-white/6 pb-2">
            <Trash2 size={15} className="text-rose-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              {isEs ? '2. Derechos de Eliminación y Portabilidad' : '2. Data Portability & Account Erasure'}
            </h2>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            {isEs
              ? 'En Perfil puedes exportar el progreso disponible o solicitar la eliminación de tu cuenta y sus datos asociados. La eliminación requiere verificar tu identidad y disponer del servicio de backend. Solo se confirma cuando el proceso termina.'
              : 'In Profile you can export available progress or request deletion of your account and its associated data. Deletion requires identity verification and an available backend. It is confirmed only after the process completes.'}
          </p>

          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 font-mono flex items-center gap-2">
            <CheckCircle2 size={14} className="text-rose-400 shrink-0" />
            <a href="/delete-account" className="underline">{isEs ? 'Gestionar la eliminación de mi cuenta' : 'Manage account deletion'}</a>
          </div>
        </div>
      </div>
    </div>
  );
};
