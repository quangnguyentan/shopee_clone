import { baseApi } from "../config/baseApi";
import type {
  AddFlashSaleItemDto,
  FlashSaleItem,
} from "../types/flash-sale-items.type";

import type {
  CreateFlashSaleDto,
  FlashSale,
  UpdateFlashSaleDto,
} from "../types/flash-sales.type";

export const flashSaleApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["FlashSale"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getFlashSales: builder.query<FlashSale[], void>({
        query: () => ({
          url: "/flash-sales",
          method: "GET",
        }),
        providesTags: ["FlashSale"],
      }),

      getFlashSaleById: builder.query<FlashSale, number>({
        query: (id) => ({
          url: `/flash-sales/${id}`,
          method: "GET",
        }),
        providesTags: (_r, _e, id) => [{ type: "FlashSale", id }],
      }),

      createFlashSale: builder.mutation<FlashSale, CreateFlashSaleDto>({
        query: (body) => ({
          url: "/flash-sales",
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["FlashSale"],
      }),

      updateFlashSale: builder.mutation<
        FlashSale,
        { id: number; body: UpdateFlashSaleDto }
      >({
        query: ({ id, body }) => ({
          url: `/flash-sales/${id}`,
          method: "PATCH",
          data: body,
        }),
        invalidatesTags: (_r, _e, { id }) => [{ type: "FlashSale", id }],
      }),

      deleteFlashSale: builder.mutation<void, number>({
        query: (id) => ({
          url: `/flash-sales/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["FlashSale"],
      }),

      addFlashSaleItem: builder.mutation<
        FlashSaleItem,
        { flashSaleId: number; body: AddFlashSaleItemDto }
      >({
        query: ({ flashSaleId, body }) => ({
          url: `/flash-sales/${flashSaleId}/items`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["FlashSale"],
      }),

      removeFlashSaleItem: builder.mutation<void, number>({
        query: (id) => ({
          url: `/flash-sales/items/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["FlashSale"],
      }),
    }),
  });

export const {
  useGetFlashSalesQuery,
  useGetFlashSaleByIdQuery,
  useCreateFlashSaleMutation,
  useUpdateFlashSaleMutation,
  useDeleteFlashSaleMutation,
  useAddFlashSaleItemMutation,
  useRemoveFlashSaleItemMutation,
} = flashSaleApi;
