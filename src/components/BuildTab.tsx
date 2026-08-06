import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Hammer, Briefcase, TrendingUp, DollarSign, Target, Plus, ChevronRight } from 'lucide-react';
import { useT1ger } from '../contexts/T1gerContext';
import { useBrain } from '../contexts/BrainContext';
import { getCurrentPathData } from '../services/brainService';
import { MISSION_BANK } from '../services/missionBank';
import { MagneticButton } from './ui/magnetic-button';
import { WagerMode } from './WagerMode';

export const BuildTab = () => {
  const { setActiveView } = useT1ger();
  const { language, brainState } = useBrain();
  const isEs = language === 'es';
  const [activeWager, setActiveWager] = useState<{minutes: number, wager: number} | null>(null);

  const pathData = getCurrentPathData(brainState);
  const activeLevel = pathData.track.levels[pathData.currentLevelIndex];
  const applyMission = activeLevel?.applyNodeId ? MISSION_BANK.find(m => m.id === activeLevel.applyNodeId) : null;
  const isPending = pathData.isApplyNodePending;

  const handleWagerCommit = (minutes: number, wager: number) => {
    setActiveWager({ minutes, wager });
  };

  return (
    <div className="-mx-5 min-h-full bg-[#F7F7F7] pb-28 text-zinc-800">
      {/* Header */}
      <div className="sticky top-4 z-40 px-4 mb-6">
        <motion.div 
          className="w-full px-5 py-4 shadow-xl rounded-3xl text-left border-b-4 border-black/20 bg-[#FF7300] text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-white/90 block mb-1">
                {isEs ? 'ESPACIO DE TRABAJO' : 'WORKSPACE'}
              </span>
              <h1 className="text-xl font-black leading-tight italic uppercase tracking-tighter">
                {isEs ? 'Centro de Operaciones' : 'Operation Center'}
              </h1>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Hammer className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-5 space-y-6">
        {/* Active Frameworks Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">
              {isEs ? 'Misión de Aplicación' : 'Apply Mission'}
            </h2>
            {isPending && (
              <span className="text-[10px] font-black uppercase tracking-widest text-white bg-[#FF7300] px-2 py-1 rounded-full animate-pulse">
                {isEs ? 'ACCIÓN REQUERIDA' : 'ACTION REQUIRED'}
              </span>
            )}
          </div>
          
          {applyMission ? (
            <motion.div 
              whileTap={{ scale: 0.98 }}
              className={`bg-white rounded-3xl p-5 border-2 shadow-sm relative overflow-hidden group cursor-pointer ${isPending ? 'border-[#FF7300]' : 'border-zinc-200'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${isPending ? 'bg-[#FF7300] border-[#CC5C00]' : 'bg-zinc-100 border-zinc-200'}`}>
                    <Briefcase className={`w-6 h-6 ${isPending ? 'text-white' : 'text-zinc-400'}`} />
                  </div>
                  <div>
                    <h3 className={`font-black uppercase tracking-tight leading-tight ${isPending ? 'text-zinc-800 text-lg' : 'text-zinc-500 text-base'}`}>
                      {applyMission.title}
                    </h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                      {pathData.track.title} • {isEs ? 'Nivel' : 'Level'} {activeLevel.levelNumber}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 mb-4">
                <p className="text-sm font-medium text-zinc-600">
                  {applyMission.taskBrief}
                </p>
              </div>

              {!isPending ? (
                <div className="w-full bg-green-100 text-green-700 font-black text-center py-3 rounded-xl uppercase tracking-widest text-sm">
                  {isEs ? 'MISIÓN COMPLETADA' : 'MISSION COMPLETED'}
                </div>
              ) : (
                <MagneticButton>
                  <button className="w-full relative group active:scale-95 transition-transform">
                    <div className="absolute inset-0 bg-[#CC5C00] rounded-xl translate-y-1" />
                    <div className="relative bg-[#FF7300] border-2 border-[#FF7300] rounded-xl p-3 flex items-center justify-center text-white font-black uppercase text-sm tracking-widest">
                      {isEs ? 'EJECUTAR AHORA' : 'EXECUTE NOW'}
                    </div>
                  </button>
                </MagneticButton>
              )}
            </motion.div>
          ) : (
            <div className="bg-white rounded-3xl p-5 border-2 border-zinc-200 shadow-sm text-center">
              <p className="text-sm font-bold text-zinc-400">
                {isEs ? 'No hay misiones de aplicación activas en este nivel.' : 'No active apply missions in this level.'}
              </p>
            </div>
          )}
        </section>

        {/* Business Metrics Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">
              {isEs ? 'Métricas Clave' : 'Key Metrics'}
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-[2rem] p-4 border border-zinc-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {isEs ? 'Ingresos' : 'Revenue'}
              </span>
              <span className="font-black text-xl text-zinc-800">$0.00</span>
            </div>
            
            <div className="bg-white rounded-[2rem] p-4 border border-zinc-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {isEs ? 'Leads Generados' : 'Leads Generated'}
              </span>
              <span className="font-black text-xl text-zinc-800">0</span>
            </div>
            
            <div className="col-span-2 bg-white rounded-[2rem] p-4 border border-zinc-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {isEs ? 'Score de Output Semanal' : 'Weekly Output Score'}
              </span>
              <span className="font-black text-2xl text-zinc-800">C+</span>
              <p className="text-xs text-zinc-500 mt-1">
                {isEs ? 'Comienza a ejecutar para subir tu score.' : 'Start executing to raise your score.'}
              </p>
            </div>
          </div>
        </section>

        {/* Wager Mode CTA Section */}
        <section className="pt-4 pb-8">
          {activeWager ? (
            <div className="bg-white rounded-[2rem] p-6 text-center border-2 border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="w-16 h-16 bg-[#FF7300]/10 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#FF7300]/20">
                <Target className="w-8 h-8 text-[#FF7300] animate-pulse" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest text-zinc-800 mb-2">Session Active</h3>
              <p className="text-sm font-bold text-zinc-500 mb-6">You wagered {activeWager.wager} T-Coins for {activeWager.minutes} minutes.</p>
              <div className="text-5xl font-mono font-black text-[#FF7300] mb-8 tracking-tighter">
                {activeWager.minutes}:00
              </div>
              
              <MagneticButton>
                <button 
                  className="w-full relative group active:scale-95 transition-transform"
                  onClick={() => setActiveWager(null)}
                >
                  <div className="absolute inset-0 bg-[#CC0000] rounded-2xl translate-y-1.5" />
                  <div className="relative bg-[#FF3333] border-2 border-[#FF3333] rounded-2xl p-4 flex items-center justify-center gap-2 text-white font-black uppercase text-sm tracking-widest">
                    FORFEIT WAGER
                  </div>
                </button>
              </MagneticButton>
            </div>
          ) : (
            <WagerMode onCommit={handleWagerCommit} />
          )}
        </section>
      </div>
    </div>
  );
};
