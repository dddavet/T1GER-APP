import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight, Camera, CheckCircle, Cube, FileText, ImageSquare, LockKey,
  ShieldCheck, Sparkle, Target, Toolbox,
} from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { FIELD_MISSION_EVENT, FieldMissionService, type FieldMission } from '../services/fieldMissionService';
import { MISSION_BANK } from '../services/missionBank';
import { localizeMission } from '../services/contentLocalization';
import { SocialService } from '../services/socialService';
import { fireRewardConfetti } from './ui/confetti';
import { TacticalProofModal } from './TacticalProofModal';
import { OfferForgeSandbox } from './apply/OfferForgeSandbox';
import { PaperTradingSandbox } from './apply/PaperTradingSandbox';
import { CashflowAuditorSandbox } from './apply/CashflowAuditorSandbox';

type BuildView = 'active' | 'vault' | 'tools';
type ToolMode = 'trading' | 'offer' | 'cashflow';

const relativeDate = (timestamp: number, isEs: boolean) => {
  const elapsed = Date.now() - timestamp;
  const days = Math.floor(elapsed / 86_400_000);
  if (days < 1) return isEs ? 'Hoy' : 'Today';
  if (days === 1) return isEs ? 'Ayer' : 'Yesterday';
  return new Intl.DateTimeFormat(isEs ? 'es' : 'en', { month: 'short', day: 'numeric' }).format(new Date(timestamp));
};

