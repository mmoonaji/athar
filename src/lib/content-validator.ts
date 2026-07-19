import { LessonJsonSchema, LessonJson } from '@/types/lesson-json'

export interface ValidationResult {
  success: boolean
  errors: string[]
}

/**
 * Validates a lesson JSON object against structural and logical constraints
 * to guarantee production quality.
 */
export function validateLessonJson(data: unknown): ValidationResult {
  const errors: string[] = []

  // 1. Zod schema validation
  const parsed = LessonJsonSchema.safeParse(data)
  if (!parsed.success) {
    parsed.error.issues.forEach((issue) => {
      errors.push(`[خطأ هيكلي] الحقل "${issue.path.join('.')}": ${issue.message}`)
    })
    return { success: false, errors }
  }

  const lesson = parsed.data as LessonJson

  // 2. Content block size checks
  const minBlocks = 5
  const maxBlocks = 25
  if (lesson.contentBlocks.length < minBlocks) {
    errors.push(`[خطأ محتوى] يحتوي الدرس على ${lesson.contentBlocks.length} وحدات محتوى، الحد الأدنى المطلوب هو ${minBlocks} وحدات.`)
  }
  if (lesson.contentBlocks.length > maxBlocks) {
    errors.push(`[خطأ محتوى] يحتوي الدرس على ${lesson.contentBlocks.length} وحدات محتوى، الحد الأقصى المسموح به هو ${maxBlocks} وحدات.`)
  }

  // 3. Required block types existence checks
  const hasReflection = lesson.contentBlocks.some((b) => b.type === 'reflection_question')
  if (!hasReflection) {
    errors.push('[خطأ محتوى] الدرس يفتقر إلى سؤال تأملي (reflection_question).')
  }

  const hasTakeaway = lesson.contentBlocks.some((b) => b.type === 'takeaway')
  if (!hasTakeaway) {
    errors.push('[خطأ محتوى] الدرس يفتقر إلى خلاصة مستفادة (takeaway).')
  }

  // 4. References checks
  if (lesson.references.length === 0) {
    errors.push('[خطأ مراجع] يجب تحديد مرجع واحد على الأقل للدرس.')
  }

  // 5. Quiz logic validation
  const minQuestions = 3
  const maxQuestions = 5
  const questions = lesson.quiz.questions

  if (questions.length < minQuestions || questions.length > maxQuestions) {
    errors.push(`[خطأ اختبار] يجب أن يحتوي الاختبار على ما بين ${minQuestions} إلى ${maxQuestions} أسئلة. عدد الأسئلة الحالي: ${questions.length}`)
  }

  const questionIds = new Set<string>()

  questions.forEach((q, qIdx) => {
    // Check duplicate question IDs
    if (questionIds.has(q.id)) {
      errors.push(`[خطأ اختبار] معرف السؤال مكرر: "${q.id}" في السؤال رقم ${qIdx + 1}`)
    }
    questionIds.add(q.id)

    // Option count check
    if (q.options.length !== 4) {
      errors.push(`[خطأ اختبار] يجب أن يحتوي السؤال رقم ${qIdx + 1} ("${q.text}") على ٤ خيارات بالضبط. العدد الحالي: ${q.options.length}`)
    }

    // Correct option count check
    const correctOptions = q.options.filter((o) => o.isCorrect)
    if (correctOptions.length !== 1) {
      errors.push(
        `[خطأ اختبار] يجب أن يحتوي السؤال رقم ${qIdx + 1} ("${q.text}") على إجابة صحيحة واحدة بالضبط. تم تحديد: ${correctOptions.length}`
      )
    }

    // Duplicate option IDs check
    const optionIds = new Set<string>()
    q.options.forEach((o) => {
      if (optionIds.has(o.id)) {
        errors.push(`[خطأ اختبار] معرف الخيار مكرر: "${o.id}" في خيارات السؤال رقم ${qIdx + 1}`)
      }
      optionIds.add(o.id)
    })
  })

  return {
    success: errors.length === 0,
    errors,
  }
}
