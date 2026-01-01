/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { store } from "../storage";
import { logout } from "@/src/features/auth/store/auth.slice";
import { AUTH_EXCLUDE_PATHS } from "../constants";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

let accessToken: string | null = null; // lưu accessToken tạm thời trong memory
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // để gửi HttpOnly cookie
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    // config.headers có thể là AxiosHeaders hoặc undefined
    if (config.headers) {
      // nếu headers là AxiosHeaders (mới)
      if ("set" in config.headers) {
        config.headers.set("Authorization", `Bearer ${accessToken}`);
      } else {
        // fallback kiểu cũ
        (config.headers as any)["Authorization"] = `Bearer ${accessToken}`;
      }
    }
  }
  return config;
});

// Response interceptor: auto refresh khi 401
let isRefreshing = false;
let failedQueue: Array<any> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthExcluded = AUTH_EXCLUDE_PATHS.some((path) =>
      originalRequest.url?.includes(path)
    );
    if (
      error.response?.status === 401 &&
      originalRequest?.url?.includes("/auth/refresh")
    ) {
      setAccessToken(null);
      store.dispatch(logout());
      return Promise.reject(error);
    }
    if (
      error.response?.status === 401 &&
      accessToken &&
      !originalRequest._retry &&
      !isAuthExcluded
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          const response = await api.post("/auth/refresh");
          const newAccessToken = response.data.accessToken;
          setAccessToken(newAccessToken);
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          resolve(api(originalRequest));
        } catch (err) {
          processQueue(err, null);
          reject(err);
        } finally {
          isRefreshing = false;
        }
      });
    }

    return Promise.reject(error);
  }
);

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
      const result = await api({ url, method, data, params });
      return { data: result.data };
    } catch (axiosError: any) {
      if (axiosError?.isLogout) {
        return {
          error: {
            status: 401,
            data: { message: "Session expired" },
          },
        };
      }
      const err = axiosError;
      return {
        error: { status: err.response?.status, data: err.response?.data },
      };
    }
  };

export default api;
