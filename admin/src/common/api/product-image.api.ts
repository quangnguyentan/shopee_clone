import type {
  CreateProductImageDto,
  UpdateProductImageDto,
} from "@/pages/products/types";
import { baseApi, type PaginatedResponse } from "../config/baseApi";
import type { ProductImage } from "../types/product-image.type";

export const productImageApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["ProductImage"],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getAllProductImages: builder.query<PaginatedResponse<ProductImage>, void>(
        {
          query: () => ({
            url: `/product-images/`,
            method: "GET",
          }),
          providesTags: ["ProductImage"],
        },
      ),
      getProductImageById: builder.query<ProductImage, { id: A }>({
        query: ({ id }) => ({
          url: `/product-images/${id}`,
          method: "GET",
        }),
        providesTags: ["ProductImage"],
      }),
      createProductImage: builder.mutation<ProductImage, CreateProductImageDto>(
        {
          query: (body) => ({
            url: `/product-images/`,
            method: "POST",
            data: body,
          }),
          invalidatesTags: ["ProductImage"],
        },
      ),
      updateProductImage: builder.mutation<
        ProductImage,
        { id: A; body: UpdateProductImageDto }
      >({
        query: ({ id, body }) => ({
          url: `/product-images/${id}`,
          method: "PUT",
          data: body,
        }),
        invalidatesTags: ["ProductImage"],
      }),
    }),
  });

export const {
  useGetAllProductImagesQuery,
  useGetProductImageByIdQuery,
  useCreateProductImageMutation,
  useUpdateProductImageMutation,
} = productImageApi;
