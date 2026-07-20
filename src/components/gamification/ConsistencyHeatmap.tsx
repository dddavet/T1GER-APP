import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Info } from 'lucide-react';

interface HeatmapData {
  date: string; // YYYY-MM-DD
  count: number;
}

interface ConsistencyHeatmapProps {
  data: HeatmapData[];
  days?: number;
  title?: string;
}

export const ConsistencyHeatmap: React.FC<ConsistencyHeatmapProps> = ({ 
  data = [], 
  days = 90,
  title = "90-Day Focus Consistency"
}) => {
  // Generate the last `days` dates
  const { grid, maxCount, activeDays } = useMemo(() => {
    const today = new Date();
    const map = new Map<string, number>();
    
    let localMax = 0;
    let localActive = 0;

    data.forEach(d => {
      map.set(d.date, d.count);
      if (d.count > localMax) localMax = d.count;
      if (d.count > 0) localActive++;
    });

    const generatedGrid: { date: Date; dateStr: string; count: number }[] = [];
    
    // We want to generate days in the past up to today
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = map.get(dateStr) || 0;
      generatedGrid.push({ date: d, dateStr, count });
    }

    return { grid: generatedGrid, maxCount: localMax || 1, activeDays: localActive };
  }, [data, days]);

  const getIntensityClass = (count: number, max: number) => {
    if (count === 0) return 'bg-zinc-900 border-zinc-800/50';
    const ratio = count / max;
    if (ratio < 0.3) return 'bg-[#FF6B00]/20 border-[#FF6B00]/10';
    if (ratio < 0.6) return 'bg-[#FF6B00]/50 border-[#FF6B00]/30';
    if (ratio < 0.9) return 'bg-[#FF6B00]/80 border-[#FF6B00]/60 text-white shadow-[0_0_8px_rgba(255,107,0,0.4)]';
    return 'bg-[#FF6B00] border-[#FF6B00] text-black shadow-[0_0_12px_rgba(255,107,0,0.6)]';
  };

  const consistencyPercentage = Math.round((activeDays / days) * 100) || 0;

  // Group by weeks for vertical columns layout (GitHub style, scrollable horizontally)
  // But on mobile, standard grid flow might be easier. Let's do a flex-wrap or grid.
  // Actually, a CSS Grid with fixed columns (e.g. 7 rows for days of week, or just flow)
  // Let's use simple flex wrap for simplicity and fluidity on mobile.

  return (
    <div className="bg-black border border-white/5 rounded-3xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF6B00]/5 blur-3xl rounded-full pointer-events-none" />

      <div className="flex items-center justify-between z-10 relative">
        <div>
          <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-1.5">
            <ActivityIcon />
            {title}
          </h3>
          <p className="text-white font-black text-xl tracking-tight mt-1">
            {consistencyPercentage}% <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Consistency</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-[#FF6B00] tracking-widest">
            {activeDays} / {days} Days
          </p>
          <p className="text-[8px] font-mono text-zinc-600 uppercase mt-1">
            Active Focus
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-2 z-10 relative">
        {grid.map((cell, i) => (
          <motion.div
            key={cell.dateStr}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.005 }}
            title={`${cell.dateStr}: ${cell.count} XP`}
            className={`w-3.5 h-3.5 rounded-[4px] border ${getIntensityClass(cell.count, maxCount)} transition-colors duration-300`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5 z-10 relative">
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono text-zinc-600 uppercase">Less</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800/50" />
            <div className="w-2.5 h-2.5 rounded-[3px] bg-[#FF6B00]/20 border border-[#FF6B00]/10" />
            <div className="w-2.5 h-2.5 rounded-[3px] bg-[#FF6B00]/50 border border-[#FF6B00]/30" />
            <div className="w-2.5 h-2.5 rounded-[3px] bg-[#FF6B00]/80 border border-[#FF6B00]/60" />
            <div className="w-2.5 h-2.5 rounded-[3px] bg-[#FF6B00] border border-[#FF6B00]" />
          </div>
          <span className="text-[8px] font-mono text-zinc-600 uppercase">More</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] text-zinc-500 uppercase tracking-widest font-mono">
          <Info className="w-3 h-3" /> Auto-validated
        </div>
      </div>
    </div>
  );
};

const ActivityIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);
