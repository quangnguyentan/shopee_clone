import { baseApi, type PaginatedResponse } from "../config/baseApi";

export interface ProductReview {
  id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  shop_reply: string | null;
  shop_replied_at: string | null;
  created_at: string;
  user?: { name: string | null; avatar: string | null };
  product?: { id: string; name: string };
}

export const productReviewApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["ProductReview"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getManagedProductReviews: builder.query<
        PaginatedResponse<ProductReview>,
        { page: number; limit: number }
      >({
        query: (params) => ({
          url: "/product-review/manage",
          method: "GET",
          params,
        }),
        providesTags: ["ProductReview"],
      }),
      updateProductReviewReply: builder.mutation<
        ProductReview,
        { id: string; shop_reply: string }
      >({
        query: ({ id, shop_reply }) => ({
          url: `/product-review/${id}/reply`,
          method: "PATCH",
          data: { shop_reply },
        }),
        invalidatesTags: ["ProductReview"],
      }),
      deleteProductReview: builder.mutation<
        { success: boolean; id: string },
        string
      >({
        query: (id) => ({
          url: `/product-review/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["ProductReview"],
      }),
    }),
  });

export const {
  useGetManagedProductReviewsQuery,
  useUpdateProductReviewReplyMutation,
  useDeleteProductReviewMutation,
} = productReviewApi;
