import { baseApi, type PaginatedResponse } from "../config/baseApi";
import type { Shop } from "../types/shop.type";

export const shopApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["Shop"],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getAllShops: builder.query<PaginatedResponse<Shop>, void>({
        query: () => ({
          url: `/shops/`,
          method: "GET",
        }),
        providesTags: ["Shop"],
      }),
      getShopById: builder.query<Shop, { id: A }>({
        query: ({ id }) => ({
          url: `/shops/${id}`,
          method: "GET",
        }),
        providesTags: ["Shop"],
      }),
      createShop: builder.mutation<Shop, Partial<Shop>>({
        query: (body) => ({
          url: `/shops/`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["Shop"],
      }),
      updateShop: builder.mutation<Shop, { id: A; body: Partial<Shop> }>({
        query: ({ id, body }) => ({
          url: `/shops/${id}`,
          method: "PUT",
          data: body,
        }),
        invalidatesTags: ["Shop"],
      }),
    }),
  });

export const {
  useGetAllShopsQuery,
  useGetShopByIdQuery,
  useCreateShopMutation,
  useUpdateShopMutation,
} = shopApi;
