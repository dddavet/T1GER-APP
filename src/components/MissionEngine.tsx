import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, CheckCircle2, AlertTriangle, ArrowRight, XCircle, Lightbulb, Brain, TrendingUp, PlaySquare } from 'lucide-react';
import { useT1ger } from '../contexts/T1gerContext';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { COMPETENCY_LABELS } from '../services/missionBank';
import { GlassButton } from './ui/apple-tahoe-liquid-glass-button';

interface MissionEngineProps {
  mission: any;
  onComplete: () => void;
}

export const MissionEngine: React.FC<MissionEngineProps> = ({ mission, onComplete }) => {
  const { addXP } = useT1ger();
  const { completeMission, failMission, competencies } = useBrain();
  const { appUser } = useAuth();
  const learningStyle = appUser?.learningStyle || 'text';

  // Determine steps based on mission type
  const steps = useMemo(() => getStepsForType(mission.type || 'flashcard', mission, learningStyle), [mission, learningStyle]);
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex];
  const [quizResult, setQuizResult] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Track the competency score before the mission for the result screen
  const compKey = mission.competency as keyof typeof competencies;
  const [scoreBefore] = useState(Math.round(competencies[compKey] || 0));

  const progress = Math.round(((stepIndex + 1) / (steps.length + 1)) * 100); // +1 for success screen

  const advance = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1);
      setQuizResult('idle');
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  const handleQuizAnswer = (optionIndex: number, isCorrect: boolean) => {
    setSelectedOption(optionIndex);
    if (isCorrect) {
      setQuizResult('correct');
    } else {
      setQuizResult('wrong');
    }
    // Show explanation after a brief pause
    setTimeout(() => setShowExplanation(true), 600);
  };

  const handleArtifactUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSuccess();
    }
  };

  const handleSuccess = async () => {
    completeMission(mission.id, 100);
    await addXP(mission.xpReward || 20);
    setStepIndex(steps.length); // show success screen
  };

  const handleFail = () => {
    failMission(mission.id);
    setStepIndex(steps.length + 1); // show fail screen
  };

  // We will incorporate Success and Fail screens as 'steps' in the main renderer.
  // Instead of early returns, we map them as new view states.
  const isSuccess = stepIndex === steps.length;
  const isFail = stepIndex > steps.length;
  const showMainUI = !isSuccess && !isFail;

  // ============================================================
  // MAIN MISSION UI
  // ============================================================
  return (
    <div className="w-full h-full bg-transparent text-white p-6 flex flex-col">
      {/* Progress bar */}
      <div className="h-1.5 w-full bg-zinc-800 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full shadow-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Competency & step badge */}
      {showMainUI && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20 uppercase tracking-widest">
            {COMPETENCY_LABELS[compKey] || mission.competency || 'Mission'}
          </span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">
            Step {stepIndex + 1}/{steps.length}
          </span>
        </div>
      )}

      <div className="flex-1 flex flex-col relative">
        {/* ============================================ */}
        {/* SUCCESS SCREEN                               */}
        {/* ============================================ */}
        {isSuccess && (
          <div className="absolute inset-0 flex flex-col items-center justify-center -mt-12 bg-transparent z-10 animate-fade-in">
            <div className="mb-6 flex items-center justify-center w-24 h-24 rounded-full bg-accent/20 animate-pop">
              <CheckCircle2 size={56} className="text-accent" />
            </div>

            <p className="text-3xl font-black italic uppercase tracking-tighter mb-2">
              MISSION COMPLETE
            </p>
            <p className="text-xl font-mono text-accent mb-8">
              +{mission.xpReward || 20} XP
            </p>

            {/* Competency growth indicator */}
            <div className="w-full max-w-xs bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="text-xs font-black uppercase text-zinc-400">
                    {COMPETENCY_LABELS[compKey] || mission.competency}
                  </span>
                </div>
                <span className="text-xs font-mono text-accent">
                  {(Math.round(competencies[compKey] || 0) - scoreBefore) > 0 ? `+${(Math.round(competencies[compKey] || 0) - scoreBefore)}` : (Math.round(competencies[compKey] || 0) - scoreBefore)} pts
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-1000 shadow-accent"
                  style={{ width: `${Math.round(competencies[compKey] || 0)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] font-mono text-zinc-600">{scoreBefore}</span>
                <span className="text-[10px] font-mono text-accent">{Math.round(competencies[compKey] || 0)}/100</span>
              </div>
            </div>

            <GlassButton onClick={onComplete} className="mt-8 w-full" intensity="quiet">
              Continue
              <ArrowRight className="w-4 h-4" />
            </GlassButton>
          </div>
        )}

        {/* ============================================ */}
        {/* FAIL SCREEN                                  */}
        {/* ============================================ */}
        {isFail && (
          <div className="absolute inset-0 flex flex-col items-center justify-center -mt-12 bg-transparent z-10 animate-fade-in">
            <div className="mb-6 w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center animate-pop liquid-glass">
              <XCircle size={56} className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
            </div>
            <p className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-red-400">MISSED THIS ONE</p>
            <p className="text-sm font-mono text-zinc-400 text-center mb-6 px-4">
              Review the concept and try again. Every mistake is a lesson.
            </p>
            <GlassButton onClick={onComplete} className="w-full" tone="danger" intensity="quiet">
              Continue
              <ArrowRight className="w-4 h-4" />
            </GlassButton>
          </div>
        )}

        {/* ============================================ */}
        {/* TEACH STEP — Show the concept                */}
        {/* ============================================ */}
        {showMainUI && currentStep === 'teach' && (
          <motion.div
            key="teach"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex-1 flex flex-col justify-center gap-5 bg-transparent relative"
          >
            {/* Visual Learning Style: TikTok / Reels layout */}
            {learningStyle === 'visual' ? (
              <div className="absolute inset-0 -mx-6 rounded-3xl overflow-hidden bg-zinc-900 flex items-center justify-center relative shadow-2xl">
                {/* Simulated Video Player */}
                {mission.videoUrl || mission.imageUrl ? (
                   <img src={mission.imageUrl} className="w-full h-full object-cover opacity-60" alt="lesson" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center flex-col p-6 text-center">
                    <PlaySquare className="w-16 h-16 text-accent mb-4 opacity-50" />
                    <h2 className="text-xl font-black uppercase italic tracking-tighter text-white mb-2">Visual Insight</h2>
                    <p className="text-xs font-mono text-zinc-400">Video Demonstration</p>
                  </div>
                )}
                
                {/* TikTok style text overlay */}
                <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2 shadow-black drop-shadow-md">
                    {mission.title}
                  </h1>
                  <p className="text-sm leading-relaxed text-zinc-200 drop-shadow-md line-clamp-3">
                    {mission.concept_flashcard || mission.concept || 'Learn this concept.'}
                  </p>
                  
                  <GlassButton
                    onClick={advance}
                    className="mt-6 w-full"
                    tone="dark"
                    intensity="strong"
                    glassColor="color-mix(in srgb, var(--accent-main) 72%, rgba(255,255,255,0.16))"
                  >
                    <Brain className="w-4 h-4" /> Got It
                  </GlassButton>
                </div>
              </div>
            ) : (
              /* Text Learning Style: Notion / Clean layout */
              <div className="flex-1 flex flex-col justify-center gap-5">
                {/* Title */}
                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-accent border-l-4 border-accent pl-4">
                  {mission.title}
                </h1>

                {/* Concept card */}
                <div className="liquid-glass rounded-2xl p-6 shadow-xl">
                  <p className="text-[15px] leading-relaxed text-zinc-300 font-medium">
                    {mission.concept_flashcard || mission.concept || 'Learn this concept.'}
                  </p>
                </div>

                {/* Key takeaway pill */}
                {(mission.keyTakeaway) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-3 bg-accent/5 border border-accent/10 rounded-xl p-4"
                  >
                    <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-accent leading-snug">
                      {mission.keyTakeaway}
                    </p>
                  </motion.div>
                )}

                {/* CTA */}
                <GlassButton
                  onClick={advance}
                  className="mt-4 w-full"
                  tone="dark"
                  intensity="strong"
                  glassColor="color-mix(in srgb, var(--accent-main) 72%, rgba(255,255,255,0.16))"
                >
                  <Brain className="w-4 h-4" /> Test Me
                </GlassButton>
              </div>
            )}
          </motion.div>
        )}

        {/* ============================================ */}
        {/* RECALL STEP — Quiz on what was just taught    */}
        {/* ============================================ */}
        {currentStep === 'recall' && (
          <motion.div
            key="recall"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex-1 flex flex-col justify-center gap-5 bg-transparent"
          >
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest text-accent">Recall Check</span>
            </div>
            <p className="text-base font-bold leading-relaxed">
              {mission.recallQuestion || mission.business_scenario || mission.scenario || 'Can you apply what you just learned?'}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {(mission.recallOptions || mission.options || []).map((option: any, i: number) => {
                let cls = 'bg-white/5 border-white/10 hover:border-white/20';
                if (selectedOption !== null) {
                  if (option.correct) cls = 'bg-[var(--accent-main)]/10 border-[var(--accent-main)]/30 text-[var(--accent-main)]';
                  else if (i === selectedOption) cls = 'bg-red-500/10 border-red-500/30 text-red-400';
                  else cls = 'bg-white/[0.02] border-white/5 opacity-40';
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleQuizAnswer(i, option.correct)}
                    disabled={quizResult !== 'idle'}
                    className={`w-full p-4 rounded-2xl border text-left font-bold text-sm transition-all ${cls}`}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className={`p-4 rounded-2xl border ${quizResult === 'correct'
                    ? 'bg-accent/5 border-accent/20'
                    : 'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                    <p className={`text-xs font-black uppercase mb-1 ${quizResult === 'correct' ? 'text-accent' : 'text-red-400'}`}>
                      {quizResult === 'correct' ? '✓ Correct' : '✗ Not quite'}
                    </p>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {mission.recallExplanation || mission.failureCritique || 'Review the concept and try again.'}
                    </p>
                  </div>

                  {quizResult === 'correct' ? (
                    <GlassButton
                      onClick={steps.length > stepIndex + 1 ? advance : handleSuccess}
                      className="w-full"
                      tone="dark"
                      intensity="strong"
                      glassColor="color-mix(in srgb, var(--accent-main) 72%, rgba(255,255,255,0.16))"
                    >
                      {steps.length > stepIndex + 1 ? 'Continue' : 'Complete Mission'}
                    </GlassButton>
                  ) : (
                    <GlassButton
                      onClick={handleFail}
                      className="w-full"
                      tone="danger"
                      intensity="quiet"
                      size="sm"
                    >
                      <XCircle className="w-4 h-4" /> Accept & Review Later
                    </GlassButton>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ============================================ */}
        {/* QUIZ STEP — Scenario quiz (non-flashcard)    */}
        {/* ============================================ */}
        {currentStep === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex-1 flex flex-col justify-center gap-5 bg-transparent"
          >
            <p className="text-base font-mono leading-relaxed">
              {mission.business_scenario || mission.scenario || 'Answer this question:'}
            </p>
            <div className="space-y-3">
              {(mission.options || []).map((option: any, i: number) => {
                let cls = 'bg-white/5 border-white/10 hover:border-white/20';
                if (selectedOption !== null) {
                  if (option.correct) cls = 'bg-[var(--accent-main)]/10 border-[var(--accent-main)]/30 text-[var(--accent-main)]';
                  else if (i === selectedOption) cls = 'bg-red-500/10 border-red-500/30 text-red-400';
                  else cls = 'bg-white/[0.02] border-white/5 opacity-40';
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleQuizAnswer(i, option.correct)}
                    disabled={quizResult !== 'idle'}
                    className={`w-full p-4 rounded-2xl border text-left font-bold text-sm transition-all ${cls}`}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {showExplanation && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className={`p-4 rounded-2xl border ${quizResult === 'correct' ? 'bg-accent/5 border-accent/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <p className={`text-xs font-black uppercase mb-1 ${quizResult === 'correct' ? 'text-accent' : 'text-red-400'}`}>
                      {quizResult === 'correct' ? '✓ Correct' : '✗ Wrong'}
                    </p>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {mission.failureCritique || 'Review the correct answer above.'}
                    </p>
                  </div>
                  {quizResult === 'correct' ? (
                    <GlassButton
                      onClick={handleSuccess}
                      className="w-full"
                      tone="dark"
                      intensity="strong"
                      glassColor="color-mix(in srgb, var(--accent-main) 72%, rgba(255,255,255,0.16))"
                    >
                      Complete Mission
                    </GlassButton>
                  ) : (
                    <GlassButton onClick={handleFail} className="w-full" tone="danger" intensity="quiet" size="sm">
                      <XCircle className="w-4 h-4" /> Accept & Move On
                    </GlassButton>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ============================================ */}
        {/* ARTIFACT STEP — Real world task upload        */}
        {/* ============================================ */}
        {currentStep === 'artifact' && (
          <motion.div
            key="artifact"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex-1 flex flex-col justify-center gap-6 bg-transparent"
          >
            <h2 className="text-xl font-black italic uppercase tracking-tight">REAL-WORLD PROOF</h2>
            <p className="text-sm font-mono text-zinc-300 leading-relaxed">
              {mission.mission_brief || mission.taskBrief || 'Complete this task and submit photo proof.'}
            </p>
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-3xl cursor-pointer hover:border-accent transition-colors">
              <Camera className="w-12 h-12 text-zinc-500 mb-3" />
              <span className="font-bold text-xs uppercase tracking-widest">Tap to Upload Proof</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleArtifactUpload} />
            </label>
            <GlassButton onClick={handleSuccess} className="w-full" intensity="quiet" size="sm">
              Skip for now
            </GlassButton>
          </motion.div>
        )}

        {/* ============================================ */}
        {/* FLASHCARD STEP — Legacy fallback              */}
        {/* ============================================ */}
        {currentStep === 'flashcard' && (
          <motion.div
            key="flashcard"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex-1 flex flex-col justify-center gap-6 bg-transparent"
          >
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-accent">{mission.title}</h1>
            <p className="text-sm font-mono text-zinc-300 leading-relaxed">
              {mission.concept_flashcard || mission.concept || 'Learn this concept and advance.'}
            </p>
            <GlassButton
              onClick={advance}
              className="w-full"
              tone="dark"
              intensity="strong"
              glassColor="color-mix(in srgb, var(--accent-main) 72%, rgba(255,255,255,0.16))"
            >
              Got It <ArrowRight className="w-4 h-4" />
            </GlassButton>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// STEP SEQUENCING
// ============================================================

function getStepsForType(type: string, mission: any, learningStyle: string): string[] {
  switch (type) {
    case 'flashcard':
      if (mission.recallQuestion || mission.recallOptions) {
        if (learningStyle === 'interactive') {
          // Interactive learners skip the teach phase directly to testing their intuition
          return ['recall'];
        }
        return ['teach', 'recall'];
      }
      return ['flashcard'];
    case 'scenario_quiz':
      return ['quiz'];
    case 'real_world_task':
      if (learningStyle === 'interactive') return ['artifact'];
      return ['teach', 'artifact'];
    default:
      return ['flashcard'];
  }
}
