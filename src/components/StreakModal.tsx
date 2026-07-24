import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
}

import { useBrain } from '../contexts/BrainContext';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
}

export const StreakModal: React.FC<StreakModalProps> = ({ isOpen, onClose, streak }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'friends'>('personal');
  const { appUser } = useAuth();
  const { language } = useBrain();
  const isEs = language === 'es';
  
  const freezes = appUser?.streakShields || 0;
  const hasStreak = streak > 0;

  // Simple calendar generation (current month)
  const today = new Date();
  const currentMonth = today.toLocaleString(isEs ? 'es-ES' : 'en-US', { month: 'long' });
  const currentYear = today.getFullYear();
  
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Simulate streak highlighting
  const currentDay = today.getDate();
  const isDayActive = (day: number | null) => {
    if (!day) return false;
    return day <= currentDay && day > currentDay - streak;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[9999] bg-white flex flex-col font-sans overflow-hidden"
      >
        {/* Colored Top Area (Header + Tabs + Hero) */}
        <div className={`pt-4 relative overflow-hidden transition-colors duration-500 shrink-0
          ${hasStreak ? 'bg-[#FF9600]' : 'bg-[#1CB0F6]'}
        `}>
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2 relative z-20">
            <button onClick={onClose} className="p-2 text-white/90 hover:text-white transition-colors cursor-pointer">
              <X size={28} strokeWidth={2.5} />
            </button>
            <span className="font-black text-lg text-white tracking-wide">{isEs ? 'Racha Diaria' : 'Streak'}</span>
            <button className="p-2 text-white/90 hover:text-white transition-colors cursor-pointer">
              <Share size={24} strokeWidth={2.5} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b-2 border-white/20 px-4 relative z-20">
            <button 
              className={`flex-1 py-3 text-sm font-black tracking-widest uppercase transition-colors relative cursor-pointer
                ${activeTab === 'personal' ? 'text-white' : 'text-white/60'}
              `}
              onClick={() => setActiveTab('personal')}
            >
              {isEs ? 'Personal' : 'Personal'}
              {activeTab === 'personal' && (
                <motion.div layoutId="streakTab" className="absolute bottom-[-2px] left-0 right-0 h-1 bg-white rounded-t-md" />
              )}
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-black tracking-widest uppercase transition-colors relative cursor-pointer
                ${activeTab === 'friends' ? 'text-white' : 'text-white/60'}
              `}
              onClick={() => setActiveTab('friends')}
            >
              {isEs ? 'Amigos' : 'Friends'}
              {activeTab === 'friends' && (
                <motion.div layoutId="streakTab" className="absolute bottom-[-2px] left-0 right-0 h-1 bg-white rounded-t-md" />
              )}
            </button>
          </div>

          {/* Hero Section (only in personal) */}
          {activeTab === 'personal' && (
            <div className="flex justify-between items-start relative z-10 px-8 pt-8 pb-10">
              <div className="flex flex-col text-left">
                <span className="text-[80px] font-black leading-none text-white tracking-tighter" style={{ textShadow: '0 4px 0 rgba(0,0,0,0.1)' }}>
                  {streak}
                </span>
                <span className="text-xl font-bold text-white/90 tracking-wide mt-1">
                  {isEs ? '¡días de racha!' : 'day streak!'}
                </span>
              </div>
              
              {/* Big Icon */}
              <motion.div 
                animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-28 h-28 relative mt-2"
              >
                {hasStreak ? (
                  <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-lg" fill="none">
                    <path d="M12 22C16 22 19 18.5 19 14.5C19 10 16 7 14 3C13.5 2 12.5 2 12 3C12.5 6 13.5 8 13.5 10.5C13.5 12 12.5 13 11 13C9.5 13 8 11.5 8 9.5C6 11 5 13.5 5 15.5C5 19.5 8 22 12 22Z" fill="#FFC800" />
                    <path d="M12 20C14 20 15.5 18 15.5 15.5C15.5 13 13.5 11.5 12.5 9.5C12.5 11 11.5 12.5 10.5 12.5C9.5 12.5 8.5 11 8.5 10C7.5 11.5 7 13.5 7 15.5C7 18 8.5 20 12 20Z" fill="white" />
                  </svg>
                ) : (
                  // Ice Cube or broken streak
                  <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-lg" fill="none">
                    <path d="M19 14C19 17.866 15.866 21 12 21C8.13401 21 5 17.866 5 14C5 10.134 8.13401 7 12 7C15.866 7 19 10.134 19 14Z" fill="#78C8F5" />
                    <path d="M12 3L14 7L18 8L15 11L16 15L12 13L8 15L9 11L6 8L10 7L12 3Z" fill="white" opacity="0.8" />
                  </svg>
                )}
              </motion.div>
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="h-6"></div>
          )}
          
          {/* Decorative background shapes */}
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[100%] bg-white opacity-10 rounded-full blur-2xl pointer-events-none" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'personal' && (
            <div className="pb-12">
              {/* Status Banner */}
              <div className="px-5 mt-[-1.5rem] relative z-20 mb-8">
                <div className="bg-white rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.08)] border-2 border-zinc-100 p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FF9600]/10 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                      <path d="M12 22C16 22 19 18.5 19 14.5C19 10 16 7 14 3C13.5 2 12.5 2 12 3C12.5 6 13.5 8 13.5 10.5C13.5 12 12.5 13 11 13C9.5 13 8 11.5 8 9.5C6 11 5 13.5 5 15.5C5 19.5 8 22 12 22Z" fill="#FF9600" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-700 text-sm mb-1 leading-tight">
                      {hasStreak ? "Keep your Perfect Streak by doing a lesson every day!" : "Start a lesson to begin your new streak!"}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Calendar Section */}
              <div className="px-6 mb-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-zinc-800">{currentMonth} {currentYear}</h2>
                    <span className="bg-[#FF9600] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">Perfect</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-zinc-400 hover:text-zinc-600 transition-colors"><ChevronLeft size={24} strokeWidth={3} /></button>
                    <button className="text-zinc-400 hover:text-zinc-600 transition-colors"><ChevronRight size={24} strokeWidth={3} /></button>
                  </div>
                </div>

                {/* Summary Badges */}
                <div className="flex gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                      <path d="M12 22C16 22 19 18.5 19 14.5C19 10 16 7 14 3C13.5 2 12.5 2 12 3C12.5 6 13.5 8 13.5 10.5C13.5 12 12.5 13 11 13C9.5 13 8 11.5 8 9.5C6 11 5 13.5 5 15.5C5 19.5 8 22 12 22Z" fill="#FF9600" />
                    </svg>
                    <div>
                      <span className="font-black text-zinc-800 text-sm block leading-none">{streak}</span>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">Days practiced</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border-l-2 border-zinc-100 pl-4">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                      <path d="M19 14C19 17.866 15.866 21 12 21C8.13401 21 5 17.866 5 14C5 10.134 8.13401 7 12 7C15.866 7 19 10.134 19 14Z" fill="#78C8F5" />
                    </svg>
                    <div>
                      <span className="font-black text-[#1CB0F6] text-sm block leading-none">{freezes}</span>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">Freezes available</span>
                    </div>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="border-2 border-zinc-100 rounded-3xl p-5">
                  <div className="grid grid-cols-7 gap-y-4 text-center">
                    {/* Days of week */}
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                      <div key={d} className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide mb-2">{d}</div>
                    ))}
                    
                    {/* Empty slots */}
                    {days.map((day, idx) => {
                      if (!day) return <div key={`empty-${idx}`} />;
                      
                      const active = isDayActive(day);
                      const isToday = day === currentDay;
                      const nextActive = isDayActive(day + 1);
                      const prevActive = isDayActive(day - 1);
                      
                      // Determine pill styling based on adjacent active days
                      let bgClass = "bg-transparent text-zinc-400";
                      if (active) {
                        bgClass = "bg-[#FF9600] text-white font-black shadow-[0_3px_0_0_#CC7800]";
                      } else if (isToday) {
                        bgClass = "bg-zinc-100 text-[#FF9600] font-black border-2 border-dashed border-[#FF9600]";
                      } else if (day < currentDay) {
                         bgClass = "bg-transparent text-zinc-300 font-medium";
                      } else {
                         bgClass = "bg-transparent text-zinc-300 font-medium";
                      }

                      // Connecting pill background
                      return (
                        <div key={idx} className="relative flex justify-center items-center h-10">
                          {/* Connection bars */}
                          {active && prevActive && day !== 1 && (
                            <div className="absolute left-0 w-1/2 h-8 bg-[#FF9600] -z-10" />
                          )}
                          {active && nextActive && day !== daysInMonth && (
                            <div className="absolute right-0 w-1/2 h-8 bg-[#FF9600] -z-10" />
                          )}
                          
                          {/* Day Circle */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 transition-all ${bgClass}`}>
                            {day}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Streak Goal */}
              <div className="px-6 mb-10">
                <h3 className="text-xl font-black text-zinc-800 mb-6">Streak Goal</h3>
                <div className="bg-white border-2 border-zinc-100 rounded-3xl p-6 relative">
                  
                  {/* Progress Track */}
                  <div className="h-4 bg-zinc-100 rounded-full w-full relative mb-8 overflow-visible">
                    <div className="absolute top-0 left-0 h-full bg-[#FF9600] rounded-full" style={{ width: '40%' }} />
                    <div className="absolute top-1 left-0 h-1.5 bg-white/30 rounded-full ml-2" style={{ width: '30%' }} />
                    
                    {/* Chests/Milestones */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-[10%] w-8 h-8 bg-white border-4 border-[#FF9600] rounded-lg shadow-sm flex items-center justify-center font-black text-[#FF9600] text-xs">
                      10
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 left-[50%] w-8 h-8 bg-zinc-100 border-4 border-zinc-200 rounded-lg flex items-center justify-center font-black text-zinc-400 text-xs">
                      20
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 right-0 w-8 h-8 bg-zinc-100 border-4 border-zinc-200 rounded-lg flex items-center justify-center font-black text-zinc-400 text-xs">
                      30
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center px-2">
                    <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Next Reward</span>
                    <span className="text-sm font-black text-[#FF9600]">20 Days</span>
                  </div>
                </div>
              </div>

              {/* Streak Society / Protection */}
              <div className="px-6">
                <h3 className="text-xl font-black text-zinc-800 mb-4">Streak Protection</h3>
                <div className="bg-zinc-50 border-2 border-zinc-100 rounded-3xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-200 rounded-2xl flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6 text-zinc-400" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-700 text-sm mb-1">Streak Shields</h4>
                    <p className="text-xs text-zinc-500 font-medium">Equip a shield to protect your streak if you miss a day. Available in the Market.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'friends' && (
            <div className="p-8 text-center flex flex-col items-center justify-center h-64">
              <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-xl font-black text-zinc-800 mb-2">Compete with Friends</h3>
              <p className="text-zinc-500 font-medium text-sm max-w-[250px]">
                Connect with other predators to see who maintains the longest streak.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
