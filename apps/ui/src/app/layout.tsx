'"use client";';
import type { Metadata } from "next";
import "./globals.css";
import ClientProvider from "../common/provider/ClientProvider";
import { AuthBootstrap } from "../features/auth/components";
import { Toaster } from "sonner";
import ProtectedLayout from "../components/shared/ProtectedLayout";
import { LanguageProvider } from "../lib/locale";
export const metadata: Metadata = {
  title: "Shopee Việt Nam | Mua sắm online",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="mdl-js">
      <body suppressHydrationWarning>
        <ClientProvider>
          <LanguageProvider>
            <AuthBootstrap>
              <ProtectedLayout>
                <Toaster richColors position="top-center" />
                {children}
              </ProtectedLayout>
            </AuthBootstrap>
          </LanguageProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
