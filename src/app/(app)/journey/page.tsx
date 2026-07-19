import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfileDetails } from '@/actions/profile'
import { Flame, Gem, Compass, CheckCircle2, Circle } from 'lucide-react'
import { LogoutButton } from '@/features/auth/components/LogoutButton'

export const dynamic = 'force-dynamic'

// Fallback modules matching our seed path structure
const fallbackPathData = {
  id: '22222222-2222-2222-2222-222222222222',
  title: 'ما لا يسع المسلم جهله',
  slug: 'essential-muslim-knowledge',
  description: 'المنهج التأسيسي المتكامل في العقيدة والعبادات والطهارة لتصحيح العبادة وتثبيت الأركان.',
  modules: [
    {
      id: '33333333-3333-3333-3333-333333333333',
      title: 'الوحدة الأولى: الإيمان بالله',
      lessons: [
        {
          id: '55555555-5555-5555-5555-555555555555',
          title: 'معنى الإيمان وأركانه الستة',
          slug: 'what-is-iman',
          duration_minutes: 5,
        },
        {
          id: '66666666-6666-6666-6666-666666666666',
          title: 'أقسام التوحيد الثلاثة',
          slug: 'three-types-of-tawhid',
          duration_minutes: 6,
        },
      ],
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      title: 'الوحدة الثانية: العبادات الأساسية',
      lessons: [
        {
          id: '77777777-7777-7777-7777-777777777777',
          title: 'أهمية الطهارة في الإسلام',
          slug: 'importance-of-taharah',
          duration_minutes: 5,
        },
        {
          id: '88888888-8888-8888-8888-888888888888',
          title: 'صفة الوضوء العملية وأركانه',
          slug: 'how-to-wudu',
          duration_minutes: 8,
        },
        {
          id: '99999999-9999-9999-9999-999999999999',
          title: 'أركان الصلاة وشروط صحتها',
          slug: 'pillars-of-prayer',
          duration_minutes: 7,
        },
      ],
    },
  ],
}

