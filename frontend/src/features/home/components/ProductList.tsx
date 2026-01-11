"use client";

import React, { useEffect } from "react";
import ProductCard from "./ProductCard";
import { productsMock } from "../hooks/useMockProduct";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/src/lib/utils";
import PaginationBar from "@/src/components/shared/PaginationBar";
import { useNavigate } from "@/src/common/constants/navigate.constant";

const COLS = 6;
const ROWS = 8;
const PAGE_SIZE = COLS * ROWS;

const ProductList = () => {
  const pathname = usePathname();
  const { push } = useNavigate();
  const searchParams = useSearchParams();

  const pageNumber = Number(searchParams.get("pageNumber") ?? 1);
  const isHome = pathname === "/";

  const totalPage = Math.ceil(productsMock.length / PAGE_SIZE);

  const start = (pageNumber - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const products = isHome
    ? productsMock.slice(0, PAGE_SIZE)
    : productsMock.slice(start, end);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pageNumber]);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 w-full rounded-md",
        isHome ? "" : "bg-white"
      )}
    >
      <div
        className={cn(
          "sticky top-header z-30 bg-white px-4 py-3 flex justify-center",
          "border-b-[3px] border-red-primary"
        )}
      >
        <span className="font-medium text-base text-red-primary">
          GỢI Ý HÔM NAY
        </span>
      </div>

      <div className="grid grid-cols-6 gap-4 px-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {isHome && (
        <div className="flex justify-center py-6">
          <button
            onClick={() => push("/daily-discover?pageNumber=2")}
            className="w-1/3 py-2 border border-gray-300 rounded-sm hover:bg-gray-100 transition text-black/60 text-sm"
          >
            Xem thêm
          </button>
        </div>
      )}

      {!isHome && (
        <div className="py-6">
          <PaginationBar currentPage={pageNumber} totalPage={totalPage} />
        </div>
      )}
    </div>
  );
};

export default ProductList;
