export type ErrorMap = Record<string, string>;

export function getErrorMessage(
  err?: { data?: { code?: string } },
  map?: ErrorMap
): string {
  const code = err?.data?.code;
  if (!code) return "Có gì đó đã xảy ra. Vui lòng thử lại!";

  return map?.[code] ?? "Có gì đó đã xảy ra. Vui lòng thử lại!";
}
