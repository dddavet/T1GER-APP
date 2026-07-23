import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AUTH_BYPASS_ENABLED } from '../config/appMode';

export interface InvestmentProfile {
  goal: 'first-investment' | 'long-term-wealth' | 'company-analysis' | 'retirement' | 'investing' | 'ai' | 'sales';
  experience: 'new' | 'basic' | 'active';
  riskComfort: 'protect' | 'balanced' | 'growth';
  weeklyCommitment: number;
  contentFormat: 'read' | 'watch' | 'practice';
  learnWithFriends: boolean;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: 'founder' | 'member';
  isFounder?: boolean;
  niche: string;
  goal?: string;
  businessStage?: string;
  dailyTime?: number;
  onboardingStep?: string;
  onboardingComplete?: boolean;
  learningStyle?: 'visual' | 'text' | 'interactive';
  experienceLevel?: number;
  ageRange?: string;
  level: number;
  xp: number;
  streak: number;
  isPro?: boolean;
  isSuperT1ger?: boolean;
  isFlaggedForInterrogation?: boolean;
  coins?: number;
  streakShields?: number;
  activeCoachId?: string;
  lastMissionDate?: any;
  lastActive?: any;
  createdAt?: any;
  energy?: number;
  minimalistMode?: boolean;
  unlockedDenItems?: string[];
  primaryTrack?: 'investing' | 'business' | 'ai';
  investmentProfile?: InvestmentProfile;
  personalizedPlan?: {
    title: string;
    firstLessonId: string;
    weeklyMinutes: number;
    focusAreas: string[];
  };
  acquisitionSource?: string;
}

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  googleSignIn: () => Promise<void>;
  appleSignIn: () => Promise<void>;
  emailPasswordSignIn: (email: string, password: string) => Promise<void>;
  emailPasswordSignUp: (email: string, password: string) => Promise<void>;
  sendEmailSignInLink: (email: string) => Promise<void>;
  updateAppUser: (data: Partial<AppUser>) => Promise<void>;
  logout: () => Promise<void>;
  refreshAppUser: () => Promise<void>;
  loginAsDemoUser: (demoPreset?: 'founder' | 'hunter') => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  loading: false,
  googleSignIn: async () => {},
  appleSignIn: async () => {},
  emailPasswordSignIn: async () => {},
  emailPasswordSignUp: async () => {},
  sendEmailSignInLink: async () => {},
  updateAppUser: async () => {},
  logout: async () => {},
  refreshAppUser: async () => {},
  loginAsDemoUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

const LOCAL_USER_KEY = 't1ger_local_app_user';
const EMAIL_LINK_KEY = 't1ger_email_link_sign_in';
const USE_AUTH_EMULATOR = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
const AUTH_DISABLED_FOR_PROTOTYPE = AUTH_BYPASS_ENABLED;
const FOUNDER_EMAILS = (import.meta.env.VITE_FOUNDER_EMAILS || '')
  .split(',')
  .map((email: string) => email.trim().toLowerCase())
  .filter(Boolean);

function getAccountRole(email?: string | null) {
  const isFounder = Boolean(email && FOUNDER_EMAILS.includes(email.toLowerCase()));
  return {
    role: isFounder ? 'founder' as const : 'member' as const,
    isFounder,
  };
}

function buildLocalSignedInUser(firebaseUser: User): AppUser {
  const localData = getLocalAppUser();
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || localData?.displayName || 'Founder',
    photoURL: firebaseUser.photoURL || localData?.photoURL || '',
    ...getAccountRole(firebaseUser.email),
    niche: localData?.niche || 'none',
    goal: localData?.goal || 'none',
    learningStyle: localData?.learningStyle,
    experienceLevel: localData?.experienceLevel,
    ageRange: localData?.ageRange,
    onboardingStep: localData?.onboardingStep || 'identity',
    onboardingComplete: localData?.onboardingComplete || false,
    level: localData?.level || 1,
    xp: localData?.xp || 0,
    streak: localData?.streak || 0,
    isPro: true,
    streakShields: localData?.streakShields || 0,
    lastMissionDate: localData?.lastMissionDate,
    createdAt: localData?.createdAt,
    lastActive: localData?.lastActive,
  };
}

