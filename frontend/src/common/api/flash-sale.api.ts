import { baseApi } from "../config/baseApi";

export const flashSaleApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getActiveFlashSale: builder.query<A, void>({
      query: () => ({
        url: "/flash-sales/active/current",
        method: "GET",
      }),
    }),

    getFlashSaleItems: builder.query<A[], number>({
      query: (flashSaleId) => ({
        url: `/flash-sale-items/flash-sale/${flashSaleId}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetActiveFlashSaleQuery, useGetFlashSaleItemsQuery } =
  flashSaleApi;
