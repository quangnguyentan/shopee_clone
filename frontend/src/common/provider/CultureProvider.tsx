"use client";

import { IntlProvider } from "react-intl";

import en from "@/src/locales/en.json";
import vi from "@/src/locales/vi.json";

export default function CultureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang =
    typeof window !== "undefined" ? localStorage.getItem("lang") || "vi" : "vi";

  const messages = lang === "vi" ? vi : en;

  return (
    <IntlProvider locale={lang} messages={messages}>
      {children}
    </IntlProvider>
  );
}
