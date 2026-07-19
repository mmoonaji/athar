import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, BookOpen, CheckCircle, Circle, PlayCircle } from 'lucide-react'

// Fallback path data for rendering when database is empty
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

interface PageProps {
  params: Promise<{ pathSlug: string }>
}

export default async function PathDetailsPage({ params }: PageProps) {
  const { pathSlug } = await params
  
  const supabase = await createClient()

  // Fetch path hierarchy
  const { data: dbPath } = await supabase
    .from('paths')
    .select('id, title, description, slug')
    .eq('slug', pathSlug)
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
  } else if (pathSlug !== 'essential-muslim-knowledge') {
    // If slug doesn't match fallback, return 404
    notFound()
  }

  // Fetch completed lessons for progress bar if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  let completedLessonIds: string[] = []

  if (user) {
    const { data: dbProgress } = await supabase
      .from('user_progress')
      .select('lesson_id')
      .eq('profile_id', user.id)

    if (dbProgress) {
      completedLessonIds = dbProgress.map((p) => p.lesson_id)
    }
  }

  // Calculate total lessons and completed lessons count
  const allLessons = pathData.modules.flatMap((m) => m.lessons)
  const totalLessons = allLessons.length
  const completedLessonsCount = allLessons.filter((l) => completedLessonIds.includes(l.id)).length
  const percentComplete = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col p-4 max-w-md mx-auto w-full min-h-screen">
      {/* Header */}
      <header className="flex items-center gap-3 py-4 border-b border-border mb-6">
        <Link href="/learn" className="text-muted-foreground hover:text-foreground">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-bold text-primary-950">تفاصيل المسار التعليمي</h1>
      </header>

      {/* Path Title & Progress */}
      <section className="mb-6 bg-card border border-border p-5 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-primary-700" />
          <span className="text-xs font-bold text-primary-700">مسار تأسيسي</span>
        </div>
        <h2 className="text-xl font-extrabold text-primary-950 mb-2">{pathData.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{pathData.description}</p>
        
        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground mb-2">
            <span>نسبة إنجاز المسار</span>
            <span>{percentComplete}٪ ({completedLessonsCount}/{totalLessons} درس مكتمل)</span>
          </div>
          <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-primary-600 h-full rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </section>

      {/* Modules & Lessons Timeline */}
      <main className="flex-1 flex flex-col gap-6">
        {pathData.modules.map((mod) => (
          <div key={mod.id} className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-muted-foreground tracking-wide border-b border-border pb-1.5">
              {mod.title}
            </h3>

            <div className="flex flex-col gap-3">
              {mod.lessons.map((lesson) => {
                const isCompleted = completedLessonIds.includes(lesson.id)
                return (
                  <Link
                    key={lesson.id}
                    href={`/lesson/${lesson.slug}`}
                    className="flex justify-between items-center bg-card border border-border p-4 rounded-xl hover:border-primary-300 transition-all text-start"
                  >
                    <div className="flex gap-3 items-center">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 fill-green-50" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-primary-950">{lesson.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">⏱️ {lesson.duration_minutes} دقائق</p>
                      </div>
                    </div>
                    <PlayCircle className="w-5 h-5 text-primary-600 shrink-0 opacity-80" />
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
