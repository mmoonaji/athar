import { ContentBlock as BlockType } from '@/types/content'
import { ContentBlock } from './ContentBlock'

interface ContentRendererProps {
  blocks: BlockType[]
}

/**
 * Server Component: Orchestrates content blocks, sorting them chronologically
 * by orderIndex and rendering each respective block template.
 */
export function ContentRenderer({ blocks }: ContentRendererProps) {
  // Sort blocks by orderIndex to preserve authoring sequence
  const sortedBlocks = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex)

  return (
    <div className="flex flex-col gap-1">
      {sortedBlocks.map((block) => (
        <ContentBlock key={block.orderIndex} block={block} />
      ))}
    </div>
  )
}
