import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Trophy, Zap, Bell, MessageSquare, HandMetal, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Friends = () => {
  const { appUser } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [nudgeSent, setNudgeSent] = useState<string | null>(null);

  useEffect(() => {
    if (!appUser) return;

    const fetchFriends = async () => {
      const q = query(collection(db, 'friendships'), where('status', '==', 'accepted'));
      const snapshot = await getDocs(q);
      const friendIds = snapshot.docs.map(doc => {
        const data = doc.data();
        return data.userId1 === appUser.uid ? data.userId2 : data.userId1;
      });

      const friendsData = await Promise.all(friendIds.map(async (id) => {
        const userDoc = await getDoc(doc(db, 'users', id));
        const userData = userDoc.data();
        let bookTitle = 'Not reading';
        if (userData?.currentBookId) {
          const bookDoc = await getDoc(doc(db, 'books', userData.currentBookId));
          bookTitle = bookDoc.exists() ? bookDoc.data().title : 'Unknown book';
        }
        return { id, ...userData, bookTitle };
      }));
      setFriends(friendsData);
    };

    fetchFriends();
  }, [appUser]);

  const dummyFriends = [
    { name: 'Alex H.', streak: 45, insights: 12, avatar: '🦍', xp: 2450, bookTitle: '$100M Offers' },
    { name: 'Sarah J.', streak: 12, insights: 8, avatar: '👩‍💻', xp: 1820, bookTitle: 'Expert Secrets' },
    { name: 'David P.', streak: 0, insights: 2, avatar: '🎨', xp: 950, bookTitle: 'Zero to One' },
    { name: 'Jessica K.', streak: 8, insights: 5, avatar: '🚀', xp: 1200, bookTitle: 'The Lean Startup' },
  ];

  const displayFriends = friends.length > 0 ? friends.map(f => ({
    name: f.displayName || f.username,
    streak: f.streak || 0,
    insights: f.weeklyInsightsCount || 0,
    avatar: f.avatar || '👤',
    xp: f.xp || 0,
    bookTitle: f.bookTitle
  })) : dummyFriends;

  const handleNudge = (name: string) => {
    setNudgeSent(name);
    setTimeout(() => setNudgeSent(null), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-black tracking-tighter italic">FRIENDS</h1>
          <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Compete & Grow</p>
        </div>
        <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5">
          <Bell className="w-6 h-6 text-zinc-500" />
        </div>
      </header>

      {/* Weekly Leaderboard */}
      <section className="glass rounded-3xl p-6 border border-white/5">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-5 h-5 text-[var(--accent-main)]" />
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">Weekly Leaderboard</h3>
        </div>
        <div className="space-y-3">
          {displayFriends.sort((a, b) => b.xp - a.xp).map((friend, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-4 p-3 rounded-2xl border ${i === 0 ? 'bg-[var(--accent-main)]/10 border-[var(--accent-main)]/20' : 'bg-white/5 border-transparent'}`}
            >
              <span className="font-black text-zinc-500 w-4">{i + 1}</span>
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xl">
                {friend.avatar}
              </div>
              <div className="flex-1">
                <p className="font-black text-sm">{friend.name}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">{friend.xp} XP</p>
              </div>
              <div className="flex items-center gap-1 text-[var(--accent-main)]">
                <Zap className="w-3 h-3 fill-current" />
                <span className="font-black text-xs">{friend.streak}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Nudges & Challenges */}
      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">Nudge Friends</h3>
        <div className="grid grid-cols-2 gap-4">
          {displayFriends.filter(f => f.streak === 0).map((friend, i) => (
            <motion.div 
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNudge(friend.name)}
              className="glass p-4 rounded-3xl border border-white/5 flex flex-col items-center text-center cursor-pointer hover:bg-white/5 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-2xl mb-3 opacity-50">
                {friend.avatar}
              </div>
              <p className="font-black text-xs mb-1">{friend.name}</p>
              <p className="text-[10px] text-zinc-600 font-bold uppercase mb-4">Streak broken!</p>
              <button className="bg-zinc-800 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <HandMetal className="w-3 h-3" /> Nudge
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Nudge Confirmation Overlay */}
      <AnimatePresence>
        {nudgeSent && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-28 left-6 right-6 bg-[var(--accent-main)] text-black p-4 rounded-2xl flex items-center justify-center gap-3 font-black text-sm z-50 shadow-2xl"
          >
            <Zap className="w-5 h-5 fill-current" />
            Nudge sent to {nudgeSent}!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Feed */}
      <section className="glass rounded-3xl p-6 border border-white/5">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-zinc-500" />
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">Activity Feed</h3>
        </div>
        <div className="space-y-6">
          {displayFriends.slice(0, 2).map((activity, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0">
                {activity.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm leading-tight">
                  <span className="font-black">{activity.name}</span> completed <span className="text-[var(--accent-main)] font-bold">{activity.bookTitle}</span>
                </p>
                <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1">{i + 2}h ago</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
