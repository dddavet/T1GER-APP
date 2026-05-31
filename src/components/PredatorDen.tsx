import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Coins, Sparkles, Monitor, Leaf, 
  Tv, Compass, Check, Lock 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useT1ger } from '../contexts/T1gerContext';

interface PredatorDenProps {
  onClose: () => void;
}

interface DenItem {
  id: string;
  name: string;
  category: string;
  cost: number;
  icon: any;
  glowColor: string;
  description: string;
  visualPosition: string; // Tailwind absolute coordinates for the visual room representation
}

const DEN_ITEMS: DenItem[] = [
  {
    id: 'monitor',
    name: 'Curved Cyberpunk Monitor',
    category: 'Workstation',
    cost: 200,
    icon: Monitor,
    glowColor: 'shadow-[0_0_20px_rgba(96,165,250,0.5)] border-blue-400',
    description: 'Pantalla curva ultrawide de 49" con matrices cuánticas activas para ver flujos de datos en tiempo real.',
    visualPosition: 'top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2'
  },
  {
    id: 'bonsai',
    name: 'Bonsái Zen Fluorescente',
    category: 'Wellness',
    cost: 150,
    icon: Leaf,
    glowColor: 'shadow-[0_0_20px_rgba(16,185,129,0.5)] border-green-400',
    description: 'Árbol bonsái genéticamente modificado para absorber toxinas electromagnéticas y brillar en la oscuridad.',
    visualPosition: 'top-[38%] left-[20%] -translate-x-1/2'
  },
  {
    id: 'rgb',
    name: 'Tira de Luces RGB HSL',
    category: 'Atmosphere',
    cost: 100,
    icon: Tv,
    glowColor: 'shadow-[0_0_20px_rgba(236,72,153,0.5)] border-pink-400',
    description: 'Luminarias de espectro cromático completo que parpadean según tus pulsaciones cardíacas y enfoque.',
    visualPosition: 'top-[20%] left-[0] right-[0]'
  },
  {
    id: 'chair',
    name: 'Silla Ergonómica Alpha',
    category: 'Furniture',
    cost: 250,
    icon: Compass,
    glowColor: 'shadow-[0_0_20px_rgba(204,255,0,0.5)] border-accent',
    description: 'Soporte bio-mimético con cojines de levitación magnética y ajuste térmico automático para sesiones de 12 horas.',
    visualPosition: 'top-[68%] left-[50%] -translate-x-1/2'
  }
];

