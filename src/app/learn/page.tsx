import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, Compass, ChevronLeft, Award } from 'lucide-react'

export const revalidate = 3600 // Revalidate hourly

// Fallback seed paths if DB is empty or during static compilation
const fallbackPaths = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'ما لا يسع المسلم جهله',
    slug: 'essential-muslim-knowledge',
    description: 'المنهج التأسيسي المتكامل في العقيدة والعبادات والطهارة لتصحيح العبادة وتثبيت الأركان.',
    order_index: 1,
    domains: { name: 'أساسيات الدين' },
  },
]

export default async function LearnPage() {
  const supabase = await createClient()
  
  const { data: dbPaths } = await supabase
    .from('paths')
    .select('id, title, slug, description, order_index, domains(name)')
    .order('order_index', { ascending: true })

  // Use DB data if available, otherwise use fallback
  const paths = dbPaths && dbPaths.length > 0 ? dbPaths : fallbackPaths

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col p-4 max-w-md mx-auto w-full min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center py-4 border-b border-border mb-6">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-primary-700 text-white flex items-center justify-center font-bold text-lg">
            أ
          </span>
          <span className="text-lg font-bold text-primary-700 tracking-tight">أثَــر</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 border border-primary-100 text-primary-700 rounded-full text-xs font-bold">
          <Compass className="w-3.5 h-3.5" />
          <span>المسارات التعليمية</span>
        </div>
      </header>

      {/* Intro */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-primary-950 mb-1">تعلّم أساسيات الإسلام</h1>
        <p className="text-sm text-muted-foreground">اختر مساراً منظماً لتبدأ رحلتك المعرفية.</p>
      </div>

      {/* Path List */}
      <main className="flex-1 flex flex-col gap-4">
        {paths.map((path) => (
          <Link
            key={path.id}
            href={`/learn/${path.slug}`}
            className="border border-border bg-card p-5 rounded-xl hover:border-primary-500 transition-all flex flex-col gap-3 group shadow-sm text-start"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-600" />
                <span className="text-xs font-bold text-muted-foreground">
                  {path.domains ? (Array.isArray(path.domains) ? path.domains[0]?.name : (path.domains as { name: string }).name) : 'أساسيات الدين'}
                </span>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary-700 group-hover:translate-x-[-2px] transition-transform" />
            </div>

            <h2 className="text-base font-extrabold text-primary-950 group-hover:text-primary-700 transition-colors">
              {path.title}
            </h2>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {path.description}
            </p>

            <div className="border-t border-border pt-3 mt-1 flex justify-between items-center text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-secondary-500" />
                <span>شامل العقيدة والعبادات</span>
              </div>
              <span className="font-semibold text-primary-700">تصفح المنهج ←</span>
            </div>
          </Link>
        ))}
      </main>

      {/* Bottom info */}
      <footer className="mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">
        أكمل مسارك للحفاظ على سلسلتك اليومية.
      </footer>
    </div>
  )
}
