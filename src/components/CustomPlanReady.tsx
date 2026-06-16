import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Target, Clock, Zap, Flame } from 'lucide-react';

export const CustomPlanReady: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center space-y-6 mt-4">
      
      {/* Success Icon */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-2"
      >
        <CheckCircle2 size={32} className="text-black" strokeWidth={3} />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center px-2 space-y-4"
      >
        <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-tight text-white drop-shadow-md">
          ¡Tu currículum agresivo está listo!
        </h2>
        
        <div className="bg-white/10 border border-white/20 rounded-full px-5 py-2 inline-block shadow-lg backdrop-blur-md">
          <span className="text-sm font-bold text-white">Alcanzarás el Rango Lobo en 45 días</span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full bg-[#111113] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/10 rounded-full blur-[40px]" />
        
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">Recomendación Diaria</h3>
            <span className="text-xs font-medium text-zinc-500">Ajustable en cualquier momento</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DashboardCard icon={<Target size={16} className="text-white"/>} label="Misiones" value="3" subtitle="Por día" colorClass="text-white" dashArray="75, 100" />
          <DashboardCard icon={<Clock size={16} className="text-[#FF6B00]"/>} label="Tiempo" value="15" subtitle="Minutos" colorClass="text-[#FF6B00]" dashArray="40, 100" />
          <DashboardCard icon={<Zap size={16} className="text-yellow-400"/>} label="XP Diaria" value="500" subtitle="XP" colorClass="text-yellow-400" dashArray="85, 100" />
          <DashboardCard icon={<Flame size={16} className="text-red-500"/>} label="Racha" value="1" subtitle="Día Min." colorClass="text-red-500" dashArray="10, 100" />
        </div>
      </motion.div>

    </div>
  );
};

const DashboardCard = ({ icon, label, value, subtitle, colorClass, dashArray }: { icon: React.ReactNode, label: string, value: string, subtitle: string, colorClass: string, dashArray: string }) => (
  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center relative shadow-inner">
    <div className="absolute top-3 left-3">
      {icon}
    </div>
    <span className="text-xs font-bold text-zinc-400 mb-1 ml-4">{label}</span>
    
    <div className="relative mt-2 mb-1">
       {/* Fake Circular Progress Ring */}
       <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
        <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
        <path strokeDasharray={dashArray} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" className={colorClass} strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-black text-white">{value}</span>
      </div>
    </div>
    
    <span className="text-[10px] font-bold text-zinc-500 uppercase">{subtitle}</span>
  </div>
);
