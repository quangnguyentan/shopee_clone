import { baseApi, type PaginatedResponse } from "../config/baseApi";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/category.type";

export const categoryApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["Category"],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getAllCategories: builder.query<PaginatedResponse<Category>, void>({
        query: () => ({
          url: "/categories",
          method: "GET",
        }),
        providesTags: (result) => [
          "Category",
          { type: "Category", id: "LIST" },
          ...(result?.items.map(({ id }) => ({ type: "Category" as const, id })) ??
            []),
        ],
      }),
      getCategoryTree: builder.query<Category[], void>({
        query: () => ({
          url: "/categories/tree",
          method: "GET",
        }),
        providesTags: ["Category", { type: "Category", id: "TREE" }],
      }),
      getCategoryChildren: builder.query<Category[], { id: string }>({
        query: ({ id }) => ({
          url: `/categories/${id}/children`,
          method: "GET",
        }),
        providesTags: (_result, _error, { id }) => [
          "Category",
          { type: "Category", id: `CHILDREN-${id}` },
        ],
      }),
      getCategoryById: builder.query<Category | null, { id: string }>({
        query: ({ id }) => ({
          url: `/categories/${id}`,
          method: "GET",
        }),
        providesTags: (_result, _error, { id }) => [
          "Category",
          { type: "Category", id },
        ],
      }),
      createCategory: builder.mutation<Category, CreateCategoryRequest>({
        query: (body) => ({
          url: "/categories",
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["Category"],
      }),
      updateCategory: builder.mutation<
        Category | null,
        { id: string; body: UpdateCategoryRequest }
      >({
        query: ({ id, body }) => ({
          url: `/categories/${id}`,
          method: "PATCH",
          data: body,
        }),
        invalidatesTags: (_result, _error, { id }) => [
          "Category",
          { type: "Category", id },
        ],
      }),
      deleteCategory: builder.mutation<
        { affected?: number; raw?: unknown },
        { id: string }
      >({
        query: ({ id }) => ({
          url: `/categories/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (_result, _error, { id }) => [
          "Category",
          { type: "Category", id },
        ],
      }),
    }),
  });

export const {
  useGetAllCategoriesQuery,
  useGetCategoryTreeQuery,
  useGetCategoryChildrenQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
