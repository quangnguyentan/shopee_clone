import type { FlashSale } from "../types/flash-sales.type";

export const getFlashSaleStatus = (sale: FlashSale) => {
  const now = Date.now();
  const start = new Date(sale.start_time).getTime();
  const end = new Date(sale.end_time).getTime();

  if (!sale.is_active) return "Inactive";
  if (now < start) return "Upcoming";
  if (now > end) return "Ended";
  return "Active";
};
