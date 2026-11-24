import { baseApi, type PaginatedResponse } from "../config/baseApi";
import type { User } from "../types/user.type";

type UserPayload = Record<string, unknown>;

export const userApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["User"],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getMe: builder.query<User, void>({
        query: () => ({
          url: "/user/me",
          method: "GET",
        }),
        providesTags: (_result, _error) => [
          "User",
          { type: "User", id: "ME" },
        ],
      }),
      updateMyProfile: builder.mutation<
        User,
        Partial<
          Pick<User, "name" | "phone" | "avatar" | "gender" | "date_of_birth">
        >
      >({
        query: (data) => ({
          url: "/user/me",
          method: "PATCH",
          data,
        }),
        invalidatesTags: [{ type: "User", id: "ME" }],
      }),
      getAllUsers: builder.query<PaginatedResponse<User>, void>({
        query: () => ({
          url: "/user",
          method: "GET",
        }),
        providesTags: (result) => [
          { type: "User", id: "LIST" },
          ...(result?.items.map(({ id }) => ({ type: "User" as const, id })) ??
            []),
        ],
      }),
      getUserById: builder.query<User, string>({
        query: (id) => ({
          url: `/user/${id}`,
          method: "GET",
        }),
        providesTags: (_result, _error, id) => [{ type: "User", id }],
      }),
      createUser: builder.mutation<User, UserPayload>({
        query: (data) => ({
          url: "/user",
          method: "POST",
          data,
        }),
        invalidatesTags: [{ type: "User", id: "LIST" }],
      }),
      updateUser: builder.mutation<
        User | null,
        { id: string; body: UserPayload }
      >({
        query: ({ id, body }) => ({
          url: `/user/${id}`,
          method: "PATCH",
          data: body,
        }),
        invalidatesTags: (_result, _error, { id }) => [
          { type: "User", id },
          { type: "User", id: "ME" },
          { type: "User", id: "LIST" },
        ],
      }),
      deleteUser: builder.mutation<
        { affected?: number; raw?: unknown },
        string
      >({
        query: (id) => ({
          url: `/user/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (_result, _error, id) => [
          { type: "User", id },
          { type: "User", id: "LIST" },
        ],
      }),
    }),
  });

export const {
  useGetMeQuery,
  useUpdateMyProfileMutation,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
