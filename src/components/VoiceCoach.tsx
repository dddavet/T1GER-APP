import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Bot } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const VoiceCoach = () => {
  const { appUser } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const nicheDescription = appUser ? `${appUser.niche}` : 'General Business';

  const startVoiceSession = async () => {
    setIsListening(true);
    audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      callbacks: {
        onopen: () => {
          console.log("Live session opened");
          // Start streaming audio from microphone
          const source = audioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
          const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
          source.connect(processor);
          processor.connect(audioContextRef.current!.destination);
          
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            // Convert to base64 PCM 16kHz
            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              pcmData[i] = inputData[i] * 32767;
            }
            const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
            sessionPromise.then((session) =>
              session.sendRealtimeInput({
                audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
              }));
          };
        },
        onmessage: async (message: any) => {
          // Handle audio output
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio) {
            // ... decode and play audio ...
            const audioData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
            const audioBuffer = await audioContextRef.current!.decodeAudioData(audioData.buffer);
            const source = audioContextRef.current!.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current!.destination);
            source.start();
          }
        },
        onerror: (error) => console.error(error),
        onclose: () => console.log("Live session closed"),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
        },
        systemInstruction: `You are a personalized AI mentor for a user in the ${nicheDescription} space.
        Their primary 90-day goal is: "${appUser?.goal || 'Not set'}".
        Their current level is ${appUser?.level || 1} and they have ${appUser?.xp || 0} XP.
        Their current streak is ${appUser?.streak || 0} days.
        Provide personalized, aggressive, and highly actionable strategic advice.
        Be unique, supportive, and push them to achieve their goals.`,
      },
    });
    sessionRef.current = sessionPromise;
  };

  const stopVoiceSession = () => {
    setIsListening(false);
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close());
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  return (
    <button
      onClick={isListening ? stopVoiceSession : startVoiceSession}
      className={`p-4 rounded-full ${isListening ? 'bg-red-500' : 'bg-[#FF6B00]'} text-white`}
    >
      {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
    </button>
  );
};
