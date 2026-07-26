import * as React from "react"
import { cn } from "../../lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, indicatorClassName, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 shadow-inner",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full flex-1 bg-zinc-900 transition-all duration-500 ease-out dark:bg-zinc-50 relative",
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      >
        <div className="absolute inset-0 bg-white/20" style={{ transform: 'skewX(-20deg)', width: '20%', animation: 'shimmer 2s infinite linear' }} />
      </div>
    </div>
  )
)
Progress.displayName = "Progress"

export { Progress }
