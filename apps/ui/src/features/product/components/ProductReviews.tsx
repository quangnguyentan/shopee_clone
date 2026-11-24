"use client";

import Image from "next/image";
import { useState } from "react";
import { useGetProductReviewsQuery } from "@/src/common/api/product-review.api";
import { getAssetUrl } from "@/src/lib/assets";

const REVIEW_PAGE_SIZE = 8;

const ProductReviews = ({ productId }: { productId: string }) => {
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState<number | undefined>();
  const { data, isLoading, isError } = useGetProductReviewsQuery({
    productId,
    page,
    limit: REVIEW_PAGE_SIZE,
    rating,
  });
  const totalPages = Math.ceil((data?.total ?? 0) / REVIEW_PAGE_SIZE);

  const selectRating = (nextRating?: number) => {
    setRating(nextRating);
    setPage(1);
  };

  return (
    <section id="reviews" className="scroll-mt-24 bg-white p-5 sm:p-8">
      <h2 className="mb-5 text-lg font-medium uppercase text-gray-800">
        Đánh giá sản phẩm
      </h2>

      <div className="mb-5 flex flex-wrap items-center gap-2 border border-red-100 bg-[#fffaf8] p-4">
        <button
          type="button"
          onClick={() => selectRating()}
          className={`rounded-sm border px-3 py-2 text-sm ${
            rating === undefined
              ? "border-red-primary text-red-primary"
              : "border-gray-200 text-gray-700"
          }`}
        >
          Tất cả ({data?.total ?? 0})
        </button>
        {[5, 4, 3, 2, 1].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => selectRating(value)}
            className={`rounded-sm border px-3 py-2 text-sm ${
              rating === value
                ? "border-red-primary text-red-primary"
                : "border-gray-200 text-gray-700"
            }`}
          >
            {"★".repeat(value)}
            {"☆".repeat(5 - value)} (
            {data?.rating_breakdown?.[value as 1 | 2 | 3 | 4 | 5] ?? 0})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4" aria-label="Đang tải đánh giá">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse border-b bg-gray-50"
            />
          ))}
        </div>
      ) : isError ? (
        <p role="alert" className="py-8 text-center text-sm text-red-primary">
          Không thể tải đánh giá. Vui lòng thử lại sau.
        </p>
      ) : data?.items.length ? (
        <div className="divide-y divide-gray-100">
          {data.items.map((review) => {
            const avatarUrl = getAssetUrl(review.user?.avatar);
            return (
              <article key={review.id} className="py-5 first:pt-1">
                <div className="flex items-start gap-3">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt=""
                      width={36}
                      height={36}
                      unoptimized
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-500">
                      {(review.user?.name ?? "N").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700">
                      {review.user?.name ?? "Người mua Shopee"}
                    </p>
                    <p
                      className="mt-1 text-sm tracking-wide text-amber-500"
                      aria-label={`${review.rating} trên 5 sao`}
                    >
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </p>
                    <time
                      dateTime={review.created_at}
                      className="mt-1 block text-xs text-gray-400"
                    >
                      {new Date(review.created_at).toLocaleDateString("vi-VN")}
                    </time>
                    {review.comment && (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                        {review.comment}
                      </p>
                    )}
                    {review.shop_reply && (
                      <div className="mt-3 border-l-2 border-red-200 bg-gray-50 px-3 py-2">
                        <p className="text-xs font-medium text-red-primary">
                          Phản hồi của Người bán
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                          {review.shop_reply}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-gray-500">
          {rating
            ? `Chưa có đánh giá ${rating} sao cho sản phẩm này.`
            : "Sản phẩm chưa có đánh giá."}
        </p>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Trang đánh giá"
          className="mt-5 flex items-center justify-center gap-2"
        >
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded border px-3 py-2 text-sm disabled:opacity-40"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                aria-current={pageNumber === page ? "page" : undefined}
                onClick={() => setPage(pageNumber)}
                className={`rounded border px-3 py-2 text-sm ${
                  pageNumber === page
                    ? "border-red-primary bg-red-primary text-white"
                    : "border-gray-200 text-gray-700"
                }`}
              >
                {pageNumber}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded border px-3 py-2 text-sm disabled:opacity-40"
          >
            ›
          </button>
        </nav>
      )}
    </section>
  );
};

export default ProductReviews;
