"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGetBuyerProductsQuery } from "@/src/common/api/product.api";
import { useGetCategoryTreeQuery } from "@/src/common/api/category.api";
import type { Category } from "@/src/common/types/category.type";
import type { ProductBuyerListItem } from "@/src/common/types/product.type";
import PaginationBar from "@/src/components/shared/PaginationBar";
import { getAssetUrl } from "@/src/lib/assets";
import { createShopeeSlug } from "@/src/lib/utils";
import { formatSold } from "@/src/common/helper/formatSold";
import { formatCurrency } from "@/src/common/helper/formatCurrency";
import type { CategoryFilters } from "./CategoryCatalog";

type SortOption = "popular" | "latest" | "sales" | "price-asc" | "price-desc";

interface ProductListProps {
  categoryId: string;
  filters: CategoryFilters;
}

const PAGE_SIZE = 20;

const findCategory = (
  categories: Category[],
  categoryId: string,
): Category | undefined => {
  for (const category of categories) {
    if (category.id === categoryId) return category;
    const childMatch = findCategory(category.children ?? [], categoryId);
    if (childMatch) return childMatch;
  }
  return undefined;
};

const ProductTile = ({ product }: { product: ProductBuyerListItem }) => {
  const image =
    product.images?.find((item) => item.is_primary) ?? product.images?.[0];
  const imageUrl = getAssetUrl(image?.original ?? image?.url);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block min-w-0 border border-transparent bg-white transition hover:-translate-y-0.5 hover:border-red-primary hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            unoptimized
            className="object-cover transition group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            Chưa có hình ảnh
          </div>
        )}
        {product.discount_percent !== null && product.discount_percent > 0 && (
          <div className="absolute right-0 top-0 bg-yellow-300/95 px-1.5 py-1 text-center text-[10px] font-medium leading-3 text-red-primary">
            <span className="block">-{product.discount_percent}%</span>
            <span className="text-red-700">GIẢM</span>
          </div>
        )}
        <span className="absolute bottom-0 left-0 bg-red-primary px-2 py-0.5 text-[10px] font-medium uppercase text-white">
          Yêu thích
        </span>
      </div>
      <div className="flex min-h-[112px] flex-col justify-between p-2">
        <h3 className="line-clamp-2 min-h-10 text-xs leading-5 text-gray-800">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-between gap-1">
          <div className="flex min-w-0 items-baseline gap-1 text-red-primary">
            <span className="text-[10px]">₫</span>
            <span className="truncate text-base font-medium">
              {formatCurrency(product.display_price)}
            </span>
          </div>
          <span className="shrink-0 text-[10px] text-gray-500">
            Đã bán {formatSold(product.sold_count)}
          </span>
        </div>
      </div>
    </Link>
  );
};

const ProductList = ({ categoryId, filters }: ProductListProps) => {
  const searchParams = useSearchParams();
  const requestedPage = Number(searchParams.get("pageNumber") ?? 1);
  const pageNumber =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [sort, setSort] = useState<SortOption>("popular");
  const { data, isLoading, isError } = useGetBuyerProductsQuery({
    page: pageNumber,
    limit: PAGE_SIZE,
    categoryId: Number(categoryId),
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minRating: filters.minRating,
    mallOnly: filters.mallOnly,
    discountedOnly: filters.discountedOnly,
    inStock: filters.inStock,
    sort,
    attributeFilters: filters.attributeFilters,
  });
  const { data: categoryTree = [] } = useGetCategoryTreeQuery();
  const category = useMemo(
    () => findCategory(categoryTree, categoryId),
    [categoryTree, categoryId],
  );

  const products = data?.items ?? [];

  const totalPage = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  return (
    <section className="min-w-0 space-y-4">
      {products.length > 0 && (
        <div className="rounded-sm bg-white p-5">
          <h2 className="mb-4 text-sm font-medium uppercase text-gray-500">
            Kiểu cách thịnh hành - diện bảnh mặc sang
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {products.slice(0, 5).map((product) => {
              const image =
                product.images?.find((item) => item.is_primary) ??
                product.images?.[0];
              const imageUrl = getAssetUrl(image?.original ?? image?.url);

              return (
                <article
                  key={product.id}
                  className="overflow-hidden border border-gray-200 text-center"
                >
                  <div className="relative aspect-square bg-gray-100">
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                    )}
                  </div>
                  <p className="truncate px-2 pt-2 text-xs text-gray-700">
                    {product.name}
                  </p>
                  <p className="pb-2 pt-1 text-xs text-gray-400">
                    Từ{" "}
                    <span className="text-red-primary">
                      {formatCurrency(product.display_price)}₫
                    </span>
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 rounded-sm bg-[#ededed] px-4 py-3 text-sm">
        <span className="mr-1 text-gray-600">Sắp xếp theo</span>
        {(
          [
            ["popular", "Phổ biến"],
            ["latest", "Mới nhất"],
            ["sales", "Bán chạy"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setSort(value)}
            className={`rounded-sm px-4 py-2 ${sort === value
              ? "bg-red-primary text-white"
              : "bg-white text-gray-700 hover:text-red-primary"
              }`}
          >
            {label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2">
          <span className="sr-only">Sắp xếp giá</span>
          <select
            value={
              sort === "price-asc" || sort === "price-desc" ? sort : "price"
            }
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="rounded-sm border border-gray-200 bg-white px-3 py-2 text-gray-700 outline-none focus:border-red-primary"
          >
            <option value="price" disabled>
              Giá
            </option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {category?.name ?? "Sản phẩm"} ({data?.total ?? 0} sản phẩm)
        </span>
        <span>
          Trang {pageNumber}
          {totalPage > 0 ? ` / ${totalPage}` : ""}
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="aspect-[3/4] animate-pulse bg-white" />
          ))}
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="rounded-sm bg-white px-4 py-12 text-center text-sm text-red-primary"
        >
          Không thể tải sản phẩm. Vui lòng thử lại sau.
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => (
            <ProductTile key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-sm bg-white px-4 py-16 text-center text-sm text-gray-500">
          Không tìm thấy sản phẩm phù hợp.
        </div>
      )}

      {totalPage > 1 && (
        <div className="rounded-sm bg-white py-5">
          <PaginationBar currentPage={pageNumber} totalPage={totalPage} />
        </div>
      )}
    </section>
  );
};

export default ProductList;
