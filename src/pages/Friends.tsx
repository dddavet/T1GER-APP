import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useBrain } from '../contexts/BrainContext';
import { Trophy, Zap, Bell, MessageSquare, HandMetal, UserPlus, Flame, Gift, Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FriendSearchModal } from '../components/FriendSearchModal';

export const Friends = () => {
  const { appUser } = useAuth();
  const { language } = useBrain();
  const isEs = language === 'es';

  const [friends, setFriends] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'quests' | 'feed'>('leaderboard');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [nudgeSent, setNudgeSent] = useState<string | null>(null);
  const [cheeredIds, setCheeredIds] = useState<string[]>([]);

  useEffect(() => {
    if (!appUser) return;

    const fetchFriends = async () => {
      try {
        const q = query(collection(db, 'friendships'), where('status', '==', 'accepted'));
        const snapshot = await getDocs(q);
        const friendIds = snapshot.docs.map(doc => {
          const data = doc.data();
          return data.userId1 === appUser.uid ? data.userId2 : data.userId1;
        });

        const friendsData = await Promise.all(friendIds.map(async (id) => {
          const userDoc = await getDoc(doc(db, 'users', id));
          const userData = userDoc.data();
          let bookTitle = 'Ofertas $100M';
          if (userData?.currentBookId) {
            const bookDoc = await getDoc(doc(db, 'books', userData.currentBookId));
            bookTitle = bookDoc.exists() ? bookDoc.data().title : 'Módulo de Aprendizaje';
          }
          return { id, ...userData, bookTitle };
        }));
        setFriends(friendsData);
      } catch (err) {
        console.warn("Using fallback friends demo data", err);
      }
    };

    fetchFriends();
  }, [appUser]);

  const fallbackFriends = [
    { id: 'f1', name: 'Alex Hormozi', streak: 45, xp: 2450, avatar: '🦍', bookTitle: 'Ofertas Grand Slam', milestone: '¡Alcanzó 45 días de racha!' },
    { id: 'f2', name: 'Sarah Jenkins', streak: 18, xp: 1820, avatar: '👩‍💻', bookTitle: 'Modelos de IA Ejecutiva', milestone: '¡Completó el Módulo de IA!' },
    { id: 'f3', name: 'David Perez', streak: 0, xp: 950, avatar: '🎨', bookTitle: 'Valuación de Empresas', milestone: '¡Racha en riesgo hoy!' },
    { id: 'f4', name: 'Jessica K.', streak: 8, xp: 1200, avatar: '🚀', bookTitle: 'Inversiones Compuestas', milestone: '¡Subió al Nivel 4!' },
  ];

  const displayFriends = friends.length > 0 ? friends.map(f => ({
    id: f.id,
    name: f.displayName || f.username || 'Amigo T1GER',
    streak: f.streak || 0,
    avatar: f.avatar || '👤',
    xp: f.xp || 0,
    bookTitle: f.bookTitle || 'Aprendizaje Diario',
    milestone: f.streak === 0 ? '¡Racha en riesgo hoy!' : `¡Alcanzó ${f.streak} días de racha!`
  })) : fallbackFriends;

  const handleNudge = async (friendId: string, name: string) => {
    setNudgeSent(name);
    setTimeout(() => setNudgeSent(null), 3000);

    if (appUser) {
      try {
        await addDoc(collection(db, 'nudges'), {
          senderId: appUser.uid,
          receiverId: friendId,
          timestamp: serverTimestamp()
        });
      } catch (e) {
        console.warn("Nudge fallback simulated", e);
      }
    }
  };

  const handleCheer = (id: string) => {
    if (!cheeredIds.includes(id)) {
      setCheeredIds(prev => [...prev, id]);
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([15, 30, 15]);
      }
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto font-sans text-zinc-900 select-none">
      
      {/* HEADER BAR */}
      <header className="flex justify-between items-center px-1 pt-2">
        <div className="text-left">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-zinc-900 leading-none">
            {isEs ? 'AMIGOS & LIGA' : 'FRIENDS & LEAGUE'}
          </h1>
          <p className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#FF7300] mt-1">
            {isEs ? 'Compite, apoya y mantén tu racha' : 'Compete, cheer & stay consistent'}
          </p>
        </div>

        <button
          onClick={() => setSearchModalOpen(true)}
          className="p-3 rounded-2xl bg-[#FF7300] text-white border-2 border-[#CC5C00] border-b-4 border-b-[#AA4C00] active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer shadow-sm flex items-center gap-1.5 font-black text-xs uppercase"
        >
          <UserPlus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">{isEs ? 'Agregar' : 'Add'}</span>
        </button>
      </header>

      {/* NAVIGATION TAB BAR (Duolingo Style 3D Tabs) */}
      <div className="grid grid-cols-3 gap-2 bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200">
        {[
          { id: 'leaderboard', label: isEs ? 'Liga' : 'League', icon: <Trophy className="w-4 h-4" /> },
          { id: 'quests', label: isEs ? 'Misión Duo' : 'Duo Quest', icon: <Gift className="w-4 h-4" /> },
          { id: 'feed', label: isEs ? 'Actividad' : 'Feed', icon: <MessageSquare className="w-4 h-4" /> }
        ].map(tab => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2.5 px-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-white text-zinc-900 border-2 border-zinc-300 border-b-4 border-b-zinc-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: WEEKLY LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <section className="space-y-4">
          <div className="p-5 bg-white border-2 border-zinc-200 border-b-4 border-b-zinc-300 rounded-3xl space-y-4 text-left shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#FF7300]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">
                  {isEs ? 'Liga Semanal de Amigos' : 'Weekly Friend League'}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-mono text-[10px] font-black uppercase border border-amber-200">
                Termina en 3d 12h
              </span>
            </div>

            <div className="space-y-2.5">
              {displayFriends.sort((a, b) => b.xp - a.xp).map((friend, i) => {
                const rankBadges = ['🥇', '🥈', '🥉'];
                const isTop3 = i < 3;

                return (
                  <motion.div
                    key={friend.id || i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all ${
                      i === 0 
                        ? 'bg-amber-50/80 border-amber-300 border-b-4 border-b-amber-400' 
                        : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <span className="font-black text-sm w-6 text-center text-zinc-600">
                      {isTop3 ? rankBadges[i] : `${i + 1}`}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-xl shadow-xs shrink-0">
                      {friend.avatar}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-extrabold text-xs text-zinc-900 truncate">{friend.name}</p>
                      <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase">{friend.xp} XP</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#FF7300] bg-white px-2.5 py-1 rounded-xl border border-zinc-200 shadow-xs">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span className="font-black text-xs">{friend.streak}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Nudges / Reminders for broken streaks */}
          <div className="p-5 bg-white border-2 border-zinc-200 border-b-4 border-b-zinc-300 rounded-3xl space-y-3 text-left shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-2">
              <HandMetal className="w-4 h-4 text-[#FF7300]" /> {isEs ? 'Empujones de Racha' : 'Streak Nudges'}
            </h3>
            <p className="text-[11px] font-semibold text-zinc-500 leading-snug">
              {isEs ? 'Envía un recordatorio instantáneo a los amigos que aún no entrenan hoy.' : 'Send a quick reminder to friends who haven\'t practiced today.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {displayFriends.filter(f => f.streak === 0 || f.streak < 5).map((friend) => (
                <div
                  key={friend.id}
                  className="p-3 rounded-2xl bg-zinc-50 border-2 border-zinc-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{friend.avatar}</span>
                    <div className="text-left">
                      <p className="font-extrabold text-xs text-zinc-800">{friend.name}</p>
                      <p className="text-[9px] font-bold text-red-500 uppercase">Sin entrenar hoy</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleNudge(friend.id, friend.name)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 text-white font-black text-[10px] uppercase tracking-wider border-b-2 border-black active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-[#FF7300] fill-current" />
                    <span>Nudge</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: FRIENDS QUESTS (DUOLINGO DUO CO-OP) */}
      {activeTab === 'quests' && (
        <section className="space-y-4 text-left">
          <div className="p-6 bg-amber-50/90 border-2 border-amber-300 border-b-4 border-b-amber-400 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#FF7300] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" /> {isEs ? 'Misión en Pareja de la Semana' : 'Weekly Duo Quest'}
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-800 uppercase">Semana 30</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black italic uppercase tracking-tight text-zinc-900">
                {isEs ? 'Acumular 500 XP en Equipo' : 'Earn 500 XP Together'}
              </h2>
              <p className="text-xs font-bold text-amber-900/80 leading-relaxed">
                {isEs ? 'Formaste equipo con Alex Hormozi. ¡Completen lecciones juntos para desbloquear el cofre legendario!' : 'You were paired with Alex Hormozi. Complete lessons together to unlock the legend chest!'}
              </p>
            </div>

            {/* Duo Partner Avatars & Combined Progress Bar */}
            <div className="bg-white/90 border border-amber-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  <span className="text-xs font-black text-zinc-800">Tú (220 XP)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-zinc-800">Alex (180 XP)</span>
                  <span className="text-2xl">🦍</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden border border-amber-200">
                  <motion.div
                    className="h-full bg-[#FF7300] rounded-full shadow-[0_0_10px_#FF7300]"
                    animate={{ width: '80%' }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono font-black text-amber-800">
                  <span>400 / 500 XP</span>
                  <span>80% COMPLETADO</span>
                </div>
              </div>
            </div>

            {/* Quest Rewards */}
            <div className="flex items-center justify-between pt-1 text-xs font-extrabold text-amber-900">
              <span className="flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-[#FF7300]" />
                {isEs ? 'Recompensa:' : 'Reward:'} +150 Monedas & 🛡️ Escudo de Racha
              </span>
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: ACTIVITY FEED & CELEBRATIONS */}
      {activeTab === 'feed' && (
        <section className="space-y-3 text-left">
          {displayFriends.map((activity, i) => {
            const isCheered = cheeredIds.includes(activity.id);

            return (
              <div
                key={activity.id || i}
                className="p-4 rounded-3xl bg-white border-2 border-zinc-200 border-b-4 border-b-zinc-300 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xl shrink-0">
                      {activity.avatar}
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-zinc-900">{activity.name}</p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Hace {i + 1}h</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[9px] font-black uppercase border border-emerald-200">
                    Logro
                  </span>
                </div>

                <div className="pl-1 space-y-1">
                  <p className="text-xs font-bold text-zinc-800 leading-snug">
                    {activity.milestone}
                  </p>
                  <p className="text-[11px] font-semibold text-zinc-500">
                    Estudiando: <span className="text-[#FF7300] font-bold">{activity.bookTitle}</span>
                  </p>
                </div>

                {/* High Five / Cheer Button */}
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <button
                    onClick={() => handleCheer(activity.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-b-3 transition-all cursor-pointer flex items-center gap-2 ${
                      isCheered
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200 active:border-b-0 active:translate-y-0.5'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isCheered ? 'fill-current text-red-500' : ''}`} />
                    <span>{isCheered ? '¡Celebrado! 🙌' : 'Chocar Cinco 🙌'}</span>
                  </button>
                  {isCheered && <span className="text-[10px] font-bold text-emerald-600 animate-pulse">+10 XP para ambos!</span>}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Toast Notification for Nudges */}
      <AnimatePresence>
        {nudgeSent && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-24 left-6 right-6 max-w-sm mx-auto bg-zinc-900 text-white p-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-wider z-50 shadow-2xl border-2 border-black"
          >
            <Zap className="w-4 h-4 text-[#FF7300] fill-current" />
            <span>¡Empujón de racha enviado a {nudgeSent}!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Friend Search Modal */}
      <FriendSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
};
