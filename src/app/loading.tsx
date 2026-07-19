import { Skeleton } from '@/components/ui/skeleton'

/**
 * Global router loading screen.
 * Displays animated skeleton placeholders conforming to the Athar design grid.
 */
export default function Loading() {
  return (
    <div className="flex-1 bg-background text-foreground flex flex-col p-4 max-w-md mx-auto w-full min-h-screen pt-12">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center py-4 border-b border-border mb-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      {/* Hero Banner Skeleton */}
      <Skeleton className="h-32 w-full rounded-2xl mb-6" />

      {/* Sections Skeletons */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </div>
  )
}
