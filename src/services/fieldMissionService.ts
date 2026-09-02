import { collection, doc, serverTimestamp, setDoc, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { AtomicLesson, LearningLocale, SavedLearningArtifact } from './interactiveCurriculumTypes';
import { localizeLearning } from './interactiveCurriculumTypes';
import type { BankMission } from './missionBank';
import { FIELD_MISSION_CATALOG } from '../../functions/src/fieldMissionCatalog';

export type FieldMissionStatus = 'ready' | 'pending_review' | 'needs_revision' | 'verified';
export type FieldProofKind = 'camera' | 'screenshot' | 'text';

export interface FieldMission {
  id: string;
  userId: string;
  lessonId: string;
  trackId: string;
  title: string;
  description: string;
  instructions: string[];
  supportTitle: string;
  supportPayload: string;
  proofPrompt: string;
  proofKinds: FieldProofKind[];
  status: FieldMissionStatus;
  lessonXp: number;
  executionXp: 50;
  createdAt: number;
  updatedAt: number;
  autoOpen: boolean;
  submission?: FieldSubmission;
}

export interface FieldEvidence {
  kind: FieldProofKind;
  dataUrl?: string;
  text?: string;
  mimeType?: string;
  fileName?: string;
}

export interface FieldSubmission {
  id: string;
  missionId: string;
  lessonId: string;
  evidenceKind: FieldProofKind;
  proofUrl?: string;
  proofText?: string;
  localCacheKey?: string;
  verified: boolean;
  verificationMessage: string;
  createdAt: number;
  cloudSynced: boolean;
}

export const FIELD_MISSION_EVENT = 't1ger_field_missions_changed';
const STORE_PREFIX = 't1ger_field_missions_v1_';
const DB_NAME = 't1ger-proof-cache';
const DB_STORE = 'evidence';

const blueprintByLesson = FIELD_MISSION_CATALOG;

const localeTuple = (copy: [string, string], locale: LearningLocale) => locale === 'es' ? copy[0] : copy[1];
const storageKey = (userId: string) => `${STORE_PREFIX}${userId || 'local'}`;

function emitChange() {
  window.dispatchEvent(new CustomEvent(FIELD_MISSION_EVENT));
}

function readLocal(userId: string): FieldMission[] {
  try { return JSON.parse(localStorage.getItem(storageKey(userId)) || '[]') as FieldMission[]; } catch { return []; }
}

function writeLocal(userId: string, missions: FieldMission[]) {
  localStorage.setItem(storageKey(userId), JSON.stringify(missions));
  emitChange();
}

function upsertLocal(mission: FieldMission) {
  const current = readLocal(mission.userId);
  writeLocal(mission.userId, [mission, ...current.filter((item) => item.id !== mission.id)].sort((a, b) => b.updatedAt - a.updatedAt));
}

function openCache(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(DB_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function cacheBlob(key: string, blob: Blob): Promise<void> {
  const database = await openCache();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(DB_STORE, 'readwrite');
    transaction.objectStore(DB_STORE).put(blob, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

async function readCachedBlob(key: string): Promise<Blob | undefined> {
  const database = await openCache();
  const result = await new Promise<Blob | undefined>((resolve, reject) => {
    const request = database.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).get(key);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return result;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, body] = dataUrl.split(',');
  const mimeType = header.match(/data:(.*?);/)?.[1] || 'image/jpeg';
  const bytes = atob(body);
  const array = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index += 1) array[index] = bytes.charCodeAt(index);
  return new Blob([array], { type: mimeType });
}

export const FieldMissionService = {
  async clearUserCache(userId: string): Promise<void> {
    const database = await openCache();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(DB_STORE, 'readwrite');
        const cursor = transaction.objectStore(DB_STORE).openCursor();
        cursor.onsuccess = () => {
          const item = cursor.result;
          if (!item) return;
          if (String(item.key).startsWith(`${userId}/`)) item.delete();
          item.continue();
        };
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } finally { database.close(); }
    localStorage.removeItem(storageKey(userId));
  },

  subscribe(userId: string): () => void {
    if (auth.currentUser?.uid !== userId) return () => undefined;
    return onSnapshot(query(collection(db, 'missions'), where('userId', '==', userId)), snapshot => {
      for (const item of snapshot.docs) {
        const data = item.data();
        if (data.status !== 'verified' || !data.lessonId || !data.submission) continue;
        const previous = readLocal(userId).find(mission => mission.id === data.missionId);
        upsertLocal({
          ...previous, id: data.missionId, userId, lessonId: data.lessonId, trackId: data.trackId || '',
          title: data.title, description: data.description || data.title, instructions: data.instructions || [],
          supportTitle: previous?.supportTitle || '', supportPayload: previous?.supportPayload || '',
          proofPrompt: data.proofPrompt || '', proofKinds: data.proofKinds || ['text'], status: 'verified',
          lessonXp: data.lessonXp, executionXp: 50, autoOpen: false,
          createdAt: data.verifiedAt?.toMillis?.() || Date.now(), updatedAt: data.updatedAt?.toMillis?.() || Date.now(),
          submission: data.submission,
        });
      }
    }, error => console.warn('Artifact sync unavailable:', error.code));
  },

  list(userId: string): FieldMission[] {
    return readLocal(userId);
  },

  queueFromLesson(lesson: AtomicLesson, artifact: SavedLearningArtifact, userId: string, locale: LearningLocale): FieldMission {
    const blueprint = blueprintByLesson[lesson.id];
    const now = Date.now();
    const previous = readLocal(userId).find((item) => item.lessonId === lesson.id);
    // Reviewing a completed lesson must never overwrite its verified artifact.
    if (previous?.status === 'verified') return previous;
    const mission: FieldMission = {
      id: `field-${lesson.id}`,
      userId,
      lessonId: lesson.id,
      trackId: lesson.trackId,
      title: locale === 'es' ? `Ejecuta: ${localizeLearning(lesson.title, locale)}` : `Execute: ${localizeLearning(lesson.title, locale)}`,
      description: blueprint ? localeTuple(blueprint.description, locale) : localizeLearning(lesson.objective, locale),
      instructions: blueprint ? blueprint.steps.map((step) => localeTuple(step, locale)) : [localizeLearning(lesson.phases[2].widget.instruction, locale)],
      supportTitle: artifact.title,
      supportPayload: artifact.summary,
      proofPrompt: blueprint ? localeTuple(blueprint.prompt, locale) : localizeLearning(lesson.objective, locale),
      proofKinds: blueprint?.kinds || ['screenshot', 'text'],
      status: previous?.status || 'ready',
      lessonXp: lesson.phases[3].xp,
      executionXp: 50,
      createdAt: previous?.createdAt || now,
      updatedAt: now,
      autoOpen: true,
      submission: previous?.submission,
    };
    upsertLocal(mission);
    return mission;
  },

  queueFromBankMission(mission: BankMission, userId: string, locale: LearningLocale): FieldMission {
    const now = Date.now();
    const fieldMission: FieldMission = {
      id: `field-${mission.id}`,
      userId,
      lessonId: mission.id,
      trackId: mission.competency,
      title: locale === 'es' ? `Ejecuta: ${mission.title}` : `Execute: ${mission.title}`,
      description: mission.taskBrief || mission.keyTakeaway || mission.concept || mission.title,
      instructions: mission.frameworkSteps?.map((step) => `${step.title}: ${step.desc}`) || [mission.taskBrief || mission.title],
      supportTitle: locale === 'es' ? 'Idea dominada' : 'Mastered idea',
      supportPayload: mission.keyTakeaway || mission.concept || mission.title,
      proofPrompt: mission.reflectionPrompt || mission.taskBrief || (locale === 'es' ? 'Demuestra una acción observable.' : 'Show one observable action.'),
      proofKinds: mission.verificationMethod === 'photo' ? ['camera', 'screenshot'] : ['screenshot', 'text'],
      status: 'ready', lessonXp: mission.xpReward || 100, executionXp: 50, createdAt: now, updatedAt: now, autoOpen: true,
    };
    upsertLocal(fieldMission);
    return fieldMission;
  },

  updateStatus(userId: string, missionId: string, status: FieldMissionStatus): FieldMission | undefined {
    const mission = readLocal(userId).find((item) => item.id === missionId);
    if (!mission) return undefined;
    const next = { ...mission, status, updatedAt: Date.now() };
    upsertLocal(next);
    return next;
  },

  clearAutoOpen(userId: string, missionId: string): void {
    const mission = readLocal(userId).find((item) => item.id === missionId);
    if (mission?.autoOpen) upsertLocal({ ...mission, autoOpen: false });
  },

  async submitApproved(mission: FieldMission, evidence: FieldEvidence, verificationMessage: string, cloudSubmissionId?: string, cloudProofURL?: string): Promise<FieldSubmission> {
    const now = Date.now();
    const submissionId = `${mission.id}-${now}`;
    const proofUrl = cloudProofURL || undefined;
    let localCacheKey: string | undefined;
    let cloudSynced = false;
    let blob: Blob | undefined;
    if (evidence.dataUrl) blob = dataUrlToBlob(evidence.dataUrl);

    if (blob) {
      localCacheKey = `${mission.userId}/${submissionId}`;
      try { await cacheBlob(localCacheKey, blob); }
      catch (error) {
        if (!cloudSubmissionId) throw error;
        localCacheKey = undefined; // The canonical server receipt survives unavailable local storage.
      }
    }

    cloudSynced = Boolean(cloudSubmissionId);

    const submission: FieldSubmission = {
      id: cloudSubmissionId || submissionId, missionId: mission.id, lessonId: mission.lessonId, evidenceKind: evidence.kind,
      proofUrl, proofText: evidence.text, localCacheKey, verified: true, verificationMessage, createdAt: now, cloudSynced,
    };
    upsertLocal({ ...mission, status: 'verified', submission, autoOpen: false, updatedAt: now });
    return submission;
  },

  async resolvePreview(submission?: FieldSubmission): Promise<string | undefined> {
    if (submission?.proofUrl) return submission.proofUrl;
    if (!submission?.localCacheKey) return undefined;
    const blob = await readCachedBlob(submission.localCacheKey);
    return blob ? URL.createObjectURL(blob) : undefined;
  },
};