function buildPrototypeUser(): AppUser {
  const localData = getLocalAppUser();
  return {
    uid: localData?.uid || 'prototype-founder',
    email: localData?.email || 'founder@t1ger.local',
    displayName: localData?.displayName || 'Founder',
    photoURL: localData?.photoURL || '',
    role: 'founder',
    isFounder: true,
    niche: localData?.niche || 'saas',
    goal: localData?.goal || 'Build T1GER MVP',
    businessStage: localData?.businessStage || 'prototype',
    dailyTime: localData?.dailyTime || 20,
    onboardingStep: localData?.onboardingStep || 'complete',
    onboardingComplete: localData?.onboardingComplete ?? true,
    learningStyle: localData?.learningStyle || 'text',
    experienceLevel: localData?.experienceLevel || 22,
    ageRange: localData?.ageRange || '18-25',
    level: localData?.level || 1,
    xp: localData?.xp || 0,
    streak: localData?.streak || 0,
    isPro: localData?.isPro ?? false,
    coins: localData?.coins || 0,
    streakShields: localData?.streakShields || 0,
    activeCoachId: localData?.activeCoachId,
    lastMissionDate: localData?.lastMissionDate,
    createdAt: localData?.createdAt || Date.now(),
    lastActive: Date.now(),
    minimalistMode: localData?.minimalistMode || false,
    unlockedDenItems: localData?.unlockedDenItems || [],
  };
}

function getLocalAppUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load local user', e);
  }
  return null;
}

