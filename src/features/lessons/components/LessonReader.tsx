'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReadingProgress } from './ReadingProgress'
import { ContentRenderer } from './ContentRenderer'
import { DetailedLesson, startLesson } from '@/actions/learning'
import { toggleBookmark } from '@/actions/learning'
import { Bookmark, ArrowRight, HelpCircle, Info } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import { LessonFeedback } from './LessonFeedback'

interface LessonReaderProps {
  lesson: DetailedLesson
  isBookmarked: boolean
  prevLessonSlug: string | null
  nextLessonSlug: string | null
}

/**
 * Client Component: Interactive shell wrapping the lesson text,
 * integrating scroll progress monitoring, bookmark actions, and quiz triggers.
 */
export function LessonReader({ lesson, isBookmarked, prevLessonSlug, nextLessonSlug }: LessonReaderProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [bookmarked, setBookmarked] = useState(isBookmarked)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Scroll restoration and page telemetry on mount/slug change
  useEffect(() => {
    window.scrollTo(0, 0)
    trackEvent('lesson_started', { slug: lesson.slug, title: lesson.title })
    
    // Trigger startLesson tracker
    startTransition(async () => {
      await startLesson(lesson.id)
    })
  }, [lesson.id, lesson.slug, lesson.title])

  const handleToggleBookmark = () => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await toggleBookmark(lesson.id)
      if (res.success && res.data) {
        const newState = res.data.bookmarked
        setBookmarked(newState)
        if (newState) {
          trackEvent('bookmark_created', { lessonId: lesson.id, title: lesson.title })
        }
      } else {
        setErrorMsg(res.error || 'حدث خطأ أثناء تعديل المفضلة')
      }
    })
  }

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col p-4 max-w-md mx-auto w-full min-h-screen relative pb-28">
      {/* Sticky Progress Bar */}
      <ReadingProgress />

      {/* Navigation Header */}
      <header className="flex items-center gap-3 py-4 border-b border-border mb-6">
        <button 
          onClick={() => router.back()} 
          className="text-muted-foreground hover:text-foreground"
          aria-label="الرجوع للخلف"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-muted-foreground">تفاصيل الدرس</span>
      </header>

      {/* Lesson Metadata */}
      <section className="mb-6">
        <h1 className="text-2xl font-extrabold text-primary-950 mb-2 leading-snug">
          {lesson.title}
        </h1>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>⏱️ مدة القراءة: {lesson.duration_minutes} دقائق</span>
          <span>•</span>
          <span className="font-semibold text-primary-700">تأسيسي</span>
        </div>
      </section>

      {/* Lesson Content Blocks */}
      <main className="flex-1">
        <div className="pt-8 border-t border-border mt-12 mb-8">
          <ContentRenderer blocks={lesson.content} />
        </div>

        {/* Feedback Section */}
        <LessonFeedback lessonId={lesson.id} />

        {/* References Callout */}
        <div className="mt-8 border-t border-border pt-4">
          <div className="flex gap-2 items-center text-muted-foreground mb-3">
            <Info className="w-4 h-4" />
            <h3 className="text-xs font-bold">المراجع والتوثيق</h3>
          </div>
          <ul className="list-decimal list-inside text-xs text-muted-foreground flex flex-col gap-1.5 text-start">
            <li>صحيح البخاري، كتاب الإيمان.</li>
            <li>صحيح مسلم، كتاب الإيمان، حديث جبريل الطويل.</li>
            <li>تفسير ابن كثير، تفسير سورة البقرة وسورة المائدة.</li>
          </ul>
        </div>

        {/* Previous / Next Lesson Navigation Buttons */}
        <div className="flex gap-4 items-center justify-between mt-8 mb-12">
          {prevLessonSlug ? (
            <Link
              href={`/lesson/${prevLessonSlug}`}
              className="flex-1 flex items-center justify-center gap-2 border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-bold py-3 rounded-xl transition-all"
            >
              <span>← الدرس السابق</span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {nextLessonSlug ? (
            <Link
              href={`/lesson/${nextLessonSlug}`}
              className="flex-1 flex items-center justify-center gap-2 border border-border bg-card text-primary-700 hover:text-primary-800 text-xs font-bold py-3 rounded-xl transition-all"
            >
              <span>الدرس التالي ←</span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </main>

      {/* Sticky Action Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-card/90 backdrop-blur-md border-t border-border py-4 px-6 z-40">
        <div className="max-w-md mx-auto flex gap-4 items-center">
          {/* Bookmark Toggle */}
          <button
            onClick={handleToggleBookmark}
            disabled={isPending}
            className={`h-12 w-12 rounded-xl flex items-center justify-center border transition-all ${
              bookmarked 
                ? 'bg-primary-50 border-primary-200 text-primary-700' 
                : 'bg-background border-border text-muted-foreground hover:text-foreground'
            }`}
            aria-label="حفظ العلامة المرجعية"
          >
            <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Test Understanding CTA */}
          <Link
            href={`/lesson/${lesson.slug}/quiz`}
            className="flex-1 h-12 bg-primary-700 text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-800 transition-all shadow-sm"
          >
            <HelpCircle className="w-5 h-5" />
            <span>اختبر فهمك للدرس</span>
          </Link>
        </div>
        
        {errorMsg && (
          <p className="max-w-md mx-auto text-xs text-destructive text-center mt-2 font-medium">
            {errorMsg}
          </p>
        )}
      </footer>
    </div>
  )
}
