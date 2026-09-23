import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CheckCircle, Fire, X } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { useFieldMissions } from '../hooks/useFieldMissions';
import { isFieldMissionComplete } from '../services/fieldMissionService';
import { getDailyStreak } from '../services/dailyStreak';
import { T1gerMascot3D } from './T1gerMascot3D';
import { SoundEffects } from '../services/soundEffects';
import { useDevHarnessState } from '../dev/devHarnessState';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
}

export const StreakModal: React.FC<StreakModalProps> = ({ isOpen, onClose, streak }) => {
  const { appUser, user } = useAuth();
  const { brainState, language, isLearnStreakAtRisk } = useBrain();
  const { setActiveView } = useT1ger();
  const missions = useFieldMissions(appUser?.uid || 'local');
  const devHarness = useDevHarnessState();
  const reducedMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const isEs = language === 'es';
  const tr = (es: string, en: string) => isEs ? es : en;
  const dailyStreak = getDailyStreak(
    streak,
    user ? appUser?.lastVerifiedMissionDay : brainState.lastLearnDate,
    Date.now(),
    user ? appUser?.timeZone : undefined,
  );
  const completedToday = devHarness.streak === 'active' || (devHarness.streak === 'real' && dailyStreak.completedToday);
  const pendingApply = missions.some(mission => !isFieldMissionComplete(mission));
  const destination = !completedToday && pendingApply ? 'build' : 'learn';
  const milestone = [3, 7, 14, 30, 100].find(day => day > streak);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const goToNextStep = () => {
    SoundEffects.playTap();
    onClose();
    setActiveView(destination);
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={tr('Tu racha', 'Your streak')}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? undefined : { opacity: 0, y: 24 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className="fixed inset-0 z-[200] overflow-y-auto bg-[#09090B] text-white"
    >
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
        <header className="flex items-center justify-between gap-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF8A2A]">{tr('Tu racha', 'Your streak')}</p>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={tr('Cerrar racha', 'Close streak')} className="grid h-11 w-11 place-items-center rounded-xl bg-white/[.05] text-zinc-300 ring-1 ring-white/10 transition active:scale-[.97]">
            <X size={19} weight="bold" />
          </button>
        </header>

        <main className="flex flex-1 flex-col pt-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <Fire size={24} weight="fill" className={completedToday ? 'text-[#FF8A2A]' : 'text-zinc-500'} aria-hidden="true" />
                <span className="font-mono text-[4.5rem] font-semibold leading-none tabular-nums tracking-[-0.09em]">{streak}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-zinc-400">{tr(streak === 1 ? 'día seguido' : 'días seguidos', streak === 1 ? 'day in a row' : 'days in a row')}</p>
            </div>
            <div className="h-28 w-28 shrink-0" aria-hidden="true">
              <T1gerMascot3D mood={completedToday ? 'happy' : isLearnStreakAtRisk ? 'warning' : 'thinking'} closeUp className="h-full w-full" />
            </div>
          </div>

          <section className="mt-9 border-t border-white/10 pt-6" aria-live="polite">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              {completedToday ? <CheckCircle size={18} weight="fill" className="text-emerald-400" /> : <Fire size={18} weight="fill" className="text-[#FF8A2A]" />}
              {tr('Estado de hoy', "Today's status")}
            </div>
            <h1 className="mt-3 text-[1.7rem] font-extrabold leading-tight tracking-[-0.04em] text-balance">
              {completedToday
                ? tr('La racha está a salvo hoy.', 'Your streak is safe today.')
                : streak === 0
                  ? tr('Empieza con una acción real.', 'Start with one real action.')
                  : isLearnStreakAtRisk
                    ? tr('Una acción antes de medianoche.', 'One action before midnight.')
                    : tr('Haz tu acción de hoy.', "Take today's action.")}
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {completedToday
                ? tr('Aplicaste lo aprendido. Mañana tendrás otra oportunidad para continuar.', 'You applied what you learned. Come back tomorrow to keep going.')
                : pendingApply
                  ? tr('Ya tienes una acción lista en Apply. Complétala para cuidar tu racha.', 'An action is ready in Apply. Complete it to protect your streak.')
                  : tr('Una lección abre el camino; la racha cuenta cuando completas el paso Apply.', 'A lesson opens the path; your streak counts when you complete its Apply step.')}
            </p>
          </section>

          {milestone && streak > 0 && (
            <section className="mt-8" aria-label={tr('Próximo hito', 'Next milestone')}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-zinc-400">{tr('Próximo hito', 'Next milestone')}</span>
                <span className="font-mono tabular-nums text-zinc-300">{streak} / {milestone} {tr('días', 'days')}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label={tr('Progreso al próximo hito', 'Progress to next milestone')} aria-valuemin={0} aria-valuemax={milestone} aria-valuenow={streak}>
                <div className="h-full rounded-full bg-[#FF7300]" style={{ width: `${streak / milestone * 100}%` }} />
              </div>
            </section>
          )}

          <p className="mt-8 text-xs leading-5 text-zinc-500">
            {tr('Repasar en Master fortalece tu memoria, pero no suma otro día de racha.', 'Reviewing in Master strengthens memory, but does not add another streak day.')}
          </p>
        </main>

        <button type="button" onClick={goToNextStep} className="t1ger-primary-button mt-8 w-full justify-between px-5 text-black">
          <span>{completedToday ? tr('Seguir aprendiendo', 'Keep learning') : pendingApply ? tr('Ir a mi acción', 'Go to my action') : tr('Ir a Learn', 'Go to Learn')}</span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-black/15"><ArrowRight size={17} weight="bold" /></span>
        </button>
      </div>
    </motion.div>
  );
};
