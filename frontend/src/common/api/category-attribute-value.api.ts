import { baseApi, type PaginatedResponse } from "../config/baseApi";
import type { CategoryAttributeValue } from "../types/category-attribute-value.type";

export const categoryAttributeValueApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["CategoryAttributeValue"],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getAllCategoryAttributeValues: builder.query<
        PaginatedResponse<CategoryAttributeValue>,
        void
      >({
        query: () => ({
          url: `/category-attribute-values/`,
          method: "GET",
        }),
        providesTags: ["CategoryAttributeValue"],
      }),
      getCategoryAttributeValueById: builder.query<
        CategoryAttributeValue,
        { id: A }
      >({
        query: ({ id }) => ({
          url: `/category-attribute-values/${id}`,
          method: "GET",
        }),
        providesTags: ["CategoryAttributeValue"],
      }),
      getCategoryAttributeValueByAttributeId: builder.query<
        CategoryAttributeValue[],
        { attributeId: number }
      >({
        query: ({ attributeId }) => ({
          url: `/category-attribute-values/attribute/${attributeId}`,
          method: "GET",
        }),
        providesTags: ["CategoryAttributeValue"],
      }),
      createCategoryAttributeValue: builder.mutation<
        CategoryAttributeValue,
        Partial<CategoryAttributeValue>
      >({
        query: (body) => ({
          url: `/category-attribute-values/`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["CategoryAttributeValue"],
      }),
      updateCategoryAttributeValue: builder.mutation<
        CategoryAttributeValue,
        { id: A; body: Partial<CategoryAttributeValue> }
      >({
        query: ({ id, body }) => ({
          url: `/category-attribute-values/${id}`,
          method: "PUT",
          data: body,
        }),
        invalidatesTags: ["CategoryAttributeValue"],
      }),
    }),
  });

export const {
  useGetAllCategoryAttributeValuesQuery,
  useGetCategoryAttributeValueByIdQuery,
  useGetCategoryAttributeValueByAttributeIdQuery,
  useCreateCategoryAttributeValueMutation,
  useUpdateCategoryAttributeValueMutation,
} = categoryAttributeValueApi;
