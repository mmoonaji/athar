'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { ActionState } from './learning'

// Profiles update Zod schema
const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'الاسم يجب أن لا يقل عن حرفين'),
  dailyGoalMinutes: z.number()
    .min(5, 'الحد الأدنى للهدف اليومي هو ٥ دقائق')
    .max(120, 'الحد الأقصى للهدف اليومي هو ١٢٠ دقيقة'),
})

export interface UserProfileData {
  id: string
  full_name: string
  avatar_url: string | null
  role: string
  current_streak: number
  longest_streak: number
  last_active_date: string | null
  daily_goal_minutes: number
  created_at: string
}

/**
 * Fetches the currently authenticated user's profile columns.
 */
export async function getProfileDetails(): Promise<ActionState<UserProfileData>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'غير مصرح بالدخول' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !data) {
      return { success: false, error: 'لم يتم العثور على الملف الشخصي' }
    }

    return { success: true, data: data as UserProfileData }
  } catch {
    return { success: false, error: 'خطأ في جلب بيانات الملف الشخصي' }
  }
}

/**
 * Updates full_name and daily_goal_minutes inside the authenticated user's profile table.
 */
export async function updateProfileDetails(
  formData: z.infer<typeof updateProfileSchema>
): Promise<ActionState<UserProfileData>> {
  try {
    const parsed = updateProfileSchema.safeParse(formData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'غير مصرح بالدخول لتعديل الملف' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: parsed.data.fullName,
        daily_goal_minutes: parsed.data.dailyGoalMinutes,
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error || !data) {
      return { success: false, error: 'فشل حفظ التعديلات بالخادم' }
    }

    revalidatePath('/(app)/profile', 'layout')
    revalidatePath('/(app)/journey', 'layout')
    return { success: true, data: data as UserProfileData }
  } catch {
    return { success: false, error: 'خطأ غير متوقع أثناء حفظ التعديلات' }
  }
}
