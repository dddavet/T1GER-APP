import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface XPChartProps {
  data: { date: string; xp: number }[];
}

export const XPChart: React.FC<XPChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full glass rounded-2xl p-4 border border-white/5">
      <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">XP Growth</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" stroke="#666" fontSize={12} />
          <YAxis stroke="#666" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#050505', border: '1px solid #333' }}
            itemStyle={{ color: '#CCFF00' }}
          />
          <Line type="monotone" dataKey="xp" stroke="#CCFF00" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
