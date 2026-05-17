import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Target, Zap, ChevronRight, PlaySquare, FileText, Blocks } from 'lucide-react';

const QUESTIONS = [
  {
    id: 'goal',
    title: 'What brings you to T1GER?',
    subtitle: 'We will personalize your initial curriculum.',
    options: [
      { id: 'startup', label: 'Build a Startup', icon: <Target className="w-5 h-5" /> },
      { id: 'investing', label: 'Master Investing', icon: <Zap className="w-5 h-5" /> },
      { id: 'career', label: 'Grow My Career', icon: <Brain className="w-5 h-5" /> },
      { id: 'freedom', label: 'Financial Freedom', icon: <Target className="w-5 h-5" /> }
    ]
  },
  {
    id: 'experienceLevel',
    title: 'What is your current level?',
    subtitle: '1 is a total beginner. 10 is an industry veteran.',
    renderCustom: 'level-slider'
  },
  {
    id: 'ageRange',
    title: 'How old are you?',
    subtitle: 'This helps our AI tailor the analogies and tone.',
    options: [
      { id: 'under18', label: '17 or younger' },
      { id: '18-24', label: '18 - 24' },
      { id: '25-34', label: '25 - 34' },
      { id: '35-44', label: '35 - 44' },
      { id: '45+', label: '45 or older' }
    ]
  },
  {
    id: 'learningStyle',
    title: 'You hit a deeply complex problem. What is your first instinct?',
    subtitle: 'This will customize how the T1GER Engine feeds you missions.',
    options: [
      { id: 'text', label: 'Look for a written guide', description: 'I want to read the step-by-step breakdown.', icon: <FileText className="w-5 h-5 text-[#CCFF00]" /> },
      { id: 'visual', label: 'Watch someone solve it', description: 'I like seeing a demonstration or diagram.', icon: <PlaySquare className="w-5 h-5 text-[#FF6B00]" /> },
      { id: 'interactive', label: 'Start experimenting', description: 'I learn by trying, failing, and adapting.', icon: <Blocks className="w-5 h-5 text-[#FF6B00]" /> }
    ]
  }
];

export const OnboardingFlow: React.FC = () => {
  const { updateAppUser } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isFinishing, setIsFinishing] = useState(false);
  
  // Custom slider state
  const [sliderValue, setSliderValue] = useState(1);

  const currentQuestion = QUESTIONS[stepIndex];

  const haptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const advanceStep = () => {
    if (stepIndex < QUESTIONS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setIsFinishing(true);
      submitAnswers();
    }
  };

  const submitAnswers = () => {
    let niche = 'none';
    if (answers.goal === 'investing') niche = 'investing';
    else if (answers.goal === 'startup') niche = 'business';

    updateAppUser({
      ...answers,
      niche,
      onboardingStep: 'complete',
      onboardingComplete: true
    });
  };

  const handleSelect = (optionId: string) => {
    haptic();
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
    advanceStep();
  };

  const handleSliderSubmit = () => {
    haptic();
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: sliderValue }));
    advanceStep();
  };

  if (isFinishing) {
    return (
      <div className="w-full h-full bg-[#050505] text-white flex flex-col items-center justify-center p-6 space-y-8">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
           className="w-24 h-24 rounded-full border-[2px] border-t-accent border-r-transparent border-b-accent border-l-transparent shadow-3d-accent"
        />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">Analyzing Responses</h2>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Tailoring the T1GER Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#050505] text-white flex flex-col pt-16 pb-8 px-6 relative z-50 overflow-hidden">
      {/* 3D Progress Bar */}
      <div className="w-full h-2 liquid-glass rounded-full mb-10 overflow-hidden shadow-3d border-white/10 p-0.5">
        <motion.div 
          className="h-full bg-accent rounded-full shadow-3d-accent"
          animate={{ width: `${((stepIndex + 1) / QUESTIONS.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "circOut" }}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-3">
          {currentQuestion.title}
        </h1>
        <p className="text-xs font-medium text-zinc-500 mb-10 leading-relaxed uppercase tracking-wider">
          {currentQuestion.subtitle}
        </p>

        <div className="space-y-4 flex-1 overflow-y-auto pb-4 hide-scrollbar">
          
          {/* STANDARD OPTIONS RENDER */}
          {!currentQuestion.renderCustom && currentQuestion.options?.map((opt) => {
            const isSelected = answers[currentQuestion.id] === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-full text-left p-5 rounded-[2rem] transition-all duration-300 flex items-center justify-between group active:scale-[0.98] shadow-3d border border-white/10
                  ${isSelected 
                    ? 'liquid-glass-accent shadow-3d-accent' 
                    : 'liquid-glass hover:bg-white/[0.08]'
                  }`}
              >
                <div className="flex items-center gap-4">
                  {opt.icon && (
                    <div className="w-12 h-12 rounded-[1.5rem] bg-black/40 flex items-center justify-center shadow-inner border border-white/5">
                      {opt.icon}
                    </div>
                  )}
                  <div>
                    <h3 className="font-black text-sm tracking-tight uppercase">{opt.label}</h3>
                    {'description' in opt && (
                      <p className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-tight">{opt.description}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-zinc-600 transition-transform ${isSelected ? 'translate-x-1 text-white' : 'group-hover:translate-x-1'}`} />
              </button>
            );
          })}

          {/* CUSTOM 1-10 SLIDER */}
          {currentQuestion.renderCustom === 'level-slider' && (
            <div className="flex flex-col items-center justify-center mt-10 space-y-12">
              <div className="relative w-full max-w-[300px]">
                {/* Visual Level Display */}
                <div className="flex flex-col items-center mb-12">
                  <span className="text-8xl font-black italic tracking-tighter text-accent drop-shadow-[0_0_20px_var(--accent-glow)]">
                    {sliderValue}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-2">
                    {sliderValue <= 3 ? 'Beginner' : sliderValue <= 7 ? 'Intermediate' : 'Expert'}
                  </span>
                </div>

                {/* Range Input */}
                <div className="relative h-4 w-full liquid-glass rounded-full p-1 shadow-3d border-white/10">
                   <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={sliderValue}
                    onChange={(e) => setSliderValue(parseInt(e.target.value))}
                    className="w-full h-full appearance-none bg-transparent outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-3d [&::-webkit-slider-thumb]:border-accent [&::-webkit-slider-thumb]:border-4 transition-all"
                  />
                </div>
                
                <div className="flex justify-between w-full text-[9px] font-black text-zinc-600 mt-6 px-1 tracking-widest uppercase">
                  <span>Level 1</span>
                  <span>Level 10</span>
                </div>
              </div>

              <button
                onClick={handleSliderSubmit}
                className="w-full max-w-[300px] mt-8 liquid-glass-accent shadow-3d-accent active:scale-95 py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] transition-all"
              >
                Sync Response →
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};
