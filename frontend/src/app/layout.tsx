'"use client";';
import type { Metadata } from "next";
import "./globals.css";
import CultureProvider from "../common/provider/CultureProvider";
import Header from "../components/shared/Header";
import ClientProvider from "../common/provider/ClientProvider";
import { AuthBootstrap } from "../features/auth/components";
import AuthProvider from "../common/provider/AuthProvider";
import { Toaster } from "sonner";
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
        <ClientProvider>
          <AuthBootstrap>
            <CultureProvider>
              <AuthProvider>
                <Toaster richColors position="top-center" />
                <Header />
                {children}
              </AuthProvider>
            </CultureProvider>
          </AuthBootstrap>
        </ClientProvider>
      </body>
    </html>
  );
}
