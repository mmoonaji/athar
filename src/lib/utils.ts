import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility helper to join Tailwind class names with proper override handling.
 * Combines clsx formatting with tailwind-merge logic.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
