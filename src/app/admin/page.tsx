import { getAdminStats } from '@/features/admin/actions/admin-actions'
import {
  FolderKanban,
  Compass,
  Layers,
  BookOpen,
  CheckCircle,
  FileEdit,
  ClipboardList,
  Users,
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  const cardItems = [
    { label: 'إجمالي النطاقات', value: stats.totalDomains, icon: FolderKanban, color: 'text-teal-600 bg-teal-50 border-teal-100' },
    { label: 'إجمالي المسارات', value: stats.totalPaths, icon: Compass, color: 'text-sky-600 bg-sky-50 border-sky-100' },
    { label: 'إجمالي الوحدات', value: stats.totalModules, icon: Layers, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { label: 'إجمالي الدروس', value: stats.totalLessons, icon: BookOpen, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { label: 'دروس منشورة', value: stats.publishedLessons, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { label: 'مسودات معلقة', value: stats.draftLessons, icon: FileEdit, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { label: 'مراجعات جاهزة', value: stats.reviewPending, icon: ClipboardList, color: 'text-rose-600 bg-rose-50 border-rose-100' },
    { label: 'المستخدمين النشطين', value: stats.userCount, icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-100' },
  ]

  return (
    <div className="space-y-8">
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">نظرة عامة على المحتوى والمنصة</h1>
        <p className="text-sm text-slate-500 mt-1">مرحباً بك في لوحة تحكّم أثر. راقب حالة المناهج وسير إنتاج المحتوى آلياً.</p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardItems.map((item, idx) => {
          const Icon = item.icon
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                <p className="text-2xl font-bold text-slate-800">{item.value}</p>
              </div>
              <div className={`p-3 rounded-lg border ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Secondary section (simulated engagement indicators) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Engagement overview */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-6">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">أداء المنصة والتفاعل اليومي</h2>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">متوسط الإكمال</p>
              <p className="text-lg font-bold text-teal-600 mt-1">{stats.completionRate}%</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">العلامات المحفوظة</p>
              <p className="text-lg font-bold text-sky-600 mt-1">{stats.bookmarksCount}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">نشطون يومياً (DAU)</p>
              <p className="text-lg font-bold text-amber-600 mt-1">{stats.dailyActiveUsers}</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold text-slate-500">حالة مؤشر إتمام الدروس اليومي (تفاعلي):</p>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500" style={{ width: `${stats.completionRate}%` }}></div>
            </div>
          </div>
        </div>

        {/* Activity log */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">آخر الأنشطة الفنية</h2>
          <div className="space-y-4 text-xs">
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
              <div>
                <p className="font-semibold text-slate-700">تم استيراد الدرس: «مفهوم التوحيد وأهميته»</p>
                <p className="text-[10px] text-slate-400">منذ دقيقتين بواسطة المشرف</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0"></div>
              <div>
                <p className="font-semibold text-slate-700">تم مراجعة المسودة: «شروط النية في الوضوء»</p>
                <p className="text-[10px] text-slate-400">منذ ساعة بواسطة المدقق الشرعي</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
              <div>
                <p className="font-semibold text-slate-700">توليد مسودة جديدة: «أركان الصلاة العملية»</p>
                <p className="text-[10px] text-slate-400">منذ ٣ ساعات بواسطة محرك الذكاء الاصطناعي</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export const dynamic = 'force-dynamic'
