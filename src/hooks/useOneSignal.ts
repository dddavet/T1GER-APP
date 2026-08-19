import { useEffect, useState, useCallback } from 'react';
import { OneSignalService, type NotificationPayloadData } from '../services/oneSignalService';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';

export interface UseOneSignalReturn {
  isPermissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  updateUserTags: () => Promise<void>;
  triggerDeepLink: (data: NotificationPayloadData) => void;
}

/**
 * Custom React Hook for OneSignal Push Notifications & Streak Retention
 */
export const useOneSignal = (): UseOneSignalReturn => {
  const { appUser } = useAuth();
  const { brainState, language } = useBrain();
  const { stats } = useT1ger();
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(() =>
    OneSignalService.isPermissionGranted()
  );

  useEffect(() => {
    // Check permission state on mount
    setIsPermissionGranted(OneSignalService.isPermissionGranted());
  }, []);

  // Update user ID and tags whenever auth, streak, or XP changes
  useEffect(() => {
    if (appUser?.uid) {
      OneSignalService.identifyUser(appUser.uid, {
        streak_days: brainState.learnStreak,
        verified_xp: stats.verifiedXP,
        language: language,
      });
    }
  }, [appUser?.uid, brainState.learnStreak, stats.verifiedXP, language]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await OneSignalService.requestPermission();
    setIsPermissionGranted(granted);
    return granted;
  }, []);

  const updateUserTags = useCallback(async (): Promise<void> => {
    if (appUser?.uid) {
      await OneSignalService.updateStreakTags(
        brainState.learnStreak,
        stats.verifiedXP,
        'Amber'
      );
    }
  }, [appUser?.uid, brainState.learnStreak, stats.verifiedXP]);

  const triggerDeepLink = useCallback((data: NotificationPayloadData): void => {
    OneSignalService.handleDeepLink(data);
  }, []);

  return {
    isPermissionGranted,
    requestPermission,
    updateUserTags,
    triggerDeepLink,
  };
};
