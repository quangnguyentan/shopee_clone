/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../config/baseApi";
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
    }),
  });

export const { useGetMeQuery } = userApi;
