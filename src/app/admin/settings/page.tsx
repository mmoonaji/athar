import { SettingsManager } from '@/features/admin/components/SettingsManager'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">إعدادات المنصة والمشرفين</h1>
        <p className="text-sm text-slate-500 mt-1">اضبط معطيات التثبيت الافتراضية، الهوية، ونقاط ربط محركات الذكاء الاصطناعي.</p>
      </div>

      {/* Render settings manager component */}
      <SettingsManager />
    </div>
  )
}
export const dynamic = 'force-dynamic'
