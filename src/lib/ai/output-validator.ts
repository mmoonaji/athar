import { validateLessonJson } from '../content-validator'
import { LessonJson } from '@/types/lesson-json'

export interface AiValidationResult {
  success: boolean
  errors: string[]
  wordCount: number
}

/**
 * AI Output Validator.
 * Wraps content-validator checks and audits word counts to ensure Content Bible compliance.
 */
export function validateAiOutput(data: unknown): AiValidationResult {
  // 1. Run structural schema and logical checks
  const baseResult = validateLessonJson(data)
  const errors = [...baseResult.errors]

  if (!baseResult.success) {
    return {
      success: false,
      errors,
      wordCount: 0,
    }
  }

  // 2. Word count audit (for paragraphs, hadiths, quran translation, headings, notes)
  const lesson = data as LessonJson
  let totalWordCount = 0

  lesson.contentBlocks.forEach((block) => {
    let blockText = ''
    if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'takeaway' || block.type === 'reflection_question') {
      blockText = block.text
    } else if (block.type === 'hadith' || block.type === 'scholar_note') {
      blockText = block.text
    } else if (block.type === 'quran_verse') {
      blockText = block.translation // count words in translation
    }

    if (blockText) {
      // Split by spaces and filter empty strings to count words
      const words = blockText.trim().split(/\s+/)
      totalWordCount += words.filter((w) => w.length > 0).length
    }
  })

  const minWords = 500
  const maxWords = 1500
  if (totalWordCount < minWords) {
    errors.push(`[تحذير حجم] حجم الدرس (${totalWordCount} كلمة) أقل من الحد الأدنى المطلوب (${minWords} كلمة).`)
  }
  if (totalWordCount > maxWords) {
    errors.push(`[تحذير حجم] حجم الدرس (${totalWordCount} كلمة) يتجاوز الحد الأقصى المسموح به (${maxWords} كلمة).`)
  }

  return {
    success: errors.length === 0,
    errors,
    wordCount: totalWordCount,
  }
}
