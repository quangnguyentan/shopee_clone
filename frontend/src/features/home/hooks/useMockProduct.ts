import { Product } from "../types/product.type";

export const productsMock: Product[] = Array.from({ length: 400 }).map(
  (_, i) => ({
    id: i + 1,
    shop: { id: 1, name: "Shopee Mall" },
    name: `Áo thun ${i + 1}`,
    description: "Áo thun cotton 100%",
    price_min: 79000,
    price_max: 149000,
    stock: 500,
    status: "ACTIVE",
    variants: [],
    created_at: new Date().toISOString(),
  }),
);
