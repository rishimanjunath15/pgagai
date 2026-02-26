// ============================================
// I18N CONFIG - i18next initialization
// ============================================
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        es: { translation: es },
        fr: { translation: fr },
        de: { translation: de },
      },
      fallbackLng: "en",
      supportedLngs: ["en", "es", "fr", "de"],
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      detection: {
        // Where i18next should detect the language from (in order of priority)
        order: ["localStorage", "navigator"],
        lookupLocalStorage: "i18n_language",
        caches: ["localStorage"],
      },
    });
}

export default i18n;
