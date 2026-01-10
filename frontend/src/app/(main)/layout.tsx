"use client";
import Footer from "@/src/components/shared/Footer";
import Header from "@/src/components/shared/Header";
import { cn } from "@/src/lib/utils";
import { usePathname } from "next/navigation";
import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="bg-gray-blackground min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-header">
        <div className={isHome ? "w-full" : "max-w-screen-xl mx-auto px-12"}>
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
