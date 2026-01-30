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

export interface ProductFullWithVariantDto {
  shop_id: number;
  category_id: number;
  name: string;
  description: string;
  status: ProductStatus;
  category_ids?: number[];
  variants: {
    sku?: string;
    price: number;
    stock: number;
    attributes: {
      attribute_name: string;
      value: string;
    }[];
  }[];
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

export type Attribute = {
  name: string;
  values: string[];
};

export type VariantAttribute = {
  attribute_name: string;
  value: string;
};

export type Variant = {
  sku?: string;
  price?: number;
  stock?: number;
  attributes: VariantAttribute[];
};

export type ProductFormValues = {
  name: string;
  shop_id: number;
  category_id: number;
  description: string;
  status: ProductStatus;

  // optional
  category_ids?: number[];
  has_variants?: boolean;

  // simple product
  price_min?: number;
  price_max?: number;
  stock?: number;

  // variants product
  variants?: {
    sku?: string;
    price?: number;
    stock?: number;
    attributes: {
      attribute_name: string;
      value: string;
    }[];
  }[];

  // UI only
  images: UploadFileWithExtra[];
};

export type NormalizedImage = {
  url?: string;
  file?: File;
  isPrimary: boolean;
};
