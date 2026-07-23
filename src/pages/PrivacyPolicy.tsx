import React from 'react';
import { ShieldCheck, Lock, ArrowLeft, FileText, CheckCircle2, Trash2 } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tight text-zinc-800">
              Política de Privacidad
            </h1>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              T1GER APP • Última actualización: Julio 2026
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider border border-emerald-200">
          Cumplimiento GDPR & Google Play
        </span>
      </div>

      {/* Intro Box */}
      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-600 leading-relaxed space-y-2">
        <p className="font-bold text-zinc-800">
          En T1GER APP ("nosotros", "nuestra plataforma"), respetamos profundamente la privacidad de nuestros usuarios y nos comprometemos a proteger sus datos personales.
        </p>
        <p>
          Esta Política de Privacidad explica cómo recopilamos, usamos, almacenamos y protegemos la información cuando utilizas nuestra aplicación móvil y plataforma web.
        </p>
      </div>

      {/* Section 1: Data We Collect */}
      <div className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#FF7300]" /> 1. Información que Recopilamos
        </h2>
        <div className="text-xs text-zinc-600 leading-relaxed space-y-2 pl-4 border-l-2 border-zinc-200">
          <p><strong>Datos de Cuenta:</strong> Correo electrónico, nombre de usuario (displayName), foto de perfil e identificador único de usuario (UID) generado por Firebase Authentication.</p>
          <p><strong>Datos de Progreso de Aprendizaje:</strong> Puntuaciones de competencias (0-100), misiones completadas, historial de lecciones, nivel, experiencia (XP), monedas virtuales y días de racha (streak).</p>
          <p><strong>Evidencias Tácticas:</strong> Fotos o registros de texto cargados voluntariamente por el usuario para verificar el cumplimiento de tareas diarias.</p>
          <p><strong>Datos Técnicos:</strong> Identificador de dispositivo, versión del sistema operativo y registros anónimos de errores para garantizar el rendimiento de la aplicación.</p>
        </div>
      </div>

      {/* Section 2: How We Use Your Data */}
      <div className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#FF7300]" /> 2. Uso de la Información y Modelos de IA
        </h2>
        <div className="text-xs text-zinc-600 leading-relaxed space-y-2 pl-4 border-l-2 border-zinc-200">
          <p>Utilizamos la información recopilada exclusivamente para:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Autenticar y mantener segura tu cuenta a través de Google Firebase Authentication.</li>
            <li>Personalizar las lecciones ejecutivas adaptativas utilizando la API de Google Gemini AI. No compartimos datos personales identificables con modelos públicos de entrenamiento.</li>
            <li>Calcular el algoritmo Spaced Repetition (FSRS) para optimizar la retención de conocimientos.</li>
            <li>Sincronizar tu progreso en tiempo real entre múltiples dispositivos.</li>
          </ul>
        </div>
      </div>

      {/* Section 3: Data Sharing & Third Parties */}
      <div className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#FF7300]" /> 3. Proveedores de Servicios Terceros
        </h2>
        <div className="text-xs text-zinc-600 leading-relaxed space-y-2 pl-4 border-l-2 border-zinc-200">
          <p>No vendemos ni alquilamos tus datos personales a terceros. Trabajamos con infraestructura segura de clase mundial:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Google Cloud & Firebase:</strong> Almacenamiento seguro de base de datos (Firestore) y autenticación.</li>
            <li><strong>Google Gemini AI API:</strong> Generación y evaluación de lecciones personalizadas.</li>
          </ul>
        </div>
      </div>

      {/* Section 4: Account & Data Deletion */}
      <div className="space-y-3 p-4 bg-red-50/50 border border-red-200 rounded-2xl">
        <h2 className="text-sm font-black uppercase tracking-wider text-red-700 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-600" /> 4. Eliminación de Cuenta y Derecho al Olvido
        </h2>
        <p className="text-xs text-zinc-700 leading-relaxed">
          De acuerdo con las normativas de Apple App Store y Google Play Store, tienes derecho a eliminar permanentemente tu cuenta y todos tus datos personales en cualquier momento.
        </p>
        <p className="text-xs text-zinc-700 leading-relaxed">
          Puedes solicitar la eliminación directamente desde el menú de <strong>Perfil / Configuración</strong> en la aplicación haciendo clic en <em>"Eliminar mi Cuenta"</em>, o enviando una solicitud por correo electrónico a <strong>privacy@t1ger.app</strong>.
        </p>
      </div>

      {/* Section 5: Contact */}
      <div className="pt-4 border-t border-zinc-200 text-center">
        <p className="text-xs text-zinc-500 font-medium">
          Si tienes preguntas sobre esta Política de Privacidad, contáctanos en: <span className="font-bold text-zinc-800">privacy@t1ger.app</span>
        </p>
      </div>
    </div>
  );
};
