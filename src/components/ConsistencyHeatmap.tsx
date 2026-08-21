import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useBrain } from '../contexts/BrainContext';
import { Activity } from 'lucide-react';

export const ConsistencyHeatmap: React.FC = () => {
  const { brainState, language } = useBrain();
  const isEs = language === 'es';

  // Generate the last 90 days
  const heatmapData = useMemo(() => {
    const days = 90;
    const history = brainState.missionHistory || [];
    
    // Create a map of YYYY-MM-DD to completion count
    const completionMap = new Map<string, number>();
    history.forEach(record => {
      if (record.completed) {
        const date = new Date(record.timestamp).toISOString().split('T')[0];
        completionMap.set(date, (completionMap.get(date) || 0) + 1);
      }
    });

    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = completionMap.get(dateStr) || 0;
      data.push({ date: dateStr, count });
    }
    return data;
  }, [brainState.missionHistory]);

  // Determine color intensity based on count
  const getColor = (count: number) => {
    if (count === 0) return 'bg-white/[0.03] border-white/[0.05]';
    if (count === 1) return 'bg-emerald-900/40 border-emerald-800/50';
    if (count === 2) return 'bg-emerald-700/60 border-emerald-600/50';
    if (count === 3) return 'bg-emerald-500/80 border-emerald-400/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
    return 'bg-emerald-400 border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.5)]';
  };

  return (
    <div className="w-full mt-6 bg-[#121216]/60 border border-white/[0.06] rounded-3xl p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
          <Activity size={16} />
        </div>
        <div>
          <h3 className="text-[13px] font-black uppercase tracking-wider text-white">
            {isEs ? 'Mapa de Consistencia' : 'Consistency Heatmap'}
          </h3>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
            {isEs ? 'Últimos 90 días de ejecución.' : 'Last 90 days of execution.'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 justify-end">
        {heatmapData.map((day, i) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.005 }} // Waterfall effect
            className={`w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] rounded-[4px] border ${getColor(day.count)} transition-all hover:scale-125 hover:z-10 cursor-pointer`}
            title={`${day.date}: ${day.count} misiones`}
          />
        ))}
      </div>
      
      <div className="flex items-center justify-end gap-2 mt-4 text-[9px] font-mono text-zinc-500">
        <span>{isEs ? 'Menos' : 'Less'}</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-[3px] bg-white/[0.03] border border-white/[0.05]" />
          <div className="w-3 h-3 rounded-[3px] bg-emerald-900/40 border border-emerald-800/50" />
          <div className="w-3 h-3 rounded-[3px] bg-emerald-700/60 border border-emerald-600/50" />
          <div className="w-3 h-3 rounded-[3px] bg-emerald-400 border border-emerald-300" />
        </div>
        <span>{isEs ? 'Más' : 'More'}</span>
      </div>
    </div>
  );
};
