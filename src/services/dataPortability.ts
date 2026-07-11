import { type AppUser } from '../contexts/AuthContext';
import { type BrainState } from './brainService';

const EXPORT_VERSION = 1;
const LOCAL_PREFIXES = ['t1ger_', 'tiger_'];

export interface T1gerDataExport {
  app: 'T1GER';
  version: number;
  exportedAt: string;
  user: Pick<AppUser, 'uid' | 'email' | 'displayName' | 'role' | 'isFounder'> | null;
  appUser: AppUser | null;
  brainState: BrainState;
  localData: Record<string, string>;
}

export function collectT1gerLocalData() {
  const data: Record<string, string> = {};

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;
    if (!LOCAL_PREFIXES.some(prefix => key.startsWith(prefix))) continue;

    const value = localStorage.getItem(key);
    if (value !== null) {
      data[key] = value;
    }
  }

  return data;
}

export function buildT1gerDataExport(appUser: AppUser | null, brainState: BrainState): T1gerDataExport {
  return {
    app: 'T1GER',
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    user: appUser
      ? {
          uid: appUser.uid,
          email: appUser.email,
          displayName: appUser.displayName,
          role: appUser.role,
          isFounder: appUser.isFounder,
        }
      : null,
    appUser,
    brainState,
    localData: collectT1gerLocalData(),
  };
}

export function downloadT1gerDataExport(appUser: AppUser | null, brainState: BrainState) {
  const payload = buildT1gerDataExport(appUser, brainState);
  const filenameDate = new Date().toISOString().slice(0, 10);
  const filename = `t1ger-export-${filenameDate}.json`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function readT1gerDataExport(file: File): Promise<T1gerDataExport> {
  const raw = await file.text();
  const parsed = JSON.parse(raw) as T1gerDataExport;

  if (parsed.app !== 'T1GER' || typeof parsed.version !== 'number') {
    throw new Error('This file is not a valid T1GER export.');
  }

  if (!parsed.brainState || !parsed.localData) {
    throw new Error('This T1GER export is missing required progress data.');
  }

  return parsed;
}

export function restoreT1gerDataExport(payload: T1gerDataExport) {
  Object.entries(payload.localData).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
}
