import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-[env(safe-area-inset-top)] left-0 right-0 z-[1000] p-4 flex justify-center pointer-events-none"
        >
          <div className="bg-red-500 text-white rounded-full px-4 py-2 flex items-center gap-2 shadow-lg pointer-events-auto">
            <WifiOff className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">Offline Mode</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
