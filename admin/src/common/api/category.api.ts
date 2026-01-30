import { baseApi, type PaginatedResponse } from "../config/baseApi";
import type { Category } from "../types/category.type";

export const categoryApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["Category"],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getAllCategories: builder.query<PaginatedResponse<Category>, void>({
        query: () => ({
          url: `/categories/`,
          method: "GET",
        }),
        providesTags: ["Category"],
      }),
      getCategoryById: builder.query<Category, { id: A }>({
        query: ({ id }) => ({
          url: `/categories/${id}`,
          method: "GET",
        }),
        providesTags: ["Category"],
      }),
      createCategory: builder.mutation<Category, Partial<Category>>({
        query: (body) => ({
          url: `/categories/`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["Category"],
      }),
      updateCategory: builder.mutation<
        Category,
        { id: A; body: Partial<Category> }
      >({
        query: ({ id, body }) => ({
          url: `/categories/${id}`,
          method: "PUT",
          data: body,
        }),
        invalidatesTags: ["Category"],
      }),
    }),
  });

export const {
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} = categoryApi;