export const PredatorDen: React.FC<PredatorDenProps> = ({ onClose }) => {
  const { appUser, updateAppUser } = useAuth();
  const { stats } = useT1ger();

  const coins = appUser?.coins || 0;
  const unlockedItems = appUser?.unlockedDenItems || [];

  const handlePurchase = async (item: DenItem) => {
    if (coins < item.cost) return;
    if (unlockedItems.includes(item.id)) return;

    if (updateAppUser) {
      const nextUnlocked = [...unlockedItems, item.id];
      await updateAppUser({
        coins: coins - item.cost,
        unlockedDenItems: nextUnlocked
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#020204] text-white flex flex-col justify-between p-6 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-cyber-grid opacity-5 pointer-events-none" />
      <div className="absolute top-[-20%] -right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] bg-purple-500/10 pointer-events-none" />

      {/* HEADER SECTION */}
      <header className="flex items-center justify-between z-10 w-full">
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Predator Hub</span>
          <span className="text-xs font-black uppercase text-white tracking-wider mt-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" /> El Cubil del Predator
          </span>
        </div>
        
        {/* User Coin Balance */}
        <div className="bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-inner">
          <Coins size={14} className="text-yellow-400" />
          <span className="text-xs font-mono font-bold text-white">{coins}</span>
        </div>
      </header>

      {/* VISUAL ROOM CONTAINER */}
      <div className="flex-1 flex items-center justify-center relative my-4">
        
        {/* The Digital Isometric Workspace Shell */}
        <div className="relative w-full max-w-sm aspect-[4/3] bg-zinc-950/60 border border-white/5 rounded-[2.5rem] shadow-inner overflow-hidden flex items-center justify-center">
          
          {/* Neon strip light glow behind desk */}
          {unlockedItems.includes('rgb') && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute top-0 left-0 right-0 h-4 bg-pink-500/20 blur-md"
            />
          )}

          {/* Isometric Grid Floor line mocks */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.015)_0%,transparent_70%)]" />

          {/* THE DESK (Base representation) */}
          <div className="absolute w-[240px] h-[80px] bg-[#0c0c0e] border border-white/10 rounded-2xl top-[45%] left-[50%] -translate-x-1/2 shadow-2xl flex items-center justify-center">
            
            {/* Keyboard & Mouse Mocks */}
            <div className="w-[100px] h-[12px] bg-zinc-800 rounded-md mt-10 border border-zinc-700 opacity-60" />
            <div className="w-[12px] h-[16px] bg-zinc-800 rounded-full mt-10 ml-6 border border-zinc-700 opacity-60" />
          </div>

          {/* ITEM VISUALIZERS */}
          {/* 1. RGB String visual indicator */}
          {unlockedItems.includes('rgb') && (
            <motion.div 
              className="absolute top-6 left-12 right-12 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_15px_#ec4899] opacity-80"
              animate={{ opacity: [0.6, 0.9, 0.6] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}

          {/* 2. Cyberpunk Curved Monitor */}
          {unlockedItems.includes('monitor') ? (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="absolute top-[33%] left-[50%] -translate-x-1/2 w-[160px] h-[55px] bg-[#08080a] border border-blue-400/50 rounded-xl shadow-[0_0_20px_rgba(96,165,250,0.3)] flex flex-col items-center justify-center p-1.5"
            >
              <div className="w-full h-full bg-blue-500/5 border border-blue-400/20 rounded-lg flex items-center justify-center font-mono text-[7px] text-blue-400 font-bold overflow-hidden">
                <span className="animate-pulse">T1GER_OS v3.2</span>
              </div>
              <div className="w-[16px] h-[12px] bg-zinc-800 mt-0.5 border border-zinc-700" />
            </motion.div>
          ) : (
            <div className="absolute top-[33%] left-[50%] -translate-x-1/2 opacity-10">
              <Monitor size={32} className="text-zinc-500" />
            </div>
          )}

          {/* 3. Zen Bonsai Tree */}
          {unlockedItems.includes('bonsai') ? (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="absolute top-[37%] left-[22%] w-[45px] h-[50px] flex flex-col items-center"
            >
              {/* Bonsai leaves */}
              <div className="w-[36px] h-[26px] bg-green-500/80 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)] border border-green-400/40" />
              {/* Trunk */}
              <div className="w-[4px] h-[12px] bg-amber-900" />
              {/* Pot */}
              <div className="w-[28px] h-[8px] bg-zinc-800 rounded-b-md border border-zinc-700" />
            </motion.div>
          ) : (
            <div className="absolute top-[39%] left-[22%] opacity-10">
              <Leaf size={24} className="text-zinc-500" />
            </div>
          )}

          {/* 4. Ergonomic Alpha Chair */}
          {unlockedItems.includes('chair') ? (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="absolute top-[52%] left-[50%] -translate-x-1/2 w-[72px] h-[90px] flex flex-col items-center relative z-20"
            >
              {/* Backrest */}
              <div className="w-[52px] h-[44px] bg-zinc-950 border border-accent/40 rounded-xl shadow-[0_0_15px_rgba(204,255,0,0.2)] flex items-center justify-center">
                <span className="text-[6px] font-mono font-black text-accent/60">ALPHA</span>
              </div>
              {/* Armrests */}
              <div className="absolute w-[68px] h-[8px] bg-zinc-900 rounded-full top-[38px] border border-zinc-800" />
              {/* Seat */}
              <div className="w-[58px] h-[12px] bg-zinc-900 rounded-lg border border-zinc-800 mt-1 shadow-md" />
              {/* Hydraulic Stand */}
              <div className="w-[6px] h-[22px] bg-zinc-800 mt-0.5 border border-zinc-700" />
              {/* Five star base */}
              <div className="w-[44px] h-[4px] bg-zinc-700 rounded-full" />
            </motion.div>
          ) : (
            <div className="absolute top-[58%] left-[50%] -translate-x-1/2 opacity-10">
              <Compass size={32} className="text-zinc-500" />
            </div>
          )}

          {/* Mascot Alfa Hologram Overlay */}
          <div className="absolute bottom-2 right-4 flex items-center gap-2 bg-black/60 border border-white/5 backdrop-blur-md rounded-2xl p-2.5 z-30">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
            <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-widest font-black">Den Hologram v1</span>
          </div>
        </div>
      </div>

      {/* ACCESSORIES SHOP MARKET */}
      <div className="space-y-4 z-10 w-full max-w-sm mx-auto">
        <div className="flex flex-col">
          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-black px-1">Den Upgrades (Monedas)</span>
          <p className="text-[10px] text-zinc-400 font-medium px-1 mt-0.5">Invierte tus ganancias del Black Market para construir tu oficina de ensueño.</p>
        </div>

        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {DEN_ITEMS.map((item) => {
            const isOwned = unlockedItems.includes(item.id);
            const isAffordable = coins >= item.cost;
            const ItemIcon = item.icon;

            return (
              <div 
                key={item.id}
                className={`liquid-glass rounded-2xl p-4 border border-white/5 flex items-center justify-between transition-all ${
                  isOwned ? 'border-accent/10 opacity-70' : ''
                }`}
              >
                <div className="flex items-center gap-3.5 max-w-[70%]">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                    isOwned ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-white/5 border-white/10 text-zinc-500'
                  }`}>
                    <ItemIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase text-white tracking-tight leading-none">{item.name}</h4>
                    <span className="text-[9px] text-zinc-500 font-medium block mt-1 line-clamp-1">{item.description}</span>
                  </div>
                </div>

                <div>
                  {isOwned ? (
                    <div className="bg-accent/10 text-accent px-2.5 py-1.5 rounded-xl border border-accent/20 flex items-center gap-1">
                      <Check size={10} className="stroke-[3]" />
                      <span className="text-[8px] font-black uppercase tracking-wider">Equipped</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item)}
                      disabled={!isAffordable}
                      className={`px-3 py-1.5 rounded-xl font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                        isAffordable 
                          ? 'bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg' 
                          : 'bg-zinc-900 border border-white/5 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      <Coins size={10} />
                      <span>{item.cost}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
