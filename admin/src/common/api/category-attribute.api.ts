import { baseApi, type PaginatedResponse } from "../config/baseApi";
import type { CategoryAttribute } from "../types/category-attribute.type";

export const categoryAttributeApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["CategoryAttribute"],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getAllCategoryAttributes: builder.query<
        PaginatedResponse<CategoryAttribute>,
        void
      >({
        query: () => ({
          url: `/category-attributes/`,
          method: "GET",
        }),
        providesTags: ["CategoryAttribute"],
      }),
      getCategoryAttributeByCategory: builder.query<
        CategoryAttribute[],
        { categoryId: number }
      >({
        query: ({ categoryId }) => ({
          url: `/category-attributes/category/${categoryId}`,
          method: "GET",
        }),
        providesTags: ["CategoryAttribute"],
      }),
      getCategoryAttributeById: builder.query<CategoryAttribute, { id: A }>({
        query: ({ id }) => ({
          url: `/category-attributes/${id}`,
          method: "GET",
        }),
        providesTags: ["CategoryAttribute"],
      }),
      createCategoryAttribute: builder.mutation<
        CategoryAttribute,
        Partial<CategoryAttribute>
      >({
        query: (body) => ({
          url: `/category-attributes/`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["CategoryAttribute"],
      }),
      updateCategoryAttribute: builder.mutation<
        CategoryAttribute,
        { id: A; body: Partial<CategoryAttribute> }
      >({
        query: ({ id, body }) => ({
          url: `/category-attributes/${id}`,
          method: "PUT",
          data: body,
        }),
        invalidatesTags: ["CategoryAttribute"],
      }),
    }),
  });

export const {
  useGetAllCategoryAttributesQuery,
  useGetCategoryAttributeByCategoryQuery,
  useGetCategoryAttributeByIdQuery,
  useCreateCategoryAttributeMutation,
  useUpdateCategoryAttributeMutation,
} = categoryAttributeApi;
