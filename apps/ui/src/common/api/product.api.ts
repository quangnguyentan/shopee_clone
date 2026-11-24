import { baseApi, type PaginatedResponse } from "../config/baseApi";
import type {
  CreateProductRequest,
  CreateProductWithVariantsRequest,
  FlashSaleProduct,
  Product,
  ProductBuyerListItem,
  ProductDetail,
  ProductSearchResult,
  SearchSuggestion,
  UpdateProductRequest,
} from "../types/product.type";

type ProductIdentity = { id: string };
type ProductListResult<T> = T[] | PaginatedResponse<T>;

const productTags = <T extends ProductIdentity>(
  result: ProductListResult<T> | undefined,
) => {
  const items = Array.isArray(result) ? result : (result?.items ?? []);
  return [
    { type: "Product" as const, id: "LIST" },
    ...items.map(({ id }) => ({ type: "Product" as const, id })),
  ];
};

export const productApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["Product"],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getBuyerProducts: builder.query<
        PaginatedResponse<ProductBuyerListItem>,
        {
          page?: number;
          limit?: number;
          categoryId?: number;
          minPrice?: number;
          maxPrice?: number;
          minRating?: number;
          mallOnly?: boolean;
          discountedOnly?: boolean;
          inStock?: boolean;
          sort?: "popular" | "latest" | "sales" | "price-asc" | "price-desc";
          attributeFilters?: Record<string, string[]>;
        } | void
      >({
        query: (params) => ({
          url: "/products/buyer",
          method: "GET",
          params: params
            ? {
                page: params.page,
                limit: params.limit,
                category_id: params.categoryId,
                min_price: params.minPrice,
                max_price: params.maxPrice,
                min_rating: params.minRating,
                mall_only: params.mallOnly,
                discounted_only: params.discountedOnly,
                in_stock: params.inStock,
                sort: params.sort,
                attribute_filters: params.attributeFilters
                  ? JSON.stringify(params.attributeFilters)
                  : undefined,
              }
            : undefined,
        }),
        providesTags: (result) => productTags(result),
      }),
      viewProductById: builder.query<ProductDetail | null, string>({
        query: (id) => ({
          url: `/products/buyer/${id}`,
          method: "GET",
        }),
        providesTags: (_result, _error, id) => [{ type: "Product", id }],
      }),
      getProductsByShop: builder.query<Product[], string>({
        query: (shopId) => ({
          url: `/products/shop/${shopId}`,
          method: "GET",
        }),
        providesTags: (result) => productTags(result),
      }),
      getAdminProducts: builder.query<PaginatedResponse<Product>, void>({
        query: () => ({
          url: "/products",
          method: "GET",
        }),
        providesTags: (result) => productTags(result),
      }),
      getAdminProductById: builder.query<Product | null, string>({
        query: (id) => ({
          url: `/products/${id}`,
          method: "GET",
        }),
        providesTags: (_result, _error, id) => [{ type: "Product", id }],
      }),
      createProduct: builder.mutation<Product, CreateProductRequest>({
        query: (body) => ({
          url: "/products/seller",
          method: "POST",
          data: body,
        }),
        invalidatesTags: [{ type: "Product", id: "LIST" }],
      }),
      updateProduct: builder.mutation<
        Product | null,
        { id: string; body: UpdateProductRequest }
      >({
        query: ({ id, body }) => ({
          url: `/products/seller/${id}`,
          method: "PATCH",
          data: body,
        }),
        invalidatesTags: (_result, _error, { id }) => [
          { type: "Product", id },
          { type: "Product", id: "LIST" },
        ],
      }),
      deleteProduct: builder.mutation<
        { affected?: number; raw?: unknown },
        string
      >({
        query: (id) => ({
          url: `/products/seller/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (_result, _error, id) => [
          { type: "Product", id },
          { type: "Product", id: "LIST" },
        ],
      }),
      createFullProduct: builder.mutation<
        Product,
        CreateProductWithVariantsRequest
      >({
        query: (body) => ({
          url: "/products/seller/full",
          method: "POST",
          data: body,
        }),
        invalidatesTags: [{ type: "Product", id: "LIST" }],
      }),
      updateFullProduct: builder.mutation<
        Product | null,
        { id: string; body: CreateProductWithVariantsRequest }
      >({
        query: ({ id, body }) => ({
          url: `/products/seller/${id}/full`,
          method: "PUT",
          data: body,
        }),
        invalidatesTags: (_result, _error, { id }) => [
          { type: "Product", id },
          { type: "Product", id: "LIST" },
        ],
      }),
      searchProducts: builder.query<
        PaginatedResponse<Product>,
        { q: string; page?: number; limit?: number }
      >({
        query: ({ q, page, limit }) => ({
          url: "/products/search",
          method: "GET",
          params: { q, page, limit },
        }),
        providesTags: (result) => productTags(result),
      }),
      getSearchSuggestions: builder.query<SearchSuggestion[], void>({
        query: () => ({
          url: "/products/search/suggest",
          method: "GET",
        }),
      }),
      getTopSearchProductsToday: builder.query<
        ProductSearchResult[],
        number | void
      >({
        query: (limit = 10) => ({
          url: "/products/top-search/today",
          method: "GET",
          params: { limit },
        }),
        providesTags: (result) => productTags(result),
      }),
      getTopSoldProducts: builder.query<Product[], void>({
        query: () => ({
          url: "/products/top/sold",
          method: "GET",
        }),
        providesTags: (result) => productTags(result),
      }),
      getTopViewProducts: builder.query<Product[], void>({
        query: () => ({
          url: "/products/top/view",
          method: "GET",
        }),
        providesTags: (result) => productTags(result),
      }),
      getSuggestToday: builder.query<Product[], void>({
        query: () => ({
          url: "/products/suggest/today",
          method: "GET",
        }),
        providesTags: (result) => productTags(result),
      }),
      getFlashSaleRanking: builder.query<FlashSaleProduct[], void>({
        query: () => ({
          url: "/products/flash-sale/ranking",
          method: "GET",
        }),
        providesTags: (result) => productTags(result),
      }),
    }),
  });

export const productBuyerApi = productApi;

export const {
  useGetBuyerProductsQuery,
  useViewProductByIdQuery,
  useGetProductsByShopQuery,
  useGetAdminProductsQuery,
  useGetAdminProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateFullProductMutation,
  useUpdateFullProductMutation,
  useSearchProductsQuery,
  useGetSearchSuggestionsQuery,
  useGetTopSearchProductsTodayQuery,
  useGetTopSoldProductsQuery,
  useGetTopViewProductsQuery,
  useGetSuggestTodayQuery,
  useGetFlashSaleRankingQuery,
} = productApi;
