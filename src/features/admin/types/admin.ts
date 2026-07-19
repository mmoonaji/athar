import { z } from 'zod'

export interface AdminStats {
  totalDomains: number
  totalPaths: number
  totalModules: number
  totalLessons: number
  publishedLessons: number
  draftLessons: number
  reviewPending: number
  quizCount: number
  userCount: number
  completionRate: number
  bookmarksCount: number
  dailyActiveUsers: number
}

export interface CurriculumNode {
  id: string
  title: string
  type: 'domain' | 'path' | 'module' | 'lesson'
  orderIndex: number
  children?: CurriculumNode[]
}

export const PipelineStatusSchema = z.enum([
  'SPECIFICATION',
  'DRAFT',
  'REVIEWED',
  'VALIDATED',
  'PUBLISHED',
  'ARCHIVED',
])

export type PipelineStatus = z.infer<typeof PipelineStatusSchema>

export interface LessonSpecSummary {
  id: string
  slug: string
  title: string
  status: PipelineStatus
  domain: string
  path: string
  module: string
  order: number
}

export interface ReviewReportSummary {
  id: string
  lessonId: string
  lessonTitle: string
  timestamp: string
  status: 'APPROVED' | 'REJECTED' | 'NEEDS_CHANGES'
  reviewerNotes: string
}
