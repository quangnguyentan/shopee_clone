import type {
  CreateProductDto,
  UpdateProductDto,
} from "@/pages/products/types";
import { baseApi, type PaginatedResponse } from "../config/baseApi";
import type { Product } from "../types/product.type";

export const productApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["Product"],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getAllProduct: builder.query<PaginatedResponse<Product>, void>({
        query: () => ({
          url: `/products/`,
          method: "GET",
        }),
        providesTags: ["Product"],
      }),
      getProductById: builder.query<Product, { id: A }>({
        query: ({ id }) => ({
          url: `/products/${id}`,
          method: "GET",
        }),
        providesTags: ["Product"],
      }),
      createProduct: builder.mutation<Product, CreateProductDto>({
        query: (body) => ({
          url: `/products/seller`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["Product"],
      }),
      updateProduct: builder.mutation<
        Product,
        { id: A; body: UpdateProductDto }
      >({
        query: ({ id, body }) => ({
          url: `/products/seller/${id}`,
          method: "PUT",
          data: body,
        }),
        invalidatesTags: ["Product"],
      }),
    }),
  });

export const {
  useGetAllProductQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
} = productApi;
