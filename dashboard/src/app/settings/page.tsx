// ============================================
// SETTINGS PAGE - User preferences management
// ============================================
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/useRedux";
import { toggleCategory, toggleDarkMode } from "@/store/preferencesSlice";
import { Category } from "@/shared/types";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import CategoryFilter from "@/shared/components/ui/CategoryFilter";
import { useApiKeys } from "@/features/settings/hooks/useApiKeys";

export default function SettingsPage() {
  const { t } = useTranslation();
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">⚙️ {t("settings.title")}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("settings.description")}
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
            📚 {t("settings.contentPreferences")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t("settings.contentPreferencesDesc")}
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
            🎨 {t("settings.appearance")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t("settings.appearanceDesc")}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{t("settings.darkMode")}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("settings.darkModeDesc")}
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


            {/* Save button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => save(newsKey, tmdbKey)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium
                           rounded-lg transition-colors"
              >
                {t("settings.saveReload")}
              </button>
              {saved && (
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  ✓ {t("settings.saved")}
                </span>
              )}
              {(newsKey || tmdbKey) && (
                <button
                  onClick={() => { save("", ""); }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  {t("settings.clearKeys")}
                </button>
              )}
            </div>
          </div>

         

        {/* ---- Section: About ---- */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            ℹ️ {t("settings.about")}
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>{t("settings.version")}:</strong> 1.0.0</p>
            <p><strong>{t("settings.stack")}:</strong> Next.js, TypeScript, Redux Toolkit, Tailwind CSS, Framer Motion</p>
            <p><strong>{t("settings.apis")}:</strong> NewsAPI, TMDB ({t("settings.mockFallback")})</p>
          </div>
        </motion.section>
    </DashboardLayout>
  );
}
