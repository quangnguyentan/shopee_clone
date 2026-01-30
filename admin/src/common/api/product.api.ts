import type {
  CreateProductDto,
  ProductFullWithVariantDto,
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
        providesTags: (_res, _err, { id }) => [{ type: "Product", id }],
      }),
      createProduct: builder.mutation<Product, CreateProductDto>({
        query: (body) => ({
          url: `/products/seller`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["Product"],
      }),
      createFullProduct: builder.mutation<Product, ProductFullWithVariantDto>({
        query: (body) => ({
          url: `/products/seller/full`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["Product"],
      }),
      updateFullProduct: builder.mutation<
        Product,
        { id: number; body: ProductFullWithVariantDto }
      >({
        query: ({ id, body }) => ({
          url: `/products/seller/${id}/full`,
          method: "PUT",
          data: body,
        }),
        invalidatesTags: (_res, _err, { id }) => [{ type: "Product", id }],
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
  useCreateFullProductMutation,
  useUpdateProductMutation,
  useUpdateFullProductMutation,
} = productApi;
