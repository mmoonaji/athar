import { getSpecifications } from '@/features/admin/actions/admin-actions'
import { SpecManager } from '@/features/admin/components/SpecManager'
import { Plus } from 'lucide-react'

export default async function AdminSpecificationsPage() {
  const specs = await getSpecifications()

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">مواصفات الدروس وخط الإنتاج</h1>
          <p className="text-sm text-slate-500 mt-1">تتبع وإدارة مواصفات المنهج، وشغل خطوات التوليد والتدقيق والاستيراد بنقرة واحدة.</p>
        </div>

        <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span>إضافة مواصفة جديدة</span>
        </button>
      </div>

      {/* Render specifications manager layout */}
      <SpecManager initialSpecs={specs} />
    </div>
  )
}
export const dynamic = 'force-dynamic'
