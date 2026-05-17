import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  deadline: Date;
  onExpire: () => void;
  onApproaching?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ deadline, onExpire, onApproaching }) => {
  const [timeLeft, setTimeLeft] = useState(deadline.getTime() - Date.now());
  const [approachingTriggered, setApproachingTriggered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = deadline.getTime() - Date.now();
      
      if (remaining <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        onExpire();
      } else {
        setTimeLeft(remaining);
        
        // Trigger approaching notification if less than 1 hour left
        if (remaining <= 3600000 && !approachingTriggered && onApproaching) {
          setApproachingTriggered(true);
          onApproaching();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, onExpire, onApproaching, approachingTriggered]);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  if (timeLeft <= 0) return <span className="text-red-500 font-mono text-xs">EXPIRED</span>;

  return (
    <div className="flex items-center gap-1 text-zinc-400 font-mono text-xs">
      <Clock className="w-3 h-3" />
      <span>{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
    </div>
  );
};
