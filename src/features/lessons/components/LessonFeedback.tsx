'use client'

import { useState, useTransition } from 'react'
import { submitLessonFeedback } from '../actions/feedback-actions'
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

export function LessonFeedback({ lessonId }: { lessonId: string }) {
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating && !comment) {
      setErrorMsg('يرجى تقديم تقييم أو تعليق أولاً')
      return
    }

    setErrorMsg(null)
    startTransition(async () => {
      const res = await submitLessonFeedback({ lessonId, rating, comment })
      if (res.success) {
        setSubmitted(true)
        trackEvent('lesson_feedback_submitted', { lessonId, rating: rating || 0 })
      } else {
        setErrorMsg(res.error || 'حدث خطأ غير متوقع')
      }
    })
  }

  if (submitted) {
    return (
      <div className="bg-primary-50 text-primary-900 border border-primary-100 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 animate-in fade-in zoom-in duration-300">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-primary-700" />
        </div>
        <div>
          <h3 className="font-bold mb-1">شكراً لملاحظاتك!</h3>
          <p className="text-sm opacity-80">سيساعدنا هذا في تحسين جودة الدروس مستقبلاً.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border p-5 rounded-2xl mt-8">
      <h3 className="font-bold text-primary-950 mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary-700" />
        ما رأيك بهذا الدرس؟
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4 text-start">
        <div className="flex gap-2 justify-center py-2" dir="ltr">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  rating && star <= rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300'
                }`}
              />
            </button>
          ))}
        </div>

        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isPending}
            placeholder="هل لديك أي ملاحظات أو تعليقات إضافية؟ (اختياري)"
            className="w-full border border-input bg-background px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm text-start min-h-[80px] resize-none"
          />
        </div>

        {errorMsg && (
          <p className="text-red-500 text-xs font-medium">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={isPending || (!rating && !comment)}
          className="w-full bg-primary-700 text-white font-bold py-2.5 rounded-xl hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'جاري الإرسال...' : 'إرسال التقييم'}
        </button>
      </form>
    </div>
  )
}
