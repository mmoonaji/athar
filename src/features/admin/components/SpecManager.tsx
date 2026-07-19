'use client'

import { useState } from 'react'
import { LessonSpecSummary } from '../types/admin'
import { triggerPipelineAction } from '../actions/admin-actions'
import { Settings, Play, ClipboardCheck, ArrowRightLeft, FileCheck } from 'lucide-react'

interface SpecManagerProps {
  initialSpecs: LessonSpecSummary[]
}

export function SpecManager({ initialSpecs }: SpecManagerProps) {
  const [specs, setSpecs] = useState<LessonSpecSummary[]>(initialSpecs)
  const [runningId, setRunningId] = useState<string | null>(null)
  const [logMessage, setLogMessage] = useState<string | null>(null)

  const handlePipelineAction = async (
    id: string,
    action: 'generate' | 'review' | 'convert' | 'import'
  ) => {
    setRunningId(id)
    setLogMessage(null)

    try {
      const res = await triggerPipelineAction(id, action)
      if (res.success) {
        setLogMessage(res.log)
        // Simulate pipeline state transitions
        setSpecs((prev) =>
          prev.map((s) => {
            if (s.id === id) {
              let nextStatus = s.status
              if (action === 'generate') nextStatus = 'DRAFT'
              if (action === 'review') nextStatus = 'REVIEWED'
              if (action === 'convert') nextStatus = 'VALIDATED'
              if (action === 'import') nextStatus = 'PUBLISHED'
              return { ...s, status: nextStatus }
            }
            return s
          })
        )
      }
    } catch (err) {
      console.error('Failed to trigger pipeline action:', err)
      setLogMessage('❌ فشل تشغيل العملية المحددة. يرجى التحقق من لوحة المطورين.')
    } finally {
      setRunningId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      SPECIFICATION: { label: 'مواصفة', color: 'bg-slate-50 text-slate-700 border-slate-200' },
      DRAFT: { label: 'مسودة', color: 'bg-amber-50 text-amber-700 border-amber-100' },
      REVIEWED: { label: 'مدقق شرعياً', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
      VALIDATED: { label: 'متحقق فنياً', color: 'bg-sky-50 text-sky-700 border-sky-100' },
      PUBLISHED: { label: 'منشور', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
      ARCHIVED: { label: 'مؤرشف', color: 'bg-slate-100 text-slate-500 border-slate-200' },
    }
    const item = map[status] || { label: status, color: 'bg-slate-50 text-slate-700 border-slate-200' }
    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${item.color}`}>
        {item.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Logs alert box */}
      {logMessage && (
        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 shadow flex items-start gap-3 font-mono text-xs">
          <Settings className="w-4 h-4 text-teal-400 mt-0.5 shrink-0 animate-spin" />
          <p>{logMessage}</p>
        </div>
      )}

      {/* Specifications list table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
            <tr>
              <th className="py-4 px-6">المواصفة والمسار</th>
              <th className="py-4 px-6">النطاق والوحدة</th>
              <th className="py-4 px-6">المرحلة الحالية</th>
              <th className="py-4 px-6 text-left">أدوات خط الإنتاج المدمج</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {specs.map((s) => {
              const isRunning = runningId === s.id
              return (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-semibold text-slate-900">{s.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{s.slug}</p>
                  </td>
                  <td className="py-4 px-6 text-slate-500">
                    <p className="text-xs">{s.domain}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{s.module}</p>
                  </td>
                  <td className="py-4 px-6">{getStatusBadge(s.status)}</td>
                  <td className="py-4 px-6 flex items-center justify-end gap-2">
                    {/* 1. Generate Draft */}
                    <button
                      onClick={() => handlePipelineAction(s.id, 'generate')}
                      disabled={isRunning}
                      className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 px-2.5 py-1.5 rounded text-[10px] font-semibold border border-amber-200 transition-colors disabled:opacity-50"
                      title="توليد مسودة درس بالذكاء الاصطناعي"
                    >
                      <Play className="w-3 h-3" />
                      <span>توليد مسودة</span>
                    </button>

                    {/* 2. Review text draft */}
                    <button
                      onClick={() => handlePipelineAction(s.id, 'review')}
                      disabled={isRunning}
                      className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 px-2.5 py-1.5 rounded text-[10px] font-semibold border border-indigo-200 transition-colors disabled:opacity-50"
                      title="تدقيق الدرس ومراجعة صحة الأدلة"
                    >
                      <ClipboardCheck className="w-3 h-3" />
                      <span>تدقيق علمي</span>
                    </button>

                    {/* 3. Convert text to JSON */}
                    <button
                      onClick={() => handlePipelineAction(s.id, 'convert')}
                      disabled={isRunning}
                      className="inline-flex items-center gap-1 bg-sky-50 hover:bg-sky-100 text-sky-800 px-2.5 py-1.5 rounded text-[10px] font-semibold border border-sky-200 transition-colors disabled:opacity-50"
                      title="تحويل المسودة لهيكل JSON المعتمد"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>تحويل JSON</span>
                    </button>

                    {/* 4. Import JSON to DB */}
                    <button
                      onClick={() => handlePipelineAction(s.id, 'import')}
                      disabled={isRunning}
                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded text-[10px] font-semibold transition-colors disabled:opacity-50"
                      title="رفع واستيراد الدرس والأسئلة لقاعدة البيانات"
                    >
                      <FileCheck className="w-3 h-3" />
                      <span>استيراد ونشر</span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export const dynamic = 'force-dynamic'
