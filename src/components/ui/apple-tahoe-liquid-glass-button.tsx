import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassButtonVariants = cva(
  "tiger-glass-button relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full border-0 bg-transparent tracking-tight text-white transition-transform duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020203]",
  {
    variants: {
      size: {
        default: "px-6 py-3.5 text-sm font-black uppercase tracking-widest",
        sm: "px-4 py-2.5 text-xs font-black uppercase tracking-widest",
        lg: "px-8 py-4 text-base font-black uppercase tracking-widest",
        icon: "h-11 w-11 p-0",
      },
      tone: {
        neutral: "text-zinc-100",
        accent: "text-accent",
        danger: "text-red-300",
        dark: "text-zinc-950",
      },
      intensity: {
        quiet: "tiger-glass-quiet",
        default: "tiger-glass-default",
        strong: "tiger-glass-strong",
      },
    },
    defaultVariants: {
      size: "default",
      tone: "neutral",
      intensity: "default",
    },
  },
);

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  contentClassName?: string;
  glassColor?: string;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, size, tone, intensity, contentClassName, glassColor, style, ...props }, ref) => {
    const filterId = React.useId().replace(/:/g, "");
    const customStyle = {
      ...style,
      "--tiger-glass-color": glassColor,
      "--tiger-glass-filter": `url(#tiger-liquid-glass-${filterId})`,
    } as React.CSSProperties;

    return (
      <>
        <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
          <filter id={`tiger-liquid-glass-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.035" numOctaves="2" seed="11" result="noise" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.35" result="blur" />
            <feDisplacementMap in="blur" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>

        <button
          className={cn(glassButtonVariants({ size, tone, intensity }), className)}
          ref={ref}
          style={customStyle}
          {...props}
        >
          <span className="tiger-glass-button-lens absolute inset-0 -z-10 rounded-[inherit] pointer-events-none" />
          <span className={cn("relative z-10 flex w-full select-none items-center justify-center gap-[inherit]", contentClassName)}>
            {children}
          </span>
        </button>
      </>
    );
  },
);

GlassButton.displayName = "GlassButton";

export { GlassButton, glassButtonVariants };
