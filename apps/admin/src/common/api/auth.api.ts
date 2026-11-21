import { baseApi } from "@/common/config/baseApi";
import { logout } from "../storage/auth.slice";
import { clearMe } from "../storage/user.slice";
import { getAuthScope } from "../constants";
export const authApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["Auth"],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      register: builder.mutation<A, { email: string; password: string }>({
        query: (body) => {
          return {
            url: "auth/register",
            method: "POST",
            data: body,
          };
        },
      }),
      login: builder.mutation<A, { identifier: string; password: string }>({
        query: (body) => {
          return {
            url: `auth/${getAuthScope()}/login`,
            method: "POST",
            data: body,
          };
        },
      }),
      logout: builder.mutation<A, void>({
        query: () => ({ url: `auth/logout`, method: "POST" }),
        async onQueryStarted(_, { dispatch }) {
          dispatch(clearMe());
          dispatch(logout());
          dispatch(authApi.util.resetApiState());
        },
      }),
      logoutAll: builder.mutation<A, void>({
        query: () => ({ url: `auth/logout-all`, method: "POST" }),
        async onQueryStarted(_, { dispatch }) {
          dispatch(clearMe());
          dispatch(logout());
          dispatch(authApi.util.resetApiState());
        },
      }),
      refresh: builder.mutation<A, void>({
        query: () => ({
          url: `auth/${getAuthScope()}/refresh`,
          method: "POST",
        }),
      }),
    }),
  });
export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useLogoutAllMutation,
  useRefreshMutation,
} = authApi;
