import { getCurriculumTree } from '@/features/admin/actions/admin-actions'
import { CurriculumTree } from '@/features/admin/components/CurriculumTree'
import { Plus } from 'lucide-react'

export default async function CurriculumManagerPage() {
  const tree = await getCurriculumTree()

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">شجرة هيكلة المناهج</h1>
          <p className="text-sm text-slate-500 mt-1">تصفح ورتب بنية النطاقات، والمسارات، والوحدات والدروس المترابطة.</p>
        </div>

        <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span>إضافة نطاق جديد</span>
        </button>
      </div>

      {/* Render Tree */}
      <CurriculumTree initialTree={tree} />
    </div>
  )
}
export const dynamic = 'force-dynamic'
