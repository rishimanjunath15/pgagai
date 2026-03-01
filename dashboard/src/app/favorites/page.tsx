// ============================================
// FAVORITES PAGE - Shows user's saved favorites
// ============================================
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/useRedux";
import { clearFavorites } from "@/store/contentSlice";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import ContentCard from "@/features/feed/components/ContentCard";

export default function FavoritesPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const favorites = useAppSelector((s) => s.content.favorites);
  const [showConfirm, setShowConfirm] = useState(false);

  // Group favorites by type for the summary badges
  const newsCount    = favorites.filter((f) => f.type === "news").length;
  const moviesCount  = favorites.filter((f) => f.type === "recommendation").length;
  const socialCount  = favorites.filter((f) => f.type === "social").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">⭐ {t("favorites.title")}</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                {favorites.length} {t("favorites.savedItems" + (favorites.length !== 1 ? "_plural" : ""))}
              </p>
              {/* Type breakdown badges */}
              {favorites.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {newsCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                      📰 {newsCount} {t("favorites.news" + (newsCount !== 1 ? "_plural" : ""))}
                    </span>
                  )}
                  {moviesCount > 0 && (
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                      🎬 {moviesCount} {t("favorites.movies" + (moviesCount !== 1 ? "_plural" : ""))}
                    </span>
                  )}
                  {socialCount > 0 && (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                      💬 {socialCount} {t("favorites.posts" + (socialCount !== 1 ? "_plural" : ""))}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Clear all — with confirmation */}
            {favorites.length > 0 && !showConfirm && (
              <button
                onClick={() => setShowConfirm(true)}
                className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300
                           border border-red-300 dark:border-red-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                🗑 {t("favorites.clearAll")}
              </button>
            )}
            {showConfirm && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                              px-3 py-2 rounded-lg text-sm">
                <span className="text-red-600 dark:text-red-400">{t("favorites.removeAll", { count: favorites.length })}</span>
                <button
                  onClick={() => { dispatch(clearFavorites()); setShowConfirm(false); }}
                  className="px-2 py-0.5 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                >
                  {t("favorites.yes")}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                >
                  {t("favorites.cancel")}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Empty state */}
        {favorites.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-6xl mb-4">🤍</p>
            <p className="text-gray-500 dark:text-gray-400 text-lg">{t("favorites.empty")}</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Click the ❤️ icon on any card to save it here
            </p>
          </motion.div>
        )}

        {/* Favorites Grid with animated enter/exit per card */}\n        {favorites.length > 0 && (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {favorites.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                >
                  <ContentCard item={item} index={i} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  );
}
