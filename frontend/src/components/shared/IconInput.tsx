"use client";

import * as React from "react";
import { Input } from "@/src/components/ui/input";

type IconInputProps = {
  label?: string;
  placeholder?: string;
  type?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function IconInput({
  label,
  placeholder,
  type = "text",
  startIcon,
  endIcon,
  className,
  onChange,
}: IconInputProps) {
  return (
    <>
      {label && <label className="text-sm font-medium">{label}</label>}
      <Input
        type={type}
        placeholder={placeholder}
        startIcon={startIcon}
        endIcon={endIcon}
        className={className}
        onWheel={(e) => {
          if (type === "number") {
            (e.target as HTMLInputElement).blur();
          }
        }}
        onChange={(e) => {
          onChange?.(e);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
          }
        }}
      />
    </>
  );
}
