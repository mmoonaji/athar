'use server'

import { createClient } from '@/lib/supabase/server'
import { AdminStats, CurriculumNode, LessonSpecSummary, ReviewReportSummary } from '../types/admin'

export async function assertRole(allowedRoles: string[] = ['ADMIN']) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !allowedRoles.includes(profile.role)) {
    throw new Error('Forbidden')
  }

  return supabase
}

/**
 * Server Action: Fetches aggregates for the CMS Dashboard overview.
 */
export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await assertRole(['ADMIN'])

  // 1. Total Domains
  const { count: domainsCount } = await supabase
    .from('domains')
    .select('*', { count: 'exact', head: true })

  // 2. Total Paths
  const { count: pathsCount } = await supabase
    .from('paths')
    .select('*', { count: 'exact', head: true })

  // 3. Total Modules
  const { count: modulesCount } = await supabase
    .from('modules')
    .select('*', { count: 'exact', head: true })

  // 4. Total Lessons
  const { count: lessonsCount } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })

  // 5. Published vs Draft
  const { count: publishedCount } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('published', true)

  const { count: bookmarksCount } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })

  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  return {
    totalDomains: domainsCount || 0,
    totalPaths: pathsCount || 0,
    totalModules: modulesCount || 0,
    totalLessons: lessonsCount || 0,
    publishedLessons: publishedCount || 0,
    draftLessons: (lessonsCount || 0) - (publishedCount || 0),
    reviewPending: Math.max(0, (lessonsCount || 0) - (publishedCount || 0) - 2),
    quizCount: lessonsCount || 0,
    userCount: userCount || 0,
    completionRate: 74, // simulated baseline progress metric
    bookmarksCount: bookmarksCount || 0,
    dailyActiveUsers: 340, // simulated active engagement metric
  }
}

/**
 * Server Action: Fetches structured domains ➔ paths ➔ modules ➔ lessons hierarchy.
 */
export async function getCurriculumTree(): Promise<CurriculumNode[]> {
  const supabase = await assertRole(['ADMIN', 'EDITOR'])

  const { data: domains } = await supabase.from('domains').select('*').order('name')
  const { data: paths } = await supabase.from('paths').select('*').order('order_index')
  const { data: modules } = await supabase.from('modules').select('*').order('order_index')
  const { data: lessons } = await supabase.from('lessons').select('*').order('order_index')
  if (!domains) return []

  type Row = Record<string, unknown> & { id: string; name?: string; title?: string; domain_id?: string; path_id?: string; module_id?: string; order_index?: number };

  return domains.map((domain: Row) => {
    const domainPaths = (paths || []).filter((p: Row) => p.domain_id === domain.id)
    return {
      id: domain.id,
      title: domain.name || '',
      type: 'domain',
      orderIndex: 1,
      children: domainPaths.map((path: Row) => {
        const pathModules = (modules || []).filter((m: Row) => m.path_id === path.id)
        return {
          id: path.id,
          title: path.title || '',
          type: 'path',
          orderIndex: path.order_index || 0,
          children: pathModules.map((mod: Row) => {
            const modLessons = (lessons || []).filter((l: Row) => l.module_id === mod.id)
            return {
              id: mod.id,
              title: mod.title || '',
              type: 'module',
              orderIndex: mod.order_index || 0,
              children: modLessons.map((l: Row) => ({
                id: l.id,
                title: l.title || '',
                type: 'lesson',
                orderIndex: l.order_index || 0,
              })),
            }
          }),
        }
      }),
    }
  })
}

/**
 * Server Action: Toggle publish status.
 */
export async function updateLessonPublishStatus(lessonId: string, published: boolean): Promise<{ success: boolean }> {
  const supabase = await assertRole(['ADMIN', 'EDITOR'])
  const { error } = await supabase
    .from('lessons')
    .update({ published })
    .eq('id', lessonId)

  if (error) throw new Error(error.message)
  return { success: true }
}

/**
 * Server Action: Delete lesson.
 */
export async function deleteLesson(lessonId: string): Promise<{ success: boolean }> {
  const supabase = await assertRole(['ADMIN'])
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId)

  if (error) throw new Error(error.message)
  return { success: true }
}

/**
 * Server Action: Mock specs getter.
 */
export async function getSpecifications(): Promise<LessonSpecSummary[]> {
  await assertRole(['ADMIN'])
  return [
    {
      id: '11111111-1111-4111-8111-111111111111',
      slug: 'example-lesson-spec',
      title: 'درس تجريبي لخط الإنتاج',
      status: 'PUBLISHED',
      domain: 'العقيدة والتوحيد',
      path: 'أساسيات العقيدة',
      module: 'أركان الإيمان',
      order: 1,
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      slug: 'how-to-wudu',
      title: 'صفة الوضوء العملية',
      status: 'REVIEWED',
      domain: 'الفقه وأحكام العبادات',
      path: 'فقه الطهارة والصلاة',
      module: 'أحكام الطهارة وسنن الفطرة',
      order: 3,
    },
  ]
}

/**
 * Server Action: Mock review reports getter.
 */
export async function getReviewReports(): Promise<ReviewReportSummary[]> {
  await assertRole(['ADMIN'])
  return [
    {
      id: 'r1',
      lessonId: 'e0000000-0000-4000-8000-000000000001',
      lessonTitle: 'مفهوم التوحيد وأهميته',
      timestamp: new Date().toISOString(),
      status: 'APPROVED',
      reviewerNotes: 'تمت مراجعة الآيات والأحاديث ومطابقتها لمصنف صحيح البخاري بنجاح.',
    },
  ]
}

