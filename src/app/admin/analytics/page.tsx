import { createClient } from '@/lib/supabase/server'
import { assertRole } from '@/features/admin/actions/admin-actions'
import { AnalyticsDashboard } from '@/features/admin/components/AnalyticsDashboard'
import { fetchAllAnalytics } from '@/features/admin/services/analytics-queries'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  await assertRole(['ADMIN'])
  const supabase = await createClient()
  const analyticsData = await fetchAllAnalytics(supabase)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">لوحة الإحصائيات والتحليلات</h1>
        <p className="text-sm text-slate-500 mt-1">
          مؤشرات أداء المنصة في الوقت الفعلي — بيانات مباشرة من قاعدة البيانات
        </p>
      </div>

      <AnalyticsDashboard data={analyticsData} />
    </div>
  )
}
