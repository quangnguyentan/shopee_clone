import { baseApi, type PaginatedResponse } from "../config/baseApi";
import type { Product } from "../types/product.type";

export const productBuyerApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["Product"],
  })
  .injectEndpoints({
    overrideExisting: false,
    endpoints: (builder) => ({
      /** Danh sách product cho buyer */
      getBuyerProducts: builder.query<
        PaginatedResponse<Product>,
        { page?: number; limit?: number }
      >({
        query: ({ page = 1, limit = 20 } = {}) => ({
          url: "/products/buyer",
          method: "GET",
          params: { page, limit },
        }),
        providesTags: ["Product"],
      }),

      /** Xem chi tiết product */
      viewProductById: builder.query<Product, number>({
        query: (id) => ({
          url: `/products/buyer/${id}`,
          method: "GET",
        }),
        providesTags: (_res, _err, id) => [{ type: "Product", id }],
      }),

      /** Search product (có log keyword ở backend) */
      searchProducts: builder.query<
        PaginatedResponse<Product>,
        { q: string; page?: number; limit?: number }
      >({
        query: ({ q, page = 1, limit = 10 }) => ({
          url: "/products/search",
          method: "GET",
          params: { q, page, limit },
        }),
      }),

      /** 🔥 Top product được search nhiều nhất hôm nay */
      getTopSearchProductsToday: builder.query<Product[], number | void>({
        query: (limit = 10) => ({
          url: "/products/top-search/today",
          method: "GET",
          params: { limit },
        }),
      }),

      /** Top bán chạy */
      getTopSoldProducts: builder.query<Product[], void>({
        query: () => ({
          url: "/products/top/sold",
          method: "GET",
        }),
      }),

      /** Top view */
      getTopViewProducts: builder.query<Product[], void>({
        query: () => ({
          url: "/products/top/view",
          method: "GET",
        }),
      }),

      /** Gợi ý hôm nay */
      getSuggestToday: builder.query<Product[], void>({
        query: () => ({
          url: "/products/suggest/today",
          method: "GET",
        }),
      }),

      /** Flash sale ranking */
      getFlashSaleRanking: builder.query<Product[], void>({
        query: () => ({
          url: "/products/flash-sale/ranking",
          method: "GET",
        }),
      }),

      /** Product theo shop */
      getProductsByShop: builder.query<Product[], number>({
        query: (shopId) => ({
          url: `/products/shop/${shopId}`,
          method: "GET",
        }),
      }),
    }),
  });

export const {
  useGetBuyerProductsQuery,
  useViewProductByIdQuery,
  useSearchProductsQuery,
  useGetTopSearchProductsTodayQuery,
  useGetTopSoldProductsQuery,
  useGetTopViewProductsQuery,
  useGetSuggestTodayQuery,
  useGetFlashSaleRankingQuery,
  useGetProductsByShopQuery,
} = productBuyerApi;
