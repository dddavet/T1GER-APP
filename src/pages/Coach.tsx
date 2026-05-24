import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCoachResponse } from '../services/coachService';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Send, Loader2, BrainCircuit, ArrowLeft } from 'lucide-react';
import { useT1ger } from '../contexts/T1gerContext';
import { useBrain } from '../contexts/BrainContext';
import { motion, AnimatePresence } from 'motion/react';

// Helper to determine minor chat bubble mascot expressions based on keyword triggers
const getMascotForText = (text: string) => {
  const lowercase = text.toLowerCase();
  const sadKeywords = [
    'bottleneck', 'fail', 'error', 'challenge', 'difficult', 'struggle', 'problem', 
    'delay', 'sacrifice', 'critique', 'obstáculo', 'dificultad', 'error', 'problema', 
    'fallo', 'perder', 'límite', 'freno', 'bloqueo'
  ];
  
  if (sadKeywords.some(keyword => lowercase.includes(keyword))) {
    return '/lion_sad.png';
  }
  return '/lion_happy.png';
};

export const Coach = () => {
  const { appUser } = useAuth();
  const { setActiveView } = useT1ger();
  const { t1gerEmotion, t1gerVisualConfig } = useBrain();
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!appUser) return;
    const fetchHistory = async () => {
      const q = query(collection(db, 'users', appUser.uid, 'coachingSessions'), orderBy('timestamp', 'asc'));
      const snapshot = await getDocs(q);
      const history = snapshot.docs.flatMap(doc => doc.data().messages || []);
      if (history.length === 0) {
        setMessages([{ role: 'model', text: "I've been watching your progress. You're consistent, but are you effective? What's the biggest bottleneck in your business right now?" }]);
      } else {
        setMessages(history);
      }
    };
    fetchHistory();
  }, [appUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !appUser) return;
    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await getCoachResponse(appUser.uid, input, messages);
      const coachMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, coachMessage]);
      
      await addDoc(collection(db, 'users', appUser.uid, 'coachingSessions'), {
        messages: [...messages, userMessage, coachMessage],
        summary: responseText.substring(0, 100),
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Coach error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] -mx-6 -mt-20">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-[#020204]/90 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent-main)]/10 flex items-center justify-center border border-[var(--accent-main)]/20 shadow-[0_0_12px_var(--accent-glow)]">
            <BrainCircuit className="w-6 h-6 text-[var(--accent-main)]" />
          </div>
          <div>
            <h1 className="text-lg font-black italic uppercase tracking-tight text-white">AI Coach</h1>
            <p className="text-[10px] font-black uppercase text-[var(--accent-main)] tracking-widest font-mono">Mentor Mode Active</p>
          </div>
        </div>
        <button onClick={() => setActiveView('home')} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-500" />
        </button>
      </div>

      {/* Dynamic T1GER Mentor Status Card */}
      <div className="px-6 py-4 bg-zinc-950/40 border-b border-white/5 relative overflow-hidden flex items-center gap-4">
        {/* Glow behind mascot */}
        <div 
          className="absolute -left-10 top-0 w-32 h-32 rounded-full blur-[40px] opacity-10 transition-all duration-500"
          style={{ backgroundColor: t1gerVisualConfig.accentColor }}
        />
        
        {/* Mascot Wrapper */}
        <motion.div 
          className="relative w-16 h-16 rounded-full border-2 flex items-center justify-center flex-shrink-0 bg-[#07070a]/80 shadow-md z-10"
          style={{ borderColor: t1gerVisualConfig.accentColor }}
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        >
          <img 
            src={t1gerVisualConfig.avatarImg} 
            alt="T1GER Coach Mascot" 
            className="w-12 h-12 object-contain"
          />
          <div 
            className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-[9px] border font-black font-mono"
            style={{ 
              backgroundColor: '#020204',
              borderColor: t1gerVisualConfig.accentColor,
              color: t1gerVisualConfig.accentColor
            }}
          >
            {t1gerVisualConfig.statusIcon}
          </div>
        </motion.div>

        {/* Speech Bubble */}
        <div className="flex-1 min-w-0 z-10">
          <span 
            className="text-[9px] font-black font-mono uppercase tracking-widest block mb-0.5"
            style={{ color: t1gerVisualConfig.accentColor }}
          >
            T1GER MENTOR — {t1gerVisualConfig.statusLabel}
          </span>
          <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed line-clamp-2 italic">
            "{t1gerVisualConfig.speechBubbleText}"
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          const mascotImg = !isUser ? getMascotForText(m.text) : '';
          
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <img 
                  src={mascotImg} 
                  alt="T1GER Mascot" 
                  className="w-10 h-10 object-contain rounded-full bg-white/5 border border-white/10 p-1 flex-shrink-0 shadow-lg"
                />
              )}
              <div className={`max-w-[78%] p-4 rounded-3xl text-sm leading-relaxed ${
                isUser 
                  ? 'bg-[var(--accent-main)] text-black font-bold rounded-br-none shadow-[0_0_15px_rgba(204,255,0,0.15)]' 
                  : 'glass border border-white/5 text-zinc-200 rounded-bl-none'
              }`}>
                {m.text}
              </div>
            </motion.div>
          );
        })}
        {loading && (
          <div className="flex justify-start items-end gap-3">
            <img 
              src={t1gerVisualConfig.avatarImg} 
              alt="Thinking Mascot" 
              className="w-10 h-10 object-contain rounded-full bg-white/5 border border-white/10 p-1 flex-shrink-0 animate-pulse"
            />
            <div className="glass border border-white/5 p-4 rounded-3xl rounded-tl-none flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-[var(--accent-main)]" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-[#020204]/90 backdrop-blur-xl border-t border-white/5 sticky bottom-0">
        <div className="relative flex items-center">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:border-[var(--accent-main)]/50 text-white transition-colors"
            placeholder="Ask your mentor..."
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-3 bg-[var(--accent-main)] rounded-xl text-black disabled:opacity-50 disabled:grayscale transition-all active:scale-90 shadow-[0_0_10px_var(--accent-glow)] animate-pulse-glow"
          >
            <Send className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
