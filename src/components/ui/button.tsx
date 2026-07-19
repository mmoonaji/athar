import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

/**
 * Reusable Button component styled with standard Athar theme,
 * supporting dynamic sizes, states, and outline bounds.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold rounded-xl transition-all outline-none focus:ring-2 focus:ring-primary-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none'
    
    const variants = {
      primary: 'bg-primary-700 text-white hover:bg-primary-800 shadow-sm',
      secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 shadow-sm',
      outline: 'border border-border bg-background text-foreground hover:bg-muted',
      ghost: 'hover:bg-muted text-muted-foreground hover:text-foreground',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    }

    const sizes = {
      sm: 'text-xs px-3 py-1.5 h-9',
      md: 'text-sm px-4 py-2.5 h-11',
      lg: 'text-base px-6 py-3.5 h-13',
      icon: 'h-11 w-11 p-0 shrink-0',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
