import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Utensils,
  Sparkles,
  Zap,
  Moon,
  Sun,
  Award,
  Flame,
  ChevronRight,
  Sliders,
  Smile,
  ShieldCheck,
  RefreshCw,
  Gamepad2,
  FlaskConical,
  ShowerHead,
  Droplets,
  Trophy,
  Smartphone,
  BookOpen,
  Target
} from 'lucide-react';
import { useBrain } from '../../contexts/BrainContext';
import { useT1ger } from '../../contexts/T1gerContext';
import { useAuth } from '../../contexts/AuthContext';
import { LivingT1gerPet } from './LivingT1gerPet';
import { PouAudio } from '../../services/pouAudioService';
import { AndroidScreenTimeService } from '../../services/androidScreenTimeService';
import { calculatePetVitalsWithDecay } from '../../services/petEngine';
import { ScreenTimeFreedomModal } from '../ScreenTimeFreedomModal';
import { T1gerVitalsSettingsModal } from './T1gerVitalsSettingsModal';
import { T1gerCoinCatcherGame } from './games/T1gerCoinCatcherGame';
import { T1gerResuscitationModal } from './T1gerResuscitationModal';
import { BlackMarket } from '../BlackMarket';

interface T1gerPetHeroProps {
  onStartLesson?: () => void;
}

type PouRoom = 'kitchen' | 'bath' | 'lab' | 'game' | 'bedroom';

interface FoodItem {
  id: string;
  emoji: string;
  name: string;
  nutrition: number;
  xp: number;
}

const FOOD_ITEMS: FoodItem[] = [
  { id: 'steak', emoji: '🥩', name: 'Carne Táctica', nutrition: 35, xp: 20 },
  { id: 'burger', emoji: '🍔', name: 'Burger de Oro', nutrition: 50, xp: 30 },
  { id: 'berries', emoji: '🍇', name: 'Bayas de Foco', nutrition: 25, xp: 15 },
  { id: 'book', emoji: '📚', name: 'Tomo de Saber', nutrition: 45, xp: 40 },
  { id: 'crystal', emoji: '💎', name: 'Cristal Titán', nutrition: 100, xp: 75 },
];

const POTIONS = [
  { id: 'detox', emoji: '🧪', name: 'Poción Detox Dopamina', desc: 'Cura 100% daño de pantalla', cost: 30 },
  { id: 'energy', emoji: '⚡', name: 'Elixir de Enfoque Profundo', desc: 'Recarga energía al 100%', cost: 40 },
  { id: 'beast', emoji: '🔥', name: 'Sérum Titán Apex', desc: 'Activa Modo Bestia 24h', cost: 60 },
];

