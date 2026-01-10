import Image from "next/image";
import React from "react";
import { Product } from "../types/product.type";
import voucher from "@/src/assest/voucher.png";
import product_test from "@/src/assest/product_test.1.webp";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="flex flex-col cursor-pointer hover:shadow-lg transition bg-white">
      <div className="relative w-full h-44">
        <Image
          src={product_test}
          alt={product.name}
          fill
          className="object-cover"
        />

        <Image
          src={voucher}
          alt="voucher"
          className="absolute top-0 left-0 w-8 h-10"
        />

        <div className="absolute bottom-0 w-full bg-black/60 text-center text-xs py-1">
          <span className="text-white">
            Bán {product.price_max ?? 0}+ / tháng
          </span>
        </div>
      </div>

      <div className="px-2 py-2 flex flex-col gap-1">
        <span className="text-sm line-clamp-2">{product.name}</span>

        <span className="text-red-500 font-medium text-base">
          ₫{product.price_min.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default ProductCard;