export const BuildTab = ({ onStartMission }: { onStartMission?: (mission: unknown) => void }) => {
  const { language, brainState, pathData, completeMission, submitTacticalProof } = useBrain();
  const { addXP, setActiveView } = useT1ger();
  const { appUser } = useAuth();
  const isEs = language === 'es';
  const userId = appUser?.uid || 'local';
  const [view, setView] = useState<BuildView>('active');
  const [toolMode, setToolMode] = useState<ToolMode>('trading');
  const [missions, setMissions] = useState<FieldMission[]>([]);
  const [selectedMission, setSelectedMission] = useState<FieldMission | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const refresh = useCallback(() => setMissions(FieldMissionService.list(userId)), [userId]);

  useEffect(() => {
    refresh();
    const unsubscribe = FieldMissionService.subscribe(userId);
    const onChanged = () => refresh();
    window.addEventListener(FIELD_MISSION_EVENT, onChanged);
    return () => { unsubscribe(); window.removeEventListener(FIELD_MISSION_EVENT, onChanged); };
  }, [refresh, userId]);

  useEffect(() => {
    const autoMission = missions.find((mission) => mission.autoOpen && mission.status !== 'verified');
    if (!autoMission || selectedMission) return;
    setSelectedMission(autoMission);
    FieldMissionService.clearAutoOpen(userId, autoMission.id);
  }, [missions, selectedMission, userId]);

  const completed = useMemo(() => missions.filter((mission) => mission.status === 'verified'), [missions]);
  const active = useMemo(() => missions.filter((mission) => mission.status !== 'verified'), [missions]);

  useEffect(() => {
    let cancelled = false;
    const ownedUrls: string[] = [];
    void Promise.all(completed.map(async (mission) => {
      const preview = await FieldMissionService.resolvePreview(mission.submission);
      if (preview?.startsWith('blob:')) ownedUrls.push(preview);
      return [mission.id, preview] as const;
    })).then((entries) => {
      if (!cancelled) setPreviews(Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => Boolean(entry[1]))));
    });
    return () => {
      cancelled = true;
      ownedUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [completed]);

  const currentLevel = pathData.track.levels[pathData.currentLevelIndex];
  const legacySource = currentLevel?.applyNodeId ? MISSION_BANK.find((item) => item.id === currentLevel.applyNodeId) : undefined;
  const legacyMission = legacySource ? localizeMission(legacySource, language) : undefined;
  const legacyReady = currentLevel?.days.every((day) => brainState.completedDayIds.includes(day.dayId)) || false;

  const verifyMission = async (mission: FieldMission, proofUrl?: string, proofText?: string) => {
    submitTacticalProof(mission.id, proofUrl, proofText, true);
    completeMission(mission.lessonId, 100);
    completeMission(mission.id, 100);
    await addXP(mission.lessonXp + mission.executionXp, 1, `mission:${mission.id}`);
    fireRewardConfetti();
    navigator.vibrate?.([25, 30, 70]);

    if (appUser) {
      void SocialService.publishMissionActivity({
        uid: appUser.uid,
        displayName: appUser.displayName || (isEs ? 'Miembro T1GER' : 'T1GER member'),
        photoURL: appUser.photoURL,
        niche: appUser.niche,
        weeklyXP: appUser.weeklyXP,
        verifiedXP: appUser.verifiedXP,
        currentWeekId: appUser.currentWeekId,
        leagueTier: appUser.leagueTier,
        streak: appUser.streak,
      }, {
        id: mission.id, title: mission.title, type: 'apply', durationMinutes: 3,
        verified: Boolean(proofUrl), proofLabel: proofUrl
          ? (isEs ? 'Artefacto revisado por IA' : 'AI-reviewed artifact')
          : (isEs ? 'Reflexión estructurada' : 'Structured reflection'),
        proofURL: proofUrl?.startsWith('http') ? proofUrl : undefined,
      }).catch((error) => console.warn('Build activity sync deferred:', error));
    }
    refresh();
  };

  const tabs: Array<{ id: BuildView; label: string; icon: typeof Target; count?: number }> = [
    { id: 'active', label: isEs ? 'Ejecutar' : 'Execute', icon: Target, count: active.length },
    { id: 'vault', label: isEs ? 'Victorias' : 'Vault', icon: Cube, count: completed.length },
    { id: 'tools', label: isEs ? 'Herramientas' : 'Tools', icon: Toolbox },
  ];

  const missionStatusLabel = (status: FieldMission['status']) => {
    const labels = {
      ready: isEs ? 'Lista' : 'Ready',
      pending_review: isEs ? 'En revisión' : 'Under review',
      needs_revision: isEs ? 'Requiere cambios' : 'Needs changes',
      verified: isEs ? 'Verificada' : 'Verified',
    };
    return labels[status];
  };

  const toolLabels: Record<ToolMode, string> = {
    trading: isEs ? 'Trading' : 'Trading',
    offer: isEs ? 'Oferta' : 'Offer',
    cashflow: isEs ? 'Caja' : 'Cash flow',
  };

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-28 pt-1 text-white">
      <header className="px-1">
        <div className="flex items-center justify-between gap-4">
          <div><p className="font-mono text-[9px] font-bold uppercase tracking-[.22em] text-[#FF8A2A]">{isEs ? 'APLICAR · PRUEBA REAL' : 'BUILD · PROOF OF WORK'}</p><h1 className="mt-1 text-2xl font-bold tracking-[-.035em]">{isEs ? 'Lo que construyes cuenta.' : 'What you build counts.'}</h1></div>
          <span className="grid h-11 min-w-11 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/[.08] px-2 font-mono text-sm font-bold text-emerald-300">{completed.length}</span>
        </div>
        <p className="mt-2 max-w-[42ch] text-xs leading-relaxed text-zinc-400">{isEs ? 'Las respuestas correctas abren la puerta. La evidencia real libera XP, protege tu racha y restaura a T1GER.' : 'Correct answers open the door. Real evidence unlocks XP, protects your streak, and restores T1GER.'}</p>
      </header>

      <nav className="grid grid-cols-3 gap-1 rounded-2xl border border-white/8 bg-white/[.025] p-1" aria-label={isEs ? 'Secciones de Build' : 'Build sections'}>
        {tabs.map(({ id, label, icon: Icon, count }) => <button key={id} type="button" onClick={() => { setView(id); navigator.vibrate?.(8); }} className={`relative flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[11px] font-semibold transition ${view === id ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500'}`}><Icon size={16} weight={view === id ? 'fill' : 'bold'} />{label}{typeof count === 'number' && count > 0 && <span className="rounded-full bg-[#FF7300] px-1.5 font-mono text-[8px] font-bold text-black">{count}</span>}</button>)}
      </nav>

      <AnimatePresence mode="wait">
        {view === 'active' && <motion.section key="active" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="space-y-4">
          <div className="grid grid-cols-3 divide-x divide-white/8 rounded-2xl border border-white/8 bg-[#121216] py-4 text-center">
            <div><p className="font-mono text-xl font-bold tabular-nums text-[#FF8A2A]">{active.length}</p><span className="text-[9px] uppercase tracking-wider text-zinc-500">{isEs ? 'Activas' : 'Active'}</span></div>
            <div><p className="font-mono text-xl font-bold tabular-nums">+{active.reduce((sum, mission) => sum + mission.lessonXp + mission.executionXp, 0)}</p><span className="text-[9px] uppercase tracking-wider text-zinc-500">XP {isEs ? 'bloq.' : 'locked'}</span></div>
            <div><p className="font-mono text-xl font-bold tabular-nums text-emerald-400">{completed.length}</p><span className="text-[9px] uppercase tracking-wider text-zinc-500">{isEs ? 'Pruebas' : 'Proofs'}</span></div>
          </div>

          {active.length === 0 ? <div className="rounded-[1.75rem] border border-dashed border-white/12 bg-[#121216] px-6 py-9 text-center"><LockKey size={38} weight="duotone" className="mx-auto text-zinc-600" /><h2 className="mt-4 text-lg font-bold">{isEs ? 'Primero domina un nodo' : 'Master a node first'}</h2><p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-zinc-500">{isEs ? 'Termina la micro-herramienta de una lección y su Misión de Campo aparecerá aquí.' : 'Finish a lesson micro-tool and its Field Mission will appear here.'}</p><button type="button" onClick={() => setActiveView('learn')} className="t1ger-primary-button mt-5 w-full">{isEs ? 'Abrir Orb de hoy' : "Open today's Orb"}<ArrowRight size={18} weight="bold" /></button></div> : active.map((mission, missionIndex) => (
            <motion.article key={mission.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden rounded-[1.75rem] border border-[#FF7300]/25 bg-[#121216] shadow-[0_22px_60px_rgba(0,0,0,.38)]">
              <div className="border-b border-white/8 bg-[linear-gradient(115deg,rgba(255,115,0,.13),transparent_58%)] p-5"><div className="flex items-center justify-between"><span className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-[#FF8A2A]">{isEs ? 'MISIÓN DE CAMPO' : 'FIELD MISSION'} {String(missionIndex + 1).padStart(2, '0')}</span><span className={`rounded-full border px-2 py-1 font-mono text-[8px] font-bold uppercase ${mission.status === 'needs_revision' ? 'border-red-400/30 bg-red-400/10 text-red-300' : mission.status === 'pending_review' ? 'border-amber-400/30 bg-amber-400/10 text-amber-300' : 'border-white/10 bg-white/5 text-zinc-400'}`}>{missionStatusLabel(mission.status)}</span></div><h2 className="mt-3 text-xl font-bold leading-tight">{mission.title}</h2><p className="mt-2 text-xs leading-relaxed text-zinc-400">{mission.description}</p></div>
              <div className="p-5">
                <ol className="space-y-3">{mission.instructions.map((instruction, index) => <li key={`${mission.id}-${index}`} className="grid grid-cols-[1.8rem_1fr] gap-3 text-xs leading-relaxed text-zinc-300"><span className="grid h-7 w-7 place-items-center rounded-lg border border-white/8 bg-white/[.035] font-mono text-[10px] font-bold text-[#FF8A2A]">{index + 1}</span><span className="pt-1">{instruction}</span></li>)}</ol>
                <div className="mt-4 rounded-xl border border-white/8 bg-black/25 p-3"><div className="flex items-center gap-2 text-[10px] font-bold text-zinc-300"><Sparkle size={15} weight="fill" className="text-[#FF8A2A]" />{mission.supportTitle}</div><p className="mt-2 line-clamp-4 whitespace-pre-line text-[11px] leading-relaxed text-zinc-500">{mission.supportPayload}</p></div>
                <div className="mt-4 flex items-center gap-2">{mission.proofKinds.map((kind) => <span key={kind} className="inline-flex items-center gap-1 rounded-lg border border-white/8 bg-white/[.025] px-2 py-1 text-[9px] uppercase text-zinc-500">{kind === 'camera' ? <Camera size={12} /> : kind === 'screenshot' ? <ImageSquare size={12} /> : <FileText size={12} />}{kind}</span>)}</div>
                <button type="button" onClick={() => setSelectedMission(mission)} className="t1ger-primary-button mt-5 w-full">{mission.status === 'needs_revision' ? (isEs ? 'Corregir evidencia' : 'Fix evidence') : (isEs ? 'Ejecutar y subir prueba' : 'Execute and upload proof')}<ArrowRight size={19} weight="bold" /></button>
              </div>
            </motion.article>
          ))}

          {legacyMission && <div className="rounded-2xl border border-white/8 bg-[#121216] p-4"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-zinc-400"><Target size={19} weight="bold" /></span><div><span className="font-mono text-[8px] font-bold uppercase tracking-[.16em] text-zinc-500">{isEs ? 'MISIÓN DE NIVEL' : 'LEVEL BOUNTY'}</span><h3 className="mt-1 text-sm font-bold">{legacyMission.title}</h3><p className="mt-1 line-clamp-2 text-[11px] text-zinc-500">{legacyMission.taskBrief}</p></div></div><button type="button" disabled={!legacyReady} onClick={() => onStartMission?.(legacyMission)} className="t1ger-secondary-button mt-3 w-full disabled:opacity-35">{legacyReady ? (isEs ? 'Abrir misión de nivel' : 'Open level bounty') : (isEs ? 'Completa el nivel primero' : 'Complete level first')}<ArrowRight size={16} /></button></div>}
        </motion.section>}

        {view === 'vault' && <motion.section key="vault" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
          <div className="rounded-[1.75rem] border border-emerald-400/15 bg-[linear-gradient(145deg,rgba(16,185,129,.11),rgba(18,18,22,.95)_52%)] p-5"><div className="flex items-start justify-between"><div><p className="font-mono text-[9px] font-bold uppercase tracking-[.2em] text-emerald-400">{isEs ? 'ARCHIVO DE VICTORIAS' : 'THE BUILD VAULT'}</p><h2 className="mt-2 text-2xl font-bold">{completed.length} {isEs ? (completed.length === 1 ? 'victoria real' : 'victorias reales') : (completed.length === 1 ? 'real win' : 'real wins')}</h2></div><ShieldCheck size={34} weight="duotone" className="text-emerald-400" /></div><p className="mt-2 text-xs leading-relaxed text-zinc-400">{isEs ? 'Tu portafolio no muestra intenciones. Muestra cosas que hiciste.' : 'Your portfolio does not show intentions. It shows things you did.'}</p></div>
          {completed.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-sm text-zinc-500">{isEs ? 'Tu primera prueba verificada aparecerá aquí.' : 'Your first verified proof will appear here.'}</div> : <div className="grid grid-cols-2 gap-3">{completed.map((mission) => <article key={mission.id} className="overflow-hidden rounded-2xl border border-white/8 bg-[#121216]">{previews[mission.id] ? <img src={previews[mission.id]} alt={mission.title} className="h-32 w-full object-cover" /> : <div className="flex h-32 items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,115,0,.14),transparent_68%)]"><FileText size={34} weight="duotone" className="text-[#FF8A2A]" /></div>}<div className="p-3"><div className="flex items-center justify-between gap-2"><span className="font-mono text-[8px] uppercase text-emerald-400"><CheckCircle size={11} weight="fill" className="mr-1 inline" />{isEs ? 'VERIFICADA' : 'VERIFIED'}</span><span className="font-mono text-[8px] text-zinc-600">{relativeDate(mission.submission?.createdAt || mission.updatedAt, isEs)}</span></div><h3 className="mt-2 line-clamp-2 text-xs font-bold leading-snug">{mission.title}</h3><p className="mt-2 font-mono text-[10px] font-bold text-[#FF8A2A]">+{mission.lessonXp + mission.executionXp} XP</p></div></article>)}</div>}
        </motion.section>}

        {view === 'tools' && <motion.section key="tools" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="space-y-4"><div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/8 bg-white/[.025] p-1">{(['trading', 'offer', 'cashflow'] as ToolMode[]).map((mode) => <button key={mode} type="button" onClick={() => setToolMode(mode)} className={`rounded-xl py-2 text-[10px] font-bold uppercase ${toolMode === mode ? 'bg-white/10 text-white' : 'text-zinc-500'}`}>{toolLabels[mode]}</button>)}</div>{toolMode === 'trading' ? <PaperTradingSandbox /> : toolMode === 'offer' ? <OfferForgeSandbox /> : <CashflowAuditorSandbox />}</motion.section>}
      </AnimatePresence>

      {selectedMission && <TacticalProofModal task={{ id: selectedMission.id, label: selectedMission.title, type: 'field_mission' }} fieldMission={selectedMission} onClose={() => { setSelectedMission(null); refresh(); }} onViewVault={() => { setSelectedMission(null); setView('vault'); refresh(); }} onVerify={(proofUrl, proofText) => verifyMission(selectedMission, proofUrl, proofText)} />}
    </div>
  );
};
