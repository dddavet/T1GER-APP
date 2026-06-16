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
  isFlaggedForInterrogation?: boolean;
  streakShields?: number;
  lastMissionDate?: any;
  lastActive?: any;
  createdAt?: any;
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
});

export const useAuth = () => useContext(AuthContext);

const LOCAL_USER_KEY = 't1ger_local_app_user';
const EMAIL_LINK_KEY = 't1ger_email_link_sign_in';
const USE_AUTH_EMULATOR = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
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
    await auth.signOut();
    setAppUser(getLocalAppUser());
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
      await updateDoc(userRef, data);

      const publicFields = ['displayName', 'photoURL', 'niche', 'level', 'xp', 'streak'];
      const publicUpdate: any = {};
      let hasPublicUpdate = false;

      publicFields.forEach(field => {
        if (field in data) {
          publicUpdate[field] = (data as any)[field];
          hasPublicUpdate = true;
        }
      });

      if (hasPublicUpdate) {
        await updateDoc(doc(db, 'users_public', user.uid), publicUpdate);
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
        const newUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          ...accountRole,
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
          streakShields: 0,
          lastMissionDate: serverTimestamp(),
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
        };

        await setDoc(userRef, newUser);
        await setDoc(doc(db, 'users_public', firebaseUser.uid), {
          uid: newUser.uid,
          displayName: newUser.displayName,
          photoURL: newUser.photoURL,
          niche: newUser.niche,
          level: newUser.level,
          xp: newUser.xp,
          streak: newUser.streak,
          ...accountRole,
        });
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
    refreshAppUser
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
