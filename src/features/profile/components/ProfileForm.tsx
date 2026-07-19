'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfileDetails, UserProfileData } from '@/actions/profile'
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react'

interface ProfileFormProps {
  initialProfile: UserProfileData
}

/**
 * Client Component: Interactive profile manager allowing updates
 * to daily learning minutes goals and account name.
 */
export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [fullName, setFullName] = useState(initialProfile.full_name)
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(initialProfile.daily_goal_minutes)
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!fullName) {
      setErrorMsg('الاسم الكامل مطلوب')
      return
    }

    if (dailyGoalMinutes < 5 || dailyGoalMinutes > 120) {
      setErrorMsg('الهدف اليومي يجب أن يكون بين ٥ و ١٢٠ دقيقة')
      return
    }

    startTransition(async () => {
      const res = await updateProfileDetails({
        fullName,
        dailyGoalMinutes,
      })

      if (res.success && res.data) {
        setSuccessMsg('تم حفظ التعديلات بنجاح!')
        router.refresh()
      } else {
        setErrorMsg(res.error || 'حدث خطأ أثناء حفظ التعديلات')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-start">
      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-1.5" htmlFor="fullName">
          الاسم بالكامل
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
        <label className="block text-xs font-bold text-muted-foreground mb-1.5" htmlFor="dailyGoalMinutes">
          الهدف اليومي (دقائق)
        </label>
        <input
          id="dailyGoalMinutes"
          type="number"
          value={dailyGoalMinutes}
          onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
          disabled={isPending}
          className="w-full border border-input bg-background px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm text-start"
          min={5}
          max={120}
          required
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          حدد المدة التي تطمح لقضائها في تصفح وقراءة الدروس يومياً.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50/50 border border-red-100 p-3.5 rounded-xl flex gap-2.5 items-start mt-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs text-red-950 leading-relaxed font-semibold">
            {errorMsg}
          </p>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50/50 border border-green-100 p-3.5 rounded-xl flex gap-2.5 items-start mt-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
          <p className="text-xs text-green-950 leading-relaxed font-semibold">
            {successMsg}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-12 bg-primary-700 hover:bg-primary-800 text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 mt-4 transition-all shadow-sm"
      >
        {isPending && <RefreshCw className="w-4 h-4 animate-spin" />}
        <span>حفظ التعديلات</span>
      </button>
    </form>
  )
}
