import React from 'react';
import { ArrowLeft, AlertTriangle, Scale, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';

interface TermsOfServiceProps {
  onBack?: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
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
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {isEs ? 'Términos de Servicio & EULA' : 'Terms of Service & EULA'}
                </h1>
                <p className="text-[10px] font-mono text-zinc-400">
                  T1GER APP · {isEs ? 'Acuerdo Legal de Usuario' : 'End User License Agreement'}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-[9px] font-mono font-bold uppercase tracking-wider border border-amber-500/30">
              {isEs ? 'USO EDUCATIVO' : 'EDUCATIONAL'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Total Financial & Legal Liability Shield */}
      <div className="rounded-[1.6rem] border border-amber-500/30 bg-amber-500/[0.04] p-1.5 shadow-xl">
        <div className="rounded-[1.3rem] border border-amber-500/20 bg-[#09090B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle size={17} />
            <h2 className="text-xs font-bold uppercase tracking-wider font-mono">
              {isEs ? 'Descargo de Responsabilidad Financiera y Legal' : 'Financial & Legal Disclaimer'}
            </h2>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            {isEs ? (
              <>
                T1GER APP es una plataforma de formación ejecutiva, gamificación y simulación. <strong>Ningún contenido, cálculo, sugerencia de IA, terminal de Paper Trading ni módulo de oferta constituye asesoramiento financiero, de inversión, tributario, contable o legal profesional.</strong>
              </>
            ) : (
              <>
                T1GER APP is an executive learning, gamification, and simulation platform. <strong>No content, calculation, AI suggestion, Paper Trading terminal, or offer module constitutes professional financial, investment, tax, accounting, or legal advice.</strong>
              </>
            )}
          </p>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            {isEs
              ? 'El usuario asume el 100% de la responsabilidad por cualquier decisión económica o empresarial tomada en el mundo real. Ni los creadores, fundadores ni T1GER Inc. asumen responsabilidad alguna por pérdidas o ganancias derivadas del uso de la aplicación.'
              : 'The user assumes 100% responsibility for any financial or commercial decisions made in the real world. Neither the creators, founders, nor T1GER Inc. assume liability for any financial losses or outcomes resulting from using this application.'}
          </p>
        </div>
      </div>

      {/* 3. Acceptable Use & AI Interaction */}
      <div className="rounded-[1.6rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-xl">
        <div className="rounded-[1.3rem] border border-white/[0.08] bg-[#09090B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-3">
          <div className="flex items-center gap-2 border-b border-white/6 pb-2">
            <Lock size={15} className="text-[var(--ob-accent)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              {isEs ? 'Condiciones de Uso y Propiedad Intelectual' : 'Acceptable Use & Intellectual Property'}
            </h2>
          </div>

          <ul className="text-xs text-zinc-300 space-y-2 list-disc pl-4">
            <li>{isEs ? 'El usuario se compromete a no utilizar bots ni scripts automáticos para alterar la economía de XP o manipular el ranking de la liga.' : 'Users agree not to utilize automated bots or scripts to manipulate XP rankings.'}</li>
            <li>{isEs ? 'Todos los modelos 3D, interfaces, marcas y diseños de T1GER están protegidos por derechos de propiedad intelectual internacional.' : 'All 3D assets, UI designs, and trademarks are protected under international copyright law.'}</li>
            <li>{isEs ? 'Las compras dentro de la aplicación (T1GER Plus) son procesadas directamente por Google Play y Apple App Store bajo sus respectivas políticas de suscripción.' : 'In-app purchases are governed directly by Google Play and Apple App Store billing rules.'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
