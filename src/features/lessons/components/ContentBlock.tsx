import Image from 'next/image'
import { ContentBlock as BlockType } from '@/types/content'
import { HelpCircle, Sparkles, Quote } from 'lucide-react'
import { ScholarNoteCard } from './ScholarNoteCard'

interface ContentBlockProps {
  block: BlockType
}

/**
 * Server Component: Renders a single structured content block of the lesson
 * with design system layouts and distinct Islamic visual accents.
 */
export function ContentBlock({ block }: ContentBlockProps) {
  switch (block.type) {
    case 'heading':
      const Tag = block.level === 1 ? 'h1' : block.level === 3 ? 'h3' : 'h2'
      return (
        <Tag className="text-xl font-extrabold text-primary-950 mt-6 mb-3 text-start leading-snug">
          {block.text}
        </Tag>
      )

    case 'paragraph':
      return (
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4 text-start">
          {block.text}
        </p>
      )

    case 'quran_verse':
      return (
        <div className="bg-primary-50/40 border-r-4 border-r-primary-500 rounded-xl p-5 my-6 flex flex-col gap-4">
          <p className="text-xl md:text-2xl font-serif text-primary-950 text-center leading-loose select-all" dir="rtl">
            {block.text}
          </p>
          <div className="border-t border-primary-100/60 pt-3">
            <p className="text-xs md:text-sm text-primary-800 leading-relaxed text-start">
              {block.translation}
            </p>
            <span className="text-[10px] font-bold text-primary-500 block mt-2 text-end">
              [سورة {block.surah} - آية {block.ayah}]
            </span>
          </div>
        </div>
      )

    case 'hadith':
      return (
        <div className="bg-secondary-50/30 border-r-4 border-r-secondary-400 rounded-xl p-5 my-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-secondary-600">
            <Quote className="w-4 h-4 text-secondary-500 shrink-0 transform rotate-180" />
            <span className="text-xs font-bold">حديث شريف</span>
          </div>
          <p className="text-sm md:text-base font-medium text-primary-950 leading-relaxed text-start">
            {block.text}
          </p>
          <span className="text-xs text-muted-foreground block text-start font-semibold">
            {block.source}
          </span>
        </div>
      )

    case 'scholar_note':
      return (
        <ScholarNoteCard 
          text={block.text} 
          scholarName={block.scholarName} 
        />
      )

    case 'takeaway':
      return (
        <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 my-5 flex gap-3 items-start">
          <Sparkles className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-start">
            <h4 className="text-xs font-bold text-green-700 mb-0.5">خلاصة الدرس</h4>
            <p className="text-xs md:text-sm text-green-900 leading-relaxed">
              {block.text}
            </p>
          </div>
        </div>
      )

    case 'reflection_question':
      return (
        <div className="bg-secondary-50/50 border border-secondary-100 rounded-xl p-4 my-5 flex gap-3 items-start">
          <HelpCircle className="w-4 h-4 text-secondary-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-start">
            <h4 className="text-xs font-bold text-secondary-700 mb-0.5">سؤال للتأمل</h4>
            <p className="text-xs md:text-sm text-secondary-900 leading-relaxed">
              {block.text}
            </p>
          </div>
        </div>
      )

    case 'image':
      return (
        <figure className="my-6 flex flex-col gap-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border">
            <Image
              src={block.url}
              alt={block.altText || block.caption || 'صورة الدرس'}
              fill
              className="object-cover"
              sizes="(max-w-md) 100vw, 448px"
            />
          </div>
          {block.caption && (
            <figcaption className="text-xs text-muted-foreground text-center">
              {block.caption}
            </figcaption>
          )}
        </figure>
      )

    default:
      return null
  }
}
