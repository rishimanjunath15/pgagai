// ============================================
// SETTINGS PAGE - User preferences management
// ============================================
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { toggleCategory, toggleDarkMode } from "@/store/preferencesSlice";
import { Category } from "@/types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CategoryFilter from "@/components/ui/CategoryFilter";
import { useApiKeys } from "@/hooks/useApiKeys";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { favoriteCategories, darkMode } = useAppSelector((s) => s.preferences.preferences);
  const { newsKey, tmdbKey, setNewsKeyState, setTmdbKeyState, save, saved } = useApiKeys();
  const [showNewsKey, setShowNewsKey] = useState(false);
  const [showTmdbKey, setShowTmdbKey] = useState(false);

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">⚙️ Settings</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Customize your dashboard experience
          </p>
        </motion.div>

        {/* ---- Section: Content Preferences ---- */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            📚 Content Preferences
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Select the categories you want to see in your feed. At least one must be selected.
          </p>
          <CategoryFilter
            selected={favoriteCategories}
            onToggle={(cat: Category) => dispatch(toggleCategory(cat))}
          />
          <p className="text-xs text-gray-400 mt-3">
            Currently selected: {favoriteCategories.join(", ")}
          </p>
        </motion.section>

        {/* ---- Section: Appearance ---- */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            🎨 Appearance
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Toggle between light and dark mode.
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Easier on the eyes in low-light environments
              </p>
            </div>
            {/* Toggle Switch */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 
                ${darkMode ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
              aria-label="Toggle dark mode"
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
                  ${darkMode ? "translate-x-8" : "translate-x-1"}`}
              />
            </button>
          </div>
        </motion.section>

        {/* ---- Section: API Keys ---- */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            🔑 API Keys
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Enter your free API keys to switch from demo data to live content.
            Keys are saved in your browser only — never sent anywhere else.
          </p>

          <div className="space-y-5">
            {/* NewsAPI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                NewsAPI Key
                <a
                  href="https://newsapi.org/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-xs text-blue-500 hover:underline"
                >
                  Get free key ↗
                </a>
              </label>
              <div className="relative">
                <input
                  type={showNewsKey ? "text" : "password"}
                  value={newsKey}
                  onChange={(e) => setNewsKeyState(e.target.value)}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full pr-10 pl-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                             bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewsKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  {showNewsKey ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* TMDB */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                TMDB API Key
                <a
                  href="https://www.themoviedb.org/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-xs text-blue-500 hover:underline"
                >
                  Get free key ↗
                </a>
              </label>
              <div className="relative">
                <input
                  type={showTmdbKey ? "text" : "password"}
                  value={tmdbKey}
                  onChange={(e) => setTmdbKeyState(e.target.value)}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full pr-10 pl-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                             bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowTmdbKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  {showTmdbKey ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Save button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => save(newsKey, tmdbKey)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium
                           rounded-lg transition-colors"
              >
                Save &amp; Reload
              </button>
              {saved && (
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  ✓ Saved! Reloading…
                </span>
              )}
              {(newsKey || tmdbKey) && (
                <button
                  onClick={() => { save("", ""); }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Clear keys
                </button>
              )}
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
            💡 Keys are stored in <code>localStorage</code> and never leave your browser.
            You can also set them permanently in <code>.env.local</code>.
          </p>
        </motion.section>

        {/* ---- Section: About ---- */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            ℹ️ About
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Stack:</strong> Next.js, TypeScript, Redux Toolkit, Tailwind CSS, Framer Motion</p>
            <p><strong>APIs:</strong> NewsAPI, TMDB (with mock fallback)</p>
          </div>
        </motion.section>
      </div>
    </DashboardLayout>
  );
}
