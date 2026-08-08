import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Bot, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { db } from '../firebase';
import { getCoachResponse } from '../services/coachService';

type ChatMessage = { role: 'user' | 'model'; text: string };

export const Coach = () => {
  const { appUser, user } = useAuth();
  const { language } = useBrain();
  const { setActiveView } = useT1ger();
  const isEs = language === 'es';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcome: ChatMessage = { role: 'model', text: isEs ? 'Dime qué decisión de inversión estás intentando entender. Separaremos evidencia, supuestos y siguiente paso.' : 'Tell me which investing decision you are trying to understand. We will separate evidence, assumptions, and the next step.' };
    if (!appUser) { setMessages([welcome]); return; }
    if (!user) {
      try {
        const localHistory = JSON.parse(localStorage.getItem(`t1ger_coach_${appUser.uid}`) || '[]');
        setMessages(localHistory.length ? localHistory.slice(-60) : [welcome]);
      } catch {
        setMessages([welcome]);
      }
      return;
    }
    const loadHistory = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'users', appUser.uid, 'coachingSessions'), orderBy('timestamp', 'asc')));
        const documents = snapshot.docs.map(item => item.data());
        const legacy = documents.filter(data => data.schemaVersion !== 2).at(-1)?.messages || [];
        const incremental = documents.filter(data => data.schemaVersion === 2).flatMap(data => data.messages || []);
        setMessages([...legacy, ...incremental].slice(-60).length ? [...legacy, ...incremental].slice(-60) : [welcome]);
      } catch {
        setMessages([welcome]);
      }
    };
    loadHistory();
  }, [appUser?.uid, user?.uid, isEs]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async () => {
    const cleanInput = input.trim();
    if (!cleanInput || loading || !appUser) return;
    const userMessage: ChatMessage = { role: 'user', text: cleanInput };
    setMessages(current => [...current, userMessage]);
    setInput('');
    setError('');
    setLoading(true);
    try {
      const response = await getCoachResponse(appUser.uid, cleanInput, messages, 't1ger', language);
      const mentorMessage: ChatMessage = { role: 'model', text: response };
      setMessages(current => [...current, mentorMessage]);
      if (user) {
        await addDoc(collection(db, 'users', appUser.uid, 'coachingSessions'), {
          coachId: 't1ger', schemaVersion: 2, messages: [userMessage, mentorMessage], summary: response.slice(0, 100), timestamp: serverTimestamp(),
        });
      } else {
        const localHistory = [...messages, userMessage, mentorMessage].slice(-60);
        localStorage.setItem(`t1ger_coach_${appUser.uid}`, JSON.stringify(localHistory));
      }
    } catch {
      setError(isEs ? 'No pudimos guardar la respuesta. Inténtalo de nuevo.' : 'We could not save the response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const prompts = isEs
    ? ['¿Cómo defino mi tolerancia al riesgo?', 'Ayúdame a construir un portafolio de tres fondos', 'Explícame el interés compuesto sin exageraciones']
    : ['How do I define my risk tolerance?', 'Help me build a three-fund portfolio', 'Explain compound growth without hype'];

  return (
    <main className="t1ger-mission-shell absolute inset-0 z-50 flex flex-col overflow-hidden">
      <header className="flex items-center gap-3 border-b border-white/7 px-4 pb-3 pt-[calc(.85rem+env(safe-area-inset-top))]">
        <button onClick={() => setActiveView('learn')} className="t1ger-icon-button" aria-label={isEs ? 'Volver' : 'Back'}><ArrowLeft size={19} /></button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--t1ger-orange)] text-[#102622]"><Bot size={20} /></div>
        <div className="min-w-0 flex-1"><h1 className="text-sm font-semibold text-white">T1GER Mentor</h1><p className="text-[11px] text-[#6F918A]">{isEs ? 'Mentor educativo' : 'Educational mentor'}</p></div>
        <span className="rounded-lg bg-[#3FC78E]/10 px-2 py-1 text-[10px] font-semibold text-[#78DDB0]">{isEs ? 'Disponible' : 'Available'}</span>
      </header>

      <section className="flex-1 overflow-y-auto px-4 py-5" aria-live="polite">
        {messages.length <= 1 && <div className="mb-6"><p className="t1ger-kicker">{isEs ? 'Prueba una pregunta' : 'Try a question'}</p><div className="mt-3 flex flex-wrap gap-2">{prompts.map(prompt => <button key={prompt} onClick={() => setInput(prompt)} className="rounded-xl border border-white/8 bg-white/[.035] px-3 py-2 text-left text-xs leading-5 text-[#A4BDB7] hover:border-[var(--t1ger-orange)]/35">{prompt}</button>)}</div></div>}
        <div className="space-y-4">
          {messages.map((message, index) => <motion.div key={`${message.role}-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[86%] rounded-[1.3rem] px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'rounded-br-md bg-[var(--t1ger-orange)] text-[#102622]' : 'rounded-bl-md border border-white/7 bg-[#0B2925] text-[#C6D9D5]'}`}>{message.text}</div></motion.div>)}
          {loading && <div className="flex justify-start"><div className="flex gap-1.5 rounded-[1.3rem] rounded-bl-md border border-white/7 bg-[#0B2925] px-4 py-4"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--t1ger-orange)]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--t1ger-orange)] [animation-delay:120ms]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--t1ger-orange)] [animation-delay:240ms]" /></div></div>}
          <div ref={endRef} />
        </div>
      </section>

      <footer className="border-t border-white/7 bg-[#071C19]/96 px-4 pb-[calc(.8rem+env(safe-area-inset-bottom))] pt-3">
        {error && <p role="alert" className="mb-2 text-center text-xs text-[#F0AAA6]">{error}</p>}
        <div className="flex items-end gap-2 rounded-[1.15rem] border border-white/10 bg-white/[.04] p-2 focus-within:border-[var(--t1ger-orange)]/60">
          <textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }} rows={1} className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-5 text-white outline-none placeholder:text-[#567A72]" placeholder={isEs ? 'Pregunta sobre una decisión…' : 'Ask about a decision…'} aria-label={isEs ? 'Mensaje al mentor' : 'Message the mentor'} />
          <button disabled={!input.trim() || loading} onClick={send} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--t1ger-orange)] text-[#102622] disabled:opacity-30" aria-label={isEs ? 'Enviar' : 'Send'}><Send size={17} /></button>
        </div>
        <p className="mt-2 text-center text-[10px] text-[#4F7169]">{isEs ? 'Educación, no asesoría financiera.' : 'Education, not financial advice.'}</p>
      </footer>
    </main>
  );
};
