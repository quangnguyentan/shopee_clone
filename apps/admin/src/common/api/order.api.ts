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

export interface OrderItemSummary {
  id: string | number;
  product_name: string;
  sku: string;
  price: string | number;
  quantity: number;
}

export interface ShippingSummary {
  id: string | number;
  carrier: string | null;
  tracking_number: string | null;
  status: string;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface ShopOrderSummary {
  id: string | number;
  shop_order_no: string;
  shop_id: string | number;
  shop?: { id: string | number; name: string } | null;
  status: OrderStatus;
  shipping_status?: string;
  shippings?: ShippingSummary[];
  total_amount: string | number;
  items: OrderItemSummary[];
}

export interface OrderSummary {
  id: string | number;
  order_id?: string | number;
  order_no: string;
  shop_order_no?: string;
  buyer?: { id: string | number; name: string; email: string; phone?: string };
  shipping_address?: Record<string, unknown> | null;
  shop_orders?: ShopOrderSummary[];
  shippings?: ShippingSummary[];
  items: OrderItemSummary[];
  total_amount: string | number;
  status: OrderStatus;
  payment_status?: string;
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
        {
          id: string | number;
          status: OrderStatus;
          carrier?: string;
          tracking_number?: string;
        }
      >({
        query: ({ id, ...data }) => ({
          url: `/order/seller/shop-orders/${id}/status`,
          method: "PATCH",
          data,
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
