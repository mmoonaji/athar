import { SignupForm } from '@/features/auth/components/SignupForm'
import Link from 'next/link'
import { isFeatureEnabled } from '@/lib/flags'

export default async function SignupPage() {
  const publicSignupEnabled = await isFeatureEnabled('ENABLE_PUBLIC_SIGNUP')
  
  return (
    <div className="flex-1 bg-background text-foreground flex flex-col p-4 max-w-md mx-auto w-full min-h-screen justify-center">
      <div className="bg-card border border-border p-6 rounded-2xl w-full shadow-sm text-center">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="h-9 w-9 rounded-lg bg-primary-700 text-white flex items-center justify-center font-bold text-lg">
            أ
          </span>
          <span className="text-xl font-bold text-primary-700 tracking-tight">أثَــر</span>
        </div>

        <h2 className="text-xl font-extrabold text-primary-950 mb-1">ابدأ بناء أثرك اليوم</h2>
        <p className="text-sm text-muted-foreground mb-6">أنشئ حساباً مجانياً لحفظ تقدمك ومزامنة سلسلتك</p>

        <SignupForm requiresBetaCode={!publicSignupEnabled} />
        
        <div className="border-t border-border pt-4 mt-6">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
