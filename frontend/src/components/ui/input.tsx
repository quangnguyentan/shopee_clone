import { cn } from "@/src/lib/utils";
import * as React from "react";

type InputProps = React.ComponentProps<"input"> & {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
};

function Input({ className, type, startIcon, endIcon, ...props }: InputProps) {
  return (
    <div className="relative flex items-center">
      {startIcon && (
        <span className="pointer-events-none absolute left-3 text-muted-foreground">
          {startIcon}
        </span>
      )}

      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground",
          "selection:bg-primary selection:text-primary-foreground",
          "dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent",
          "py-1 text-base shadow-xs outline-none transition-[color,box-shadow]",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          startIcon && "pl-9",
          endIcon && "pr-9",
          className
        )}
        {...props}
      />

      {endIcon && (
        <span className="absolute right-3 text-muted-foreground">
          {endIcon}
        </span>
      )}
    </div>
  );
}

export { Input };
