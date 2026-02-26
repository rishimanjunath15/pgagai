// ============================================
// HEADER - Top bar with search, dark mode, menu
// ============================================
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { toggleDarkMode } from "@/store/preferencesSlice";
import { setQuery, performSearch, clearSearch } from "@/store/searchSlice";
import { LS_NEWS_KEY, LS_TMDB_KEY } from "@/hooks/useApiKeys";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { getAvatarGradient } from "@/lib/avatarOptions";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.preferences.preferences.darkMode);
  const searchQuery = useAppSelector((state) => state.search.query);
  const searchLoading = useAppSelector((state) => state.search.loading);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isTyping, setIsTyping] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Auth session
  const { data: session } = useSession();
  const { t } = useTranslation();

  const authUser = session?.user as {
    name?: string;
    email?: string;
    initials?: string;
    plan?: string;
    avatarId?: string;
  } | undefined;

  // Derive avatar gradient from session (updated after profile save)
  const avatarGradient = getAvatarGradient(authUser?.avatarId);

  // Detect whether any real API key is available (env or localStorage)
  const isPlaceholder = (k: string) => !k || k.includes("your_") || k === "demo";
  const envNews      = process.env.NEXT_PUBLIC_NEWS_API_KEY    ?? "";
  const envTmdb      = process.env.NEXT_PUBLIC_TMDB_API_KEY    ?? "";
  const envTmdbToken = process.env.NEXT_PUBLIC_TMDB_READ_TOKEN ?? "";
  // Read localStorage at render time (client-only, safe behind typeof window guard above)
  const lsNews   = typeof window !== "undefined" ? (localStorage.getItem(LS_NEWS_KEY) ?? "") : "";
  const lsTmdb   = typeof window !== "undefined" ? (localStorage.getItem(LS_TMDB_KEY) ?? "") : "";

  const newsLive = !isPlaceholder(envNews) || !isPlaceholder(lsNews);
  const tmdbLive = !isPlaceholder(envTmdb) || !isPlaceholder(lsTmdb) || !isPlaceholder(envTmdbToken);
  const isDemoMode = !newsLive && !tmdbLive;

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keep a ref to the last dispatched search thunk so we can abort it
  // when a newer search request comes in — prevents stale results flashing.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingSearch = useRef<any>(null);

  // ---- Debounced Search (500ms) ----
  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      setIsTyping(false);

      // Abort the previous pending search before starting a new one
      if (pendingSearch.current) pendingSearch.current.abort();

      dispatch(setQuery(localQuery));
      if (localQuery.trim()) {
        pendingSearch.current = dispatch(performSearch(localQuery));
      } else {
        dispatch(clearSearch());
        pendingSearch.current = null;
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localQuery, dispatch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  }, []);

  // Whether to show the loading spinner in the search bar
  const showSpinner = isTyping || searchLoading;

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {/* ---- API Status Banner ---- */}
      {isDemoMode ? (
        /* Demo Mode: amber banner prompting user to add keys */
        <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800
                        px-4 py-1.5 flex items-center justify-between gap-4">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            🎭 <strong>Demo Mode</strong> — showing sample/mock data. Add real API keys to see live content.
          </p>
          <Link
            href="/settings"
            className="text-xs font-medium text-amber-700 dark:text-amber-400
                       underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200
                       whitespace-nowrap flex-shrink-0"
          >
            Add Keys →
          </Link>
        </div>
      ) : (
        /* Live Mode: green banner confirming which APIs are active */
        <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800
                        px-4 py-1 flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Live Data
          </span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          {/* Show each active API as a pill */}
          {newsLive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                             bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
              📰 NewsAPI
            </span>
          )}
          {tmdbLive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                             bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
              🎬 TMDB
            </span>
          )}
          {!newsLive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                             bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              📰 NewsAPI (mock)
            </span>
          )}
          {!tmdbLive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                             bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              🎬 TMDB (mock)
            </span>
          )}
          <Link
            href="/settings"
            className="ml-auto text-xs text-green-600 dark:text-green-400 hover:underline"
          >
            Manage Keys
          </Link>
        </div>
      )}
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Hamburger menu (mobile) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            {/* Icon: spinner while typing/loading, magnifier otherwise */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
              {showSpinner ? (
                <svg className="animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
            <input
              type="text"
              placeholder="Search news, movies, posts, categories..."
              value={localQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         placeholder-gray-400"
            />
            {localQuery && (
              <button
                onClick={() => { setLocalQuery(""); dispatch(clearSearch()); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Dark Mode Toggle */}
        <button
          onClick={() => dispatch(toggleDarkMode())}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {/* Account Info / Auth */}
        <div ref={userMenuRef} className="relative flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
            aria-label="User menu"
          >
            {/* Avatar - colour matches user's chosen avatar in Profile */}
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient}
                            flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
              {authUser?.initials ?? (authUser?.name?.charAt(0).toUpperCase()) ?? "U"}
            </div>
            {/* Name + role — hidden on small screens */}
            <div className="hidden sm:block leading-tight text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {authUser?.name ?? "Guest"}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {authUser?.plan ?? "Not signed in"}
              </p>
            </div>
          </button>

          {/* Dropdown menu */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-800
                            border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50
                            overflow-hidden">
              {session ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700
                               dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    👤 {t("nav.profile")}
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700
                               dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    ⚙️ {t("nav.settings")}
                  </Link>
                  <div className="border-t border-gray-100 dark:border-gray-700" />
                  <button
                    onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600
                               dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    🚪 {t("nav.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700
                               dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                  >
                    🔑 {t("nav.login")}
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700
                               dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    ⚙️ {t("nav.settings")}
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
