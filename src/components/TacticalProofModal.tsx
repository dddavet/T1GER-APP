import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, Check, AlertCircle, Loader2, Send, Type, Crown } from 'lucide-react';
import { verifyMissionProof } from '../services/gemini';
import { useAuth } from '../contexts/AuthContext';

interface TacticalProofModalProps {
  task: { id: string; label: string; type: string };
  onClose: () => void;
  onVerify: (proofUrl?: string, proofText?: string, verified?: boolean) => void;
}

export const TacticalProofModal = ({ task, onClose, onVerify }: TacticalProofModalProps) => {
  const { appUser } = useAuth();
  const [mode, setMode] = useState<'photo' | 'text'>('photo');
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const haptic = (strong = false) => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(strong ? [15, 5, 15] : 10);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    haptic();
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async () => {
    haptic(true);
    
    // PAYWALL GUARD REMOVED

    setVerifying(true);
    setError(null);
    try {
      if (mode === 'photo' && image) {
        const result = await verifyMissionProof(task.type, task.label, image, 'image/jpeg');
        if (result.status === 'APPROVED') {
          onVerify(image, undefined, true);
        } else {
          setError(result.message || 'AI rejected this proof. Be more authentic.');
        }
      } else if (mode === 'text' && text.length > 20) {
        onVerify(undefined, text, true);
      } else {
        setError('Insufficient intel. Try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Verification failed. System error.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-md liquid-glass-heavy border-white/15 rounded-[3rem] overflow-hidden shadow-3d"
      >
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-1">{task.type}</span>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">TACTICAL <span className="text-accent">PROOF</span></h2>
            </div>
            <button onClick={() => { haptic(); onClose(); }} className="w-10 h-10 liquid-glass rounded-full flex items-center justify-center border-white/10 shadow-3d active:scale-90">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 p-1.5 liquid-glass rounded-full border-white/5 shadow-inner">
            <button 
              onClick={() => { haptic(); setMode('photo'); }}
              className={`flex-1 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mode === 'photo' ? 'bg-white text-black shadow-3d' : 'text-zinc-600'}`}
            >
              <Camera className="w-4 h-4" strokeWidth={3} /> Visual Intel
            </button>
            <button 
              onClick={() => { haptic(); setMode('text'); }}
              className={`flex-1 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mode === 'text' ? 'bg-white text-black shadow-3d' : 'text-zinc-600'}`}
            >
              <Type className="w-4 h-4" strokeWidth={3} /> Field Report
            </button>
          </div>

          <div className="min-h-[220px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-black/40 p-6 shadow-inner relative overflow-hidden group">
            {mode === 'photo' ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                {image ? (
                  <div className="relative w-full group">
                    <img src={image} alt="Proof" className="w-full h-52 object-cover rounded-[2rem] border border-white/10 shadow-3d" />
                    <button onClick={() => setImage(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                       <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-4 py-8">
                    <div className="w-20 h-20 rounded-full liquid-glass flex items-center justify-center border border-white/10 shadow-3d group-hover:scale-110 transition-transform relative">
                      <Camera className="w-8 h-8 text-accent" />
                    </div>
                    <div className="text-center">
                       <span className="text-xs font-black text-white uppercase tracking-widest block mb-1">
                         Capture Evidence
                       </span>
                       <span className="text-[9px] font-bold text-zinc-500 uppercase">
                         Camera access required
                       </span>
                    </div>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            ) : (
              <textarea 
                placeholder="REPORT DETAILS: Excuses carry zero weight in the algorithm. Be specific."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-44 bg-transparent text-sm font-medium focus:outline-none resize-none placeholder:text-zinc-700 placeholder:uppercase placeholder:font-black placeholder:text-[10px] placeholder:tracking-widest leading-relaxed"
              />
            )}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-3 p-5 bg-red-500/10 border border-red-500/20 rounded-[1.5rem] shadow-inner"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-black text-red-400 leading-relaxed uppercase tracking-tight">{error}</p>
            </motion.div>
          )}

          <button 
            onClick={handleVerify}
            disabled={verifying || (mode === 'photo' ? !image : text.length < 20)}
            className="w-full bg-accent text-black py-6 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 shadow-3d-accent"
          >
            {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" strokeWidth={3} />}
            {verifying ? 'Auditing Intel...' : 'Upload Tactical Proof'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
