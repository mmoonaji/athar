import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProfileDetails } from '@/actions/profile'
import { ProfileForm } from '@/features/profile/components/ProfileForm'
import { ArrowRight, Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const res = await getProfileDetails()

  if (!res.success || !res.data) {
    redirect('/login')
  }

  const profile = res.data

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col p-4 max-w-md mx-auto w-full min-h-screen">
      {/* Header */}
      <header className="flex items-center gap-3 py-4 border-b border-border mb-6">
        <Link href="/journey" className="text-muted-foreground hover:text-foreground">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-bold text-primary-950">الملف الشخصي وأهداف التعلم</h1>
      </header>

      {/* Profile summary details */}
      <section className="mb-6 bg-card border border-border p-5 rounded-xl shadow-sm flex items-center gap-4 text-start">
        <div className="h-14 w-14 rounded-full bg-primary-700 text-white flex items-center justify-center font-bold text-xl">
          {profile.full_name[0] || 'أ'}
        </div>
        <div>
          <h2 className="text-base font-extrabold text-primary-950 mb-0.5">{profile.full_name}</h2>
          <p className="text-xs text-muted-foreground">تاريخ الانضمام: {new Date(profile.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}</p>
        </div>
      </section>

      {/* Edit Form */}
      <main className="flex-1 bg-card border border-border p-5 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-primary-700">
          <Settings className="w-4 h-4" />
          <h3 className="text-xs font-bold">تعديل الإعدادات</h3>
        </div>
        <ProfileForm initialProfile={profile} />
      </main>
    </div>
  )
}
