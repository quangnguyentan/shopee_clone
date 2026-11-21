import { baseApi, type PaginatedResponse } from "../config/baseApi";
import type { User } from "../types/user.type";

type UserQuery = {
  page?: number;
  limit?: number;
  role?: "buyer" | "seller" | "admin";
};

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
      getAllUsers: builder.query<PaginatedResponse<User>, UserQuery | void>({
        query: (params) => ({
          url: `/user`,
          method: "GET",
          params: params || undefined,
        }),
        providesTags: ["User"],
      }),
      getUserById: builder.query<User, string | number>({
        query: (id) => ({
          url: `/user/${id}`,
          method: "GET",
        }),
        providesTags: ["User"],
      }),
      createUser: builder.mutation<
        User,
        Partial<User> & { password?: string }
      >({
        query: (body) => ({
          url: `/user`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["User"],
      }),
      updateUser: builder.mutation<
        User,
        { id: string | number; body: Partial<User> }
      >({
        query: ({ id, body }) => ({
          url: `/user/${id}`,
          method: "PATCH",
          data: body,
        }),
        invalidatesTags: ["User"],
      }),
      deleteUser: builder.mutation<
        { success: boolean; id: string },
        string | number
      >({
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
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
