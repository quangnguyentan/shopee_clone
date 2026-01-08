/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // phải client
import { baseApi } from "@/src/common/config/baseApi";
import { logout } from "../storage/auth.slice";
import { clearMe } from "../storage/user.slice";

export const authApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["Auth"],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      register: builder.mutation<any, { email: string; password: string }>({
        query: (body) => {
          console.log(body);
          return {
            url: "auth/register",
            method: "POST",
            data: body,
          };
        },
      }),
      login: builder.mutation<any, { identifier: string; password: string }>({
        query: (body) => {
          return {
            url: "auth/login",
            method: "POST",
            data: body,
          };
        },
      }),
      setup2FA: builder.mutation<any, { userId: number }>({
        query: (body) => ({
          url: "auth/2fa/setup",
          method: "POST",
          data: body,
        }),
      }),
      verify2FA: builder.mutation<any, { userId: number; token: string }>({
        query: (body) => ({
          url: "auth/2fa/verify",
          method: "POST",
          data: body,
        }),
      }),
      logout: builder.mutation<any, void>({
        query: () => ({ url: "auth/logout", method: "POST" }),
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
          } catch (err: any) {
            const status = err?.error?.status || err?.response?.status;
            const code = err?.error?.data?.code || err?.response?.data?.code;

            if (
              status === 401 &&
              (code === "AUTH.INVALID_REFRESH_TOKEN" ||
                code === "AUTH.SESSION_REVOKED")
            ) {
              console.warn("Session invalid, force logout locally");
            } else {
              console.warn("Logout failed, user may retry", err);
              return;
            }
          }

          dispatch(clearMe());
          dispatch(logout());
          dispatch(authApi.util.resetApiState());
        },
      }),
      refresh: builder.mutation<any, void>({
        query: () => ({ url: "auth/refresh", method: "POST" }),
      }),
    }),
  });
export const {
  useRegisterMutation,
  useLoginMutation,
  useSetup2FAMutation,
  useVerify2FAMutation,
  useLogoutMutation,
  useRefreshMutation,
} = authApi;
