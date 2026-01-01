import { cn } from "@/src/lib/utils";
import React from "react";

export function Loading({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1 w-full h-screen text-red-primary",
        className
      )}
      {...props}
    >
      <span className="w-2 h-2 bg-current rounded-full animate-loading-dot delay-0"></span>
      <span className="w-2 h-2 bg-current rounded-full animate-loading-dot delay-200"></span>
      <span className="w-2 h-2 bg-current rounded-full animate-loading-dot delay-400"></span>
    </div>
  );
}
