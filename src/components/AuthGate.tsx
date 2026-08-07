import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, DEMO_PRESET_USERS, type DemoPreset } from '../contexts/AuthContext';
import { GlassButton } from './ui/apple-tahoe-liquid-glass-button';

import { PrivacyPolicy } from '../pages/PrivacyPolicy';
import { TermsOfService } from '../pages/TermsOfService';

type AuthMode = 'sign-in' | 'sign-up' | 'email-link';

interface AuthGateProps {
  embedded?: boolean;
  onAuthSuccess?: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ embedded = false, onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const {
    googleSignIn,
    appleSignIn,
    emailPasswordSignIn,
    emailPasswordSignUp,
    sendEmailSignInLink,
    loginAsDemoUser
  } = useAuth();

  const getAuthMessage = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password')) return 'Email or password is incorrect.';
    if (message.includes('auth/email-already-in-use')) return 'That email already has an account.';
    if (message.includes('auth/weak-password')) return 'Password needs at least 6 characters.';
    if (message.includes('auth/popup-closed-by-user')) return 'Sign-in was cancelled.';
    if (message.includes('auth/configuration-not-found')) return 'Enable Firebase Authentication for this project first.';
    if (message.includes('auth/operation-not-allowed')) return 'Enable this provider in Firebase Authentication first.';
    return 'Authentication failed. Check Firebase provider setup and try again.';
  };

  const runAuth = async (action: () => Promise<void>) => {
    setNotice('');
    setLoading(true);
    try {
      await action();
      onAuthSuccess?.();
    } catch (error) {
      console.error('Auth failed', error);
      setNotice(getAuthMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setNotice('Enter your email first.');
      return;
    }

    if (mode === 'email-link') {
      await runAuth(async () => {
        await sendEmailSignInLink(email);
        setNotice('Magic link sent. Check your email on this device.');
        setLoading(false);
      });
      return;
    }

    if (password.length < 6) {
      setNotice('Password needs at least 6 characters.');
      return;
    }

    await runAuth(() => mode === 'sign-up'
      ? emailPasswordSignUp(email, password)
      : emailPasswordSignIn(email, password)
    );
  };

  const inputClassName = 'w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-800 outline-none transition placeholder:text-zinc-600 focus:border-[#FF7300]/50 focus:bg-zinc-50';

  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradient */}
      {!embedded && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50vh] bg-gradient-to-b from-[#FF6B00]/20 to-transparent blur-3xl opacity-50" />
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[#FF7300] font-mono text-xl tracking-widest"
          >
            [ AUTHENTICATING PREDATOR_ID... ]
          </motion.div>
        ) : (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm space-y-8 z-10"
          >
            {!embedded && (
              <div className="text-center space-y-2">
                <motion.h1 
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="text-6xl font-black italic tracking-tighter text-zinc-800"
                >
                  T1GER
                </motion.h1>
                <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">Stop scrolling. Start hunting.</p>
              </div>
            )}

            <div className="space-y-4">
              <GlassButton
                onClick={() => runAuth(googleSignIn)}
                className="w-full"
                intensity="quiet"
                contentClassName="gap-3"
                disabled={loading}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Authenticate via Google
              </GlassButton>
              <GlassButton
                onClick={() => runAuth(appleSignIn)}
                className="w-full"
                intensity="quiet"
                contentClassName="gap-3"
                disabled={loading}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98 1.4-2.05 2.72-3.68 2.72-1.63 0-2.12-.96-3.95-.96-1.83 0-2.37.96-3.95.96-1.63 0-2.8-1.46-3.95-3.36-1.15-1.9-2.05-5.38-2.05-8.38 0-4.32 2.8-6.62 5.58-6.62 1.63 0 3.03 1.1 4.05 1.1 1.03 0 2.75-1.1 4.58-1.1 1.1 0 3.95.13 5.8 2.88-0.15.1-2.55 1.46-2.55 4.53 0 3.55 3.05 4.88 3.2 4.96-0.03.06-0.5 1.78-1.7 3.58zM12.55 4.5c0-2.1 1.5-4.1 3.75-4.35-0.2 0.9-0.7 2.1-2.05 3.65-1.35 1.55-2.9 2.3-4.45 2.15 0.15-0.9 0.7-2.1 2.05-3.65z" fill="white"/></svg>
                Authenticate via Apple
              </GlassButton>

              <form onSubmit={handleEmailAuth} className="space-y-3 rounded-[2rem] border border-zinc-200 bg-zinc-50 p-3 shadow-2xl shadow-black/40 backdrop-blur">
                <div className="grid grid-cols-3 gap-1 rounded-full bg-zinc-50 p-1">
                  {[
                    ['sign-in', 'Sign in'],
                    ['sign-up', 'Create'],
                    ['email-link', 'Link'],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setMode(key as AuthMode);
                        setNotice('');
                      }}
                      className={`rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-wider transition ${
                        mode === key ? 'bg-[#FF7300] text-black' : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClassName}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Email"
                  disabled={loading}
                />

                {mode !== 'email-link' && (
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputClassName}
                    type="password"
                    autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                    placeholder="Password"
                    disabled={loading}
                  />
                )}

                <GlassButton
                  type="submit"
                  size="sm"
                  className="w-full"
                  intensity="quiet"
                  disabled={loading}
                >
                  {mode === 'email-link' ? 'Send email link' : mode === 'sign-up' ? 'Create account' : 'Continue'}
                </GlassButton>
              </form>

              {notice && (
                <p className="px-2 text-center text-[11px] font-bold uppercase tracking-wider text-[#FF7300]">
                  {notice}
                </p>
              )}

              {/* Preview accounts are compiled only into local development. */}
              {import.meta.env.DEV && <div className="pt-3 border-t border-zinc-200/80 space-y-2.5 text-center">
                <span className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-widest block">
                  ⚡ ACCESO RÁPIDO A 5 PERFILES DE PRUEBA
                </span>
                <div className="flex flex-col gap-1.5">
                  {(['founder', 'investor', 'newbie'] as DemoPreset[]).map((key) => {
                    const preset = DEMO_PRESET_USERS[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => loginAsDemoUser(key)}
                        className="w-full py-2.5 px-3 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-200 border-b-4 border-b-zinc-300 active:border-b-2 active:translate-y-0.5 transition-all text-left flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{preset.icon}</span>
                          <div>
                            <p className="text-xs font-black text-zinc-800 leading-tight group-hover:text-[#FF7300]">
                              {preset.label}
                            </p>
                            <p className="text-[9px] font-bold text-zinc-600 line-clamp-1">
                              {preset.description}
                            </p>
                          </div>
                        </div>
                        <span className="text-[8px] font-black font-mono uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 shrink-0">
                          {preset.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>}

              {/* Legal Compliance Footer Links (Required for App Store & Play Store) */}
              <div className="pt-2 text-center flex items-center justify-center gap-3 text-[10px] text-zinc-500 font-semibold">
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="hover:underline cursor-pointer"
                >
                  Política de Privacidad
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="hover:underline cursor-pointer"
                >
                  Términos y Condiciones
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-xl max-h-[85vh] overflow-y-auto"
            >
              <PrivacyPolicy onBack={() => setShowPrivacyModal(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms of Service Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-xl max-h-[85vh] overflow-y-auto"
            >
              <TermsOfService onBack={() => setShowTermsModal(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
