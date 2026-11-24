const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const getApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const errorRecord = isRecord(error) ? error : undefined;
  const responseData =
    errorRecord && isRecord(errorRecord.data) ? errorRecord.data : undefined;
  const candidate = responseData?.message ?? errorRecord?.message;

  if (typeof candidate === "string" && candidate.trim()) return candidate;
  if (Array.isArray(candidate)) {
    const messages = candidate.filter(
      (item): item is string => typeof item === "string" && item.trim() !== "",
    );
    if (messages.length) return messages.join(", ");
  }

  return fallback;
};
