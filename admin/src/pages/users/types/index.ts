import type { ProductStatus } from "@/common/types/product.type";

export interface CreateProductDto {
  shop_id: number;
  name: string;
  description: string;
  price_min: number;
  price_max: number;
  stock: number;
  status: ProductStatus;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface CreateProductImageDto {
  product_id: number;
  url: string;
  is_primary: boolean;
}

export type UpdateProductImageDto = Partial<
  Pick<CreateProductImageDto, "is_primary">
>;
