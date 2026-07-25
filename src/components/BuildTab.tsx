import React from 'react';
import { motion } from 'motion/react';
import { Hammer, Briefcase, TrendingUp, DollarSign, Target, Plus, ChevronRight } from 'lucide-react';
import { useT1ger } from '../contexts/T1gerContext';
import { useBrain } from '../contexts/BrainContext';
import { MagneticButton } from './ui/magnetic-button';

export const BuildTab = () => {
  const { setActiveView } = useT1ger();
  const { language } = useBrain();
  const isEs = language === 'es';

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
              {isEs ? 'Frameworks Activos' : 'Active Frameworks'}
            </h2>
            <span className="text-xs font-bold text-[#FF7300]">
              {isEs ? '1 en progreso' : '1 in progress'}
            </span>
          </div>
          
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-3xl p-5 border-2 border-zinc-200 shadow-sm relative overflow-hidden group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF7300]/10 rounded-xl flex items-center justify-center border border-[#FF7300]/20">
                  <Briefcase className="w-5 h-5 text-[#FF7300]" />
                </div>
                <div>
                  <h3 className="font-black text-zinc-800 uppercase tracking-tight">
                    {isEs ? 'Setup Paper Trading' : 'Paper Trading Setup'}
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    {isEs ? 'Ruta de Inversión • Paso 1' : 'Investing Track • Step 1'}
                  </p>
                </div>
              </div>
              <div className="bg-zinc-100 p-2 rounded-full group-hover:bg-[#FF7300]/10 transition-colors">
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-[#FF7300]" />
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden border border-zinc-200/50">
              <div className="h-full bg-[#FF7300] w-1/3 rounded-full relative">
                <div className="absolute inset-0 bg-white/20 w-full h-1" />
              </div>
            </div>
            <div className="flex justify-between items-center mt-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <span>{isEs ? 'Progreso' : 'Progress'}</span>
              <span>33%</span>
            </div>
          </motion.div>
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

        {/* CTA Button */}
        <section className="pt-4 pb-8">
          <MagneticButton>
            <button 
              className="w-full relative group active:scale-95 transition-transform"
              onClick={() => setActiveView('learn')}
            >
              {/* Duolingo style 3D button */}
              <div className="absolute inset-0 bg-[#CC5C00] rounded-2xl translate-y-1.5" />
              <div className="relative bg-[#FF7300] border-2 border-[#FF7300] rounded-2xl p-4 flex items-center justify-center gap-2 text-white font-black uppercase text-sm tracking-widest">
                <Plus className="w-5 h-5" />
                {isEs ? 'Lanzar Nuevo Proyecto' : 'Launch New Project'}
              </div>
            </button>
          </MagneticButton>
        </section>
      </div>
    </div>
  );
};
