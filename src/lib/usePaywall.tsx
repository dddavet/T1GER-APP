import React from 'react';

export const usePaywall = () => {
  const checkAccess = () => true;
  const Paywall = () => null;
  return { checkAccess, Paywall };
};
