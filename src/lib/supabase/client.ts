import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client designed for use within Next.js Browser/Client Components.
 * Utilizes standard public environment variables.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
