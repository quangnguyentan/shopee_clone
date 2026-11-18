"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import en from "@/src/locales/en.json";
import vi from "@/src/locales/vi.json";

const messages = { en, vi } as const;
const languageListeners = new Set<() => void>();

export type Language = keyof typeof messages;
export type I18nKeys = keyof typeof en;
export type TranslationValues = Record<string, string | number>;
export type Translate = (
  key: I18nKeys,
  values?: TranslationValues,
) => string;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translate;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getLanguageSnapshot(): Language {
  if (typeof window === "undefined") return "vi";

  const savedLanguage = localStorage.getItem("lang");
  return savedLanguage === "en" || savedLanguage === "vi"
    ? savedLanguage
    : "vi";
}

function subscribeToLanguage(listener: () => void) {
  languageListeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    languageListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getServerLanguageSnapshot(): Language {
  return "vi";
}

function setLanguage(language: Language) {
  if (typeof window === "undefined") return;

  localStorage.setItem("lang", language);
  languageListeners.forEach((listener) => listener());
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback<Translate>(
    (key, values) => {
      const dictionary = messages[language] as Partial<
        Record<I18nKeys, string>
      >;
      const message = dictionary[key] ?? en[key] ?? key;

      return message.replace(/\{([^{}]+)\}/g, (placeholder, name: string) => {
        const value = values?.[name];
        return value === undefined ? placeholder : String(value);
      });
    },
    [language],
  );

  const contextValue = useMemo(
    () => ({ language, setLanguage, t }),
    [language, t],
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
