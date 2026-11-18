import type { Translate } from "@/src/lib/locale";
import z from "zod";

export const createLoginSchema = (t: Translate) =>
  z.object({
    username: z.string().min(2, {
      message: t("pages.auth.error.required"),
    }),
    password: z
      .string()
      .min(6, { message: t("pages.auth.error.required") }),
  });

export const createRegisterSchema = (t: Translate) =>
  z.object({
    phone: z.string().min(10, {
      message: t("pages.auth.error.invalid_phone"),
    }),

    email: z
      .string()
      .min(1, { message: t("pages.auth.error.required") })
      .email({ message: t("pages.auth.error.invalid_email") }),

    password: z.string().min(6, {
      message: t("pages.auth.error.password_min_6"),
    }),
  });

export type LoginSchema = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterSchema = z.infer<ReturnType<typeof createRegisterSchema>>;
