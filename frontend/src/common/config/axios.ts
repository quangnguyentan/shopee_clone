/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { store } from "../storage";
import { logout } from "@/src/common/storage/auth.slice";
import { AUTH_EXCLUDE_PATHS } from "../constants";
import { getEnv } from "./env.client";

export function createApi() {
  const env = getEnv();
  const BASE_URL = env.NEXT_PUBLIC_API_URL;
  /**
   * Axios instance
   * - withCredentials: gửi HttpOnly cookie (accessToken, refreshToken)
   */
  const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
  });

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
      const originalRequest = error.config;
      if (!originalRequest) return Promise.reject(error);
      const isAuthExcluded = AUTH_EXCLUDE_PATHS.some((path) =>
        originalRequest?.url?.includes(path)
      );
      const status = error.response?.status;
      const data = error.response?.data;
      if (
        (status === 401 && data?.code === "AUTH.INVALID_REFRESH_TOKEN") ||
        (status === 401 && originalRequest.url?.includes("/auth/refresh"))
      ) {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !isAuthExcluded
      ) {
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
          store.dispatch(logout());
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
  return api;
}

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
    const api = createApi();
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
