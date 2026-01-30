import Header from "@/src/components/shared/Header";
import React from "react";

const MainLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-gray-blackground">
      <Header />
      <main className="h-screen-minus-header pt-header max-w-screen-xl mx-auto px-12">
        {children}
      </main>
    </div>
  );
};

export default MainLayoutWrapper;
