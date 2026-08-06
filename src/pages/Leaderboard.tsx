import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Trophy, Medal, Loader2, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

export const Leaderboard = () => {
  const { appUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(
          collection(db, 'users_public'),
          orderBy('verifiedXP', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users', { currentUser: appUser });
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [appUser]);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      setTimeRemaining(formatDistanceToNow(endOfDay));
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-[430px] mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black flex items-center gap-3 font-sans uppercase tracking-tight">
            <Trophy className="w-8 h-8 text-[#FF6B00]" />
            Global Pride
          </h1>
          <div className="flex items-center gap-2 bg-white border border-zinc-800 px-3 py-1.5 rounded-xl font-mono text-xs text-zinc-500">
            <Clock className="w-4 h-4 text-[#FF6B00]" />
            {timeRemaining} left
          </div>
        </div>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 rounded-lg p-3 border border-zinc-200">
          Rankings are based on <span className="text-blue-600 font-black">Tier 1 Verified Actions</span> only. Personal Growth XP does not affect your rank.
        </p>
      </div>

      <div className="bg-white border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-md">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {users.map((user, index) => {
              const isCurrentUser = user.uid === appUser?.uid;
              
              return (
                <div 
                  key={user.uid} 
                  className={`p-4 flex items-center gap-4 transition-all ${
                    isCurrentUser ? 'border-l-4 border-[#FF6B00] bg-white' : 'hover:bg-white'
                  }`}
                >
                  <div className="w-8 text-center font-mono font-bold text-zinc-500">
                    {index === 0 ? <Medal className="w-6 h-6 text-yellow-500 mx-auto" /> : 
                     index === 1 ? <Medal className="w-6 h-6 text-zinc-500 mx-auto" /> : 
                     index === 2 ? <Medal className="w-6 h-6 text-amber-600 mx-auto" /> : 
                     `#${index + 1}`}
                  </div>
                  
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                    alt={user.displayName} 
                    className="w-12 h-12 rounded-full border border-zinc-800"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold truncate font-sans ${isCurrentUser ? 'text-[#FF6B00]' : 'text-zinc-800'}`}>
                      {user.displayName || 'Anonymous Tiger'}
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono capitalize">{user.niche} • Lvl {user.level}</p>
                  </div>
                  
                  <div className="text-right font-mono font-bold text-lg">
                    {user.verifiedXP || 0}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
