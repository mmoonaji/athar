'use client'

import { useState, useTransition } from 'react'
import { updateLessonStatus, LessonReviewDetail, LessonStatus } from '../actions/review-actions'
import { CheckCircle2, AlertTriangle, MessageSquare, Eye, ExternalLink, Clock, Send, Archive } from 'lucide-react'
import Link from 'next/link'

interface ReviewFlowProps {
  initialReports: LessonReviewDetail[]
}

const STATUS_CONFIG: Record<LessonStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  DRAFT:      { label: 'مسودة',        color: 'bg-slate-50 text-slate-600 border-slate-200',       icon: Clock },
  IN_REVIEW:  { label: 'قيد المراجعة', color: 'bg-amber-50 text-amber-700 border-amber-100',       icon: AlertTriangle },
  APPROVED:   { label: 'معتمد',        color: 'bg-blue-50 text-blue-700 border-blue-100',           icon: CheckCircle2 },
  PUBLISHED:  { label: 'منشور',        color: 'bg-emerald-50 text-emerald-700 border-emerald-100',  icon: Send },
  ARCHIVED:   { label: 'مؤرشف',       color: 'bg-rose-50 text-rose-700 border-rose-100',           icon: Archive },
}

export function ReviewFlow({ initialReports }: ReviewFlowProps) {
  const [reports, setReports] = useState<LessonReviewDetail[]>(initialReports)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [actionNotes, setActionNotes] = useState('')
  const [saveResult, setSaveResult] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  const handleUpdateStatus = (id: string, newStatus: LessonStatus) => {
    startTransition(async () => {
      // Persist to DB (fixes the original bug where only local state was updated)
      const res = await updateLessonStatus(id, newStatus, actionNotes || undefined)

      if (res.success) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, status: newStatus, reviewer_notes: actionNotes || r.reviewer_notes }
              : r
          )
        )
        setSaveResult((prev) => ({ ...prev, [id]: '✓ تم الحفظ بنجاح' }))
      } else {
        setSaveResult((prev) => ({ ...prev, [id]: `✗ ${res.error}` }))
      }

      setEditingId(null)
      setActionNotes('')
    })
  }

  const getStatusBadge = (status: LessonStatus) => {
    const item = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT
    const Icon = item.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold border ${item.color}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{item.label}</span>
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {reports.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">
          لا توجد دروس للمراجعة حالياً
        </div>
      )}

      {reports.map((r) => {
        const isEditing = editingId === r.id
        return (
          <div key={r.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header row */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">{r.title}</h2>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{r.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(r.status)}
                <Link
                  href={`/admin/reviews/${r.id}`}
                  className="flex items-center gap-1 text-[10px] text-teal-600 hover:text-teal-700 font-semibold hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  تفاصيل
                </Link>
              </div>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-4">
              {r.reviewer_notes && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                    <MessageSquare className="w-4 h-4 text-teal-600" />
                    <span>ملاحظات المراجع الحالية:</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{r.reviewer_notes}</p>
                </div>
              )}

              {saveResult[r.id] && (
                <p className={`text-xs font-medium ${saveResult[r.id].startsWith('✓') ? 'text-emerald-600' : 'text-red-500'}`}>
                  {saveResult[r.id]}
                </p>
              )}

              {/* Action buttons */}
              {isEditing ? (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500">ملاحظة إضافية (اختياري):</p>
                  <textarea
                    rows={2}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="اكتب ملاحظة أو توجيه للكاتب هنا..."
                    className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                      disabled={isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs px-3 py-1.5 rounded transition-colors"
                    >
                      موافقة واعتماد
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'PUBLISHED')}
                      disabled={isPending}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs px-3 py-1.5 rounded transition-colors"
                    >
                      نشر فوري
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'IN_REVIEW')}
                      disabled={isPending}
                      className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs px-3 py-1.5 rounded transition-colors"
                    >
                      طلب تعديل
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'ARCHIVED')}
                      disabled={isPending}
                      className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-xs px-3 py-1.5 rounded transition-colors"
                    >
                      أرشفة
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setActionNotes('') }}
                      className="text-slate-500 hover:bg-slate-100 font-semibold text-xs px-3 py-1.5 rounded transition-all"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Eye className="w-4 h-4" />
                    <span>
                      {r.status === 'DRAFT' ? 'مسودة — لم تُراجع بعد' : 'تمت المراجعة والحفظ في قاعدة البيانات'}
                    </span>
                  </div>
                  <button
                    onClick={() => { setEditingId(r.id); setActionNotes('') }}
                    className="text-teal-600 hover:text-teal-700 font-semibold hover:underline"
                  >
                    تعديل القرار
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const dynamic = 'force-dynamic'
