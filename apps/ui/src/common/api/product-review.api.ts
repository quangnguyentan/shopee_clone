import { baseApi, type PaginatedResponse } from "../config/baseApi";

export interface ProductReview {
  id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  media_urls: string[];
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

export interface CreateProductReviewRequest {
  order_item_id: string;
  product_id: string;
  rating: number;
  comment?: string;
  media_urls?: string[];
}

export const productReviewApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["ProductReview", "ReviewedOrderItems"],
  })
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
      getMyReviewedOrderItems: builder.query<string[], void>({
        query: () => ({
          url: "/product-review/mine/order-items",
          method: "GET",
        }),
        providesTags: [{ type: "ReviewedOrderItems", id: "MINE" }],
      }),
      createProductReview: builder.mutation<
        ProductReview,
        CreateProductReviewRequest
      >({
        query: (data) => ({
          url: "/product-review",
          method: "POST",
          data,
        }),
        invalidatesTags: (_result, _error, { product_id }) => [
          { type: "ProductReview", id: product_id },
          { type: "ReviewedOrderItems", id: "MINE" },
        ],
      }),
    }),
  });

export const {
  useGetProductReviewsQuery,
  useGetMyReviewedOrderItemsQuery,
  useCreateProductReviewMutation,
} = productReviewApi;
