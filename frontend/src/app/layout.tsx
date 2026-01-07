'"use client";';
import type { Metadata } from "next";
import "./globals.css";
import CultureProvider from "../common/provider/CultureProvider";
import ClientProvider from "../common/provider/ClientProvider";
import { AuthBootstrap } from "../features/auth/components";
import { Toaster } from "sonner";
import ProtectedLayout from "../components/shared/ProtectedLayout";
export const metadata: Metadata = {
  title: "Shopee Việt Nam | Mua sắm online",
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
              <ProtectedLayout>
                <Toaster richColors position="top-center" />
                {children}
              </ProtectedLayout>
            </CultureProvider>
          </AuthBootstrap>
        </ClientProvider>
      </body>
    </html>
  );
}
