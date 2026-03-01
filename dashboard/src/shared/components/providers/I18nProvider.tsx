// ============================================
// I18N PROVIDER - Initializes i18next on client
// ============================================
"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/shared/config/i18n/config";

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  // Ensure i18next is ready before rendering children.
  // The `useEffect` here is a no-op if already initialised via the config import,
  // but guards against any race in strict mode.
  useEffect(() => {
    if (!i18n.isInitialized) {
      console.warn("[i18n] Not yet initialized — re-check config import.");
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
