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
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-500 bg-white/[0.02]"
            style={{ 
              borderColor: `${coachConfig.accentColor}33`, 
              boxShadow: `0 0 12px ${coachConfig.glowColor}` 
            }}
          >
            <BrainCircuit className="w-6 h-6" style={{ color: coachConfig.accentColor }} />
          </div>
          <div>
            <h1 className="text-lg font-black italic uppercase tracking-tight text-white">Squad Mentors</h1>
            <p className="text-[10px] font-black uppercase tracking-widest font-mono" style={{ color: coachConfig.accentColor }}>
              {coachConfig.name} Activated
            </p>
          </div>
        </div>
        <button onClick={() => setActiveView('home')} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-500" />
        </button>
      </div>

      {/* Horizontal Mentor Selector tab */}
      <div className="px-6 py-4 bg-[#07070a]/90 border-b border-white/5 flex gap-3 overflow-x-auto hide-scrollbar z-10">
        {Object.values(CHARACTER_CAST).map(coach => {
          const isSelected = coach.id === activeCoachId;
          const specialty = 
            coach.id === 't1ger' ? 'Strategy' : 
            coach.id === 'l1ly' ? 'AI & Operations' : 
            coach.id === 'eddy' ? 'Finance & VC' : 
            'Marketing Hook';

          return (
            <motion.button
              key={coach.id}
              onClick={() => handleSelectCoach(coach.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-300 ${
                isSelected 
                  ? 'bg-white/[0.03] text-white font-bold' 
                  : 'bg-black/20 border-white/5 text-zinc-500 hover:border-white/10'
              }`}
              style={isSelected ? {
                borderColor: coach.accentColor,
                boxShadow: `0 0 15px ${coach.glowColor}`
              } : {}}
            >
              <div 
                className="w-8 h-8 rounded-full border flex items-center justify-center overflow-hidden bg-black/40"
                style={{ borderColor: isSelected ? coach.accentColor : 'rgba(255,255,255,0.1)' }}
              >
                <img src={coach.avatarImg} alt={coach.name} className="w-6 h-6 object-contain" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-black tracking-tight block uppercase" style={isSelected ? { color: coach.accentColor } : {}}>
                  {coach.name}
                </span>
                <span className="text-[8px] font-bold text-zinc-500 block uppercase tracking-wider">
                  {specialty}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Dynamic Coach Status Card */}
      <div className="px-6 py-4 bg-zinc-950/40 border-b border-white/5 relative overflow-hidden flex items-center gap-4">
        {/* Glow behind mascot */}
        <div 
          className="absolute -left-10 top-0 w-32 h-32 rounded-full blur-[40px] opacity-10 transition-all duration-500"
          style={{ backgroundColor: coachConfig.accentColor }}
        />
        
        {/* Mascot Wrapper */}
        <motion.div 
          className="relative w-16 h-16 rounded-full border flex items-center justify-center flex-shrink-0 bg-[#07070a]/80 shadow-md z-10"
          style={{ borderColor: coachConfig.accentColor, borderWidth: '1.5px' }}
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        >
          <img 
            src={coachConfig.avatarImg} 
            alt={`${coachConfig.name} Avatar`} 
            className="w-12 h-12 object-contain"
            style={{ filter: `drop-shadow(0 0 8px ${coachConfig.glowColor})` }}
          />
        </motion.div>

        {/* Speech Bubble */}
        <div className="flex-1 min-w-0 z-10 text-left">
          <span 
            className="text-[9px] font-black font-mono uppercase tracking-widest block mb-0.5"
            style={{ color: coachConfig.accentColor }}
          >
            {coachConfig.name} — {coachConfig.title}
          </span>
          <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed line-clamp-2 italic">
            "{coachConfig.speechBubbleText.welcome[0]}"
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          const mascotImg = !isUser ? getCoachAvatar(activeCoachId, m.text) : '';
          
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
                  alt={coachConfig.name} 
                  className="w-10 h-10 object-contain rounded-full bg-white/5 border border-white/10 p-1 flex-shrink-0 shadow-lg"
                  style={{ filter: `drop-shadow(0 0 6px ${coachConfig.glowColor})` }}
                />
              )}
              <div 
                className={`max-w-[78%] p-4 rounded-3xl text-sm leading-relaxed rounded-bl-none text-left`}
                style={isUser ? {
                  backgroundColor: coachConfig.accentColor,
                  color: '#020204',
                  fontWeight: '700',
                  borderBottomRightRadius: '0px',
                  boxShadow: `0 0 15px ${coachConfig.glowColor}`
                } : {
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  color: '#e4e4e7',
                  borderBottomLeftRadius: '0px'
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
              className="w-10 h-10 object-contain rounded-full bg-white/5 border border-white/10 p-1 flex-shrink-0 animate-pulse"
            />
            <div className="glass border border-white/5 p-4 rounded-3xl rounded-tl-none flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: coachConfig.accentColor }} />
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
            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none text-white transition-colors"
            placeholder={`Ask ${coachConfig.name}...`}
            style={{ 
              borderColor: 'rgba(255, 255, 255, 0.05)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = coachConfig.accentColor;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            }}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-3 rounded-xl disabled:opacity-50 disabled:grayscale transition-all active:scale-90 shadow-lg"
            style={{
              backgroundColor: coachConfig.accentColor,
              color: '#020204',
              boxShadow: `0 0 10px ${coachConfig.glowColor}`
            }}
          >
            <Send className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
