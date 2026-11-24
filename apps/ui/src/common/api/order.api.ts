import { baseApi, type PaginatedResponse } from "../config/baseApi";
import type { CheckoutPayment } from "./checkout.api";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled"
  | "refund_pending"
  | "refunded";

export type OrderPaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export interface BuyerOrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  sku: string;
  variant_label: string | null;
  image_url: string | null;
  price: string;
  quantity: number;
}

export interface BuyerOrder {
  id: string;
  order_no: string;
  total_amount: string;
  currency: string;
  status: OrderStatus;
  payment_status: OrderPaymentStatus;
  created_at: string;
  shop_orders: Array<{
    id: string;
    shop_order_no: string;
    shop_id: string;
    shop_name: string;
    total_amount: string;
    status: OrderStatus;
    items: BuyerOrderItem[];
  }>;
}

export const orderApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["Order"] })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getMyOrders: builder.query<
        PaginatedResponse<BuyerOrder>,
        { page: number; limit: number; status?: OrderStatus }
      >({
        query: ({ page, limit, status }) => ({
          url: "/order/mine",
          method: "GET",
          params: { page, limit, status },
        }),
        providesTags: ["Order"],
      }),
      retryOrderPayment: builder.mutation<CheckoutPayment, string>({
        query: (orderId) => ({
          url: `/payment/orders/${orderId}/retry`,
          method: "POST",
        }),
        invalidatesTags: ["Order"],
      }),
    }),
  });

export const {
  useGetMyOrdersQuery,
  useRetryOrderPaymentMutation,
} = orderApi;
