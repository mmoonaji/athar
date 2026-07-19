import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number
}

/**
 * Reusable Progress status bar.
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary-700 transition-all duration-300 ease-out"
        style={{ transform: `translateX(${100 - Math.min(100, Math.max(0, value))}%` }}
        // Using translation with direction mapping for RTL layout compliance
      />
    </div>
  )
)

Progress.displayName = 'Progress'
