import React from 'react';
import { ArrowLeft, BookOpen, AlertTriangle, Scale, ShieldAlert } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';

interface TermsOfServiceProps {
  onBack?: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  const { language } = useBrain();
  const isEs = language === 'es';

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
              {isEs ? 'Términos y Condiciones' : 'Terms & Conditions'}
            </h1>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              T1GER APP • {isEs ? 'EULA & Condiciones de Servicio' : 'EULA & Terms of Service'}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-wider border border-amber-200">
          {isEs ? 'Uso Educativo Exclusivo' : 'Educational Use Only'}
        </span>
      </div>

      {/* Section 1: Financial Disclaimer */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600" /> {isEs ? 'Exención de Responsabilidad Financiera' : 'Financial Disclaimer'}
        </div>
        <p className="leading-relaxed">
          {isEs ? (
            <>T1GER APP es una plataforma de educación ejecutiva y gamificación. <strong>Ningún contenido, lección, módulo de inversión o respuesta generada por Inteligencia Artificial constituye asesoramiento financiero, legal o de inversión profesional.</strong></>
          ) : (
            <>T1GER APP is an executive learning and gamification platform. <strong>No content, lesson, investment module, or AI-generated response constitutes professional financial, legal, or investment advice.</strong></>
          )}
        </p>
        <p className="leading-relaxed">
          {isEs
            ? 'El usuario es el único responsable de sus decisiones financieras y debe realizar su propia investigación (Due Diligence) o consultar con un asesor certificado antes de tomar decisiones de capital.'
            : 'Users are solely responsible for their financial decisions and must conduct their own due diligence or consult a certified advisor before making capital allocations.'}
        </p>
      </div>

      {/* Section 2: License & Account Use */}
      <div className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#FF7300]" /> {isEs ? '1. Licencia de Uso y Registro' : '1. Usage License & Account Registration'}
        </h2>
        <div className="text-xs text-zinc-600 leading-relaxed space-y-2 pl-4 border-l-2 border-zinc-200">
          <p>{isEs ? 'Se le concede una licencia limitada, no exclusiva e intransferible para utilizar T1GER APP con fines personales y no comerciales.' : 'You are granted a limited, non-exclusive, non-transferable license to use T1GER APP for personal, non-commercial purposes.'}</p>
          <p>{isEs ? 'El usuario se compromete a proporcionar información veraz en el registro y a no compartir las credenciales de acceso con terceros.' : 'Users agree to provide accurate registration information and not share login credentials with third parties.'}</p>
        </div>
      </div>

      {/* Section 3: AI Coaching & Generated Content */}
      <div className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#FF7300]" /> {isEs ? '2. Inteligencia Artificial y Contenido Generado' : '2. Artificial Intelligence & Generated Content'}
        </h2>
        <div className="text-xs text-zinc-600 leading-relaxed space-y-2 pl-4 border-l-2 border-zinc-200">
          <p>{isEs ? 'Nuestros módulos integran tecnología de Inteligencia Artificial de Google Gemini y OpenRouter / DeepSeek. Aunque nos esforzamos por ofrecer contenido de la más alta calidad y rigor ejecutivo, la IA puede generar imprecisiones ocasionales.' : 'Our modules integrate Google Gemini and OpenRouter / DeepSeek AI technology. While we strive for top executive rigor, AI models may produce occasional inaccuracies.'}</p>
          <p>{isEs ? 'T1GER APP no se hace responsable por decisiones tomadas basadas en respuestas automáticas del Coach de IA.' : 'T1GER APP is not liable for decisions made based on automated AI Coach responses.'}</p>
        </div>
      </div>

      {/* Section 4: Subscriptions & Pro Tier */}
      <div className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800 flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#FF7300]" /> {isEs ? '3. Suscripciones y Pagos (In-App Purchases)' : '3. Subscriptions & In-App Purchases'}
        </h2>
        <div className="text-xs text-zinc-600 leading-relaxed space-y-2 pl-4 border-l-2 border-zinc-200">
          <p>{isEs ? 'Las suscripciones a la versión Pro / Super T1GER se procesan directamente mediante las tiendas oficiales Apple App Store o Google Play Store según sus términos de facturación.' : 'Subscriptions to Pro / Super T1GER are processed directly through the official Apple App Store or Google Play Store according to their billing terms.'}</p>
          <p>{isEs ? 'Puedes cancelar tu suscripción en cualquier momento desde los ajustes de tu cuenta de Google Play o Apple ID.' : 'You can cancel your subscription at any time from your Google Play account or Apple ID settings.'}</p>
        </div>
      </div>

      {/* Section 5: Termination */}
      <div className="pt-4 border-t border-zinc-200 text-center">
        <p className="text-xs text-zinc-500 font-medium">
          {isEs ? 'Para consultas legales o de términos de servicio:' : 'For legal inquiries or terms of service:'} <span className="font-bold text-zinc-800">legal@t1ger.app</span>
        </p>
      </div>
    </div>
  );
};
