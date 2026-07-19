'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const feedbackSchema = z.object({
  lessonId: z.string().uuid(),
  rating: z.number().min(1).max(5).optional().nullable(),
  comment: z.string().optional().nullable(),
})

export async function submitLessonFeedback(
  formData: z.infer<typeof feedbackSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = feedbackSchema.safeParse(formData)
    if (!parsed.success) {
      return { success: false, error: 'البيانات غير صالحة' }
    }

    if (!parsed.data.rating && !parsed.data.comment) {
      return { success: false, error: 'يرجى تقديم تقييم أو تعليق' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول لإرسال التقييم' }
    }

    const { error } = await supabase
      .from('lesson_feedback')
      .insert({
        lesson_id: parsed.data.lessonId,
        user_id: user.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      })

    if (error) {
      return { success: false, error: 'حدث خطأ أثناء حفظ التقييم' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'حدث خطأ غير متوقع' }
  }
}
