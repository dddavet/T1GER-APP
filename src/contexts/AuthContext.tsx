import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/utils';
// ... rest of the file

export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  niche: string;
  goal?: string;
  onboardingStep?: string;
  onboardingComplete?: boolean;
  learningStyle?: 'visual' | 'text' | 'interactive';
  experienceLevel?: number; // 1 to 10
  ageRange?: string;
  level: number;
  xp: number;
  streak: number;
  isPro?: boolean;
  isFlaggedForInterrogation?: boolean; // New: AI Auditor flagged this user
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
  updateAppUser: (data: Partial<AppUser>) => Promise<void>;
  logout: () => Promise<void>;
  refreshAppUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  loading: false,
  googleSignIn: async () => {},
  updateAppUser: async () => {},
  logout: async () => {},
  refreshAppUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const LOCAL_USER_KEY = 't1ger_local_app_user';

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
  const [loading, setLoading] = useState(false);

  const googleSignIn = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const logout = useCallback(async () => {
    await auth.signOut();
    setAppUser(getLocalAppUser()); // Revert to local user on logout
  }, []);

  const updateAppUser = React.useCallback(async (data: Partial<AppUser>) => {
    if (!user) {
      // Local anonymous override
      setAppUser(prev => {
        const next = prev ? { ...prev, ...data } : { uid: 'anonymous', email: '', niche: 'none', level: 1, xp: 0, streak: 0, ...data };
        saveLocalAppUser(next);
        return next;
      });
      return;
    }
    
    // OPTIMISTIC UPDATE: Update the UI state and Local Storage immediately to prevent UI hanging.
    setAppUser(prev => {
       const base = prev || { uid: user?.uid || 'anonymous', email: user?.email || '', niche: 'none', level: 1, xp: 0, streak: 0 };
       const next = { ...base, ...data, isPro: true } as AppUser;
       // Also mirror to local storage so even if firebase errors, they have local fallback 
       saveLocalAppUser(next);
       return next;
    });

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, data);
      
      // Also update public profile if relevant fields change
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
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`, auth);
    }
  }, [user]);

  const fetchAppUser = React.useCallback(async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data() as AppUser;
        setAppUser(data);
      } else {
        // Create new user profile, inherit local data if any
        const localData = getLocalAppUser();
        const newUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
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
          streak: newUser.streak
        });
        setAppUser(newUser);
        saveLocalAppUser(null); // Clear local data once synced
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`, auth);
    }
  }, []);

  const refreshAppUser = React.useCallback(async () => {
    if (user) {
      await fetchAppUser(user);
    }
  }, [user, fetchAppUser]);

  useEffect(() => {
    setLoading(false);
    
    // Initialize Local User instantly for zero-wait MVP rendering
    const localUser = getLocalAppUser();
    if (localUser && !user) {
      setAppUser(localUser);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      try {
        if (firebaseUser) {
          await fetchAppUser(firebaseUser);
        } else {
          // If logged out, load unauthenticated anonymous progress
          const unauthLocal = getLocalAppUser();
          if (unauthLocal) {
            setAppUser(unauthLocal);
          } else {
            // Give them a completely fresh anonymous profile so they hit onboarding
            setAppUser(null); 
          }
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [fetchAppUser]);

  const value = React.useMemo(() => ({
    user, appUser, loading, googleSignIn, updateAppUser, logout, refreshAppUser
  }), [user, appUser, loading, googleSignIn, updateAppUser, logout, refreshAppUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
