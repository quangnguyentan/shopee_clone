import { baseApi, type PaginatedResponse } from "../config/baseApi";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled"
  | "refund_pending"
  | "refunded";

export interface OrderSummary {
  id: string | number;
  order_id?: string | number;
  order_no: string;
  shop_order_no?: string;
  buyer?: { id: string | number; name: string; email: string; phone?: string };
  items: Array<{
    id: string | number;
    product_name: string;
    sku: string;
    price: string | number;
    quantity: number;
  }>;
  total_amount: string | number;
  status: OrderStatus;
  created_at: string;
}

export const orderApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["Order"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getOrders: builder.query<
        PaginatedResponse<OrderSummary>,
        { page: number; limit: number }
      >({
        query: (params) => ({
          url: "/order",
          method: "GET",
          params,
        }),
        providesTags: ["Order"],
      }),
      updateSellerOrderStatus: builder.mutation<
        OrderSummary,
        { id: string | number; status: OrderStatus }
      >({
        query: ({ id, status }) => ({
          url: `/order/seller/shop-orders/${id}/status`,
          method: "PATCH",
          data: { status },
        }),
        invalidatesTags: ["Order"],
      }),
      updateAdminOrderStatus: builder.mutation<
        OrderSummary,
        { id: string | number; status: OrderStatus }
      >({
        query: ({ id, status }) => ({
          url: `/order/${id}`,
          method: "PATCH",
          data: { status },
        }),
        invalidatesTags: ["Order"],
      }),
    }),
  });

export const {
  useGetOrdersQuery,
  useUpdateSellerOrderStatusMutation,
  useUpdateAdminOrderStatusMutation,
} = orderApi;
