import { ArrowLeft, AlertTriangle, Scale, ShieldAlert, CheckCircle2, Lock, CreditCard, Mail, ExternalLink } from 'lucide-react';
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
              ? 'Las simulaciones no garantizan resultados. Verifica las sugerencias de IA y consulta a un profesional cualificado cuando lo necesites. Este aviso no limita los derechos que te correspondan por ley.'
              : 'Simulations do not guarantee results. Verify AI suggestions and consult a qualified professional when needed. This notice does not limit your statutory rights.'}
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
            <li>{isEs ? 'Las monedas, vidas y el XP son bienes virtuales con fines lúdicos y formativos; no se pueden transferir a terceros ni canjear por dinero de curso legal.' : 'Coins, hearts, and XP are virtual assets strictly for gamification and education; they cannot be transferred or exchanged for real currency.'}</li>
          </ul>
        </div>
      </div>

      {/* 4. Subscriptions, In-App Purchases & Apple EULA */}
      <div className="rounded-[1.6rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-xl">
        <div className="rounded-[1.3rem] border border-white/[0.08] bg-[#09090B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-3">
          <div className="flex items-center gap-2 border-b border-white/6 pb-2">
            <CreditCard size={15} className="text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              {isEs ? 'Suscripciones In-App & Licencia (EULA)' : 'In-App Subscriptions & License (EULA)'}
            </h2>
          </div>

          <div className="space-y-2.5 text-xs text-zinc-300 leading-relaxed">
            <p>
              {isEs
                ? 'T1GER ofrece suscripciones opcionales de acceso ilimitado (T1GER Pro Anual con 7 días de prueba gratuita y T1GER Pro Mensual). Los precios vigentes se muestran de forma transparente en la pantalla de compra antes de confirmar el pago.'
                : 'T1GER offers optional full-access subscriptions (T1GER Pro Annual with a 7-day free trial, and T1GER Pro Monthly). Applicable prices are displayed transparently on the purchase screen before confirming.'}
            </p>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/6 space-y-2 text-[11px] text-zinc-300">
              <p>
                <strong>{isEs ? '• Cobro y Renovación Automática:' : '• Billing & Auto-Renewal:'}</strong>{' '}
                {isEs
                  ? 'El pago se cargará a tu cuenta de Apple ID o Google Play al confirmar la compra. La suscripción se renueva automáticamente a menos que se cancele al menos 24 horas antes del final del periodo de facturación actual. Tu cuenta se cargará por la renovación dentro de las 24 horas previas al término del periodo en curso.'
                  : 'Payment will be charged to your Apple ID or Google Play account at confirmation of purchase. Subscription automatically renews unless cancelled at least 24 hours before the end of the current billing period. Your account will be charged for renewal within 24 hours prior to the end of the current period.'}
              </p>
              <p>
                <strong>{isEs ? '• Gestión y Cancelación:' : '• Management & Cancellation:'}</strong>{' '}
                {isEs
                  ? 'Puedes gestionar o cancelar tu suscripción en cualquier momento accediendo a los Ajustes de Cuenta de tu dispositivo en App Store o Google Play. Cualquier porción no utilizada de un periodo de prueba gratis se perderá al comprar una suscripción paga.'
                  : 'You can manage or cancel your subscription anytime via your device Account Settings on the App Store or Google Play. Any unused portion of a free trial period will be forfeited when purchasing a paid subscription.'}
              </p>
            </div>

            <p className="text-[11px] text-zinc-400">
              {isEs ? (
                <>
                  En plataformas iOS, el uso de la aplicación está sujeto adicionalmente al{' '}
                  <a
                    href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--ob-accent)] hover:underline inline-flex items-center gap-1"
                  >
                    Acuerdo de Licencia de Usuario Final estándar de Apple (EULA) <ExternalLink size={10} />
                  </a>.
                </>
              ) : (
                <>
                  On iOS platforms, use of the app is also governed by the{' '}
                  <a
                    href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--ob-accent)] hover:underline inline-flex items-center gap-1"
                  >
                    Apple Standard End User License Agreement (EULA) <ExternalLink size={10} />
                  </a>.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Support & Contact */}
      <div className="rounded-[1.6rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-xl">
        <div className="rounded-[1.3rem] border border-white/[0.08] bg-[#09090B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <Mail size={15} className="text-[var(--ob-accent)]" />
            <span>{isEs ? 'Contacto legal y de soporte:' : 'Legal & support contact:'}</span>
            <a href="mailto:soporte@t1ger.app" className="font-mono text-white underline hover:text-[var(--ob-accent)]">
              soporte@t1ger.app
            </a>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
