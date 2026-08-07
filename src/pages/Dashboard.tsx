import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, CheckCircle2, LockKeyhole, ShieldCheck, Target, TrendingUp, Sparkles, Flame, HeartHandshake, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { T1gerMascot3D } from '../components/T1gerMascot3D';

export const Dashboard = ({ onStartMission }: { onStartMission: (mission: any) => void }) => {
  const { appUser } = useAuth();
  const { language, brainState, pathData, getDailyPipelineMissions, learnStreak } = useBrain();
  const { stats, setActiveView } = useT1ger();
  const isEs = language === 'es';
  const { pipeline, learnNode, applyNode } = getDailyPipelineMissions();
  const completedLessons = brainState.missionHistory.filter(record => record.completed).length;
  const currentLevel = pathData.track.levels[pathData.currentLevelIndex];
  const firstName = appUser?.displayName?.split(' ')[0] || (isEs ? 'Inversor' : 'Investor');

  const [mascotMood, setMascotMood] = useState<'idle' | 'happy' | 'beast' | 'warning'>('idle');

  return (
    <div className="space-y-5 pb-8 pt-5">
      {/* 3D MASCOT DUOLINGO SHOWCASE HERO */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-6 border-2 border-amber-500/30 shadow-[0_20px_50px_rgba(255,115,0,0.25)] text-white"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          {/* 3D Canvas Visualizer */}
          <div className="relative flex flex-col items-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <T1gerMascot3D mood={mascotMood} className="w-48 h-48" />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400/80 uppercase bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/40 -mt-2">
              ⬢ T1GER 3D Chibi Mascot
            </span>
          </div>

          {/* Interactive Mascot Dialog & Mood Controls */}
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40 text-amber-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEs ? 'Mascota 3D Estilo Duolingo' : 'Duolingo-style 3D Mascot'}</span>
            </div>
            
            <h2 className="text-xl font-black italic tracking-tight text-white uppercase">
              {mascotMood === 'idle' && (isEs ? '¡Listo para cazar metas!' : 'Ready to hunt goals!')}
              {mascotMood === 'happy' && (isEs ? '¡Excelente trabajo hoy!' : 'Great job today!')}
              {mascotMood === 'beast' && (isEs ? '¡MODO BESTIA ACTIVADO!' : 'BEAST MODE ACTIVATED!')}
              {mascotMood === 'warning' && (isEs ? '¡Mantén tu racha activa!' : 'Keep your streak active!')}
            </h2>

            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {isEs 
                ? 'Interactúa con el modelo 3D directamente. Rotará con el mouse o táctil.'
                : 'Interact directly with the 3D model. Drag to rotate in real time.'}
            </p>

            {/* Mood selector buttons */}
            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                onClick={() => setMascotMood('idle')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  mascotMood === 'idle' ? 'bg-amber-500 text-zinc-950 font-black shadow-lg scale-105' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <span>💤 Idle</span>
              </button>
              <button
                onClick={() => setMascotMood('happy')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  mascotMood === 'happy' ? 'bg-emerald-500 text-zinc-950 font-black shadow-lg scale-105' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>😊 Victoria</span>
              </button>
              <button
                onClick={() => setMascotMood('beast')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  mascotMood === 'beast' ? 'bg-orange-500 text-zinc-950 font-black shadow-lg scale-105' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-zinc-950 fill-zinc-950" />
                <span>🔥 Beast</span>
              </button>
              <button
                onClick={() => setMascotMood('warning')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  mascotMood === 'warning' ? 'bg-red-500 text-white font-black shadow-lg scale-105' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>⚠️ Alerta</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[2rem] bg-[#0D302B] px-6 pb-7 pt-6 shadow-[0_22px_60px_rgba(1,20,17,.32)]">
        <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[var(--t1ger-orange)]/16 blur-3xl" />
        <p className="t1ger-kicker">{isEs ? 'Plan de hoy' : "Today's plan"}</p>
        <h1 className="mt-2 max-w-[15rem] text-balance text-[2rem] font-semibold leading-[1.02] tracking-[-0.045em] text-white">
          {isEs ? `${firstName}, aprende una idea. Úsala hoy.` : `${firstName}, learn one idea. Use it today.`}
        </h1>
        <div className="mt-6 flex items-center gap-5 border-t border-white/8 pt-5">
          <div><span className="block font-mono text-lg font-semibold text-white">{learnStreak}</span><span className="text-xs text-[#87A9A2]">{isEs ? 'días de racha' : 'day streak'}</span></div>
          <div className="h-8 w-px bg-white/9" />
          <div><span className="block font-mono text-lg font-semibold text-white">{stats.verifiedXP}</span><span className="text-xs text-[#87A9A2]">{isEs ? 'XP verificado' : 'verified XP'}</span></div>
          <div className="h-8 w-px bg-white/9" />
          <div><span className="block font-mono text-lg font-semibold text-white">{completedLessons}</span><span className="text-xs text-[#87A9A2]">{isEs ? 'acciones' : 'completed'}</span></div>
        </div>
      </motion.header>

      <section aria-labelledby="daily-loop-title">
        <div className="mb-3 flex items-end justify-between">
          <div><p className="t1ger-kicker">{isEs ? `Módulo ${currentLevel?.levelNumber || 1}` : `Module ${currentLevel?.levelNumber || 1}`}</p><h2 id="daily-loop-title" className="mt-1 text-lg font-semibold tracking-[-0.02em] text-white">{currentLevel?.title}</h2></div>
          <button onClick={() => setActiveView('learn')} className="text-xs font-semibold text-[var(--t1ger-orange)] hover:text-[#FF9A63]">{isEs ? 'Ver ruta' : 'View path'}</button>
        </div>

        <div className="space-y-3">
          <article className="t1ger-panel p-5">
            <div className="flex items-start gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${pipeline?.completedLearn ? 'bg-[#3FC78E]/15 text-[#67D5A4]' : 'bg-[var(--t1ger-orange)]/12 text-[var(--t1ger-orange)]'}`}>
                {pipeline?.completedLearn ? <CheckCircle2 size={22} /> : <BookOpen size={22} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="t1ger-kicker">01 · {isEs ? 'Aprender' : 'Learn'}</p>
                <h3 className="mt-1.5 text-base font-semibold text-white">{learnNode?.title || (isEs ? 'Lección del día completada' : 'Daily lesson complete')}</h3>
                <p className="mt-2 text-xs leading-5 text-[#87A9A2]">{isEs ? 'Una idea clara, una comprobación breve y sin atajos.' : 'One clear idea, one short comprehension check, no shortcuts.'}</p>
                <button disabled={!learnNode || pipeline?.completedLearn} onClick={() => learnNode && onStartMission(learnNode)} className="t1ger-primary-button mt-4 w-full disabled:opacity-35">
                  {pipeline?.completedLearn ? (isEs ? 'Completado hoy' : 'Completed today') : (isEs ? 'Empezar lección' : 'Start lesson')} {!pipeline?.completedLearn && <ArrowRight size={17} />}
                </button>
              </div>
            </div>
          </article>

          <article className="t1ger-panel p-5">
            <div className="flex items-start gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${pipeline?.completedApply ? 'bg-[#3FC78E]/15 text-[#67D5A4]' : applyNode ? 'bg-[#173F38] text-[var(--t1ger-orange)]' : 'bg-white/5 text-[#567A73]'}`}>
                {pipeline?.completedApply ? <ShieldCheck size={22} /> : applyNode ? <Target size={22} /> : <LockKeyhole size={20} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="t1ger-kicker">02 · {isEs ? 'Aplicar' : 'Apply'}</p>
                <h3 className="mt-1.5 text-base font-semibold text-white">{applyNode?.title || (isEs ? 'Se desbloquea al terminar el módulo' : 'Unlocks when this module is learned')}</h3>
                <p className="mt-2 text-xs leading-5 text-[#87A9A2]">{applyNode ? (isEs ? 'Convierte el concepto en evidencia real o simulada.' : 'Turn the concept into real or simulated evidence.') : (isEs ? 'Completa las lecciones en orden para abrir la misión.' : 'Complete the lessons in order to open this mission.')}</p>
                <button disabled={!applyNode || pipeline?.completedApply} onClick={() => applyNode && onStartMission(applyNode)} className="t1ger-secondary-button mt-4 w-full disabled:opacity-35">
                  {pipeline?.completedApply ? (isEs ? 'Evidencia guardada' : 'Evidence saved') : applyNode ? (isEs ? 'Ejecutar misión' : 'Execute mission') : (isEs ? 'Aún bloqueado' : 'Still locked')}
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <button onClick={() => setActiveView('coach')} className="group flex w-full items-center gap-4 rounded-[1.5rem] bg-[var(--t1ger-orange)] px-5 py-4 text-left text-[#102622] shadow-[0_14px_32px_rgba(239,112,48,.2)] transition hover:bg-[#F68045] active:scale-[.985]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102622] text-[var(--t1ger-orange)]"><TrendingUp size={20} /></div>
        <div className="flex-1"><strong className="block text-sm font-semibold">{isEs ? 'Pregunta al mentor' : 'Ask the mentor'}</strong><span className="text-xs text-[#254A43]">{isEs ? 'Aclara un concepto antes de invertir.' : 'Clarify a concept before you act.'}</span></div>
        <ArrowRight size={18} />
      </button>
    </div>
  );
};
