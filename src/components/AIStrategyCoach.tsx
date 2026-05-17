import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Loader2, ThumbsUp, ThumbsDown, Mic, MicOff, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { getAi, generateSpeech } from '../services/gemini';
import { NICHES } from '../pages/Onboarding';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const AIStrategyCoach = () => {
  const { appUser } = useAuth();
  const [messages, setMessages] = useState<{ id: string, role: 'user' | 'assistant', content: string, rating?: 'up' | 'down' }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const conversationId = React.useRef(crypto.randomUUID());

  const nicheDetails = NICHES.find(n => n.id === appUser?.niche);
  const nicheDescription = nicheDetails ? `${nicheDetails.title}: ${nicheDetails.desc}` : appUser?.niche || 'General Business';

  useEffect(() => {
    setMessages([{ id: crypto.randomUUID(), role: 'assistant', content: `Hey, I'm your T1GER Co-Founder. You're focused on ${nicheDescription} with a goal of ${appUser?.goal}. How are you applying your mission today? Let's get aggressive.` }]);
  }, [appUser]);

  const playAudio = async (base64Audio: string) => {
    setIsSpeaking(true);
    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
    audio.onended = () => setIsSpeaking(false);
    await audio.play();
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = text;
    setInput('');
    const userMessageId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: userMessageId, role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const model = getAi().getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are a 24/7 Co-Founder for a user in the ${nicheDescription} space.
        Their primary 90-day goal is: "${appUser.goal}".
        
        User Context:
        - Level: ${appUser.level}
        - XP: ${appUser.xp}
        - Current Streak: ${appUser.streak} days
        
        The user says: "${userMessage}". 
        
        Provide personalized, aggressive, and highly actionable strategic advice. Your advice MUST be directly tied to their niche (${nicheDescription}) and their 90-day goal (${appUser.goal}).
        
        CRITICAL: Every action item you provide MUST be SMART (Specific, Measurable, Achievable, Relevant, Time-bound).
        You MUST include a concrete deadline or duration for every action item.
        
        Format each action item exactly like this:
        "Action: [Specific, actionable task] | Deadline/Duration: [Concrete timeframe, e.g., 'by 5 PM today', 'spend 45 minutes'] | Metric for Success: [Measurable outcome]"
        
        Example of a good action item:
        "Action: Draft 3 outreach emails to potential partners | Deadline/Duration: Complete in 30 minutes | Metric for Success: 3 emails drafted and ready to send"`;
        
      const result = await model.generateContent(prompt);
      const assistantContent = result.response.text() || '...';
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: assistantContent }]);
      
      // Speech Synthesis
      const base64Audio = await generateSpeech(assistantContent);
      if (base64Audio) {
        await playAudio(base64Audio);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
      sendMessage(transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleRateMessage = async (messageId: string, rating: 'up' | 'down') => {
    if (!appUser) return;
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, rating } : m));
    try {
      await addDoc(collection(db, 'users', appUser.uid, 'aiResponseRatings'), {
        conversationId: conversationId.current,
        messageId,
        rating,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (!appUser) return null;

  return (
    <div className="bg-[#050505] border border-zinc-800 rounded-3xl p-6 h-[500px] flex flex-col">
      <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
        <Bot className="w-8 h-8 text-[#FF6B00]" />
        <h2 className="text-xl font-black text-white font-sans uppercase">AI Strategy Coach</h2>
      </div>

      <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-xl mb-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-zinc-400 mb-1">
            <span>Level {appUser.level}</span>
            <span>{appUser.xp % 100} / 100 XP</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF6B00]"
              style={{ width: `${(appUser.xp % 100)}%` }}
            />
          </div>
        </div>
        <div className="text-center pl-4 border-l border-zinc-800">
          <div className="text-2xl font-black text-white">{appUser.streak}</div>
          <div className="text-[10px] text-zinc-500 uppercase">Day Streak</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-zinc-800 ml-auto' : 'bg-zinc-900'} max-w-[80%]`}>
            <p className="text-sm text-white font-sans">{msg.content}</p>
            {msg.role === 'assistant' && (
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => handleRateMessage(msg.id, 'up')}
                  className={`p-1 rounded ${msg.rating === 'up' ? 'text-[#FF6B00]' : 'text-zinc-600 hover:text-zinc-400'}`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleRateMessage(msg.id, 'down')}
                  className={`p-1 rounded ${msg.rating === 'down' ? 'text-[#FF6B00]' : 'text-zinc-600 hover:text-zinc-400'}`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
        {loading && <Loader2 className="w-6 h-6 text-[#FF6B00] animate-spin" />}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white font-mono text-sm"
          placeholder="Ask for strategy..."
        />
        <button 
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-3 rounded-xl ${isRecording ? 'bg-red-500' : 'bg-zinc-800'} hover:bg-zinc-700`}
        >
          {isRecording ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
        </button>
        <button onClick={() => sendMessage(input)} className="bg-[#FF6B00] p-3 rounded-xl hover:bg-[#e66000]">
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};
