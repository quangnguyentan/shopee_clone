import { baseApi, type PaginatedResponse } from "../config/baseApi";

export type VoucherScope = "platform" | "shop" | "shipping";
export type VoucherDiscountType = "percent" | "fixed";

export interface Voucher {
  id: string;
  code: string;
  scope: VoucherScope;
  shop_id: string | null;
  shop?: { id: string; name: string } | null;
  discount_type: VoucherDiscountType;
  discount_value: string;
  starts_at: string | null;
  expired_at: string;
  min_order_amount: string;
  max_discount: string | null;
  usage_limit: number | null;
  per_user_limit: number | null;
  usage_count: number;
}

export interface VoucherInput {
  code: string;
  scope: VoucherScope;
  shop_id?: string;
  discount_type: VoucherDiscountType;
  discount_value: number;
  starts_at?: string;
  expired_at: string;
  min_order_amount?: number;
  max_discount?: number | null;
  usage_limit?: number | null;
  per_user_limit?: number | null;
}

export const voucherApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["Voucher"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getVouchers: builder.query<
        PaginatedResponse<Voucher>,
        { page: number; limit: number }
      >({
        query: (params) => ({ url: "/voucher", method: "GET", params }),
        providesTags: ["Voucher"],
      }),
      createVoucher: builder.mutation<Voucher, VoucherInput>({
        query: (data) => ({ url: "/voucher", method: "POST", data }),
        invalidatesTags: ["Voucher"],
      }),
      updateVoucher: builder.mutation<
        Voucher,
        { id: string; data: Partial<VoucherInput> }
      >({
        query: ({ id, data }) => ({
          url: `/voucher/${id}`,
          method: "PATCH",
          data,
        }),
        invalidatesTags: ["Voucher"],
      }),
      deleteVoucher: builder.mutation<{ success: boolean; id: string }, string>(
        {
          query: (id) => ({ url: `/voucher/${id}`, method: "DELETE" }),
          invalidatesTags: ["Voucher"],
        },
      ),
    }),
  });

export const {
  useGetVouchersQuery,
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
} = voucherApi;
