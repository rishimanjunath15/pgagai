// ============================================
// CONTENT CARD - Displays a single content item
// ============================================
"use client";

import { motion } from "framer-motion";
import { ContentItem } from "@/types";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { addFavorite, removeFavorite } from "@/store/contentSlice";

interface ContentCardProps {
  item: ContentItem;
  index: number;
  /** When true (inside DragOverlay ghost), disables whileHover to avoid fighting drag transform */
  isDragging?: boolean;
}

export default function ContentCard({ item, index, isDragging = false }: ContentCardProps) {
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
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={isDragging ? undefined : { y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md 
                 border border-gray-200 dark:border-gray-700 flex flex-col
                 transition-shadow"
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
        <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
          {badge.label}
        </span>
        {/* Favorite Button */}
        <button
          onClick={() =>
            isFavorite ? dispatch(removeFavorite(item.id)) : dispatch(addFavorite(item))
          }
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 
                     hover:bg-white dark:hover:bg-gray-700 transition-colors"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Category + Date */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span className="capitalize">{item.category}</span>
          <span>{formattedDate}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-1">
          {item.description}
        </p>

        {/* Footer: Source + CTA */}
        <div className="flex items-center justify-between">
          {/* Source label — green dot = real API, gray dot = mock/demo */}
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
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {item.type === "recommendation"
              ? "Watch Now →"
              : item.type === "social"
              ? "View Post →"
              : "Read More →"}
          </a>
        </div>
      </div>
    </motion.div>
  );
}
