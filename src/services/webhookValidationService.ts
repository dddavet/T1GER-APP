import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { Mission } from './missionBank';

export interface WebhookConfig {
  serviceId: 'github' | 'todoist' | 'oura' | 'apple_health';
  endpointId: string;
  enabled: boolean;
  rules: {
    minimumCommits?: number;
    targetProjectId?: string;
    targetHeartRate?: number;
    minimumSteps?: number;
  };
}

export interface WebhookEventPayload {
  service: string;
  action: string;
  value: number;
  timestamp: string;
  userId: string;
}

/**
 * Validates an incoming webhook payload and maps it to a T1GER completion event.
 * In production, this would be an edge function/cloud function. For Local-First architecture, 
 * this handles the local optimistic validation if the webhook hits the client or PWA directly.
 */
export const processWebhookValidation = async (payload: WebhookEventPayload, currentStats: any) => {
  console.log(`[T1GER AUTO-VALIDATION] Received payload from ${payload.service}`);
  
  let isValidated = false;
  let xpReward = 0;
  let validationMessage = '';

  switch (payload.service) {
    case 'github':
      if (payload.action === 'push' && payload.value >= 1) {
        isValidated = true;
        xpReward = 50;
        validationMessage = `GitHub Commit Auto-Validated.`;
      }
      break;
    case 'todoist':
      if (payload.action === 'item:completed') {
        isValidated = true;
        xpReward = 30;
        validationMessage = `Todoist Task Auto-Validated.`;
      }
      break;
    case 'oura':
      if (payload.action === 'sleep_score' && payload.value >= 80) {
        isValidated = true;
        xpReward = 40;
        validationMessage = `Oura Recovery Auto-Validated (Score: ${payload.value}).`;
      }
      break;
    default:
      validationMessage = `Unknown service: ${payload.service}`;
  }

  if (isValidated) {
    console.log(`[T1GER AUTO-VALIDATION] Success! ${validationMessage} Awarding +${xpReward} XP.`);
    // In a real implementation, we would update Firestore or LocalDB here
    // updateAppUser({ xp: currentStats.xp + xpReward });
  }

  return { isValidated, xpReward, validationMessage };
};

export const linkExternalApi = async (userId: string, config: WebhookConfig) => {
  console.log(`[T1GER API LINK] Linking ${config.serviceId} for user ${userId}`);
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      activeWebhooks: arrayUnion(config)
    });
    return true;
  } catch (e) {
    console.error('Failed to link external API:', e);
    return false;
  }
};
