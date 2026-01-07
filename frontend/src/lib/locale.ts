/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createIntl, createIntlCache, IntlShape } from "react-intl";

import en from "../locales/en.json";
import vi from "../locales/vi.json";

const messages = { en, vi } as const;

type Language = keyof typeof messages; // "en" | "vi"
export type I18nKeys = keyof typeof en;

let currentLang: Language = "vi";

const cache = createIntlCache();

let intl: IntlShape;

const loadIntl = (lang: Language) => {
  currentLang = lang;
  intl = createIntl(
    {
      locale: lang,
      defaultLocale: "vi",
      messages: messages[lang] || messages["vi"],
    },
    cache
  );
};

if (typeof window !== "undefined") {
  const savedLang = localStorage.getItem("lang") as Language;
  if (savedLang && messages[savedLang]) {
    loadIntl(savedLang);
  } else {
    loadIntl(currentLang);
  }
} else {
  loadIntl(currentLang);
}

const i18n = {
  /**
   *
   * @param key
   * @param values
   */

  get: (key: I18nKeys, values?: Record<string, any>): string => {
    try {
      return intl.formatMessage({ id: key }, values) || key;
    } catch {
      return key;
    }
  },

  setLanguage: (lang: Language) => {
    loadIntl(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", lang);
    }
  },

  getLanguage: (): Language => currentLang,
};
export default i18n;
