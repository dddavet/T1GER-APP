export type AppMode = 'prototype' | 'production';

const configuredMode = import.meta.env.VITE_APP_MODE;

export const APP_MODE: AppMode = configuredMode === 'production'
  ? 'production'
  : configuredMode === 'prototype'
    ? 'prototype'
    : import.meta.env.DEV
      ? 'prototype'
      : 'production';

export const IS_PROTOTYPE = APP_MODE === 'prototype';
export const AUTH_BYPASS_ENABLED = IS_PROTOTYPE && import.meta.env.VITE_AUTH_DISABLED !== 'false';
