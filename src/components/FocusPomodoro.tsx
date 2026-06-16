import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, 
  ArrowLeft, Brain, CheckCircle, Flame 
} from 'lucide-react';
import { useT1ger } from '../contexts/T1gerContext';

interface FocusPomodoroProps {
  onClose: () => void;
}

export const FocusPomodoro: React.FC<FocusPomodoroProps> = ({ onClose }) => {
  const { addXP } = useT1ger();
  
  // Pomodoro States
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedBlocks, setCompletedBlocks] = useState(0);

  // Audio Binaural Beat States
  const [binauralActive, setBinauralActive] = useState(false);
  const [volume, setVolume] = useState(0.1);

  // Web Audio Context References
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscLeftRef = useRef<OscillatorNode | null>(null);
  const oscRightRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Canvas visualizer reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const totalSeconds = isBreak ? 5 * 60 : 25 * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progress = (totalSeconds - currentSeconds) / totalSeconds;

  // Sound effects
  const playAlertSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.45); // C6
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    } catch (e) {
      console.warn('Audio synthesis failed', e);
    }
  };

  // Synthesis of 40Hz Gamma waves using Web Audio API
  const startBinauralBeats = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNodeRef.current = gainNode;

      // Base Frequency: 200Hz
      // Target Frequency for Gamma: 240Hz (240 - 200 = 40Hz difference)
      const oscLeft = ctx.createOscillator();
      oscLeft.type = 'sine';
      oscLeft.frequency.setValueAtTime(200, ctx.currentTime);
      oscLeftRef.current = oscLeft;

      const oscRight = ctx.createOscillator();
      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(240, ctx.currentTime);
      oscRightRef.current = oscRight;

      // Pan Left for Left Channel, Pan Right for Right Channel
      const pannerLeft = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const pannerRight = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      if (pannerLeft && pannerRight) {
        pannerLeft.pan.setValueAtTime(-1, ctx.currentTime);
        pannerRight.pan.setValueAtTime(1, ctx.currentTime);

        oscLeft.connect(pannerLeft);
        oscRight.connect(pannerRight);

        pannerLeft.connect(gainNode);
        pannerRight.connect(gainNode);
      } else {
        // Fallback if StereoPanner is not supported
        const merger = ctx.createChannelMerger(2);
        oscLeft.connect(merger, 0, 0);
        oscRight.connect(merger, 0, 1);
        merger.connect(gainNode);
      }

      gainNode.connect(ctx.destination);
      oscLeft.start();
      oscRight.start();
      setBinauralActive(true);
    } catch (e) {
      console.error('Failed to initialize Binaural sound:', e);
    }
  };

  const stopBinauralBeats = () => {
    if (!audioCtxRef.current) return;
    try {
      oscLeftRef.current?.stop();
      oscRightRef.current?.stop();
      audioCtxRef.current.close();
    } catch (e) {
      console.error(e);
    }
    audioCtxRef.current = null;
    oscLeftRef.current = null;
    oscRightRef.current = null;
    gainNodeRef.current = null;
    setBinauralActive(false);
  };

  const toggleBinaural = () => {
    if (binauralActive) stopBinauralBeats();
    else startBinauralBeats();
  };

  // Adjust volume dynamically
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Pomodoro Countdown Logic
  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(prev => prev - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            // Completed!
            playAlertSound();
            if (!isBreak) {
              setCompletedBlocks(prev => prev + 1);
              addXP(50); // XP Reward for fully completing 25 min deep block
              setIsBreak(true);
              setMinutes(5);
            } else {
              setIsBreak(false);
              setMinutes(25);
            }
            setIsActive(false);
          } else {
            setMinutes(prev => prev - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, seconds, minutes, isBreak]);

  // Audio wave visualizer canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const waveCount = 3;
      const speed = binauralActive ? 0.08 : 0.01;
      const amplitude = binauralActive ? 25 : 4;
      const baseFreq = binauralActive ? 40 : 20;

      ctx.lineWidth = 1.5;

      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const opacity = 0.15 + (w * 0.1);
        ctx.strokeStyle = `rgba(204, 255, 0, ${opacity})`;

        const timeOffset = Date.now() * speed * (0.8 + w * 0.1) * 0.01;

        for (let x = 0; x < width; x++) {
          const angle = (x / width) * Math.PI * 2 * (w + 1) + timeOffset;
          const y = height / 2 + Math.sin(angle) * amplitude * Math.sin(x / width * Math.PI);
          
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [binauralActive]);

  // Clean up Web Audio on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try {
          oscLeftRef.current?.stop();
          oscRightRef.current?.stop();
          audioCtxRef.current.close();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, []);

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#020204] text-white flex flex-col justify-between p-6 overflow-hidden">
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 bg-cyber-grid opacity-5 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[50%] rounded-full blur-[120px] bg-[var(--accent-glow)] opacity-10 pointer-events-none" />
      
      {/* Canvas background visualizer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* HEADER SECTION */}
      <header className="flex items-center justify-between z-10 w-full">
        <button 
          onClick={() => { stopBinauralBeats(); onClose(); }}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Operation Center</span>
          <span className="text-xs font-black uppercase text-white tracking-wider mt-1.5 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-accent animate-pulse" /> Zen Focus Screen
          </span>
        </div>
        <div className="w-10" />
      </header>

      {/* TIMER & PROGRESS SPHERE */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 my-8">
        
        {/* Neon Aura Rings */}
        <div className="relative w-64 h-64 flex items-center justify-center rounded-full bg-black/40 border border-white/5 backdrop-blur-md shadow-[inset_0_4px_30px_rgba(255,255,255,0.02)]">
          
          {/* Progress ring using SVG */}
          <svg className="absolute w-full h-full rotate-[-90deg]">
            <circle
              cx="128"
              cy="128"
              r="116"
              className="stroke-zinc-900 stroke-[4] fill-none"
            />
            <motion.circle
              cx="128"
              cy="128"
              r="116"
              className="stroke-accent stroke-[5] fill-none"
              strokeDasharray={2 * Math.PI * 116}
              animate={{ strokeDashoffset: 2 * Math.PI * 116 * (1 - progress) }}
              transition={{ duration: 0.5, ease: "linear" }}
              style={{ filter: 'drop-shadow(0 0 8px var(--accent-glow))' }}
            />
          </svg>

          {/* Time text */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest mb-1.5">
              {isBreak ? 'BRAIN REST RECOVERY' : 'DEEP WORK FOCUS'}
            </span>
            <span className="text-5xl font-black font-mono tracking-tight text-white leading-none">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            
            <AnimatePresence mode="wait">
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                  <span className="text-[8px] font-black uppercase tracking-wider">Locked In</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Counter of deep blocks completed */}
        <div className="mt-8 flex items-center gap-3">
          {[...Array(4)].map((_, idx) => (
            <div 
              key={idx}
              className={`w-3 h-3 rounded-full border transition-all duration-300 ${
                idx < completedBlocks
                  ? 'bg-accent border-accent shadow-[0_0_8px_var(--accent-glow)]'
                  : 'bg-zinc-950 border-white/10'
              }`}
            />
          ))}
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black ml-1.5">
            {completedBlocks}/4 Deep Nodes Secure
          </span>
        </div>
      </div>

      {/* SCIENTIFIC AUDIO & CONTROLS BANNERS */}
      <div className="space-y-6 z-10 w-full max-w-sm mx-auto">
        
        {/* Binaural wave controller box */}
        <div className="liquid-glass border border-white/5 rounded-3xl p-5 shadow-3d space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-accent font-black uppercase tracking-wider">
            Labs v1.0
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
              binauralActive ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-white/5 border-white/10 text-zinc-500'
            }`}>
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-tight">Ondas Binaurales Gamma (40Hz)</h3>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5 leading-normal">
                Sincronización cognitiva demostrada científicamente para inducir el estado de hiperenfoque profundo (usa auriculares).
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            {binauralActive ? (
              <button
                onClick={toggleBinaural}
                className="px-4 py-2 bg-accent text-black font-black text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-[0_0_10px_var(--accent-glow)] cursor-pointer"
              >
                Apagar Ondas
              </button>
            ) : (
              <button
                onClick={toggleBinaural}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white font-black text-[9px] uppercase tracking-wider rounded-xl hover:bg-white/10 transition-all cursor-pointer"
              >
                Encender Ondas
              </button>
            )}

            {/* Volume control slider */}
            {binauralActive && (
              <div className="flex items-center gap-2 flex-1 max-w-[150px]">
                <VolumeX size={12} className="text-zinc-500" />
                <input
                  type="range"
                  min="0.01"
                  max="0.3"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-accent h-1 bg-zinc-800 rounded-full cursor-pointer"
                />
                <Volume2 size={12} className="text-accent" />
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex-1 py-5 rounded-2xl btn-gamified-3d flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 fill-current stroke-none" /> Pause Operation
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current stroke-none" /> Engage Focus
              </>
            )}
          </button>
          
          <button
            onClick={resetTimer}
            className="w-16 py-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
