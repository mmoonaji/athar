'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { completeLesson } from '@/actions/learning'
import { CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw, Award, Flame } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

export interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface QuizQuestion {
  id: string
  text: string
  options: QuizOption[]
}

interface QuizEngineProps {
  lessonId: string
  lessonSlug: string
  pathSlug: string
  questions: QuizQuestion[]
  isAuthenticated: boolean
}

/**
 * Client Component: Interactive quiz engine managing question slides,
 * state changes for chosen options, instant feedback, and progress updates.
 */
export function QuizEngine({ lessonId, lessonSlug, pathSlug, questions, isAuthenticated }: QuizEngineProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  
  const [isPending, startTransition] = useTransition()
  const [pointsEarned, setPointsEarned] = useState(10)

  const activeQuestion = questions[currentIdx]
  
  // Guard for empty quiz data
  if (!activeQuestion) {
    return (
      <div className="flex-1 bg-background text-foreground flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto w-full min-h-screen">
        <AlertTriangle className="w-12 h-12 text-secondary-500 mb-4" />
        <h2 className="text-lg font-bold mb-2">لا يوجد اختبار للأسف</h2>
        <p className="text-sm text-muted-foreground mb-6">هذا الدرس لا يحتوي على أسئلة اختبار مفعلة حالياً.</p>
        <Link 
          href={`/learn/${pathSlug}`}
          className="bg-primary-700 text-white font-bold py-2.5 px-6 rounded-xl"
        >
          الرجوع للمسار
        </Link>
      </div>
    )
  }

  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return
    setSelectedOptionId(optionId)
  }

  const handleVerifyAnswer = () => {
    if (!selectedOptionId || isAnswered) return
    
    const chosen = activeQuestion.options.find((o) => o.id === selectedOptionId)
    if (chosen?.isCorrect) {
      setScore((s) => s + 1)
    }
    setIsAnswered(true)
  }

  const handleNext = () => {
    setSelectedOptionId(null)
    setIsAnswered(false)

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1)
    } else {
      // Quiz complete
      trackEvent('quiz_completed', { lessonId, score, totalQuestions: questions.length })

      if (isAuthenticated) {
        startTransition(async () => {
          const res = await completeLesson(lessonId)
          if (res.success) {
            setPointsEarned(10) // Mock award points
            trackEvent('lesson_completed', { lessonId })
          } else {
            console.warn('DB Sync Warning:', res.error)
          }
          setQuizComplete(true)
        })
      } else {
        // Save guest progress locally
        if (typeof window !== 'undefined') {
          try {
            const guestLessonsRaw = localStorage.getItem('athar_completed_lessons')
            const guestLessons = guestLessonsRaw ? JSON.parse(guestLessonsRaw) as string[] : []
            if (!guestLessons.includes(lessonId)) {
              guestLessons.push(lessonId)
              localStorage.setItem('athar_completed_lessons', JSON.stringify(guestLessons))
            }
          } catch (e) {
            console.error('Failed to update local storage progress:', e)
          }
        }
        setQuizComplete(true)
      }
    }
  }

  // Render Completion Reward View
  if (quizComplete) {
    const totalQuestions = questions.length
    const percent = Math.round((score / totalQuestions) * 100)

    return (
      <div className="flex-1 bg-background text-foreground flex flex-col p-4 max-w-md mx-auto w-full min-h-screen justify-center items-center text-center">
        <div className="bg-card border border-border p-6 rounded-2xl w-full shadow-sm flex flex-col items-center">
          <div className="h-16 w-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-primary-700" />
          </div>
          
          <h2 className="text-xl font-extrabold text-primary-950 mb-1">أحسنت صنعاً!</h2>
          <p className="text-sm text-muted-foreground mb-6">لقد أكملت اختبار الدرس بنجاح</p>

          {/* Guest conversion banner */}
          {!isAuthenticated && (
            <div className="bg-primary-50 border border-primary-100 p-4 rounded-xl mb-6 w-full text-start">
              <h4 className="text-xs font-bold text-primary-800 mb-1">حفظ التقدم المستقبلي</h4>
              <p className="text-xs text-primary-950 leading-relaxed mb-3">
                احفظ تقدمك وواصل رحلتك من أي جهاز
              </p>
              <Link
                href="/signup"
                className="inline-block text-xs font-bold bg-primary-700 text-white px-3 py-1.5 rounded-lg hover:bg-primary-800"
              >
                إنشاء حساب مجاني
              </Link>
            </div>
          )}

          {/* Points display */}
          <div className="flex gap-4 w-full justify-center mb-6">
            <div className="flex flex-col items-center bg-primary-50 border border-primary-100 rounded-xl p-3 w-24">
              <span className="text-[10px] font-bold text-primary-600 mb-1">نقاط نور</span>
              <div className="flex items-center gap-1 text-primary-800 font-bold text-lg">
                <span>+{pointsEarned}</span>
              </div>
            </div>
            <div className="flex flex-col items-center bg-secondary-50 border border-secondary-100 rounded-xl p-3 w-24">
              <span className="text-[10px] font-bold text-secondary-600 mb-1">تحديث السلسلة</span>
              <div className="flex items-center gap-1 text-secondary-800 font-bold text-lg">
                <Flame className="w-4 h-4 text-secondary-500 fill-current" />
                <span>+١ يوم</span>
              </div>
            </div>
          </div>

          {/* Score Circle */}
          <div className="mb-8">
            <div className="text-xs text-muted-foreground font-semibold mb-1">نتيجتك النهائية</div>
            <div className="text-2xl font-black text-primary-700">
              {score} / {totalQuestions}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">({percent}٪ صحيحة)</div>
          </div>

          <Link
            href={`/learn/${pathSlug}`}
            className="w-full bg-primary-700 text-primary-foreground font-bold py-3.5 px-4 rounded-xl hover:bg-primary-800 transition-colors shadow-sm text-center"
          >
            العودة للمنهج الدراسي
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col p-4 max-w-md mx-auto w-full min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center py-4 border-b border-border mb-8">
        <Link 
          href={`/lesson/${lessonSlug}`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-semibold">تخطي</span>
        </Link>
        <span className="text-xs font-bold text-muted-foreground">
          السؤال {currentIdx + 1} من {questions.length}
        </span>
      </header>

      {/* Progress slider */}
      <div className="w-full bg-muted h-1 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-primary-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <main className="flex-1 flex flex-col gap-6">
        <h2 className="text-lg md:text-xl font-bold text-primary-950 text-start leading-relaxed">
          {activeQuestion.text}
        </h2>

        {/* Options grid */}
        <div className="flex flex-col gap-3">
          {activeQuestion.options.map((option) => {
            const isSelected = selectedOptionId === option.id
            let optionStyles = 'border-border bg-card hover:border-primary-400'

            if (isAnswered) {
              if (option.isCorrect) {
                // Correct option highlighting
                optionStyles = 'bg-green-50 border-green-300 text-green-950 font-bold'
              } else if (isSelected) {
                // Chosen incorrect option highlighting
                optionStyles = 'bg-red-50 border-red-300 text-red-950'
              } else {
                // Unselected incorrect options
                optionStyles = 'opacity-60 border-border bg-card'
              }
            } else if (isSelected) {
              optionStyles = 'border-primary-600 bg-primary-50/20 font-bold ring-2 ring-primary-600/10'
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                disabled={isAnswered}
                className={`w-full border p-4 rounded-xl text-start transition-all text-sm md:text-base flex items-center justify-between ${optionStyles}`}
              >
                <span>{option.text}</span>
                {isAnswered && option.isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {/* Incorrect choice feedback message */}
        {isAnswered && selectedOptionId && !activeQuestion.options.find(o => o.id === selectedOptionId)?.isCorrect && (
          <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl flex gap-3 text-start">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-800 mb-0.5">الإجابة غير صحيحة</h4>
              <p className="text-xs text-red-950 leading-relaxed">
                يرجى مراجعة الخيار المعلم بالأخضر والعودة لقراءة الدرس للتركيز على هذه النقطة.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Action Footer */}
      <footer className="py-4 border-t border-border mt-8">
        {!isAnswered ? (
          <button
            onClick={handleVerifyAnswer}
            disabled={!selectedOptionId}
            className="w-full h-12 bg-primary-700 text-primary-foreground font-bold rounded-xl flex items-center justify-center disabled:opacity-50 transition-all shadow-sm"
          >
            تحقق من الإجابة
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={isPending}
            className="w-full h-12 bg-primary-700 text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {isPending && <RefreshCw className="w-4 h-4 animate-spin" />}
            <span>
              {currentIdx + 1 < questions.length ? 'السؤال التالي' : 'عرض النتيجة'}
            </span>
          </button>
        )}
      </footer>
    </div>
  )
}
