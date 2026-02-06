"use client";

import React, { useEffect } from "react";
import ProductCard from "./ProductCard";

import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/src/lib/utils";
import PaginationBar from "@/src/components/shared/PaginationBar";
import { useNavigate } from "@/src/common/constants/navigate.constant";
import { useGetBuyerProductsQuery } from "@/src/common/api/product.api";

const COLS = 6;
const ROWS = 8;
const PAGE_SIZE = COLS * ROWS;

const ProductList = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { push } = useNavigate();

  const pageNumber = Number(searchParams.get("pageNumber") ?? 1);
  const isHome = pathname === "/";

  const { data, isLoading } = useGetBuyerProductsQuery({
    page: pageNumber,
    limit: PAGE_SIZE,
  });

  const products = data?.items ?? [];
  const totalPage = Math.ceil((data?.total ?? 0) / PAGE_SIZE);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pageNumber]);

  if (isLoading) {
    return <div className="py-10 text-center">Đang tải sản phẩm...</div>;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 w-full rounded-md",
        isHome ? "" : "bg-white",
      )}
    >
      <div
        className={cn(
          "sticky top-header z-30 bg-white px-4 py-3 flex justify-center",
          "border-b-[3px] border-red-primary",
        )}
      >
        <span className="font-medium text-base text-red-primary">
          GỢI Ý HÔM NAY
        </span>
      </div>

      <div className="grid grid-cols-6 gap-4 px-4">
        {products?.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {isHome && (
        <div className="flex justify-center py-6">
          <button
            onClick={() => push("/daily-discover?pageNumber=1")}
            className="w-1/3 py-2 border border-gray-300 rounded-sm hover:bg-gray-100 bg-white transition text-black/60 text-sm"
          >
            Xem thêm
          </button>
        </div>
      )}

      {!isHome && totalPage > 1 && (
        <div className="py-6">
          <PaginationBar currentPage={pageNumber} totalPage={totalPage} />
        </div>
      )}
    </div>
  );
};

export default ProductList;
