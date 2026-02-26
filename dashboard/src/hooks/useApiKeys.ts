// ============================================
// HOOK: useApiKeys - read/write API keys in localStorage
// ============================================
// Keys entered in the Settings page are stored here.
// The API service reads from the same localStorage keys as a fallback
// when no NEXT_PUBLIC_* env var is set.
"use client";
import { useState, useCallback, useEffect } from "react";

export const LS_NEWS_KEY = "dashboard_news_api_key";
export const LS_TMDB_KEY = "dashboard_tmdb_api_key";

function readKey(name: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(name) ?? "";
}

export function useApiKeys() {
  const [newsKey, setNewsKeyState] = useState("");
  const [tmdbKey, setTmdbKeyState] = useState("");
  const [saved, setSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setNewsKeyState(readKey(LS_NEWS_KEY));
    setTmdbKeyState(readKey(LS_TMDB_KEY));
  }, []);

  const save = useCallback((nk: string, tk: string) => {
    localStorage.setItem(LS_NEWS_KEY, nk.trim());
    localStorage.setItem(LS_TMDB_KEY, tk.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    // Force a page reload so api.ts re-reads the new keys on next fetch
    window.location.reload();
  }, []);

  /** True when at least one real key is stored in localStorage */
  const hasStoredKeys =
    !!readKey(LS_NEWS_KEY).trim() || !!readKey(LS_TMDB_KEY).trim();

  return { newsKey, tmdbKey, setNewsKeyState, setTmdbKeyState, save, saved, hasStoredKeys };
}
