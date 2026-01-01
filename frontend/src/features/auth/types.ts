import i18n from "@/src/lib/locale";
import z from "zod";

export const loginSchema = z.object({
  username: z.string().min(2, {
    message: i18n.get("pages.auth.error.required"),
  }),
  password: z
    .string()
    .min(6, { message: i18n.get("pages.auth.error.required") }),
});
export const registerSchema = z.object({
  phone: z.string().min(10, {
    message: i18n.get("pages.auth.error.required"),
  }),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
