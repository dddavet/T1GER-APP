import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, auth } from '../firebase';
import type { FieldEvidence, FieldMission } from './fieldMissionService';

export interface ServerProofDecision {
  status: 'APPROVED' | 'REJECTED';
  confidence: number;
  feedback: string;
  submissionId?: string;
  proofURL?: string;
  rewardXP?: number;
  xp?: number;
  verifiedXP?: number;
  weeklyXP?: number;
  coins?: number;
  level?: number;
  streak?: number;
  alreadyRewarded?: boolean;
}

export interface OnboardingRewardResult {
  xp: number;
  coins: number;
  alreadyRewarded: boolean;
}

const functions = getFunctions(app, 'us-central1');

export const ProofVerificationService = {
  async verify(mission: FieldMission, evidence: FieldEvidence): Promise<ServerProofDecision> {
    if (!auth.currentUser || auth.currentUser.uid !== mission.userId) {
      throw new Error('AUTH_REQUIRED_FOR_VERIFICATION');
    }
    const verify = httpsCallable<Record<string, unknown>, ServerProofDecision>(functions, 'verifyFieldMissionProof');
    const result = await verify({
      missionId: mission.id,
      lessonId: mission.lessonId,
      language: document.documentElement.lang?.startsWith('es') ? 'es' : 'en',
      evidenceKind: evidence.kind,
      proofText: evidence.text || '',
      imageBase64: evidence.dataUrl || '',
      mimeType: evidence.mimeType || 'image/jpeg',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    });
    return result.data;
  },

  async claimOnboardingReward(): Promise<OnboardingRewardResult | null> {
    if (!auth.currentUser) return null;
    const claim = httpsCallable<Record<string, never>, OnboardingRewardResult>(functions, 'claimOnboardingReward');
    return (await claim({})).data;
  },
};
