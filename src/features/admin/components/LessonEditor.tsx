'use client'

import { useState } from 'react'
import { saveLessonFromEditor } from '../actions/admin-actions'
import { Eye, Edit3, Plus, Trash2, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react'
import Link from 'next/link'

interface Block {
  type: string
  content: string
  translation?: string
  narrator?: string
}

interface QuestionOption {
  id: string
  text: string
  isCorrect: boolean
}

interface QuizQuestion {
  id: string
  text: string
  options: QuestionOption[]
}

interface Quiz {
  title: string
  questions: QuizQuestion[]
}

interface Lesson {
  id: string
  title: string
  slug: string
  duration_minutes: number
  content: Block[]
  published: boolean
  quiz: Quiz | null
}

interface LessonEditorProps {
  initialLesson: Lesson
}

export function LessonEditor({ initialLesson }: LessonEditorProps) {
  const [lesson, setLesson] = useState<Lesson>(initialLesson)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [isPending, setIsPending] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleMetadataChange = (key: keyof Lesson, value: string | number | boolean | Block[] | Quiz | null) => {
    setLesson((prev) => ({ ...prev, [key]: value }))
  }

  // Content Blocks management
  const handleBlockChange = (idx: number, key: keyof Block, value: string) => {
    setLesson((prev) => {
      const nextContent = [...prev.content]
      nextContent[idx] = { ...nextContent[idx], [key]: value }
      return { ...prev, content: nextContent }
    })
  }

  const addBlock = (type: 'paragraph' | 'quran' | 'hadith' | 'takeaway' | 'reflection') => {
    setLesson((prev) => ({
      ...prev,
      content: [...prev.content, { type, content: '', translation: '', narrator: '' }],
    }))
  }

  const removeBlock = (idx: number) => {
    setLesson((prev) => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== idx),
    }))
  }

  // Quiz Questions management
  const handleQuestionTextChange = (qIdx: number, text: string) => {
    setLesson((prev) => {
      if (!prev.quiz) return prev
      const nextQuestions = [...prev.quiz.questions]
      nextQuestions[qIdx] = { ...nextQuestions[qIdx], text }
      return { ...prev, quiz: { ...prev.quiz, questions: nextQuestions } }
    })
  }

  const handleOptionTextChange = (qIdx: number, oIdx: number, text: string) => {
    setLesson((prev) => {
      if (!prev.quiz) return prev
      const nextQuestions = [...prev.quiz.questions]
      const nextOptions = [...nextQuestions[qIdx].options]
      nextOptions[oIdx] = { ...nextOptions[oIdx], text }
      nextQuestions[qIdx] = { ...nextQuestions[qIdx], options: nextOptions }
      return { ...prev, quiz: { ...prev.quiz, questions: nextQuestions } }
    })
  }

  const handleOptionCorrectChange = (qIdx: number, oIdx: number) => {
    setLesson((prev) => {
      if (!prev.quiz) return prev
      const nextQuestions = [...prev.quiz.questions]
      const nextOptions = nextQuestions[qIdx].options.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === oIdx,
      }))
      nextQuestions[qIdx] = { ...nextQuestions[qIdx], options: nextOptions }
      return { ...prev, quiz: { ...prev.quiz, questions: nextQuestions } }
    })
  }

  const handleSave = async (publishedState?: boolean) => {
    setIsPending(true)
    setIsSaved(false)
    const targetPublished = publishedState !== undefined ? publishedState : lesson.published

    try {
      const res = await saveLessonFromEditor(lesson.id, {
        title: lesson.title,
        slug: lesson.slug,
        durationMinutes: lesson.duration_minutes,
        contentBlocks: lesson.content,
        quiz: lesson.quiz,
        published: targetPublished,
      })

      if (res.success) {
        setLesson((prev) => ({ ...prev, published: targetPublished }))
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 3000)
      }
    } catch (err) {
      console.error('Failed to save lesson:', err)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/lessons"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{lesson.title || 'درس بدون عنوان'}</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">معرف فريد: {lesson.id}</p>
          </div>
        </div>

        {/* Tab triggers */}
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'edit' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تحرير</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'preview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>معاينة</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave(false)}
              disabled={isPending}
              className="bg-white border border-slate-200 text-slate-700 font-semibold text-xs px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              حفظ كمسودة
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isPending}
              className="bg-teal-600 text-white font-semibold text-xs px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50"
            >
              نشر الدرس للعموم
            </button>
          </div>
        </div>
      </div>

      {/* Success banner */}
      {isSaved && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>تم حفظ تحديثات الدرس ومراجعته بنجاح!</span>
        </div>
      )}

      {/* Main Tab content rendering */}
      {activeTab === 'edit' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Edit form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metadata Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">بيانات التعريف والـ SEO</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500">عنوان المقال:</label>
                  <input
                    type="text"
                    value={lesson.title}
                    onChange={(e) => handleMetadataChange('title', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500">الرابط البديل (Slug):</label>
                  <input
                    type="text"
                    value={lesson.slug}
                    onChange={(e) => handleMetadataChange('slug', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 bg-slate-50/50 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500">مدة القراءة المقدرة (بالدقائق):</label>
                  <input
                    type="number"
                    value={lesson.duration_minutes}
                    onChange={(e) => handleMetadataChange('duration_minutes', parseInt(e.target.value) || 5)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Content Blocks Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-sm font-semibold text-slate-800">مكونات الدرس (Blocks)</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => addBlock('paragraph')}
                    className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded text-[10px] font-semibold transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>فقرة</span>
                  </button>
                  <button
                    onClick={() => addBlock('quran')}
                    className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-800 px-2 py-1 rounded text-[10px] font-semibold transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>آية قرانية</span>
                  </button>
                  <button
                    onClick={() => addBlock('hadith')}
                    className="flex items-center gap-1 bg-sky-50 hover:bg-sky-100 text-sky-800 px-2 py-1 rounded text-[10px] font-semibold transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>حديث نبوي</span>
                  </button>
                </div>
              </div>

              {lesson.content.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">لا يوجد كتل نصية حالياً. ابدأ بإضافة كتلة جديدة.</p>
              ) : (
                <div className="space-y-4">
                  {lesson.content.map((b, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 relative space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          كتلة {b.type === 'quran' ? 'قرآن' : b.type === 'hadith' ? 'حديث' : 'فقرة نصية'}
                        </span>
                        <button
                          onClick={() => removeBlock(idx)}
                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Content text */}
                      <textarea
                        rows={3}
                        value={b.content}
                        onChange={(e) => handleBlockChange(idx, 'content', e.target.value)}
                        placeholder={b.type === 'quran' ? 'اكتب الآية الكريمة هنا (بالتشكيل إن أمكن)...' : 'اكتب نص المكون هنا...'}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
                      />

                      {/* Quran / Hadith custom tags */}
                      {b.type === 'quran' && (
                        <input
                          type="text"
                          value={b.translation || ''}
                          onChange={(e) => handleBlockChange(idx, 'translation', e.target.value)}
                          placeholder="تفسير الآية أو تفصيل السورة ورقم الآية..."
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
                        />
                      )}

                      {b.type === 'hadith' && (
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={b.narrator || ''}
                            onChange={(e) => handleBlockChange(idx, 'narrator', e.target.value)}
                            placeholder="الراوي أو المخرج (مثال: رواه البخاري)..."
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
                          />
                          <input
                            type="text"
                            value={b.translation || ''}
                            onChange={(e) => handleBlockChange(idx, 'translation', e.target.value)}
                            placeholder="شرح المفردات الصعبة أو التوثيق..."
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quiz Manager Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">اختبار فهم الدرس (Quiz)</h2>
              
              {lesson.quiz?.questions.map((q, qIdx) => (
                <div key={q.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500">نص السؤال {qIdx + 1}:</label>
                    <input
                      type="text"
                      value={q.text}
                      onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-slate-400">الخيارات الأربعة (حدد الخيار الصحيح):</span>
                    {q.options.map((opt, oIdx) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={opt.isCorrect}
                          onChange={() => handleOptionCorrectChange(qIdx, oIdx)}
                          className="w-4 h-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleOptionTextChange(qIdx, oIdx, e.target.value)}
                          className="flex-1 text-xs p-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Render Live learner preview */
        <div className="bg-slate-100 p-8 rounded-xl border border-slate-200 min-h-[400px]">
          <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{lesson.title || 'درس جديد بدون عنوان'}</h2>
              <p className="text-[10px] text-slate-400 mt-1">⏱️ مدة القراءة: {lesson.duration_minutes} دقائق</p>
            </div>

            <div className="space-y-4 divide-y divide-slate-100">
              {lesson.content.map((b, idx) => (
                <div key={idx} className="pt-4 first:pt-0">
                  {b.type === 'quran' && (
                    <div className="my-4 bg-teal-50/50 p-4 rounded-xl border-r-4 border-teal-500 text-center font-serif text-slate-800">
                      <p className="text-lg leading-loose">{b.content}</p>
                      {b.translation && <p className="text-xs text-slate-500 mt-2 font-sans">{b.translation}</p>}
                    </div>
                  )}

                  {b.type === 'hadith' && (
                    <div className="my-4 bg-sky-50/50 p-4 rounded-xl border-r-4 border-sky-500 text-right text-slate-800">
                      <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">حديث شريف</span>
                      <p className="text-sm mt-2 leading-relaxed font-serif">{b.content}</p>
                      {b.narrator && <p className="text-[10px] text-slate-400 mt-2">المخرج: {b.narrator}</p>}
                    </div>
                  )}

                  {b.type === 'paragraph' && (
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">{b.content}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Test understanding button placeholder */}
            {lesson.quiz && (
              <div className="pt-4 border-t border-slate-100">
                <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>اختبر فهمك للدرس</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
export const dynamic = 'force-dynamic'