export const T1gerPetHero: React.FC<T1gerPetHeroProps> = ({ onStartLesson }) => {
  const { petState, feedPet, language, brainState } = useBrain();
  const { stats, addXP, addCoins, setActiveView } = useT1ger();
  const { appUser } = useAuth();
  const isEs = language === 'es';

  const [activeRoom, setActiveRoom] = useState<PouRoom>('kitchen');
  const [isLightsOff, setIsLightsOff] = useState(false);

  // Bathroom State (Interactive Soap & Shower)
  const [activeTool, setActiveTool] = useState<'soap' | 'shower' | null>('soap');
  const [soapSuds, setSoapSuds] = useState<{ id: number; x: number; y: number }[]>([]);
  const [waterStreams, setWaterStreams] = useState<{ id: number; x: number; y: number }[]>([]);
  const [dirtLevel, setDirtLevel] = useState(0);

  // Kitchen State
  const [eatingAnimation, setEatingAnimation] = useState(false);
  const [floatingRewards, setFloatingRewards] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  // Modals
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isScreenTimeModalOpen, setIsScreenTimeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isResuscitationModalOpen, setIsResuscitationModalOpen] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  // Real-time Tri-Vitals from Engine
  const liveVitals = calculatePetVitalsWithDecay(petState);
  const report = AndroidScreenTimeService.getReport();
  const screenTimeHours = report.totalHours;
  const userLevel = Math.max(1, Math.floor((stats?.xp || 0) / 100) + 1);
  const evolutionStage: 1 | 2 | 3 | 4 = userLevel >= 30 ? 4 : userLevel >= 15 ? 3 : userLevel >= 5 ? 2 : 1;

  const isApexMode = liveVitals.health >= 80 && liveVitals.hunger >= 80 && liveVitals.energy >= 70;

  const evolutionTitles = {
    1: isEs ? 'Cachorro Inversor' : 'Investor Cub',
    2: isEs ? 'Operador Táctico' : 'Tactical Operator',
    3: isEs ? 'Alpha de Negocios' : 'Business Alpha',
    4: isEs ? 'Titán Obsidiana' : 'Obsidian Titan',
  };

  // Sync dirt level from screen time excess
  useEffect(() => {
    const limitHours = (petState.dailyScreenTimeLimitMinutes || 90) / 60;
    if (screenTimeHours > limitHours) {
      setDirtLevel(Math.min(100, Math.round(((screenTimeHours - limitHours) / 2) * 100)));
    } else {
      setDirtLevel(0);
    }
  }, [screenTimeHours, petState.dailyScreenTimeLimitMinutes]);

  // ACTION: Feed T1GER
  const handleFeedFood = (food: FoodItem) => {
    setEatingAnimation(true);
    PouAudio.playEatBite();
    feedPet(food.nutrition);
    addXP(food.xp);

    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([25, 35, 25]);
    }

    const newReward = {
      id: Date.now(),
      text: `+${food.nutrition} HP · +${food.xp} XP`,
      x: 100 + (Math.random() * 40 - 20),
      y: 80,
    };
    setFloatingRewards((prev) => [...prev.slice(-3), newReward]);

    setTimeout(() => {
      setEatingAnimation(false);
    }, 700);
  };

  // ACTION: Bathroom Pointer Scrubbing
  const handlePetAreaPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeRoom === 'bath') {
      if (activeTool === 'soap') {
        PouAudio.playScrubSound();
        if (Math.random() > 0.4) {
          setSoapSuds((prev) => [...prev.slice(-18), { id: Date.now() + Math.random(), x, y }]);
        }
      } else if (activeTool === 'shower') {
        PouAudio.playShowerStream();
        setWaterStreams((prev) => [...prev.slice(-12), { id: Date.now() + Math.random(), x, y }]);
        setSoapSuds((prev) => prev.filter((sud) => Math.hypot(sud.x - x, sud.y - y) > 35));
        setDirtLevel((prev) => Math.max(0, prev - 4));
      }
    }
  };

  // ACTION: Drink Potion
  const handleDrinkPotion = (potion: typeof POTIONS[0]) => {
    PouAudio.playDrinkPotion();
    addXP(25);
    if (potion.id === 'detox') {
      setDirtLevel(0);
      setSoapSuds([]);
    }
    const newReward = {
      id: Date.now(),
      text: `✨ ${potion.name}`,
      x: 100,
      y: 70,
    };
    setFloatingRewards((prev) => [...prev.slice(-2), newReward]);
  };

  // ACTION: Toggle Lamp
  const handleToggleLamp = () => {
    PouAudio.playLampSwitch();
    setIsLightsOff((prev) => !prev);
  };

  return (
    <div className="w-full max-w-lg mx-auto select-none font-sans space-y-2.5">
      {/* 1. THE TRI-VITALS LIVE DASHBOARD (VIDA · HAMBRE · ENERGÍA) */}
      <div className="relative rounded-[1.85rem] border border-white/10 bg-[#121216]/80 p-1.5 shadow-[0_20px_45px_rgba(0,0,0,0.7)] backdrop-blur-3xl overflow-hidden">
        {/* Subtle animated background mesh */}
        <div className="absolute inset-0 z-0 opacity-20 mix-blend-screen pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(255,115,0,0.15), transparent 70%)' }} />
        
        <div className="relative z-10 rounded-[1.45rem] border border-white/[0.06] bg-black/40 p-3 space-y-2.5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          {/* Header Status & Apex Badge */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] font-black uppercase tracking-wider text-zinc-400">
                {isEs ? 'LA TRINIDAD DEL T1GER' : 'T1GER TRI-VITALS'}
              </span>
              {isApexMode && (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-[var(--ob-accent)]/20 border border-amber-500/40 font-mono text-[8px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1 animate-pulse">
                  <Flame size={10} /> {isEs ? 'MODO APEX ACTIVO' : 'APEX BEAST ACTIVE'}
                </span>
              )}
              {(liveVitals.isDeadOrCritical || liveVitals.health <= 10) && (
                <button
                  onClick={() => setIsResuscitationModalOpen(true)}
                  className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/50 font-mono text-[8px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1 animate-bounce cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                >
                  <span>🚨 {isEs ? '¡ESTADO CRÍTICO! RESUCITAR' : 'CRITICAL! RESUSCITATE'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMarketOpen(true)}
                className="p-1.5 rounded-lg text-yellow-500 hover:text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 transition-colors cursor-pointer flex items-center gap-1"
                title={isEs ? 'Mercado Negro' : 'Black Market'}
              >
                <Sparkles size={12} />
              </button>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                title={isEs ? 'Ajustes de Vitalidad' : 'Vitals Settings'}
              >
                <Sliders size={12} />
              </button>
            </div>
          </div>

          {/* 3 Interactive Liquid Vitals Bars */}
          <div className="grid grid-cols-3 gap-2">
            {/* 1. ❤️ VIDA (Screen Time) */}
            <button
              onClick={() => setIsScreenTimeModalOpen(true)}
              className="relative p-2.5 rounded-[1rem] bg-[#1a1a20]/60 hover:bg-[#22222a]/80 border border-white/6 hover:border-white/15 text-left transition-all cursor-pointer group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-12 h-12 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-colors" />
              <div className="relative z-10 flex items-center justify-between text-[10px] font-mono">
                <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <Heart size={12} className="fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                  <span>{isEs ? 'VIDA' : 'HEALTH'}</span>
                </span>
                <span className="font-black text-white tabular-nums tracking-tighter">{liveVitals.health}%</span>
              </div>
              <div className="relative z-10 w-full h-1.5 rounded-full bg-black/50 mt-2 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${liveVitals.health}%` }}
                  transition={{ type: 'spring', bounce: 0, duration: 1 }}
                  className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-rose-600 to-pink-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                />
              </div>
              <span className="relative z-10 block text-[8px] text-zinc-500 font-mono mt-1.5 truncate uppercase tracking-wider">
                {isEs ? 'Tiempo Pantalla' : 'Screen Time'}
              </span>
            </button>

            {/* 2. 🍖 HAMBRE / NUTRICIÓN (Tanto Aprendas) */}
            <button
              onClick={onStartLesson}
              className="relative p-2.5 rounded-[1rem] bg-[#1a1a20]/60 hover:bg-[#22222a]/80 border border-white/6 hover:border-white/15 text-left transition-all cursor-pointer group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors" />
              <div className="relative z-10 flex items-center justify-between text-[10px] font-mono">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Utensils size={12} className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  <span>{isEs ? 'HAMBRE' : 'HUNGER'}</span>
                </span>
                <span className="font-black text-white tabular-nums tracking-tighter">{liveVitals.hunger}%</span>
              </div>
              <div className="relative z-10 w-full h-1.5 rounded-full bg-black/50 mt-2 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${liveVitals.hunger}%` }}
                  transition={{ type: 'spring', bounce: 0, duration: 1 }}
                  className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-amber-600 to-[var(--ob-accent)] shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                />
              </div>
              <span className="relative z-10 block text-[8px] text-zinc-500 font-mono mt-1.5 truncate uppercase tracking-wider">
                {isEs ? 'XP Lecciones' : 'Learn XP'}
              </span>
            </button>

            {/* 3. ⚡ ENERGÍA TÁCTICA (Tanto Expliques / Apliques) */}
            <button
              onClick={() => setActiveView('build')}
              className="relative p-2.5 rounded-[1rem] bg-[#1a1a20]/60 hover:bg-[#22222a]/80 border border-white/6 hover:border-white/15 text-left transition-all cursor-pointer group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
              <div className="relative z-10 flex items-center justify-between text-[10px] font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Zap size={12} className="fill-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span>{isEs ? 'ENERGÍA' : 'ENERGY'}</span>
                </span>
                <span className="font-black text-white tabular-nums tracking-tighter">{liveVitals.energy}%</span>
              </div>
              <div className="relative z-10 w-full h-1.5 rounded-full bg-black/50 mt-2 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${liveVitals.energy}%` }}
                  transition={{ type: 'spring', bounce: 0, duration: 1 }}
                  className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                />
              </div>
              <span className="relative z-10 block text-[8px] text-zinc-500 font-mono mt-1.5 truncate uppercase tracking-wider">
                {isEs ? 'Ejecución' : 'Execution'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MASTER POU SANCTUARY HARDWARE CHASSIS */}
      <div className="rounded-[1.85rem] border border-white/12 bg-[#121216]/95 p-1.5 shadow-[0_20px_45px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
        <div
          className={`relative rounded-[1.45rem] border border-white/[0.08] overflow-hidden p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-500 ${
            isLightsOff
              ? 'bg-[#040407]'
              : activeRoom === 'bath'
              ? 'bg-gradient-to-b from-[#09090B] to-[#0A161E]'
              : activeRoom === 'lab'
              ? 'bg-gradient-to-b from-[#09090B] to-[#140A1E]'
              : 'bg-[#09090B]'
          }`}
        >
          {/* Top Bar: Evolution Phase Badge & 5 POU Rooms Switcher */}
          <div className="flex items-center justify-between border-b border-white/6 pb-2.5">
            {/* Left: Evolution Status */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-[var(--ob-accent)] text-black font-black text-xs shadow-md">
                🐾
              </div>
              <div>
                <span className="font-mono text-[8px] uppercase font-black text-[var(--ob-accent)] tracking-widest block">
                  {isEs ? `FASE ${evolutionStage} · EVOLUCIÓN` : `PHASE ${evolutionStage} · EVOLUTION`}
                </span>
                <span className="text-xs font-black text-white">{evolutionTitles[evolutionStage]}</span>
              </div>
            </div>

            {/* Right: 5 Pou Room Tabs (Kitchen, Bath, Lab, Game, Bedroom) */}
            <div className="flex items-center gap-0.5 bg-[#09090B] p-1 rounded-xl border border-white/[0.08] relative">
              {[
                { id: 'kitchen', icon: '🍖', color: 'bg-[var(--ob-accent)]', label: isEs ? 'Cocina' : 'Kitchen' },
                { id: 'bath', icon: '🧼', color: 'bg-cyan-400', label: isEs ? 'Baño' : 'Bath' },
                { id: 'lab', icon: '🧪', color: 'bg-purple-400', label: isEs ? 'Laboratorio' : 'Laboratory' },
                { id: 'game', icon: '🎮', color: 'bg-emerald-400', label: isEs ? 'Juegos' : 'Game Room' },
                { id: 'bedroom', icon: '🛏️', color: 'bg-amber-400', label: isEs ? 'Dormitorio' : 'Bedroom' },
              ].map((room) => (
                <button
                  key={room.id}
                  onClick={() => { setActiveRoom(room.id as PouRoom); if (isLightsOff && room.id !== 'bedroom') setIsLightsOff(false); }}
                  className="relative px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer z-10 flex items-center justify-center group"
                  title={room.label}
                >
                  {activeRoom === room.id && (
                    <motion.div
                      layoutId="activeRoomPill"
                      className={`absolute inset-0 rounded-lg ${room.color} shadow-sm z-0`}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className={`relative z-10 ${activeRoom === room.id ? 'text-black' : 'text-zinc-500 group-hover:text-zinc-300'} transition-colors filter drop-shadow-sm`}>
                    {room.icon}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. MASTER INTERACTIVE STAGE */}
          <div
            onPointerMove={handlePetAreaPointerMove}
            className="relative py-4 flex flex-col items-center justify-center min-h-[230px] touch-none"
          >
            {/* Lamp Cord for Bedroom Mode */}
            {activeRoom === 'bedroom' && (
              <motion.button
                whileTap={{ y: 8 }}
                onClick={handleToggleLamp}
                className="absolute top-1 right-4 flex flex-col items-center z-30 cursor-pointer group"
                title={isEs ? 'Tirar de la lámpara' : 'Pull lamp'}
              >
                <div className="w-0.5 h-12 bg-zinc-500 group-hover:bg-amber-400 transition" />
                <div className="w-5 h-5 rounded-full bg-amber-400 shadow-[0_0_15px_rgba(255,215,0,0.8)] flex items-center justify-center text-[10px]">
                  💡
                </div>
              </motion.button>
            )}

            {/* The 3D T1GER Mascot */}
            <LivingT1gerPet
              mood={
                isLightsOff
                  ? 'sleeping'
                  : eatingAnimation
                  ? 'eating'
                  : activeRoom === 'bath'
                  ? 'bathing'
                  : activeRoom === 'game'
                  ? 'playing'
                  : 'idle'
              }
              health={liveVitals.health}
              hunger={liveVitals.hunger}
              energy={liveVitals.energy}
              evolutionStage={evolutionStage}
              dirtLevel={dirtLevel}
              isSleeping={isLightsOff}
              equippedAccessories={appUser?.equippedAccessories || []}
            />

            {/* Soap Suds Overlay in Bathroom */}
            {soapSuds.map((sud) => (
              <motion.div
                key={sud.id}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute text-2xl pointer-events-none z-30 filter drop-shadow-md mix-blend-screen"
                style={{ left: sud.x, top: sud.y, transform: 'translate(-50%, -50%)' }}
              >
                🫧
              </motion.div>
            ))}

            {/* Water Spray Particles */}
            {waterStreams.map((stream) => (
              <motion.div
                key={stream.id}
                initial={{ scale: 0.5, y: -10, opacity: 1 }}
                animate={{ scale: 1.5, y: 25, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute text-cyan-400 pointer-events-none z-30 text-xs font-mono drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]"
                style={{ left: stream.x, top: stream.y, transform: 'translate(-50%, -50%)' }}
              >
                💧
              </motion.div>
            ))}
            
            {/* Ambient Room Particles */}
            <AnimatePresence>
              {activeRoom === 'lab' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-purple-500/40 blur-sm mix-blend-screen"
                      initial={{ y: 250, x: 50 + (i * 30), opacity: 0, scale: 0.5 }}
                      animate={{ 
                        y: -50, 
                        x: 50 + (i * 30) + (Math.random() * 40 - 20),
                        opacity: [0, 0.8, 0],
                        scale: [0.5, 1.5, 0.5]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 3 + Math.random() * 2, 
                        delay: i * 0.4,
                        ease: 'easeInOut' 
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Reward / Nutrition Notifications */}
            <AnimatePresence>
              {floatingRewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  initial={{ scale: 0.5, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: -45 }}
                  exit={{ opacity: 0, scale: 0.8, y: -60, filter: 'blur(4px)' }}
                  transition={{ 
                    y: { type: 'spring', stiffness: 200, damping: 20 },
                    opacity: { duration: 0.3 },
                    scale: { type: 'spring', bounce: 0.5 }
                  }}
                  className="absolute pointer-events-none z-40 flex items-center justify-center font-mono text-[10px] font-black text-amber-300 bg-black/80 px-3 py-1.5 rounded-xl border border-amber-500/40 shadow-[0_4px_12px_rgba(245,158,11,0.25)] backdrop-blur-md"
                  style={{ left: `${reward.x}px`, top: `${reward.y}px` }}
                >
                  {reward.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* 4. DYNAMIC POU ROOM TOOLBARS */}
          <div className="border-t border-white/6 pt-3">
            {/* A. KITCHEN: Food Carousel */}
            {activeRoom === 'kitchen' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>{isEs ? 'Despensa Táctica (Toca para comer):' : 'Tactical Pantry (Tap to feed):'}</span>
                  <span className="text-[var(--ob-accent)] font-bold">🍖 +Nutrición</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {FOOD_ITEMS.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => handleFeedFood(food)}
                      className="p-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/6 hover:border-[var(--ob-accent)]/50 flex flex-col items-center gap-0.5 active:scale-90 transition cursor-pointer"
                    >
                      <span className="text-xl">{food.emoji}</span>
                      <span className="text-[8.5px] font-bold text-white truncate w-full text-center">{food.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* B. BATHROOM: Soap Bar & Shower Head Tool Switcher */}
            {activeRoom === 'bath' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>{isEs ? 'Arrastra tu dedo sobre T1GER:' : 'Drag finger over T1GER:'}</span>
                  <span className="text-cyan-400 font-bold">
                    {dirtLevel > 0 ? `⚠️ ${dirtLevel}% ${isEs ? 'Suciedad' : 'Dirty'}` : (isEs ? '✨ 100% Limpio' : '✨ 100% Clean')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveTool('soap')}
                    className={`py-2 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                      activeTool === 'soap'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                        : 'bg-white/[0.03] text-zinc-400 border-white/6'
                    }`}
                  >
                    <span>🧼 {isEs ? 'JABÓN TÁCTICO' : 'SOAP BAR'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTool('shower')}
                    className={`py-2 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                      activeTool === 'shower'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                        : 'bg-white/[0.03] text-zinc-400 border-white/6'
                    }`}
                  >
                    <ShowerHead size={14} />
                    <span>{isEs ? 'REGADERA DE AGUA' : 'SHOWER HEAD'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* C. LABORATORY: Potions */}
            {activeRoom === 'lab' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>{isEs ? 'Laboratorio de Biohacking Táctico:' : 'Biohacking Laboratory:'}</span>
                  <span className="text-purple-400 font-bold">🧪 Elixires</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {POTIONS.map((potion) => (
                    <button
                      key={potion.id}
                      onClick={() => handleDrinkPotion(potion)}
                      className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 flex flex-col items-center gap-1 active:scale-95 transition cursor-pointer text-left"
                    >
                      <span className="text-xl">{potion.emoji}</span>
                      <span className="text-[9.5px] font-bold text-white leading-tight text-center">{potion.name}</span>
                      <span className="text-[8px] font-mono text-purple-300 text-center">{potion.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* D. GAME ROOM: Launch Arcade Minigames */}
            {activeRoom === 'game' && (
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setIsGameModalOpen(true)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-mono text-xs font-black flex items-center justify-center gap-1.5 shadow-[0_0_18px_rgba(16,185,129,0.35)] active:scale-95 transition cursor-pointer"
                >
                  <Gamepad2 size={15} />
                  <span>{isEs ? 'JUGAR: LLUVIA DE CAPITAL 🪙' : 'PLAY: MARKET RUSH 🪙'}</span>
                </button>
              </div>
            )}

            {/* E. BEDROOM: Light Lamp Toggle */}
            {activeRoom === 'bedroom' && (
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handleToggleLamp}
                  className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer ${
                    isLightsOff
                      ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(255,215,0,0.5)]'
                      : 'bg-white/10 text-white border border-white/15'
                  }`}
                >
                  {isLightsOff ? (
                    <span>☀️ {isEs ? 'ENCENDER LUZ (DESPERTAR)' : 'TURN ON LIGHTS'}</span>
                  ) : (
                    <span>🌙 {isEs ? 'APAGAR LUZ (RECARGAR ENERGÍA)' : 'TURN OFF LIGHTS & SLEEP'}</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MINIGAME MODAL */}
      <T1gerCoinCatcherGame
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
        onReward={(coins, xp) => {
          addCoins(coins);
          addXP(xp);
          if (typeof window !== 'undefined' && window.navigator.vibrate) {
            window.navigator.vibrate([30, 50, 30]);
          }
        }}
        isEs={isEs}
      />

      <ScreenTimeFreedomModal
        isOpen={isScreenTimeModalOpen}
        onClose={() => setIsScreenTimeModalOpen(false)}
      />
      <T1gerVitalsSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
      <T1gerResuscitationModal
        isOpen={isResuscitationModalOpen}
        onClose={() => setIsResuscitationModalOpen(false)}
        onRevive={() => {
          feedPet(35);
          addXP(50);
          setIsResuscitationModalOpen(false);
        }}
        isEs={isEs}
      />

      <AnimatePresence>
        {isMarketOpen && <BlackMarket onClose={() => setIsMarketOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};
