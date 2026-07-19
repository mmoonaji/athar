export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'quran_verse'
  | 'hadith'
  | 'scholar_note'
  | 'takeaway'
  | 'reflection_question'
  | 'image'

export interface BaseBlock {
  type: BlockType
  orderIndex: number
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading'
  level: 1 | 2 | 3 | 4
  text: string
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph'
  text: string
}

export interface QuranVerseBlock extends BaseBlock {
  type: 'quran_verse'
  surah: number
  ayah: number | string
  text: string
  translation: string
  audioUrl?: string
}

export interface HadithBlock extends BaseBlock {
  type: 'hadith'
  text: string
  source: string
  collection?: string
  hadithNumber?: string
}

export interface ScholarNoteBlock extends BaseBlock {
  type: 'scholar_note'
  text: string
  scholarName?: string
}

export interface TakeawayBlock extends BaseBlock {
  type: 'takeaway'
  text: string
}

export interface ReflectionQuestionBlock extends BaseBlock {
  type: 'reflection_question'
  text: string
}

export interface ImageBlock extends BaseBlock {
  type: 'image'
  url: string
  caption?: string
  altText?: string
}

export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | QuranVerseBlock
  | HadithBlock
  | ScholarNoteBlock
  | TakeawayBlock
  | ReflectionQuestionBlock
  | ImageBlock

export interface LessonReference {
  id: string
  sourceName: string
  detail: string // e.g. "البخاري - رقم ٥" or "سورة المائدة - آية ٦"
}

export interface LessonContent {
  blocks: ContentBlock[]
  references: LessonReference[]
}
