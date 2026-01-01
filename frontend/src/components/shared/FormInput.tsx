"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";

type FormInputProps = {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  className?: string;
  isShowMessage?: boolean;
  formItemClassName?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function FormInput({
  name,
  label,
  placeholder,
  type = "text",
  startIcon,
  endIcon,
  className,
  isShowMessage = true,
  formItemClassName,
  onChange,
}: FormInputProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={formItemClassName}>
          {label && <label className="text-sm font-medium">{label}</label>}
          <FormControl>
            <Input
              {...field}
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
                field.onChange(e);
                onChange?.(e);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                  e.preventDefault();
                }
              }}
            />
          </FormControl>
          {isShowMessage && (
            <FormMessage className="!mt-0 !p-0 text-xs text-destructive text-red-500" />
          )}
        </FormItem>
      )}
    />
  );
}
