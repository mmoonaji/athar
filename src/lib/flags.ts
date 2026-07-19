import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/monitoring/logger'

/**
 * Valid feature flags for the application.
 */
export type FeatureFlagKey = 'ENABLE_PUBLIC_SIGNUP' | 'ENABLE_AI_ASSISTANT' | 'ENABLE_USER_ACHIEVEMENTS'

/**
 * Returns whether a feature flag is enabled.
 * It checks the database feature_flags table first. 
 * If it fails or the flag is not found, it falls back to process.env[`NEXT_PUBLIC_FLAG_${key}`].
 */
export async function isFeatureEnabled(key: FeatureFlagKey): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('feature_flags')
      .select('enabled')
      .eq('key', key)
      .single()

    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116 is "Rows not found"
        logger.error(`Error fetching feature flag ${key}`, { error: error.message })
      }
      return checkEnvFallback(key)
    }

    return data.enabled
  } catch (err) {
    logger.error(`Exception checking feature flag ${key}`, { err: String(err) })
    return checkEnvFallback(key)
  }
}

function checkEnvFallback(key: FeatureFlagKey): boolean {
  const envVal = process.env[`NEXT_PUBLIC_FLAG_${key}`]
  return envVal === 'true' || envVal === '1'
}
