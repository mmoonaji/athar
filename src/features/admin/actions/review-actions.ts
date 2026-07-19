'use server'

import { assertRole } from './admin-actions'
import { logger } from '@/lib/monitoring/logger'
import { revalidatePath } from 'next/cache'

export type LessonStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED'

export interface LessonReviewDetail {
  id: string
  title: string
  slug: string
  status: LessonStatus
  reviewer_notes: string | null
  published: boolean
  duration_minutes: number
  created_at: string
  content: unknown
}

/**
 * Fetches a single lesson's full details for the review editor.
 */
export async function getLessonReviewDetail(lessonId: string): Promise<LessonReviewDetail> {
  const supabase = await assertRole(['ADMIN', 'REVIEWER', 'EDITOR'])

  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, slug, status, reviewer_notes, published, duration_minutes, created_at, content')
    .eq('id', lessonId)
    .single()

  if (error || !data) throw new Error(`الدرس غير موجود: ${lessonId}`)

  return data as LessonReviewDetail
}

/**
 * Fetches all lessons with editorial statuses (IN_REVIEW, APPROVED, DRAFT).
 * Used for the reviews list.
 */
export async function getReviewableLessons(): Promise<LessonReviewDetail[]> {
  const supabase = await assertRole(['ADMIN', 'REVIEWER', 'EDITOR'])

  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, slug, status, reviewer_notes, published, duration_minutes, created_at, content')
    .in('status', ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'])
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    logger.error('getReviewableLessons failed', { error: error.message })
    return []
  }

  return (data ?? []) as LessonReviewDetail[]
}

/**
 * Updates the status and optional reviewer notes for a lesson.
 * This persists the editorial decision to the database.
 */
export async function updateLessonStatus(
  lessonId: string,
  status: LessonStatus,
  reviewerNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await assertRole(['ADMIN', 'REVIEWER'])

    const updatePayload: Record<string, unknown> = { status }
    if (reviewerNotes !== undefined) {
      updatePayload.reviewer_notes = reviewerNotes || null
    }

    const { error } = await supabase
      .from('lessons')
      .update(updatePayload)
      .eq('id', lessonId)

    if (error) {
      logger.error('updateLessonStatus failed', { lessonId, status, error: error.message })
      return { success: false, error: error.message }
    }

    logger.info('Lesson status updated', { lessonId, status })
    revalidatePath('/admin/reviews')
    revalidatePath(`/admin/reviews/${lessonId}`)
    revalidatePath('/admin/lessons')

    return { success: true }
  } catch (err) {
    logger.error('updateLessonStatus unexpected error', { error: String(err) })
    return { success: false, error: 'خطأ غير متوقع' }
  }
}
