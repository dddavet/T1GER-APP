import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function triggerHaptic(pattern: number | number[]) {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(pattern);
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  userFriendlyMessage: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function getFriendlyErrorMessage(error: any): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('permission-denied')) {
    return "You don't have permission to perform this action. Please check your account settings or contact support.";
  }
  if (message.includes('not-found')) {
    return "The requested data could not be found. It might have been deleted or moved.";
  }
  if (message.includes('unavailable')) {
    return "The service is currently unavailable. Please check your internet connection and try again later.";
  }
  if (message.includes('deadline-exceeded')) {
    return "The request took too long to complete. Please try again.";
  }
  if (message.includes('unauthenticated')) {
    return "You are not logged in. Please sign in to continue.";
  }

  return "An unexpected error occurred while accessing the database. Please try again later.";
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, auth: any) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    userFriendlyMessage: getFriendlyErrorMessage(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map((provider: any) => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
