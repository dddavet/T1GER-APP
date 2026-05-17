import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCoachResponse } from '../services/coachService';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Send, Loader2, BrainCircuit, ArrowLeft } from 'lucide-react';
import { useT1ger } from '../contexts/T1gerContext';
import { motion, AnimatePresence } from 'motion/react';

export const Coach = () => {
  const { appUser } = useAuth();
  const { setActiveView } = useT1ger();
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
      <div className="p-6 border-b border-white/5 bg-black/50 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center border border-[#FF6B00]/20">
            <BrainCircuit className="w-6 h-6 text-[#FF6B00]" />
          </div>
          <div>
            <h1 className="text-lg font-black italic uppercase tracking-tight">AI Coach</h1>
            <p className="text-[10px] font-black uppercase text-[#FF6B00] tracking-widest">Mentor Mode Active</p>
          </div>
        </div>
        <button onClick={() => setActiveView('home')} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {messages.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-[#FF6B00] text-white font-bold rounded-tr-none' 
                : 'glass border border-white/5 text-zinc-200 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="glass border border-white/5 p-4 rounded-3xl rounded-tl-none">
              <Loader2 className="w-5 h-5 animate-spin text-[#FF6B00]" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-black/50 backdrop-blur-xl border-t border-white/5 sticky bottom-0">
        <div className="relative flex items-center">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:border-[#FF6B00]/50 transition-colors"
            placeholder="Ask your mentor..."
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-3 bg-[#FF6B00] rounded-xl text-white disabled:opacity-50 disabled:grayscale transition-all active:scale-90"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
