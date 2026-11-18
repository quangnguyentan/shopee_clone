import type { Translate } from "@/src/lib/locale";

export type ErrorMap = Record<string, string>;

export function getErrorMessage(
  err: { data?: { code?: string } } | undefined,
  t: Translate,
  map?: ErrorMap,
): string {
  const code = err?.data?.code;
  if (!code) return t("pages.auth.login-or-register.failed");

  return map?.[code] ?? t("pages.auth.login-or-register.failed");
}
