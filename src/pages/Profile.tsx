import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useT1ger } from '../contexts/T1gerContext';
import { useBrain } from '../contexts/BrainContext';
import { User, Award, History, Settings, LogOut, ChevronRight, BrainCircuit, Users, Crown, Sparkles, RefreshCcw, Flame } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

export const Profile = () => {
  const { appUser, logout, updateAppUser } = useAuth();
  const { stats, user, setActiveView, spendCoins } = useT1ger();
  const { competencies, learnStreak, tacticalStreak, resetBrain } = useBrain();
  const [showMarket, setShowMarket] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  // Live competency scores from the Brain
  const healthData = [
    { subject: 'Offer', A: Math.round(competencies.offer) },
    { subject: 'Sales', A: Math.round(competencies.sales) },
    { subject: 'Marketing', A: Math.round(competencies.marketing) },
    { subject: 'Mindset', A: Math.round(competencies.mindset) },
    { subject: 'Operations', A: Math.round(competencies.operations) },
  ];

  useEffect(() => {
    if (!appUser) return;
    const fetchSessions = async () => {
      const q = query(collection(db, 'users', appUser.uid, 'coachingSessions'), orderBy('timestamp', 'desc'), limit(3));
      const snapshot = await getDocs(q);
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchSessions();
  }, [appUser]);

  return (
    <div className="space-y-8 pb-12 relative z-10">

      <header className="flex flex-col items-center text-center pt-8 relative">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-28 h-28 rounded-full flex items-center justify-center mb-6 border-[4px] border-accent shadow-3d-strong overflow-hidden relative group cursor-pointer"
        >
          {appUser?.photoURL ? (
            <img src={appUser.photoURL} alt={appUser.displayName || 'User'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-4xl">
              {appUser?.displayName?.charAt(0) || '🐅'}
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
             <Settings className="w-6 h-6 text-white" />
          </div>
        </motion.div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <input
              type="text"
              defaultValue={appUser?.displayName || 'Founder'}
              onBlur={(e) => updateAppUser({ displayName: e.target.value })}
              className="bg-transparent text-3xl font-black italic uppercase tracking-tighter text-center focus:outline-none focus:text-accent border-b border-transparent focus:border-accent/30 w-full max-w-[240px] transition-all"
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="px-2 py-0.5 bg-accent text-black rounded text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-3d shadow-accent/20">
              <Crown className="w-2.5 h-2.5" /> APEX
            </div>
            <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">•</span>
            <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">{appUser?.email}</span>
          </div>
        </div>
        
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 liquid-glass rounded-full border-white/5">
           <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_8px_#00E5FF]" />
           <p className="text-[#00E5FF] font-black uppercase text-[9px] tracking-widest drop-shadow-[0_0_5px_rgba(0,229,255,0.4)]">
             {appUser?.niche || 'Ambitious Entrepreneur'}
           </p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Learn Streak', value: learnStreak, color: '#00E5FF', shadow: 'rgba(0,229,255,0.3)' },
          { label: 'Tactical Streak', value: tacticalStreak, color: 'var(--accent-main)', shadow: 'rgba(255,107,0,0.3)' },
          { label: 'Total XP', value: stats.xp, color: 'var(--accent-main)', shadow: 'rgba(204,255,0,0.3)' },
        ].map((stat, i) => (
          <div key={i} className="liquid-glass p-4 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <p className="text-[10px] font-black uppercase text-zinc-500 mb-1 z-10 leading-none">{stat.label}</p>
            <p className="font-black text-2xl z-10" style={{ color: stat.color, textShadow: `0 0 15px ${stat.shadow}` }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Black Market Card */}
      <section className="relative overflow-hidden p-6 rounded-3xl border border-yellow-500/20 bg-yellow-500/5 shadow-lg group">
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full blur-[60px] bg-yellow-500/10 pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black font-mono text-yellow-500 uppercase tracking-widest block mb-1">
              🏦 T1GER BLACK MARKET
            </span>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-2">
              🪙 {stats.coins} <span className="text-xs text-zinc-500 font-bold lowercase tracking-normal">T1GER Coins</span>
            </h3>
            <p className="text-[10px] text-zinc-400 mt-2 font-medium leading-relaxed max-w-[240px]">
              Gasta tus monedas en escudos de racha y boosters tácticos para proteger tu progreso.
            </p>
          </div>
          <button 
            onClick={() => setShowMarket(true)}
            className="px-5 py-3 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase text-[10px] tracking-widest shadow-3d shadow-yellow-500/20 cursor-pointer active:scale-95 transition-all"
          >
            Entrar 🪙
          </button>
        </div>
      </section>

      {/* Business Health Radar */}
      <section className="liquid-glass rounded-3xl p-6 relative overflow-hidden">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-[#00E5FF]" />
          Vector Analysis
        </h3>
        <div className="h-64 -mx-6 relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={healthData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#00E5FF', fontSize: 10, fontWeight: 900, opacity: 0.8 }} />
              <Radar name="Health" dataKey="A" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          {healthData.every(d => d.A === 0) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-3xl">
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Awaiting Tactical Data...</p>
            </div>
          )}
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-[var(--accent-main)] drop-shadow-[0_0_5px_rgba(204,255,0,0.4)]">Achievements</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar snap-x snap-mandatory">
          {[
            { icon: '🔥', label: '7 Day Streak' },
            { icon: '📚', label: 'First Book' },
            { icon: '💎', label: 'Offer Master' },
            { icon: '🤝', label: 'Networker' },
          ].map((badge, i) => (
            <div key={i} className="flex-shrink-0 w-24 h-24 liquid-glass rounded-3xl flex flex-col items-center justify-center text-center p-2 snap-center relative before:absolute before:inset-0 before:bg-white/[0.02] before:rounded-3xl hover:-translate-y-1 transition-transform">
              <span className="text-3xl mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{badge.icon}</span>
              <span className="text-[9px] font-black uppercase leading-tight text-zinc-300">{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Coaching History */}
      <section className="liquid-glass rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-[var(--accent-main)]" />
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300">Mission Logs</h3>
        </div>
        <div className="space-y-4">
          {sessions.length > 0 ? sessions.map((session, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all cursor-pointer group">
              <div>
                <p className="text-sm font-bold text-zinc-200">{session.summary || 'Coaching Session'}</p>
                <p className="text-[10px] text-[var(--accent-main)] font-bold uppercase tracking-widest">{new Date(session.timestamp?.seconds * 1000).toLocaleDateString()}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors group-hover:translate-x-1" />
            </div>
          )) : (
            <p className="text-xs text-zinc-500 font-bold italic">No logs detected in the T1GER Engine.</p>
          )}
        </div>
      </section>

      {/* Customization & Settings */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
           <Settings className="w-4 h-4 text-zinc-600" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">System Preferences</h3>
        </div>

        <div className="liquid-glass rounded-[2rem] p-6 space-y-8 shadow-3d">
          {/* Goal Setting */}
          <div className="space-y-3">
            <label className="block text-[9px] font-black uppercase text-zinc-600 tracking-widest ml-1">Current Directive (90D Goal)</label>
            <div className="relative group">
              <input
                type="text"
                defaultValue={appUser?.goal}
                onBlur={(e) => updateAppUser({ goal: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-accent/40 focus:bg-accent/[0.03] transition-all text-white placeholder-zinc-800"
                placeholder="What is your primary objective?"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Sparkles className="w-4 h-4 text-accent/40" />
              </div>
            </div>
          </div>

          {/* Niche Selection */}
          <div className="space-y-3">
            <label className="block text-[9px] font-black uppercase text-zinc-600 tracking-widest ml-1">Operational Niche</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'entrepreneur', label: 'CEO/Founder', icon: '🚀' },
                { id: 'creativity', label: 'Creator', icon: '🎨' },
                { id: 'fitness', label: 'Athlete', icon: '⚡' },
                { id: 'investor', label: 'Capitalist', icon: '💰' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => updateAppUser({ niche: item.id })}
                  className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all active:scale-95 ${
                    appUser?.niche === item.id 
                      ? 'liquid-glass-accent border-accent/30 shadow-3d-accent' 
                      : 'bg-black/20 border-white/5 text-zinc-600 hover:border-white/10 hover:bg-white/[0.02]'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className={`font-black text-[10px] uppercase tracking-tight ${appUser?.niche === item.id ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Predator Profile Visibility */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
             <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-tight text-white">Predator Profile</p>
                <p className="text-[9px] font-medium text-zinc-500 uppercase">Visible on Global Leaderboards</p>
             </div>
             <button 
               onClick={() => updateAppUser({ isPro: !appUser?.isPro })} // Reusing isPro as a mock for public toggle if needed
               className={`w-12 h-6 rounded-full transition-all relative ${appUser?.isPro ? 'bg-accent shadow-3d-accent' : 'bg-zinc-800'}`}
             >
                <motion.div 
                  animate={{ x: appUser?.isPro ? 26 : 2 }}
                  className={`absolute top-1 w-4 h-4 rounded-full shadow-md ${appUser?.isPro ? 'bg-black' : 'bg-zinc-500'}`} 
                />
             </button>
          </div>

          {/* Path Controls */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <button
              onClick={() => {
                if (window.confirm("¿Estás seguro de que deseas reiniciar tu cuenta a CERO? Esto borrará tu historial de lecciones, competencias, rachas y monedas en la nube para que puedas experimentar el onboarding de Duolingo desde el principio.")) {
                  resetBrain();
                  updateAppUser({
                    onboardingStep: 'identity',
                    onboardingComplete: false,
                    niche: 'none',
                    goal: '',
                    xp: 0,
                    level: 1,
                    streak: 0,
                    learningStyle: undefined,
                    experienceLevel: undefined,
                    ageRange: undefined
                  });
                  setActiveView('onboarding');
                }
              }}
              className="w-full p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-zinc-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/[0.05] hover:text-white transition-all flex items-center justify-center gap-3"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Recalibrate Learning Path (Reset Complete)
            </button>
            
            <button
              onClick={() => {
                if (window.confirm("WARNING: THIS WILL WIPE ALL LOCAL PROGRESS AND LOGS. ARE YOU SURE?")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="w-full p-5 rounded-2xl border border-red-500/10 bg-red-500/5 text-red-500/60 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500/10 hover:text-red-500 transition-all"
            >
              Nuke Protocol (Factory Reset)
            </button>
          </div>
        </div>
      </section>

      {/* Public Profile Preview */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
           <Users className="w-4 h-4 text-zinc-600" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Public Reputation</h3>
        </div>
        
        <div className="liquid-glass rounded-[2rem] p-6 border-accent/10 relative overflow-hidden">
           <div className="absolute top-0 right-0 px-3 py-1 bg-accent/10 border-b border-l border-white/5 rounded-bl-xl">
              <span className="text-[8px] font-black uppercase text-accent tracking-widest">Live Preview</span>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-zinc-900 border border-accent/30 flex items-center justify-center text-2xl shadow-3d-accent shadow-accent/10">
                 {appUser?.displayName?.charAt(0) || '🐅'}
              </div>
              <div className="flex-1">
                 <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm uppercase tracking-tight text-white">{appUser?.displayName || 'Founder'}</span>
                    <Crown className="w-3 h-3 text-amber-400" />
                 </div>
                 <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                       <Sparkles className="w-2.5 h-2.5 text-accent" />
                       <span className="text-[9px] font-black text-zinc-400 uppercase">LVL {appUser?.level || 1}</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <Flame className="w-2.5 h-2.5 text-orange-500" />
                       <span className="text-[9px] font-black text-zinc-400 uppercase">{appUser?.streak || 0}D STREAK</span>
                    </div>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-sm font-black text-accent">{appUser?.xp || 0}</p>
                 <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Total XP</p>
              </div>
           </div>
           
           <p className="mt-4 text-[10px] text-zinc-500 italic font-medium leading-relaxed border-t border-white/5 pt-4">
              "Tactical objective: {appUser?.goal || 'Establishing dominant market position.'}"
           </p>
        </div>
      </section>

      {/* Logout */}
      <div className="pt-4">
        <button 
          onClick={logout}
          className="w-full liquid-glass p-5 rounded-3xl border-red-500/20 hover:bg-red-500/10 flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-4 text-red-500">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-black text-sm uppercase tracking-widest">Terminate Session</span>
          </div>
          <ChevronRight className="w-4 h-4 text-red-500/50 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Black Market Modal */}
      <AnimatePresence>
        {showMarket && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#020204]/95 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="relative w-full max-w-sm rounded-[2.5rem] border border-white/10 bg-[#0c0c10] p-6 shadow-2xl space-y-6">
              
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div>
                  <span className="text-[9px] font-black font-mono text-yellow-500 uppercase tracking-widest block mb-1">
                    🏦 T1GER BANKING
                  </span>
                  <h2 className="text-lg font-black italic uppercase tracking-tighter text-white">
                    MERCADO NEGRO
                  </h2>
                </div>
                <button 
                  onClick={() => setShowMarket(false)}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Balance */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400 uppercase">Tu saldo disponible:</span>
                <span className="text-sm font-black text-yellow-500 font-mono">🪙 {stats.coins} COINS</span>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 hide-scrollbar">
                {[
                  {
                    id: 'streak_shield',
                    title: '🛡️ ESCUDO DE RACHA',
                    description: 'Te protege si olvidas tu lección. Se consume automáticamente.',
                    cost: 150,
                    badge: appUser?.streakShields ? `${appUser.streakShields} poseídos` : '0 poseídos',
                    action: async () => {
                      if (stats.coins < 150) {
                        alert("Fondos insuficientes. ¡Caza más XP para ganar monedas!");
                        return;
                      }
                      await spendCoins(150);
                      await updateAppUser({
                        streakShields: (appUser?.streakShields || 0) + 1
                      });
                      alert("¡Escudo de Racha adquirido con éxito! 🛡️");
                    }
                  },
                  {
                    id: 'double_xp',
                    title: '🔥 BOOSTER DOBLE XP',
                    description: 'Duplica las ganancias de XP durante las próximas 24 horas.',
                    cost: 300,
                    badge: 'Boost Activo: No',
                    action: () => {
                      alert("¡Artículo en desarrollo! Estará disponible en el próximo release.");
                    }
                  },
                  {
                    id: 'predator_mode',
                    title: '⚡ ENERGÍA PREDATOR',
                    description: 'Activa instantáneamente el Predator Mode sin requisitos.',
                    cost: 600,
                    badge: 'Premium',
                    action: () => {
                      alert("¡Artículo exclusivo de élite! Estará disponible próximamente.");
                    }
                  }
                ].map(item => (
                  <div key={item.id} className="p-4 rounded-[1.5rem] bg-white/[0.01] border border-white/5 flex flex-col justify-between gap-3 hover:bg-white/[0.03] transition-all">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-xs font-black text-white uppercase tracking-tight">{item.title}</h4>
                        <span className="text-[8px] font-black font-mono text-yellow-500/60 uppercase">{item.badge}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-normal">{item.description}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <span className="text-xs font-mono font-black text-yellow-500">🪙 {item.cost} COINS</span>
                      <button
                        onClick={item.action}
                        disabled={stats.coins < item.cost && item.id === 'streak_shield'}
                        className={`px-3 py-1.5 rounded-xl font-black uppercase text-[8px] tracking-wider transition-all duration-200 ${
                          stats.coins >= item.cost 
                            ? 'bg-yellow-500 text-black shadow-md hover:bg-yellow-400 active:scale-95' 
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
