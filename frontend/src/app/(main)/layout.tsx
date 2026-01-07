import Header from "@/src/components/shared/Header";
import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Header />
      <main className="h-screen-minus-header pt-header max-w-screen-xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
