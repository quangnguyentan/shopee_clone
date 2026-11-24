import { baseApi } from "../config/baseApi";

export interface VietnamProvince {
  code: number;
  name: string;
  division_type: string;
}

export interface VietnamWard {
  code: number;
  name: string;
  division_type: string;
  province_code: number;
}

export type CheckoutPaymentMethod =
  | "vnpay"
  | "momo"
  | "vietqr_manual"
  | "cod";

export interface CheckoutPaymentOption {
  id: CheckoutPaymentMethod;
  label: string;
  description: string;
  enabled: boolean;
}

export interface CheckoutRequest {
  shipping_address: {
    receiver_name: string;
    phone: string;
    province_code: number;
    province_name: string;
    ward_code: number;
    ward_name: string;
    address: string;
  };
  payment_method: CheckoutPaymentMethod;
  selected_item_ids?: string[];
}

export interface CheckoutPayment {
  method: CheckoutPaymentMethod;
  status: string;
  redirect_url?: string;
  qr_url?: string;
  bank_account?: {
    bank_id: string;
    account_number: string;
    account_name: string;
  };
  expires_at?: string;
  message?: string;
}

export interface CheckoutResult {
  order: {
    id: string;
    order_no: string;
    subtotal: string;
    shipping_fee: string;
    discount_amount: string;
    total_amount: string;
    currency: string;
    status: string;
  };
  payment: CheckoutPayment;
}

export const checkoutApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["Cart"] })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getVietnamProvinces: builder.query<VietnamProvince[], void>({
        query: () => ({ url: "/address/locations/provinces", method: "GET" }),
      }),
      getVietnamWards: builder.query<VietnamWard[], number>({
        query: (provinceCode) => ({
          url: `/address/locations/provinces/${provinceCode}/wards`,
          method: "GET",
        }),
      }),
      getCheckoutPaymentMethods: builder.query<CheckoutPaymentOption[], void>({
        query: () => ({ url: "/payment/methods", method: "GET" }),
      }),
      createCheckoutOrder: builder.mutation<CheckoutResult, CheckoutRequest>({
        query: (data) => ({ url: "/order", method: "POST", data }),
        invalidatesTags: [{ type: "Cart", id: "ME" }],
      }),
    }),
  });

export const {
  useGetVietnamProvincesQuery,
  useGetVietnamWardsQuery,
  useGetCheckoutPaymentMethodsQuery,
  useCreateCheckoutOrderMutation,
} = checkoutApi;
