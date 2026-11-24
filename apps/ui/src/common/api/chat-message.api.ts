import { baseApi } from "../config/baseApi";

export interface ShopChatMessage {
  id: number;
  message: string;
  created_at: string;
  sender: {
    id: string;
    name: string;
  };
}

export const chatMessageApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["ShopChat"] })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getShopChatMessages: builder.query<ShopChatMessage[], string>({
        query: (shopId) => ({
          url: `/chat-message/shop/${shopId}`,
          method: "GET",
        }),
        providesTags: (_result, _error, shopId) => [
          { type: "ShopChat", id: shopId },
        ],
      }),
      sendShopChatMessage: builder.mutation<
        ShopChatMessage,
        { shopId: string; message: string }
      >({
        query: ({ shopId, message }) => ({
          url: `/chat-message/shop/${shopId}`,
          method: "POST",
          data: { message },
        }),
        invalidatesTags: (_result, _error, { shopId }) => [
          { type: "ShopChat", id: shopId },
        ],
      }),
    }),
  });

export const {
  useGetShopChatMessagesQuery,
  useSendShopChatMessageMutation,
} = chatMessageApi;
