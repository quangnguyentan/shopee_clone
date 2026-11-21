"use client";

import { Digit } from "./Digit";
import { Skeleton } from "@/src/components/ui/skeleton";

interface TimeBoxProps {
  value: string;
  isLoading?: boolean;
}

export const TimeBox = ({ value, isLoading = false }: TimeBoxProps) => {
  if (isLoading) {
    return (
      <Skeleton
        aria-hidden="true"
        className="h-6 w-8 min-w-8 rounded-[3px] bg-gray-200"
      />
    );
  }

  return (
    <div className="flex h-6 min-w-8 items-center justify-center rounded-[3px] bg-[#222] px-1">
      {value.split("").map((digit, index) => (
        <Digit key={index} value={digit} />
      ))}
    </div>
  );
};
