'use client'

import { useState, useTransition } from 'react'
import { saveOnboardingPreferences, LearningGoal } from '@/actions/onboarding'
import { BookOpen, RefreshCw, Clock, CheckCircle2, ChevronLeft } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

const TOTAL_STEPS = 3

const GOALS: { key: LearningGoal; label: string; description: string; icon: string }[] = [
  {
    key: 'aqeedah_basics',
    label: 'أريد تأسيس معرفتي الإسلامية',
    description: 'بناء قاعدة متينة في العقيدة والعبادات من البداية',
    icon: '🌱',
  },
  {
    key: 'review',
    label: 'أريد مراجعة ما تعلمت',
    description: 'تثبيت وتنظيم المعرفة الإسلامية التي اكتسبتها مسبقاً',
    icon: '📖',
  },
  {
    key: 'daily_habit',
    label: 'أريد التعلم بشكل يومي',
    description: 'بناء عادة تعليمية يومية منتظمة ومستدامة',
    icon: '🔥',
  },
]

const DAILY_GOALS: { minutes: 5 | 10 | 15; label: string; description: string }[] = [
  { minutes: 5,  label: '٥ دقائق',  description: 'مناسب للبداية أو الجدول المزدحم' },
  { minutes: 10, label: '١٠ دقائق', description: 'الوتيرة المثالية للمبتدئين' },
  { minutes: 15, label: '١٥ دقيقة', description: 'للراغبين في تعلم أعمق وأشمل' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal>('aqeedah_basics')
  const [selectedMinutes, setSelectedMinutes] = useState<5 | 10 | 15>(10)
  const [isPending, startTransition] = useTransition()

  const handleFinish = () => {
    startTransition(async () => {
      trackEvent('onboarding_completed', { goal: selectedGoal, minutes: selectedMinutes })
      await saveOnboardingPreferences(selectedGoal, selectedMinutes)
    })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                i < step ? 'bg-primary-700' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Step 1 — Welcome */}
        {step === 1 && (
          <div className="text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-primary-700 rounded-2xl flex items-center justify-center mx-auto text-white text-3xl font-bold shadow-lg">
              أ
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-primary-950 mb-2">
                ابدأ رحلتك مع أثر
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                منصة تعليمية إسلامية مصممة لتساعدك على بناء علم شرعي أصيل
              </p>
            </div>

            <div className="space-y-3 text-right">
              {[
                { icon: BookOpen, text: 'تعلّم العلوم الإسلامية الأصيلة بمصادر موثوقة' },
                { icon: RefreshCw, text: 'ابنِ عادات تعليمية يومية منتظمة ومستدامة' },
                { icon: Clock,     text: 'تابع تقدمك وسلسلة أيام تعلمك المتواصلة' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
                  <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary-700" />
                  </div>
                  <p className="text-sm font-medium text-primary-950">{text}</p>
                </div>
              ))}
            </div>

            <button
              id="onboarding-next-step1"
              onClick={() => setStep(2)}
              className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md"
            >
              هيا نبدأ ←
            </button>
          </div>
        )}

        {/* Step 2 — Choose Goal */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-right">
              <h2 className="text-xl font-extrabold text-primary-950 mb-1">
                ما هدفك من التعلم؟
              </h2>
              <p className="text-sm text-muted-foreground">
                سنخصّص مسارك التعليمي بناءً على اختيارك
              </p>
            </div>

            <div className="space-y-3">
              {GOALS.map((goal) => (
                <button
                  key={goal.key}
                  id={`goal-${goal.key}`}
                  onClick={() => setSelectedGoal(goal.key)}
                  className={`w-full text-right flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    selectedGoal === goal.key
                      ? 'border-primary-700 bg-primary-50'
                      : 'border-border bg-card hover:border-primary-300'
                  }`}
                >
                  <span className="text-2xl shrink-0">{goal.icon}</span>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${selectedGoal === goal.key ? 'text-primary-800' : 'text-primary-950'}`}>
                      {goal.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{goal.description}</p>
                  </div>
                  {selectedGoal === goal.key && (
                    <CheckCircle2 className="w-5 h-5 text-primary-700 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                السابق
              </button>
              <button
                id="onboarding-next-step2"
                onClick={() => setStep(3)}
                className="flex-1 bg-primary-700 hover:bg-primary-800 text-white font-bold py-3 rounded-xl transition-all"
              >
                التالي ←
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Daily Goal */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-right">
              <h2 className="text-xl font-extrabold text-primary-950 mb-1">
                كم دقيقة يومياً للتعلم؟
              </h2>
              <p className="text-sm text-muted-foreground">
                الاستمرارية أهم من الكمية — اختر هدفاً تقدر عليه
              </p>
            </div>

            <div className="space-y-3">
              {DAILY_GOALS.map((option) => (
                <button
                  key={option.minutes}
                  id={`daily-goal-${option.minutes}`}
                  onClick={() => setSelectedMinutes(option.minutes)}
                  className={`w-full text-right flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    selectedMinutes === option.minutes
                      ? 'border-primary-700 bg-primary-50'
                      : 'border-border bg-card hover:border-primary-300'
                  }`}
                >
                  <Clock className={`w-5 h-5 shrink-0 ${selectedMinutes === option.minutes ? 'text-primary-700' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${selectedMinutes === option.minutes ? 'text-primary-800' : 'text-primary-950'}`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                  </div>
                  {selectedMinutes === option.minutes && (
                    <CheckCircle2 className="w-5 h-5 text-primary-700 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                السابق
              </button>
              <button
                id="onboarding-finish"
                onClick={handleFinish}
                disabled={isPending}
                className="flex-1 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all"
              >
                {isPending ? 'جاري الحفظ...' : 'ابدأ التعلم 🚀'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
