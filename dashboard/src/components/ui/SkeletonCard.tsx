// ============================================
// SKELETON CARD - Pulse placeholder while loading
// ============================================

/**
 * Displayed in a grid while the first page of content is being fetched.
 * Uses Tailwind's `animate-pulse` - no extra dependencies needed.
 * Mirrors the visual height/structure of ContentCard.
 */
export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 animate-pulse">
      {/* Image placeholder */}
      <div className="h-48 bg-gray-200 dark:bg-gray-700" />

      <div className="p-4 space-y-3">
        {/* Category badge */}
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />

        {/* Title — two lines */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
        </div>

        {/* Description — three lines */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-full" />
          <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-5/6" />
          <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-3/4" />
        </div>

        {/* Footer: source + action buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
