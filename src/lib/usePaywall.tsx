import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const usePaywall = () => {
  const { appUser } = useAuth();
  const checkAccess = () => Boolean(appUser?.isPro || appUser?.isFounder);
  const Paywall = () => null;
  return { checkAccess, Paywall };
};
