import type { SavedLearningArtifact } from './interactiveCurriculumTypes';

interface ArtifactStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const CANONICAL_PREFIX = 't1ger_learning_artifacts_v1_';
const LEGACY_PREFIX = 't1ger_learning_artifacts_';

function parseArtifacts(value: string | null): SavedLearningArtifact[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is SavedLearningArtifact => Boolean(item && typeof item === 'object' && typeof (item as SavedLearningArtifact).lessonId === 'string'))
      : [];
  } catch {
    return [];
  }
}

export function readLearningArtifacts(userId: string, storage: ArtifactStorage = localStorage): SavedLearningArtifact[] {
  const canonical = parseArtifacts(storage.getItem(`${CANONICAL_PREFIX}${userId}`));
  const legacy = parseArtifacts(storage.getItem(`${LEGACY_PREFIX}${userId}`));
  const globalCanonical = parseArtifacts(storage.getItem('t1ger_learning_artifacts_v1'));
  const globalLegacy = parseArtifacts(storage.getItem('t1ger_learning_artifacts'));
  const localFallback = userId !== 'local' ? parseArtifacts(storage.getItem(`${CANONICAL_PREFIX}local`)) : [];
  const merged = new Map<string, SavedLearningArtifact>();
  for (const artifact of globalLegacy) merged.set(artifact.lessonId, artifact);
  for (const artifact of globalCanonical) merged.set(artifact.lessonId, artifact);
  for (const artifact of localFallback) merged.set(artifact.lessonId, artifact);
  for (const artifact of legacy) merged.set(artifact.lessonId, artifact);
  for (const artifact of canonical) merged.set(artifact.lessonId, artifact);
  return [...merged.values()].sort((a, b) => b.createdAt - a.createdAt);
}

export function saveLearningArtifact(userId: string, artifact: SavedLearningArtifact, storage: ArtifactStorage = localStorage): void {
  const current = readLearningArtifacts(userId, storage).filter(item => item.lessonId !== artifact.lessonId);
  storage.setItem(`${CANONICAL_PREFIX}${userId}`, JSON.stringify([artifact, ...current].slice(0, 100)));
}
