import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, MessageSquarePlus, Sparkles, TrendingUp, Zap, Target, DollarSign, CheckCircle2, Circle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { db } from '../firebase';
import { getCoachResponse } from '../services/coachService';
import { AIOrb } from '../components/ui/AIOrb';
import { SleekChatInput } from '../components/ui/SleekChatInput';

type ChatMessage = { 
  role: 'user' | 'model'; 
  text: string; 
  options?: string[]; 
  image?: string;
  checklist?: { text: string; done: boolean }[];
};

export const Coach: React.FC = () => {
  const { appUser, user } = useAuth();
  const { language } = useBrain();
  const { setActiveView } = useT1ger();
  const isEs = language === 'es';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const streamIntervalRef = useRef<number | null>(null);

  const userName = appUser?.displayName ? appUser.displayName.split(' ')[0] : (isEs ? 'David' : 'Student');

  const suggestionPills = useMemo(() => [
    {
      icon: <Zap size={16} className="text-[#FF7300]" />,
      text: isEs ? 'Estructurar una oferta de alto valor' : 'Craft an irresistible high-ticket offer',
    },
    {
      icon: <Target size={16} className="text-[#06B6D4]" />,
      text: isEs ? 'Estrategia para mis primeros 5 clientes' : 'Strategy to close my first 5 clients',
    },
    {
      icon: <DollarSign size={16} className="text-[#10B981]" />,
      text: isEs ? 'Optimizar mi flujo de caja este mes' : 'Optimize cash flow and unit economics',
    },
    {
      icon: <TrendingUp size={16} className="text-[#8B5CF6]" />,
      text: isEs ? 'Fundamentos de apalancamiento' : 'Principles of capital leverage',
    },
  ], [isEs]);

  useEffect(() => {
    if (!appUser) return;

    if (!user) {
      try {
        const localHistory = JSON.parse(localStorage.getItem(`t1ger_coach_${appUser.uid}`) || '[]');
        if (localHistory.length) {
          setMessages(localHistory.slice(-40));
        }
      } catch {
        // empty
      }
      return;
    }

    const loadHistory = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(db, 'users', appUser.uid, 'coachingSessions'), orderBy('timestamp', 'asc'))
        );
        const documents = snapshot.docs.map(item => item.data());
        const incremental = documents.flatMap(data => data.messages || []);
        if (incremental.length > 0) {
          setMessages(incremental.slice(-40));
        }
      } catch {
        // fallback
      }
    };
    loadHistory();
  }, [appUser?.uid, user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, streamingText]);

  // Clean up streaming on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  const parseSuggestedOptions = (text: string): { cleanText: string; options: string[]; checklist?: { text: string; done: boolean }[] } => {
    const lines = text.split('\n');
    const options: string[] = [];
    const textLines: string[] = [];
    const checklist: { text: string; done: boolean }[] = [];

    for (const line of lines) {
      const optionMatch = line.match(/^\s*(?:[1-3]\.|\-|\*|•)\s+(.+)$/);
      if (optionMatch && (line.includes('?') || line.includes('¿') || text.includes('💡 Siguiente') || line.includes('paso táctico'))) {
        options.push(optionMatch[1].replace(/[\*\_\#]/g, '').trim());
      } else if (line.trim().startsWith('• ') || line.trim().startsWith('- ')) {
        const itemText = line.replace(/^[\•\-\*]\s*/, '').replace(/[\*\_\#]/g, '').trim();
        if (itemText.length > 0) {
          checklist.push({ text: itemText, done: false });
        }
        textLines.push(line);
      } else {
        textLines.push(line);
      }
    }

    return {
      cleanText: textLines.join('\n').trim(),
      options: options.slice(0, 3),
      checklist: checklist.length >= 2 ? checklist : undefined,
    };
  };

  const handleSend = async (messageText: string, file?: File) => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
    const cleanInput = messageText.trim();
    if ((!cleanInput && !file) || loading || streamingText !== null || !appUser) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: cleanInput || (file ? `[Imagen adjunta: ${file.name}]` : ''),
      image: file ? URL.createObjectURL(file) : undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    setError('');
    setLoading(true);

    try {
      const responseText = await getCoachResponse(appUser.uid, cleanInput, messages, 't1ger', language);
      const parsed = parseSuggestedOptions(responseText);
      const finalText = parsed.cleanText || responseText;

      setLoading(false);

      // Start Progressive Fluid Typewriter Streamer
      const words = finalText.split(' ');
      let currentWordIndex = 0;
      setStreamingText('');

      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

      streamIntervalRef.current = window.setInterval(() => {
        currentWordIndex += 1;
        const currentSlice = words.slice(0, currentWordIndex).join(' ');
        setStreamingText(currentSlice);

        if (currentWordIndex >= words.length) {
          if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;

          const modelMsg: ChatMessage = {
            role: 'model',
            text: finalText,
            options: parsed.options.length > 0 ? parsed.options : undefined,
            checklist: parsed.checklist,
          };

          setMessages(prev => [...prev, modelMsg]);
          setStreamingText(null);

          // Persist session
          if (user) {
            addDoc(collection(db, 'users', appUser.uid, 'coachingSessions'), {
              coachId: 't1ger',
              schemaVersion: 2,
              messages: [userMsg, modelMsg],
              summary: responseText.slice(0, 100),
              timestamp: serverTimestamp(),
            }).catch(console.warn);
          } else {
            const localHistory = [...messages, userMsg, modelMsg].slice(-40);
            localStorage.setItem(`t1ger_coach_${appUser.uid}`, JSON.stringify(localHistory));
          }
        }
      }, 12);
    } catch {
      setLoading(false);
      setStreamingText(null);
      setError(
        isEs
          ? 'No pudimos conectar con el mentor. Inténtalo de nuevo.'
          : 'Could not connect to the mentor. Please try again.'
      );
    }
  };

  const toggleChecklistItem = (msgIndex: number, itemIndex: number) => {
    setMessages(prev => {
      const next = [...prev];
      const msg = { ...next[msgIndex] };
      if (msg.checklist) {
        const nextList = [...msg.checklist];
        nextList[itemIndex] = { ...nextList[itemIndex], done: !nextList[itemIndex].done };
        msg.checklist = nextList;
        next[msgIndex] = msg;
      }
      return next;
    });
  };

  const clearChat = () => {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setStreamingText(null);
    setLoading(false);
    setMessages([]);
    if (appUser) {
      localStorage.removeItem(`t1ger_coach_${appUser.uid}`);
    }
  };

  const hasMessages = messages.length > 0 || streamingText !== null;

  return (
    <div className="flex h-screen w-full flex-col bg-[#09090B] text-white selection:bg-[var(--ob-accent)] selection:text-black overflow-hidden pb-[env(safe-area-inset-bottom)]">
      {/* Subtle Ambient Radial Aura */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,rgba(255,115,0,0.14),transparent_70%)]" />

      {/* Top Header Bar with Safe Area Clearance */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/6 bg-[#09090B]/90 px-4 pb-3 pt-[calc(.85rem+env(safe-area-inset-top))] backdrop-blur-xl z-20">
        <button
          onClick={() => setActiveView('learn')}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white active:scale-95 transition cursor-pointer"
          title={isEs ? 'Volver al aprendizaje' : 'Back to learn'}
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF7300]/20 to-[#06B6D4]/20 border border-white/10 flex items-center justify-center p-0.5 overflow-hidden">
            <img src="/t1ger-avatar.png" alt="T1GER" className="w-full h-full object-contain" />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse border border-[#09090B]" />
          </div>
          <span className="text-sm font-bold tracking-wider uppercase text-zinc-200">
            T1GER AI
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[var(--ob-accent)]/20 text-[9px] font-black text-[var(--ob-accent)] uppercase">
            PRO
          </span>
        </div>

        <button
          onClick={clearChat}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
          title={isEs ? 'Nueva conversación' : 'New chat'}
        >
          <MessageSquarePlus size={17} />
        </button>
      </header>

      {/* Scrollable Conversation Arena */}
      <section className="flex-1 overflow-y-auto px-4 py-4 w-full max-w-full" aria-live="polite">
        {!hasMessages ? (
          /* Empty / Hero State (Inspired by Muzli / ChatGPT Concept) */
          <div className="flex min-h-[70vh] flex-col items-center justify-center text-center py-6 max-w-md mx-auto">
            {/* Holographic Fluid AI Orb with Particle Aura */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mb-6 flex items-center justify-center"
            >
              <AIOrb size="lg" />
            </motion.div>

            {/* Typography */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="space-y-1.5 mb-8 max-w-xs px-2"
            >
              <p className="text-xs font-medium text-zinc-400">
                {isEs ? `Hola, ${userName}` : `Hello, ${userName}`}
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {isEs ? '¿En qué te puedo ayudar hoy?' : 'How can I help you today?'}
              </h1>
            </motion.div>

            {/* Quick Suggestion Pills */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full px-1"
            >
              {suggestionPills.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(pill.text)}
                  disabled={loading}
                  className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/8 bg-white/[.03] hover:bg-white/[.07] hover:border-white/15 text-left transition-all active:scale-[0.98] cursor-pointer group"
                >
                  <div className="p-2 rounded-xl bg-white/5 group-hover:scale-110 transition-transform shrink-0">
                    {pill.icon}
                  </div>
                  <span className="text-xs font-medium text-zinc-300 group-hover:text-white leading-tight break-words [overflow-wrap:anywhere]">
                    {pill.text}
                  </span>
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          /* Active Chat Messages List */
          <div className="space-y-5 max-w-lg mx-auto pb-4 w-full">
            {messages.map((message, index) => {
              const isUser = message.role === 'user';

              return (
                <motion.div
                  key={`${message.role}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex flex-col w-full ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start gap-3'}`}>
                    {!isUser && (
                      <div className="shrink-0 mt-0.5 relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF7300]/20 to-[#06B6D4]/20 border border-white/10 flex items-center justify-center p-0.5 overflow-hidden">
                        <img src="/t1ger-avatar.png" alt="T1GER" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className={`flex flex-col gap-2 ${isUser ? 'max-w-[88%]' : 'max-w-[calc(100%-2.5rem)]'}`}>
                      <div
                        className={`text-[14px] leading-relaxed break-words [overflow-wrap:anywhere] ${
                          isUser
                            ? 'rounded-2xl rounded-br-xs bg-white/[.08] border border-white/12 px-4 py-3 text-zinc-100 shadow-md backdrop-blur-md'
                            : 'text-zinc-200 py-1'
                        }`}
                      >
                        {message.image && (
                          <img
                            src={message.image}
                            alt="Uploaded"
                            className="mb-2 max-h-48 rounded-xl object-cover border border-white/10 max-w-full"
                          />
                        )}
                        <p className="whitespace-pre-line leading-relaxed">{message.text}</p>

                        {/* Interactive Action Checklist (If applicable) */}
                        {message.checklist && message.checklist.length > 0 && (
                          <div className="mt-3 space-y-1.5 rounded-2xl border border-white/8 bg-white/[.02] p-3">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--ob-accent)] mb-2">
                              <ShieldCheck size={14} /> {isEs ? 'Acciones Clave' : 'Key Actions'}
                            </div>
                            {message.checklist.map((item, cIdx) => (
                              <button
                                key={cIdx}
                                onClick={() => toggleChecklistItem(index, cIdx)}
                                className="flex items-start gap-2.5 w-full text-left p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer text-xs"
                              >
                                {item.done ? (
                                  <CheckCircle2 size={16} className="text-[#3FC78E] shrink-0 mt-0.5" />
                                ) : (
                                  <Circle size={16} className="text-zinc-500 shrink-0 mt-0.5" />
                                )}
                                <span className={item.done ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                                  {item.text}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Tactical Action Chips */}
                      {!isUser && message.options && message.options.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-2 pt-1 max-w-full">
                          {message.options.map((opt, optIdx) => (
                            <button
                              key={optIdx}
                              onClick={() => handleSend(opt)}
                              disabled={loading || streamingText !== null}
                              className="rounded-full border border-white/12 bg-white/[.04] px-3.5 py-1.5 text-left text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[.08] hover:border-[var(--ob-accent)]/50 transition-all cursor-pointer active:scale-95 shadow-xs break-words [overflow-wrap:anywhere]"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Live Streaming Typewriter Display */}
            {streamingText !== null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 w-full"
              >
                <div className="shrink-0 mt-0.5 relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF7300]/20 to-[#06B6D4]/20 border border-white/10 flex items-center justify-center p-0.5 overflow-hidden">
                  <img src="/t1ger-avatar.png" alt="T1GER" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col gap-2 max-w-[calc(100%-2.5rem)]">
                  <div className="text-[14px] leading-relaxed break-words [overflow-wrap:anywhere] text-zinc-200 py-1">
                    <p className="whitespace-pre-line">
                      {streamingText}
                      <span className="inline-block w-2 h-4 ml-1 bg-[var(--ob-accent)] animate-pulse align-middle rounded-xs" />
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Mesmerizing Neural Thinking Waveform & Hologram */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3.5 py-3 px-1"
              >
                <AIOrb size="sm" isThinking={true} />
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-200">
                      {isEs ? 'Mentor T1GER' : 'T1GER Mentor'}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {isEs ? 'analizando datos…' : 'synthesizing strategy…'}
                    </span>
                  </div>

                  {/* Multi-Color Siri / Apple Intelligence Fluid Waveform */}
                  <div className="flex items-center gap-1.5 h-3.5">
                    {[
                      { bg: '#FF7300', delay: '0ms', dur: '0.6s' },
                      { bg: '#F59E0B', delay: '120ms', dur: '0.8s' },
                      { bg: '#06B6D4', delay: '240ms', dur: '0.7s' },
                      { bg: '#8B5CF6', delay: '360ms', dur: '0.9s' },
                      { bg: '#EC4899', delay: '480ms', dur: '0.65s' },
                      { bg: '#10B981', delay: '600ms', dur: '0.75s' },
                    ].map((wave, wIdx) => (
                      <motion.span
                        key={wIdx}
                        animate={{
                          scaleY: [0.3, 1.4, 0.3],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: parseFloat(wave.dur),
                          delay: parseInt(wave.delay) / 1000,
                          ease: 'easeInOut',
                        }}
                        className="w-1 h-3 rounded-full"
                        style={{ backgroundColor: wave.bg }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={endRef} />
          </div>
        )}
      </section>

      {/* Floating Minimalist Input Bar */}
      <footer className="border-t border-white/6 bg-[#09090B]/90 px-4 pb-[calc(.85rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-2xl z-20">
        {error && <p role="alert" className="mb-2 text-center text-xs text-red-400">{error}</p>}
        <SleekChatInput
          onSend={handleSend}
          isLoading={loading || streamingText !== null}
          placeholder={isEs ? 'Pregúntale a T1GER...' : 'Ask T1GER anything...'}
        />
      </footer>
    </div>
  );
};
