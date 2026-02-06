import { baseApi, type PaginatedResponse } from "../config/baseApi";
import type { ProductVariantAttribute } from "../types/product-variant-attribute.type";

export const productVariantAttributeApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["ProductVariantAttribute"],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getAllProductVariantAttributes: builder.query<
        PaginatedResponse<ProductVariantAttribute>,
        void
      >({
        query: () => ({
          url: `/product-variant-attributes/`,
          method: "GET",
        }),
        providesTags: ["ProductVariantAttribute"],
      }),
      getProductVariantAttributeById: builder.query<
        ProductVariantAttribute,
        { id: A }
      >({
        query: ({ id }) => ({
          url: `/product-variant-attributes/${id}`,
          method: "GET",
        }),
        providesTags: ["ProductVariantAttribute"],
      }),
      createProductVariantAttribute: builder.mutation<
        ProductVariantAttribute,
        Partial<ProductVariantAttribute>
      >({
        query: (body) => ({
          url: `/product-variant-attributes/`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["ProductVariantAttribute"],
      }),
      updateProductVariantAttribute: builder.mutation<
        ProductVariantAttribute,
        { id: A; body: Partial<ProductVariantAttribute> }
      >({
        query: ({ id, body }) => ({
          url: `/product-variant-attributes/${id}`,
          method: "PUT",
          data: body,
        }),
        invalidatesTags: ["ProductVariantAttribute"],
      }),
    }),
  });

export const {
  useGetAllProductVariantAttributesQuery,
  useGetProductVariantAttributeByIdQuery,
  useCreateProductVariantAttributeMutation,
  useUpdateProductVariantAttributeMutation,
} = productVariantAttributeApi;
