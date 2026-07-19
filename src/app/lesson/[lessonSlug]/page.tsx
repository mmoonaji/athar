import { notFound } from 'next/navigation'
import { getLessonBySlug } from '@/actions/learning'
import { createClient } from '@/lib/supabase/server'
import { LessonReader } from '@/features/lessons/components/LessonReader'

interface PageProps {
  params: Promise<{ lessonSlug: string }>
}

export default async function LessonPage({ params }: PageProps) {
  const { lessonSlug } = await params

  // Fetch lesson data via server action
  const res = await getLessonBySlug(lessonSlug)

  if (!res.success || !res.data) {
    notFound()
  }

  const lesson = res.data

  // Fetch bookmark state for authenticated user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let isBookmarked = false

  if (user) {
    const { data: bookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('profile_id', user.id)
      .eq('lesson_id', lesson.id)
      .maybeSingle()

    isBookmarked = !!bookmark
  }

  // Resolve previous and next lesson slugs in sibling scope
  const { data: siblingLessons } = await supabase
    .from('lessons')
    .select('slug, order_index')
    .eq('module_id', lesson.module_id)
    .eq('published', true)
    .order('order_index', { ascending: true })

  let prevLessonSlug: string | null = null
  let nextLessonSlug: string | null = null

  if (siblingLessons) {
    const currentIdx = siblingLessons.findIndex((l) => l.slug === lesson.slug)
    if (currentIdx > 0) {
      prevLessonSlug = siblingLessons[currentIdx - 1].slug
    }
    if (currentIdx !== -1 && currentIdx < siblingLessons.length - 1) {
      nextLessonSlug = siblingLessons[currentIdx + 1].slug
    }
  }

  return (
    <LessonReader 
      lesson={lesson} 
      isBookmarked={isBookmarked} 
      prevLessonSlug={prevLessonSlug}
      nextLessonSlug={nextLessonSlug}
    />
  )
}