function saveLocalAppUser(data: Partial<AppUser> | null) {
  try {
    if (!data) localStorage.removeItem(LOCAL_USER_KEY);
    else localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save local user', e);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const googleSignIn = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  }, []);

  const appleSignIn = useCallback(async () => {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    await signInWithPopup(auth, provider);
  }, []);

  const emailPasswordSignIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const emailPasswordSignUp = useCallback(async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const sendEmailSignInLink = useCallback(async (email: string) => {
    const cleanEmail = email.trim();
    await sendSignInLinkToEmail(auth, cleanEmail, {
      url: window.location.origin,
      handleCodeInApp: true,
    });
    window.localStorage.setItem(EMAIL_LINK_KEY, cleanEmail);
  }, []);

  const logout = useCallback(async () => {
    saveLocalAppUser(null);
    setAppUser(null);
    setUser(null);
    try {
      await auth.signOut();
    } catch (e) {
      console.warn('Firebase signout skipped', e);
    }
  }, []);

  const loginAsDemoUser = useCallback((demoPreset: 'founder' | 'hunter' = 'founder') => {
    const isHunter = demoPreset === 'hunter';
    const demoUser: AppUser = {
      uid: isHunter ? 'demo-hunter-id' : 'demo-founder-id',
      email: isHunter ? 'hunter@t1ger.app' : 'founder@t1ger.app',
      displayName: isHunter ? 'Hunter Predator' : 'Founder Predator',
      niche: 'ecommerce',
      level: isHunter ? 12 : 5,
      xp: isHunter ? 1200 : 450,
      streak: isHunter ? 14 : 7,
      coins: isHunter ? 850 : 300,
      isPro: true,
      onboardingComplete: true,
      role: isHunter ? 'member' : 'founder',
      isFounder: !isHunter,
      learningStyle: 'interactive'
    };
    saveLocalAppUser(demoUser);
    setAppUser(demoUser);
  }, []);

  const updateAppUser = useCallback(async (data: Partial<AppUser>) => {
    if (!user) {
      setAppUser(prev => {
        const next = prev ? { ...prev, ...data } : { uid: 'anonymous', email: '', niche: 'none', level: 1, xp: 0, streak: 0, ...data };
        saveLocalAppUser(next);
        return next;
      });
      return;
    }

    setAppUser(prev => {
      const base = prev || { uid: user.uid, email: user.email || '', niche: 'none', level: 1, xp: 0, streak: 0 };
      const next = { ...base, ...data, isPro: true } as AppUser;
      saveLocalAppUser(next);
      return next;
    });

    if (USE_AUTH_EMULATOR) {
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
      await setDoc(userRef, cleanData, { merge: true });

      const publicFields = ['displayName', 'photoURL', 'niche', 'level', 'xp', 'streak'];
      const publicUpdate: any = {};
      let hasPublicUpdate = false;

      publicFields.forEach(field => {
        if (field in data && (data as any)[field] !== undefined) {
          publicUpdate[field] = (data as any)[field];
          hasPublicUpdate = true;
        }
      });

      if (hasPublicUpdate) {
        await setDoc(doc(db, 'users_public', user.uid), publicUpdate, { merge: true });
      }
    } catch (error) {
      console.warn('Firestore profile update failed; keeping local signed-in profile.', error);
    }
  }, [user]);

  const fetchAppUser = useCallback(async (firebaseUser: User) => {
    if (USE_AUTH_EMULATOR) {
      const localSignedInUser = buildLocalSignedInUser(firebaseUser);
      setAppUser(localSignedInUser);
      saveLocalAppUser(localSignedInUser);
      return;
    }

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const existingUser = userSnap.data() as AppUser;
        const accountRole = getAccountRole(firebaseUser.email);
        const syncedUser = { ...existingUser, ...accountRole };

        if (existingUser.role !== accountRole.role || existingUser.isFounder !== accountRole.isFounder) {
          await setDoc(userRef, accountRole, { merge: true });
          await setDoc(doc(db, 'users_public', firebaseUser.uid), accountRole, { merge: true });
        }

        setAppUser(syncedUser);
      } else {
        const localData = getLocalAppUser();
        const accountRole = getAccountRole(firebaseUser.email);
        const rawNewUser: Record<string, any> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          ...accountRole,
          niche: localData?.niche || 'none',
          goal: localData?.goal || 'none',
          learningStyle: localData?.learningStyle || 'text',
          experienceLevel: localData?.experienceLevel || 1,
          ageRange: localData?.ageRange || '25-34',
          onboardingStep: localData?.onboardingStep || 'identity',
          onboardingComplete: localData?.onboardingComplete || false,
          level: localData?.level || 1,
          xp: localData?.xp || 0,
          streak: localData?.streak || 0,
          isPro: true,
          streakShields: 0,
          lastMissionDate: serverTimestamp(),
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
        };

        // Remove any undefined values before calling Firestore setDoc
        const newUser = Object.fromEntries(Object.entries(rawNewUser).filter(([_, v]) => v !== undefined)) as AppUser;

        await setDoc(userRef, newUser, { merge: true });
        await setDoc(doc(db, 'users_public', firebaseUser.uid), {
          uid: newUser.uid,
          displayName: newUser.displayName || '',
          photoURL: newUser.photoURL || '',
          niche: newUser.niche || 'none',
          level: newUser.level || 1,
          xp: newUser.xp || 0,
          streak: newUser.streak || 0,
          ...accountRole,
        }, { merge: true });
        setAppUser(newUser);
        saveLocalAppUser(null);
      }
    } catch (error) {
      console.warn('Firestore profile fetch failed; using local signed-in profile.', error);
      const localSignedInUser = buildLocalSignedInUser(firebaseUser);
      setAppUser(localSignedInUser);
      saveLocalAppUser(localSignedInUser);
    }
  }, []);

  const refreshAppUser = useCallback(async () => {
    if (user) {
      await fetchAppUser(user);
    }
  }, [user, fetchAppUser]);

  useEffect(() => {
    const localUser = getLocalAppUser();

    if (AUTH_DISABLED_FOR_PROTOTYPE && localUser) {
      setUser(null);
      setAppUser(localUser);
      setLoading(false);
      return;
    }

    if (localUser && !user) {
      setAppUser(localUser);
    }

    const finishEmailLinkSignIn = async () => {
      if (!isSignInWithEmailLink(auth, window.location.href)) return;

      const storedEmail = window.localStorage.getItem(EMAIL_LINK_KEY);
      const email = storedEmail || window.prompt('Confirm your email to finish signing in') || '';

      if (!email.trim()) {
        setLoading(false);
        return;
      }

      await signInWithEmailLink(auth, email.trim(), window.location.href);
      window.localStorage.removeItem(EMAIL_LINK_KEY);
      window.history.replaceState({}, document.title, window.location.origin);
    };

    finishEmailLinkSignIn().catch((err) => {
      console.error('Email link sign-in failed:', err);
      setLoading(false);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      try {
        if (firebaseUser) {
          await fetchAppUser(firebaseUser);
        } else {
          const unauthLocal = getLocalAppUser();
          setAppUser(unauthLocal || null);
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchAppUser]);

  const value = React.useMemo(() => ({
    user,
    appUser,
    loading,
    googleSignIn,
    appleSignIn,
    emailPasswordSignIn,
    emailPasswordSignUp,
    sendEmailSignInLink,
    updateAppUser,
    logout,
    refreshAppUser,
    loginAsDemoUser,
  }), [
    user,
    appUser,
    loading,
    googleSignIn,
    appleSignIn,
    emailPasswordSignIn,
    emailPasswordSignUp,
    sendEmailSignInLink,
    updateAppUser,
    logout,
    refreshAppUser,
    loginAsDemoUser
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
