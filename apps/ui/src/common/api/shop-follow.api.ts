import { baseApi } from "../config/baseApi";

export interface ShopFollowStatus {
  is_following: boolean;
  follower_count: number;
}

export const shopFollowApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["ShopFollow"] })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getShopFollowerCount: builder.query<{ follower_count: number }, string>({
        query: (shopId) => ({
          url: `/shop-follow/${shopId}/count`,
          method: "GET",
        }),
        providesTags: (_result, _error, shopId) => [
          { type: "ShopFollow", id: shopId },
        ],
      }),
      getShopFollowStatus: builder.query<ShopFollowStatus, string>({
        query: (shopId) => ({
          url: `/shop-follow/${shopId}/status`,
          method: "GET",
        }),
        providesTags: (_result, _error, shopId) => [
          { type: "ShopFollow", id: shopId },
        ],
      }),
      followShop: builder.mutation<ShopFollowStatus, string>({
        query: (shopId) => ({
          url: `/shop-follow/${shopId}`,
          method: "POST",
        }),
        invalidatesTags: (_result, _error, shopId) => [
          { type: "ShopFollow", id: shopId },
        ],
      }),
      unfollowShop: builder.mutation<ShopFollowStatus, string>({
        query: (shopId) => ({
          url: `/shop-follow/${shopId}`,
          method: "DELETE",
        }),
        invalidatesTags: (_result, _error, shopId) => [
          { type: "ShopFollow", id: shopId },
        ],
      }),
    }),
  });

export const {
  useGetShopFollowerCountQuery,
  useGetShopFollowStatusQuery,
  useFollowShopMutation,
  useUnfollowShopMutation,
} = shopFollowApi;
