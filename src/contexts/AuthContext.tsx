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
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
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
  verifiedXP?: number; // Tracks Tier 1 Verified XP for the Leaderboard
  weeklyXP?: number; // XP earned this week
  currentWeekId?: string; // e.g. "2026-W34"
  leagueTier?: string; // e.g. "bronze", "silver"
  streak: number;
  isPro?: boolean;
  isSuperT1ger?: boolean;
  isFlaggedForInterrogation?: boolean;
  weeklyReportOptIn?: boolean;
  coins?: number;
  streakShields?: number;
  activeCoachId?: string;
  lastMissionDate?: any;
  lastActive?: any;
  createdAt?: any;
  energy?: number;
  minimalistMode?: boolean;
  unlockedDenItems?: string[];
  unlockedAccessories?: string[];
  equippedAccessories?: string[];
  unlockedAchievements?: string[];
  lastSupplyDropClaimed?: number;
  primaryTrack?: 'investing' | 'business' | 'ai';
  investmentProfile?: InvestmentProfile;
  personalizedPlan?: {
    title: string;
    firstLessonId: string;
    weeklyMinutes: number;
    focusAreas: string[];
  };
  acquisitionSource?: string;
  fcmTokens?: string[];
  notificationPreferences?: {
    daily_reminder?: boolean; // daily lesson reminder
    streak_risk?: boolean; // streak at risk warning
    streak_lost?: boolean; // streak lost re-engagement
    streak_milestones?: boolean; // streak milestones
    level_up?: boolean; // level up
    apply_reminder?: boolean; // Apply phase reminder
    action_completed?: boolean; // action step completion
    weekly_summary?: boolean; // weekly summary
    leaderboard_drop?: boolean; // leaderboard movement
    re_engagement?: boolean; // re-engagement
    onboarding_nudge?: boolean; // onboarding nudge
  };
}

export type DemoPreset = 'founder' | 'investor' | 'hacker' | 'growth' | 'newbie';

