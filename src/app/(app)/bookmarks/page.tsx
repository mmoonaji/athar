import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Bookmark, Compass, PlayCircle, BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface BookmarkJoinRow {
  id: string
  lesson_id: string
  lessons: {
    id: string
    title: string
    slug: string
    duration_minutes: number
    description: string | null
  } | null
}

export default async function BookmarksPage() {
  const supabase = await createClient()

  // Verify auth session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch bookmarks
  const { data: dbBookmarks } = await supabase
    .from('bookmarks')
    .select('id, lesson_id, lessons(id, title, slug, duration_minutes, description)')
    .eq('profile_id', user.id)

  const bookmarks = (dbBookmarks as unknown as BookmarkJoinRow[]) || []
  const validBookmarks = bookmarks.filter((b) => b.lessons !== null)

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
          <Bookmark className="w-3.5 h-3.5 fill-current" />
          <span>المحفوظات</span>
        </div>
      </header>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-primary-950 mb-1">المواد المحفوظة</h1>
        <p className="text-sm text-muted-foreground">الدروس التي قمت بحفظها للرجوع إليها لاحقاً.</p>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-4">
        {validBookmarks.length === 0 ? (
          /* Premium RTL Empty State */
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center bg-card border border-border rounded-2xl shadow-sm">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <Bookmark className="w-8 h-8" />
            </div>
            
            <h2 className="text-base font-extrabold text-primary-950 mb-1">لا توجد مواد محفوظة</h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-xs">
              احفظ الدروس أثناء قراءتها للرجوع إليها في أي وقت بسهولة من خلال هذا القسم.
            </p>

            <Link
              href="/learn"
              className="bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>تصفح المنهج الدراسي</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {validBookmarks.map((bookmark) => {
              const lesson = bookmark.lessons!
              return (
                <Link
                  key={bookmark.id}
                  href={`/lesson/${lesson.slug}`}
                  className="flex justify-between items-center bg-card border border-border p-4 rounded-xl hover:border-primary-300 transition-all text-start group"
                >
                  <div className="flex gap-3 items-center">
                    <div className="h-9 w-9 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-primary-950 group-hover:text-primary-700 transition-colors">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ⏱️ {lesson.duration_minutes} دقائق
                      </p>
                    </div>
                  </div>
                  <PlayCircle className="w-5 h-5 text-primary-600 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                </Link>
              )
            })}
          </div>
        )}
      </main>

      <footer className="mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">
        أثر — رحلتك نحو المعرفة الإسلامية الراسخة.
      </footer>
    </div>
  )
}
