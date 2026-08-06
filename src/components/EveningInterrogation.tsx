import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square } from 'lucide-react';
import { useT1ger } from '../contexts/T1gerContext';
import { useAuth } from '../contexts/AuthContext';

export const EveningInterrogation = ({ onComplete }: { onComplete: () => void }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(30);
  const [status, setStatus] = useState<'idle' | 'recording' | 'analyzing' | 'verdict'>('idle');
  const [verdict, setVerdict] = useState<string | null>(null);
  const { addXP } = useT1ger();
  const { appUser, updateAppUser } = useAuth();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0 && isRecording) {
      stopRecording();
    }
    return () => clearInterval(interval);
  }, [isRecording, timer]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.start();
    setIsRecording(true);
    setStatus('recording');
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setStatus('analyzing');
    
    setTimeout(async () => {
      setStatus('verdict');
      const isSuccess = Math.random() > 0.3;
      setVerdict(isSuccess 
        ? "Tu disciplina fue implacable. Los datos confirman que dominaste el día. +100 XP. Ritmo táctico mantenido." 
        : "Las excusas son para presas. Fallaste. -50 XP. Se aumentará la presión mañana.");
      if (isSuccess) {
        addXP(100);
      } else {
        addXP(-50);
        // Increase daily time as a penalty (more pressure tomorrow)
        if (appUser && typeof appUser.dailyTime === 'number') {
           await updateAppUser({ dailyTime: Math.min(60, appUser.dailyTime + 5) });
        }
      }
    }, 2000);
  };

  return (
    <div className="w-full h-full bg-white text-zinc-800 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FF0000]/10 via-transparent to-transparent animate-pulse" />
      
      <header className="text-center space-y-2 z-10 mb-12">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">END OF DAY DEBRIEF</h1>
        <p className="font-mono text-zinc-500 text-sm tracking-widest uppercase">The COO is listening. Explain your performance.</p>
      </header>

      <div className="z-10 flex flex-col items-center gap-8">
        {status === 'idle' && (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={startRecording}
            className="w-32 h-32 rounded-full bg-zinc-50 backdrop-blur-md border border-zinc-200 flex items-center justify-center"
          >
            <Mic size={48} />
          </motion.button>
        )}

        {status === 'recording' && (
          <div className="relative flex items-center justify-center">
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }} 
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="absolute w-40 h-40 rounded-full border-4 border-[#FF0000]" 
            />
            <button 
              onClick={stopRecording}
              className="w-32 h-32 rounded-full bg-[#FF0000] flex items-center justify-center"
            >
              <Square size={48} />
            </button>
            <span className="absolute -bottom-12 font-mono text-2xl">{`00:${timer.toString().padStart(2, '0')}`}</span>
          </div>
        )}

        {status === 'analyzing' && (
          <p className="font-mono text-[#FF6B00] animate-pulse">[ ANALYZING TRANSCRIPT & DAILY METRICS... ]</p>
        )}

        {status === 'verdict' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`p-6 rounded-2xl border ${verdict?.includes('+') ? 'bg-[#FF7300]/10 border-[#FF7300]/20' : 'bg-[#FF0000]/10 border-[#FF0000]/20'}`}
          >
            <p className="font-mono text-sm leading-relaxed">{verdict}</p>
          </motion.div>
        )}
      </div>

      {status === 'verdict' && (
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={onComplete}
          className="mt-12 w-full bg-white text-black py-6 rounded-2xl font-black text-xl uppercase tracking-widest"
        >
          [ CLOSE DAY & SLEEP ]
        </motion.button>
      )}
    </div>
  );
};
