/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { store } from "../storage";
import { logout } from "@/src/common/storage/auth.slice";
import { AUTH_EXCLUDE_PATHS } from "../constants";
import { getEnv } from "./env.client";
import { clearMe } from "../storage/user.slice";
import { socket } from "./socket";

/**
 * Axios instance
 * - withCredentials: gửi HttpOnly cookie (accessToken, refreshToken)
 */
const env = getEnv();
export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

/**
 * Refresh queue
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(true);
  });
  failedQueue = [];
};

/**
 * Response interceptor
 * - 401 → gọi /auth/refresh
 * - refresh OK → retry request cũ
 * - refresh FAIL → logout
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    try {
      const originalRequest = error.config;
      if (!originalRequest) return Promise.reject(error);
      const state = store.getState();
      if (state.auth.loggedOut) return Promise.reject(error);
      const status = error.response?.status;
      const data = error.response?.data;
      const isAuthExcluded = AUTH_EXCLUDE_PATHS.some((path) =>
        originalRequest?.url?.includes(path)
      );

      if (
        status === 401 &&
        (data?.code === "AUTH.SESSION_REVOKED" ||
          data?.code === "AUTH.INVALID_REFRESH_TOKEN")
      ) {
        store.dispatch(clearMe());
        store.dispatch(logout());
        if (socket.connected) socket.disconnect();
        return Promise.reject(error);
      }

      if (status === 401 && !originalRequest._retry && !isAuthExcluded) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => api(originalRequest));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await api.post("/auth/refresh");

          processQueue();
          return api(originalRequest);
        } catch (err) {
          processQueue(err);
          store.dispatch(clearMe());
          store.dispatch(logout());
          socket.disconnect();
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

/**
 * RTK Query baseQuery dùng Axios
 */
type AxiosBaseQueryArgs = {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: any;
  params?: any;
};

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, unknown> =>
  async ({ url, method, data, params }) => {
    try {
      const result = await api.request({ url, method, data, params });
      return { data: result.data };
    } catch (axiosError: any) {
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        },
      };
    }
  };
