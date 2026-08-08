import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Check, LockKeyhole, ShieldCheck, Target } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';
import { MISSION_BANK } from '../services/missionBank';
import { MascotGuide } from '../components/MascotGuide';
import { localizeCurriculumLevel, localizeMission } from '../services/contentLocalization';

export const Learn = ({ onStartMission }: { onStartMission?: (mission: any) => void }) => {
  const { brainState, language, pathData } = useBrain();
  const isEs = language === 'es';
  const completedMissionIds = new Set(brainState.missionHistory.filter(record => record.completed).map(record => record.missionId));

  return (
    <div className="pb-8 pt-5">
      <header className="mb-7">
        <p className="t1ger-kicker">{isEs ? 'Ruta de inversión' : 'Investing path'}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white">{isEs ? 'Aprende a invertir con criterio.' : 'Learn to invest with evidence.'}</h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[#87A9A2]">{isEs ? 'Aprende una idea, compruébala y úsala en una decisión real.' : 'Learn one idea, check it, then use it in a real decision.'}</p>
      </header>

      <div className="mb-7">
        <MascotGuide surface="learn" />
      </div>

      <div className="space-y-5">
        {pathData.track.levels.map((sourceLevel, levelIndex) => {
          const level = localizeCurriculumLevel(sourceLevel, language);
          const priorLevelsComplete = pathData.track.levels.slice(0, levelIndex).every(item =>
            item.days.every(day => brainState.completedDayIds.includes(day.dayId)) &&
            (!item.applyNodeId || completedMissionIds.has(item.applyNodeId))
          );
          const lessonsComplete = level.days.every(day => brainState.completedDayIds.includes(day.dayId));
          const applyComplete = !level.applyNodeId || completedMissionIds.has(level.applyNodeId);
          const levelComplete = lessonsComplete && applyComplete;
          const sourceApplyMission = MISSION_BANK.find(mission => mission.id === level.applyNodeId);
          const applyMission = sourceApplyMission ? localizeMission(sourceApplyMission, language) : undefined;

          return (
            <motion.section
              key={level.levelId}
              initial={{ opacity: 0, y: 16, scale: .992 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: .15, margin: '0px 0px -42px' }}
              transition={{ type: 'spring', stiffness: 280, damping: 30, mass: .8, delay: Math.min(levelIndex * .035, .12) }}
              className={`t1ger-content-auto transform-gpu overflow-hidden rounded-[1.6rem] border ${levelComplete ? 'border-[#3FC78E]/25 bg-[#0D302B]' : priorLevelsComplete ? 'border-white/10 bg-[#0B2925]' : 'border-white/5 bg-[#09231F] opacity-55'}`}
            >
              <div className="flex items-start gap-4 p-5">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-semibold ${levelComplete ? 'bg-[#3FC78E] text-[#06241F]' : priorLevelsComplete ? 'bg-[var(--t1ger-orange)] text-[#152A25]' : 'bg-white/6 text-[#64867F]'}`}>{levelComplete ? <Check size={18} /> : level.levelNumber}</div>
                <div><p className="t1ger-kicker">{isEs ? `Módulo ${level.levelNumber}` : `Module ${level.levelNumber}`}</p><h2 className="mt-1 text-base font-semibold text-white">{level.title}</h2><p className="mt-1 text-xs leading-5 text-[#789B93]">{level.subtitle}</p></div>
              </div>

              {priorLevelsComplete && (
                <div className="border-t border-white/7 px-4 pb-4 pt-3">
                  {level.days.map((day, dayIndex) => {
                    const sourceMission = MISSION_BANK.find(item => item.id === day.missionIds[0]);
                    const mission = sourceMission ? localizeMission(sourceMission, language) : undefined;
                    const done = brainState.completedDayIds.includes(day.dayId);
                    const unlocked = dayIndex === 0 || brainState.completedDayIds.includes(level.days[dayIndex - 1].dayId);
                    return (
                      <button key={day.dayId} disabled={!unlocked || done} onClick={() => mission && onStartMission?.(mission)} className="t1ger-tap-row flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-white/[.035] disabled:cursor-default">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${done ? 'bg-[#3FC78E]/12 text-[#67D5A4]' : unlocked ? 'bg-white/6 text-[var(--t1ger-orange)]' : 'bg-white/[.025] text-[#4D6F68]'}`}>{done ? <Check size={15} /> : unlocked ? <BookOpen size={15} /> : <LockKeyhole size={14} />}</span>
                        <span className="flex-1"><strong className={`block text-sm font-medium ${unlocked ? 'text-[#EAF4F1]' : 'text-[#5E7F78]'}`}>{mission?.title}</strong><span className="text-[11px] text-[#668980]">{done ? (isEs ? 'Completada' : 'Completed') : `${mission?.xpReward || 0} XP · 4 min`}</span></span>
                      </button>
                    );
                  })}
                  <button disabled={!lessonsComplete || applyComplete} onClick={() => applyMission && onStartMission?.(applyMission)} className={`t1ger-tap-row mt-2 flex w-full items-center gap-3 rounded-xl border p-4 text-left ${applyComplete ? 'border-[#3FC78E]/20 bg-[#3FC78E]/7' : lessonsComplete ? 'border-[var(--t1ger-orange)]/35 bg-[var(--t1ger-orange)]/8 hover:bg-[var(--t1ger-orange)]/12' : 'border-white/6 bg-white/[.02]'}`}>
                    <span className={`${applyComplete ? 'text-[#67D5A4]' : lessonsComplete ? 'text-[var(--t1ger-orange)]' : 'text-[#4D6F68]'}`}>{applyComplete ? <ShieldCheck size={20} /> : lessonsComplete ? <Target size={20} /> : <LockKeyhole size={18} />}</span>
                    <span className="flex-1"><strong className={`block text-sm font-semibold ${lessonsComplete ? 'text-white' : 'text-[#5E7F78]'}`}>{applyMission?.title}</strong><span className="text-[11px] text-[#668980]">{applyComplete ? (isEs ? 'Evidencia guardada' : 'Evidence saved') : lessonsComplete ? (isEs ? 'Práctica desbloqueada' : 'Practice unlocked') : (isEs ? 'Completa primero las lecciones' : 'Complete the lessons first')}</span></span>
                  </button>
                </div>
              )}
            </motion.section>
          );
        })}
      </div>

    </div>
  );
};
