import Image from "next/image";
import React, { useMemo } from "react";
import { Product } from "../types/product.type";
import voucher from "@/src/assest/voucher.png";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const filterPrimaryImage = useMemo(() => {
    return product?.images?.filter((i) => i.is_primary);
  }, [product]);
  return (
    <div className="flex flex-col cursor-pointer hover:shadow-lg transition bg-white hover:-translate-y-[1px] h-[328px] rounded-md">
      <div className="relative w-full h-2/3">
        <Image
          src={filterPrimaryImage[0]?.original ?? ""}
          alt={product.name}
          fill
          className="object-cover w-full h-full rounded-md"
        />

        <div className="absolute top-0 right-0 text-xs text-red-primary bg-discount py-1 px-2 rounded-tr-md rounded-bl-md">
          <span>-25%</span>
        </div>

        <div className="absolute bottom-0 w-full h-full">
          <Image src={voucher} alt="voucher" className="w-full h-full" />
        </div>
      </div>

      <div className="px-2 py-2 flex flex-col gap-1">
        <span className="text-sm line-clamp-2">{product?.name}</span>
        <div className="flex items-center justify-center gap-1">
          <div className="rounded-md border border-red-rgb flex-1 flex items-center justify-center">
            <span className="text-red-rgb text-[10px]">Rẻ vô địch</span>
          </div>
          <div className="rounded-md border border-red-rgb flex-1 flex items-center justify-center px-2">
            <span className="text-red-rgb text-[10px] line-clamp-1">
              2?.??9₫ 15.1 lúc 00:00 Th01 15
            </span>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-col">
            <span className="text-red-500 font-medium text-base line-clamp-1">
              {product.price_max.toLocaleString()}₫
            </span>
          </div>
          <span className="text-xs">Đã bán 10k+</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
