import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, TrendingUp, Dumbbell, Palette, Target, Zap, Clock, Award } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const NICHES = [
  { id: 'ecommerce', title: 'E-Commerce', icon: Briefcase, color: 'bg-blue-500', desc: 'Build businesses and lead teams' },
  { id: 'content', title: 'Content Creation', icon: Palette, color: 'bg-purple-500', desc: 'Design, write, and build audience' },
  { id: 'saas', title: 'SaaS/Tech', icon: Zap, color: 'bg-orange-500', desc: 'Build software and scale products' },
  { id: 'service', title: 'Service Business', icon: Dumbbell, color: 'bg-green-500', desc: 'Master markets and grow wealth' },
];

const GOALS = [
  { id: 'financial', title: 'Financial Freedom', icon: TrendingUp },
  { id: 'time', title: 'Time Mastery', icon: Clock },
  { id: 'skill', title: 'Skill Acquisition', icon: Target },
  { id: 'market', title: 'Market Dominance', icon: Award },
];

export const Onboarding = () => {
  const { user, appUser, refreshAppUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'identity' | 'ambition' | 'contract'>('identity');
  const [niche, setNiche] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appUser?.onboardingStep) {
      setStep(appUser.onboardingStep as any);
      if (appUser.niche && appUser.niche !== 'none') setNiche(appUser.niche);
      if (appUser.goal && appUser.goal !== 'none') setGoal(appUser.goal);
    }
  }, [appUser]);

  const updateOnboarding = async (data: any, nextStep: 'identity' | 'ambition' | 'contract' | 'completed') => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { ...data, onboardingStep: nextStep });
      await refreshAppUser();
      if (nextStep === 'completed') {
        navigate('/');
      } else {
        setStep(nextStep);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`, { currentUser: user });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'identity':
        return (
          <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }}>
            <h1 className="text-3xl font-black mb-2 font-sans">The Identity</h1>
            <p className="text-zinc-400 mb-8">Select your primary focus.</p>
            <div className="grid gap-4 mb-8">
              {NICHES.map((n) => (
                <button key={n.id} onClick={() => setNiche(n.id)} className={`p-4 rounded-2xl border-2 text-left transition-all ${niche === n.id ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-800 bg-zinc-900/50'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-2 ${n.color}`}><n.icon /></div>
                  <h3 className="font-bold text-lg">{n.title}</h3>
                </button>
              ))}
            </div>
            <button onClick={() => updateOnboarding({ niche }, 'ambition')} disabled={!niche || loading} className="w-full bg-orange-500 py-4 rounded-2xl font-bold">Continue</button>
          </motion.div>
        );
      case 'ambition':
        return (
          <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }}>
            <h1 className="text-3xl font-black mb-2 font-sans">The Ambition</h1>
            <p className="text-zinc-400 mb-8">What is your primary target for the next 90 days?</p>
            <div className="grid gap-4 mb-8">
              {GOALS.map((g) => (
                <button key={g.id} onClick={() => setGoal(g.id)} className={`p-4 rounded-2xl border-2 text-left transition-all ${goal === g.id ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-800 bg-zinc-900/50'}`}>
                  <h3 className="font-bold text-lg">{g.title}</h3>
                </button>
              ))}
            </div>
            <button onClick={() => updateOnboarding({ goal }, 'contract')} disabled={!goal || loading} className="w-full bg-orange-500 py-4 rounded-2xl font-bold">Continue</button>
          </motion.div>
        );
      case 'contract':
        return (
          <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }}>
            <h1 className="text-3xl font-black mb-2 font-sans">The Contract</h1>
            <p className="text-zinc-400 mb-8">Commit to the hunt.</p>
            <button onClick={() => updateOnboarding({ xp: (appUser?.xp || 0) + 100 }, 'completed')} disabled={loading} className="w-full bg-orange-500 py-4 rounded-2xl font-bold">I Commit to the Hunt</button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6 font-mono">
      <div className="h-2 w-full bg-zinc-800 rounded-full mb-8"><div className={`h-full bg-[#CCFF00] rounded-full transition-all ${step === 'identity' ? 'w-1/3' : step === 'ambition' ? 'w-2/3' : 'w-full'}`} /></div>
      <div className="max-w-md mx-auto">{renderStep()}</div>
    </div>
  );
};
