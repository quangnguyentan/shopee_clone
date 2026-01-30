import i18n from "@/src/lib/locale";

export type ErrorMap = Record<string, string>;

export function getErrorMessage(
  err?: { data?: { code?: string } },
  map?: ErrorMap,
): string {
  const code = err?.data?.code;
  if (!code) return i18n.get("pages.auth.login-or-register.failed");

  return map?.[code] ?? i18n.get("pages.auth.login-or-register.failed");
}
