import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { getCoachResponse } from '../services/coachService';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Send, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

// Helper to clean raw markdown asterisks and format text cleanly
const formatCleanText = (rawText: string) => {
  if (!rawText) return '';
  return rawText
    .replace(/\*\*(.*?)\*\*/g, '$1') // Strip **bold**
    .replace(/\*(.*?)\*/g, '$1')     // Strip *italic*
    .trim();
};

// Custom Typewriter component for smooth letter-by-letter rendering
const TypewriterText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 15 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(prev => text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayedText}</span>;
};

export const Coach = () => {
  const { appUser } = useAuth();
  const { setActiveView } = useT1ger();
  const { language } = useBrain();
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch coaching session history for T1GER
  useEffect(() => {
    if (!appUser) return;
    const fetchHistory = async () => {
      try {
        const q = query(collection(db, 'users', appUser.uid, 'coachingSessions'), orderBy('timestamp', 'asc'));
        const snapshot = await getDocs(q);
        
        const history = snapshot.docs
          .map(doc => doc.data())
          .flatMap(data => data.messages || []);
        
        if (history.length === 0) {
          const welcomePhrase = language === 'es'
            ? "¡Hola! Soy T1GER, tu profesor personal. ¿Qué concepto quieres aprender o dominar hoy?"
            : "Hello! I am T1GER, your personal professor. What concept would you like to master today?";
          setMessages([{ role: 'model', text: welcomePhrase }]);
        } else {
          setMessages(history);
        }
      } catch (err) {
        console.error("Error fetching coach history", err);
      }
    };
    fetchHistory();
  }, [appUser, language]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-resize textarea when writing long questions
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || !appUser || loading) return;
    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    try {
      const responseText = await getCoachResponse(appUser.uid, input, messages, 't1ger', language);
      const coachMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, coachMessage]);
      
      await addDoc(collection(db, 'users', appUser.uid, 'coachingSessions'), {
        coachId: 't1ger',
        messages: [...messages, userMessage, coachMessage],
        summary: responseText.substring(0, 100),
        timestamp: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Coach error:', error);
      const fallbackText = language === 'es'
        ? "¡Hola! Tuve una breve interrupción de conexión. ¿Podrías volver a hacer tu pregunta?"
        : "Hello! I experienced a brief connection interruption. Could you ask again?";
      const errorMessage = { role: 'model', text: fallbackText };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // High-Probability Personalized Suggestion Chips & App FAQs
  const quickPrompts = language === 'es' ? [
    { label: '⚡ ¿Cómo mantener una racha de 30 días?', prompt: '¿Qué hábitos y funciones de T1GER APP me ayudan a sostener una racha diaria sin fallar?' },
    { label: '🛒 ¿Cómo uso mis monedas en el Black Market?', prompt: '¿Cómo funciona la tienda del Black Market y en qué conviene invertir mis monedas?' },
    { label: '🎯 ¿Cómo verifico mis misiones diarias con fotos?', prompt: '¿Cómo debo tomar la foto de prueba para que el auditor de IA apruebe mis misiones?' },
    { label: '💡 ¿Cómo aprender y memorizar conceptos más rápido?', prompt: '¿Cuáles son las 3 mejores técnicas para aprender y retener conceptos de forma acelerada?' },
  ] : [
    { label: '⚡ How to maintain a 30-day streak?', prompt: 'What habits and T1GER APP features help me maintain a daily streak without failing?' },
    { label: '🛒 How do I spend coins in the Black Market?', prompt: 'How does the Black Market shop work and what should I spend my coins on?' },
    { label: '🎯 How do photo mission verifications work?', prompt: 'How should I take proof photos so the AI auditor approves my daily missions?' },
    { label: '💡 How to learn and retain concepts faster?', prompt: 'What are the top 3 techniques to learn and retain concepts at maximum speed?' },
  ];

  return (
    <div className="absolute inset-0 flex flex-col bg-[#F7F7F7] z-50 overflow-hidden max-w-lg mx-auto select-none font-sans">
      {/* SAFE NOTCH HEADER */}
      <div className="pt-[calc(0.75rem+var(--safe-top-inset,36px))] pb-3 px-4 border-b border-zinc-200/80 bg-white/95 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveView('learn')} 
            className="p-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 border-2 border-zinc-200 border-b-4 border-b-zinc-300 active:border-b-2 active:translate-y-0.5 text-zinc-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border-2 border-zinc-200 border-b-4 border-b-zinc-300 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
              <img 
                src="/tiger_3d_clay.jpg" 
                alt="T1GER Avatar" 
                className="w-8 h-8 object-cover rounded-xl"
              />
            </div>
            <div>
              <h1 className="text-base font-black italic uppercase tracking-tight text-zinc-900 leading-none">
                T1GER Profesor
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10B981]" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
                  {language === 'es' ? 'En línea' : 'Online'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHAT MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F7F7F7] hide-scrollbar">
        {/* QUICK PROMPT CHIPS (If few messages) */}
        {messages.length <= 2 && (
          <div className="space-y-2 pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block px-1 text-left">
              Preguntas Frecuentes y Guía Rápida:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(qp.prompt);
                  }}
                  className="p-3 rounded-2xl bg-white border-2 border-zinc-200 border-b-4 border-b-zinc-300 text-left hover:border-[#FF7300] active:border-b-2 active:translate-y-0.5 transition-all cursor-pointer shadow-xs group"
                >
                  <span className="text-xs font-extrabold text-zinc-800 group-hover:text-[#FF7300] transition-colors leading-snug block">
                    {qp.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          const isLatestModelMsg = !isUser && i === messages.length - 1;
          const cleanedContent = formatCleanText(m.text);

          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-white border-2 border-zinc-200 border-b-3 border-b-zinc-300 p-0.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                  <img 
                    src="/tiger_3d_clay.jpg" 
                    alt="T1GER" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}

              <div 
                className={`max-w-[84%] p-4 text-xs font-bold leading-relaxed text-left shadow-xs ${
                  isUser
                    ? 'bg-[#FF7300] border-b-4 border-[#CC5C00] text-white rounded-3xl rounded-br-xs'
                    : 'bg-white border-2 border-zinc-200 border-b-4 border-b-zinc-300 text-zinc-800 rounded-3xl rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {isLatestModelMsg ? (
                    <TypewriterText text={cleanedContent} speed={12} />
                  ) : (
                    cleanedContent
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* LOADING DOTS (Rendered ONLY when loading === true) */}
        {loading && (
          <div className="flex justify-start items-end gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border-2 border-zinc-200 border-b-3 border-b-zinc-300 p-0.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              <img 
                src="/tiger_3d_clay.jpg" 
                alt="Thinking Mascot" 
                className="w-full h-full object-cover rounded-lg animate-pulse"
              />
            </div>
            <div className="bg-white border-2 border-zinc-200 border-b-4 border-b-zinc-300 px-4 py-3 rounded-3xl rounded-bl-xs flex items-center gap-1.5 shadow-xs">
              <div className="w-2 h-2 rounded-full bg-[#FF7300] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-[#FF7300] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-[#FF7300] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* SAFE BOTTOM EXPANDABLE INPUT BAR */}
      <div className="pt-2 pb-[calc(0.75rem+var(--safe-bottom-inset,24px))] px-3 bg-white border-t-2 border-zinc-200 sticky bottom-0 z-20">
        <div className="relative flex items-end max-w-lg mx-auto bg-zinc-50 border-2 border-zinc-200 border-b-4 border-b-zinc-300 rounded-2xl p-1.5 focus-within:border-[#FF7300] focus-within:bg-white transition-all shadow-xs gap-2">
          <textarea 
            ref={textareaRef}
            rows={1}
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            aria-label="Preguntar a T1GER"
            className="flex-1 bg-transparent py-2 px-3 text-xs font-extrabold focus:outline-none text-zinc-900 placeholder-zinc-400 resize-none max-h-28 overflow-y-auto leading-normal"
            placeholder={language === 'es' ? "Hazle cualquier pregunta a T1GER..." : "Ask T1GER anything..."}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            aria-label="Enviar mensaje"
            className="py-2.5 px-4 rounded-xl bg-[#FF7300] text-white font-black text-xs uppercase tracking-wider border-b-4 border-[#CC5C00] active:border-b-0 active:translate-y-1 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-xs flex items-center justify-center shrink-0 mb-0.5"
          >
            <Send className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
