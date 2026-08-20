import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Shield, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { useT1ger } from '../contexts/T1gerContext';
import { T1gerMascot3D } from './T1gerMascot3D';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
}

export const StreakModal: React.FC<StreakModalProps> = ({ isOpen, onClose, streak }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'squad'>('personal');
  const { appUser } = useAuth();
  const { language, learnStreak, tacticalStreak } = useBrain();
  const { stats } = useT1ger();
  const isEs = language === 'es';

  const freezes = appUser?.streakShields || 0;
  const hasStreak = streak > 0;

  const today = new Date();
  const currentMonth = today.toLocaleString(isEs ? 'es-ES' : 'en-US', { month: 'long' });
  const currentYear = today.getFullYear();

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < (firstDayOfMonth + 6) % 7; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const currentDay = today.getDate();
  const isDayActive = (day: number | null) => {
    if (!day) return false;
    return day <= currentDay && day > currentDay - streak;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-[#09090B] font-sans text-white select-none"
      >
        {/* Header Ribbon */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-b from-[#180A04] via-[#0E201B] to-[#09090B] px-5 pb-6 pt-[max(env(safe-area-inset-top),1rem)]">
          <div className="relative z-20 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={22} />
            </button>

            <span className="text-sm font-semibold tracking-[-0.01em] text-white truncate text-center flex-1">
              {isEs ? 'Racha y Disciplina' : 'Streak & Consistency'}
            </span>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--t1ger-orange)]/15 text-[var(--t1ger-orange)] font-mono text-sm font-bold">
              {streak}
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="relative z-20 mt-5 flex border-b border-white/10">
            <button
              className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors relative ${
                activeTab === 'personal' ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
              onClick={() => setActiveTab('personal')}
            >
              {isEs ? 'Personal' : 'Personal'}
              {activeTab === 'personal' && (
                <motion.div layoutId="streakTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[var(--t1ger-orange)] rounded-full" />
              )}
            </button>
            <button
              className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors relative ${
                activeTab === 'squad' ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
              onClick={() => setActiveTab('squad')}
            >
              {isEs ? 'Squad' : 'Squad'}
              {activeTab === 'squad' && (
                <motion.div layoutId="streakTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[var(--t1ger-orange)] rounded-full" />
              )}
            </button>
          </div>

          {/* Hero Section */}
          {activeTab === 'personal' && (
            <div className="relative z-10 flex items-center justify-between pt-6">
              <div>
                <span className="font-mono text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(255,115,0,0.4)]">
                  {streak}
                </span>
                <span className="mt-1 block text-sm font-semibold uppercase tracking-[0.14em] text-[#FF8A4C]">
                  {isEs ? (streak === 1 ? 'día de racha' : 'días de racha') : (streak === 1 ? 'day streak' : 'days streak')}
                </span>
              </div>

              {/* 3D Mascot Preview */}
              <div className="relative flex h-32 w-32 items-center justify-center">
                <T1gerMascot3D mood={hasStreak ? 'celebrate' : 'thinking'} closeUp className="h-full w-full" />
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-5 pb-10 pt-4">
          {activeTab === 'personal' && (
            <div className="space-y-6">
              {/* Dual Streak & Freeze Protection Badges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/8 bg-[#0D2E28] p-3 text-center">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--t1ger-orange)]/15 text-[var(--t1ger-orange)]">
                    <Flame size={20} />
                  </div>
                  <span className="mt-2 block font-mono text-base font-bold text-white">{learnStreak}</span>
                  <span className="block text-[10px] text-[#73968E]">{isEs ? 'Aprender' : 'Learn'}</span>
                </div>

                <div className="rounded-2xl border border-white/8 bg-[#0D2E28] p-3 text-center">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#10B981]/15 text-[#10B981]">
                    <Trophy size={20} />
                  </div>
                  <span className="mt-2 block font-mono text-base font-bold text-white">{tacticalStreak}</span>
                  <span className="block text-[10px] text-[#73968E]">{isEs ? 'Táctico' : 'Tactical'}</span>
                </div>

                <div className="rounded-2xl border border-white/8 bg-[#0D2E28] p-3 text-center">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#06B6D4]/15 text-[#06B6D4]">
                    <Shield size={20} />
                  </div>
                  <span className="mt-2 block font-mono text-base font-bold text-white">{freezes}</span>
                  <span className="block text-[10px] text-[#73968E]">{isEs ? 'Escudos' : 'Freezes'}</span>
                </div>
              </div>

              {/* Monthly Calendar View */}
              <div className="rounded-[1.6rem] border border-white/8 bg-[#0B2925] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-base font-semibold capitalize text-white">
                    {currentMonth} {currentYear}
                  </h2>
                  <div className="flex gap-1.5">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/60 hover:text-white">
                      <ChevronLeft size={18} />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/60 hover:text-white">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Day Labels */}
                <div className="grid grid-cols-7 gap-y-3 text-center">
                  {(isEs ? ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'] : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']).map((d) => (
                    <div key={d} className="text-[11px] font-semibold text-[#668B83]">
                      {d}
                    </div>
                  ))}

                  {/* Days */}
                  {days.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} />;
                    const active = isDayActive(day);
                    const isToday = day === currentDay;

                    return (
                      <div key={day} className="flex items-center justify-center py-1">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-mono font-semibold transition-all ${
                            active
                              ? 'bg-gradient-to-tr from-[#FF7300] to-[#F59E0B] text-white shadow-[0_0_12px_rgba(255,115,0,0.4)]'
                              : isToday
                              ? 'border border-[var(--t1ger-orange)] text-[var(--t1ger-orange)]'
                              : 'bg-white/[0.03] text-[#557871]'
                          }`}
                        >
                          {active ? <Flame size={16} className="fill-white stroke-none" /> : day}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'squad' && (
            <div className="space-y-4 pt-2 text-center text-[#87A9A2]">
              <div className="rounded-[1.6rem] border border-white/8 bg-[#0B2925] p-6">
                <Trophy size={36} className="mx-auto mb-3 text-[var(--t1ger-orange)]" />
                <h3 className="text-base font-semibold text-white">
                  {isEs ? 'Racha de la comunidad' : 'Community Streak'}
                </h3>
                <p className="mt-2 text-xs leading-5 text-[#7A9C95]">
                  {isEs
                    ? 'Compara tu constancia diaria con la comunidad T1GER y mantén la primera posición en la liga.'
                    : 'Compare your daily consistency with the T1GER community and hold top position in the league.'}
                </p>
                <div className="mt-5 rounded-xl border border-white/6 bg-white/[0.03] p-4 font-mono text-sm text-white">
                  {isEs ? 'Posición actual en Liga: Top 5%' : 'Current League Rank: Top 5%'}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
