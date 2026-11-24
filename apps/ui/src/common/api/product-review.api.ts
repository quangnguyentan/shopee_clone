import { baseApi, type PaginatedResponse } from "../config/baseApi";

export interface ProductReview {
  id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  shop_reply: string | null;
  shop_replied_at: string | null;
  created_at: string;
  user?: {
    name: string | null;
    avatar: string | null;
  };
}

export type ProductReviewsResponse = PaginatedResponse<ProductReview> & {
  rating_breakdown: Partial<Record<1 | 2 | 3 | 4 | 5, number>>;
};

export const productReviewApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["ProductReview"] })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getProductReviews: builder.query<
        ProductReviewsResponse,
        { productId: string; page?: number; limit?: number; rating?: number }
      >({
        query: ({ productId, page = 1, limit = 10, rating }) => ({
          url: "/product-review",
          method: "GET",
          params: {
            product_id: productId,
            page,
            limit,
            rating,
          },
        }),
        providesTags: (_result, _error, { productId }) => [
          { type: "ProductReview", id: productId },
        ],
      }),
    }),
  });

export const { useGetProductReviewsQuery } = productReviewApi;
