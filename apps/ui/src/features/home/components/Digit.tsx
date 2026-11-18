"use client";

import { cn } from "@/src/lib/utils";

interface DigitProps {
  value: string;
}

export const Digit = ({ value }: DigitProps) => {
  return (
    <span
      className={cn(
        "inline-block w-[10px] text-center font-bold text-white text-sm",
        "animate-slide-up"
      )}
    >
      {value}
    </span>
  );
};
