"use client";

import { baseApi } from "@/src/common/config/baseApi";
import { AUTH_SCOPE } from "../constants";
import { logout } from "../storage/auth.slice";
import { clearMe } from "../storage/user.slice";
import type {
  AuthResult,
  AuthScope,
  AuthSessionResponse,
  CreateAdminRequest,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  QRLoginResponse,
  QRLoginStatus,
  RegisterRequest,
  RegisterResponse,
  RequestPasswordChangeResponse,
  ResendVerificationResponse,
  Setup2FAResponse,
  Verify2FAActionRequest,
  VerifyEmailRequest,
} from "../types/auth.type";

const DEFAULT_SCOPE: AuthScope = AUTH_SCOPE;

export const authApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["Auth", "User"],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      register: builder.mutation<RegisterResponse, RegisterRequest>({
        query: (body) => ({
          url: "auth/register",
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["Auth"],
      }),
      login: builder.mutation<LoginResponse, LoginRequest>({
        query: ({ scope = DEFAULT_SCOPE, ...body }) => ({
          url: `auth/${scope}/login`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: (result) =>
          result && "authenticated" in result
            ? ["Auth", { type: "User", id: "ME" }]
            : ["Auth"],
      }),
      refresh: builder.mutation<
        AuthSessionResponse,
        { scope?: AuthScope } | void
      >({
        query: (arg) => ({
          url: `auth/${arg?.scope ?? DEFAULT_SCOPE}/refresh`,
          method: "POST",
        }),
        invalidatesTags: [{ type: "User", id: "ME" }],
      }),
      logout: builder.mutation<AuthResult, void>({
        query: () => ({ url: "auth/logout", method: "POST" }),
        invalidatesTags: ["Auth", { type: "User", id: "ME" }],
        async onQueryStarted(_, { dispatch }) {
          dispatch(clearMe());
          dispatch(logout());
          dispatch(authApi.util.resetApiState());
        },
      }),
      logoutAll: builder.mutation<AuthResult, void>({
        query: () => ({ url: "auth/logout-all", method: "POST" }),
        invalidatesTags: ["Auth", { type: "User", id: "ME" }],
        async onQueryStarted(_, { dispatch }) {
          dispatch(clearMe());
          dispatch(logout());
          dispatch(authApi.util.resetApiState());
        },
      }),
      getQRCode: builder.query<QRLoginResponse, void>({
        query: () => ({ url: "auth/qr", method: "GET" }),
        providesTags: ["Auth"],
      }),
      verifyQRCode: builder.mutation<AuthResult, { sessionId: string }>({
        query: (body) => ({
          url: "auth/qr/verify",
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["Auth"],
      }),
      getQRLoginStatus: builder.query<QRLoginStatus, { sessionId: string }>({
        query: ({ sessionId }) => ({
          url: `auth/qr/status/${sessionId}`,
          method: "GET",
        }),
      }),
      resendVerifyEmail: builder.mutation<
        ResendVerificationResponse,
        { email: string }
      >({
        query: (body) => ({
          url: "auth/resend-verify-email",
          method: "POST",
          data: body,
        }),
      }),
      verifyEmailOtp: builder.mutation<MessageResponse, VerifyEmailRequest>({
        query: (body) => ({
          url: "auth/verify-email-otp",
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["Auth"],
      }),
      setup2FA: builder.mutation<Setup2FAResponse, { userId: string }>({
        query: (body) => ({
          url: "auth/2fa/setup",
          method: "POST",
          data: body,
        }),
      }),
      verify2FA: builder.mutation<
        AuthSessionResponse,
        { userId: string; token: string; scope?: AuthScope }
      >({
        query: ({ scope = DEFAULT_SCOPE, ...body }) => ({
          url: `auth/${scope}/2fa/verify`,
          method: "POST",
          data: body,
        }),
        invalidatesTags: ["Auth", { type: "User", id: "ME" }],
      }),
      requestChangePassword: builder.mutation<
        RequestPasswordChangeResponse,
        void
      >({
        query: () => ({
          url: "auth/change-password/request",
          method: "POST",
        }),
      }),
      verify2FAForAction: builder.mutation<
        { actionToken: string },
        Verify2FAActionRequest
      >({
        query: (body) => ({
          url: "auth/2fa/verify-action",
          method: "POST",
          data: body,
        }),
      }),
      changePassword: builder.mutation<
        MessageResponse,
        { actionToken: string; newPassword: string }
      >({
        query: (body) => ({
          url: "auth/change-password",
          method: "POST",
          data: body,
        }),
      }),
      createAdmin: builder.mutation<MessageResponse, CreateAdminRequest>({
        query: (body) => ({
          url: "auth/admins",
          method: "POST",
          data: body,
        }),
        invalidatesTags: [{ type: "User", id: "LIST" }],
      }),
      approveAdmin: builder.mutation<MessageResponse, { id: string }>({
        query: ({ id }) => ({
          url: `auth/admins/${id}/approve`,
          method: "POST",
        }),
        invalidatesTags: (_result, _error, { id }) => [
          { type: "User", id },
          { type: "User", id: "LIST" },
        ],
      }),
      suspendAdmin: builder.mutation<MessageResponse, { id: string }>({
        query: ({ id }) => ({
          url: `auth/admins/${id}/suspend`,
          method: "POST",
        }),
        invalidatesTags: (_result, _error, { id }) => [
          { type: "User", id },
          { type: "User", id: "LIST" },
        ],
      }),
    }),
  });

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useLogoutAllMutation,
  useGetQRCodeQuery,
  useVerifyQRCodeMutation,
  useGetQRLoginStatusQuery,
  useResendVerifyEmailMutation,
  useVerifyEmailOtpMutation,
  useSetup2FAMutation,
  useVerify2FAMutation,
  useRequestChangePasswordMutation,
  useVerify2FAForActionMutation,
  useChangePasswordMutation,
  useCreateAdminMutation,
  useApproveAdminMutation,
  useSuspendAdminMutation,
} = authApi;
