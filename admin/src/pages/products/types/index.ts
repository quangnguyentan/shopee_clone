import type { ProductStatus } from "@/common/types/product.type";
import type { UploadFileWithExtra } from "@/components/Uploader";

export interface CreateProductDto {
  shop_id: number;
  category_id: number;
  name: string;
  description: string;
  price_min: number;
  price_max: number;
  stock: number;
  status: ProductStatus;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export type AttributeMatrix = {
  name: string; // Color, Size
  values: string[]; // ['Red', 'Blue']
};

export type VariantAttribute = {
  attribute_name: string;
  value: string;
};

export type Variant = {
  sku?: string;
  price: number;
  stock: number;
  attributes: VariantAttribute[];
};

export interface CreateProductWithVariantDto {
  shop_id: number;
  category_id: number;
  name: string;
  description: string;
  status: ProductStatus;

  attributes: AttributeMatrix[];
  variants: Variant[];
}

export interface CreateProductImageDto {
  product_id: number;
  url: string;
  is_primary: boolean;
}

export type UpdateProductImageDto = Partial<
  Pick<CreateProductImageDto, "is_primary">
>;

export type ProductFormValues = {
  name: string;
  shop_id: number;
  category_id: number;
  description: string;
  status: ProductStatus;

  has_variants?: boolean;

  price_min?: number;
  price_max?: number;
  stock?: number;

  attributes?: AttributeMatrix[];
  variants?: Variant[];

  images: UploadFileWithExtra[];
};

export type NormalizedImage = {
  url?: string;
  file?: File;
  isPrimary: boolean;
};
