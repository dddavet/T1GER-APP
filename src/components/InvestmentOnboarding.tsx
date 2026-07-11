import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, Eye, LineChart, Play, Shield, Sparkles, Target, Users } from 'lucide-react';
import { useAuth, type InvestmentProfile } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';

type Answers = Partial<InvestmentProfile>;

interface Choice {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Array<{
  key: keyof Answers;
  eyebrow: string;
  title: string;
  subtitle: string;
  choices: Choice[];
}> = [
  {
    key: 'goal',
    eyebrow: 'Tu objetivo',
    title: '¿Qué quieres conseguir invirtiendo?',
    subtitle: 'Usaremos esto para elegir ejemplos, ejercicios y el orden de tus lecciones.',
    choices: [
      { id: 'first-investment', label: 'Hacer mi primera inversión', description: 'Entender lo esencial y empezar sin improvisar.', icon: <Target /> },
      { id: 'long-term-wealth', label: 'Construir patrimonio', description: 'Crear un sistema para invertir durante años.', icon: <LineChart /> },
      { id: 'company-analysis', label: 'Analizar empresas', description: 'Aprender a leer negocios, riesgos y valoración.', icon: <Eye /> },
      { id: 'retirement', label: 'Planificar mi futuro', description: 'Convertir objetivos de vida en un plan financiero.', icon: <Shield /> },
    ],
  },
  {
    key: 'experience',
    eyebrow: 'Tu punto de partida',
    title: '¿Cuánto sabes hoy?',
    subtitle: 'No es un examen. Solo evita que repitamos lo que ya dominas.',
    choices: [
      { id: 'new', label: 'Estoy empezando', description: 'Acciones, fondos y riesgo todavía son conceptos nuevos.', icon: <Sparkles /> },
      { id: 'basic', label: 'Conozco lo básico', description: 'He leído o visto contenido, pero no tengo un sistema.', icon: <BookOpen /> },
      { id: 'active', label: 'Ya invierto', description: 'Quiero analizar mejor y tomar decisiones con criterio.', icon: <LineChart /> },
    ],
  },
  {
    key: 'riskComfort',
    eyebrow: 'Tu relación con el riesgo',
    title: 'Si tu inversión cae un 20%, ¿qué harías?',
    subtitle: 'Tu respuesta adapta los casos prácticos. No constituye asesoramiento financiero.',
    choices: [
      { id: 'protect', label: 'Reduciría el riesgo', description: 'Prefiero proteger capital y dormir tranquilo.', icon: <Shield /> },
      { id: 'balanced', label: 'Revisaría el plan', description: 'Mantendría la calma si la tesis sigue intacta.', icon: <Target /> },
      { id: 'growth', label: 'Buscaría oportunidades', description: 'Acepto volatilidad a cambio de mayor crecimiento.', icon: <LineChart /> },
    ],
  },
  {
    key: 'weeklyCommitment',
    eyebrow: 'Tu ritmo',
    title: '¿Cuánto tiempo puedes dedicar al día?',
    subtitle: 'T1GER crea sesiones cortas. La consistencia importa más que una sesión larga.',
    choices: [
      { id: '5', label: '5 minutos', description: 'Una idea y una comprobación rápida.', icon: <Clock3 /> },
      { id: '10', label: '10 minutos', description: 'Lección, quiz y una pequeña aplicación.', icon: <Clock3 /> },
      { id: '15', label: '15 minutos', description: 'Más casos, análisis y práctica real.', icon: <Clock3 /> },
    ],
  },
  {
    key: 'contentFormat',
    eyebrow: 'Cómo aprendes',
    title: '¿Qué formato te ayuda a entender mejor?',
    subtitle: 'Podrás cambiarlo en cualquier momento.',
    choices: [
      { id: 'read', label: 'Lectura breve', description: 'Ideas de libros y artículos resumidas con precisión.', icon: <BookOpen /> },
      { id: 'watch', label: 'Video explicado', description: 'Videos seleccionados con notas y preguntas clave.', icon: <Play /> },
      { id: 'practice', label: 'Aprender haciendo', description: 'Casos, simulaciones y decisiones interactivas.', icon: <Target /> },
    ],
  },
];

const formatToLearningStyle = {
  read: 'text',
  watch: 'visual',
  practice: 'interactive',
} as const;

export const InvestmentOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateAppUser } = useAuth();
  const { selectTrack } = useBrain();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ learnWithFriends: true });
  const [showPlan, setShowPlan] = useState(false);
  const [saving, setSaving] = useState(false);
  const step = steps[stepIndex];

  const plan = useMemo(() => {
    const focusByGoal: Record<string, string[]> = {
      'first-investment': ['Cómo funciona el mercado', 'Fondos indexados', 'Primera decisión segura'],
      'long-term-wealth': ['Interés compuesto', 'Diversificación', 'Aportaciones periódicas'],
      'company-analysis': ['Modelo de negocio', 'Estados financieros', 'Riesgo y valoración'],
      retirement: ['Objetivo financiero', 'Horizonte temporal', 'Asignación de activos'],
    };
    const focusAreas = focusByGoal[answers.goal || 'first-investment'];
    const minutes = Number(answers.weeklyCommitment || 10);
    return {
      title: answers.experience === 'active' ? 'Investor Decision Lab' : 'Investment Foundations',
      firstLessonId: 'inv-e1',
      weeklyMinutes: minutes * 5,
      focusAreas,
    };
  }, [answers]);

  const choose = (choice: Choice) => {
    const value = step.key === 'weeklyCommitment' ? Number(choice.id) : choice.id;
    setAnswers(current => ({ ...current, [step.key]: value }));
    window.setTimeout(() => {
      if (stepIndex === steps.length - 1) setShowPlan(true);
      else setStepIndex(current => current + 1);
    }, 160);
  };

  const finish = async () => {
    if (!answers.goal || !answers.experience || !answers.riskComfort || !answers.weeklyCommitment || !answers.contentFormat) return;
    setSaving(true);
    selectTrack('investing');
    await updateAppUser({
      niche: 'investing',
      primaryTrack: 'investing',
      goal: answers.goal,
      dailyTime: answers.weeklyCommitment,
      learningStyle: formatToLearningStyle[answers.contentFormat],
      experienceLevel: answers.experience === 'active' ? 3 : answers.experience === 'basic' ? 2 : 1,
      investmentProfile: answers as InvestmentProfile,
      personalizedPlan: plan,
      onboardingStep: 'complete',
      onboardingComplete: true,
    });
    setSaving(false);
    onComplete();
  };

  if (showPlan) {
    return (
      <div className="flex h-full w-full flex-col overflow-y-auto bg-[#060806] px-6 pb-8 pt-[calc(2rem+var(--safe-top-inset,env(safe-area-inset-top)))] text-white">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#b8f500]/30 bg-[#b8f500]/10 text-[#b8f500]">
            <Check className="h-6 w-6" strokeWidth={3} />
          </div>
          <p className="mb-2 text-xs font-bold uppercase text-[#b8f500]">Tu ruta está lista</p>
          <h1 className="mb-3 text-3xl font-black leading-tight">{plan.title}</h1>
          <p className="mb-8 text-sm leading-6 text-zinc-400">Empezaremos con una lección útil hoy y ajustaremos la dificultad según tus respuestas.</p>

          <div className="mb-6 border-y border-white/10 py-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm text-zinc-400">Ritmo semanal</span>
              <strong className="text-sm text-white">{plan.weeklyMinutes} min</strong>
            </div>
            <div className="space-y-4">
              {plan.focusAreas.map((area, index) => (
                <div key={area} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-xs font-bold text-[#b8f500]">{index + 1}</span>
                  <span className="text-sm font-semibold text-zinc-200">{area}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAnswers(current => ({ ...current, learnWithFriends: !current.learnWithFriends }))}
            className="mb-8 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left"
          >
            <span className="flex items-center gap-3">
              <Users className="h-5 w-5 text-zinc-400" />
              <span><strong className="block text-sm">Aprender con amigos</strong><small className="text-xs text-zinc-500">Retos y progreso compartido</small></span>
            </span>
            <span className={`h-6 w-11 rounded-full p-1 transition-colors ${answers.learnWithFriends ? 'bg-[#b8f500]' : 'bg-zinc-700'}`}>
              <span className={`block h-4 w-4 rounded-full bg-black transition-transform ${answers.learnWithFriends ? 'translate-x-5' : ''}`} />
            </span>
          </button>

          <button type="button" disabled={saving} onClick={finish} className="mt-auto flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#b8f500] px-5 font-black text-black disabled:opacity-60">
            {saving ? 'Guardando ruta…' : 'Empezar primera lección'} <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#060806] px-6 pb-[calc(1.5rem+var(--safe-bottom-inset,env(safe-area-inset-bottom)))] pt-[calc(2rem+var(--safe-top-inset,env(safe-area-inset-top)))] text-white">
      <div className="mx-auto flex w-full max-w-sm items-center gap-4">
        <button type="button" aria-label="Volver" onClick={() => stepIndex === 0 ? undefined : setStepIndex(current => current - 1)} disabled={stepIndex === 0} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] disabled:opacity-30">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[#b8f500] transition-[width] duration-300" style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} />
        </div>
        <span className="w-8 text-right text-xs font-semibold text-zinc-500">{stepIndex + 1}/{steps.length}</span>
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col overflow-y-auto pb-2 pt-10">
        <p className="mb-2 text-xs font-bold uppercase text-[#b8f500]">{step.eyebrow}</p>
        <h1 className="mb-3 text-[2rem] font-black leading-[1.08]">{step.title}</h1>
        <p className="mb-7 text-sm leading-6 text-zinc-400">{step.subtitle}</p>

        <div className="space-y-3">
          {step.choices.map(choice => {
            const selected = String(answers[step.key]) === choice.id;
            return (
              <button key={choice.id} type="button" onClick={() => choose(choice)} className={`flex min-h-[76px] w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${selected ? 'border-[#b8f500] bg-[#b8f500]/10' : 'border-white/10 bg-white/[0.025] hover:border-white/20'}`}>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selected ? 'bg-[#b8f500] text-black' : 'bg-white/[0.05] text-zinc-300'}`}>
                  {React.isValidElement(choice.icon) ? React.cloneElement(choice.icon as React.ReactElement<{ className?: string }>, { className: 'h-5 w-5' }) : choice.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-[15px] font-bold leading-5 text-white">{choice.label}</strong>
                  <small className="mt-1 block text-xs leading-4 text-zinc-500">{choice.description}</small>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
