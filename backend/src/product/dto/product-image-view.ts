import { Product } from '../entities/product.entity';

export type ProductImageView = {
  id: number;
  is_primary: boolean;
  original: string;
  thumbnail: string;
  small: string;
};

export type ProductView = Omit<Product, 'images'> & {
  images: ProductImageView[];
};
