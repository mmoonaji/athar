'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/monitoring/logger'
import { AchievementKey, Achievement, ACHIEVEMENT_DEFINITIONS } from '@/lib/achievements-data'

/**
 * Returns all achievements unlocked by the current user.
 */
export async function getUserAchievements(): Promise<Achievement[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
      .from('user_achievements')
      .select('achievement_key')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: true })

    if (!data) return []

    return data
      .map((row) => ACHIEVEMENT_DEFINITIONS[row.achievement_key as AchievementKey])
      .filter(Boolean)
  } catch (err) {
    logger.warn('getUserAchievements failed', { error: String(err) })
    return []
  }
}

/**
 * Checks conditions and grants any newly earned achievements.
 * Called after completing a lesson.
 * Uses upsert with conflict handling to prevent duplicates safely.
 */
export async function checkAndGrantAchievements(userId: string): Promise<AchievementKey[]> {
  const granted: AchievementKey[] = []

  try {
    const supabase = await createClient()

    // Fetch current profile (streak) + completed lesson count
    const [profileRes, progressRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('current_streak')
        .eq('id', userId)
        .single(),
      supabase
        .from('user_progress')
        .select('lesson_id', { count: 'exact', head: true })
        .eq('profile_id', userId),
    ])

    const streak = profileRes.data?.current_streak ?? 0
    const completedCount = progressRes.count ?? 0

    // Determine which achievements are now earned
    const toGrant: AchievementKey[] = []
    if (completedCount >= 1) toGrant.push('FIRST_LESSON')
    if (completedCount >= 10) toGrant.push('10_LESSONS')
    if (streak >= 7) toGrant.push('7_DAY_STREAK')

    if (toGrant.length === 0) return granted

    // Upsert each achievement (ignore conflicts — already unlocked)
    for (const key of toGrant) {
      const { error } = await supabase
        .from('user_achievements')
        .insert({ user_id: userId, achievement_key: key })
        .select()

      // error code 23505 = unique violation (already have it) — that's fine
      if (!error) {
        granted.push(key)
        logger.info('Achievement granted', { userId, key })
      }
    }
  } catch (err) {
    logger.warn('checkAndGrantAchievements failed', { error: String(err) })
  }

  return granted
}
