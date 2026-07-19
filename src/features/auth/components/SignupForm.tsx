'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUpWithEmailPassword } from '@/actions/auth'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

/**
 * Client Component: Interactive signup form featuring Arabic RTL alerts,
 * registration actions, and progress syncing logic.
 */
export function SignupForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!fullName || !email || !password) {
      setErrorMsg('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    if (password.length < 6) {
      setErrorMsg('كلمة المرور يجب أن لا تقل عن ٦ أحرف')
      return
    }

    startTransition(async () => {
      const res = await signUpWithEmailPassword({ email, password, fullName })
      if (res.success && res.data) {
        trackEvent('signup_completed')
        
        // Sync guest progress from local storage if available
        if (typeof window !== 'undefined') {
          const guestLessonsRaw = localStorage.getItem('athar_completed_lessons')
          if (guestLessonsRaw) {
            try {
              const lessonIds = JSON.parse(guestLessonsRaw) as string[]
              const { syncGuestProgress } = await import('@/actions/auth')
              await syncGuestProgress(lessonIds)
              localStorage.removeItem('athar_completed_lessons')
            } catch (err) {
              console.warn('Failed to sync guest progress:', err)
            }
          }
        }

        router.push('/journey')
        router.refresh()
      } else {
        setErrorMsg(res.error || 'حدث خطأ أثناء إنشاء الحساب')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-start">
      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-1.5" htmlFor="fullName">
          الاسم الكامل
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isPending}
          className="w-full border border-input bg-background px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm text-start"
          placeholder="أحمد محمد"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-1.5" htmlFor="email">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          className="w-full border border-input bg-background px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm text-start"
          placeholder="name@example.com"
          dir="ltr"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-1.5" htmlFor="password">
          كلمة المرور
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
          className="w-full border border-input bg-background px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm text-start"
          placeholder="••••••••"
          dir="ltr"
          required
        />
      </div>

      {errorMsg && (
        <div className="bg-red-50/50 border border-red-100 p-3.5 rounded-xl flex gap-2.5 items-start mt-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs text-red-950 leading-relaxed font-semibold">
            {errorMsg}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-12 bg-primary-700 hover:bg-primary-800 text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 mt-4 transition-all shadow-sm"
      >
        {isPending && <RefreshCw className="w-4 h-4 animate-spin" />}
        <span>تسجيل حساب جديد</span>
      </button>

      <div className="text-center text-xs text-muted-foreground mt-4">
        لديك حساب بالفعل؟{' '}
        <Link href="/login" className="text-primary-700 font-bold hover:underline">
          تسجيل الدخول
        </Link>
      </div>
    </form>
  )
}
