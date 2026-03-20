"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, type Locale, type TranslationKey } from "./i18n";

const STORAGE_KEY = "luno_locale";
const AUTO_TRANSLATE_KEY = "luno_auto_translate";

type LanguageContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  autoTranslate: boolean;
  setAutoTranslate: (v: boolean) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  /** Global default: English. Turkish when user picks it (stored in localStorage). */
  const [locale, setLocaleState] = useState<Locale>("en");
  const [autoTranslate, setAutoTranslateState] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === "tr" || stored === "en") setLocaleState(stored);
    const at = localStorage.getItem(AUTO_TRANSLATE_KEY);
    if (at === "true") setAutoTranslateState(true);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale === "tr" ? "tr" : "en";
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, l);
  };

  const setAutoTranslate = (v: boolean) => {
    setAutoTranslateState(v);
    if (typeof window !== "undefined") localStorage.setItem(AUTO_TRANSLATE_KEY, v ? "true" : "false");
  };

  const t = (key: TranslationKey) =>
    translations[locale][key] ?? translations.en[key] ?? translations.tr[key] ?? key;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, autoTranslate, setAutoTranslate, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
