import React, { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { ArrowRight, Camera, CheckCircle, FileText, ImageSquare, LockKey, SpinnerGap, WarningCircle, X } from '@phosphor-icons/react';
import { useBrain } from '../contexts/BrainContext';
import { FieldMissionService, type FieldEvidence, type FieldMission, type FieldProofKind } from '../services/fieldMissionService';
import { verifyMissionProof, verifyWrittenActionProof } from '../services/gemini';
import { ProofVerificationService } from '../services/proofVerificationService';

interface TacticalProofModalProps {
  task: { id: string; label: string; type: string };
  fieldMission?: FieldMission;
  onClose: () => void;
  onViewVault?: () => void;
  onVerify: (proofUrl?: string, proofText?: string, verified?: boolean) => void | Promise<void>;
}

type ProofStage = 'capture' | 'verifying' | 'approved';

const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

export const TacticalProofModal: React.FC<TacticalProofModalProps> = ({ task, fieldMission, onClose, onViewVault, onVerify }) => {
  const { language } = useBrain();
  const isEs = language === 'es';
  const allowedKinds = fieldMission?.proofKinds || ['camera', 'screenshot', 'text'];
  const [kind, setKind] = useState<FieldProofKind>(allowedKinds[0] || 'text');
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [fileName, setFileName] = useState('t1ger-proof.jpg');
  const [text, setText] = useState('');
  const [stage, setStage] = useState<ProofStage>('capture');
  const [error, setError] = useState<string | null>(null);
  const totalRewardXP = (fieldMission?.lessonXp || 0) + (fieldMission?.executionXp || 50);
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const labels = useMemo<Record<FieldProofKind, string>>(() => ({
    camera: isEs ? 'Foto' : 'Camera', screenshot: isEs ? 'Captura' : 'Screenshot', text: isEs ? 'Reporte' : 'Report',
  }), [isEs]);
  const haptic = (strong = false) => navigator.vibrate?.(strong ? [18, 24, 36] : 10);

  const acceptFile = async (file?: File) => {
    if (!file) return;
    setImage(await fileToDataUrl(file));
    setMimeType(file.type || 'image/jpeg');
    setFileName(file.name || 't1ger-proof.jpg');
    setError(null);
    haptic();
  };

  const captureNative = async () => {
    haptic();
    if (!Capacitor.isNativePlatform()) {
      cameraInput.current?.click();
      return;
    }
    try {
      const photo = await CapacitorCamera.getPhoto({
        quality: 82, allowEditing: false, resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera, correctOrientation: true,
      });
      if (!photo.dataUrl) throw new Error('Camera returned no image data.');
      setImage(photo.dataUrl);
      setMimeType(`image/${photo.format || 'jpeg'}`);
      setFileName(`t1ger-proof.${photo.format || 'jpeg'}`);
      setError(null);
    } catch (captureError) {
      const message = captureError instanceof Error ? captureError.message : '';
      if (!/cancel/i.test(message)) setError(isEs ? 'No pudimos abrir la cámara. Revisa el permiso o usa una captura.' : 'We could not open the camera. Check permission or use a screenshot.');
    }
  };

  const handleVerify = async () => {
    const evidence: FieldEvidence = kind === 'text'
      ? { kind, text: text.trim() }
      : { kind, dataUrl: image || undefined, mimeType, fileName };
    if ((kind === 'text' && text.trim().length < 24) || (kind !== 'text' && !image)) return;

    haptic(true);
    setError(null);
    setStage('verifying');
    if (fieldMission) FieldMissionService.updateStatus(fieldMission.userId, fieldMission.id, 'pending_review');

    try {
      let approved = false;
      let verificationMessage = '';
      let cloudSubmissionId: string | undefined;
      let cloudProofURL: string | undefined;
      if (fieldMission) {
        const result = await ProofVerificationService.verify(fieldMission, evidence);
        approved = result.status === 'APPROVED';
        verificationMessage = result.feedback;
        cloudSubmissionId = result.submissionId;
        cloudProofURL = result.proofURL;
      } else if (kind === 'text') {
        const result = await verifyWrittenActionProof(task.label, fieldMission?.proofPrompt || task.label, text, language);
        approved = result.status === 'APPROVED';
        verificationMessage = result.feedback;
      } else {
        try {
          const result = await verifyMissionProof(task.type, `${task.label}. ${fieldMission?.proofPrompt || ''}`, image || '', mimeType);
          approved = result.status === 'APPROVED';
          verificationMessage = result.message || (isEs ? 'Evidencia validada.' : 'Evidence validated.');
        } catch (verificationError) {
          if (!import.meta.env.DEV) throw verificationError;
          approved = true;
          verificationMessage = isEs ? 'Evidencia guardada en modo local para revisión diferida.' : 'Evidence stored locally for deferred review.';
        }
      }

      if (!approved) {
        if (fieldMission) FieldMissionService.updateStatus(fieldMission.userId, fieldMission.id, 'needs_revision');
        setError(verificationMessage || (isEs ? 'La prueba no demuestra la acción. Hazla visible e inténtalo otra vez.' : 'The proof does not show the action. Make it visible and try again.'));
        setStage('capture');
        haptic(true);
        return;
      }

      let proofUrl = evidence.dataUrl;
      if (fieldMission) {
        const submission = await FieldMissionService.submitApproved(fieldMission, evidence, verificationMessage, cloudSubmissionId, cloudProofURL);
        // Image blobs live in IndexedDB offline and Storage online; never copy a
        // multi-megabyte data URL into BrainContext/localStorage.
        proofUrl = submission.proofUrl;
      }
      await onVerify(proofUrl, evidence.text, true);
      setStage('approved');
      haptic(true);
    } catch (verificationError) {
      console.error('Tactical proof verification failed:', verificationError);
      if (fieldMission) FieldMissionService.updateStatus(fieldMission.userId, fieldMission.id, 'ready');
      const authRequired = verificationError instanceof Error && verificationError.message.includes('AUTH_REQUIRED_FOR_VERIFICATION');
      setError(authRequired
        ? (isEs ? 'Crea o inicia sesión para verificar evidencia y obtener XP oficial.' : 'Create or sign in to verify evidence and earn official XP.')
        : (isEs ? 'La auditoría no está disponible. Tu prueba sigue en el dispositivo; reintenta sin perderla.' : 'The audit is unavailable. Your proof remains on this device; retry without losing it.'));
      setStage('capture');
    }
  };

  const ready = kind === 'text' ? text.trim().length >= 24 : Boolean(image);
  const modal = (
    <div className="fixed inset-0 z-[240] flex min-h-[100dvh] items-end justify-center overflow-y-auto bg-[#050506]/92 text-white backdrop-blur-xl sm:items-center sm:p-5">
      <motion.div initial={{ opacity: 0, y: 36, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative w-full max-w-md overflow-hidden rounded-t-[2rem] border border-white/10 bg-[#101014] shadow-[0_-24px_80px_rgba(0,0,0,.55)] sm:rounded-[2rem]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_-35%,rgba(255,115,0,.28),transparent_70%)]" />
        <div className="relative max-h-[94dvh] overflow-y-auto p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:p-6">
          <header className="flex items-start justify-between gap-4">
            <div><p className="font-mono text-[9px] font-bold uppercase tracking-[.22em] text-[#FF8A2A]">PROOF OF WORK · +{totalRewardXP} XP</p><h2 className="mt-2 text-2xl font-bold tracking-[-.03em]">{task.label}</h2>{fieldMission && <p className="mt-2 text-xs leading-relaxed text-zinc-400">{fieldMission.proofPrompt}</p>}</div>
            <button type="button" onClick={onClose} className="t1ger-icon-button shrink-0" aria-label={isEs ? 'Cerrar' : 'Close'}><X size={18} weight="bold" /></button>
          </header>

          <AnimatePresence mode="wait">
            {stage === 'approved' ? (
              <motion.section key="approved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center">
                <CheckCircle size={68} weight="fill" className="mx-auto text-emerald-400" />
                <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[.2em] text-emerald-400">{isEs ? 'PRUEBA VERIFICADA' : 'PROOF VERIFIED'}</p>
                <h3 className="mt-2 text-3xl font-bold">+{totalRewardXP} XP</h3>
                <p className="mt-2 text-sm text-zinc-400">{isEs ? 'Racha protegida. Vitales restauradas. Artefacto guardado.' : 'Streak protected. Vitals restored. Artifact saved.'}</p>
                <button type="button" onClick={onViewVault || onClose} className="t1ger-primary-button mt-8 w-full">{isEs ? 'Ver mi Vault' : 'View my Vault'}<ArrowRight size={19} weight="bold" /></button>
              </motion.section>
            ) : (
              <motion.section key="capture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${allowedKinds.length}, minmax(0, 1fr))` }}>
                  {allowedKinds.map((proofKind) => {
                    const Icon = proofKind === 'camera' ? Camera : proofKind === 'screenshot' ? ImageSquare : FileText;
                    return <button key={proofKind} type="button" disabled={stage === 'verifying'} onClick={() => { setKind(proofKind); setError(null); haptic(); }} className={`rounded-xl border px-2 py-3 text-[10px] font-bold uppercase tracking-wide transition ${kind === proofKind ? 'border-[#FF7300]/70 bg-[#FF7300]/12 text-white' : 'border-white/8 bg-white/[.025] text-zinc-500'}`}><Icon size={18} weight="bold" className="mx-auto mb-1" />{labels[proofKind]}</button>;
                  })}
                </div>

                <div className="mt-4 min-h-56 rounded-2xl border border-dashed border-white/12 bg-black/25 p-4">
                  {kind === 'text' ? (
                    <textarea autoFocus value={text} onChange={(event) => setText(event.target.value)} placeholder={isEs ? 'Describe qué hiciste, dónde y qué resultado observable generaste…' : 'Describe what you did, where, and the observable result you created…'} className="h-52 w-full resize-none bg-transparent text-sm leading-relaxed text-white outline-none placeholder:text-zinc-600" />
                  ) : image ? (
                    <div className="relative"><img src={image} alt={isEs ? 'Vista previa de la prueba' : 'Proof preview'} className="h-52 w-full rounded-xl object-cover" /><button type="button" onClick={() => setImage(null)} className="absolute right-2 top-2 rounded-full border border-white/15 bg-black/75 p-2"><X size={15} weight="bold" /></button></div>
                  ) : (
                    <button type="button" onClick={kind === 'camera' ? captureNative : () => galleryInput.current?.click()} className="flex h-52 w-full flex-col items-center justify-center text-center">
                      <span className="grid h-16 w-16 place-items-center rounded-2xl border border-[#FF7300]/25 bg-[#FF7300]/10 text-[#FF8A2A]">{kind === 'camera' ? <Camera size={30} weight="bold" /> : <ImageSquare size={30} weight="bold" />}</span>
                      <strong className="mt-4 text-sm">{kind === 'camera' ? (isEs ? 'Abrir cámara' : 'Open camera') : (isEs ? 'Elegir captura' : 'Choose screenshot')}</strong>
                      <span className="mt-1 text-[11px] text-zinc-500">{isEs ? 'Oculta datos financieros o personales sensibles.' : 'Hide sensitive financial or personal data.'}</span>
                    </button>
                  )}
                  <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => void acceptFile(event.target.files?.[0])} />
                  <input ref={galleryInput} type="file" accept="image/*" className="hidden" onChange={(event) => void acceptFile(event.target.files?.[0])} />
                </div>

                {error && <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex gap-3 rounded-xl border border-red-400/25 bg-red-400/[.08] p-3 text-xs leading-relaxed text-red-200"><WarningCircle size={18} weight="fill" className="shrink-0" />{error}</motion.div>}
                {stage === 'verifying' && <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-400/[.07] p-3"><span className="flex items-center gap-2 text-xs font-semibold text-amber-100"><SpinnerGap className="animate-spin" size={17} weight="bold" />{isEs ? 'Auditando evidencia…' : 'Auditing evidence…'}</span><span className="font-mono text-[10px] font-bold text-amber-300">+{totalRewardXP} XP {isEs ? 'PENDIENTES' : 'PENDING'}</span></div>}

                <button type="button" onClick={() => void handleVerify()} disabled={!ready || stage === 'verifying'} className="t1ger-primary-button mt-5 w-full disabled:cursor-not-allowed disabled:opacity-35">
                  {stage === 'verifying' ? <SpinnerGap className="animate-spin" size={19} weight="bold" /> : <LockKey size={19} weight="bold" />}
                  {stage === 'verifying' ? (isEs ? 'Verificando…' : 'Verifying…') : (isEs ? 'Enviar prueba y asegurar racha' : 'Submit proof and secure streak')}
                </button>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
};
