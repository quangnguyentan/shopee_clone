import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { api } from "./api";

type AxiosBaseQueryArgs = {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: A;
  params?: A;
};

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, unknown> =>
  async ({ url, method, data, params }) => {
    try {
      const result = await api.request({ url, method, data, params });
      return { data: result.data };
    } catch (axiosError: A) {
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        },
      };
    }
  };

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  endpoints: () => ({}),
  tagTypes: [],
});

export type StaffGeneratedApi = typeof baseApi;
