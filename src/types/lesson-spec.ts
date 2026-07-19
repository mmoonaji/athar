import { z } from 'zod'

// Zod validation schema for Lesson Specifications
export const LessonSpecSchema = z.object({
  id: z.string().uuid('يجب أن يكون المعرّف UUID صحيحاً'),
  slug: z.string().min(2, 'يجب أن يكون الرابط البديل حرفين على الأقل').regex(/^[a-z0-9-]+$/, 'يجب أن يحتوي الرابط البديل على أحرف صغيرة وأرقام وواصلات فقط'),
  title: z.string().min(3, 'يجب أن يكون العنوان ٣ أحرف على الأقل'),
  domain: z.string().min(2, 'اسم النطاق مطلوب'),
  path: z.string().min(2, 'اسم المسار مطلوب'),
  module: z.string().min(2, 'اسم الوحدة مطلوب'),
  order: z.number().int().min(1, 'الترتيب يجب أن يكون عدداً موجباً'),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  estimatedReadingMinutes: z.number().min(1, 'الوقت التقديري للقراءة يجب أن يكون دقيقة واحدة على الأقل'),
  learningObjectives: z.array(z.string().min(5, 'الهدف التعليمي يجب أن يكون عبارة واضحة')).min(1, 'يجب تحديد هدف تعليمي واحد على الأقل'),
  prerequisites: z.array(z.string()),
  keywords: z.array(z.string()),
  references: z.array(z.string().min(3, 'المرجع يجب أن يكون مكتوباً بوضوح')).min(1, 'يجب تحديد مرجع واحد على الأقل للدرس'),
  summary: z.string().min(10, 'الملخص يجب أن يكون ١٠ أحرف على الأقل'),
  nextLesson: z.string().nullable(),
  previousLesson: z.string().nullable(),
})

// Type derivation
export type LessonSpec = z.infer<typeof LessonSpecSchema>
