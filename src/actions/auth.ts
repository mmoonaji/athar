'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { ActionState } from './learning'
import { isFeatureEnabled } from '@/lib/flags'

// Authentication Zod validator schemas
const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن لا تقل عن ٦ أحرف'),
})

const signupSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن لا تقل عن ٦ أحرف'),
  fullName: z.string().min(2, 'الاسم الكامل يجب أن لا يقل عن حرفين'),
  betaCode: z.string().optional()
})

/**
 * Signs in a user using email and password.
 */
export async function signInWithEmailPassword(
  formData: z.infer<typeof loginSchema>
): Promise<ActionState<{ userId: string }>> {
  try {
    const parsed = loginSchema.safeParse(formData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (error || !data.user) {
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
    }

    revalidatePath('/(app)/journey', 'layout')
    return { success: true, data: { userId: data.user.id } }
  } catch {
    return { success: false, error: 'حدث خطأ غير متوقع أثناء تسجيل الدخول' }
  }
}

/**
 * Registers a new user and triggers automatic profile table generation.
 */
export async function signUpWithEmailPassword(
  formData: z.infer<typeof signupSchema>
): Promise<ActionState<{ userId: string }>> {
  try {
    const parsed = signupSchema.safeParse(formData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const supabase = await createClient()

    // Beta Code Verification
    const publicSignupEnabled = await isFeatureEnabled('ENABLE_PUBLIC_SIGNUP')
    if (!publicSignupEnabled) {
      if (!parsed.data.betaCode) {
        return { success: false, error: 'رمز الدعوة مطلوب' }
      }
      
      const { data: invite, error: inviteErr } = await supabase
        .from('beta_invites')
        .select('used_by')
        .eq('code', parsed.data.betaCode)
        .single()
        
      if (inviteErr || !invite) {
        return { success: false, error: 'رمز الدعوة غير صحيح' }
      }
      if (invite.used_by) {
        return { success: false, error: 'رمز الدعوة مستخدم مسبقاً' }
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.fullName,
        },
      },
    })

    if (error || !data.user) {
      return { success: false, error: error?.message || 'حدث خطأ أثناء تسجيل حساب جديد' }
    }

    // Mark beta code as used
    if (!publicSignupEnabled && parsed.data.betaCode) {
      await supabase
        .from('beta_invites')
        .update({ used_by: data.user.id })
        .eq('code', parsed.data.betaCode)
    }

    revalidatePath('/(app)/journey', 'layout')
    return { success: true, data: { userId: data.user.id } }
  } catch {
    return { success: false, error: 'حدث خطأ غير متوقع أثناء إنشاء الحساب' }
  }
}

/**
 * Signs out the current authenticated session.
 */
export async function signOut(): Promise<ActionState<null>> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: 'فشل تسجيل الخروج من الجلسة' }
    }

    revalidatePath('/(app)/journey', 'layout')
    return { success: true, data: null }
  } catch {
    return { success: false, error: 'خطأ غير متوقع أثناء تسجيل الخروج' }
  }
}

/**
 * Synchronizes offline completed lessons stored in guest's local storage
 * directly to the authenticated Supabase profile's progress log.
 */
export async function syncGuestProgress(
  lessonIds: string[]
): Promise<ActionState<{ syncedCount: number }>> {
  try {
    if (!lessonIds || lessonIds.length === 0) {
      return { success: true, data: { syncedCount: 0 } }
    }

    const validatedIds = lessonIds.filter((id) => z.string().uuid().safeParse(id).success)
    if (validatedIds.length === 0) {
      return { success: true, data: { syncedCount: 0 } }
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'يجب تسجيل الدخول لمزامنة تقدم الضيف' }
    }

    // Map into upsert rows
    const progressRows = validatedIds.map((lessonId) => ({
      profile_id: user.id,
      lesson_id: lessonId,
    }))

    const { error } = await supabase
      .from('user_progress')
      .upsert(progressRows, { onConflict: 'profile_id,lesson_id' })

    if (error) {
      return { success: false, error: 'فشل مزامنة تقدم الضيف بالخادم' }
    }

    revalidatePath('/(app)/journey', 'layout')
    return { success: true, data: { syncedCount: validatedIds.length } }
  } catch {
    return { success: false, error: 'خطأ غير متوقع أثناء مزامنة التقدم' }
  }
}
