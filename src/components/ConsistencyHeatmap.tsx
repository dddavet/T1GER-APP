import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { useBrain } from '../contexts/BrainContext';

export const ConsistencyHeatmap: React.FC = () => {
  const { brainState, language } = useBrain();
  const isEs = language === 'es';

  const heatmapData = useMemo(() => {
    const completionMap = new Map<string, number>();
    (brainState.missionHistory || []).forEach(record => {
      if (!record.completed) return;
      const date = new Date(record.timestamp).toISOString().split('T')[0];
      completionMap.set(date, (completionMap.get(date) || 0) + 1);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 90 }, (_, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (89 - index));
      const dateKey = date.toISOString().split('T')[0];
      return { date: dateKey, count: completionMap.get(dateKey) || 0 };
    });
  }, [brainState.missionHistory]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-white/[0.03] border-white/[0.05]';
    if (count === 1) return 'bg-emerald-900/40 border-emerald-800/50';
    if (count === 2) return 'bg-emerald-700/60 border-emerald-600/50';
    if (count === 3) return 'bg-emerald-500/80 border-emerald-400/50';
    return 'bg-emerald-400 border-emerald-300';
  };

  return (
    <section className="w-full rounded-[1.5rem] border border-white/[0.06] bg-[#121216] p-5" aria-labelledby="consistency-title">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"><Activity size={16} /></div>
        <div>
          <h3 id="consistency-title" className="text-[13px] font-black text-white">{isEs ? 'Mapa de consistencia' : 'Consistency map'}</h3>
          <p className="mt-0.5 font-mono text-[10px] text-zinc-500">{isEs ? 'Últimos 90 días de ejecución.' : 'Last 90 days of execution.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1">
        {heatmapData.map(day => (
          <div key={day.date} className={`aspect-square rounded-[4px] border ${getColor(day.count)}`} title={`${day.date}: ${day.count} ${isEs ? 'misiones' : 'missions'}`} aria-label={`${day.date}: ${day.count} ${isEs ? 'misiones' : 'missions'}`} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 font-mono text-[9px] text-zinc-500">
        <span>{isEs ? 'Menos' : 'Less'}</span>
        <div className="flex gap-1" aria-hidden="true"><div className="h-3 w-3 rounded-[3px] border border-white/[0.05] bg-white/[0.03]" /><div className="h-3 w-3 rounded-[3px] border border-emerald-800/50 bg-emerald-900/40" /><div className="h-3 w-3 rounded-[3px] border border-emerald-600/50 bg-emerald-700/60" /><div className="h-3 w-3 rounded-[3px] border border-emerald-300 bg-emerald-400" /></div>
        <span>{isEs ? 'Más' : 'More'}</span>
      </div>
    </section>
  );
};
