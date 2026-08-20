import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  PieChart, 
  DollarSign,
  Layers,
  Plus,
  Trash2
} from 'lucide-react';
import { useBrain } from '../../contexts/BrainContext';
import { useT1ger } from '../../contexts/T1gerContext';

interface BudgetItem {
  id: string;
  name: string;
  amount: number;
}

export const CashflowAuditorSandbox: React.FC = () => {
  const { language } = useBrain();
  const { addXP } = useT1ger();
  const isEs = language === 'es';

  // Monthly Income
  const [monthlyIncome, setMonthlyIncome] = useState<number>(3200);

  // Assets (Generan Flujo de Caja Positivo)
  const [assets, setAssets] = useState<BudgetItem[]>([
    { id: '1', name: 'Dividendos ETFs (VTI/SCHD)', amount: 150 },
    { id: '2', name: 'Negocio Digital / Micro-SaaS', amount: 450 },
  ]);

  // Liabilities (Drenan Dinero del Bolsillo)
  const [liabilities, setLiabilities] = useState<BudgetItem[]>([
    { id: '1', name: 'Préstamo Auto / Financiamiento', amount: 380 },
    { id: '2', name: 'Tarjetas de Crédito / Intereses', amount: 220 },
    { id: '3', name: 'Suscripciones & Gastos Hormiga', amount: 120 },
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [targetCategory, setTargetCategory] = useState<'asset' | 'liability'>('asset');
  const [verifiedNotice, setVerifiedNotice] = useState(false);

  const totalAssetCashflow = assets.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilityExpenses = liabilities.reduce((sum, item) => sum + item.amount, 0);
  const netPassiveCashflow = totalAssetCashflow - totalLiabilityExpenses;

  // Runway: meses de libertad si dejas de trabajar
  const monthlyLivingCost = Math.max(800, totalLiabilityExpenses + 1200);
  const totalLiquidAssets = totalAssetCashflow * 24; // Estimado
  const freedomMonths = parseFloat((totalLiquidAssets / monthlyLivingCost).toFixed(1));

  const handleAddItem = () => {
    const amt = Number(newItemAmount);
    if (!newItemName.trim() || !Number.isFinite(amt) || amt <= 0) return;

    const newItem: BudgetItem = {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      amount: amt,
    };

    if (targetCategory === 'asset') {
      setAssets(prev => [...prev, newItem]);
    } else {
      setLiabilities(prev => [...prev, newItem]);
    }

    setNewItemName('');
    setNewItemAmount('');
  };

  const handleVerifyBalance = async () => {
    setVerifiedNotice(true);
    await addXP(180, 1, 'cashflow_audit_verified');
  };

  return (
    <div className="space-y-4">
      {/* 1. Cashflow Freedom Gauge (Double-Bezel) */}
      <div className="rounded-[1.6rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-[0_20px_45px_rgba(0,0,0,0.6)]">
        <div className="rounded-[1.3rem] border border-white/[0.08] bg-[#09090B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--ob-accent)]">
              {isEs ? 'AUDITORÍA DE FLUJO DE CAJA (PADRE RICO)' : 'CASHFLOW AUDITOR'}
            </span>
            <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              netPassiveCashflow >= 0 
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}>
              {netPassiveCashflow >= 0 ? (isEs ? 'FLUJO POSITIVO 📈' : 'CASHFLOW POSITIVE 📈') : (isEs ? 'DRENAJE DE CAPITAL ⚠️' : 'CAPITAL DRAIN ⚠️')}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 block uppercase">
                {isEs ? 'Flujo de Activos' : 'Asset Inflow'}
              </span>
              <span className="font-mono text-2xl font-black text-emerald-400">
                +${totalAssetCashflow} <span className="text-xs text-zinc-500">/mes</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-zinc-500 block uppercase">
                {isEs ? 'Drenaje de Pasivos' : 'Liability Outflow'}
              </span>
              <span className="font-mono text-2xl font-black text-rose-400">
                -${totalLiabilityExpenses} <span className="text-xs text-zinc-500">/mes</span>
              </span>
            </div>
          </div>

          {/* Net Cashflow Summary Box */}
          <div className="mt-3.5 p-3 rounded-xl bg-white/[0.03] border border-white/6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                {isEs ? 'Balance Neto Mensual' : 'Net Monthly Balance'}
              </span>
              <span className={`font-mono text-lg font-black ${netPassiveCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netPassiveCashflow >= 0 ? `+$${netPassiveCashflow}` : `-$${Math.abs(netPassiveCashflow)}`} USD
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                {isEs ? 'Ingreso Total' : 'Active Income'}
              </span>
              <span className="font-mono text-base font-bold text-white">
                ${monthlyIncome} USD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Assets vs Liabilities Side-by-Side Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Assets Column */}
        <div className="rounded-[1.5rem] border border-emerald-500/20 bg-[#121216]/95 p-3.5 space-y-2">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1">
              ✦ {isEs ? 'Activos Reales' : 'Real Assets'}
            </span>
            <span className="font-mono text-xs font-bold text-white">+${totalAssetCashflow}</span>
          </div>

          <div className="space-y-1.5">
            {assets.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10 text-xs">
                <span className="text-zinc-300 truncate max-w-[140px]">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-bold">+${item.amount}</span>
                  <button onClick={() => setAssets(prev => prev.filter(a => a.id !== item.id))} className="text-zinc-600 hover:text-rose-400">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Liabilities Column */}
        <div className="rounded-[1.5rem] border border-rose-500/20 bg-[#121216]/95 p-3.5 space-y-2">
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
            <span className="text-xs font-bold text-rose-400 font-mono flex items-center gap-1">
              ▼ {isEs ? 'Pasivos Disfrazados' : 'Liabilities'}
            </span>
            <span className="font-mono text-xs font-bold text-white">-${totalLiabilityExpenses}</span>
          </div>

          <div className="space-y-1.5">
            {liabilities.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-rose-500/[0.04] border border-rose-500/10 text-xs">
                <span className="text-zinc-300 truncate max-w-[140px]">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-rose-400 font-bold">-${item.amount}</span>
                  <button onClick={() => setLiabilities(prev => prev.filter(l => l.id !== item.id))} className="text-zinc-600 hover:text-rose-400">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Add Item Quick Form */}
      <div className="rounded-[1.6rem] border border-white/10 bg-[#121216]/95 p-1.5 shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
        <div className="rounded-[1.3rem] border border-white/[0.08] bg-[#09090B] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-3">
          <div className="flex items-center justify-between border-b border-white/6 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              {isEs ? 'Añadir Flujo' : 'Add Cashflow Entry'}
            </span>
            <div className="flex gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10">
              <button
                onClick={() => setTargetCategory('asset')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                  targetCategory === 'asset' ? 'bg-emerald-500 text-black' : 'text-zinc-400'
                }`}
              >
                + Activo
              </button>
              <button
                onClick={() => setTargetCategory('liability')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                  targetCategory === 'liability' ? 'bg-rose-500 text-white' : 'text-zinc-400'
                }`}
              >
                - Pasivo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <input
                placeholder={targetCategory === 'asset' ? 'Ej: Dividendos o Rentas' : 'Ej: Suscripciones o Cuota Auto'}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <input
                placeholder="Monto /mes"
                value={newItemAmount}
                onChange={(e) => setNewItemAmount(e.target.value)}
                inputMode="numeric"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAddItem}
              className="flex-1 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/15 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus size={14} />
              <span>{isEs ? 'Añadir a la Lista' : 'Add Item'}</span>
            </button>
            <button
              onClick={handleVerifyBalance}
              className="flex-1 py-2.5 rounded-xl bg-[var(--ob-accent)] text-black font-mono text-xs font-black flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,115,0,0.3)] transition cursor-pointer"
            >
              <ShieldCheck size={15} />
              <span>{isEs ? 'Verificar Balance (+180 vXP)' : 'Verify Balance (+180 vXP)'}</span>
            </button>
          </div>

          {verifiedNotice && (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 size={14} /> {isEs ? '¡Balance patrimonial auditado y verificado en tu perfil!' : 'Balance verified in your profile!'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
