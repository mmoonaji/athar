'use client'

import { useState, useTransition } from 'react'
import { LessonReviewDetail, LessonStatus, updateLessonStatus } from '../actions/review-actions'
import { CheckCircle2, Clock, Eye, Archive, Send } from 'lucide-react'

const STATUS_CONFIG: Record<LessonStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  DRAFT:      { label: 'مسودة',        color: 'bg-slate-50 text-slate-600 border-slate-200',   icon: Clock },
  IN_REVIEW:  { label: 'قيد المراجعة', color: 'bg-amber-50 text-amber-700 border-amber-100',   icon: Eye },
  APPROVED:   { label: 'معتمد',        color: 'bg-blue-50 text-blue-700 border-blue-100',       icon: CheckCircle2 },
  PUBLISHED:  { label: 'منشور',        color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: Send },
  ARCHIVED:   { label: 'مؤرشف',       color: 'bg-rose-50 text-rose-700 border-rose-100',       icon: Archive },
}

interface Props {
  lesson: LessonReviewDetail
}

export function ReviewDetailPanel({ lesson }: Props) {
  const [currentStatus, setCurrentStatus] = useState<LessonStatus>(lesson.status)
  const [notes, setNotes] = useState(lesson.reviewer_notes ?? '')
  const [saveMsg, setSaveMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  const config = STATUS_CONFIG[currentStatus]
  const Icon = config.icon

  const handleStatusChange = (newStatus: LessonStatus) => {
    startTransition(async () => {
      setSaveMsg('')
      const res = await updateLessonStatus(lesson.id, newStatus, notes)
      if (res.success) {
        setCurrentStatus(newStatus)
        setSaveMsg('✓ تم حفظ القرار بنجاح')
      } else {
        setSaveMsg(`✗ ${res.error}`)
      }
    })
  }

  const handleSaveNotes = () => {
    startTransition(async () => {
      setSaveMsg('')
      const res = await updateLessonStatus(lesson.id, currentStatus, notes)
      setSaveMsg(res.success ? '✓ تم حفظ الملاحظات' : `✗ ${res.error}`)
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Left/Main — Content preview */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">معاينة محتوى الدرس</span>
            <span className="text-xs text-slate-400">{lesson.duration_minutes} دقيقة</span>
          </div>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {Array.isArray(lesson.content) ? (
              (lesson.content as Array<{ type: string; text?: string; arabic?: string; translation?: string }>).map((block, i) => (
                <div key={i} className="text-sm leading-relaxed">
                  {block.type === 'heading' && (
                    <h3 className="font-bold text-base text-slate-900">{block.text}</h3>
                  )}
                  {block.type === 'paragraph' && (
                    <p className="text-slate-700">{block.text}</p>
                  )}
                  {block.type === 'quran' && (
                    <div className="bg-primary-50 border-r-4 border-primary-600 p-3 rounded-r-lg">
                      <p className="font-quran text-base text-primary-950">{block.arabic}</p>
                    </div>
                  )}
                  {block.type === 'hadith' && (
                    <div className="bg-secondary-50 border-r-4 border-secondary-500 p-3 rounded-r-lg">
                      <p className="text-secondary-900 text-sm">{block.text}</p>
                    </div>
                  )}
                  {block.type === 'takeaway' && (
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                      <p className="text-emerald-800 font-semibold text-sm">{block.text}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm text-center py-8">لا يوجد محتوى معروض</p>
            )}
          </div>
        </div>
      </div>

      {/* Right — Review controls */}
      <div className="space-y-4">

        {/* Current status */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-500">حالة الدرس الحالية</h3>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border ${config.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </span>

          {/* Status transition buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium">تغيير الحالة إلى:</p>
            {(Object.keys(STATUS_CONFIG) as LessonStatus[])
              .filter((s) => s !== currentStatus)
              .map((s) => {
                const c = STATUS_CONFIG[s]
                const BtnIcon = c.icon
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={isPending}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all disabled:opacity-50 ${c.color} hover:opacity-80`}
                  >
                    <BtnIcon className="w-3.5 h-3.5 shrink-0" />
                    {c.label}
                  </button>
                )
              })}
          </div>

          {saveMsg && (
            <p className={`text-xs font-medium ${saveMsg.startsWith('✓') ? 'text-emerald-600' : 'text-red-600'}`}>
              {saveMsg}
            </p>
          )}
        </div>

        {/* Reviewer notes */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h3 className="text-xs font-semibold text-slate-500">ملاحظات المراجع</h3>
          <textarea
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="اكتب ملاحظاتك أو توجيهاتك للكاتب هنا..."
            className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 bg-white resize-none"
          />
          <button
            onClick={handleSaveNotes}
            disabled={isPending}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs py-2 rounded-lg transition-colors"
          >
            {isPending ? 'جاري الحفظ...' : 'حفظ الملاحظات'}
          </button>
        </div>

        {/* Lesson metadata */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-xs font-semibold text-slate-500 mb-3">معلومات الدرس</h3>
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between">
              <dt className="text-slate-400">المعرّف</dt>
              <dd className="font-mono text-slate-600 text-[10px]">{lesson.id.slice(0, 8)}…</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">تاريخ الإنشاء</dt>
              <dd className="text-slate-600">{new Date(lesson.created_at).toLocaleDateString('ar-EG')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">المدة</dt>
              <dd className="text-slate-600">{lesson.duration_minutes} دقائق</dd>
            </div>
          </dl>
        </div>

      </div>
    </div>
  )
}
