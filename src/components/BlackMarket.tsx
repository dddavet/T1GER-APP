import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Coins, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface BlackMarketProps {
  onClose: () => void;
}

interface MarketItem {
  id: string;
  name: string;
  type: 'head' | 'eyes' | 'neck';
  cost: number;
  emoji: string;
  description: string;
  color: string;
}

const MARKET_ITEMS: MarketItem[] = [
  {
    id: 'crown',
    name: 'Corona del Titán',
    type: 'head',
    cost: 5000,
    emoji: '👑',
    description: 'Símbolo del Alpha. Reservado para los más disciplinados.',
    color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
  },
  {
    id: 'cyber_glasses',
    name: 'Visor Cyberpunk',
    type: 'eyes',
    cost: 1500,
    emoji: '🕶️',
    description: 'Filtra el ruido, aumenta el enfoque. Diseño neo-tokyo.',
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
  },
  {
    id: 'cap',
    name: 'Gorra de Hacker',
    type: 'head',
    cost: 500,
    emoji: '🧢',
    description: 'Modo incógnito para largas noches de código.',
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  },
  {
    id: 'gold_chain',
    name: 'Cadena de Oro',
    type: 'neck',
    cost: 2500,
    emoji: '⛓️',
    description: 'Puro estilo. Demuestra que el negocio es rentable.',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
  },
  {
    id: 'founder_tie',
    name: 'Corbata de Corporate',
    type: 'neck',
    cost: 800,
    emoji: '👔',
    description: 'Listo para cerrar tratos High-Ticket y rondas de semilla.',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  }
];

export const BlackMarket: React.FC<BlackMarketProps> = ({ onClose }) => {
  const { appUser, updateAppUser } = useAuth();

  const coins = appUser?.coins || 0;
  const unlocked = appUser?.unlockedAccessories || [];
  const equipped = appUser?.equippedAccessories || [];

  const handlePurchase = async (item: MarketItem) => {
    if (coins < item.cost) return;
    if (unlocked.includes(item.id)) return;

    if (updateAppUser) {
      await updateAppUser({
        coins: coins - item.cost,
        unlockedAccessories: [...unlocked, item.id],
      });
    }
  };

  const toggleEquip = async (item: MarketItem) => {
    if (!unlocked.includes(item.id)) return;

    if (updateAppUser) {
      let nextEquipped = equipped.filter(id => {
        const existingItem = MARKET_ITEMS.find(i => i.id === id);
        return existingItem?.type !== item.type;
      });

      if (equipped.includes(item.id)) {
        nextEquipped = equipped.filter(id => id !== item.id);
      } else {
        nextEquipped.push(item.id);
      }

      await updateAppUser({
        equippedAccessories: nextEquipped
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#09090b] text-white flex flex-col p-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,115,0,0.1),transparent_50%)] pointer-events-none" />

      <header className="flex items-center justify-between z-10 w-full mb-6 pt-safe">
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-mono text-[var(--ob-accent)] uppercase tracking-widest leading-none">T1GER Store</span>
          <span className="text-xs font-black uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Mercado Negro
          </span>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-inner">
          <Coins size={14} className="text-yellow-400" />
          <span className="text-xs font-mono font-bold text-yellow-500">{coins}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-3 pb-safe z-10 hide-scrollbar">
        {MARKET_ITEMS.map((item) => {
          const isOwned = unlocked.includes(item.id);
          const isEquipped = equipped.includes(item.id);
          const isAffordable = coins >= item.cost;

          return (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white/5 backdrop-blur-xl rounded-2xl p-4 border transition-all ${
                isEquipped ? 'border-[var(--ob-accent)]/50 shadow-[0_0_15px_rgba(255,115,0,0.15)]' : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center border text-2xl ${item.color}`}>
                    {item.emoji}
                  </div>
                  <div className="flex flex-col pt-0.5">
                    <h4 className="text-[12px] font-black uppercase tracking-wide leading-tight">{item.name}</h4>
                    <span className="text-[10px] text-white/50 leading-snug mt-1">{item.description}</span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  {isOwned ? (
                    <button
                      onClick={() => toggleEquip(item)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        isEquipped 
                          ? 'bg-[var(--ob-accent)]/20 text-[var(--ob-accent)] border border-[var(--ob-accent)]/30' 
                          : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {isEquipped ? 'Puesto' : 'Equipar'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item)}
                      disabled={!isAffordable}
                      className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                        isAffordable 
                          ? 'bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg cursor-pointer' 
                          : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                      }`}
                    >
                      <Coins size={11} />
                      <span>{item.cost}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
