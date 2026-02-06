export interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  stock: number;

  product: {
    id: number;
    name: string;
    category_id?: A;
  };

  attributes: {
    attribute: {
      id: number;
      name: string;
    };
    value?: {
      id: number;
      value: string;
    } | null;
    custom_value?: string | null;
  }[];
}

export interface ProductVariantFormValues {
  product_id: number;
  variants: {
    sku: string;
    price: number;
    stock: number;
    attributes: {
      name: string;
      value: string;
    }[];
  }[];
}
