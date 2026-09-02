import type { TrackType } from './missionBank';

export type OnboardingCourseTopic = 'finance' | 'tech' | 'skills';
export type OnboardingKnowledgeLevel = 'zero' | 'basic' | 'intermediate' | 'competent' | 'advanced';

export const ONBOARDING_TOPIC_TRACK: Record<OnboardingCourseTopic, TrackType> = {
  finance: 'investing',
  tech: 'ai',
  skills: 'business',
};

export const ONBOARDING_KNOWLEDGE_SCORE: Record<OnboardingKnowledgeLevel, number> = {
  zero: 1,
  basic: 2,
  intermediate: 3,
  competent: 4,
  advanced: 5,
};

export function getOnboardingTrack(topic: OnboardingCourseTopic): TrackType {
  return ONBOARDING_TOPIC_TRACK[topic];
}

export function getOnboardingExperienceLevel(level: OnboardingKnowledgeLevel): number {
  return ONBOARDING_KNOWLEDGE_SCORE[level];
}
