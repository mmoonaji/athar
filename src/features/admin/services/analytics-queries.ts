'use server'

import { createClient } from '@/lib/supabase/server'

export interface UserMetrics {
  totalUsers: number
  newUsersThisWeek: number
  adminCount: number
}

export interface LearningMetrics {
  lessonsStarted: number
  lessonsCompleted: number
  averageQuizScore: number
}

export interface TopLesson {
  lessonId: string
  title: string
  completionCount: number
}

export interface DailyActiveLearner {
  date: string
  count: number
}

export interface AnalyticsData {
  users: UserMetrics
  learning: LearningMetrics
  topLessons: TopLesson[]
  dailyActive: DailyActiveLearner[]
}

/**
 * Fetches user-related metrics for the analytics dashboard.
 * Admin-only: called from server components after admin assertion.
 */
export async function fetchUserMetrics(supabase: Awaited<ReturnType<typeof createClient>>): Promise<UserMetrics> {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const [totalRes, newRes, adminRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString()),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'ADMIN'),
  ])

  return {
    totalUsers: totalRes.count ?? 0,
    newUsersThisWeek: newRes.count ?? 0,
    adminCount: adminRes.count ?? 0,
  }
}

/**
 * Fetches learning activity metrics.
 */
export async function fetchLearningMetrics(supabase: Awaited<ReturnType<typeof createClient>>): Promise<LearningMetrics> {
  const [startedRes, completedRes, scoresRes] = await Promise.all([
    // Lessons started = any row in user_lesson_progress
    supabase.from('user_lesson_progress').select('id', { count: 'exact', head: true }),
    // Lessons completed = rows in user_progress (legacy completion table)
    supabase.from('user_progress').select('id', { count: 'exact', head: true }),
    // Average quiz score from user_lesson_progress
    supabase
      .from('user_lesson_progress')
      .select('quiz_score')
      .not('quiz_score', 'is', null),
  ])

  const scores = (scoresRes.data ?? []).map((r) => r.quiz_score as number)
  const averageQuizScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0

  return {
    lessonsStarted: startedRes.count ?? 0,
    lessonsCompleted: completedRes.count ?? 0,
    averageQuizScore,
  }
}

/**
 * Fetches top 5 most completed lessons.
 */
export async function fetchTopLessons(supabase: Awaited<ReturnType<typeof createClient>>): Promise<TopLesson[]> {
  // Get completion counts grouped by lesson_id
  const { data: progressRows } = await supabase
    .from('user_progress')
    .select('lesson_id')

  if (!progressRows || progressRows.length === 0) return []

  // Count per lesson
  const countMap: Record<string, number> = {}
  for (const row of progressRows) {
    countMap[row.lesson_id] = (countMap[row.lesson_id] ?? 0) + 1
  }

  // Sort and take top 5
  const top5 = Object.entries(countMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  if (top5.length === 0) return []

  // Fetch lesson titles
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title')
    .in('id', top5.map(([id]) => id))

  const lessonMap: Record<string, string> = {}
  for (const l of lessons ?? []) {
    lessonMap[l.id] = l.title
  }

  return top5.map(([lessonId, count]) => ({
    lessonId,
    title: lessonMap[lessonId] ?? 'درس غير معروف',
    completionCount: count,
  }))
}

/**
 * Fetches daily active learners for the past 14 days.
 */
export async function fetchDailyActive(supabase: Awaited<ReturnType<typeof createClient>>): Promise<DailyActiveLearner[]> {
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const { data } = await supabase
    .from('profiles')
    .select('last_active_date')
    .gte('last_active_date', twoWeeksAgo.toISOString().split('T')[0])
    .not('last_active_date', 'is', null)

  if (!data) return []

  // Count per date
  const countMap: Record<string, number> = {}
  for (const row of data) {
    const d = String(row.last_active_date)
    countMap[d] = (countMap[d] ?? 0) + 1
  }

  return Object.entries(countMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))
}

/**
 * Fetches all analytics data in parallel.
 */
export async function fetchAllAnalytics(supabase: Awaited<ReturnType<typeof createClient>>): Promise<AnalyticsData> {
  const [users, learning, topLessons, dailyActive] = await Promise.all([
    fetchUserMetrics(supabase),
    fetchLearningMetrics(supabase),
    fetchTopLessons(supabase),
    fetchDailyActive(supabase),
  ])

  return { users, learning, topLessons, dailyActive }
}
