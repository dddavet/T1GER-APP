import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Zap, X, Play, RefreshCw, Flame } from 'lucide-react';
import { PouAudio } from '../../../services/pouAudioService';

interface CoinCatcherGameProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (coins: number, xp: number) => void;
  isEs: boolean;
}

interface FallingItem {
  id: number;
  x: number; // percentage 5% to 90%
  y: number; // percentage 0% to 100%
  type: 'coin' | 'gem' | 'book' | 'bomb';
  speed: number;
}

export const T1gerCoinCatcherGame: React.FC<CoinCatcherGameProps> = ({
  isOpen,
  onClose,
  onReward,
  isEs,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [tigerX, setTigerX] = useState(50); // percentage 10% to 90%
  const [items, setItems] = useState<FallingItem[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Game Loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const spawnInterval = setInterval(() => {
      const types: Array<'coin' | 'gem' | 'book' | 'bomb'> = ['coin', 'coin', 'coin', 'gem', 'book', 'bomb'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const newItem: FallingItem = {
        id: Date.now() + Math.random(),
        x: Math.random() * 80 + 10,
        y: -10,
        type: randomType,
        speed: Math.random() * 1.5 + 2.5,
      };
      setItems((prev) => [...prev, newItem]);
    }, 650);

    const fallInterval = setInterval(() => {
      setItems((prev) => {
        const nextItems: FallingItem[] = [];
        for (const item of prev) {
          const nextY = item.y + item.speed;

          // Collision Check with T1GER basket at bottom (y ~ 75% to 88%)
          if (nextY >= 75 && nextY <= 88 && Math.abs(item.x - tigerX) < 14) {
            if (item.type === 'bomb') {
              // Hit distraction bomb!
              setGameOver(true);
              setIsPlaying(false);
              if (typeof window !== 'undefined' && window.navigator.vibrate) {
                window.navigator.vibrate([100, 50, 100]);
              }
              continue;
            } else {
              // Caught positive item!
              PouAudio.playCoinChime();
              if (typeof window !== 'undefined' && window.navigator.vibrate) {
                window.navigator.vibrate(15);
              }
              const addPoints = item.type === 'gem' ? 50 : item.type === 'book' ? 30 : 10;
              const addCoinsCount = item.type === 'gem' ? 5 : item.type === 'book' ? 3 : 1;
              setScore((s) => s + addPoints);
              setCoinsEarned((c) => c + addCoinsCount);
              setCombo((comb) => comb + 1);
              continue;
            }
          }

          // If reached ground
          if (nextY < 105) {
            nextItems.push({ ...item, y: nextY });
          }
        }
        return nextItems;
      });
    }, 30);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(fallInterval);
    };
  }, [isPlaying, gameOver, tigerX]);

  // Touch / Mouse Tracking for T1GER position
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!gameAreaRef.current || !isPlaying || gameOver) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const relativeX = ((clientX - rect.left) / rect.width) * 100;
    setTigerX(Math.max(12, Math.min(88, relativeX)));
  };

  const handleStartGame = () => {
    setScore(0);
    setCoinsEarned(0);
    setCombo(0);
    setItems([]);
    setGameOver(false);
    setIsPlaying(true);
    setTigerX(50);
  };

  const handleClaimReward = () => {
    onReward(coinsEarned, score);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-sm rounded-[1.75rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-[0_25px_50px_rgba(0,0,0,0.8)] text-left"
      >
        <div className="rounded-[1.4rem] border border-white/[0.08] bg-[#09090B] overflow-hidden p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/6 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-base">
                🎮
              </div>
              <div>
                <span className="font-mono text-[8.5px] uppercase font-bold text-[var(--ob-accent)] tracking-wider block">
                  {isEs ? 'MINIJUEGO ARCADE POU' : 'POU ARCADE MINIGAME'}
                </span>
                <h3 className="text-xs font-black text-white">
                  {isEs ? 'Lluvia de Capital & Foco' : 'Market Rush'}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white bg-white/5 border border-white/10 transition cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Game Canvas Area */}
          <div
            ref={gameAreaRef}
            onPointerMove={handlePointerMove}
            className="relative w-full h-[280px] rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#09090B] to-[#15151B] overflow-hidden touch-none cursor-crosshair flex flex-col justify-between p-3"
          >
            {/* Top HUD */}
            <div className="flex items-center justify-between text-xs font-mono z-20 pointer-events-none">
              <div className="px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-white font-bold">
                🎯 {score} PTS
              </div>
              {combo > 2 && (
                <div className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black animate-pulse flex items-center gap-1">
                  <Flame size={12} /> {combo}x COMBO
                </div>
              )}
              <div className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold">
                💰 +{coinsEarned}
              </div>
            </div>

            {/* Falling Objects */}
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ scale: 0, opacity: 0, rotate: item.type === 'bomb' ? -30 : 0 }}
                  animate={{ scale: 1, opacity: 1, rotate: item.type === 'bomb' ? 30 : 0 }}
                  exit={{ scale: 0, opacity: 0, filter: 'blur(4px)' }}
                  transition={{ 
                    scale: { type: 'spring', bounce: 0.5, duration: 0.4 },
                    rotate: item.type === 'bomb' ? { repeat: Infinity, duration: 1, ease: 'linear' } : undefined
                  }}
                  className="absolute text-2xl filter drop-shadow-md pointer-events-none"
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {item.type === 'coin'
                    ? '🪙'
                    : item.type === 'gem'
                    ? '💎'
                    : item.type === 'book'
                    ? '📚'
                    : '💣'}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* T1GER Player Basket at Bottom */}
            <div
              className="absolute bottom-2 pointer-events-none transition-all duration-75 flex flex-col items-center z-10"
              style={{
                left: `${tigerX}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <img
                src="/mascot/t1ger-eating.png"
                alt="T1GER"
                className="h-14 w-14 object-contain filter drop-shadow-[0_4px_12px_rgba(255,115,0,0.4)]"
              />
              <div className="h-2 w-12 rounded-full bg-black/50 blur-xs -mt-1" />
            </div>

            {/* Start Screen Overlay */}
            {!isPlaying && !gameOver && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-30 space-y-3">
                <div className="text-4xl animate-bounce">🪙</div>
                <div>
                  <h4 className="text-sm font-black text-white font-mono">
                    {isEs ? '¡Atrapa Monedas y Libros!' : 'Catch Coins & Books!'}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1 max-w-[220px]">
                    {isEs
                      ? 'Desliza a T1GER para recolectar activos y esquiva las bombas de distracción.'
                      : 'Slide T1GER to collect real assets and dodge doomscroll bombs.'}
                  </p>
                </div>
                <button
                  onClick={handleStartGame}
                  className="px-6 py-2.5 rounded-xl bg-[var(--ob-accent)] text-black font-mono text-xs font-black shadow-[0_0_18px_rgba(255,115,0,0.4)] active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Play size={14} className="fill-current" />
                  <span>{isEs ? 'JUGAR AHORA' : 'PLAY NOW'}</span>
                </button>
              </div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-30 space-y-3">
                <div className="text-3xl">💥</div>
                <div>
                  <h4 className="text-sm font-black text-rose-400 font-mono">
                    {isEs ? '¡Caíste en la Distracción!' : 'Distraction Hit!'}
                  </h4>
                  <p className="text-xs font-bold text-white mt-1">
                    {isEs ? 'Puntaje Final:' : 'Final Score:'}{' '}
                    <span className="text-amber-400 font-mono">{score} PTS</span>
                  </p>
                  <p className="text-[11px] text-emerald-400 font-mono">
                    +{coinsEarned} {isEs ? 'Monedas Virtuales Ganadas' : 'Coins Won'}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full max-w-[220px]">
                  <button
                    onClick={handleStartGame}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold border border-white/15 active:scale-95 transition cursor-pointer"
                  >
                    {isEs ? 'Reintentar' : 'Retry'}
                  </button>
                  <button
                    onClick={handleClaimReward}
                    className="flex-1 py-2 rounded-xl bg-[var(--ob-accent)] text-black font-mono text-xs font-black shadow-md active:scale-95 transition cursor-pointer"
                  >
                    {isEs ? 'Guardar' : 'Claim'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
