import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCoachResponse } from '../services/coachService';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Send, Loader2, BrainCircuit, ArrowLeft } from 'lucide-react';
import { useT1ger } from '../contexts/T1gerContext';
import { motion } from 'motion/react';
import { CHARACTER_CAST, type CharacterId } from '../services/characterStateEngine';

// Helper to determine active coach avatar expressions based on keyword triggers
const getCoachAvatar = (coachId: CharacterId, text: string) => {
  const lowercase = text.toLowerCase();
  const sadKeywords = [
    'bottleneck', 'fail', 'error', 'challenge', 'difficult', 'struggle', 'problem', 
    'delay', 'sacrifice', 'critique', 'obstáculo', 'dificultad', 'error', 'problema', 
    'fallo', 'perder', 'límite', 'freno', 'bloqueo'
  ];
  
  if (sadKeywords.some(keyword => lowercase.includes(keyword))) {
    return '/tiger_sad.png';
  }

  const winKeywords = ['boom', 'sublime', 'excelente', 'omg', 'perfecto', 'ganado', 'éxito', 'completado', 'logrado'];
  if (winKeywords.some(keyword => lowercase.includes(keyword))) {
    return '/tiger_celebrating.png';
  }
  
  return CHARACTER_CAST[coachId].avatarImg;
};

export const Coach = () => {
  const { appUser, updateAppUser } = useAuth();
  const { setActiveView } = useT1ger();
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeCoachId = (appUser?.activeCoachId as CharacterId) || 't1ger';
  const coachConfig = CHARACTER_CAST[activeCoachId];

  // Fetch coaching session history for the selected coach
  useEffect(() => {
    if (!appUser) return;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'users', appUser.uid, 'coachingSessions'), orderBy('timestamp', 'asc'));
        const snapshot = await getDocs(q);
        
        // Filter session history by activeCoachId (with backward-compatibility for empty coachId -> t1ger)
        const history = snapshot.docs
          .map(doc => doc.data())
          .filter(data => data.coachId === activeCoachId || (!data.coachId && activeCoachId === 't1ger'))
          .flatMap(data => data.messages || []);
        
        if (history.length === 0) {
          // Pre-populate with the coach's custom welcome phrase
          const welcomePhrase = coachConfig.speechBubbleText.welcome[0];
          setMessages([{ role: 'model', text: welcomePhrase }]);
        } else {
          setMessages(history);
        }
      } catch (err) {
        console.error("Error fetching coach history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [appUser, activeCoachId, coachConfig]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectCoach = async (coachId: CharacterId) => {
    if (!appUser) return;
    if (coachId === activeCoachId) return;
    try {
      await updateAppUser({ activeCoachId: coachId });
    } catch (err) {
      console.error("Failed to update active coach", err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !appUser) return;
    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await getCoachResponse(appUser.uid, input, messages, activeCoachId);
      const coachMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, coachMessage]);
      
      await addDoc(collection(db, 'users', appUser.uid, 'coachingSessions'), {
        coachId: activeCoachId,
        messages: [...messages, userMessage, coachMessage],
        summary: responseText.substring(0, 100),
        timestamp: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Coach error:', error);
      const fallbackText = activeCoachId === 't1ger' 
        ? "Predator, mi conexión sináptica falló. Revisa tu internet o asegúrate de haber reiniciado tu servidor (npm run dev) para leer mi API Key."
        : "Ocurrió un error de conexión. Por favor revisa tu entorno.";
      const errorMessage = { role: 'model', text: fallbackText };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] -mx-5 -mt-5 bg-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-100 bg-white/95 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-zinc-50 border border-zinc-100"
          >
            <BrainCircuit className="w-5 h-5" style={{ color: coachConfig.accentColor }} />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-zinc-800">T1GER Mentor</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              {coachConfig.name} Activated
            </p>
          </div>
        </div>
        <button onClick={() => setActiveView('home')} className="p-2 hover:bg-zinc-50 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-500" />
        </button>
      </div>



      {/* Dynamic Coach Status Card */}
      <div className="px-5 py-4 bg-zinc-50/50 border-b border-zinc-100 flex items-center gap-4">
        {/* Mascot Wrapper */}
        <motion.div 
          className="relative w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center flex-shrink-0 bg-white shadow-sm z-10"
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        >
          <img 
            src={coachConfig.avatarImg} 
            alt={`${coachConfig.name} Avatar`} 
            className="w-8 h-8 object-contain"
          />
        </motion.div>

        {/* Speech Bubble */}
        <div className="flex-1 min-w-0 z-10 text-left">
          <span 
            className="text-[10px] font-black uppercase tracking-widest block mb-0.5 text-zinc-800"
          >
            {coachConfig.name} — {coachConfig.title}
          </span>
          <p className="text-xs text-zinc-500 font-medium leading-relaxed line-clamp-2">
            "{coachConfig.speechBubbleText.welcome[0]}"
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar bg-white">
        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          const mascotImg = !isUser ? getCoachAvatar(activeCoachId, m.text) : '';
          
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <img 
                  src={mascotImg} 
                  alt={coachConfig.name} 
                  className="w-8 h-8 object-contain rounded-full bg-zinc-50 border border-zinc-200 p-0.5 flex-shrink-0"
                />
              )}
              <div 
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed text-left`}
                style={isUser ? {
                  backgroundColor: coachConfig.accentColor,
                  color: 'white',
                  borderBottomRightRadius: '4px',
                } : {
                  backgroundColor: '#F4F4F5', // zinc-100
                  color: '#27272A', // zinc-800
                  borderBottomLeftRadius: '4px'
                }}
              >
                {m.text}
              </div>
            </motion.div>
          );
        })}
        {loading && (
          <div className="flex justify-start items-end gap-3">
            <img 
              src={coachConfig.avatarImg} 
              alt="Thinking Mascot" 
              className="w-10 h-10 object-contain rounded-full bg-zinc-50 border border-zinc-200 p-1 flex-shrink-0 animate-pulse"
            />
            <div className="glass border border-zinc-200 p-4 rounded-3xl rounded-tl-none flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: coachConfig.accentColor }} />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-zinc-100 sticky bottom-0">
        <div className="relative flex items-center max-w-2xl mx-auto">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-full py-3.5 pl-5 pr-14 text-[15px] focus:outline-none focus:border-zinc-300 focus:bg-white transition-colors text-zinc-800"
            placeholder={`Message ${coachConfig.name}...`}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-1.5 p-2 rounded-full disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
            style={{
              backgroundColor: input.trim() ? coachConfig.accentColor : '#E5E7EB',
              color: 'white',
            }}
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
