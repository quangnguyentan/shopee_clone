import { baseApi, type PaginatedResponse } from "../config/baseApi";
import type { ProductVariant } from "../types/product-variant.type";

export const productVariantApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["ProductVariant"],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getAllProductVariants: builder.query<
        PaginatedResponse<ProductVariant>,
        { page?: number; limit?: number } | void
      >({
        query: (arg) => {
          const page = arg?.page ?? 1;
          const limit = arg?.limit ?? 10;
          return {
            url: `/product-variants/`,
            method: "GET",
            params: { page, limit },
          };
        },
        providesTags: ["ProductVariant"],
      }),
      getProductVariantById: builder.query<ProductVariant, { id: A }>({
        query: ({ id }) => ({
          url: `/product-variants/${id}`,
          method: "GET",
        }),
        providesTags: ["ProductVariant"],
      }),
      createProductVariant: builder.mutation<ProductVariant, FormData>({
        query: (body) => ({
          url: `/product-variants/`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["ProductVariant"],
      }),
      updateProductVariant: builder.mutation<
        ProductVariant,
        { id: A; body: FormData }
      >({
        query: ({ id, body }) => ({
          url: `/product-variants/${id}`,
          method: "PUT",
          data: body,
        }),
        invalidatesTags: ["ProductVariant"],
      }),
    }),
  });

export const {
  useGetAllProductVariantsQuery,
  useGetProductVariantByIdQuery,
  useCreateProductVariantMutation,
  useUpdateProductVariantMutation,
} = productVariantApi;
