import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';

interface MemoryShieldBadgeProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  status?: 'locked' | 'unstarted' | 'optimum' | 'decaying' | 'vulnerable';
  className?: string;
}

export const MemoryShieldBadge: React.FC<MemoryShieldBadgeProps> = ({
  percentage,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const isOptimum = percentage >= 80;
  const isDecaying = percentage >= 50 && percentage < 80;
  const isVulnerable = percentage < 50 && percentage > 0;
  const isUnstarted = percentage === 0;

  const colorConfig = isOptimum
    ? {
        stroke: '#3FC78E',
        text: 'text-[#3FC78E]',
        bg: 'bg-[#3FC78E]/10 border-[#3FC78E]/30',
        glow: 'drop-shadow-[0_0_8px_rgba(63,199,142,0.4)]',
        label: '100% Blindado',
        Icon: ShieldCheck,
      }
    : isDecaying
    ? {
        stroke: '#F59E0B',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        glow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]',
        label: `${percentage}% Escudo`,
        Icon: Shield,
      }
    : isVulnerable
    ? {
        stroke: '#EF4444',
        text: 'text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/30 animate-pulse',
        glow: 'drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]',
        label: `${percentage}% Vulnerable`,
        Icon: ShieldAlert,
      }
    : {
        stroke: '#52525B',
        text: 'text-zinc-400',
        bg: 'bg-zinc-800/40 border-zinc-700/40',
        glow: '',
        label: 'Sin iniciar',
        Icon: Zap,
      };

  const dimensions = {
    sm: { box: 28, strokeWidth: 3, radius: 10, font: 'text-[9px]' },
    md: { box: 40, strokeWidth: 3.5, radius: 15, font: 'text-xs' },
    lg: { box: 56, strokeWidth: 4, radius: 22, font: 'text-sm' },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`relative flex items-center justify-center ${colorConfig.glow}`}>
        <svg
          width={dimensions.box}
          height={dimensions.box}
          className="-rotate-90 transform"
        >
          {/* Background track */}
          <circle
            cx={dimensions.box / 2}
            cy={dimensions.box / 2}
            r={dimensions.radius}
            stroke="#27272A"
            strokeWidth={dimensions.strokeWidth}
            fill="transparent"
          />
          {/* Active progress track */}
          <circle
            cx={dimensions.box / 2}
            cy={dimensions.box / 2}
            r={dimensions.radius}
            stroke={colorConfig.stroke}
            strokeWidth={dimensions.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center percentage or icon */}
        <div className="absolute inset-0 flex items-center justify-center font-mono font-bold">
          <span className={`${dimensions.font} ${colorConfig.text}`}>
            {isUnstarted ? '0' : `${percentage}%`}
          </span>
        </div>
      </div>

      {showLabel && (
        <span
          className={`font-mono text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full border ${colorConfig.bg} ${colorConfig.text}`}
        >
          {colorConfig.label}
        </span>
      )}
    </div>
  );
};
