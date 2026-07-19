import fs from 'fs'
import path from 'path'
import { LessonSpec } from '@/types/lesson-spec'

/**
 * Utility helper that reads prompt templates from the filesystem
 * and injects specifications and specifications metadata.
 */
export class PromptBuilder {
  private static readPromptFile(filename: string): string {
    try {
      const filePath = path.resolve(process.cwd(), 'content/prompts', filename)
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8')
      }
      throw new Error(`Prompt template not found at "${filePath}"`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown prompt read error'
      console.warn(`[PromptBuilder Warning] ${msg}. Using hardcoded fallback.`)
      return ''
    }
  }

  /**
   * Constructs the complete prompt for the Lesson Writer LLM.
   */
  public static async buildWriterPrompt(spec: LessonSpec): Promise<string> {
    let template = this.readPromptFile('writer.md')
    
    if (!template) {
      template = 'اكتب درساً بالاعتماد على المواصفات التالية:\n[INJECT_SPECIFICATION]'
    }

    const specString = JSON.stringify(spec, null, 2)
    return template.replace('[INJECT_SPECIFICATION]', specString)
  }

  /**
   * Constructs the complete prompt for the Scientific/Linguistic Reviewer LLM.
   */
  public static async buildReviewerPrompt(draftContent: string): Promise<string> {
    let template = this.readPromptFile('reviewer.md')

    if (!template) {
      template = 'راجع الدرس التالي للتأكد من الموثوقية الشرعية واللغوية:\n[INJECT_DRAFT]'
    }

    return template.replace('[INJECT_DRAFT]', draftContent)
  }

  /**
   * Constructs the complete prompt for the Quiz Generator LLM.
   */
  public static async buildQuizPrompt(draftContent: string): Promise<string> {
    let template = this.readPromptFile('quiz.md')

    if (!template) {
      template = 'صغ اختباراً تفاعلياً من ٣ إلى ٥ أسئلة لهذا الدرس:\n[INJECT_DRAFT]'
    }

    return template.replace('[INJECT_DRAFT]', draftContent)
  }

  /**
   * Constructs the complete prompt for the JSON Converter LLM.
   */
  public static async buildJsonPrompt(approvedContent: string, quizContent: string): Promise<string> {
    let template = this.readPromptFile('json.md')

    if (!template) {
      template = 'حول هذا المحتوى والاختبار إلى الهيكل الفني المطلوب:\n[INJECT_APPROVED_CONTENT]'
    }

    const combinedContent = `المحتوى المعتمد:\n${approvedContent}\n\nالاختبار المعتمد:\n${quizContent}`
    return template.replace('[INJECT_APPROVED_CONTENT]', combinedContent)
  }
}
