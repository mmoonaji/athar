import { getReviewableLessons } from '@/features/admin/actions/review-actions'
import { ReviewFlow } from '@/features/admin/components/ReviewFlow'

export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage() {
  const lessons = await getReviewableLessons()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">إدارة المراجعة والتدقيق الشرعي</h1>
        <p className="text-sm text-slate-500 mt-1">
          راجع الدروس قبل نشرها — جميع قراراتك تُحفظ فوراً في قاعدة البيانات.
        </p>
      </div>

      <ReviewFlow initialReports={lessons} />
    </div>
  )
}
