"use client";

interface DigitProps {
  value: string;
}

export const Digit = ({ value }: DigitProps) => {
  return (
    <span className="inline-flex h-6 w-[11px] items-center justify-center text-sm font-bold tabular-nums leading-none text-white">
      {value}
    </span>
  );
};
