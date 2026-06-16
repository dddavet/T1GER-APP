import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';

export const SocialProofReviews: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center space-y-8 mt-4">
      
      {/* Top Rating Badge */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-6 w-full flex items-center justify-center gap-6 shadow-xl"
      >
        <div className="text-[#FF6B00] opacity-80">
          <svg width="40" height="80" viewBox="0 0 40 80" fill="currentColor">
            <path d="M 30 70 Q 10 50 20 10 Q 5 40 30 70 Z" />
          </svg>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl font-black text-white">4.9</span>
            <div className="flex text-[#FF6B00] drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]">
              {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" strokeWidth={0} />)}
            </div>
          </div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">10K+ App Ratings</span>
        </div>

        <div className="text-[#FF6B00] opacity-80 scale-x-[-1]">
          <svg width="40" height="80" viewBox="0 0 40 80" fill="currentColor">
            <path d="M 30 70 Q 10 50 20 10 Q 5 40 30 70 Z" />
          </svg>
        </div>
      </motion.div>

      {/* Middle Statement */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center space-y-4 relative z-10"
      >
        <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-tight text-white px-2 drop-shadow-md">
          T1GER fue creado para personas como tú
        </h2>
        
        <div className="flex justify-center -space-x-3 pt-2">
          {/* Avatar stack */}
          <div className="w-14 h-14 rounded-full border-[3px] border-[#050505] bg-zinc-800 flex items-center justify-center overflow-hidden">
            <img src="https://i.pravatar.cc/150?img=11" alt="User 1" className="w-full h-full object-cover opacity-80" />
          </div>
          <div className="w-16 h-16 rounded-full border-[3px] border-[#050505] bg-zinc-700 flex items-center justify-center overflow-hidden z-10 shadow-2xl relative -top-1">
            <img src="https://i.pravatar.cc/150?img=32" alt="User 2" className="w-full h-full object-cover opacity-100" />
          </div>
          <div className="w-14 h-14 rounded-full border-[3px] border-[#050505] bg-zinc-800 flex items-center justify-center overflow-hidden">
            <img src="https://i.pravatar.cc/150?img=12" alt="User 3" className="w-full h-full object-cover opacity-80" />
          </div>
        </div>
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block pt-2">2M+ T1GER Users</span>
      </motion.div>

      {/* Testimonial Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 w-full relative overflow-hidden shadow-2xl"
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/10 rounded-full blur-[40px] pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-4 relative z-10">
          <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
            <img src="https://i.pravatar.cc/150?img=53" alt="Jake" className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Alejandro Silva</h4>
            <div className="flex text-[#FF6B00] mt-1 gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={10} fill="currentColor" strokeWidth={0} />)}
            </div>
          </div>
        </div>
        <p className="text-sm font-medium text-zinc-400 leading-relaxed italic relative z-10">
          "Pasé de no saber nada de negocios a cerrar mis primeros $5,000 en 2 meses. Estaba a punto de rendirme pero decidí darle una oportunidad a esta app y la estructura agresiva realmente me voló la cabeza :)"
        </p>
      </motion.div>
    </div>
  );
};
