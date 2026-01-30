import { baseApi, type PaginatedResponse } from "../config/baseApi";
import type { User } from "../types/user.type";

export const userApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["User"],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getMe: builder.query<User, void>({
        query: () => ({
          url: `/user/me`,
          method: "GET",
        }),
        providesTags: ["User"],
      }),
      getAllUsers: builder.query<PaginatedResponse<User>, void>({
        query: () => ({
          url: `/user`,
          method: "GET",
        }),
        providesTags: ["User"],
      }),
      createUser: builder.mutation<User, Partial<User>>({
        query: (body) => ({
          url: `/user`,
          method: "POST",
          body,
        }),
        invalidatesTags: ["User"],
      }),
      updateUser: builder.mutation<User, { id: number; body: Partial<User> }>({
        query: ({ id, body }) => ({
          url: `/user/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: ["User"],
      }),
      deleteUser: builder.mutation<{ success: boolean; id: number }, number>({
        query: (id) => ({
          url: `/user/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["User"],
      }),
    }),
  });

export const {
  useGetMeQuery,
  useGetAllUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
