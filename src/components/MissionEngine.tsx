import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, CheckCircle2, AlertTriangle, ArrowRight, XCircle, Lightbulb, Brain, TrendingUp, PlaySquare, X } from 'lucide-react';
import { useT1ger } from '../contexts/T1gerContext';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { COMPETENCY_LABELS } from '../services/missionBank';

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

  const progress = Math.round(((stepIndex) / (steps.length)) * 100);

  const advance = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1);
      setQuizResult('idle');
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      handleSuccess();
    }
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;

    const optionsList = mission.recallOptions || mission.options || [];
    const isCorrect = optionsList[selectedOption]?.correct;

    if (isCorrect) {
      setQuizResult('correct');
    } else {
      setQuizResult('wrong');
    }
    setShowExplanation(true);
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

  const isSuccess = stepIndex === steps.length;
  const isFail = stepIndex > steps.length;
  const showMainUI = !isSuccess && !isFail;

  // Retrieve correct answer text for the fail explanation
  const correctAnswerText = useMemo(() => {
    const optionsList = mission.recallOptions || mission.options || [];
    const correctOpt = optionsList.find((o: any) => o.correct);
    return correctOpt ? correctOpt.text : '';
  }, [mission]);

  return (
    <div className="w-full min-h-screen bg-[#020204] text-white pt-[calc(1.5rem+var(--safe-top-inset,env(safe-area-inset-top)))] pb-[calc(1.5rem+var(--safe-bottom-inset,env(safe-area-inset-bottom)))] px-6 flex flex-col justify-between overflow-hidden relative">
      {/* Atmospheres */}
      <div className="absolute -top-[10%] -left-[10%] w-[35%] h-[35%] rounded-full blur-[100px] bg-[var(--bg-glow-1)] opacity-20 pointer-events-none" />
      <div className="absolute top-[30%] -right-[10%] w-[30%] h-[30%] rounded-full blur-[90px] bg-[var(--bg-glow-2)] opacity-15 pointer-events-none" />

      {/* Top Header Section */}
      <div className="w-full z-10">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onComplete}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <X size={18} />
          </button>
          
          {/* Progress bar */}
          <div className="h-2 flex-1 mx-4 bg-zinc-900 border border-white/5 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-[var(--accent-main)] rounded-full shadow-[0_0_12px_var(--accent-glow)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          
          <div className="w-10 text-center font-mono text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            {stepIndex + 1}/{steps.length}
          </div>
        </div>

        {/* Competency Badge */}
        {showMainUI && (
          <div className="flex items-center gap-2 mb-2 animate-fade-in">
            <span className="text-[9px] font-black font-mono text-[var(--accent-main)] bg-[var(--accent-main)]/10 px-2.5 py-0.5 rounded-full border border-[var(--accent-main)]/20 uppercase tracking-widest">
              {COMPETENCY_LABELS[compKey] || mission.competency || 'Mission'}
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center py-4 relative z-10 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* ============================================ */}
          {/* SUCCESS SCREEN                               */}
          {/* ============================================ */}
          {isSuccess && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center py-6"
            >
              <div className="mb-6 relative">
                <motion.img 
                  src="/tiger_celebrating.png" 
                  alt="Happy T1GER Mascot" 
                  className="w-40 h-40 object-contain drop-shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                  animate={{ y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                />
                <div className="absolute -bottom-1 -right-1 bg-[var(--accent-main)] text-black p-2 rounded-full shadow-lg">
                  <CheckCircle2 size={24} className="stroke-[3]" />
                </div>
              </div>

              <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2 text-white">
                MISSION COMPLETE
              </h1>
              <p className="text-2xl font-black font-mono text-[var(--accent-main)] drop-shadow-[0_0_10px_var(--accent-glow)] mb-8">
                +{mission.xpReward || 20} XP
              </p>

              {/* Competency growth indicator */}
              <div className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-5 mb-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[var(--accent-main)]" />
                    <span className="text-xs font-black uppercase text-zinc-400">
                      {COMPETENCY_LABELS[compKey] || mission.competency}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--accent-main)]">
                    {(Math.round(competencies[compKey] || 0) - scoreBefore) > 0 ? `+${(Math.round(competencies[compKey] || 0) - scoreBefore)}` : (Math.round(competencies[compKey] || 0) - scoreBefore)} pts
                  </span>
                </div>
                <div className="h-2 bg-zinc-900 border border-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent-main)] rounded-full transition-all duration-1000 shadow-[0_0_8px_var(--accent-glow)]"
                    style={{ width: `${Math.round(competencies[compKey] || 0)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold">{scoreBefore}</span>
                  <span className="text-[10px] font-mono text-[var(--accent-main)] font-bold">{Math.round(competencies[compKey] || 0)}/100</span>
                </div>
              </div>

              <button
                onClick={onComplete}
                className="w-full py-5 rounded-2xl btn-gamified-3d flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={18} className="stroke-[3]" />
              </button>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* FAIL SCREEN                                  */}
          {/* ============================================ */}
          {isFail && (
            <motion.div 
              key="fail"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center py-6"
            >
              <div className="mb-6 relative">
                <img 
                  src="/tiger_sad.png" 
                  alt="Sad T1GER Mascot" 
                  className="w-40 h-40 object-contain drop-shadow-[0_0_20px_rgba(239,68,68,0.2)]" 
                />
                <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-2 rounded-full shadow-lg">
                  <XCircle size={24} className="stroke-[3]" />
                </div>
              </div>
              
              <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                MISSED THIS ONE
              </h1>
              <p className="text-sm font-medium text-zinc-400 max-w-xs mb-8 leading-relaxed">
                Every mistake is a lesson, Predator. Review the explanation, sharpen your claws, and try again!
              </p>
              
              <button 
                onClick={onComplete} 
                className="w-full py-5 rounded-2xl btn-gamified-3d border-red-800 bg-red-500/10 hover:bg-red-500/20 text-red-400 shadow-[0_4px_0_0_#991b1b] border-red-500/20 flex items-center justify-center gap-2"
                style={{ shadow: '0 4px 0 0 #991b1b' } as any}
              >
                Continue →
              </button>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* TEACH STEP — Show the concept                */}
          {/* ============================================ */}
          {showMainUI && currentStep === 'teach' && (
            <motion.div
              key="teach"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-center gap-5 bg-transparent"
            >
              {learningStyle === 'visual' ? (
                <div className="rounded-[2.5rem] overflow-hidden bg-zinc-950 border border-white/10 flex items-center justify-center relative shadow-2xl h-[380px] w-full">
                  {mission.videoUrl || mission.imageUrl ? (
                     <img src={mission.imageUrl} className="w-full h-full object-cover opacity-50" alt="lesson" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center flex-col p-6 text-center">
                      <PlaySquare className="w-14 h-14 text-[var(--accent-main)] mb-4 opacity-40 animate-pulse" />
                      <h2 className="text-xl font-black uppercase italic tracking-tighter text-white mb-2">Visual Insight</h2>
                      <p className="text-xs font-mono text-zinc-500 font-bold uppercase tracking-wider">Demonstrative Briefing</p>
                    </div>
                  )}
                  
                  {/* TikTok style text overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/60 to-transparent">
                    {/* Mascot explains */}
                    <div className="flex items-center gap-3 mb-3">
                      <img src="/tiger_thinking.png" alt="T1GER Mascot" className="w-10 h-10 object-contain" />
                      <div className="bg-[#121217] border border-white/10 rounded-2xl px-3 py-1.5 shadow-lg relative after:content-[''] after:absolute after:-left-1.5 after:top-1/2 after:-translate-y-1/2 after:w-3 after:h-3 after:bg-[#121217] after:border-l after:border-b after:border-white/10 after:rotate-45">
                        <span className="text-[7px] font-mono text-[var(--accent-main)] uppercase tracking-widest block font-black">T1GER Mascot</span>
                        <span className="text-[10px] text-zinc-300 font-semibold leading-none">¡Presta atención!</span>
                      </div>
                    </div>

                    <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2 shadow-black drop-shadow-md">
                      {mission.title}
                    </h1>
                    <p className="text-xs leading-relaxed text-zinc-300 drop-shadow-md line-clamp-3 font-medium mb-4">
                      {mission.concept_flashcard || mission.concept || 'Learn this concept.'}
                    </p>
                    
                    <button
                      onClick={advance}
                      className="w-full py-4.5 rounded-xl btn-gamified-3d flex items-center justify-center gap-2"
                    >
                      <Brain className="w-4 h-4" /> Got It, Instructor
                    </button>
                  </div>
                </div>
              ) : (
                /* Text Learning Style: Mascot + clean neomorphic layout */
                <div className="flex-1 flex flex-col justify-center gap-6">
                  {/* Mascot explains speaking bubble */}
                  <div className="flex items-start gap-4 mb-2">
                    <motion.img 
                      src="/tiger_thinking.png" 
                      alt="T1GER Mascot" 
                      className="w-16 h-16 object-contain flex-shrink-0"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    />
                    <div className="bg-[#0f0f13] border border-white/10 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-[#0f0f13] after:border-l after:border-b after:border-white/10 after:rotate-45 after:-translate-y-1/2">
                      <p className="text-[9px] font-black font-mono text-[var(--accent-main)] uppercase tracking-widest mb-1">T1GER Instructor</p>
                      <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
                        ¡Presta mucha atención, Predator! Este concepto sentará las bases para tu próxima prueba.
                      </p>
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--accent-main)] border-l-4 border-[var(--accent-main)] pl-4">
                    {mission.title}
                  </h1>

                  {/* Concept card */}
                  <div className="liquid-glass rounded-3xl p-6 shadow-xl border border-white/5">
                    <p className="text-[15px] leading-relaxed text-zinc-300 font-medium font-sans">
                      {mission.concept_flashcard || mission.concept || 'Learn this concept.'}
                    </p>
                  </div>

                  {/* Key takeaway pill */}
                  {(mission.keyTakeaway) && (
                    <div className="flex items-start gap-3 bg-[var(--accent-main)]/5 border border-[var(--accent-main)]/10 rounded-2xl p-4">
                      <Lightbulb className="w-5 h-5 text-[var(--accent-main)] flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-[var(--accent-main)] leading-normal uppercase tracking-wide">
                        Takeaway: {mission.keyTakeaway}
                      </p>
                    </div>
                  )}

                  {/* CTA button (Tactile 3D) */}
                  <button
                    onClick={advance}
                    className="w-full py-5 rounded-2xl btn-gamified-3d flex items-center justify-center gap-2 mt-4"
                  >
                    <Brain className="w-4 h-4 stroke-[3]" /> Test My Skills
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ============================================ */}
          {/* RECALL STEP — Quiz on what was just taught    */}
          {/* ============================================ */}
          {showMainUI && currentStep === 'recall' && (
            <motion.div
              key="recall"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-center gap-5"
            >
              {/* Mascot asking question */}
              <div className="flex items-start gap-4 mb-2">
                <img 
                  src="/tiger_thinking.png" 
                  alt="T1GER Mascot" 
                  className="w-16 h-16 object-contain flex-shrink-0"
                />
                <div className="bg-[#0f0f13] border border-white/10 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-[#0f0f13] after:border-l after:border-b after:border-white/10 after:rotate-45 after:-translate-y-1/2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-main)] block mb-1">Concept Challenge</span>
                  <p className="text-sm font-bold leading-snug text-white font-sans">
                    {mission.recallQuestion || mission.business_scenario || mission.scenario || 'Can you apply what you just learned?'}
                  </p>
                </div>
              </div>

              {/* Options list */}
              <div className="space-y-3 mb-4">
                {(mission.recallOptions || mission.options || []).map((option: any, i: number) => {
                  const isSelected = selectedOption === i;
                  
                  // Setup custom classes for active status checks
                  let cls = 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04] text-zinc-300';
                  if (isSelected) {
                    cls = 'bg-[var(--accent-main)]/5 border-[var(--accent-main)] text-[var(--accent-main)] shadow-[0_0_15px_rgba(204,255,0,0.08)]';
                  }
                  
                  if (quizResult !== 'idle') {
                    if (option.correct) {
                      cls = 'bg-green-500/10 border-green-500 text-green-400';
                    } else if (isSelected) {
                      cls = 'bg-red-500/10 border-red-500 text-red-400';
                    } else {
                      cls = 'bg-white/[0.01] border-white/5 opacity-30 text-zinc-600';
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => quizResult === 'idle' && setSelectedOption(i)}
                      disabled={quizResult !== 'idle'}
                      className={`w-full p-4.5 rounded-[1.5rem] border text-left font-bold text-sm transition-all duration-300 flex items-center justify-between group active:scale-[0.98] ${cls}`}
                    >
                      <span>{option.text}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[9px] font-black ${
                        isSelected 
                          ? 'border-[var(--accent-main)] bg-[var(--accent-main)] text-black' 
                          : 'border-zinc-700 bg-black/40 text-zinc-500'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* QUIZ STEP — Scenario quiz (non-flashcard)    */}
          {/* ============================================ */}
          {showMainUI && currentStep === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-center gap-5"
            >
              {/* Mascot asking question */}
              <div className="flex items-start gap-4 mb-2">
                <img 
                  src="/tiger_thinking.png" 
                  alt="T1GER Mascot" 
                  className="w-16 h-16 object-contain flex-shrink-0"
                />
                <div className="bg-[#0f0f13] border border-white/10 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-[#0f0f13] after:border-l after:border-b after:border-white/10 after:rotate-45 after:-translate-y-1/2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-main)] block mb-1">Scenario Challenge</span>
                  <p className="text-sm font-bold leading-snug text-white font-sans">
                    {mission.business_scenario || mission.scenario || 'Answer this question:'}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-4">
                {(mission.options || []).map((option: any, i: number) => {
                  const isSelected = selectedOption === i;
                  
                  let cls = 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04] text-zinc-300';
                  if (isSelected) {
                    cls = 'bg-[var(--accent-main)]/5 border-[var(--accent-main)] text-[var(--accent-main)] shadow-[0_0_15px_rgba(204,255,0,0.08)]';
                  }

                  if (quizResult !== 'idle') {
                    if (option.correct) {
                      cls = 'bg-green-500/10 border-green-500 text-green-400';
                    } else if (isSelected) {
                      cls = 'bg-red-500/10 border-red-500 text-red-400';
                    } else {
                      cls = 'bg-white/[0.01] border-white/5 opacity-30 text-zinc-600';
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => quizResult === 'idle' && setSelectedOption(i)}
                      disabled={quizResult !== 'idle'}
                      className={`w-full p-4.5 rounded-[1.5rem] border text-left font-bold text-sm transition-all duration-300 flex items-center justify-between active:scale-[0.98] ${cls}`}
                    >
                      <span>{option.text}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[9px] font-black ${
                        isSelected 
                          ? 'border-[var(--accent-main)] bg-[var(--accent-main)] text-black' 
                          : 'border-zinc-700 bg-black/40 text-zinc-500'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* ARTIFACT STEP — Real world task upload        */}
          {/* ============================================ */}
          {showMainUI && currentStep === 'artifact' && (
            <motion.div
              key="artifact"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-center gap-6"
            >
              {/* Mascot explaining */}
              <div className="flex items-start gap-4 mb-2">
                <img 
                  src="/tiger_thinking.png" 
                  alt="T1GER Mascot" 
                  className="w-16 h-16 object-contain flex-shrink-0"
                />
                <div className="bg-[#0f0f13] border border-white/10 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-[#0f0f13] after:border-l after:border-b after:border-white/10 after:rotate-45 after:-translate-y-1/2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-main)] block mb-1">Action Protocol</span>
                  <p className="text-xs font-semibold leading-relaxed text-zinc-400">
                    Predator, completa este ejercicio de campo en el mundo real y sube la foto como prueba irrefutable de tu trabajo.
                  </p>
                </div>
              </div>

              <h2 className="text-xl font-black italic uppercase tracking-tight text-white pl-4 border-l-4 border-[var(--accent-main)]">
                REAL-WORLD PROOF
              </h2>
              <p className="text-sm leading-relaxed text-zinc-300 font-medium font-sans">
                {mission.mission_brief || mission.taskBrief || 'Complete this task and submit photo proof.'}
              </p>
              
              <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-white/15 rounded-3xl cursor-pointer hover:border-[var(--accent-main)] hover:bg-white/[0.01] transition-all duration-300">
                <Camera className="w-10 h-10 text-zinc-500 mb-3" />
                <span className="font-bold text-[10px] uppercase tracking-widest text-zinc-400">Tap to Capture & Upload Proof</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleArtifactUpload} />
              </label>
              
              <button 
                onClick={handleSuccess} 
                className="w-full py-4.5 border border-white/5 rounded-2xl font-bold text-xs uppercase tracking-widest text-zinc-500 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
              >
                Skip for now
              </button>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* FLASHCARD STEP — Legacy fallback              */}
          {/* ============================================ */}
          {showMainUI && currentStep === 'flashcard' && (
            <motion.div
              key="flashcard"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-center gap-6"
            >
              <div className="flex items-start gap-4 mb-2">
                <img 
                  src="/tiger_thinking.png" 
                  alt="T1GER Mascot" 
                  className="w-16 h-16 object-contain flex-shrink-0"
                />
                <div className="bg-[#0f0f13] border border-white/10 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-[#0f0f13] after:border-l after:border-b after:border-white/10 after:rotate-45 after:-translate-y-1/2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-main)] block mb-1">Knowledge Core</span>
                  <p className="text-xs font-semibold leading-relaxed text-zinc-400">
                    Estudia esta píldora de conocimiento clave, Predator.
                  </p>
                </div>
              </div>

              <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--accent-main)]">{mission.title}</h1>
              <div className="liquid-glass rounded-3xl p-6 shadow-xl border border-white/5">
                <p className="text-[15px] leading-relaxed text-zinc-300 font-medium font-sans">
                  {mission.concept_flashcard || mission.concept || 'Learn this concept and advance.'}
                </p>
              </div>
              
              <button
                onClick={advance}
                className="w-full py-5 rounded-2xl btn-gamified-3d flex items-center justify-center gap-2"
              >
                Got It <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============================================================ */}
      {/* PERSISTENT DUOLINGO-STYLE SLIDE-UP BOTTOM PANEL              */}
      {/* ============================================================ */}
      {showMainUI && (currentStep === 'recall' || currentStep === 'quiz') && (
        <div className="fixed bottom-0 left-0 right-0 z-30">
          {/* Correct Answer Bottom Panel */}
          <AnimatePresence>
            {quizResult === 'correct' && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 20, stiffness: 220 }}
                className="w-full bg-[#0a2717] border-t border-green-500/25 px-6 py-6 pb-8 shadow-[0_-15px_40px_rgba(16,185,129,0.15)] flex flex-col gap-4"
              >
                <div className="flex items-start gap-4 max-w-md mx-auto w-full">
                  <motion.img 
                    src="/tiger_celebrating.png" 
                    alt="T1GER Celebrating" 
                    className="w-14 h-14 object-contain"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  />
                  <div className="bg-green-500/10 border border-green-500/20 rounded-[1.2rem] p-3 flex-1 relative after:content-[''] after:absolute after:-left-1.5 after:top-6 after:w-3 after:h-3 after:bg-[#0a2717] after:border-l after:border-b after:border-green-500/20 after:rotate-45 after:-translate-y-1/2">
                    <h3 className="text-xs font-black text-green-400 uppercase tracking-widest mb-0.5">¡Excelente!</h3>
                    <p className="text-[11px] text-green-300 leading-normal font-semibold">
                      {mission.recallExplanation || mission.failureCritique || '¡Has respondido con precisión quirúrgica, Predator!'}
                    </p>
                  </div>
                </div>
                <div className="max-w-md mx-auto w-full">
                  <button 
                    onClick={advance}
                    className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-black bg-[#10b981] hover:bg-[#059669] shadow-[0_4px_0_0_#065f46] active:translate-y-[4px] active:shadow-none transition-all"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Incorrect Answer Bottom Panel */}
          <AnimatePresence>
            {quizResult === 'wrong' && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 20, stiffness: 220 }}
                className="w-full bg-[#3b0f14] border-t border-red-500/25 px-6 py-6 pb-8 shadow-[0_-15px_40px_rgba(239,68,68,0.15)] flex flex-col gap-4"
              >
                <div className="flex items-start gap-4 max-w-md mx-auto w-full">
                  <img src="/tiger_sad.png" alt="T1GER Sad" className="w-14 h-14 object-contain" />
                  <div className="bg-red-500/10 border border-red-500/20 rounded-[1.2rem] p-3 flex-1 relative after:content-[''] after:absolute after:-left-1.5 after:top-6 after:w-3 after:h-3 after:bg-[#3b0f14] after:border-l after:border-b after:border-red-500/20 after:rotate-45 after:-translate-y-1/2">
                    <h3 className="text-xs font-black text-red-400 uppercase tracking-widest mb-0.5">Respuesta Incorrecta</h3>
                    <p className="text-[11px] text-red-300 font-semibold leading-normal mb-1">
                      {mission.recallExplanation || mission.failureCritique || 'No te preocupes. ¡Aprende del error!'}
                    </p>
                    {correctAnswerText && (
                      <p className="text-[10px] text-zinc-400 font-mono mt-1">
                        La correcta era: <span className="text-red-400 font-bold">{correctAnswerText}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="max-w-md mx-auto w-full">
                  <button 
                    onClick={handleFail}
                    className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-white bg-[#ef4444] hover:bg-[#dc2626] shadow-[0_4px_0_0_#991b1b] active:translate-y-[4px] active:shadow-none transition-all"
                  >
                    Entendido
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Idle Selection Checking Bottom Panel */}
          {quizResult === 'idle' && (
            <div className="w-full bg-[#050508]/90 backdrop-blur-md border-t border-white/5 px-6 py-6 pb-8 shadow-[0_-10px_35px_rgba(0,0,0,0.8)]">
              <div className="max-w-md mx-auto w-full">
                <button
                  disabled={selectedOption === null}
                  onClick={handleCheckAnswer}
                  className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest btn-gamified-3d flex items-center justify-center gap-2 cursor-pointer"
                >
                  Check Answer
                </button>
              </div>
            </div>
          )}
        </div>
      )}
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
