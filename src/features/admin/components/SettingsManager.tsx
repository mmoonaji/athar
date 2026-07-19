'use client'

import { useState } from 'react'
import { saveSettings } from '../actions/admin-actions'
import { Settings, Save, CheckCircle } from 'lucide-react'

export function SettingsManager() {
  const [siteName, setSiteName] = useState('أثر (Athar)')
  const [siteDescription, setSiteDescription] = useState('منصة تعليمية إسلامية تفاعلية موجزة.')
  const [aiProvider, setAiProvider] = useState('gemini')
  const [brandColor, setBrandColor] = useState('#0d9488') // Teal-600
  const [isSaved, setIsSaved] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setIsSaved(false)

    try {
      const res = await saveSettings({
        siteName,
        siteDescription,
        aiProvider,
        brandColor,
      })
      if (res.success) {
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 3000)
      }
    } catch (err) {
      console.error('Failed to save settings:', err)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
      {/* Settings Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <Settings className="w-5 h-5 text-teal-600" />
        <h2 className="text-sm font-semibold text-slate-800">إعدادات النظام العامة والمحركات</h2>
      </div>

      {/* Success Banner */}
      {isSaved && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 flex items-center gap-3 text-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>تم حفظ الإعدادات وتحديثها في ملفات النظام بنجاح!</span>
        </div>
      )}

      {/* General Settings */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">اسم المنصة:</label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 bg-slate-50/50"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">وصف المنصة التعريفي:</label>
          <textarea
            rows={2}
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 bg-slate-50/50"
            required
          />
        </div>

        {/* Branding Color Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">اللون الأساسي للهوية (براند):</label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="w-10 h-10 border border-slate-200 rounded cursor-pointer"
            />
            <span className="text-xs text-slate-500 font-mono">{brandColor}</span>
          </div>
        </div>

        {/* AI Settings */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">محرك التوليد بالذكاء الاصطناعي الافتراضي:</label>
          <select
            value={aiProvider}
            onChange={(e) => setAiProvider(e.target.value)}
            className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 bg-slate-50/50 cursor-pointer"
          >
            <option value="gemini">Google Gemini (مستحسن للأداء اللغوي)</option>
            <option value="openai">OpenAI ChatGPT (مستحسن للذكاء التفاعلي)</option>
            <option value="claude">Anthropic Claude</option>
            <option value="deepseek">DeepSeek AI</option>
          </select>
        </div>
      </div>

      {/* Action submit button */}
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>حفظ التعديلات</span>
        </button>
      </div>
    </form>
  )
}
export const dynamic = 'force-dynamic'
