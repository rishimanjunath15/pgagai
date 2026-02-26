// ============================================
// TRENDING PAGE - Shows top trending content grouped by type
// ============================================
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchTrending } from "@/store/contentSlice";
import { ContentItem } from "@/types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ContentCard from "@/components/cards/ContentCard";
import SkeletonCard from "@/components/ui/SkeletonCard";

// A labelled section with a heading + grid of cards
function TrendingSection({
  title,
  emoji,
  items,
  loading,
}: {
  title: string;
  emoji: string;
  items: ContentItem[];
  loading: boolean;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Section heading */}
      <div className="flex items-center gap-2 pb-1 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xl">{emoji}</span>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
        {!loading && (
          <span className="ml-auto text-xs text-gray-400">{items.length} item{items.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Skeletons while loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Cards */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <ContentCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}

      {/* Empty state per section */}
      {!loading && items.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic pl-1">Nothing trending here right now</p>
      )}
    </motion.section>
  );
}

export default function TrendingPage() {
  const dispatch = useAppDispatch();
  const { trending, loading, error } = useAppSelector((s) => s.content);

  useEffect(() => {
    if (trending.length === 0) dispatch(fetchTrending());
  }, [dispatch, trending.length]);

  // Split trending items into groups by type
  const newsTrending    = trending.filter((i) => i.type === "news");
  const moviesTrending  = trending.filter((i) => i.type === "recommendation");
  const socialTrending  = trending.filter((i) => i.type === "social");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🔥 Trending Now</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                Top stories, movies, and posts across all categories
              </p>
            </div>
            {/* Refresh button */}
            <button
              onClick={() => dispatch(fetchTrending())}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50
                         text-white text-sm font-medium rounded-lg transition-colors"
            >
              <span className={loading ? "animate-spin" : ""}>🔄</span>
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Error banner */}
        {error && !loading && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Trending News */}
        <TrendingSection
          title="Trending News"
          emoji="📰"
          items={newsTrending}
          loading={loading}
        />

        {/* Trending Movies */}
        <TrendingSection
          title="Trending Movies"
          emoji="🎬"
          items={moviesTrending}
          loading={loading}
        />

        {/* Trending Social */}
        <TrendingSection
          title="Trending Posts"
          emoji="💬"
          items={socialTrending}
          loading={loading}
        />
      </div>
    </DashboardLayout>
  );
}
