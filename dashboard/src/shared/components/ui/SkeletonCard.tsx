// ============================================
// SKELETON CARD - Animated pulse placeholder while loading
// ============================================

/**
 * Displayed in a grid while the first page of content is being fetched.
 * Enhanced with shimmer animation and glassmorphism to match the new design.
 * Mirrors the visual height/structure of ContentCard.
 */
export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 
            relative">
      {/* Image placeholder */}
      <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />

      <div className="p-5 space-y-4">
        {/* Category badge */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Title — two lines */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-full animate-pulse" />
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-4/5 animate-pulse" />
        </div>

        {/* Description — three lines */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
        </div>

        {/* Footer: source + action button */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-9 w-28 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
