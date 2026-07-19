'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { ContentBlock } from '@/types/content'

// Simple result state wrapper
export interface ActionState<T> {
  success: boolean
  data?: T
  error?: string
}

// Zod schemas for input validation
const slugSchema = z.string().min(1, 'الرمز البريدي للمقال مطلوب')
const uuidSchema = z.string().uuid('المعرف الفريد غير صحيح')

export interface LessonSummary {
  id: string
  title: string
  slug: string
  description: string | null
  duration_minutes: number
  order_index: number
  published: boolean
  module_id: string
}

export interface DetailedLesson extends LessonSummary {
  content: ContentBlock[]
}

/**
 * Fetches all published lessons from the database.
 */
export async function getLessons(): Promise<ActionState<LessonSummary[]>> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('lessons')
      .select('id, title, slug, description, duration_minutes, order_index, published, module_id')
      .eq('published', true)
      .order('order_index', { ascending: true })

    if (error) {
      return { success: false, error: 'حدث خطأ أثناء جلب الدروس من الخادم' }
    }

    return { success: true, data: data as LessonSummary[] }
  } catch {
    return { success: false, error: 'خطأ غير متوقع في جلب البيانات' }
  }
}

/**
 * Fetches a single detailed lesson by its slug, including content blocks.
 */
export async function getLessonBySlug(slugInput: string): Promise<ActionState<DetailedLesson>> {
  try {
    const parsed = slugSchema.safeParse(slugInput)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('slug', parsed.data)
      .eq('published', true)
      .single()

    if (error || !data) {
      return { success: false, error: 'الدرس المطلوب غير موجود' }
    }

    return { 
      success: true, 
      data: {
        ...data,
        content: data.content as ContentBlock[]
      } as DetailedLesson
    }
  } catch {
    return { success: false, error: 'خطأ غير متوقع في جلب تفاصيل الدرس' }
  }
}

/**
 * Marks a lesson as completed for the authenticated user.
 * Recalculates user streak if applicable.
 */
export async function completeLesson(lessonIdInput: string): Promise<ActionState<{ completedAt: string }>> {
  try {
    const parsed = uuidSchema.safeParse(lessonIdInput)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const supabase = await createClient()
    
    // Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'يجب تسجيل الدخول لتسجيل التقدم' }
    }

    // 1. Insert user progress log
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .upsert(
        { profile_id: user.id, lesson_id: parsed.data },
        { onConflict: 'profile_id,lesson_id' }
      )
      .select()
      .single()

    if (progressError || !progressData) {
      return { success: false, error: 'تعذر حفظ تقدم التعلم بالخادم' }
    }

    // 2. Fetch profile to calculate streak
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('current_streak, longest_streak, last_active_date')
      .eq('id', user.id)
      .single()

    if (!profileError && profile) {
      const todayStr = new Date().toISOString().split('T')[0]
      
      // Calculate yesterday's date string
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      let newStreak = profile.current_streak
      let updated = false

      if (!profile.last_active_date) {
        // First activity ever
        newStreak = 1
        updated = true
      } else if (profile.last_active_date === yesterdayStr) {
        // Consecutive active day
        newStreak = profile.current_streak + 1
        updated = true
      } else if (profile.last_active_date !== todayStr) {
        // Active day after a break (streak broken)
        newStreak = 1
        updated = true
      }

      if (updated) {
        const newLongest = newStreak > (profile.longest_streak || 0) ? newStreak : profile.longest_streak
        
        await supabase
          .from('profiles')
          .update({
            current_streak: newStreak,
            longest_streak: newLongest,
            last_active_date: todayStr
          })
          .eq('id', user.id)
      }
    }

    // Dynamic cache invalidation for the learning routes
    revalidatePath('/(app)/journey', 'layout')
    revalidatePath('/(app)/profile', 'layout')

    return { 
      success: true, 
      data: { completedAt: progressData.completed_at } 
    }
  } catch {
    return { success: false, error: 'خطأ غير متوقع في إرسال التقدم' }
  }
}

/**
 * Toggles a lesson bookmark status for the authenticated user.
 */
export async function toggleBookmark(lessonIdInput: string): Promise<ActionState<{ bookmarked: boolean }>> {
  try {
    const parsed = uuidSchema.safeParse(lessonIdInput)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const supabase = await createClient()

    // Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'يجب تسجيل الدخول لإدارة العلامات المرجعية' }
    }

    // Check if bookmark already exists
    const { data: existingBookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('profile_id', user.id)
      .eq('lesson_id', parsed.data)
      .maybeSingle()

    if (existingBookmark) {
      // Remove bookmark
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existingBookmark.id)

      if (error) {
        return { success: false, error: 'فشل إلغاء العلامة المرجعية' }
      }
      
      revalidatePath('/(app)/library', 'layout')
      return { success: true, data: { bookmarked: false } }
    } else {
      // Create bookmark
      const { error } = await supabase
        .from('bookmarks')
        .insert({ profile_id: user.id, lesson_id: parsed.data })

      if (error) {
        return { success: false, error: 'فشل حفظ العلامة المرجعية' }
      }

      revalidatePath('/(app)/library', 'layout')
      return { success: true, data: { bookmarked: true } }
    }
  } catch {
    return { success: false, error: 'خطأ غير متوقع في تعديل العلامة المرجعية' }
  }
}
