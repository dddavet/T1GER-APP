import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, CheckCircle2, AlertTriangle, ArrowRight, XCircle, Lightbulb, Brain, 
  TrendingUp, PlaySquare, X, BookOpen, Terminal, Play, Sparkles, Cpu, 
  ChevronDown, ChevronUp, RefreshCw, FileText, Lock, Crown
} from 'lucide-react';
import { useT1ger } from '../contexts/T1gerContext';
import { useBrain } from '../contexts/BrainContext';
import { useAuth } from '../contexts/AuthContext';
import { COMPETENCY_LABELS } from '../services/missionBank';
import { getCharacterForTrack, getRandomPhrase } from '../services/characterStateEngine';
import { executePromptChallenge } from '../services/gemini';
import { T1gerInteractiveAvatar } from './T1gerInteractiveAvatar';

interface MissionEngineProps {
  mission: any;
  onComplete: () => void;
}

export const MissionEngine: React.FC<MissionEngineProps> = ({ mission, onComplete }) => {
  const { addXP } = useT1ger();
  const { completeMission, failMission, competencies } = useBrain();
  const { appUser, updateAppUser } = useAuth();
  const learningStyle = appUser?.learningStyle || 'text';
  
  const haptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
  };

  const lessonQuote = useMemo(() => {
    if (mission.quote?.text) return mission.quote;
    if (mission.curatedData?.quote?.text) return mission.curatedData.quote;
    
    const comp = mission.competency || 'mindset';
    if (comp === 'investing' || comp === 'accounting') {
      return {
        text: "The individual investor should act consistently as an investor and not as a speculator.",
        author: "Benjamin Graham",
        context: "The father of Value Investing reminds us of the difference between gambling and systematic wealth building."
      };
    }
    if (comp === 'offer' || comp === 'sales' || comp === 'marketing') {
      return {
        text: "Make them an offer so good they feel stupid saying no.",
        author: "Alex Hormozi",
        context: "Focus on maximizing the customer's perceived value, not discounting your prices."
      };
    }
    if (comp === 'ai') {
      return {
        text: "AI will not replace you. A person using AI will replace you.",
        author: "AI Proverb",
        context: "The key skill is mastering the tools and learning to collaborate with intelligent models."
      };
    }
    return {
      text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
      author: "Aristotle",
      context: "Daily tactical discipline and real-world consistency beat talent and temporary motivation."
    };
  }, [mission.quote, mission.curatedData?.quote, mission.competency]);

  const lessonReading = useMemo(() => {
    if (mission.reading?.paragraphs) return mission.reading;
    if (mission.curatedData?.reading?.paragraphs) return mission.curatedData.reading;
    
    const concept = mission.concept_flashcard || mission.concept || "Learn the main concept of this lesson.";
    const title = mission.title || "Key Concept";
    const takeaway = mission.keyTakeaway || "Complete today's action to consolidate the habit.";
    
    const paragraphs = concept.split('. ').filter(Boolean).map((p: string) => p.trim() + (p.endsWith('.') ? '' : '.'));
    
    return {
      title,
      subtitle: `${COMPETENCY_LABELS[mission.competency as keyof typeof COMPETENCY_LABELS] || mission.competency || 'Skill'} Training`,
      paragraphs: paragraphs.length > 0 ? paragraphs : [concept],
      takeaway
    };
  }, [mission.reading, mission.curatedData?.reading, mission.concept_flashcard, mission.concept, mission.title, mission.keyTakeaway, mission.competency]);

  const lessonAction = useMemo(() => {
    if (mission.action?.instruction) return mission.action;
    if (mission.curatedData?.action?.instruction) return mission.curatedData.action;
    
    const taskBrief = mission.taskBrief || mission.mission_brief;
    if (taskBrief) {
      return {
        title: "Field Action",
        instruction: taskBrief,
        type: "photo",
        successReward: 50
      };
    }
    
    return {
      title: "Daily Consistency",
      instruction: "Before opening any social media today, perform 10 pushups. Describe how you felt or upload a photo as proof.",
      type: "tap",
      successReward: 50
    };
  }, [mission.action, mission.curatedData?.action, mission.taskBrief, mission.mission_brief]);

  const lessonYoutube = useMemo(() => {
    // 1. Try to find a video in the new sources array
    if (mission.sources && mission.sources.length > 0) {
      const videoSource = mission.sources.find((s: any) => s.type === 'video');
      if (videoSource) {
        // Extract youtube ID from embed URL
        const match = videoSource.url?.match(/embed\/([^?]+)/);
        const youtubeId = match ? match[1] : null;
        return {
          youtubeId,
          title: videoSource.title,
          channelName: videoSource.author,
          duration: "10-20 min",
          takeaway: mission.keyTakeaway || "Apply this knowledge to your portfolio.",
          notes: []
        };
      }
    }
    
    // 2. Fallbacks
    if (mission.youtube?.youtubeId) return mission.youtube;
    if (mission.curatedData?.youtube?.youtubeId) return mission.curatedData.youtube;
    
    const comp = mission.competency || 'mindset';
    if (comp === 'investing' || comp === 'accounting') {
      return {
        youtubeId: "5pGvE7Hyl6Q",
        title: "How to Invest in the Stock Market",
        channelName: "Ali Abdaal",
        duration: "15 min",
        takeaway: "Understand compound interest and passive long-term index investing.",
        notes: [
          "Investing in index funds is superior long-term.",
          "Compound interest is the most powerful force in finance.",
          "Automate your monthly deposits."
        ]
      };
    }
    return {
      youtubeId: "K-TwIM5W4CY",
      title: "How to Build Unshakeable Discipline",
      channelName: "Andrew Huberman",
      duration: "10 min",
      takeaway: "Learn the neurobiological circuit of dopamine.",
      notes: [
        "Dopamine is the molecule of desire and anticipation.",
        "Completing hard tasks early balances dopamine.",
        "Resistance is limbic friction."
      ]
    };
  }, [mission.youtube, mission.curatedData?.youtube, mission.competency, mission.sources, mission.keyTakeaway]);

  const character = useMemo(() => getCharacterForTrack(mission.competency || 'general'), [mission.competency]);

  const [quizResult, setQuizResult] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const steps = useMemo(() => getStepsForType(mission.type || 'flashcard', mission, learningStyle, appUser?.isPro ?? true), [mission, learningStyle, appUser?.isPro]);
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex];

  const avatarEmotion = useMemo(() => {
    if (quizResult === 'correct') return 'PROUD';
    if (quizResult === 'wrong') return 'DISAPPOINTED';
    if (currentStep === 'action' || currentStep === 'proof') return 'PREDATOR';
    return 'RESTING';
  }, [quizResult, currentStep]);

  const welcomePhrase = useMemo(() => getRandomPhrase(character.id, 'welcome'), [character.id]);
  const successPhrase = useMemo(() => getRandomPhrase(character.id, 'success'), [character.id, quizResult]);
  const failPhrase = useMemo(() => getRandomPhrase(character.id, 'fail'), [character.id, quizResult]);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Proof of Action States
  const [proofText, setProofText] = useState('');
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setProofPhoto(url);
    }
  };

  const handleSubmitProofOfAction = async () => {
    setIsSubmittingProof(true);
    await addXP(50);
    setIsSubmittingProof(false);
    advance();
  };

  // Accordion Note States for visual lectures
  const [expandedNote, setExpandedNote] = useState<number | null>(null);

  // Prompt Injection Sandbox States
  const [sandboxPrompt, setSandboxPrompt] = useState('');
  const [sandboxResponse, setSandboxResponse] = useState('');
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxError, setSandboxError] = useState('');
  const [sandboxSuccess, setSandboxSuccess] = useState(false);

  // Book Reader & Framework States
  const [bookPage, setBookPage] = useState(0);
  const [frameworkStep, setFrameworkStep] = useState(0);

  // Curated AI Quiz Memos
  const isCuratedQuiz = useMemo(() => currentStep?.startsWith('curated_quiz_') || false, [currentStep]);
  const curatedQuizIndex = useMemo(() => isCuratedQuiz ? parseInt(currentStep.split('_')[2]) : 0, [isCuratedQuiz, currentStep]);
  const currentCuratedQuiz = useMemo(() => isCuratedQuiz ? mission.curatedData?.quizQuestions?.[curatedQuizIndex] : null, [isCuratedQuiz, mission, curatedQuizIndex]);

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

    if (isCuratedQuiz && currentCuratedQuiz) {
      const isCorrect = currentCuratedQuiz.options[selectedOption]?.correct;
      if (isCorrect) {
        setQuizResult('correct');
      } else {
        setQuizResult('wrong');
      }
      setShowExplanation(true);
      return;
    }

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
    await addXP(mission.xpReward || 20, true);
    setStepIndex(steps.length); // show success screen
  };

  const handleFail = () => {
    failMission(mission.id);
    setStepIndex(steps.length + 1); // show fail screen
  };

  // Real-time execution of Prompt Sandbox Challenges with Gemini AI
  const handleExecuteSandbox = async () => {
    if (!sandboxPrompt.trim()) return;
    setSandboxLoading(true);
    setSandboxError('');
    setSandboxResponse('');

    const challenge = mission.curatedData?.interactive;
    if (!challenge) return;

    // Frontend negative constraint checking
    if (challenge.challengeId === 'prompt-h-d1') {
      if (sandboxPrompt.toUpperCase().includes('TIGER')) {
        setSandboxLoading(false);
        setSandboxError("Violación de restricción: No puedes usar la palabra 'TIGER' en tu prompt.");
        return;
      }
    }

    try {
      const response = await executePromptChallenge(sandboxPrompt, challenge.systemConstraint);
      setSandboxResponse(response);

      const keyword = challenge.validationKeyword;
      // Check if keyword is found in the response (case insensitive)
      const passed = response.toUpperCase().includes(keyword.toUpperCase());

      if (passed) {
        setSandboxSuccess(true);
      } else {
        setSandboxError(`Fallo de validación: El modelo no emitió la palabra clave '${keyword}'. Inténtalo de nuevo con un enfoque diferente.`);
      }
    } catch (err: any) {
      console.error(err);
      setSandboxError("Error de conexión con la IA de T1GER. Inténtalo de nuevo.");
    } finally {
      setSandboxLoading(false);
    }
  };

  const isSuccess = stepIndex === steps.length;
  const isFail = stepIndex > steps.length;
  const showMainUI = !isSuccess && !isFail;

  // Retrieve correct answer text for the fail explanation
  const correctAnswerText = useMemo(() => {
    if (isCuratedQuiz && currentCuratedQuiz) {
      const correctOpt = currentCuratedQuiz.options.find((o: any) => o.correct);
      return correctOpt ? correctOpt.text : '';
    }
    const optionsList = mission.recallOptions || mission.options || [];
    const correctOpt = optionsList.find((o: any) => o.correct);
    return correctOpt ? correctOpt.text : '';
  }, [mission, isCuratedQuiz, currentCuratedQuiz]);

  const correctExplanationText = useMemo(() => {
    if (isCuratedQuiz && currentCuratedQuiz) {
      return currentCuratedQuiz.explanation;
    }
    return mission.recallExplanation || mission.failureCritique || '';
  }, [mission, isCuratedQuiz, currentCuratedQuiz]);

  return (
    <div className="fixed inset-0 z-50 bg-[#F7F7F7] text-zinc-800 flex flex-col justify-between overflow-hidden select-none font-sans p-4 pt-[calc(0.75rem+var(--safe-top-inset,env(safe-area-inset-top)))] pb-[calc(0.75rem+var(--safe-bottom-inset,env(safe-area-inset-bottom)))]">
      {/* Clean Duolingo Off-White Background */}
      <div className="absolute inset-0 bg-[#F7F7F7] z-[-1]" />

      {/* Top Header Section (Fixed flex-none) */}
      <div className="flex-none w-full max-w-md mx-auto z-20">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={onComplete}
            aria-label="Close mission"
            className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
          
          {/* Progress bar (Duolingo style 3D) */}
          <div className="h-3.5 flex-1 mx-3 bg-[#E5E5E5] rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-[#58CC02] rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(10, progress)}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Glossy highlight */}
              <div className="absolute top-0.5 left-2 right-2 h-1 bg-white/30 rounded-full" />
            </motion.div>
          </div>
          
          {/* Heart / Streak Badge */}
          <div className="flex items-center gap-1 bg-white border-2 border-zinc-200 px-2.5 py-1 rounded-2xl shadow-sm">
            <span className="text-red-500 text-xs font-black">❤️ 5</span>
          </div>
        </div>
      </div>

      {/* Main Middle Content Area (Flex-1, Center, Zero Scroll) */}
      <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center items-center relative z-10 overflow-hidden py-2">
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
                 <T1gerInteractiveAvatar 
                   characterId={character.id} 
                   emotion="PROUD" 
                   size={160} 
                 />
                <div className="absolute -bottom-1 -right-1 bg-[var(--accent-main)] text-black p-2 rounded-full shadow-lg">
                  <CheckCircle2 size={24} className="stroke-[3]" />
                </div>
              </div>

              <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2 text-zinc-800">
                MISSION COMPLETE
              </h1>
              <p className="text-2xl font-black font-mono text-[var(--accent-main)] drop-shadow-[0_0_10px_var(--accent-glow)] mb-8">
                +{mission.xpReward || 20} XP
              </p>

              {/* Competency growth indicator */}
              <div className="w-full bg-white border border-zinc-200 rounded-3xl p-5 mb-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[var(--accent-main)]" />
                    <span className="text-xs font-black uppercase text-zinc-500">
                      {COMPETENCY_LABELS[compKey] || mission.competency}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--accent-main)]">
                    {(Math.round(competencies[compKey] || 0) - scoreBefore) > 0 ? `+${(Math.round(competencies[compKey] || 0) - scoreBefore)}` : (Math.round(competencies[compKey] || 0) - scoreBefore)} pts
                  </span>
                </div>
                <div className="h-2 bg-white border border-zinc-200 rounded-full overflow-hidden">
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
                className="w-full py-4 rounded-2xl bg-[#58CC02] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#58A700] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={20} className="stroke-[3]" />
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
                <T1gerInteractiveAvatar 
                  characterId={character.id} 
                  emotion="DISAPPOINTED" 
                  size={160} 
                />
                <div className="absolute -bottom-1 -right-1 bg-red-500 text-zinc-800 p-2 rounded-full shadow-lg">
                  <XCircle size={24} className="stroke-[3]" />
                </div>
              </div>
              
              <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                MISSED THIS ONE
              </h1>
              <p className="text-sm font-medium text-zinc-500 max-w-xs mb-8 leading-relaxed">
                Every mistake is a lesson, Predator. Review the explanation, sharpen your claws, and try again!
              </p>
              
              <button 
                onClick={onComplete} 
                className="w-full py-4 rounded-2xl bg-[#FF4B4B] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#EA1515] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 mt-auto"
              >
                Continue →
              </button>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* CURATED AI STEP — Visual Mode (YouTube)      */}
          {/* ============================================ */}
          {showMainUI && currentStep === 'visual_lecture' && (
            <motion.div
              key="visual_lecture"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-start gap-4 pb-12 overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-zinc-200 mb-1">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-black font-mono text-sm">
                  Y
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-zinc-800 leading-none">
                    {lessonYoutube.channelName}
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono block mt-1">
                    Duration: {lessonYoutube.duration} • Stanford Rigor
                  </span>
                </div>
              </div>

              {/* YouTube Responsive Wrapper */}
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl bg-white">
                {lessonYoutube.youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${lessonYoutube.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                    title={lessonYoutube.title}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full bg-white border border-zinc-200 rounded-3xl flex items-center justify-center flex-col p-4 text-center">
                    <PlaySquare className="w-10 h-10 text-purple-400 mb-2 opacity-50" />
                    <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Video material not available</span>
                  </div>
                )}
              </div>

              <h2 className="text-lg font-black uppercase italic tracking-tighter text-zinc-800 mt-2">
                {lessonYoutube.title}
              </h2>

              {/* Takeaway */}
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4 flex gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-purple-400 block mb-1">
                    Elite Takeaway
                  </span>
                  <p className="text-xs text-zinc-600 font-semibold leading-relaxed">
                    {lessonYoutube.takeaway}
                  </p>
                </div>
              </div>

              {/* Accordion Notes */}
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block mb-2 px-1">
                  Instructor Notes (Tap to expand)
                </span>
                <div className="space-y-2">
                  {(lessonYoutube.notes || []).map((note: string, idx: number) => {
                    const isExpanded = expandedNote === idx;
                    return (
                      <div
                        key={idx}
                        className="bg-white border border-zinc-200 rounded-2xl overflow-hidden transition-all duration-300"
                      >
                        <button
                          onClick={() => setExpandedNote(isExpanded ? null : idx)}
                          className="w-full p-4 flex items-center justify-between text-left gap-4 font-bold text-xs uppercase tracking-tight text-zinc-600 hover:text-zinc-800"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-purple-500 text-[10px]">0{idx + 1}.</span>
                            <span>Key Concept</span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                        </button>
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-4 pb-4 text-xs font-semibold leading-relaxed text-zinc-500 border-t border-zinc-200 pt-2"
                            >
                              {note}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={advance}
                className="w-full py-4 rounded-2xl bg-[#58CC02] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#58A700] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <Brain className="w-5 h-5 stroke-[3]" /> Got It, Take the Quiz
              </button>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* CURATED AI STEP — Reading Mode (Translucent) */}
          {/* ============================================ */}
          {showMainUI && currentStep === 'reading_chapter' && (
            <motion.div
              key="reading_chapter"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-start gap-4 pb-12 overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-2">
                <T1gerInteractiveAvatar
                  characterId={character.id}
                  emotion={avatarEmotion}
                  size={56}
                  className="flex-shrink-0"
                />
                <div className="bg-white border border-zinc-200 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-white after:border-l after:border-b after:border-zinc-200 after:rotate-45 after:-translate-y-1/2">
                  <p className="text-[9px] font-black font-mono uppercase tracking-widest mb-1" style={{ color: character.accentColor }}>
                    LECTURA CON EL INSTRUCTOR ({character.name})
                  </p>
                  <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
                    Predator, he condensado este conocimiento a nivel de posgrado. Léelo atentamente.
                  </p>
                </div>
              </div>

              <div className="mt-2 text-left">
                <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest font-black block mb-1">
                  {lessonReading.subtitle}
                </span>
                <h1 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-800">
                  {lessonReading.title}
                </h1>
              </div>

              {mission.sources?.length > 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-left">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-main)]" />
                  <div className="min-w-0">
                    <span className="mb-1 block text-[10px] font-bold uppercase text-zinc-500">Fuente de la lección</span>
                    {mission.sources.map((source: { title: string; author: string; type: string }) => (
                      <p key={`${source.title}-${source.author}`} className="text-xs leading-5 text-zinc-600">
                        <strong>{source.title}</strong> · {source.author} · {source.type}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Translucent glass paragraphs */}
              <div className="space-y-4 my-2 text-left">
                {(lessonReading.paragraphs || []).map((paragraph: string, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white shadow-sm rounded-2xl p-5 border border-zinc-200 hover:border-zinc-200 transition-colors"
                  >
                    <p className="text-xs font-semibold text-zinc-600 leading-relaxed">
                      {paragraph}
                    </p>
                  </div>
                ))}
              </div>

              {/* Takeaway */}
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4 flex gap-3 text-left">
                <Lightbulb className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-purple-400 block mb-1">
                    Tactical Takeaway
                  </span>
                  <p className="text-xs text-zinc-600 font-semibold leading-relaxed">
                    {lessonReading.takeaway}
                  </p>
                </div>
              </div>

              <button
                onClick={advance}
                className="w-full py-4 rounded-2xl bg-[#58CC02] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#58A700] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <Cpu className="w-5 h-5 stroke-[3]" /> Go to Real Action
              </button>
            </motion.div>
          )}

          {/* =================================================== */}
          {/* CURATED AI STEP — Real-world Action                 */}
          {/* =================================================== */}
          {showMainUI && currentStep === 'apply_paywall' && (
            <motion.div
              key="apply_paywall"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-center gap-5 text-center"
            >
              <div className="mx-auto w-20 h-20 rounded-[2rem] bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-[0_0_40px_rgba(234,179,8,0.12)]">
                <Lock className="w-9 h-9" />
              </div>

              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-yellow-400">
                  <Crown className="w-3 h-3" /> Premium Apply
                </span>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-800">
                  Learn is free. Execution is premium.
                </h1>
                <p className="text-sm font-semibold text-zinc-500 leading-relaxed">
                  You completed the lesson layer. Upgrade to unlock field missions, camera proof, advanced roadmaps, and XP from real-world execution.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-left">
                {[
                  ['Apply', 'Field missions'],
                  ['Proof', 'Photo evidence'],
                  ['Repeat', 'Hunting streaks'],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-2xl border border-zinc-200 bg-white p-3">
                    <h3 className="text-[10px] font-black uppercase text-zinc-800">{title}</h3>
                    <p className="mt-1 text-[9px] font-semibold text-zinc-500 leading-tight">{body}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={async () => {
                  await updateAppUser({ isPro: true });
                  setStepIndex(prev => prev);
                }}
                className="w-full py-5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-widest shadow-[0_4px_0_0_#a16207] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Unlock Apply Mode <ArrowRight size={18} className="stroke-[3]" />
              </button>
              <button
                onClick={onComplete}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-600 transition-colors"
              >
                Stay on free Learn
              </button>
            </motion.div>
          )}

          {showMainUI && currentStep === 'real_world_action' && (
            <motion.div
              key="real_world_action"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-start gap-4 pb-12 overflow-y-auto text-left"
            >
              {/* Mascot explaining real world task */}
              <div className="flex items-start gap-4 mb-2 animate-fade-in">
                <T1gerInteractiveAvatar
                  characterId={character.id}
                  emotion={avatarEmotion}
                  size={64}
                  className="flex-shrink-0"
                />
                <div className="bg-white border border-zinc-200 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-white after:border-l after:border-b after:border-zinc-200 after:rotate-45 after:-translate-y-1/2">
                  <p className="text-[9px] font-black font-mono uppercase tracking-widest mb-1" style={{ color: character.accentColor }}>
                    ACCIÓN EN EL MUNDO REAL ({character.name})
                  </p>
                  <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
                    Predator, el aprendizaje sin ejecución no sirve de nada. Completa esta acción hoy mismo.
                  </p>
                </div>
              </div>

              {/* Title & Action Description */}
              <div className="bg-white shadow-sm rounded-3xl p-6 shadow-xl border border-[var(--accent-main)]/10 text-center space-y-4">
                <span className="text-[8px] font-black font-mono text-[var(--accent-main)] uppercase tracking-[0.2em] bg-[var(--accent-main)]/10 px-2.5 py-1 rounded-full border border-[var(--accent-main)]/20 inline-block">
                  Objetivo de Hoy
                </span>
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-zinc-800">
                  {lessonAction.title}
                </h2>
                <p className="text-sm font-semibold text-zinc-600 leading-relaxed font-sans">
                  {lessonAction.instruction}
                </p>
              </div>

              {/* Start/Proceed button */}
              <button
                onClick={advance}
                className="w-full py-4 rounded-2xl bg-[#58CC02] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#58A700] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                Registrar Prueba de Acción <ArrowRight size={20} className="stroke-[3]" />
              </button>
            </motion.div>
          )}

          {/* =================================================== */}
          {/* CURATED AI STEP — Proof of Action                   */}
          {/* =================================================== */}
          {showMainUI && currentStep === 'proof_of_action' && (
            <motion.div
              key="proof_of_action"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-start gap-4 pb-12 overflow-y-auto text-left"
            >
              {/* Mascot header */}
              <div className="flex items-start gap-4 mb-2">
                <T1gerInteractiveAvatar
                  characterId={character.id}
                  emotion={avatarEmotion}
                  size={56}
                  className="flex-shrink-0"
                />
                <div className="bg-white border border-zinc-200 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-white after:border-l after:border-b after:border-zinc-200 after:rotate-45 after:-translate-y-1/2">
                  <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: character.accentColor }}>
                    REGISTRO DE EVIDENCIA
                  </span>
                  <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
                    Sube una foto, escribe un reporte rápido, o confirma la ejecución para reclamar tus XP.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Proof options */}
                <div className="bg-white shadow-sm rounded-3xl p-6 border border-zinc-200 space-y-4">
                  {/* File Upload Option */}
                  {lessonAction.type === 'photo' && (
                    <div className="space-y-2">
                      <span className="text-[8px] font-black font-mono text-zinc-500 uppercase tracking-widest block">
                        Subir Foto Evidencia
                      </span>
                      {proofPhoto ? (
                        <div className="relative rounded-2xl overflow-hidden aspect-video border border-zinc-200">
                          <img src={proofPhoto} className="w-full h-full object-cover" alt="Proof preview" />
                          <button
                            onClick={() => setProofPhoto(null)}
                            className="absolute top-2 right-2 bg-zinc-100 backdrop-blur-md text-zinc-800 p-1.5 rounded-full hover:bg-white"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-200 rounded-2xl cursor-pointer hover:border-[var(--accent-main)] hover:bg-white transition-all duration-300">
                          <Camera className="w-8 h-8 text-zinc-500 mb-2" />
                          <span className="font-bold text-[9px] uppercase tracking-widest text-zinc-500">Subir foto de la acción</span>
                          <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                  )}

                  {/* Text Check-in Option */}
                  {lessonAction.type === 'text' && (
                    <div className="space-y-2">
                      <span className="text-[8px] font-black font-mono text-zinc-500 uppercase tracking-widest block">
                        Reporte de Acción
                      </span>
                      <textarea
                        value={proofText}
                        onChange={(e) => setProofText(e.target.value)}
                        placeholder="Ej: 'Realicé mis 10 lagartijas antes de abrir las redes sociales. ¡Foco mental!'"
                        rows={4}
                        className="w-full p-4 bg-zinc-50 border border-zinc-200 focus:border-[#58CC02] focus:ring-2 focus:ring-[#58CC02]/20 rounded-2xl text-[15px] text-zinc-800 placeholder-zinc-400 focus:outline-none resize-none font-medium leading-relaxed transition-all"
                      />
                    </div>
                  )}

                  {/* Tap Check-in Option */}
                  {lessonAction.type === 'tap' && (
                    <div className="space-y-2 text-center py-4">
                      <CheckCircle2 className="w-12 h-12 text-accent mx-auto animate-pulse" />
                      <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                        Completa la acción en el mundo real y toca el botón inferior para confirmar.
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  onClick={() => { haptic(); handleSubmitProofOfAction(); }}
                  disabled={
                    isSubmittingProof || 
                    (lessonAction.type === 'photo' && !proofPhoto) || 
                    (lessonAction.type === 'text' && !proofText.trim())
                  }
                  className="w-full py-4 rounded-2xl bg-[#58CC02] hover:bg-[#58CC02] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#58A700] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#E5E5E5] disabled:text-[#AFAFAF] disabled:border-[#C4C4C4] disabled:cursor-not-allowed mt-4"
                >
                  {isSubmittingProof ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" /> Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> Marcar como Completado (+50 XP)
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* CURATED AI STEP — Optional Deep Dive Pro     */}
          {/* ============================================ */}
          {showMainUI && currentStep === 'optional_deep_dive' && (
            <motion.div
              key="optional_deep_dive"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-start gap-4 pb-12 overflow-y-auto text-left"
            >
              {/* Header with Pro badge */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-zinc-200 mb-1 animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-black font-mono text-sm">
                  Pro
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black uppercase text-zinc-800 leading-none">
                      {lessonYoutube.channelName}
                    </h3>
                    <span className="text-[7px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">Pro</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono block mt-1">
                    Duration: {lessonYoutube.duration} • Optional Deep Dive
                  </span>
                </div>
              </div>

              {/* YouTube Player */}
              {lessonYoutube.youtubeId ? (
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl bg-white">
                  <iframe
                    src={`https://www.youtube.com/embed/${lessonYoutube.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                    title={lessonYoutube.title}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-white border border-zinc-200 rounded-3xl flex items-center justify-center flex-col p-4 text-center">
                  <PlaySquare className="w-10 h-10 text-purple-400 mb-2 opacity-50" />
                  <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Deep Dive Material Not Available</span>
                </div>
              )}

              <h2 className="text-lg font-black uppercase italic tracking-tighter text-zinc-800 mt-2">
                {lessonYoutube.title}
              </h2>

              {/* Takeaway */}
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4 flex gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-purple-400 block mb-1">
                    Elite Pro Concept
                  </span>
                  <p className="text-xs text-zinc-600 font-semibold leading-relaxed">
                    {lessonYoutube.takeaway}
                  </p>
                </div>
              </div>

              {/* Action buttons (Skip or Proceed) */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={advance}
                  className="flex-1 py-4 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 rounded-2xl font-black text-[15px] uppercase tracking-widest transition-all cursor-pointer border-b-4 border-zinc-200 active:border-b-0 active:translate-y-1"
                >
                  Skip
                </button>
                <button
                  onClick={advance}
                  className="flex-[2] py-4 bg-[#58CC02] hover:bg-[#58CC02] text-white rounded-2xl font-black text-[15px] uppercase tracking-widest border-b-4 border-[#58A700] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Brain className="w-5 h-5" /> Start Quick Quiz Pro
                </button>
              </div>
            </motion.div>
          )}

          {/* =================================================== */}
          {/* CURATED AI STEP — Prompt Hacking Sandbox (Gemini)   */}
          {/* =================================================== */}
          {showMainUI && currentStep === 'prompt_sandbox' && (
            <motion.div
              key="prompt_sandbox"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-start gap-4 pb-12 overflow-y-auto"
            >
              {/* Mascot explaining objective */}
              <div className="flex items-start gap-4">
                <img
                  src={character.avatarImg}
                  alt={character.name}
                  className="w-14 h-14 object-contain flex-shrink-0"
                />
                <div className="bg-white border border-zinc-200 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-white after:border-l after:border-b after:border-zinc-200 after:rotate-45 after:-translate-y-1/2">
                  <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: character.accentColor }}>
                    PROMPT INJECTION ARENA
                  </span>
                  <p className="text-xs font-semibold leading-snug text-zinc-800 font-sans">
                    {mission.curatedData?.interactive.objective}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-4">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-2 font-black">
                  Constraint Validation Rules
                </span>
                <ul className="space-y-1.5 text-[11px] text-zinc-500 font-semibold leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-mono">•</span>
                    <span>Instrucción: {mission.curatedData?.interactive.instructionPrompt}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-mono">•</span>
                    <span>Salida esperada: {mission.curatedData?.interactive.validationDescription}</span>
                  </li>
                </ul>
              </div>

              {/* Console Input */}
              <div className="relative rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-inner flex flex-col focus-within:border-purple-500/50 transition-colors">
                <div className="bg-[#0c0c0e] px-4 py-2 border-b border-zinc-200 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-zinc-500 font-black uppercase tracking-wider">
                    Console Input Area
                  </span>
                  <Terminal size={12} className="text-zinc-500 animate-pulse" />
                </div>
                <textarea
                  value={sandboxPrompt}
                  onChange={(e) => setSandboxPrompt(e.target.value)}
                  placeholder="Escribe tu prompt de ingeniería social aquí para piratear el modelo de sistema..."
                  disabled={sandboxLoading || sandboxSuccess}
                  rows={4}
                  className="w-full p-4 bg-transparent border-0 text-xs font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none resize-none"
                />
              </div>

              {/* Custom constraint error logs */}
              {sandboxError && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex gap-3 text-red-400">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider block mb-1">
                      Fallo del Compilador
                    </span>
                    <p className="text-xs font-semibold leading-relaxed text-red-300/90">
                      {sandboxError}
                    </p>
                  </div>
                </div>
              )}

              {/* Success or run button */}
              {sandboxSuccess ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 flex gap-3 text-green-400">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider block mb-1">
                        INJECTION SUCCESSFUL
                      </span>
                      <p className="text-xs font-semibold leading-relaxed text-green-300/90">
                        ¡Increíble! Lograste romper el prompt de sistema y burlar la seguridad mediante ingeniería social.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={advance}
                    className="w-full py-5 rounded-2xl bg-green-500 hover:bg-green-600 text-black font-black text-sm uppercase tracking-widest shadow-[0_4px_0_0_#15803d] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Guardar Progreso & Continuar <ArrowRight size={18} className="stroke-[3]" />
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={handleExecuteSandbox}
                  disabled={sandboxLoading || !sandboxPrompt.trim()}
                  className="w-full py-4 rounded-2xl bg-[#58CC02] hover:bg-[#58CC02] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#58A700] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#E5E5E5] disabled:text-[#AFAFAF] disabled:border-[#C4C4C4] disabled:cursor-not-allowed"
                >
                  {sandboxLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" /> Executing injection...
                    </>
                  ) : (
                    <>
                      <Terminal className="w-5 h-5" /> Run Prompt Injection
                    </>
                  )}
                </button>
              )}

              {/* Gemini response pane */}
              {(sandboxResponse || sandboxLoading) && (
                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden mt-2">
                  <div className="bg-[#08080a] px-4 py-2 border-b border-zinc-200 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-zinc-600 font-bold uppercase tracking-wider">
                      Gemini Terminal Response
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
                  </div>
                  <div className="p-4 font-mono text-[11px] text-zinc-500 min-h-[100px] leading-relaxed max-h-[250px] overflow-y-auto">
                    {sandboxLoading ? (
                      <div className="flex flex-col gap-2">
                        <span className="text-zinc-600 italic">Connecting to neural layers...</span>
                        <div className="h-1.5 w-1/3 bg-zinc-800 rounded-full animate-pulse" />
                        <div className="h-1.5 w-2/3 bg-zinc-800 rounded-full animate-pulse" />
                      </div>
                    ) : (
                      <span className="text-zinc-600 whitespace-pre-wrap">{sandboxResponse}</span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ============================================ */}
          {/* CURATED AI STEP — Curated Questions          */}
          {/* ============================================ */}
          {showMainUI && isCuratedQuiz && currentCuratedQuiz && (
            <motion.div
              key={currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-center gap-5"
            >
              {/* Mascot asking question */}
              <div className="flex items-start gap-4 mb-2">
                <img 
                  src={character.avatarImg} 
                  alt={character.name} 
                  className="w-16 h-16 object-contain flex-shrink-0"
                />
                <div className="bg-white border border-zinc-200 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-white after:border-l after:border-b after:border-zinc-200 after:rotate-45 after:-translate-y-1/2">
                  <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: character.accentColor }}>
                    Concept Challenge {curatedQuizIndex + 1}/{mission.curatedData?.quizQuestions?.length}
                  </span>
                  <p className="text-sm font-bold leading-snug text-zinc-800 font-sans">
                    {currentCuratedQuiz.question}
                  </p>
                </div>
              </div>

              {/* Options list */}
              <div className="space-y-3 mb-4">
                {(currentCuratedQuiz.options || []).map((option: any, i: number) => {
                  const isSelected = selectedOption === i;
                  
                  let cls = 'bg-white border-zinc-200 hover:border-zinc-200 hover:bg-white text-zinc-600';
                  if (isSelected) {
                    cls = 'bg-[var(--accent-main)]/5 border-[var(--accent-main)] text-[var(--accent-main)] shadow-[0_0_15px_rgba(204,255,0,0.08)]';
                  }
                  
                  if (quizResult !== 'idle') {
                    if (option.correct) {
                      cls = 'bg-green-500/10 border-green-500 text-green-400';
                    } else if (isSelected) {
                      cls = 'bg-red-500/10 border-red-500 text-red-400';
                    } else {
                      cls = 'bg-white border-zinc-200 opacity-30 text-zinc-600';
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
                          : 'border-zinc-700 bg-zinc-100 text-zinc-500'
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
          {/* DAILY QUOTE STEP — Quote + Context (New)      */}
          {/* ============================================ */}
          {showMainUI && currentStep === 'daily_quote' && (
            <motion.div
              key="daily_quote"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-center gap-6 bg-transparent"
            >
              {/* Character Header speaking quote */}
              <div className="flex items-start gap-4 mb-2">
                <motion.img 
                  src={character.avatarImg} 
                  alt={character.name} 
                  className="w-16 h-16 object-contain flex-shrink-0"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                />
                <div className="bg-white border border-zinc-200 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-white after:border-l after:border-b after:border-zinc-200 after:rotate-45 after:-translate-y-1/2">
                  <p className="text-[9px] font-black font-mono uppercase tracking-widest mb-1" style={{ color: character.accentColor }}>{character.name} ({character.title})</p>
                  <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
                    Predator, he seleccionado esta cita de alto nivel para centrar tu enfoque hoy.
                  </p>
                </div>
              </div>

              {/* Book Cover Layout */}
              <div className="relative w-full max-w-[240px] mx-auto perspective-1000">
                <div className="w-full aspect-[2/3] rounded-r-2xl rounded-l-md shadow-lg relative overflow-hidden bg-white border border-zinc-200 flex flex-col justify-between p-6 transform-gpu rotate-y-[-5deg] rotate-x-[2deg] group-hover:rotate-y-0 transition-transform duration-700 ease-out">
                  
                  {/* Spine effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-3 bg-zinc-100 border-r border-zinc-200 z-20" />
                  <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-zinc-100 z-20" />
                  
                  {/* Top Badge */}
                  <div className="relative z-10 flex justify-center w-full mt-2">
                    <span className="bg-[#FF7300]/10 border border-[#FF7300]/20 text-[#FF7300] text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-md">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified Source
                    </span>
                  </div>

                  {/* Core Quote (Title style) */}
                  <div className="relative z-10 flex-1 flex items-center justify-center text-center mt-6 mb-4">
                    <p className="text-xl font-serif italic text-zinc-800/90 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                      "{lessonQuote.text}"
                    </p>
                  </div>

                  {/* Author (Bottom) */}
                  <div className="relative z-10 text-center pb-2">
                    <div className="h-px w-8 bg-zinc-600 mx-auto mb-3" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600">
                      {lessonQuote.author}
                    </p>
                    <p className="text-[8px] uppercase tracking-widest text-zinc-600 mt-1">
                      {mission.topic || "Core Concept"}
                    </p>
                  </div>

                  {/* Subtle textures */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay z-0" />
                </div>
                
                {/* 3D Shadow under the book */}
                <div className="absolute -bottom-4 left-4 right-4 h-4 bg-zinc-300 blur-xl rounded-full z-[-1]" />
              </div>

              {/* 2 Sentences contextualizing why it matters today */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-2 mt-4 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <BookOpen className="w-16 h-16" />
                </div>
                <span className="text-[8px] font-black font-mono uppercase tracking-widest text-[#FF7300] block relative z-10">
                  Why it matters today
                </span>
                <p className="text-xs text-zinc-600 font-medium leading-relaxed relative z-10">
                  {lessonQuote.context}
                </p>
              </div>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* TEACH STEP — Executive Content Cards         */}
          {/* ============================================ */}
          {showMainUI && currentStep === 'teach' && (
            <motion.div
              key="teach"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-between gap-4 bg-transparent max-w-md mx-auto w-full pb-6"
            >
              {/* Top Header Badge */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black font-mono uppercase tracking-widest text-[#FF7300] bg-[#FF7300]/10 px-3 py-1 rounded-full border border-[#FF7300]/20 flex items-center gap-1.5">
                  {mission.contentType === 'video' ? (
                    <><PlaySquare className="w-3 h-3" /> Vídeo Ejecutivo</>
                  ) : mission.contentType === 'book_extract' ? (
                    <><BookOpen className="w-3 h-3" /> Extracto de Libro</>
                  ) : (
                    <><FileText className="w-3 h-3" /> Artículo de Análisis</>
                  )}
                </span>
                <span className="text-[10px] font-black font-mono uppercase tracking-wider text-zinc-400">
                  Formación de Inversión
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-800 text-left px-1">
                {mission.title}
              </h1>

              {/* Main Content Card Container */}
              <div className="flex-1 bg-white border-2 border-zinc-200 rounded-3xl p-5 shadow-xl flex flex-col justify-between overflow-y-auto space-y-4">
                {/* 1. VIDEO FORMAT */}
                {mission.contentType === 'video' && (
                  <div className="space-y-4">
                    <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-md bg-black border border-zinc-200 relative">
                      {mission.videoUrl ? (
                        <iframe
                          src={mission.videoUrl}
                          title={mission.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center flex-col text-white p-4 text-center">
                          <PlaySquare className="w-10 h-10 text-[#FF7300] mb-2" />
                          <span className="text-xs font-bold">Vídeo de Inversión</span>
                        </div>
                      )}
                    </div>
                    {mission.reading?.paragraphs && (
                      <div className="space-y-2 text-left">
                        <span className="text-[9px] font-black font-mono uppercase tracking-widest text-zinc-400 block">Resumen Ejecutivo</span>
                        {mission.reading.paragraphs.map((p: string, idx: number) => (
                          <p key={idx} className="text-xs text-zinc-600 font-medium leading-relaxed">
                            {p}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. BOOK EXTRACT FORMAT */}
                {mission.contentType === 'book_extract' && (
                  <div className="space-y-4 text-left">
                    {mission.bookExtract && (
                      <>
                        <div className="bg-orange-50/60 border border-orange-200/80 rounded-2xl p-4 space-y-1">
                          <span className="text-[9px] font-black font-mono uppercase tracking-widest text-[#FF7300] block">
                            📚 {mission.bookExtract.bookTitle}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-500 block uppercase">
                            Por {mission.bookExtract.author}
                          </span>
                        </div>

                        <div className="p-4 bg-zinc-50 border-l-4 border-[#FF7300] rounded-r-2xl">
                          <p className="text-xs font-serif italic text-zinc-700 leading-relaxed">
                            "{mission.bookExtract.excerpt}"
                          </p>
                        </div>

                        {mission.bookExtract.keyFramework && (
                          <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl space-y-1">
                            <span className="text-[9px] font-black font-mono uppercase tracking-widest text-[#58A700] block flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Marco Clave de Decisión
                            </span>
                            <p className="text-xs font-bold text-zinc-800 leading-relaxed">
                              {mission.bookExtract.keyFramework}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* 3. ARTICLE FORMAT */}
                {mission.contentType === 'article' && (
                  <div className="space-y-3 text-left">
                    {mission.reading?.subtitle && (
                      <h3 className="text-sm font-black uppercase tracking-wide text-[#FF7300]">
                        {mission.reading.subtitle}
                      </h3>
                    )}
                    <div className="space-y-2.5">
                      {(mission.reading?.paragraphs || [mission.concept]).map((p: string, idx: number) => (
                        <p key={idx} className="text-xs text-zinc-700 font-medium leading-relaxed">
                          {p}
                        </p>
                      ))}
                    </div>
                    {mission.reading?.takeaway && (
                      <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl">
                        <span className="text-[9px] font-black font-mono uppercase tracking-widest text-[#1CB0F6] block">Conclusión</span>
                        <p className="text-xs font-bold text-zinc-800 mt-0.5">{mission.reading.takeaway}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Concept Fallback if contentType undefined */}
                {!mission.contentType && (
                  <div className="space-y-3 text-left">
                    <p className="text-sm font-medium leading-relaxed text-zinc-700">
                      {mission.concept}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* BOOK READER STEP (For Book & Build)          */}
          {/* ============================================ */}
          {showMainUI && currentStep === 'book_reader' && (
            <motion.div
              key="book_reader"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-center gap-6"
            >
              <div className="flex items-start gap-4 mb-2">
                <img 
                  src={character.avatarImg} 
                  alt={character.name} 
                  className="w-16 h-16 object-contain flex-shrink-0"
                />
                <div className="bg-white border border-zinc-200 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-white after:border-l after:border-b after:border-zinc-200 after:rotate-45 after:-translate-y-1/2">
                  <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: character.accentColor }}>Reading Phase</span>
                  <p className="text-xs font-semibold leading-relaxed text-zinc-500">
                    {bookPage === 0 ? "Read this cover to cover." : "Keep reading."}
                  </p>
                </div>
              </div>

              {bookPage === 0 ? (
                /* Cover Page */
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-zinc-800 to-black rounded-[2rem] text-center shadow-2xl relative border-4 border-zinc-700 overflow-y-auto">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay z-0" />
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-black/40 border-r border-white/10 z-10" />
                  
                  <div className="relative z-20">
                    <BookOpen className="w-16 h-16 text-white/50 mb-6 mx-auto" />
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-4 drop-shadow-lg">
                      {mission.title || "The Intelligent Investor"}
                    </h1>
                    <p className="text-[#FF7300] font-bold uppercase tracking-widest text-xs">
                      By T1GER Curriculum
                    </p>
                  </div>
                </div>
              ) : (
                /* Content Page */
                <div className="flex-1 flex flex-col justify-start p-8 bg-[#fdfcf0] rounded-[2rem] shadow-xl border border-zinc-300 relative overflow-y-auto">
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-black/5 border-r border-black/10 rounded-l-[2rem]" />
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-zinc-800 mb-6 pl-4 border-l-4 border-[#FF7300]">
                    Chapter {bookPage}
                  </h2>
                  <div className="text-zinc-700 font-serif leading-relaxed space-y-4">
                    {lessonReading.paragraphs[bookPage - 1] || "No content found for this page."}
                  </div>
                  <div className="mt-auto pt-6 text-center text-zinc-400 font-mono text-xs uppercase tracking-widest">
                    Page {bookPage} of {lessonReading.paragraphs.length}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (bookPage < lessonReading.paragraphs.length) {
                    setBookPage(prev => prev + 1);
                  } else {
                    advance();
                  }
                }}
                className="w-full py-4 rounded-2xl bg-[#58CC02] hover:bg-[#58CC02] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#58A700] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {bookPage < lessonReading.paragraphs.length ? 'Next Page' : 'Finish Reading'}
              </button>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* BUILD FRAMEWORK STEP (For Book & Build)      */}
          {/* ============================================ */}
          {showMainUI && currentStep === 'build_framework' && (
            <motion.div
              key="build_framework"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-start pt-4 gap-4"
            >
              <h1 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-800 text-center mb-2">
                Action Framework
              </h1>
              
              <div className="space-y-4 overflow-y-auto pb-4">
                {(mission.frameworkSteps || [
                  { title: 'Open Trading Platform', desc: 'Go to TradingView.com' },
                  { title: 'Create Paper Account', desc: 'Sign up and open the Paper Trading tab' },
                  { title: 'Execute First Trade', desc: 'Buy 1 share of AAPL using virtual money' }
                ]).map((step: any, idx: number) => {
                  const isDone = frameworkStep > idx;
                  const isActive = frameworkStep === idx;
                  
                  return (
                    <div 
                      key={idx} 
                      className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${isDone ? 'border-[#58CC02] bg-[#d7ffb8]' : isActive ? 'border-[#FF7300] bg-white shadow-lg' : 'border-zinc-200 bg-zinc-50 opacity-60'}`}
                    >
                      <div className="p-5 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isDone ? 'text-[#58A700]' : isActive ? 'text-[#FF7300]' : 'text-zinc-400'}`}>
                            Step {idx + 1}
                          </span>
                          <h3 className={`font-bold text-[15px] ${isDone ? 'text-zinc-800' : 'text-zinc-800'}`}>
                            {step.title}
                          </h3>
                          <p className="text-xs text-zinc-500 font-medium mt-1">
                            {step.desc}
                          </p>
                        </div>
                        <div className="shrink-0">
                          {isDone ? (
                            <div className="w-12 h-12 bg-[#58CC02] rounded-full flex items-center justify-center text-white border-b-4 border-[#58A700]">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                          ) : isActive ? (
                            <button
                              onClick={() => setFrameworkStep(prev => prev + 1)}
                              className="px-5 py-3 rounded-xl bg-[#58CC02] hover:bg-[#58CC02] text-white font-black text-[13px] uppercase tracking-widest border-b-4 border-[#58A700] active:border-b-0 active:translate-y-1 transition-all"
                            >
                              Done
                            </button>
                          ) : (
                            <div className="w-12 h-12 bg-zinc-200 rounded-full flex items-center justify-center text-zinc-400">
                              <Lock className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {frameworkStep >= (mission.frameworkSteps?.length || 3) && (
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={advance}
                  className="w-full py-4 mt-6 rounded-2xl bg-[#FF7300] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#CC5C00] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  <Crown className="w-5 h-5" /> Framework Completed
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ================================================= */}
          {/* RECALL / EXECUTIVE CONCLUSION STEP                */}
          {/* ================================================= */}
          {showMainUI && currentStep === 'recall' && (
            <motion.div
              key="recall"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col justify-between gap-5 max-w-md mx-auto w-full pb-6"
            >
              {(mission.contentType || mission.type === 'book_lesson') ? (
                /* Pure Executive Content Conclusion Card */
                <div className="flex-1 flex flex-col justify-between gap-4">
                  {/* Mascot Header */}
                  <div className="flex items-start gap-4 mb-2 text-left">
                    <img 
                      src={character.avatarImg} 
                      alt={character.name} 
                      className="w-16 h-16 object-contain flex-shrink-0"
                    />
                    <div className="bg-white border-2 border-zinc-200 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-white after:border-l-2 after:border-b-2 after:border-zinc-200 after:rotate-45 after:-translate-y-1/2">
                      <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: character.accentColor }}>{character.name} ({character.title})</span>
                      <p className="text-xs font-bold leading-snug text-zinc-800">
                        ¡Excelente enfoque, Predator! Has asimilado esta lección estratégica.
                      </p>
                    </div>
                  </div>

                  {/* Main Takeaway Card */}
                  <div className="flex-1 bg-white border-2 border-zinc-200 rounded-3xl p-6 shadow-xl flex flex-col justify-center gap-4 text-left">
                    <div className="flex items-center gap-2 text-[#58CC02]">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-widest">Conclusión Estratégica</span>
                    </div>

                    <p className="text-sm font-bold text-zinc-800 leading-relaxed bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
                      {mission.keyTakeaway || mission.reading?.takeaway || mission.concept}
                    </p>

                    {/* XP Reward Badge */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Crown className="w-7 h-7 text-amber-500" />
                        <div>
                          <span className="text-[10px] font-black font-mono uppercase tracking-widest text-amber-700 block">Recompensa</span>
                          <span className="text-xs font-black text-zinc-800 uppercase">+100 XP Inversor Ejecutivo</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-amber-400 text-black font-black text-xs rounded-full uppercase tracking-wider">
                        Verificado
                      </span>
                    </div>
                  </div>

                  {/* Big Green 3D Tactile Complete Button */}
                  <button
                    onClick={advance}
                    className="w-full py-4 rounded-2xl bg-[#58CC02] hover:bg-[#4EB702] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#58A700] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shrink-0"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Completar Lección 🟢
                  </button>
                </div>
              ) : (
                /* Legacy Quiz Recall */
                <div className="flex-1 flex flex-col justify-center gap-5">
                  <div className="flex items-start gap-4 mb-2">
                    <img 
                      src={character.avatarImg} 
                      alt={character.name} 
                      className="w-16 h-16 object-contain flex-shrink-0"
                    />
                    <div className="bg-white border border-zinc-200 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-white after:border-l after:border-b after:border-zinc-200 after:rotate-45 after:-translate-y-1/2">
                      <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: character.accentColor }}>Concept Challenge</span>
                      <p className="text-sm font-bold leading-snug text-zinc-800 font-sans">
                        {mission.recallQuestion || mission.business_scenario || mission.scenario || 'Can you apply what you just learned?'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {(mission.recallOptions || mission.options || []).map((option: any, i: number) => {
                      const isSelected = selectedOption === i;
                      let cls = 'bg-white border-zinc-200 border-b-4 border-b-zinc-300 text-zinc-700 hover:border-zinc-300 active:border-b-2 active:translate-y-0.5';
                      if (isSelected) {
                        cls = 'bg-[var(--accent-main)]/10 border-[var(--accent-main)] border-b-4 border-b-[var(--accent-main)] text-zinc-900 shadow-[0_0_15px_rgba(204,255,0,0.15)] active:translate-y-0.5';
                      }
                      if (quizResult !== 'idle') {
                        if (option.correct) {
                          cls = 'bg-[#58CC02]/15 border-[#58CC02] border-b-4 border-b-[#58A700] text-zinc-900';
                        } else if (isSelected) {
                          cls = 'bg-[#FF4B4B]/15 border-[#FF4B4B] border-b-4 border-b-[#EA1515] text-zinc-900';
                        } else {
                          cls = 'bg-white border-zinc-200 border-b-2 opacity-30 text-zinc-500';
                        }
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => quizResult === 'idle' && setSelectedOption(i)}
                          disabled={quizResult !== 'idle'}
                          aria-selected={isSelected}
                          role="option"
                          className={`w-full p-4.5 rounded-[1.5rem] border text-left font-bold text-sm transition-all duration-100 flex items-center justify-between group ${cls}`}
                        >
                          <span>{option.text}</span>
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-mono text-[10px] font-black ${
                            isSelected 
                              ? 'border-[var(--accent-main)] bg-[var(--accent-main)] text-black' 
                              : 'border-zinc-300 bg-zinc-100 text-zinc-500'
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ============================================ */}
          {/* QUIZ STEP — Scenario quiz (non-flashcard Std)*/}
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
                  src={character.avatarImg} 
                  alt={character.name} 
                  className="w-16 h-16 object-contain flex-shrink-0"
                />
                <div className="bg-white border border-zinc-200 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-white after:border-l after:border-b after:border-zinc-200 after:rotate-45 after:-translate-y-1/2">
                  <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: character.accentColor }}>Decision Challenge</span>
                  <p className="text-sm font-bold leading-snug text-zinc-800 font-sans">
                    {mission.scenario || mission.concept_flashcard || 'What would you do?'}
                  </p>
                </div>
              </div>

              {/* Options list */}
              <div className="space-y-3 mb-4">
                {(mission.options || []).map((option: any, i: number) => {
                  const isSelected = selectedOption === i;
                  
                  let cls = 'bg-white border-zinc-200 border-b-4 border-b-zinc-300 text-zinc-700 hover:border-zinc-300 active:border-b-2 active:translate-y-0.5';
                  if (isSelected) {
                    cls = 'bg-[var(--accent-main)]/10 border-[var(--accent-main)] border-b-4 border-b-[var(--accent-main)] text-zinc-900 shadow-[0_0_15px_rgba(204,255,0,0.15)] active:translate-y-0.5';
                  }
                  
                  if (quizResult !== 'idle') {
                    if (option.correct) {
                      cls = 'bg-[#58CC02]/15 border-[#58CC02] border-b-4 border-b-[#58A700] text-zinc-900';
                    } else if (isSelected) {
                      cls = 'bg-[#FF4B4B]/15 border-[#FF4B4B] border-b-4 border-b-[#EA1515] text-zinc-900';
                    } else {
                      cls = 'bg-white border-zinc-200 border-b-2 opacity-30 text-zinc-500';
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
                          : 'border-zinc-700 bg-zinc-100 text-zinc-500'
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
          {/* ARTIFACT STEP — Real world task upload (Std) */}
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
                  src={character.avatarImg} 
                  alt={character.name} 
                  className="w-16 h-16 object-contain flex-shrink-0"
                />
                <div className="bg-white border border-zinc-200 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-white after:border-l after:border-b after:border-zinc-200 after:rotate-45 after:-translate-y-1/2">
                  <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: character.accentColor }}>Action Protocol</span>
                  <p className="text-xs font-semibold leading-relaxed text-zinc-500">
                    Predator, completa este ejercicio de campo en el mundo real y sube la foto como prueba irrefutable de tu trabajo.
                  </p>
                </div>
              </div>

              <h2 className="text-xl font-black italic uppercase tracking-tight text-zinc-800 pl-4 border-l-4 border-[var(--accent-main)]">
                REAL-WORLD PROOF
              </h2>
              <p className="text-sm leading-relaxed text-zinc-600 font-medium font-sans">
                {mission.mission_brief || mission.taskBrief || 'Complete this task and submit photo proof.'}
              </p>
              
              <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-zinc-200 rounded-3xl cursor-pointer hover:border-[var(--accent-main)] hover:bg-white transition-all duration-300">
                <Camera className="w-10 h-10 text-zinc-500 mb-3" />
                <span className="font-bold text-[10px] uppercase tracking-widest text-zinc-500">Tap to Capture & Upload Proof</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleArtifactUpload} />
              </label>
              
              <button 
                onClick={handleSuccess} 
                className="w-full py-4.5 border border-zinc-200 rounded-2xl font-bold text-xs uppercase tracking-widest text-zinc-500 bg-white hover:bg-white transition-colors"
              >
                Skip for now
              </button>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* FLASHCARD STEP — Legacy fallback             */}
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
                  src={character.avatarImg} 
                  alt={character.name} 
                  className="w-16 h-16 object-contain flex-shrink-0"
                />
                <div className="bg-white border border-zinc-200 rounded-[1.5rem] p-4 relative shadow-lg flex-1 after:content-[''] after:absolute after:-left-2 after:top-6 after:w-4 after:h-4 after:bg-white after:border-l after:border-b after:border-zinc-200 after:rotate-45 after:-translate-y-1/2">
                  <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: character.accentColor }}>Knowledge Core</span>
                  <p className="text-xs font-semibold leading-relaxed text-zinc-500">
                    Estudia esta píldora de conocimiento clave, Predator.
                  </p>
                </div>
              </div>

              <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--accent-main)]">{mission.title}</h1>
              <div className="bg-white shadow-sm rounded-3xl p-6 shadow-xl border border-zinc-200">
                <p className="text-[15px] leading-relaxed text-zinc-600 font-medium font-sans">
                  {mission.concept_flashcard || mission.concept || 'Learn this concept and advance.'}
                </p>
              </div>
              
              <button
                onClick={advance}
                className="w-full py-4 rounded-2xl bg-[#58CC02] hover:bg-[#58CC02] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#58A700] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Got It <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============================================================ */}
      {/* PERSISTENT DUOLINGO-STYLE SLIDE-UP BOTTOM PANEL              */}
      {/* ============================================================ */}
      {showMainUI && (
        <div className="flex-none w-full max-w-md mx-auto bg-white border-t-2 border-zinc-200 p-4 pt-3 pb-6 rounded-t-3xl shadow-[0_-10px_25px_rgba(0,0,0,0.04)] z-30">
          {currentStep === 'daily_quote' && (
            <button
              onClick={() => { haptic(); advance(); }}
              className="w-full py-4 rounded-2xl bg-[#58CC02] hover:bg-[#58CC02] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#58A700] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              CONTINUAR <ArrowRight size={20} className="stroke-[3]" />
            </button>
          )}

          {(currentStep === 'teach' || currentStep === 'reading_chapter') && (
            <button
              onClick={() => { haptic(); advance(); }}
              className="w-full py-4 rounded-2xl bg-[#58CC02] hover:bg-[#58CC02] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#58A700] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              VER CONCLUSIÓN <ArrowRight size={20} className="stroke-[3]" />
            </button>
          )}

          {currentStep === 'recall' && (
            <button
              onClick={() => { haptic(); handleSuccess(); }}
              className="w-full py-4 rounded-2xl bg-[#58CC02] hover:bg-[#58CC02] text-white font-black text-[15px] uppercase tracking-widest border-b-4 border-[#58A700] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              COMPLETAR LECCIÓN 🟢
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// STEP SEQUENCING
// ============================================================

function getStepsForType(type: string, mission: any, learningStyle: string, isPro: boolean = true): string[] {
  return ['daily_quote', 'teach', 'recall'];
}