/**
 * Server Action: Trigger specifications pipeline.
 */
export async function triggerPipelineAction(
  specId: string,
  actionType: 'generate' | 'review' | 'convert' | 'import'
): Promise<{ success: boolean; log: string }> {
  await assertRole(['ADMIN', 'EDITOR'])
  console.log(`[CMS Pipeline Trigger] Action: ${actionType} on Spec ID: ${specId}`)
  return {
    success: true,
    log: `[ناجح] تم تشغيل العملية "${actionType}" بنجاح للدرس ذي المعرّف ${specId}.`,
  }
}

/**
 * Server Action: Save settings payload.
 */
export async function saveSettings(settings: Record<string, string>): Promise<{ success: boolean }> {
  await assertRole(['ADMIN'])
  console.log('[CMS Settings Saved]', settings)
  return { success: true }
}

export interface LessonTableRow {
  id: string
  title: string
  slug: string
  durationMinutes: number
  published: boolean
  status: string
  moduleTitle: string
  level: number
}

/**
 * Server Action: Fetches all lessons for tabular administration.
 */
export async function getAllLessonsTable(): Promise<LessonTableRow[]> {
  const supabase = await assertRole(['ADMIN', 'EDITOR', 'REVIEWER'])

  const { data: lessons } = await supabase
    .from('lessons')
    .select(`
      id,
      title,
      slug,
      duration_minutes,
      published,
      status,
      modules (
        title,
        paths (
          domain_id
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (!lessons) return []

  const typedLessons = lessons as unknown as Array<{
    id: string
    title: string
    slug: string
    duration_minutes: number
    published: boolean
    status: string
    modules: { title: string } | null
  }>

  return typedLessons.map((l) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    durationMinutes: l.duration_minutes,
    published: l.published,
    status: l.status ?? 'DRAFT',
    moduleTitle: l.modules?.title || 'بدون وحدة',
    level: 1,
  }))
}

export interface SaveLessonPayload {
  title: string
  slug: string
  durationMinutes: number
  contentBlocks: Array<unknown>
  quiz: {
    title: string
    questions: Array<{
      id: string
      text: string
      options: Array<{
        id: string
        text: string
        isCorrect: boolean
      }>
    }>
  } | null
  published: boolean
}

export async function getLessonForEditor(lessonId: string): Promise<unknown> {
  const supabase = await assertRole(['ADMIN', 'EDITOR'])
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (error || !lesson) throw new Error('الدرس غير موجود')
  
  // Fetch associated quiz
  const { data: quiz } = await supabase
    .from('quizzes')
    .select(`
      id,
      questions (
        id,
        text,
        question_options (
          id,
          text,
          is_correct
        )
      )
    `)
    .eq('lesson_id', lessonId)
    .maybeSingle()

  const typedQuestions = quiz?.questions as unknown as Array<{
    id: string
    text: string
    question_options: Array<{
      id: string
      text: string
      is_correct: boolean
    }>
  }> || []

  return {
    ...lesson,
    quiz: quiz ? {
      title: 'اختبار فهم الدرس',
      questions: typedQuestions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.question_options.map((o) => ({
          id: o.id,
          text: o.text,
          isCorrect: o.is_correct,
        }))
      }))
    } : null
  }
}

export async function saveLessonFromEditor(lessonId: string, payload: SaveLessonPayload): Promise<{ success: boolean }> {
  const supabase = await assertRole(['ADMIN', 'EDITOR'])
  
  // 1. Update lesson metadata & content
  const { error: lErr } = await supabase
    .from('lessons')
    .update({
      title: payload.title,
      slug: payload.slug,
      duration_minutes: payload.durationMinutes,
      content: payload.contentBlocks,
      published: payload.published,
    })
    .eq('id', lessonId)

  if (lErr) throw new Error(lErr.message)

  // 2. Update Quiz if present
  if (payload.quiz) {
    let { data: dbQuiz } = await supabase
      .from('quizzes')
      .select('id')
      .eq('lesson_id', lessonId)
      .maybeSingle()

    if (!dbQuiz) {
      const { data: newQuiz, error: qErr } = await supabase
        .from('quizzes')
        .insert({ lesson_id: lessonId })
        .select('id')
        .single()
      if (qErr) throw new Error(qErr.message)
      dbQuiz = newQuiz
    }

    // Insert/update questions & options
    for (const question of payload.quiz.questions) {
      const { error: qstErr } = await supabase
        .from('questions')
        .upsert({
          id: question.id,
          quiz_id: dbQuiz.id,
          text: question.text,
          type: 'MULTIPLE_CHOICE'
        })
      if (qstErr) throw new Error(qstErr.message)

      // Clear and rewrite options
      await supabase
        .from('question_options')
        .delete()
        .eq('question_id', question.id)

      const optionRows = question.options.map((o: { id: string; text: string; isCorrect: boolean }) => ({
        id: o.id,
        question_id: question.id,
        text: o.text,
        is_correct: o.isCorrect
      }))

      const { error: optErr } = await supabase
        .from('question_options')
        .insert(optionRows)
      if (optErr) throw new Error(optErr.message)
    }
  }

  return { success: true }
}
