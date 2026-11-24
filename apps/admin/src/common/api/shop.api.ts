import { baseApi, type PaginatedResponse } from "../config/baseApi";
import type { Shop } from "../types/shop.type";

type PageQuery = { page?: number; limit?: number };

export const shopApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["Shop"],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getAllShops: builder.query<PaginatedResponse<Shop>, PageQuery | void>({
        query: (params) => ({
          url: `/shops/`,
          method: "GET",
          params: params || undefined,
        }),
        providesTags: ["Shop"],
      }),
      getShopById: builder.query<Shop, { id: string }>({
        query: ({ id }) => ({
          url: `/shops/${id}`,
          method: "GET",
        }),
        providesTags: ["Shop"],
      }),
      createShop: builder.mutation<
        Shop,
        Partial<Shop> & { user_id?: number }
      >({
        query: (body) => ({
          url: `/shops/`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["Shop"],
      }),
      updateShop: builder.mutation<
        Shop,
        { id: string; body: Partial<Shop> & { user_id?: number } }
      >({
        query: ({ id, body }) => ({
          url: `/shops/${id}`,
          method: "PATCH",
          data: body,
        }),
        invalidatesTags: ["Shop"],
      }),
      deleteShop: builder.mutation<{ affected?: number }, string | number>({
        query: (id) => ({
          url: `/shops/${id}`,
          method: "DELETE",
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
  useDeleteShopMutation,
} = shopApi;
