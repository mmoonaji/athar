'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/monitoring/logger'

export type LearningGoal = 'aqeedah_basics' | 'review' | 'daily_habit'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export interface UserPreferences {
  user_id: string
  learning_goal: LearningGoal
  daily_goal_minutes: 5 | 10 | 15
  experience_level: ExperienceLevel
  preferred_topics: string[]
  onboarding_completed_at: string | null
}

/**
 * Checks if the current user has completed onboarding.
 * Returns null if user is not authenticated.
 */
export async function getOnboardingStatus(): Promise<{
  completed: boolean
  preferences: UserPreferences | null
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { completed: false, preferences: null }

    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!data || !data.onboarding_completed_at) {
      return { completed: false, preferences: null }
    }

    return {
      completed: true,
      preferences: data as UserPreferences,
    }
  } catch (err) {
    logger.warn('getOnboardingStatus failed', { error: String(err) })
    return { completed: false, preferences: null }
  }
}

/**
 * Saves onboarding preferences and marks onboarding as complete.
 * Sets a cookie so the proxy can skip the DB check on future requests.
 * Redirects to /journey on success.
 */
export async function saveOnboardingPreferences(
  goal: LearningGoal,
  dailyMinutes: 5 | 10 | 15,
  experienceLevel: ExperienceLevel = 'beginner'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'يجب تسجيل الدخول أولاً' }

    const now = new Date().toISOString()

    const { error } = await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: user.id,
          learning_goal: goal,
          daily_goal_minutes: dailyMinutes,
          experience_level: experienceLevel,
          onboarding_completed_at: now,
          updated_at: now,
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      logger.error('saveOnboardingPreferences DB error', { error: error.message })
      return { success: false, error: 'حدث خطأ أثناء حفظ التفضيلات' }
    }

    // Set a persistent cookie so the proxy can skip DB checks
    const cookieStore = await cookies()
    cookieStore.set('athar_onboarded', '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
    })

    logger.info('Onboarding completed', { userId: user.id })
  } catch (err) {
    logger.error('saveOnboardingPreferences unexpected error', { error: String(err) })
    return { success: false, error: 'خطأ غير متوقع' }
  }

  redirect('/journey')
}
