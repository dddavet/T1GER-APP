import type { TrackType } from './missionBank';

export type OnboardingCourseTopic =
  | 'technology'
  | 'business'
  | 'investing'
  | 'mindset'
  | 'productivity'
  | 'history'
  | 'finance'
  | 'tech'
  | 'skills';

export type OnboardingKnowledgeLevel = 'zero' | 'basic' | 'intermediate' | 'competent' | 'advanced';

export const DEFAULT_ONBOARDING_TOPIC: OnboardingCourseTopic = 'investing';

export const ONBOARDING_TOPIC_TRACK: Record<OnboardingCourseTopic, TrackType> = {
  technology: 'ai',
  business: 'business',
  investing: 'investing',
  mindset: 'mindset',
  productivity: 'performance',
  history: 'history',
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
  return ONBOARDING_TOPIC_TRACK[topic] || 'investing';
}

export function getOnboardingInitialPathwayId(topic: OnboardingCourseTopic): string {
  switch (topic) {
    case 'technology':
    case 'tech':
      return 'tech-ai';
    case 'business':
    case 'skills':
      return 'biz-marketing';
    case 'investing':
    case 'finance':
      return 'biz-capital';
    case 'mindset':
      return 'psych-biases';
    case 'productivity':
      return 'prod-deepwork';
    case 'history':
      return 'hist-strategy';
    default:
      return 'invest-value';
  }
}

export function getOnboardingExperienceLevel(level: OnboardingKnowledgeLevel): number {
  return ONBOARDING_KNOWLEDGE_SCORE[level];
}
