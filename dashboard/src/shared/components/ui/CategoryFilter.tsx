// ============================================
// CATEGORY FILTER - Horizontal pills for filtering
// ============================================
"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Category } from "@/shared/types";

interface CategoryFilterProps {
  selected: Category[];
  onToggle: (category: Category) => void;
}

export default function CategoryFilter({ selected, onToggle }: CategoryFilterProps) {
  const { t } = useTranslation();

  const ALL_CATEGORIES: { value: Category; labelKey: string; icon: string }[] = [
    { value: "technology", labelKey: "feed.categories.technology", icon: "💻" },
    { value: "sports", labelKey: "feed.categories.sports", icon: "⚽" },
    { value: "finance", labelKey: "feed.categories.finance", icon: "📈" },
    { value: "entertainment", labelKey: "feed.categories.entertainment", icon: "🎬" },
    { value: "health", labelKey: "feed.categories.health", icon: "🏥" },
    { value: "science", labelKey: "feed.categories.science", icon: "🔬" },
  ];
  return (
    <div className="flex flex-wrap gap-3">
      {ALL_CATEGORIES.map((cat, index) => {
        const isActive = selected.includes(cat.value);
        return (
          <button
            key={cat.value}
            onClick={() => onToggle(cat.value)}
            className={
              `relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
              transition-all duration-200 border-2 overflow-hidden
              ${
                isActive
                  ? "bg-blue-600 text-white border-transparent shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500"
              }`
            }
          >
            <span className="text-lg">{cat.icon}</span>
            <span className="relative z-10">{t(cat.labelKey)}</span>
            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="activeCategory"
                className="absolute bottom-0 left-0 right-0 h-1 bg-white/50 rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
