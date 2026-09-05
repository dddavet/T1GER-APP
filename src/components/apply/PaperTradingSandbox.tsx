import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  PieChart, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { useBrain } from '../../contexts/BrainContext';
import { useAuth } from '../../contexts/AuthContext';

interface TradeRecord {
  id: string;
  ticker: string;
  name: string;
  amount: number;
  price: number;
  shares: number;
  thesis: string;
  timestamp: number;
}

const SIMULATED_MARKET = [
  { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', price: 278.50, change: '+0.85%', peRatio: '24.2', type: 'ETF' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', price: 128.40, change: '+2.40%', peRatio: '46.8', type: 'Tech / AI' },
  { ticker: 'AAPL', name: 'Apple Inc.', price: 226.10, change: '+0.45%', peRatio: '32.1', type: 'Tech' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', price: 442.80, change: '+1.12%', peRatio: '35.4', type: 'Cloud / AI' },
  { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', price: 72.30, change: '-0.10%', peRatio: 'N/A', type: 'Bonds' },
  { ticker: 'BTC', name: 'Bitcoin (Digital Gold Asset)', price: 64200.00, change: '+3.15%', peRatio: 'N/A', type: 'Crypto' },
];

export const PaperTradingSandbox: React.FC = () => {
  const { language } = useBrain();
  const { appUser } = useAuth();
  const isEs = language === 'es';

  const storageKey = `t1ger_paper_portfolio_${appUser?.uid || 'local'}`;

  const [trades, setTrades] = useState<TradeRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch {
      return [];
    }
  });

  const [selectedTicker, setSelectedTicker] = useState('VTI');
  const [tradeAmount, setTradeAmount] = useState('2500');
  const [thesisText, setThesisText] = useState('');
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const startingCash = 50000;
  const investedAmount = useMemo(() => trades.reduce((sum, t) => sum + t.amount, 0), [trades]);
  const cashAvailable = Math.max(0, startingCash - investedAmount);

  const activeAsset = SIMULATED_MARKET.find(a => a.ticker === selectedTicker) || SIMULATED_MARKET[0];

  const handleExecuteOrder = async () => {
    setError('');
    setSuccessNotice('');
    const amt = Number(tradeAmount);

    if (!Number.isFinite(amt) || amt < 100) {
      setError(isEs ? 'El monto mínimo por orden es de $100 USD.' : 'Minimum order amount is $100 USD.');
      return;
    }
    if (amt > cashAvailable) {
      setError(isEs ? `Efectivo insuficiente. Solo tienes $${cashAvailable.toLocaleString()} USD disponibles.` : `Insufficient cash. You only have $${cashAvailable.toLocaleString()} USD.`);
      return;
    }
    if (thesisText.trim().length < 15) {
      setError(isEs ? 'Debes redactar una tesis táctica de inversión (mínimo 15 caracteres).' : 'Please provide an investment thesis (min 15 chars).');
      return;
    }

    const shares = parseFloat((amt / activeAsset.price).toFixed(4));
    const newTrade: TradeRecord = {
      id: `trade-${Date.now()}`,
      ticker: activeAsset.ticker,
      name: activeAsset.name,
      amount: amt,
      price: activeAsset.price,
      shares,
      thesis: thesisText.trim(),
      timestamp: Date.now(),
    };

    const updated = [newTrade, ...trades];
    setTrades(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }

    setSuccessNotice(isEs ? `Simulación guardada: ${shares} ${activeAsset.ticker}. Sin dinero real ni XP verificado.` : `Simulation saved: ${shares} ${activeAsset.ticker}. No real money or verified XP.`);
    setThesisText('');
  };

  return (
    <div className="space-y-4">
      {/* 1. Portfolio Balance Header Card (Double-Bezel) */}
      <div className="rounded-[1.6rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-[0_20px_45px_rgba(0,0,0,0.6)]">
        <div className="rounded-[1.3rem] border border-white/[0.08] bg-[#09090B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--ob-accent)]">
              {isEs ? 'PORTAFOLIO DE PRÁCTICA (TERMINAL T1GER)' : 'PAPER TRADING TERMINAL'}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isEs ? 'PRECIOS FICTICIOS' : 'FICTIONAL PRICES'}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 block uppercase">
                {isEs ? 'Capital Total' : 'Total Equity'}
              </span>
              <span className="font-mono text-2xl font-black text-white">
                ${startingCash.toLocaleString()} <span className="text-xs text-zinc-500">USD</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-zinc-500 block uppercase">
                {isEs ? 'Efectivo Disponible' : 'Available Cash'}
              </span>
              <span className="font-mono text-2xl font-black text-emerald-400">
                ${cashAvailable.toLocaleString()} <span className="text-xs text-emerald-600">USD</span>
              </span>
            </div>
          </div>

          {/* Allocation Progress Bar */}
          <div className="mt-3.5 space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>{isEs ? 'Invertido' : 'Invested'}: ${investedAmount.toLocaleString()}</span>
              <span>{((investedAmount / startingCash) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden flex">
              <div 
                className="h-full bg-[var(--ob-accent)] transition-all duration-500" 
                style={{ width: `${(investedAmount / startingCash) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Live Market Assets Grid */}
      <div className="rounded-[1.6rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
        <div className="rounded-[1.3rem] border border-white/[0.08] bg-[#09090B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-3">
          <div className="flex items-center justify-between border-b border-white/6 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              {isEs ? 'Activos Disponibles' : 'Market Watchlist'}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">P/E & Precios Reales</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {SIMULATED_MARKET.map((asset) => {
              const isSelected = selectedTicker === asset.ticker;
              const isPositive = asset.change.startsWith('+');

              return (
                <button
                  key={asset.ticker}
                  onClick={() => setSelectedTicker(asset.ticker)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--ob-accent)] bg-[var(--ob-accent)]/[0.08] shadow-[0_0_15px_rgba(255,115,0,0.2)]'
                      : 'border-white/8 bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">{asset.ticker}</span>
                    <span className={`font-mono text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {asset.change}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-mono text-sm font-bold text-zinc-200">
                      ${asset.price.toLocaleString()}
                    </span>
                    <span className="font-mono text-[9px] text-zinc-500">
                      P/E: {asset.peRatio}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Order Execution Terminal */}
      <div className="rounded-[1.6rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
        <div className="rounded-[1.3rem] border border-white/[0.08] bg-[#09090B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-3">
          <div className="flex items-center gap-2 border-b border-white/6 pb-2">
            <DollarSign size={15} className="text-[var(--ob-accent)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              {isEs ? `Comprar ${activeAsset.ticker} (${activeAsset.name})` : `Buy ${activeAsset.ticker}`}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                {isEs ? 'Monto a Invertir ($ USD)' : 'Amount ($ USD)'}
              </label>
              <input
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                inputMode="numeric"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:border-[var(--ob-accent)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                {isEs ? 'Acciones Calculadas' : 'Estimated Shares'}
              </label>
              <div className="w-full rounded-xl bg-white/[0.02] border border-white/6 px-3 py-2 text-xs font-mono text-zinc-300">
                {(Number(tradeAmount) / activeAsset.price).toFixed(4)} {activeAsset.ticker}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">
              {isEs ? 'Tesis Táctica de Inversión (¿Por qué compras ahora?)' : 'Investment Thesis'}
            </label>
            <textarea
              value={thesisText}
              onChange={(e) => setThesisText(e.target.value)}
              placeholder={isEs ? 'Escribe por qué esta inversión tiene margen de seguridad y encaja con tu horizonte…' : 'Explain why this asset has margin of safety…'}
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[var(--ob-accent)] focus:outline-none resize-none h-16"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 flex items-center gap-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <AlertCircle size={14} /> {error}
            </p>
          )}

          {successNotice && (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 size={14} /> {successNotice}
            </p>
          )}

          <button
            onClick={handleExecuteOrder}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--ob-accent)] to-amber-400 text-black font-mono text-xs font-black tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,115,0,0.3)] active:scale-[0.98] transition cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} />
            <span>{isEs ? `SIMULAR ORDEN DE $${tradeAmount} USD` : 'SIMULATE ORDER'}</span>
          </button>
        </div>
      </div>

      {/* 4. Active Positions History Ledger */}
      {trades.length > 0 && (
        <div className="rounded-[1.6rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-xl">
          <div className="rounded-[1.3rem] border border-white/[0.08] bg-[#09090B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-white font-mono block border-b border-white/6 pb-2">
              {isEs ? `Posiciones Abiertas (${trades.length})` : `Open Positions (${trades.length})`}
            </span>
            <div className="space-y-2">
              {trades.map((trade) => (
                <div key={trade.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/6 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-white">{trade.ticker}</span>
                      <span className="font-mono text-[10px] text-zinc-400">· {trade.shares} shares</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 italic leading-tight">
                      "{trade.thesis}"
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-400 shrink-0">
                    ${trade.amount.toLocaleString()} USD
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
