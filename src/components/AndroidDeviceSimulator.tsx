import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Bell, 
  RotateCcw, 
  Smartphone, 
  Download, 
  ChevronRight,
  Flame
} from 'lucide-react';

interface AndroidDeviceSimulatorProps {
  children: React.ReactNode;
  onResetOnboarding?: () => void;
  onTriggerNotification?: () => void;
}

export const AndroidDeviceSimulator: React.FC<AndroidDeviceSimulatorProps> = ({
  children,
  onResetOnboarding,
  onTriggerNotification,
}) => {
  const [timeString, setTimeString] = useState('20:45');
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<'phone' | 'full'>('phone');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  const triggerTestNotification = () => {
    setShowNotificationDrawer(true);
    if (onTriggerNotification) onTriggerNotification();
  };

  if (activeTab === 'full') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full bg-[#050507] text-[#E4E4E7] flex flex-col items-center justify-center p-2 sm:p-6 select-none font-sans">
      {/* Top Floating Simulator Control Bar */}
      <header className="mb-4 w-full max-w-lg flex items-center justify-between bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl px-4 py-2.5 shadow-2xl z-50 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono font-bold tracking-wider text-zinc-300 uppercase">
            Android 14 Simulator
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              window.location.href = '/?onboarding=true&sim_platform=android&simulator=true';
            }}
            title="Reiniciar Onboarding"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FF7300]" />
            <span className="hidden sm:inline font-semibold text-[11px]">Onboarding</span>
          </button>

          <button
            onClick={triggerTestNotification}
            title="Simular Notificación Push de Racha"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FF7300]/15 hover:bg-[#FF7300]/25 text-[#FF7300] border border-[#FF7300]/30 transition cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold text-[11px]">Push Push</span>
          </button>

          <a
            href="/dist-apk/t1ger-app-debug.apk"
            download
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold text-[11px]">Descargar APK</span>
          </a>
        </div>
      </header>

      {/* Android Device Chassis / Frame */}
      <div className="relative w-full max-w-[390px] h-[812px] max-h-[92vh] bg-black rounded-[48px] p-3 shadow-[0_0_0_12px_#18181B,0_25px_65px_rgba(0,0,0,0.9),0_0_80px_rgba(255,115,0,0.15)] border border-zinc-700/60 flex flex-col overflow-hidden ring-1 ring-white/10">
        {/* Dynamic Android Punch Hole Camera */}
        <div className="absolute top-4.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0A0A0C] border border-zinc-800/80 z-50 pointer-events-none flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#030712]/90 ring-1 ring-sky-950/40" />
        </div>

        {/* Android Status Bar */}
        <div className="relative w-full h-8 px-6 flex items-center justify-between text-[11px] font-medium text-zinc-300 z-40 shrink-0 select-none">
          <span className="font-semibold tracking-tight">{timeString}</span>

          <div className="flex items-center gap-2 text-zinc-300">
            <span className="text-[10px] font-mono tracking-tighter text-zinc-400">5G</span>
            <Signal className="w-3 h-3 text-zinc-300" />
            <Wifi className="w-3 h-3 text-zinc-300" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-mono">96%</span>
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Push Notification Drawer Dropdown Overlay */}
        {showNotificationDrawer && (
          <div className="absolute top-10 left-3 right-3 z-50 animate-in slide-in-from-top-4 duration-200">
            <div className="bg-[#121216]/95 backdrop-blur-xl border border-[#FF7300]/40 rounded-3xl p-4 shadow-2xl space-y-2.5 text-left text-zinc-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#FF7300] flex items-center justify-center text-black font-black text-xs">
                    🐅
                  </div>
                  <span className="font-black text-xs tracking-wide uppercase text-[#FF7300]">
                    T1GER • Racha a las 10:00 PM
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">ahora</span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#FF7300] fill-[#FF7300]" />
                  ¡Tu racha está en riesgo! Reclama tu tiempo
                </h4>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  Hoy pasaste 3.5h en redes sociales. Solo necesitas 4 minutos en T1GER para proteger tu racha y no perder $19,110 USD en costo de oportunidad.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
                <button
                  onClick={() => setShowNotificationDrawer(false)}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 font-medium px-2 py-1"
                >
                  Descartar
                </button>
                <button
                  onClick={() => {
                    setShowNotificationDrawer(false);
                    window.location.href = '/?view=learn&sim_platform=android';
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#FF7300] text-black font-black text-xs flex items-center gap-1 shadow-lg shadow-[#FF7300]/30"
                >
                  Abrir Misión <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Screen Bezel Inner Container */}
        <div className="relative flex-1 w-full min-h-0 rounded-[36px] overflow-hidden bg-[#071C19] flex flex-col">
          {children}
        </div>

        {/* Android Navigation Bar Pill */}
        <div className="w-full h-5 flex items-center justify-center shrink-0">
          <div className="w-32 h-1 rounded-full bg-zinc-600/80" />
        </div>
      </div>
    </div>
  );
};
