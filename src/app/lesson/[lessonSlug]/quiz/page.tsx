import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QuizEngine, QuizQuestion } from '@/features/lessons/components/QuizEngine'

interface PageProps {
  params: Promise<{ lessonSlug: string }>
}

// Fallback quiz database for seamless offline & build renders
const fallbackQuizzes: Record<string, QuizQuestion[]> = {
  'what-is-iman': [
    {
      id: 'q1',
      text: 'ما هو تعريف الإيمان في الاصطلاح الشرعي؟',
      options: [
        { id: 'o1', text: 'مجرد النطق بالشهادتين باللسان دون عمل', isCorrect: false },
        { id: 'o2', text: 'اعتقاد بالقلب، وقول باللسان، وعمل بالجوارح والأركان', isCorrect: true },
        { id: 'o3', text: 'المعرفة الذهنية بوجود الخالق فقط', isCorrect: false },
      ],
    },
  ],
  'three-types-of-tawhid': [
    {
      id: 'q2',
      text: 'أي من أقسام التوحيد يتعلق بإخلاص أفعال العباد كالدعاء والصلاة لله وحده؟',
      options: [
        { id: 'o4', text: 'توحيد الربوبية', isCorrect: false },
        { id: 'o5', text: 'توحيد الألوهية', isCorrect: true },
        { id: 'o6', text: 'توحيد الأسماء والصفات', isCorrect: false },
      ],
    },
  ],
  'importance-of-taharah': [
    {
      id: 'q3',
      text: 'تنقسم الطهارة الحسية إلى طهارة البدن والثوب والمكان من النجاسات. صح أم خطأ؟',
      options: [
        { id: 'o7', text: 'صح', isCorrect: true },
        { id: 'o8', text: 'خطأ', isCorrect: false },
      ],
    },
  ],
  'how-to-wudu': [
    {
      id: 'q4',
      text: 'أي من الخطوات التالية يُعد من فروض وأركان الوضوء الأساسية؟',
      options: [
        { id: 'o9', text: 'غسل الكفين ثلاثاً عند البدء', isCorrect: false },
        { id: 'o10', text: 'غسل الوجه وغسل اليدين للمرفقين ومسح الرأس وغسل الرجلين للكعبين', isCorrect: true },
        { id: 'o11', text: 'المضمضة والاستنشاق ثلاثاً', isCorrect: false },
      ],
    },
  ],
  'pillars-of-prayer': [
    {
      id: 'q5',
      text: 'ما الفرق الجوهري بين شروط الصلاة وأركان الصلاة؟',
      options: [
        { id: 'o12', text: 'الشروط في داخل الصلاة والأركان تسبقها', isCorrect: false },
        { id: 'o13', text: 'الشروط تسبق الصلاة كدخول الوقت واستقبال القبلة والأركان في صلب الصلاة كالركوع والسجود', isCorrect: true },
        { id: 'o14', text: 'لا فرق بينهما في الصلاحية والأحكام الشرعية', isCorrect: false },
      ],
    },
  ],
}

export default async function QuizPage({ params }: PageProps) {
  const { lessonSlug } = await params
  
  const supabase = await createClient()

  // Fetch lesson details to fetch related quiz
  const { data: dbLesson } = await supabase
    .from('lessons')
    .select('id, title, module_id, modules(path_id, paths(slug))')
    .eq('slug', lessonSlug)
    .single()

  let quizQuestions: QuizQuestion[] = []
  let lessonId = 'dummy-lesson-id'
  let pathSlug = 'essential-muslim-knowledge'

  if (dbLesson) {
    lessonId = dbLesson.id
    
    // Resolve pathSlug dynamically
    const resolvedModules = dbLesson.modules
    if (resolvedModules) {
      const moduleData = Array.isArray(resolvedModules) ? resolvedModules[0] : resolvedModules
      if (moduleData && moduleData.paths) {
        const pathData = Array.isArray(moduleData.paths) ? moduleData.paths[0] : moduleData.paths
        if (pathData?.slug) {
          pathSlug = pathData.slug
        }
      }
    }

    // Try to fetch quiz from DB
    const { data: dbQuiz } = await supabase
      .from('quizzes')
      .select('id')
      .eq('lesson_id', dbLesson.id)
      .maybeSingle()

    if (dbQuiz) {
      const { data: dbQuestions } = await supabase
        .from('questions')
        .select('id, text, type, question_options(id, text, is_correct)')
        .eq('quiz_id', dbQuiz.id)

      if (dbQuestions && dbQuestions.length > 0) {
        quizQuestions = dbQuestions.map((q) => ({
          id: q.id,
          text: q.text,
          options: (q.question_options || []).map((o) => ({
            id: o.id,
            text: o.text,
            isCorrect: o.is_correct,
          })),
        }))
      }
    }
  }

  // Fall back to seed data if DB queries returned empty quizzes
  if (quizQuestions.length === 0) {
    const fallback = fallbackQuizzes[lessonSlug]
    if (fallback) {
      quizQuestions = fallback
    } else {
      notFound()
    }
  }

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <QuizEngine
      lessonId={lessonId}
      lessonSlug={lessonSlug}
      pathSlug={pathSlug}
      questions={quizQuestions}
      isAuthenticated={!!user}
    />
  )
}
