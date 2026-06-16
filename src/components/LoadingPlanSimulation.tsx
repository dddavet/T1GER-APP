import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';

interface LoadingPlanSimulationProps {
  onComplete: () => void;
}

export const LoadingPlanSimulation: React.FC<LoadingPlanSimulationProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState('Analizando respuestas...');

  useEffect(() => {
    const duration = 4000; // 4 seconds total
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const texts = [
      { at: 0, text: 'Analizando perfil psicológico...' },
      { at: 25, text: 'Calibrando misiones de ventas...' },
      { at: 50, text: 'Ajustando curva de aprendizaje...' },
      { at: 75, text: 'Generando currículum final...' },
      { at: 95, text: 'Finalizando...' },
    ];

    const timer = setInterval(() => {
      currentStep++;
      const percent = Math.min(Math.round((currentStep / steps) * 100), 100);
      setProgress(percent);

      const activeText = [...texts].reverse().find(t => percent >= t.at);
      if (activeText) setCurrentText(activeText.text);

      if (percent >= 100) {
        clearInterval(timer);
        setTimeout(() => onComplete(), 500); // Wait half a second at 100%
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-12 mt-8">
      
      {/* Big Percentage */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="text-[6rem] sm:text-[8rem] font-black italic tracking-tighter leading-none text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
          {progress}%
        </div>
        <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white mt-4 px-4">
          Construyendo arsenal
        </h2>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-full max-w-sm px-6">
        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#CC5500] to-[#FF6B00]"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
        <div className="mt-4 text-center h-6 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.p 
              key={currentText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium text-zinc-400 absolute w-full left-0"
            >
              {currentText}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Checklist */}
      <div className="w-full max-w-sm px-4 space-y-3 mt-4">
        <ChecklistItem label="Mindset de Predator" active={progress > 20} />
        <ChecklistItem label="Misiones de Ventas High-Ticket" active={progress > 45} />
        <ChecklistItem label="Optimización de Finanzas" active={progress > 70} />
        <ChecklistItem label="Estructura Operativa" active={progress > 90} />
      </div>

    </div>
  );
};

const ChecklistItem = ({ label, active }: { label: string, active: boolean }) => (
  <div className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-500 ${active ? 'bg-white/10 border border-white/20' : 'bg-transparent border border-transparent'}`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-500 ${active ? 'bg-[#FF6B00] text-black shadow-[0_0_10px_rgba(255,107,0,0.5)]' : 'bg-white/5 text-zinc-600'}`}>
      <Check size={14} strokeWidth={active ? 3 : 2} />
    </div>
    <span className={`text-sm font-bold transition-colors duration-500 ${active ? 'text-white' : 'text-zinc-600'}`}>
      {label}
    </span>
  </div>
);
