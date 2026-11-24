import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/src/common/types/product.type";
import { formatCurrency } from "@/src/common/helper/formatCurrency";
import { formatSold } from "@/src/common/helper/formatSold";
import { getAssetUrl } from "@/src/lib/assets";
import { MapPin } from "lucide-react";

type ProductCardProduct = Pick<
  Product,
  "id" | "name" | "price_min" | "price_max" | "sold_count" | "images"
> & {
  display_price?: number;
  discount_percent?: number | null;
  rating_avg?: number;
  rating_count?: number;
  shop?: Pick<NonNullable<Product["shop"]>, "province_name">;
};

interface ProductCardProps {
  product: ProductCardProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const image =
    product.images?.find((item) => item.is_primary) ?? product.images?.[0];
  const imageUrl = getAssetUrl(
    image?.thumbnail ?? image?.original ?? image?.url,
  );
  const price = product.display_price ?? product.price_min;
  const discount =
    product.discount_percent ??
    (product.price_min > 0 && price < product.price_min
      ? Math.round(((product.price_min - price) / product.price_min) * 100)
      : 0);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex min-w-0 flex-col overflow-hidden border border-transparent bg-white transition hover:-translate-y-0.5 hover:border-red-primary hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            unoptimized
            className="object-cover transition group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            Chưa có hình ảnh
          </div>
        )}
        {discount > 0 && (
          <span className="absolute right-0 top-0 bg-yellow-300/95 px-1.5 py-1 text-center text-[10px] font-medium leading-3 text-red-primary">
            <span className="block">-{discount}%</span>
            <span className="text-red-700">GIẢM</span>
          </span>
        )}
        <span className="absolute bottom-0 left-0 bg-red-primary px-2 py-0.5 text-[10px] font-medium uppercase text-white">
          Yêu thích
        </span>
      </div>
      <div className="flex min-h-[132px] flex-1 flex-col justify-between p-2">
        <h3 className="line-clamp-2 min-h-10 text-xs leading-5 text-gray-800">
          {product.name}
        </h3>
        {typeof product.rating_avg === "number" &&
          (product.rating_count ?? 0) > 0 && (
            <span className="mt-1 text-[10px] text-amber-500">
              ★ {product.rating_avg.toFixed(1)}
            </span>
          )}
        <div className="mt-2 flex items-center justify-between gap-1">
          <div className="flex min-w-0 items-baseline gap-1 text-red-primary">
            <span className="text-[10px]">₫</span>
            <span className="truncate text-base font-medium">
              {formatCurrency(price)}
            </span>
          </div>
          <span className="shrink-0 text-[10px] text-gray-500">
            Đã bán {formatSold(product.sold_count)}
          </span>
        </div>
        {product.shop?.province_name && (
          <p className="mt-2 flex min-w-0 items-center gap-1 truncate text-[10px] text-gray-500">
            <MapPin aria-hidden="true" className="size-3 shrink-0" />
            <span className="truncate">{product.shop.province_name}</span>
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
