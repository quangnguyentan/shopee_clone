import { baseApi } from "../config/baseApi";
import type { Product } from "../types/product.type";
import type { ProductVariant } from "../types/product-variant.type";

export interface AddCartItemRequest {
  variant_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  id: string | number;
  quantity: number;
}

export interface AddCartItemResponse {
  id: string | number;
}

export interface CartItemView {
  id: string | number;
  quantity: number;
  product_variant: ProductVariant & { product: Product };
}

export interface CartView {
  id: string | number;
  items: CartItemView[];
}

export const cartApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["Cart"] })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getMyCart: builder.query<CartView | null, void>({
        query: () => ({ url: "/carts", method: "GET" }),
        providesTags: [{ type: "Cart", id: "ME" }],
      }),
      addCartItem: builder.mutation<AddCartItemResponse, AddCartItemRequest>({
        query: (body) => ({
          url: "/carts/items",
          method: "POST",
          data: body,
        }),
        invalidatesTags: [{ type: "Cart", id: "ME" }],
      }),
      removeCartItem: builder.mutation<{ success: boolean }, string>({
        query: (id) => ({
          url: `/carts/items/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: [{ type: "Cart", id: "ME" }],
      }),
      updateCartItem: builder.mutation<unknown, UpdateCartItemRequest>({
        query: ({ id, quantity }) => ({
          url: `/carts/items/${id}`,
          method: "PATCH",
          data: { quantity },
        }),
        async onQueryStarted({ id, quantity }, { dispatch, queryFulfilled }) {
          const optimisticUpdate = dispatch(
            cartApi.util.updateQueryData(
              "getMyCart",
              undefined,
              (draft) => {
                const item = draft?.items.find(
                  (entry) => String(entry.id) === String(id),
                );
                if (item) item.quantity = quantity;
              },
            ),
          );
          try {
            await queryFulfilled;
          } catch {
            optimisticUpdate.undo();
          }
        },
        invalidatesTags: (_result, error) =>
          error ? [{ type: "Cart", id: "ME" }] : [],
      }),
    }),
  });

export const {
  useGetMyCartQuery,
  useAddCartItemMutation,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} = cartApi;