export const DEMO_PRESET_USERS: Record<DemoPreset, { user: AppUser; label: string; badge: string; description: string; avatarBg: string; icon: string }> = {
  founder: {
    label: "⚡ David Founder",
    badge: "FUNDADOR",
    description: "Creador de T1GER APP. Nivel 15, 21 días de racha.",
    avatarBg: "bg-amber-500",
    icon: "⚡",
    user: {
      uid: 'demo-founder-id',
      email: 'founder@t1ger.app',
      displayName: 'David (Founder)',
      role: 'founder',
      isFounder: true,
      niche: 'saas',
      goal: 'Escalar T1GER APP a $100k MRR',
      businessStage: 'scaling',
      dailyTime: 20,
      level: 15,
      xp: 2450,
      streak: 21,
      coins: 1200,
      isPro: true,
      onboardingComplete: true,
      onboardingStep: 'complete',
      learningStyle: 'interactive',
      primaryTrack: 'investing'
    }
  },
  investor: {
    label: "🎯 Carlos Mendoza",
    badge: "INVERSOR EJECUTIVO",
    description: "Value Investing & Interés Compuesto. Nivel 8, 14 racha.",
    avatarBg: "bg-[#FF7300]",
    icon: "🎯",
    user: {
      uid: 'demo-investor-id',
      email: 'carlos.investor@t1ger.app',
      displayName: 'Carlos Mendoza',
      role: 'member',
      isFounder: false,
      niche: 'investing',
      goal: 'Construir Portafolio con Interés Compuesto',
      businessStage: 'investor',
      dailyTime: 15,
      level: 8,
      xp: 980,
      streak: 14,
      coins: 450,
      isPro: true,
      onboardingComplete: true,
      onboardingStep: 'complete',
      learningStyle: 'text',
      primaryTrack: 'investing'
    }
  },
  hacker: {
    label: "🚀 Sofía Arango",
    badge: "AI ENGINEER",
    description: "Desarrolladora de IA & Prompting. Nivel 5, 8 racha.",
    avatarBg: "bg-purple-600",
    icon: "🚀",
    user: {
      uid: 'demo-hacker-id',
      email: 'sofia.ai@t1ger.app',
      displayName: 'Sofía Arango',
      role: 'member',
      isFounder: false,
      niche: 'ai',
      goal: 'Lanzar 3 Agentes de IA en 90 días',
      businessStage: 'building',
      dailyTime: 30,
      level: 5,
      xp: 450,
      streak: 8,
      coins: 250,
      isPro: true,
      onboardingComplete: true,
      onboardingStep: 'complete',
      learningStyle: 'interactive',
      primaryTrack: 'ai'
    }
  },
  growth: {
    label: "📈 Elena Rivas",
    badge: "GROWTH EXEC",
    description: "Especialista en Ventas B2B & High-Ticket. Nivel 10, 19 racha.",
    avatarBg: "bg-emerald-600",
    icon: "📈",
    user: {
      uid: 'demo-growth-id',
      email: 'elena.growth@t1ger.app',
      displayName: 'Elena Rivas',
      role: 'member',
      isFounder: false,
      niche: 'sales',
      goal: 'Cerrar $50k MRR en Contratos Corporate',
      businessStage: 'scaling',
      dailyTime: 15,
      level: 10,
      xp: 1420,
      streak: 19,
      coins: 650,
      isPro: true,
      onboardingComplete: true,
      onboardingStep: 'complete',
      learningStyle: 'visual',
      primaryTrack: 'business'
    }
  },
  newbie: {
    label: "🦁 Mateo Silva",
    badge: "NUEVO (PROBAR ONBOARDING)",
    description: "Cuenta sin configurar. Activa el Onboarding desde 0.",
    avatarBg: "bg-sky-500",
    icon: "🦁",
    user: {
      uid: 'demo-newbie-id',
      email: 'mateo.new@t1ger.app',
      displayName: 'Mateo Silva (Nuevo)',
      role: 'member',
      isFounder: false,
      niche: '',
      goal: '',
      businessStage: 'idea',
      dailyTime: 10,
      level: 1,
      xp: 0,
      streak: 0,
      coins: 0,
      isPro: true,
      onboardingComplete: false,
      onboardingStep: 'splash',
      learningStyle: 'interactive',
      primaryTrack: 'investing'
    }
  }
};

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
  deleteAccountAndData: () => Promise<void>;
  refreshAppUser: () => Promise<void>;
  loginAsDemoUser: (demoPreset?: DemoPreset) => void;
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
  deleteAccountAndData: async () => {},
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
    isPro: localData?.isPro ?? false,
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
    unlockedAccessories: localData?.unlockedAccessories || [],
    equippedAccessories: localData?.equippedAccessories || [],
    unlockedAchievements: localData?.unlockedAchievements || [],
    lastSupplyDropClaimed: localData?.lastSupplyDropClaimed || 0,
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
    
    // Check if we are in a mobile/tablet environment where popups often fail
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Use redirect on mobile browsers to avoid popup blockers and COOP issues
      await signInWithRedirect(auth, provider);
    } else {
      // Use popup on desktop
      await signInWithPopup(auth, provider);
    }
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

  const deleteAccountAndData = useCallback(async () => {
    const currentUid = appUser?.uid || user?.uid;
    
    if (currentUid) {
      localStorage.removeItem(`tiger_brain_state_v3_${currentUid}`);
    }
    saveLocalAppUser(null);

    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const publicRef = doc(db, 'users_public', user.uid);
        await setDoc(userRef, { deletedAt: serverTimestamp(), isDeleted: true }, { merge: true });
        await setDoc(publicRef, { deletedAt: serverTimestamp(), isDeleted: true }, { merge: true });
        await user.delete();
      } catch (err) {
        console.warn('Error deleting cloud user account:', err);
        throw err;
      }
    }

    setAppUser(null);
    setUser(null);
  }, [user, appUser]);

  const loginAsDemoUser = useCallback((demoPreset: DemoPreset = 'founder') => {
    const preset = DEMO_PRESET_USERS[demoPreset] || DEMO_PRESET_USERS.founder;
    const demoUser = preset.user;
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
      const next = { ...base, ...data } as AppUser;
      saveLocalAppUser(next);
      return next;
    });

    if (USE_AUTH_EMULATOR) {
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const serverOwnedFields = new Set(['isPro', 'isSuperT1ger', 'role', 'isFounder']);
      const cleanData = Object.fromEntries(Object.entries(data).filter(([key, value]) => value !== undefined && !serverOwnedFields.has(key)));
      if (Object.keys(cleanData).length > 0) await setDoc(userRef, cleanData, { merge: true });

      const publicFields = ['displayName', 'photoURL', 'niche', 'verifiedXP', 'weeklyXP', 'streak', 'leagueTier', 'currentWeekId'];
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
      const userSnap = await Promise.race([
        getDoc(userRef),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Firestore profile fetch timeout')), 2000))
      ]);

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
          isPro: false,
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

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1200);

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
        clearTimeout(safetyTimer);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(safetyTimer);
    };
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
    deleteAccountAndData,
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
    deleteAccountAndData,
    refreshAppUser,
    loginAsDemoUser
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
