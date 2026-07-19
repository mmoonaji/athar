import { z } from 'zod'

// Content Block schemas in Zod
const BaseBlockSchema = z.object({
  orderIndex: z.number().int().nonnegative(),
})

export const HeadingBlockSchema = BaseBlockSchema.extend({
  type: z.literal('heading'),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  text: z.string().min(1),
})

export const ParagraphBlockSchema = BaseBlockSchema.extend({
  type: z.literal('paragraph'),
  text: z.string().min(1),
})

export const QuranVerseBlockSchema = BaseBlockSchema.extend({
  type: z.literal('quran_verse'),
  surah: z.number().int().positive(),
  ayah: z.union([z.number().int().positive(), z.string()]),
  text: z.string().min(1),
  translation: z.string().min(1),
  audioUrl: z.string().url().optional(),
})

export const HadithBlockSchema = BaseBlockSchema.extend({
  type: z.literal('hadith'),
  text: z.string().min(1),
  source: z.string().min(1),
  collection: z.string().optional(),
  hadithNumber: z.string().optional(),
})

export const ScholarNoteBlockSchema = BaseBlockSchema.extend({
  type: z.literal('scholar_note'),
  text: z.string().min(1),
  scholarName: z.string().optional(),
})

export const TakeawayBlockSchema = BaseBlockSchema.extend({
  type: z.literal('takeaway'),
  text: z.string().min(1),
})

export const ReflectionQuestionBlockSchema = BaseBlockSchema.extend({
  type: z.literal('reflection_question'),
  text: z.string().min(1),
})

export const ImageBlockSchema = BaseBlockSchema.extend({
  type: z.literal('image'),
  url: z.string().url('رابط الصورة غير صحيح'),
  caption: z.string().optional(),
  altText: z.string().optional(),
})

export const ContentBlockSchema = z.discriminatedUnion('type', [
  HeadingBlockSchema,
  ParagraphBlockSchema,
  QuranVerseBlockSchema,
  HadithBlockSchema,
  ScholarNoteBlockSchema,
  TakeawayBlockSchema,
  ReflectionQuestionBlockSchema,
  ImageBlockSchema,
])

// Quiz structures
export const QuizOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  isCorrect: z.boolean(),
  explanation: z.string().optional(),
})

export const QuizQuestionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  options: z.array(QuizOptionSchema),
})

export const QuizSchema = z.object({
  title: z.string().min(1),
  questions: z.array(QuizQuestionSchema),
})

// Reference structure
export const LessonReferenceSchema = z.object({
  sourceName: z.string().min(1),
  detail: z.string().min(1),
})

// SEO structure
export const LessonSeoSchema = z.object({
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  keywords: z.array(z.string()),
})

// Complete Lesson Schema stored in DB / files
export const LessonJsonSchema = z.object({
  metadata: z.object({
    id: z.string().uuid('يجب أن يكون المعرّف UUID صحيحاً'),
    slug: z.string().min(1),
    title: z.string().min(1),
    level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    domain: z.string().min(1),
    path: z.string().min(1),
    module: z.string().min(1),
    orderIndex: z.number().int().nonnegative(),
    estimatedReadingMinutes: z.number().int().positive(),
  }),
  contentBlocks: z.array(ContentBlockSchema),
  quiz: QuizSchema,
  references: z.array(LessonReferenceSchema),
  seo: LessonSeoSchema,
})

// Type derivation
export type LessonJson = z.infer<typeof LessonJsonSchema>
export type ContentBlockType = z.infer<typeof ContentBlockSchema>
export type QuizQuestionType = z.infer<typeof QuizQuestionSchema>
export type QuizOptionType = z.infer<typeof QuizOptionSchema>
export type LessonReferenceType = z.infer<typeof LessonReferenceSchema>
export type LessonSeoType = z.infer<typeof LessonSeoSchema>
export type LessonJsonMetadataType = z.infer<typeof LessonJsonSchema>['metadata']
