import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export const AuthGate: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { googleSignIn } = useAuth();

  const handleAuth = async (provider: 'google' | 'apple') => {
    if (provider !== 'google') return;
    setLoading(true);
    try {
      await googleSignIn();
    } catch (error) {
      console.error('Auth failed', error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50vh] bg-gradient-to-b from-[#FF6B00]/20 to-transparent blur-3xl opacity-50" />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[#CCFF00] font-mono text-xl tracking-widest"
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
            <div className="text-center space-y-2">
              <motion.h1 
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl font-black italic tracking-tighter text-white"
              >
                T1GER
              </motion.h1>
              <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">Stop scrolling. Start hunting.</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleAuth('google')}
                className="w-full bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-white font-bold flex items-center justify-center gap-3 hover:border-[#FF6B00] transition-all group"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Authenticate via Google
              </button>
              <button
                onClick={() => handleAuth('apple')}
                className="w-full bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-white font-bold flex items-center justify-center gap-3 hover:border-[#FF6B00] transition-all group"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98 1.4-2.05 2.72-3.68 2.72-1.63 0-2.12-.96-3.95-.96-1.83 0-2.37.96-3.95.96-1.63 0-2.8-1.46-3.95-3.36-1.15-1.9-2.05-5.38-2.05-8.38 0-4.32 2.8-6.62 5.58-6.62 1.63 0 3.03 1.1 4.05 1.1 1.03 0 2.75-1.1 4.58-1.1 1.1 0 3.95.13 5.8 2.88-0.15.1-2.55 1.46-2.55 4.53 0 3.55 3.05 4.88 3.2 4.96-0.03.06-0.5 1.78-1.7 3.58zM12.55 4.5c0-2.1 1.5-4.1 3.75-4.35-0.2 0.9-0.7 2.1-2.05 3.65-1.35 1.55-2.9 2.3-4.45 2.15 0.15-0.9 0.7-2.1 2.05-3.65z" fill="white"/></svg>
                Authenticate via Apple
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
