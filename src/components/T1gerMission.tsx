import React, { useState, useRef } from 'react';
import { Camera, Loader2, Target, X, CheckCircle2, AlertTriangle, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { verifyMissionProof, reviewMissionProof, generateBadgeIcon } from '../services/gemini';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { triggerHaptic } from '../lib/utils';
import { ShareableAchievementCard } from './ShareableAchievementCard';

interface T1gerMissionProps {
  mission: any;
  onComplete: () => void;
}

export const T1gerMission: React.FC<T1gerMissionProps> = ({ mission, onComplete }) => {
  const { appUser, refreshAppUser } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastImage, setLastImage] = useState<string | null>(null);
  const [lastMimeType, setLastMimeType] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !appUser) return;

    setVerifying(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        setLastImage(base64Data);
        setLastMimeType(file.type);
        
        const verificationResult = await verifyMissionProof(
          mission.type,
          mission.title,
          base64Data,
          file.type
        );

        setResult(verificationResult);

        if (verificationResult.status === 'APPROVED') {
          triggerHaptic([100, 50, 100]);
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF6B00', '#FFFFFF', '#000000']
          });

          const missionRef = doc(db, 'missions', mission.id);
          const badgeUrl = await generateBadgeIcon(mission.title);
          await updateDoc(missionRef, {
            status: 'completed',
            completedAt: serverTimestamp(),
            badgeUrl,
            proof: {
              status: 'APPROVED',
              message: verificationResult.message,
              confidenceScore: verificationResult.confidence_score,
              createdAt: serverTimestamp()
            }
          });

          const userRef = doc(db, 'users', appUser.uid);
          await updateDoc(userRef, {
            xp: appUser.xp + mission.xpReward,
            streak: (appUser.streak || 0) + 1
          });

          await refreshAppUser();
          setTimeout(() => {
            onComplete();
          }, 3000);
        } else {
          triggerHaptic([200, 100, 200]);
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);

          const missionRef = doc(db, 'missions', mission.id);
          await updateDoc(missionRef, {
            status: 'rejected',
            rejectedAt: serverTimestamp(),
            proof: {
              status: 'REJECTED',
              message: verificationResult.message,
              confidenceScore: verificationResult.confidence_score,
              createdAt: serverTimestamp()
            }
          });

          const userRef = doc(db, 'users', appUser.uid);
          await updateDoc(userRef, {
            streak: 0
          });
          await refreshAppUser();
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      triggerHaptic([200, 100, 200]);
      console.error(error);
    } finally {
      setVerifying(false);
    }
  };

  const handleRequestReview = async () => {
    if (!lastImage || !lastMimeType || !appUser) return;

    setReviewing(true);
    setResult(null);

    try {
      const reviewResult = await reviewMissionProof(
        mission.type,
        mission.title,
        lastImage,
        lastMimeType
      );

      setResult(reviewResult);

      if (reviewResult.status === 'APPROVED') {
        triggerHaptic([100, 50, 100]);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF6B00', '#FFFFFF', '#000000']
        });

        const missionRef = doc(db, 'missions', mission.id);
        const badgeUrl = await generateBadgeIcon(mission.title);
        await updateDoc(missionRef, {
          status: 'completed',
          completedAt: serverTimestamp(),
          badgeUrl
        });

        const userRef = doc(db, 'users', appUser.uid);
        await updateDoc(userRef, {
          xp: appUser.xp + mission.xpReward,
          streak: (appUser.streak || 0) + 1
        });

        await refreshAppUser();
        setTimeout(() => {
          onComplete();
        }, 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setReviewing(false);
    }
  };

  return (
    <motion.div 
      animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="relative w-full max-w-[430px] mx-auto bg-[#050505] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Loading Overlay */}
      <AnimatePresence>
        {(verifying || reviewing) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6"
          >
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-[#FF6B00] rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-2 border-4 border-[#FF6B00] rounded-full animate-pulse"></div>
              <Target className="absolute inset-0 m-auto w-10 h-10 text-[#FF6B00]" />
            </div>
            <h3 className="font-sans font-black text-2xl text-white tracking-wider mb-2 text-center uppercase">
              {reviewing ? 'Senior Auditor Reviewing' : 'AI Auditor Active'}
            </h3>
            <p className="font-mono text-[#FF6B00] text-sm text-center">
              {reviewing ? 'PERFORMING NUANCED ANALYSIS...' : 'ANALYZING PROOF OF WORK...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse"></div>
            <span className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Mission Protocol
            </span>
          </div>
          <span className="font-mono text-[#FF6B00] font-bold text-sm bg-[#FF6B00]/10 px-3 py-1 rounded-full border border-[#FF6B00]/20">
            +{mission.xpReward} XP
          </span>
        </div>

        <h2 className="font-sans font-black text-3xl text-white leading-tight mb-4 uppercase">
          {mission.title}
        </h2>
        
        <p className="font-mono text-zinc-400 text-sm mb-8 leading-relaxed">
          {mission.description}
        </p>

        {/* Result Feedback */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-2xl border ${result.status === 'APPROVED' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}
            >
              {/* Added celebratory animation wrapper */}
              {result.status === 'APPROVED' && (
                <motion.div
                  initial={{ scale: 0.95, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                  animate={{ scale: 1, backgroundColor: 'rgba(34, 197, 94, 0.2)' }}
                  transition={{ repeat: 2, repeatType: 'reverse', duration: 0.3 }}
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                />
              )}
              <div className="flex items-start gap-3 relative z-10">
                {result.status === 'APPROVED' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={`font-sans font-black uppercase text-lg mb-1 ${result.status === 'APPROVED' ? 'text-green-500' : 'text-red-500'}`}>
                    {result.status === 'APPROVED' ? 'MISSION COMPLETE. HUNGER FEED.' : 'Faking your hunt? STREAK BROKEN.'}
                  </h4>
                  <p className="font-mono text-sm text-zinc-300">
                    {result.message}
                  </p>
                  
                  {/* Detailed Analysis Breakdown */}
                  {result.analysis && (
                    <div className="mt-4 space-y-3">
                      {result.analysis.strengths.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black uppercase text-green-500">Strengths:</p>
                          <ul className="list-disc list-inside text-xs text-zinc-400 font-mono">
                            {result.analysis.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      )}
                      {result.analysis.weaknesses.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black uppercase text-red-500">Weaknesses:</p>
                          <ul className="list-disc list-inside text-xs text-zinc-400 font-mono">
                            {result.analysis.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
                          </ul>
                        </div>
                      )}
                      {result.analysis.suggestions.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black uppercase text-[#FF6B00]">Suggestions:</p>
                          <ul className="list-disc list-inside text-xs text-zinc-400 font-mono">
                            {result.analysis.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {result.status === 'APPROVED' && (
                    <div className="mt-6">
                      <ShareableAchievementCard mission={mission} result={result} streak={appUser?.streak || 0} />
                    </div>
                  )}

                  <p className="font-mono text-xs mt-2 text-zinc-500">
                    Confidence: {result.confidence_score}%
                  </p>
                  {result.status === 'REJECTED' && (
                    <button 
                      onClick={handleRequestReview}
                      className="mt-4 flex items-center gap-2 text-xs font-bold text-[#FF6B00] hover:text-orange-400 uppercase tracking-wider"
                    >
                      <RefreshCcw className="w-3 h-3" />
                      Request Senior AI Review
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Area */}
        {(!result || !result.verified) && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B00] to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <button 
              onClick={() => {
                triggerHaptic(10);
                fileInputRef.current?.click();
              }}
              className="relative w-full bg-[#050505] border border-white/10 hover:border-[#FF6B00]/50 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all backdrop-blur-xl"
            >
              <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 text-[#FF6B00]" />
              </div>
              <span className="font-sans font-bold uppercase tracking-wider text-sm">
                Submit Photo Proof
              </span>
            </button>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};