export default async function JourneyPage() {
  const supabase = await createClient()

  // Verify auth session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch profile
  const profileRes = await getProfileDetails()
  if (!profileRes.success || !profileRes.data) {
    redirect('/login')
  }

  const profile = profileRes.data

  // Fetch completed progress logs
  const { data: progress } = await supabase
    .from('user_progress')
    .select('lesson_id')
    .eq('profile_id', user.id)

  const completedIds = progress ? progress.map((p) => p.lesson_id) : []

  // Check if we have path information from Supabase
  const { data: dbPath } = await supabase
    .from('paths')
    .select('id, title, description, slug')
    .eq('slug', 'essential-muslim-knowledge')
    .single()

  let pathData = fallbackPathData

  if (dbPath) {
    const { data: dbModules } = await supabase
      .from('modules')
      .select('id, title, order_index')
      .eq('path_id', dbPath.id)
      .order('order_index', { ascending: true })

    const modulesWithLessons = []

    if (dbModules) {
      for (const mod of dbModules) {
        const { data: dbLessons } = await supabase
          .from('lessons')
          .select('id, title, slug, duration_minutes, order_index')
          .eq('module_id', mod.id)
          .eq('published', true)
          .order('order_index', { ascending: true })

        modulesWithLessons.push({
          ...mod,
          lessons: dbLessons || [],
        })
      }
    }

    pathData = {
      id: dbPath.id,
      title: dbPath.title,
      slug: dbPath.slug,
      description: dbPath.description || '',
      modules: modulesWithLessons,
    }
  }

  const allLessons = pathData.modules.flatMap((m) => m.lessons)
  const totalCount = allLessons.length
  const completedLessons = allLessons.filter((l) => completedIds.includes(l.id))
  const completedCount = completedLessons.length
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const nurPoints = completedCount * 10

  // Calculate completed goal progress
  const completedMinutes = completedLessons.reduce((acc, curr) => acc + curr.duration_minutes, 0)
  const goalPercent = Math.min(100, Math.round((completedMinutes / profile.daily_goal_minutes) * 100))

  let encouragement = 'ابدأ درسك الأول اليوم لتشعل جذوة التعلم! 🚀'
  if (completedMinutes > 0 && completedMinutes < profile.daily_goal_minutes) {
    encouragement = 'اقتربت من تحقيق هدفك اليومي! واصل القراءة. 📚'
  } else if (completedMinutes >= profile.daily_goal_minutes) {
    encouragement = 'رائع! لقد حققت هدفك اليومي بالكامل بنجاح 🌟'
  }

  // Resolve next uncompleted lesson to "Continue"
  const nextLesson = allLessons.find((l) => !completedIds.includes(l.id)) || allLessons[0]

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col p-4 max-w-md mx-auto w-full min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center py-4 border-b border-border mb-6">
        <div className="flex items-center gap-2">
          <Link href="/profile" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-full bg-primary-700 text-white flex items-center justify-center font-bold text-sm">
              {profile.full_name[0] || 'أ'}
            </div>
            <span className="text-sm font-bold text-primary-950 group-hover:text-primary-700">
              {profile.full_name}
            </span>
          </Link>
        </div>

        {/* Stats Pill */}
        <div className="flex gap-2">
          <div className="flex items-center gap-1 px-3 py-1 bg-secondary-50 border border-secondary-200 text-secondary-600 rounded-full text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-current text-secondary-500" />
            <span>{profile.current_streak} يوم</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-primary-50 border border-primary-100 text-primary-700 rounded-full text-xs font-bold">
            <Gem className="w-3.5 h-3.5 text-primary-500" />
            <span>{nurPoints} نقطة</span>
          </div>
        </div>
      </header>

      {/* Main Journey Map */}
      <main className="flex-1 flex flex-col gap-6">
        {/* Streak Experience Card */}
        <section className="bg-primary-950 text-white p-5 rounded-2xl relative overflow-hidden shadow-sm text-start flex justify-between items-center">
          <div className="flex-1">
            <span className="text-[10px] font-bold text-secondary-400 tracking-wider block mb-1">
              سلسلة التعلم النشطة
            </span>
            <h3 className="text-base font-extrabold text-white">
              {profile.current_streak > 0 
                ? `حافظت على عادتك لـ ${profile.current_streak} أيام!` 
                : 'ابدأ سلسلة تعلم جديدة اليوم!'}
            </h3>
            <p className="text-xs text-primary-200 mt-1 leading-relaxed">
              {profile.current_streak > 0 
                ? 'أحسنت الاستمرار! واصل القراءة يومياً لتحافظ على شعلتك نشطة.'
                : 'أكمل درساً واحداً اليوم لتشعل شعلة التعلم وتبدأ سلسلتك.'}
            </p>
          </div>
          
          <div className="relative shrink-0 flex items-center justify-center h-16 w-16 bg-white/10 rounded-2xl border border-white/10 animate-pulse-slow">
            <Flame className={`w-8 h-8 ${profile.current_streak > 0 ? 'text-secondary-400 fill-current' : 'text-primary-300'}`} />
            {profile.current_streak > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-secondary-500 text-secondary-foreground text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shadow-md">
                {profile.current_streak}
              </span>
            )}
          </div>
        </section>

        {/* Daily Goal Card */}
        <section className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4 text-start">
          {/* Progress Ring (SVG) */}
          <div className="relative h-20 w-20 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-muted"
                strokeWidth="6"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-primary-700 transition-all duration-500 ease-in-out"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="213.6"
                strokeDashoffset={213.6 - (213.6 * goalPercent) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-sm font-black text-primary-950">{goalPercent}%</span>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-xs font-bold text-muted-foreground mb-0.5">الهدف اليومي للتعلم</h3>
            <div className="text-base font-extrabold text-primary-950">
              {completedMinutes} / {profile.daily_goal_minutes} دقيقة
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              {encouragement}
            </p>
          </div>
        </section>

        {/* Learning Path Card */}
        <section className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-primary-700 text-xs font-bold">
            <Compass className="w-4 h-4" />
            <span>المسار النشط</span>
          </div>
          <h3 className="text-base font-extrabold text-primary-950 mb-1">{pathData.title}</h3>
          
          <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground mt-3 mb-2">
            <span>معدل إنجاز الدروس</span>
            <span>{percent}٪ ({completedCount}/{totalCount})</span>
          </div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden mb-1">
            <div 
              className="bg-primary-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          {nextLesson && (
            <Link
              href={`/lesson/${nextLesson.slug}`}
              className="w-full h-11 bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 mt-4 transition-all"
            >
              <span>متابعة التعلم: {nextLesson.title}</span>
            </Link>
          )}
        </section>

        {/* Lessons Timeline list */}
        <section className="flex flex-col gap-4 text-start">
          <h3 className="text-sm font-bold text-muted-foreground tracking-wide border-b border-border pb-1.5">
            المنهج الدراسي المكتمل
          </h3>

          <div className="flex flex-col gap-3">
            {allLessons.map((lesson) => {
              const isCompleted = completedIds.includes(lesson.id)
              return (
                <div 
                  key={lesson.id}
                  className={`flex justify-between items-center border p-4 rounded-xl ${
                    isCompleted 
                      ? 'bg-card border-border' 
                      : 'bg-muted/30 border-border opacity-75'
                  }`}
                >
                  <div className="flex gap-3 items-center">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 fill-green-50" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                    <div>
                      <h4 className={`text-sm font-bold ${isCompleted ? 'text-primary-950' : 'text-muted-foreground'}`}>
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">⏱️ {lesson.duration_minutes} دقائق</p>
                    </div>
                  </div>
                  {isCompleted ? (
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      مكتمل
                    </span>
                  ) : (
                    <Link
                      href={`/lesson/${lesson.slug}`}
                      className="text-xs font-bold text-primary-700 hover:underline"
                    >
                      ابدأ الدرس ←
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-4 flex flex-col gap-2">
          <Link
            href="/profile"
            className="w-full border border-border bg-card hover:bg-card/50 font-bold py-2.5 px-4 rounded-xl text-center text-sm shadow-sm transition-all"
          >
            تعديل أهداف التعلم اليومي
          </Link>
          <LogoutButton />
        </section>
      </main>
    </div>
  )
}
