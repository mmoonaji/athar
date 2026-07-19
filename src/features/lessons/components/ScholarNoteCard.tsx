'use client'

import { useState } from 'react'
import { Info, ChevronDown, ChevronUp } from 'lucide-react'

interface ScholarNoteCardProps {
  text: string
  scholarName?: string
}

/**
 * Client Component: Interactive expandable card rendering scholar opinions
 * or fikh notes to preserve visual reading flow.
 */
export function ScholarNoteCard({ text, scholarName }: ScholarNoteCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-muted border border-border rounded-xl my-5 overflow-hidden transition-all text-start">
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="w-full flex items-center justify-between p-4 focus:outline-none"
      >
        <div className="flex gap-3 items-center">
          <Info className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-muted-foreground">
              إضاءة علمية {scholarName && `— ${scholarName}`}
            </h4>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-0 text-xs md:text-sm text-muted-foreground leading-relaxed animate-fade-in">
          <p className="border-t border-border/60 pt-3">
            {text}
          </p>
        </div>
      )}
    </div>
  )
}
