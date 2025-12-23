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

  const messages = lang === "en" ? en : vi;

  return (
    <IntlProvider locale={lang} messages={messages}>
      {children}
    </IntlProvider>
  );
}
