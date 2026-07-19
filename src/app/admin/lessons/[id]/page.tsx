import React from 'react'
import { getLessonForEditor } from '@/features/admin/actions/admin-actions'
import { LessonEditor } from '@/features/admin/components/LessonEditor'

interface LessonEditorPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminLessonEditorPage({ params }: LessonEditorPageProps) {
  const resolvedParams = await params
  const lesson = await getLessonForEditor(resolvedParams.id)

  return (
    <div className="space-y-8">
      <LessonEditor initialLesson={lesson as React.ComponentProps<typeof LessonEditor>['initialLesson']} />
    </div>
  )
}
export const dynamic = 'force-dynamic'
