// ============================================
// HOME PAGE - Main personalized feed
// ============================================
"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/useRedux";
import { fetchContent, clearFeed } from "@/store/contentSlice";
import { toggleCategory } from "@/store/preferencesSlice";
import { Category } from "@/shared/types";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import DraggableFeed from "@/features/feed/components/DraggableFeed";
import ContentCard from "@/features/feed/components/ContentCard";
import CategoryFilter from "@/shared/components/ui/CategoryFilter";
import LoadingSpinner from "@/shared/components/ui/LoadingSpinner";
import SkeletonCard from "@/shared/components/ui/SkeletonCard";
import { useSSE } from "@/features/feed/hooks/useSSE";
import { useTranslation } from "react-i18next";

// How often to auto-refresh the feed (milliseconds)
const AUTO_REFRESH_MS = 60_000; // 1 minute

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { feed, loading, error, hasMore, page } = useAppSelector((s) => s.content);
  const { favoriteCategories } = useAppSelector((s) => s.preferences.preferences);
  const { query, results, loading: searchLoading, error: searchError } = useAppSelector((s) => s.search);
  const { t } = useTranslation();

  // ---- SSE: real-time new content pushed from the server every 30s ----
  const { newItems, isConnected, clearNewItems } = useSSE("/api/sse");

  // Ref for the invisible sentinel element at the bottom of the feed
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Store the current categories in a ref for use inside observer callbacks
  const categoriesRef = useRef(favoriteCategories);
  categoriesRef.current = favoriteCategories;

  // ---- Countdown timer (counts down from 60 to 0, then refreshes) ----
  const [countdown, setCountdown] = useState(AUTO_REFRESH_MS / 1000);

  // ---- Authentication check: redirect to login if not authenticated ----
  useEffect(() => {
    if (status === "loading") return; // Wait for session to load
    
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  // Show loading spinner while checking authentication
  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
          <span className="ml-3 text-lg">{t("auth.checking")}</span>
        </div>
      </DashboardLayout>
    );
  }

  // Don't render content if not authenticated (will be redirected)
  if (!session) {
    return null;
  }

  // ---- Load content when categories change (debounced 500ms) ----
  // Debounce prevents a flood of requests when the user rapidly toggles multiple
  // category pills — we wait until they stop clicking before fetching.
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearFeed());
      dispatch(fetchContent({ categories: favoriteCategories, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(favoriteCategories), dispatch]);

  // ---- Infinite Scroll via IntersectionObserver ----
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          dispatch(fetchContent({ categories: categoriesRef.current, page }));
        }
      },
      { rootMargin: "200px" } // Start fetching 200px before sentinel is visible
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, page, dispatch]);

  // ---- Auto-refresh: tick every second, refresh when countdown hits 0 ----
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Time's up — trigger refresh
          if (!loading) {
            dispatch(clearFeed());
            dispatch(fetchContent({ categories: categoriesRef.current, page: 1 }));
          }
          return AUTO_REFRESH_MS / 1000; // reset to 60
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [dispatch, loading]);

  // ---- Toggle category ----
  const handleCategoryToggle = useCallback(
    (cat: Category) => {
      dispatch(toggleCategory(cat));
    },
    [dispatch]
  );

  const isSearching = query.trim().length > 0;
  // Show skeleton cards during initial load (feed is empty and loading)
  const showSkeletons = loading && feed.length === 0 && !isSearching;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Category filter pills */}
        {!isSearching && (
          <CategoryFilter selected={favoriteCategories} onToggle={handleCategoryToggle} />
        )}

        {/* Drag tip */}
        {!isSearching && feed.length > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic">
            💡 Grab the shaded bar at the top of any card to drag and reorder your feed
          </p>
        )}

        {/* Error banner */}
        {error && !loading && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* ---- SEARCH RESULTS ---- */}
        {isSearching && (
          <AnimatePresence mode="wait">
            {searchLoading ? (
              <div key="search-loading" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : searchError ? (
              <motion.div
                key="search-error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <p className="text-4xl mb-4">⚠️</p>
                <p className="text-gray-500 dark:text-gray-400 text-lg">Search failed</p>
                <p className="text-gray-400 text-sm mt-2">{searchError}</p>
              </motion.div>
            ) : results.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-gray-500 dark:text-gray-400 text-lg">No results found</p>
                <p className="text-gray-400 text-sm mt-2">Try a different search term</p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {results.map((item, i) => (
                  <ContentCard key={item.id} item={item} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ---- MAIN FEED ---- */}
        {!isSearching && (
          <>
            {/* Skeleton loading cards — shown only on first load */}
            {showSkeletons && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Drag-and-drop feed */}
            {!showSkeletons && <DraggableFeed items={feed} />}

            {/* Spinner at bottom while loading more */}
            {loading && feed.length > 0 && <LoadingSpinner />}

            {/* Invisible sentinel — IntersectionObserver watches this */}
            {!loading && hasMore && <div ref={sentinelRef} className="h-4" />}

            {/* End of feed */}
            {!hasMore && feed.length > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-400 dark:text-gray-500 text-sm py-4"
              >
                ✓ You&apos;ve seen all available content
              </motion.p>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
