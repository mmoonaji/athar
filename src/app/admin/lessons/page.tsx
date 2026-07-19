import { getAllLessonsTable } from '@/features/admin/actions/admin-actions'
import { LessonTable } from '@/features/admin/components/LessonTable'

export default async function AdminLessonsPage() {
  const lessons = await getAllLessonsTable()

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">إدارة الدروس التعليمية</h1>
        <p className="text-sm text-slate-500 mt-1">تصفح قائمة الدروس المنشورة والمسودات، وتحكم بوضع النشر أو الحذف الفوري.</p>
      </div>

      {/* Render lessons table */}
      <LessonTable initialLessons={lessons} />
    </div>
  )
}
export const dynamic = 'force-dynamic'
