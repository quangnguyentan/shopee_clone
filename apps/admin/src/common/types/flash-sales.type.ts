import type { FlashSaleItem } from "./flash-sale-items.type";

export interface FlashSale {
  id: number;

  name: string;

  start_time: string; // ISO
  end_time: string; // ISO

  is_active: boolean;

  banner_image: string;

  priority: number; // ưu tiên hiển thị nếu nhiều flash sale

  items: FlashSaleItem[];

  created_at: string;
}

export interface CreateFlashSaleDto {
  name: string;
  start_time: string;
  end_time: string;
  banner_image?: string;
  priority?: number;
}

export interface UpdateFlashSaleDto extends Partial<CreateFlashSaleDto> {
  is_active?: boolean;
}
