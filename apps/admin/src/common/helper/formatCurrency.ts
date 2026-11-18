export function formatCurrency(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return "";

  return new Intl.NumberFormat("en-US").format(value);
}
