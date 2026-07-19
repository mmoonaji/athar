'use client'

import { useState } from 'react'
import { LessonTableRow } from '../actions/admin-actions'
import { updateLessonPublishStatus, deleteLesson } from '../actions/admin-actions'
import { Search, Eye, Trash2, Globe, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface LessonTableProps {
  initialLessons: LessonTableRow[]
}

export function LessonTable({ initialLessons }: LessonTableProps) {
  const [lessons, setLessons] = useState<LessonTableRow[]>(initialLessons)
  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setLoadingId(id)
    try {
      const targetStatus = !currentStatus
      const res = await updateLessonPublishStatus(id, targetStatus)
      if (res.success) {
        setLessons((prev) =>
          prev.map((l) => (l.id === id ? { ...l, published: targetStatus } : l))
        )
      }
    } catch (err) {
      console.error('Failed to toggle publish status:', err)
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الدرس نهائياً؟')) return
    setLoadingId(id)
    try {
      const res = await deleteLesson(id)
      if (res.success) {
        setLessons((prev) => prev.filter((l) => l.id !== id))
      }
    } catch (err) {
      console.error('Failed to delete lesson:', err)
    } finally {
      setLoadingId(null)
    }
  }

  const filtered = lessons.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.slug.toLowerCase().includes(search.toLowerCase()) ||
    l.moduleTitle.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Filters & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:max-w-xs relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث في الدروس..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pr-9 pl-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
            <tr>
              <th className="py-4 px-6">الدرس</th>
              <th className="py-4 px-6">الرابط البديل (Slug)</th>
              <th className="py-4 px-6">الوحدة المقترنة</th>
              <th className="py-4 px-6">الوقت (دقيقة)</th>
              <th className="py-4 px-6">حالة التحرير</th>
              <th className="py-4 px-6 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  لا يوجد دروس تطابق شروط البحث الحالية.
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-900">{l.title}</td>
                  <td className="py-4 px-6 text-slate-500 font-mono">{l.slug}</td>
                  <td className="py-4 px-6 text-slate-500">{l.moduleTitle}</td>
                  <td className="py-4 px-6">{l.durationMinutes}</td>
                  <td className="py-4 px-6">
                    {(() => {
                      const statusMap: Record<string, { label: string; color: string }> = {
                        DRAFT:     { label: 'مسودة',        color: 'bg-slate-50 text-slate-600 border-slate-200' },
                        IN_REVIEW: { label: 'قيد المراجعة', color: 'bg-amber-50 text-amber-700 border-amber-100' },
                        APPROVED:  { label: 'معتمد',        color: 'bg-blue-50 text-blue-700 border-blue-100' },
                        PUBLISHED: { label: 'منشور',        color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                        ARCHIVED:  { label: 'مؤرشف',       color: 'bg-rose-50 text-rose-700 border-rose-100' },
                      }
                      const s = statusMap[l.status] ?? statusMap.DRAFT
                      return (
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold border ${s.color}`}>
                          {s.label}
                        </span>
                      )
                    })()}
                  </td>
                  <td className="py-4 px-6 flex items-center justify-end gap-2">
                    {/* Edit lesson button */}
                    <Link
                      href={`/admin/lessons/${l.id}`}
                      className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded transition-all"
                      title="تحرير الدرس"
                    >
                      <span className="inline-block w-4 h-4 text-center">✏️</span>
                    </Link>

                    {/* View public page preview */}
                    <Link
                      href={`/lesson/${l.slug}`}
                      target="_blank"
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-all"
                      title="معاينة الصفحة العامة"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {/* Toggle publish status button */}
                    <button
                      onClick={() => handleTogglePublish(l.id, l.published)}
                      disabled={loadingId === l.id}
                      className={`p-1.5 rounded transition-all ${
                        l.published
                          ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={l.published ? 'تعطيل النشر' : 'نشر الدرس'}
                    >
                      {loadingId === l.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      ) : l.published ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Globe className="w-4 h-4" />
                      )}
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(l.id)}
                      disabled={loadingId === l.id}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                      title="حذف الدرس"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
