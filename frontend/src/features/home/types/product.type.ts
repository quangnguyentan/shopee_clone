/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Product {
  id: number;
  shop: Record<string, any>;
  name: string;
  description: string;
  price_min: number;
  price_max: number;
  stock: number;
  status: string;
  variants: any[];
  created_at: string;
}
