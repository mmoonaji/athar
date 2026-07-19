import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'muted' | 'outline' | 'success'
}

/**
 * Reusable Badge UI component.
 */
export function Badge({ className, variant = 'primary', ...props }: BadgeProps) {
  const baseStyles =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors'
  
  const variants = {
    primary: 'bg-primary-50 text-primary-700 border border-primary-100',
    secondary: 'bg-secondary-50 text-secondary-700 border border-secondary-100',
    muted: 'bg-muted text-muted-foreground border border-border/40',
    outline: 'text-foreground border border-border',
    success: 'bg-green-50 text-green-700 border border-green-100',
  }

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props} />
  )
}
