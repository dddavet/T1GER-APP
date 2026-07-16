import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Brain, TrendingUp, Sparkles, BookOpen, Clock, Bell, Crown, Flame, Target, Users, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, type InvestmentProfile } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';

type OnboardingStep = 
  | 'splash'
  | 'mascot_intro'
  | 'source'
  | 'topic'
  | 'building_course'
  | 'experience'
  | 'motivation'
  | 'pace'
  | 'notifications'
  | 'paywall'
  | 'ready';

export const InvestmentOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateAppUser, appUser } = useAuth();
  const { selectTrack } = useBrain();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('splash');
  const [answers, setAnswers] = useState<Partial<InvestmentProfile>>({ learnWithFriends: true });
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuperOptIn, setIsSuperOptIn] = useState(false);
  const [acquisitionSource, setAcquisitionSource] = useState<string>('');

  // Auto-advance for building course step
  useEffect(() => {
    if (currentStep === 'building_course') {
      const timer = setTimeout(() => {
        setCurrentStep('experience');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Update progress bar
  useEffect(() => {
    const steps: OnboardingStep[] = ['mascot_intro', 'source', 'topic', 'building_course', 'experience', 'motivation', 'pace', 'notifications', 'paywall', 'ready'];
    const index = steps.indexOf(currentStep);
    if (index >= 0) {
      setProgress(((index + 1) / steps.length) * 100);
    } else {
      setProgress(0);
    }
  }, [currentStep]);

  const handleFinish = async (isSuper: boolean = false) => {
    setSaving(true);
    selectTrack('investing');
    
    // Default values if skipped
    const finalAnswers = {
      goal: answers.goal || 'long-term-wealth',
      experience: answers.experience || 'new',
      riskComfort: answers.riskComfort || 'balanced',
      weeklyCommitment: answers.weeklyCommitment || 10,
      contentFormat: answers.contentFormat || 'practice',
    };

    const plan = {
      title: finalAnswers.experience === 'active' ? 'Investor Decision Lab' : 'Investment Foundations',
      firstLessonId: 'inv-e1',
      weeklyMinutes: (finalAnswers.weeklyCommitment as number) * 5,
      focusAreas: ['Fundamentos de Mercado', 'Gestión de Riesgo', 'Mentalidad Predator'],
    };

    await updateAppUser({
      niche: 'investing',
      primaryTrack: 'investing',
      goal: finalAnswers.goal,
      dailyTime: finalAnswers.weeklyCommitment,
      learningStyle: 'interactive',
      experienceLevel: finalAnswers.experience === 'active' ? 3 : finalAnswers.experience === 'basic' ? 2 : 1,
      investmentProfile: finalAnswers as InvestmentProfile,
      personalizedPlan: plan,
      onboardingStep: 'complete',
      onboardingComplete: true,
      isSuperT1ger: isSuper,
      acquisitionSource
    });
    
    setSaving(false);
    onComplete();
  };

  const TopBar = () => {
    if (currentStep === 'splash' || currentStep === 'paywall') return null;
    
    const goBack = () => {
      const history: Record<OnboardingStep, OnboardingStep> = {
        mascot_intro: 'splash',
        source: 'mascot_intro',
        topic: 'source',
        building_course: 'topic',
        experience: 'topic', // Skip building_course going back
        motivation: 'experience',
        pace: 'motivation',
        notifications: 'pace',
        paywall: 'notifications',
        ready: 'paywall',
        splash: 'splash'
      };
      setCurrentStep(history[currentStep]);
    };

    return (
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center gap-4 z-10 pt-[calc(1.5rem+var(--safe-top-inset,env(safe-area-inset-top)))]">
        <button 
          onClick={goBack}
          className="text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <ArrowLeft size={24} strokeWidth={3} />
        </button>
        <div className="h-4 flex-1 bg-zinc-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#58CC02] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  const OptionButton = ({ onClick, icon: Icon, label, description, selected }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98]
        ${selected 
          ? 'border-[#FF7300] bg-[#FF7300]/10' 
          : 'border-zinc-200 bg-white hover:bg-zinc-50'
        }
      `}
    >
      <div className={`p-3 rounded-xl ${selected ? 'bg-[#FF7300] text-white' : 'bg-zinc-100 text-zinc-500'}`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div className="flex-1 text-left">
        <h3 className={`font-black uppercase tracking-wider text-[15px] ${selected ? 'text-[#FF7300]' : 'text-zinc-700'}`}>
          {label}
        </h3>
        {description && (
          <p className="text-[13px] text-zinc-500 font-semibold leading-snug mt-0.5">
            {description}
          </p>
        )}
      </div>
    </button>
  );

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto relative flex flex-col bg-white overflow-hidden text-zinc-800 font-sans">
      <TopBar />

      <AnimatePresence mode="wait">
        {/* ========================================================== */}
        {/* STEP 1: SPLASH                                             */}
        {/* ========================================================== */}
        {currentStep === 'splash' && (
          <motion.div 
            key="splash"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-[#FF7300]/10 rounded-full flex items-center justify-center mb-8">
                <Crown className="w-12 h-12 text-[#FF7300]" />
              </div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-[#FF7300] mb-2">
                T1GER
              </h1>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
                Learn. Build. Compete.
              </p>
            </div>
            <div className="w-full pb-8 flex flex-col gap-3">
              <button 
                onClick={() => setCurrentStep('mascot_intro')}
                className="w-full py-4 rounded-2xl bg-[#FF7300] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#CC5C00] active:border-b-0 active:translate-y-1 transition-all"
              >
                Get Started
              </button>
              <button 
                onClick={() => onComplete()}
                className="w-full py-4 rounded-2xl bg-white text-[#FF7300] font-black text-[15px] uppercase tracking-widest border-2 border-zinc-200 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all"
              >
                I already have an account
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================== */}
        {/* STEP 2: MASCOT INTRO                                       */}
        {/* ========================================================== */}
        {currentStep === 'mascot_intro' && (
          <motion.div 
            key="mascot_intro"
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
            className="flex-1 flex flex-col pt-24 p-6"
          >
            <div className="flex-1 flex flex-col justify-end pb-8">
              <div className="flex items-end gap-4 mb-12">
                <div className="w-16 h-16 shrink-0 bg-[#FF7300]/10 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[#FF7300]" />
                </div>
                <div className="bg-white border-2 border-zinc-200 rounded-3xl rounded-bl-none p-5 relative shadow-sm max-w-[75%]">
                  <p className="text-zinc-700 font-bold text-lg leading-snug">
                    I'm here, I'm T1ger. Just seven quick questions before we start our first mission.
                  </p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setCurrentStep('source')}
              className="w-full py-4 rounded-2xl bg-[#FF7300] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#CC5C00] active:border-b-0 active:translate-y-1 transition-all"
            >
              Continue
            </button>
          </motion.div>
        )}

        {/* ========================================================== */}
        {/* STEP 2.5: SOURCE (How did you hear about us?)              */}
        {/* ========================================================== */}
        {currentStep === 'source' && (
          <motion.div 
            key="source"
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
            className="flex-1 flex flex-col pt-24 p-6"
          >
            <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-800 mb-8 text-center">
              How did you hear about T1GER?
            </h2>
            <div className="flex-1 space-y-3">
              <OptionButton 
                icon={Target} 
                label="TikTok" 
                selected={acquisitionSource === 'tiktok'}
                onClick={() => {
                  setAcquisitionSource('tiktok');
                  setTimeout(() => setCurrentStep('topic'), 300);
                }}
              />
              <OptionButton 
                icon={Users} 
                label="Instagram" 
                selected={acquisitionSource === 'instagram'}
                onClick={() => {
                  setAcquisitionSource('instagram');
                  setTimeout(() => setCurrentStep('topic'), 300);
                }}
              />
              <OptionButton 
                icon={Brain} 
                label="YouTube" 
                selected={acquisitionSource === 'youtube'}
                onClick={() => {
                  setAcquisitionSource('youtube');
                  setTimeout(() => setCurrentStep('topic'), 300);
                }}
              />
              <OptionButton 
                icon={Flame} 
                label="Friends / Family" 
                selected={acquisitionSource === 'friends'}
                onClick={() => {
                  setAcquisitionSource('friends');
                  setTimeout(() => setCurrentStep('topic'), 300);
                }}
              />
            </div>
          </motion.div>
        )}

        {/* ========================================================== */}
        {/* STEP 3: TOPIC                                              */}
        {/* ========================================================== */}
        {currentStep === 'topic' && (
          <motion.div 
            key="topic"
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
            className="flex-1 flex flex-col pt-24 p-6"
          >
            <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-800 mb-8 text-center">
              What should you learn?
            </h2>
            <div className="flex-1 space-y-3">
              <OptionButton 
                icon={TrendingUp} 
                label="Investing & Markets" 
                selected={answers.goal === 'investing'}
                onClick={() => {
                  setAnswers({ ...answers, goal: 'investing' });
                  setTimeout(() => setCurrentStep('building_course'), 300);
                }}
              />
              <OptionButton 
                icon={Brain} 
                label="Artificial Intelligence" 
                selected={answers.goal === 'ai'}
                onClick={() => {
                  setAnswers({ ...answers, goal: 'ai' });
                  setTimeout(() => setCurrentStep('building_course'), 300);
                }}
              />
              <OptionButton 
                icon={Target} 
                label="Sales & Offer Creation" 
                selected={answers.goal === 'sales'}
                onClick={() => {
                  setAnswers({ ...answers, goal: 'sales' });
                  setTimeout(() => setCurrentStep('building_course'), 300);
                }}
              />
            </div>
          </motion.div>
        )}

        {/* ========================================================== */}
        {/* STEP 4: COURSE BUILDING ANIMATION                          */}
        {/* ========================================================== */}
        {currentStep === 'building_course' && (
          <motion.div 
            key="building_course"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#FF7300]/20 rounded-full animate-ping" />
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center relative z-10 shadow-lg border-4 border-[#FF7300]/20">
                <Brain className="w-10 h-10 text-[#FF7300] animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-800 mb-4 px-4 leading-tight">
              Get ready to join 7 million predators currently learning with T1GER
            </h2>
            <div className="w-16 h-16 rounded-full border-4 border-zinc-200 border-t-[#FF7300] animate-spin mx-auto mt-8" />
          </motion.div>
        )}

        {/* ========================================================== */}
        {/* STEP 5: EXPERIENCE LEVEL                                   */}
        {/* ========================================================== */}
        {currentStep === 'experience' && (
          <motion.div 
            key="experience"
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
            className="flex-1 flex flex-col pt-24 p-6"
          >
            <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-800 mb-8 text-center">
              How much investing do you know?
            </h2>
            <div className="flex-1 space-y-3">
              <OptionButton 
                icon={Sparkles} 
                label="I'm new to investing" 
                selected={answers.experience === 'new'}
                onClick={() => {
                  setAnswers({ ...answers, experience: 'new' });
                  setTimeout(() => setCurrentStep('motivation'), 300);
                }}
              />
              <OptionButton 
                icon={BookOpen} 
                label="I know the basics" 
                selected={answers.experience === 'basic'}
                onClick={() => {
                  setAnswers({ ...answers, experience: 'basic' });
                  setTimeout(() => setCurrentStep('motivation'), 300);
                }}
              />
              <OptionButton 
                icon={Flame} 
                label="I already invest actively" 
                selected={answers.experience === 'active'}
                onClick={() => {
                  setAnswers({ ...answers, experience: 'active' });
                  setTimeout(() => setCurrentStep('motivation'), 300);
                }}
              />
            </div>
          </motion.div>
        )}

        {/* ========================================================== */}
        {/* STEP 6: MOTIVATION                                         */}
        {/* ========================================================== */}
        {currentStep === 'motivation' && (
          <motion.div 
            key="motivation"
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
            className="flex-1 flex flex-col pt-24 p-6"
          >
            <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-800 mb-8 text-center">
              Why are you learning investing?
            </h2>
            <div className="flex-1 space-y-3">
              <OptionButton 
                icon={Crown} 
                label="Build wealth & freedom" 
                selected={answers.riskComfort === 'growth'}
                onClick={() => {
                  setAnswers({ ...answers, riskComfort: 'growth' });
                  setTimeout(() => setCurrentStep('pace'), 300);
                }}
              />
              <OptionButton 
                icon={Users} 
                label="Beat the system" 
                selected={answers.riskComfort === 'balanced'}
                onClick={() => {
                  setAnswers({ ...answers, riskComfort: 'balanced' });
                  setTimeout(() => setCurrentStep('pace'), 300);
                }}
              />
              <OptionButton 
                icon={Target} 
                label="Plan for the future" 
                selected={answers.riskComfort === 'protect'}
                onClick={() => {
                  setAnswers({ ...answers, riskComfort: 'protect' });
                  setTimeout(() => setCurrentStep('pace'), 300);
                }}
              />
            </div>
          </motion.div>
        )}

        {/* ========================================================== */}
        {/* STEP 7: PACE                                               */}
        {/* ========================================================== */}
        {currentStep === 'pace' && (
          <motion.div 
            key="pace"
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
            className="flex-1 flex flex-col pt-24 p-6"
          >
            <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-800 mb-8 text-center">
              Let's set up your learning routine
            </h2>
            <div className="flex-1 space-y-3">
              <OptionButton 
                icon={Clock} 
                label="Casual" 
                description="5 mins / day"
                selected={answers.weeklyCommitment === 5}
                onClick={() => setAnswers({ ...answers, weeklyCommitment: 5 })}
              />
              <OptionButton 
                icon={Clock} 
                label="Regular" 
                description="10 mins / day"
                selected={answers.weeklyCommitment === 10}
                onClick={() => setAnswers({ ...answers, weeklyCommitment: 10 })}
              />
              <OptionButton 
                icon={Clock} 
                label="Intense" 
                description="15 mins / day"
                selected={answers.weeklyCommitment === 15}
                onClick={() => setAnswers({ ...answers, weeklyCommitment: 15 })}
              />
            </div>
            <button 
              disabled={!answers.weeklyCommitment}
              onClick={() => setCurrentStep('notifications')}
              className="w-full py-4 rounded-2xl bg-[#FF7300] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#CC5C00] active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 mt-4"
            >
              Continue
            </button>
          </motion.div>
        )}

        {/* ========================================================== */}
        {/* STEP 8: NOTIFICATIONS                                      */}
        {/* ========================================================== */}
        {currentStep === 'notifications' && (
          <motion.div 
            key="notifications"
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
            className="flex-1 flex flex-col pt-24 p-6"
          >
            <div className="flex-1 flex flex-col justify-end pb-8">
              <div className="flex items-end gap-4 mb-12">
                <div className="w-16 h-16 shrink-0 bg-[#FF7300]/10 rounded-2xl flex items-center justify-center">
                  <Bell className="w-8 h-8 text-[#FF7300]" />
                </div>
                <div className="bg-white border-2 border-zinc-200 rounded-3xl rounded-bl-none p-5 relative shadow-sm max-w-[75%]">
                  <p className="text-zinc-700 font-bold text-lg leading-snug">
                    I will remind you to practice so it becomes a habit.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  // Simulate push notification permission
                  setTimeout(() => setCurrentStep('paywall'), 300);
                }}
                className="w-full py-4 rounded-2xl bg-[#58CC02] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#58A700] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                <Bell className="w-5 h-5" /> Allow Notifications
              </button>
              <button 
                onClick={() => setCurrentStep('paywall')}
                className="w-full py-4 rounded-2xl bg-white text-zinc-400 font-black text-[15px] uppercase tracking-widest border-2 border-zinc-200 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all"
              >
                Not Now
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================== */}
        {/* STEP 9: PAYWALL                                            */}
        {/* ========================================================== */}
        {currentStep === 'paywall' && (
          <motion.div 
            key="paywall"
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="flex-1 flex flex-col bg-[#1e1e24] text-white p-6 justify-between absolute inset-0 z-20"
          >
            <div className="flex items-center justify-end pt-4">
              <button 
                onClick={() => { setIsSuperOptIn(false); setCurrentStep('ready'); }}
                className="text-zinc-400 font-black uppercase tracking-widest text-xs opacity-50"
              >
                Skip
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FF7300] to-yellow-500 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,115,0,0.4)]">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4">
                Super T1GER
              </h1>
              <p className="text-zinc-300 font-bold mb-8 max-w-[280px]">
                Unlock unlimited AI feedback, deep dives, and remove all wait times.
              </p>

              <div className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-left mb-8">
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#58CC02]" strokeWidth={3} />
                    <span className="font-bold">Unlimited AI Analysis</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#58CC02]" strokeWidth={3} />
                    <span className="font-bold">No ads or interruptions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#58CC02]" strokeWidth={3} />
                    <span className="font-bold">Personalized Coach</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="w-full pb-8">
              <button 
                disabled={saving}
                onClick={() => { setIsSuperOptIn(true); setCurrentStep('ready'); }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF7300] to-yellow-500 text-white font-black text-[15px] uppercase tracking-widest shadow-[0_4px_0_0_#CC5C00] active:translate-y-[4px] active:shadow-none transition-all mb-4"
              >
                Start 2-Week Free Trial
              </button>
              <button 
                disabled={saving}
                onClick={() => { setIsSuperOptIn(false); setCurrentStep('ready'); }}
                className="w-full py-4 rounded-2xl bg-transparent text-zinc-400 font-black text-[15px] uppercase tracking-widest transition-all"
              >
                Learn for Free
              </button>
            </div>
          </motion.div>
        )}
        {/* ========================================================== */}
        {/* STEP 10: READY (Complete first lesson CTA)                 */}
        {/* ========================================================== */}
        {currentStep === 'ready' && (
          <motion.div 
            key="ready"
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="flex-1 flex flex-col bg-[#F7F7F7] text-zinc-800 pt-[calc(4rem+var(--safe-top-inset,env(safe-area-inset-top)))] pb-[calc(2rem+var(--safe-bottom-inset,env(safe-area-inset-bottom)))] px-6 justify-between items-center absolute inset-0 z-30"
          >
            <div className="text-center w-full max-w-sm mt-8">
              <div className="w-32 h-32 mx-auto bg-[#FF7300]/10 rounded-full flex items-center justify-center mb-6">
                 <Sparkles className="w-16 h-16 text-[#FF7300]" />
              </div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-[#FF7300]">
                Profile Created
              </h1>
              <p className="text-zinc-500 font-medium mb-8">
                You're all set up. Now it's time to build your foundation.
              </p>
            </div>
            
            <div className="w-full max-w-sm pb-8">
              <button
                disabled={saving}
                onClick={() => handleFinish(isSuperOptIn)}
                className="w-full bg-[#58CC02] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[15px] flex items-center justify-center gap-2 transition-all border-b-4 border-[#58A700] active:border-b-0 active:translate-y-[4px]"
              >
                {saving ? 'Loading...' : 'Complete First Lesson'} 
                <ArrowRight size={20} className="stroke-[3]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
