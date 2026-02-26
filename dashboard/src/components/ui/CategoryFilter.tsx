// ============================================
// CATEGORY FILTER - Horizontal pills for filtering
// ============================================
"use client";

import { Category } from "@/types";

const ALL_CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: "technology", label: "Technology", icon: "💻" },
  { value: "sports", label: "Sports", icon: "⚽" },
  { value: "finance", label: "Finance", icon: "📈" },
  { value: "entertainment", label: "Entertainment", icon: "🎬" },
  { value: "health", label: "Health", icon: "🏥" },
  { value: "science", label: "Science", icon: "🔬" },
];

interface CategoryFilterProps {
  selected: Category[];
  onToggle: (category: Category) => void;
}

export default function CategoryFilter({ selected, onToggle }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_CATEGORIES.map((cat) => {
        const isActive = selected.includes(cat.value);
        return (
          <button
            key={cat.value}
            onClick={() => onToggle(cat.value)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-200 border
              ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400"
              }
            `}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export { ALL_CATEGORIES };
