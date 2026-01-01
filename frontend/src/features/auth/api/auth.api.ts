/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // phải client
import { setAccessToken } from "@/src/common/config/axios";
import { baseApi } from "@/src/common/config/baseApi";

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
        async onQueryStarted(arg, { queryFulfilled }) {
          try {
            const { data } = await queryFulfilled;
            if (data.accessToken) {
              setAccessToken(data.accessToken);
            }
          } catch (error) {
            console.log(error);
          }
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
        async onQueryStarted(arg, { queryFulfilled }) {
          try {
            const { data } = await queryFulfilled;
            setAccessToken(data.accessToken); // lưu accessToken sau 2FA
          } catch (error) {
            console.log(error);
          }
        },
      }),
      logout: builder.mutation({
        query: () => {
          return {
            url: "auth/logout",
            method: "POST",
          };
        },
      }),
    }),
  });
export const {
  useRegisterMutation,
  useLoginMutation,
  useSetup2FAMutation,
  useVerify2FAMutation,
  useLogoutMutation,
} = authApi;
