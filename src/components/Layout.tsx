import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Target, Trophy, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { StreakChecker } from './StreakChecker';

export const Layout = () => {
  const { appUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Target, label: 'Missions', path: '/missions' },
    { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col md:flex-row">
      <StreakChecker />
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#050505]/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF6B00] rounded-lg flex items-center justify-center font-bold text-white">
            T1
          </div>
          <span className="font-black text-xl tracking-tighter italic">T1GER</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[#FF6B00] font-mono bg-[#FF6B00]/10 px-2 py-1 rounded-md border border-[#FF6B00]/20 shadow-[0_0_10px_rgba(255,107,0,0.2)]">
            <span className="text-sm">🔥</span>
            <span>{appUser?.streak || 0}</span>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-[#050505]/50 backdrop-blur-xl p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-[#FF6B00] rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-[0_0_20px_rgba(255,107,0,0.3)]">
            T1
          </div>
          <span className="font-black text-2xl tracking-tighter italic">T1GER</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${isActive
                  ? 'bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 shadow-[0_0_15px_rgba(255,107,0,0.1)]'
                  : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-100'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 px-2">
            <img
              src={appUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${appUser?.uid}`}
              alt="Profile"
              className="w-10 h-10 rounded-full border border-white/20"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{appUser?.displayName || 'Tiger'}</p>
              <p className="text-xs font-mono text-[#CCFF00]">Lvl {appUser?.level || 1} • {appUser?.xp || 0} XP</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-zinc-500 hover:bg-white/5 hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/10 flex justify-around p-3 pb-safe z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive ? 'text-orange-500' : 'text-zinc-500 hover:text-zinc-300'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
