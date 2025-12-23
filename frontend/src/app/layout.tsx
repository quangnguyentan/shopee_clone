'"use client";';
import type { Metadata } from "next";
import "./globals.css";
import CultureProvider from "../provider/CultureProvider";
import Header from "../components/shared/Header";
export const metadata: Metadata = {
  title: "Instagram",
  description: "Instagram clone",
  icons: {
    icon: "instagram.ico",
    shortcut: "instagram.ico",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="mdl-js">
      <body suppressHydrationWarning>
        <CultureProvider>
          <Header />
          {children}
        </CultureProvider>
      </body>
    </html>
  );
}
