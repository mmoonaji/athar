import { getLessonReviewDetail } from '@/features/admin/actions/review-actions'
import { ReviewDetailPanel } from '@/features/admin/components/ReviewDetailPanel'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let lesson
  try {
    lesson = await getLessonReviewDetail(id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/admin/reviews" className="hover:text-slate-800 transition-colors">
          المراجعة والتدقيق
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-800 font-medium">{lesson.title}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{lesson.title}</h1>
        <p className="text-sm text-slate-500 mt-1 font-mono">{lesson.slug}</p>
      </div>

      <ReviewDetailPanel lesson={lesson} />
    </div>
  )
}
