import React from 'react';
import { ArrowLeft, BookOpen, AlertTriangle, Scale, ShieldAlert } from 'lucide-react';

interface TermsOfServiceProps {
  onBack?: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl text-left space-y-6 my-6 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl bg-[#FF7300]/10 border border-[#FF7300]/20 flex items-center justify-center text-[#FF7300]">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tight text-zinc-800">
              Términos y Condiciones
            </h1>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              T1GER APP • EULA & Condiciones de Servicio
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-wider border border-amber-200">
          Uso Educativo Exclusivo
        </span>
      </div>

      {/* Section 1: Financial Disclaimer */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600" /> Exención de Responsabilidad Financiera
        </div>
        <p className="leading-relaxed">
          T1GER APP es una plataforma de educación ejecutiva y gamificación. <strong>Ningún contenido, lección, módulo de inversión o respuesta generada por Inteligencia Artificial constituye asesoramiento financiero, legal o de inversión profesional.</strong>
        </p>
        <p className="leading-relaxed">
          El usuario es el único responsable de sus decisiones financieras y debe realizar su propia investigación (Due Diligence) o consultar con un asesor certificado antes de tomar decisiones de capital.
        </p>
      </div>

      {/* Section 2: License & Account Use */}
      <div className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#FF7300]" /> 1. Licencia de Uso y Registro
        </h2>
        <div className="text-xs text-zinc-600 leading-relaxed space-y-2 pl-4 border-l-2 border-zinc-200">
          <p>Se le concede una licencia limitada, no exclusiva e intransferible para utilizar T1GER APP con fines personales y no comerciales.</p>
          <p>El usuario se compromete a proporcionar información veraz en el registro y a no compartir las credenciales de acceso con terceros.</p>
        </div>
      </div>

      {/* Section 3: AI Coaching & Generated Content */}
      <div className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#FF7300]" /> 2. Inteligencia Artificial y Contenido Generado
        </h2>
        <div className="text-xs text-zinc-600 leading-relaxed space-y-2 pl-4 border-l-2 border-zinc-200">
          <p>Nuestros módulos integran tecnología de Inteligencia Artificial de Google Gemini. Aunque nos esforzamos por ofrecer contenido de la más alta calidad y rigor ejecutivo, la IA puede generar imprecisiones ocasionales.</p>
          <p>T1GER APP no se hace responsable por decisiones tomadas basadas en respuestas automáticas del Coach de IA.</p>
        </div>
      </div>

      {/* Section 4: Subscriptions & Pro Tier */}
      <div className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800 flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#FF7300]" /> 3. Suscripciones y Pagos (In-App Purchases)
        </h2>
        <div className="text-xs text-zinc-600 leading-relaxed space-y-2 pl-4 border-l-2 border-zinc-200">
          <p>Las suscripciones a la versión Pro / Super T1GER se procesan directamente mediante las tiendas oficiales Apple App Store o Google Play Store según sus términos de facturación.</p>
          <p>Puedes cancelar tu suscripción en cualquier momento desde los ajustes de tu cuenta de Google Play o Apple ID.</p>
        </div>
      </div>

      {/* Section 5: Termination */}
      <div className="pt-4 border-t border-zinc-200 text-center">
        <p className="text-xs text-zinc-500 font-medium">
          Para consultas legales o de términos de servicio: <span className="font-bold text-zinc-800">legal@t1ger.app</span>
        </p>
      </div>
    </div>
  );
};
