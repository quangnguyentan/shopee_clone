import { baseApi, type PaginatedResponse } from "../config/baseApi";
import type { VariantOption } from "../types/variant-option.type";

export const variantOptionApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["VariantOption"],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getAllVariantOptions: builder.query<
        PaginatedResponse<VariantOption>,
        void
      >({
        query: () => ({
          url: `/variant-options/`,
          method: "GET",
        }),
        providesTags: ["VariantOption"],
      }),
      getVariantOptionById: builder.query<VariantOption, { id: A }>({
        query: ({ id }) => ({
          url: `/variant-options/${id}`,
          method: "GET",
        }),
        providesTags: ["VariantOption"],
      }),
      createVariantOption: builder.mutation<VariantOption, FormData>({
        query: (body) => ({
          url: `/variant-options/`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["VariantOption"],
      }),
      updateVariantOption: builder.mutation<
        VariantOption,
        { id: A; body: FormData }
      >({
        query: ({ id, body }) => ({
          url: `/variant-options/${id}`,
          method: "PUT",
          data: body,
        }),
        invalidatesTags: ["VariantOption"],
      }),
    }),
  });

export const {
  useGetAllVariantOptionsQuery,
  useGetVariantOptionByIdQuery,
  useCreateVariantOptionMutation,
  useUpdateVariantOptionMutation,
} = variantOptionApi;
