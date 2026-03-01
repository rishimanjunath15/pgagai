// ============================================
// CONTENT CARD - Displays a single content item
// ============================================
"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ContentItem } from "@/shared/types";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/useRedux";
import { addFavorite, removeFavorite } from "@/store/contentSlice";

interface ContentCardProps {
  item: ContentItem;
  index: number;
  /** When true (inside DragOverlay ghost), disables whileHover to avoid fighting drag transform */
  isDragging?: boolean;
}

export default function ContentCard({ item, index, isDragging = false }: ContentCardProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.content.favorites);
  const isFavorite = favorites.some((f) => f.id === item.id);

  // Badge color based on content type
  const typeBadge = {
    news: { label: "News", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
    recommendation: { label: "Movie", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
    social: { label: "Social", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  };

  const badge = typeBadge[item.type];

  // Format published date
  const formattedDate = new Date(item.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md 
                 border border-gray-200 dark:border-gray-700 flex flex-col
                 hover:shadow-xl hover:scale-105 hover:border-blue-400 dark:hover:border-blue-500
                 transition-all duration-200 cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://picsum.photos/400/250?grayscale";
          }}
        />
        {/* Type Badge */}
        <span 
          className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold ${badge.color}`}
        >
          {badge.label}
        </span>
        {/* Favorite Button */}
        <button
          onClick={() =>
            isFavorite ? dispatch(removeFavorite(item.id)) : dispatch(addFavorite(item))
          }
          className="absolute top-3 right-3 p-2 rounded-full 
                     bg-white/90 dark:bg-gray-800/90
                     hover:bg-white dark:hover:bg-gray-700 
                     shadow-md hover:shadow-lg transition-shadow"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <span className="text-lg">
            {isFavorite ? "❤️" : "🤍"}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category + Date */}
        <div className="flex items-center justify-between text-xs font-medium mb-3">
          <span className="capitalize px-2 py-1 rounded-md bg-gray-100 
                         dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {item.category}
          </span>
          <span className="text-gray-500 dark:text-gray-400">{formattedDate}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 line-clamp-2">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-1">
          {item.description}
        </p>

        {/* Footer: Source + CTA */}
        <div className="flex items-center justify-between">
          {/* Source label */}
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <span
              title={
                item.source === "Mock News" || item.source === "Mock TMDB" || item.source === "Social Media"
                  ? "Demo / mock data"
                  : `Live from ${item.source}`
              }
              className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0
                ${
                  item.source === "Mock News" || item.source === "Mock TMDB" || item.source === "Social Media"
                    ? "bg-gray-300 dark:bg-gray-600"
                    : "bg-green-500"
                }`}
            />
            {item.source}
          </span>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg
                       text-sm font-bold text-white
                       bg-blue-600 hover:bg-blue-700
                       shadow-md hover:shadow-lg
                       transition-colors duration-200"
          >
            {item.type === "recommendation"
              ? t("feed.watchNow")
              : item.type === "social"
              ? t("feed.viewPost")
              : t("feed.readMore")}
          </a>
        </div>
      </div>
    </motion.div>
  );
}
