import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CheckCircle, Flag, Target } from '@phosphor-icons/react';
import { Check, Flame, Trophy, TrendingUp, Calculator, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { useFieldMissions } from '../hooks/useFieldMissions';
import { FieldMissionService, isFieldMissionComplete, type FieldMission } from '../services/fieldMissionService';
import { getApplyDesign } from '../services/applyMissionDesign';
import { SoundEffects } from '../services/soundEffects';
const Trading = React.lazy(() => import('./apply/PaperTradingSandbox').then(m => ({ default: m.PaperTradingSandbox })));
import { ApplyMissionModal } from './apply/ApplyMissionModal';

/**
 * Daily Momentum Card (Apple Fitness Activity Ring Inspired)
 */
function DailyMomentumCard({
  completedCount,
  activeCount,
  streak,
  isEs,
}: {
  completedCount: number;
  activeCount: number;
  streak: number;
  isEs: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const isDoneToday = completedCount > 0 && activeCount === 0;
  const progressPercent = isDoneToday ? 100 : activeCount > 0 ? 35 : 0;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#121216]/85 p-4 sm:p-5 shadow-[0_16px_36px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
      {/* Background ambient glow */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-3xl"
        style={{
          background: isDoneToday
            ? 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,115,0,0.2) 0%, transparent 70%)',
        }}
      />

      <div className="relative flex items-center gap-4">
        {/* Apple Fitness Activity Ring */}
        <div className="relative flex h-18 w-18 shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 72 72">
            {/* Background Track */}
            <circle
              cx="36"
              cy="36"
              r={radius}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Progress Arc */}
            <motion.circle
              cx="36"
              cy="36"
              r={radius}
              stroke={isDoneToday ? '#10B981' : '#FF7300'}
              strokeWidth="6"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{
                duration: reducedMotion ? 0 : 0.9,
                ease: [0.23, 1, 0.32, 1],
              }}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <motion.div
            initial={reducedMotion ? undefined : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.15 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {isDoneToday ? (
              <Check className="text-emerald-400" size={24} strokeWidth={3} />
            ) : (
              <Flame className="text-[#FF8A1F]" size={22} />
            )}
          </motion.div>
        </div>

        {/* Metrics Column */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider ${
                isDoneToday
                  ? 'border border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
                  : 'border border-[#FF7300]/25 bg-[#FF7300]/10 text-[#FF8A1F]'
              }`}
            >
              {isDoneToday
                ? (isEs ? 'Misión de hoy completa' : "Today's action complete")
                : (isEs ? 'Acción pendiente hoy' : 'Action pending today')}
            </span>
          </div>

          <h3 className="mt-1 text-base font-extrabold text-white tracking-tight">
            {isDoneToday
              ? (isEs ? 'Hábito protegido hoy' : 'Habit locked in today')
              : (isEs ? 'Haz tu acción en el mundo real' : 'Take your real-world step')}
          </h3>

          <div className="mt-2.5 grid grid-cols-3 gap-2">
            <motion.div
              initial={reducedMotion ? undefined : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="rounded-xl border border-white/[0.08] bg-black/40 p-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <p className="font-mono text-[8.5px] font-bold uppercase tracking-wider text-zinc-500">
                {isEs ? 'Hoy' : 'Today'}
              </p>
              <p
                className={`mt-0.5 font-mono text-xs font-black ${
                  isDoneToday ? 'text-emerald-300' : 'text-[#FF8A1F]'
                }`}
              >
                {isDoneToday ? '1 / 1' : `${Math.min(1, completedCount)} / 1`}
              </p>
            </motion.div>
            <motion.div
              initial={reducedMotion ? undefined : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.16 }}
              className="rounded-xl border border-white/[0.08] bg-black/40 p-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <p className="font-mono text-[8.5px] font-bold uppercase tracking-wider text-zinc-500">
                {isEs ? 'Racha' : 'Streak'}
              </p>
              <p className="mt-0.5 font-mono text-xs font-black text-amber-400">
                {streak}d 🔥
              </p>
            </motion.div>
            <motion.div
              initial={reducedMotion ? undefined : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.22 }}
              className="rounded-xl border border-white/[0.08] bg-black/40 p-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <p className="font-mono text-[8.5px] font-bold uppercase tracking-wider text-zinc-500">
                {isEs ? 'Victorias' : 'Wins'}
              </p>
              <p className="mt-0.5 font-mono text-xs font-black text-white">
                {completedCount} 🏆
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const BuildTab = (_props: { onStartMission?: (mission: unknown) => void }) => {
  const reducedMotion = useReducedMotion();
  const { language, completeMission } = useBrain();
  const { stats, addXP, setActiveView } = useT1ger();
  const { appUser } = useAuth();
  const userId = appUser?.uid || 'local';
  const locale = language === 'es' ? 'es' : 'en';
  const isEs = locale === 'es';
  const tr = (es: string, en: string) => (isEs ? es : en);
  const missions = useFieldMissions(userId);
  const [view, setView] = useState<'active' | 'history' | 'tools'>('active');
  const [selected, setSelected] = useState<FieldMission | null>(null);
  const completed = useMemo(() => missions.filter(isFieldMissionComplete), [missions]);
  const active = useMemo(() => missions.filter(m => !isFieldMissionComplete(m)), [missions]);

  useEffect(() => {
    const auto = active.find(m => m.autoOpen);
    if (!auto || selected) return;
    setSelected(auto);
    FieldMissionService.clearAutoOpen(userId, auto.id);
  }, [active, selected, userId]);

  const finish = async (mission: FieldMission) => {
    await addXP(mission.lessonXp + mission.executionXp, 2, `mission:${mission.id}`);
    completeMission(mission.lessonId, mission.learningScore ?? 100);
    completeMission(mission.id, 100);
  };

  return (
    <div className="mx-auto max-w-lg space-y-4 pb-40 pt-2 text-white px-1 font-sans selection:bg-[#FF7300]/35">
      {/* Header with verified test locator "Make it part of your life." */}
      <header className="px-1">
        <p className="font-mono text-[9px] uppercase tracking-[.22em] text-[#FF8A1F] font-bold">
          {tr('APLICAR // UN PASO REAL', 'APPLY // ONE REAL STEP')}
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white">
          {tr('Hazlo parte de tu vida.', 'Make it part of your life.')}
        </h1>
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
          {tr(
            'Aprende con teoría. Domina con la práctica. Haz una acción real y marca tu victoria.',
            'Theory is good. Action builds mastery. Take one real-world step and log your win.'
          )}
        </p>
      </header>

      {/* Daily Momentum Summary Ring */}
      <DailyMomentumCard
        completedCount={completed.length}
        activeCount={active.length}
        streak={stats.streak}
        isEs={isEs}
      />

      {/* Navigation Tabs (Apple Segmented Style with 44pt touch targets) */}
      <nav
        aria-label={tr('Secciones de Aplicar', 'Apply sections')}
        className="flex gap-1 rounded-[1.25rem] border border-white/10 bg-[#121216]/85 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md"
      >
        {(['active', 'history', 'tools'] as const).map(id => {
          const isActive = view === id;
          return (
            <button
              key={id}
              aria-current={isActive ? 'page' : undefined}
              onPointerDown={() => SoundEffects.playToggle()}
              onClick={() => setView(id)}
              className={`min-h-[44px] flex-1 rounded-xl px-2 text-xs font-bold transition-all duration-150 ease-out cursor-pointer active:scale-[0.96] active:translate-y-0.5 ${
                isActive
                  ? 'bg-gradient-to-b from-[#FF7300]/25 to-[#FF7300]/15 text-[#FF9A3D] border border-[#FF7300]/35 shadow-[0_2px_8px_rgba(255,115,0,0.15)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {id === 'active'
                ? tr('Mis acciones', 'My actions')
                : id === 'history'
                ? tr('Victorias', 'Wins')
                : tr('Simulador', 'Simulator')}
            </button>
          );
        })}
      </nav>

      {/* Active Tab */}
      {view === 'active' && (
        <section className="space-y-4">
          {!active.length && (
            <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-[#121216]/60 p-7 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FF7300]/10 border border-[#FF7300]/25 flex items-center justify-center text-[#FF8A1F] shadow-[0_0_24px_rgba(255,115,0,0.12)]">
                <Flag size={28} weight="duotone" />
              </div>
              <h2 className="mt-4 text-base sm:text-lg font-black text-white">
                {completed.length
                  ? tr('Listo para tu siguiente paso.', 'Ready for your next step.')
                  : tr('Tu primera acción empieza aprendiendo.', 'Your first action starts with learning.')}
              </h2>
              <p className="mt-1.5 text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                {tr(
                  'Cada lección desbloquea una misión concreta que puedes hacer hoy.',
                  'Every lesson unlocks a specific mission you can do today.'
                )}
              </p>
              <button
                onPointerDown={() => SoundEffects.playTap()}
                onClick={() => setActiveView('learn')}
                className="t1ger-primary-button mt-5 w-full flex items-center justify-center gap-2"
              >
                <span>{tr('Ir a mi camino', 'Go to my journey')}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {active.map((mission, idx) => {
            const design = getApplyDesign(mission.lessonId, locale);
            return (
              <motion.article
                key={mission.id}
                initial={reducedMotion ? undefined : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 28,
                  delay: reducedMotion ? 0 : idx * 0.08,
                }}
                whileHover={reducedMotion ? undefined : { y: -2, transition: { duration: 0.15 } }}
                className="relative overflow-hidden rounded-[1.75rem] border border-[#FF7300]/35 bg-[#121216]/90 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-colors hover:border-[#FF7300]/50"
              >
                {/* Ambient glow */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#FF7300]/12 blur-3xl" />

                {/* Top metadata row */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 font-bold text-[#FF8A1F]">
                      <Target size={16} weight="bold" />
                      {tr('ACCIÓN REAL', 'REAL ACTION')}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-zinc-400">
                      ⚡ {design?.minutes || 5} MIN
                    </span>
                  </div>
                  <span className="font-mono rounded-full border border-[#FF7300]/25 bg-[#FF7300]/10 px-2.5 py-0.5 text-[10px] font-black text-[#FF9A3D]">
                    +{mission.lessonXp + mission.executionXp} XP
                  </span>
                </div>

                {/* Mission title */}
                <h2 className="mt-3 text-lg sm:text-xl font-black text-white leading-snug tracking-tight">
                  {design?.title || mission.title}
                </h2>

                {/* Mission rationale (Grade 5-7 copy) */}
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-300">
                  {design?.why || mission.description}
                </p>

                {/* Step checklist preview (Duolingo / Apple Checklist) */}
                {design?.steps && design.steps.length > 0 && (
                  <div className="mt-3.5 space-y-1.5 rounded-2xl border border-white/[0.08] bg-black/40 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
                      {tr('PASOS SENCILLOS HOY:', 'SIMPLE STEPS TODAY:')}
                    </p>
                    {design.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 leading-snug">
                        <span className="shrink-0 font-mono text-[10px] font-black text-[#FF8A1F] bg-[#FF7300]/10 rounded px-1.5 py-0.5">
                          0{idx + 1}
                        </span>
                        <span className="line-clamp-2">{step}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tactile 3D Action Button */}
                <motion.button
                  whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                  onPointerDown={() => SoundEffects.playTap()}
                  onClick={() => setSelected(mission)}
                  className="t1ger-primary-button mt-4 w-full flex items-center justify-center gap-2"
                >
                  <span>{tr('Ver mi acción', 'Open my action')}</span>
                  <ArrowRight size={18} />
                </motion.button>
              </motion.article>
            );
          })}

          {/* Quick Practice Toolbox Dock */}
          <div className="pt-2">
            <div className="flex items-center justify-between px-1 mb-2.5">
              <p className="font-mono text-[9px] font-black uppercase tracking-[.2em] text-zinc-500">
                {tr('HERRAMIENTAS DE PRÁCTICA', 'PRACTICE TOOLBOX')}
              </p>
              <span className="font-mono text-[9px] text-[#FF8A1F] font-bold">
                {tr('SIN RIESGO REAL', 'ZERO RISK')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <motion.button
                type="button"
                whileHover={reducedMotion ? undefined : { y: -2 }}
                whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                onPointerDown={() => SoundEffects.playTap()}
                onClick={() => setView('tools')}
                className="group flex flex-col justify-between rounded-[1.4rem] border border-white/[0.08] bg-[#121216] p-3.5 text-left transition-all duration-150 hover:border-white/20 cursor-pointer shadow-sm min-h-[44px]"
              >
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300 mb-2.5">
                    <TrendingUp size={18} />
                  </div>
                  <h3 className="text-xs font-black text-white leading-tight">
                    {tr('Simulador de Trading', 'Trading Simulator')}
                  </h3>
                  <p className="mt-1 text-[10px] text-zinc-400 leading-snug line-clamp-2">
                    {tr('Aprende a operar con saldo demo sin riesgo.', 'Practice paper orders with simulated cash.')}
                  </p>
                </div>
                <div className="mt-3 flex items-center text-[10px] font-bold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                  <span>{tr('Abrir terminal', 'Open terminal')}</span>
                  <ChevronRight size={12} className="ml-1" />
                </div>
              </motion.button>

              <motion.button
                type="button"
                whileHover={reducedMotion ? undefined : { y: -2 }}
                whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                onPointerDown={() => SoundEffects.playTap()}
                onClick={() => setView('tools')}
                className="group flex flex-col justify-between rounded-[1.4rem] border border-white/[0.08] bg-[#121216] p-3.5 text-left transition-all duration-150 hover:border-white/20 cursor-pointer shadow-sm min-h-[44px]"
              >
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300 mb-2.5">
                    <Calculator size={18} />
                  </div>
                  <h3 className="text-xs font-black text-white leading-tight">
                    {tr('Interés Compuesto', 'Compound Growth')}
                  </h3>
                  <p className="mt-1 text-[10px] text-zinc-400 leading-snug line-clamp-2">
                    {tr('Simula tu riqueza a 5, 10 y 20 años.', 'Project your wealth over 5, 10, and 20 years.')}
                  </p>
                </div>
                <div className="mt-3 flex items-center text-[10px] font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  <span>{tr('Calcular ahora', 'Calculate now')}</span>
                  <ChevronRight size={12} className="ml-1" />
                </div>
              </motion.button>
            </div>
          </div>
        </section>
      )}

      {/* History / Wins Tab */}
      {view === 'history' && (
        <section className="space-y-3">
          <div className="p-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {completed.length} {tr('acciones completadas', 'completed actions')}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              {tr(
                'Tu progreso personal, paso a paso. Solo las acciones verificadas suman a la liga.',
                'Your personal progress, step by step. Only verified actions score in leagues.'
              )}
            </p>
          </div>

          {!completed.length && (
            <p className="rounded-[1.75rem] border border-dashed border-white/15 p-7 text-center text-xs text-zinc-400">
              {tr('Tu primera victoria aparecerá aquí.', 'Your first win will appear here.')}
            </p>
          )}

          {completed.map(mission => (
            <article
              key={mission.id}
              className="rounded-[1.5rem] border border-white/10 bg-[#121216] p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <CheckCircle size={16} weight="fill" />
                {mission.completionMode === 'self_reported' || !mission.submission?.proofUrl
                  ? tr('Completada · autodeclarada', 'Completed · self-reported')
                  : tr('Artefacto revisado', 'Reviewed artifact')}
              </div>
              <h3 className="mt-2 text-sm sm:text-base font-semibold text-zinc-100">
                {getApplyDesign(mission.lessonId, locale)?.title || mission.title}
              </h3>
              <p className="mt-1.5 font-mono text-[11px] text-zinc-400">
                {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
                  mission.submission?.createdAt || mission.updatedAt
                )}{' '}
                · +{mission.lessonXp + mission.executionXp} XP
              </p>
              {mission.submission?.proofText && (
                <p className="mt-2.5 whitespace-pre-wrap text-xs sm:text-sm text-zinc-300 bg-black/30 p-3 rounded-lg border border-white/5">
                  {mission.submission.proofText}
                </p>
              )}
              {mission.submission?.proofUrl?.startsWith('https://') && (
                <a
                  href={mission.submission.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2.5 inline-block py-1 text-xs text-orange-400 underline"
                >
                  {tr('Ver prueba guardada', 'View saved proof')}
                </a>
              )}
            </article>
          ))}
        </section>
      )}

      {/* Tools / Simulator Tab */}
      {view === 'tools' && (
        <React.Suspense
          fallback={
            <p role="status" className="text-sm text-zinc-400 text-center py-8">
              {tr('Cargando simulador…', 'Loading simulator…')}
            </p>
          }
        >
          <Trading />
        </React.Suspense>
      )}

      {selected && (
        <ApplyMissionModal
          mission={selected}
          locale={locale}
          onClose={() => setSelected(null)}
          onComplete={() => finish(selected)}
          onReturn={() => {
            setSelected(null);
            setActiveView('learn');
          }}
        />
      )}
    </div>
  );
};
